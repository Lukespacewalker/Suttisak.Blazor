using Bunit;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.Extensions.DependencyInjection;
using Suttisak.Blazor.UserInterface.Components.Common;
using Suttisak.Blazor.UserInterface.Services;

namespace Suttisak.Blazor.UserInterface.Tests;

public class AppOverlayHostTests
{
    [Fact]
    public void Built_in_confirmation_renders_both_action_labels()
    {
        using var context = new BunitContext();
        context.Services.AddAppOverlays();

        var overlayModule = context.JSInterop.SetupModule(
            "./_content/Suttisak.Blazor.UserInterface/js/app-overlay.js");
        overlayModule.SetupVoid("showModal", _ => true).SetVoidResult();

        var host = context.Render<AppOverlayHost>();
        var service = context.Services.GetRequiredService<AppOverlayService>();

        host.InvokeAsync(() =>
        {
            _ = service.ShowConfirmationAsync(new AppConfirmationOptions
            {
                Title = "Discard changes?",
                Message = "The current edits will be lost.",
                ConfirmText = "Discard",
                CancelText = "Keep editing"
            });
        });

        host.WaitForAssertion(() =>
        {
            var buttons = host.FindAll(".app-dialog__footer .app-button");
            Assert.Equal(2, buttons.Count);
            Assert.Equal("Keep editing", buttons[0].TextContent.Trim());
            Assert.Equal("Discard", buttons[1].TextContent.Trim());
        });
    }

    [Fact]
    public void RendersDynamicDrawerBodyWithoutBlockingTheRenderCycle()
    {
        using var context = new BunitContext();
        context.Services.AddAppOverlays();

        var overlayModule = context.JSInterop.SetupModule(
            "./_content/Suttisak.Blazor.UserInterface/js/app-overlay.js");
        overlayModule.SetupVoid("showModal", _ => true).SetVoidResult();

        var host = context.Render<AppOverlayHost>();
        var service = context.Services.GetRequiredService<AppOverlayService>();

        host.InvokeAsync(() =>
        {
            _ = service.ShowDrawerAsync<TestOverlayBody, string>(
                new AppOverlayOptions
                {
                    Title = "Test drawer",
                    Dismissible = true,
                    PreventDismissOnOutsideClick = true
                },
                AppOverlayParameters.Create((nameof(TestOverlayBody.Text), "Drawer content")));
        });

        Assert.True(
            SpinWait.SpinUntil(
                () => host.FindAll("[data-testid='drawer-body']").Count > 0,
                TimeSpan.FromSeconds(1)),
            host.Markup);
        Assert.Equal("Drawer content", host.Find("[data-testid='drawer-body']").TextContent);
        var drawer = host.Find("dialog.app-drawer");
        Assert.Equal("true", drawer.GetAttribute("data-dismissible"));
        Assert.Equal("true", drawer.GetAttribute("data-prevent-outside-dismiss"));
        Assert.Single(host.FindAll(".app-drawer__close"));
    }

    [Fact]
    public async Task Drawer_cancel_completes_only_after_javascript_closes_the_element()
    {
        using var context = new BunitContext();
        var overlayModule = context.JSInterop.SetupModule(
            "./_content/Suttisak.Blazor.UserInterface/js/app-overlay.js");
        overlayModule.SetupVoid("showModal", _ => true).SetVoidResult();
        var closeInvocation = overlayModule.SetupVoid("close", _ => true);

        var drawer = context.Render<AppDrawer<string, string>>(parameters => parameters
            .Add(component => component.Title, "Test drawer")
            .Add(component => component.Body, _ => builder => builder.AddContent(0, "Drawer body")));
        Task<AppOverlayResult<string>>? resultTask = null;
        await drawer.InvokeAsync(() =>
        {
            resultTask = drawer.Instance.ShowAsync("input");
        });
        drawer.WaitForElement(".app-drawer__surface");

        Task? cancelTask = null;
        await drawer.InvokeAsync(() =>
        {
            cancelTask = drawer.Instance.CancelAsync();
        });

        Assert.NotNull(resultTask);
        Assert.False(resultTask.IsCompleted);
        Assert.NotEmpty(drawer.FindAll("dialog.app-drawer"));

        closeInvocation.SetVoidResult();
        await cancelTask!.WaitAsync(TimeSpan.FromSeconds(1), Xunit.TestContext.Current.CancellationToken);
        var result = await resultTask.WaitAsync(TimeSpan.FromSeconds(1), Xunit.TestContext.Current.CancellationToken);

        Assert.True(result.IsCancelled);
    }

    [Fact]
    public async Task Dialog_close_completes_only_after_javascript_closes_the_element()
    {
        using var context = new BunitContext();
        var overlayModule = context.JSInterop.SetupModule(
            "./_content/Suttisak.Blazor.UserInterface/js/app-overlay.js");
        overlayModule.SetupVoid("showModal", _ => true).SetVoidResult();
        var closeInvocation = overlayModule.SetupVoid("close", _ => true);

        var dialog = context.Render<AppDialog<string, string>>(parameters => parameters
            .Add(component => component.Title, "Test dialog")
            .Add(component => component.Body, _ => builder => builder.AddContent(0, "Dialog body")));
        Task<AppOverlayResult<string>>? resultTask = null;
        await dialog.InvokeAsync(() =>
        {
            resultTask = dialog.Instance.ShowAsync("input");
        });
        dialog.WaitForElement(".app-dialog__surface");

        Task? closeTask = null;
        await dialog.InvokeAsync(() =>
        {
            closeTask = dialog.Instance.CloseAsync("saved");
        });

        Assert.NotNull(resultTask);
        Assert.False(resultTask.IsCompleted);
        Assert.NotEmpty(dialog.FindAll("dialog.app-dialog"));

        closeInvocation.SetVoidResult();
        await closeTask!.WaitAsync(TimeSpan.FromSeconds(1), Xunit.TestContext.Current.CancellationToken);
        var result = await resultTask.WaitAsync(TimeSpan.FromSeconds(1), Xunit.TestContext.Current.CancellationToken);

        Assert.False(result.IsCancelled);
        Assert.Equal("saved", result.Value);
    }

    public sealed class TestOverlayBody : ComponentBase
    {
        [Parameter] public string Text { get; set; } = string.Empty;

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "p");
            builder.AddAttribute(1, "data-testid", "drawer-body");
            builder.AddContent(2, Text);
            builder.CloseElement();
        }
    }
}
