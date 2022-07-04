import { INavbarConfig } from './navbar.config.interface';

export class NavbarConfig {
  'default': object = {
    showNavBackBtn: false,
    showHeaderBackBtn: false,
    showMenu: true,
    showLogin: true,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: false,
    showHeaderNavbar: false
  };

  // ----- Core Function Profiles -----
  // DashBoard
  '100': object = {
    showNavBackBtn: false,
    showHeaderBackBtn: false,
    showMenu: true,
    showLogin: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: false
  };

  // Sign Up Journey
  '101': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: false,
    showLogin: false,
    showSearchBar: false,
    showNotifications: false,
    showHeaderNavbar: false,
    showExitCheck: true,
  };

  // CorpBiz Sign Up Journey
  '106': object = {
    showNavBackBtn: false,
    showHeaderBackBtn: false,
    showMenu: false,
    showLogin: false,
    showSearchBar: false,
    showNotifications: false,
    showHeaderNavbar: false,
    showExitCheck: true,
  };

  // Edit Profile
  '102': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: true,
    showLogin: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: true,
    showExitCheck: true,
  };

  // Topup and Withdraw
  '103': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: true,
    showLogin: true,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: true,
    showExitCheck: true,
  };

  // Edit Profile/View Notifications (Homepage Hidden)
  '104': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: false,
    showLogin: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: true,
    showExitCheck: true,
  };

  // Portfolio/Fundings/Topup/Withdraw (Homepage Hidden)
  '105': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: false,
    showLogin: true,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: true,
    showExitCheck: true,
  };

  // ------ Features -----
  // Home;
  '1': object = {
    showNavBackBtn: false,
    showHeaderBackBtn: false,
    showMenu: true,
    showLogin: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: false,
    showExitCheck: false
  };

  // Direct/ Guide Me Journey (Robo1)
  '2': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: false,
    showLogin: false,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: false,
    showLabel: {
      primary: 'Insurance'
    },
    showExitCheck: true
  };

  // Will-Writing (Robo1.5)
  '4': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: false,
    showLogin: false,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: false,
    showHeaderNavbar: false,
    showLabel: {
      primary: 'Will Writing'
    },
    showExitCheck: true
  };

  // Investment (Robo2)
  '6': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: false,
    showLogin: false,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: false,
    showHeaderNavbar: true,
    showLabel: {
      primary: 'Investment'
    },
    showExitCheck: true
  };
  // Comprehensive (Robo3)
  '7': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: false,
    showLogin: false,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: false,
    showHeaderNavbar: true,
    showLabel: {
      primary: 'Comprehensive Planning'
    }
  };

  // Retirement Planning (Robo1)
  '8': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: true,
    showLogin: false,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: false,
    showHeaderNavbar: true,
    showLabel: {
      primary: 'Retirement Planning'
    },
    showExitCheck: true
  };

  // Dashboard/Contact Us/FinancialLiteracy/FinancialWellness/FAQ/Promotions (Homepage Hidden)
  '9': object = {
    showNavBackBtn: false,
    showHeaderBackBtn: false,
    showMenu: false,
    showLogin: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: false,
    showExitCheck: false
  };

   // Investment (Robo2) (With Notification)
   '10': object = {
    showNavBackBtn: true,
    showHeaderBackBtn: true,
    showMenu: false,
    showLogin: false,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: true,
    showLabel: {
      primary: 'Investment'
    },
    showExitCheck: true
  };

  // Investment Maintenance
  '11': object = {
    showNavBackBtn: false,
    showHeaderBackBtn: false,
    showMenu: false,
    showLogin: false,
    showLogout: true,
    showNavShadow: true,
    showSearchBar: false,
    showNotifications: true,
    showHeaderNavbar: true,
    showLabel: {
      primary: 'Investment'
    },
    showExitCheck: true
  };
}
