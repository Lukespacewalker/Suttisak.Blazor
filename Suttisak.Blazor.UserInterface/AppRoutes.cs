using System;
using System.Collections.Generic;
using System.Text;

namespace Suttisak.BlazorUI;

public class AppRoutes
{
    public class Account
    {
        public const string Root = "/Account";
        public const string Profile = $"{Root}/Manage";
        public const string Email = $"{Root}/Manage/Email";
        public const string Passkeys = $"{Root}/Manage/Passkeys";
        public const string SetPassword = $"{Root}/Manage/SetPassword";
        public const string ChangePassword = $"{Root}/Manage/ChangePassword";
        public const string PersonalData = $"{Root}/Manage/PersonalData";
    }
}