using System;
using System.Collections.Generic;
using System.Text;

namespace Suttisak.Blazor.UserInterface.Interfaces;

public interface IComponentCancellationToken : IDisposable
{
    protected CancellationTokenSource? CancellationTokenSource { get; set; }

    protected CancellationToken CtxWhenComponentDetached => (CancellationTokenSource ??= new CancellationTokenSource()).Token;

    protected void Dispose(bool disposing)
    {
        if (disposing is false) return;
        CancellationTokenSource?.Cancel();
        CancellationTokenSource?.Dispose();
    }
    void IDisposable.Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}