import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnInit, Renderer2,
  ViewChild
} from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ViewportScroller } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { App } from '@capacitor/app';

import { APP_ROUTES } from '../../app-routes.constants';
import { appConstants } from '../../app.constants';
import { AppService } from '../../app.service';
import { ConfigService, IConfig } from '../../config/config.service';
import { InvestmentAccountService } from '../../investment/investment-account/investment-account-service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { SIGN_UP_CONFIG } from '../../sign-up/sign-up.constant';
import {
  DASHBOARD_PATH, EDIT_PROFILE_PATH, SIGN_UP_ROUTE_PATHS
} from '../../sign-up/sign-up.routes.constants';
import { SignUpService } from '../../sign-up/sign-up.service';
import { CustomErrorHandlerService } from '../http/custom-error-handler.service';
import { DefaultErrors } from '../modal/error-modal/default-errors';
import { ProgressTrackerService } from '../modal/progress-tracker/progress-tracker.service';
import { Util } from '../utils/util';
import { environment } from './../../../environments/environment';
import { ComprehensiveService } from './../../comprehensive/comprehensive.service';
import { SelectedPlansService } from './../Services/selected-plans.service';
import { MenuConfig } from './config/menu.config';
import { INavbarConfig } from './config/navbar.config.interface';
import { NavbarConfig } from './config/presets';
import { NavbarService } from './navbar.service';
import { SessionsService } from '../Services/sessions/sessions.service';
import { MANAGE_INVESTMENTS_ROUTE_PATHS } from '../../investment/manage-investments/manage-investments-routes.constants';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  providers: [NgbDropdownConfig]
})

export class NavbarComponent implements OnInit, AfterViewInit {
  browserError: boolean;
  navbarMode = 1; // Main Navbar Mode
  // Navbar Configuration (New)
  navbarConfig: any;
  constants: any;
  showNavBackBtn = false; // Show Navbar1 Backbtn
  showHeaderBackBtn = true; // Show Navbar2 Backbtn
  showMenu = true;  // Show Menu Feature
  showLogin = true; // Show Login Feature
  showLogout = true; // Show Logout Feature only
  showNavShadow = true; // Navbar Show Shadow
  showSearchBar = false; // Navbar Show Search
  showNotifications = false; // Show Notifications Feature
  showHeaderNavbar = false; // Navbar Show on Mobile
  showHelpIcon = false; // Help Icon for Mobile (Direct/ Guide Me)
  showDropDownIcon = false; //Dropdown Icon for WiseIncome Payout 
  showSettingsIcon = false; // Settings Icon for Mobile (Direct)
  showNotificationClear = false; // Notification Clear all Button
  closeIcon = false;
  showLabel: any;
  showPaymentLockIcon = false; //Payment Lock Icon

  // Navbar Configurations
  modalRef: NgbModalRef; // Modal Ref
  pageTitle: string; // Page Title
  isNotificationHidden = true;
  subTitle = '';
  pageSuperTitle = '';
  filterIcon = false;
  currentUrl: string;
  backListener = '';
  isBackPressSubscribed = false;

  // Mobile Presets
  innerWidth: any;
  mobileThreshold = 567;
  isNavbarCollapsed = true;

  // Notifications Variables
  recentMessages: any;
  notificationCount: any;
  notificationLimit: number;

  isPromotionEnabled = false;
  isArticleEnabled = false;
  isWillWritingEnabled = false;
  isInvestmentEnabled = false;
  isNotificationEnabled = false;
  isComprehensiveEnabled = false;
  isComprehensiveLiveEnabled = false;

  showComprehensiveTitle = false;
  // Signed In
  isLoggedIn = false;
  userInfo: any;

  showMenuItem = false;
  menuItemClass = '';
  pageId: any;

  journeyType: string;
  isComprehensivePath: boolean;
  hideHomepage = false;

  // Menu show/hide configure
  showHome = true;
  showInsure = true;
  showWills = true;
  showInvest = true;
  showComprehensive = true;
  showFWP = true;
  showFLT = true;
  showPromotions = true;
  showLearn = false;
  showAbtUs = true;
  showCustomerReviews = true;
  showWhyMO = true;
  showCareers = true;
  showContactUs = true;
  showFAQs = true;
  showMenuItemInvestUser = false;

  showPromoApplied: boolean = false;

  //wiseIncome Portfolio Dropdown
  wiseIncomeDropDownShow: boolean = false;
  wiseIncomeDropDownItem: any;
  tab;
  currentActive;
  corpFaq = appConstants.CORPORATE_FAQ;

  @ViewChild('navbar') NavBar: ElementRef;
  @ViewChild('navbarDropshadow') NavBarDropShadow: ElementRef;

  private ngUnsubscribe = new Subject();
  accessReferrelProgramOnRoles: boolean = true;

  corpBizData: any;

  constructor(
    public navbarService: NavbarService,
    private config: NgbDropdownConfig, private renderer: Renderer2,
    private cdr: ChangeDetectorRef, private router: Router, private configService: ConfigService,
    private signUpService: SignUpService, public authService: AuthenticationService,
    private sessionsService: SessionsService,
    private modal: NgbModal,
    private appService: AppService,
    public defaultError: DefaultErrors,
    private investmentAccountService: InvestmentAccountService,
    private errorHandler: CustomErrorHandlerService,
    private selectedPlansService: SelectedPlansService,
    private progressTrackerService: ProgressTrackerService,
    private comprehensiveService: ComprehensiveService,
    private viewportScroller: ViewportScroller,
    private ngZone: NgZone) {
    this.browserCheck();
    this.matrixResolver();
    config.autoClose = true;
    this.navbarService.getNavbarEvent.subscribe((data) => {
      this.navbarService.setNavbarDetails(this.NavBar);
    });

    this.configService.getConfig().subscribe((moduleConfig: IConfig) => {
      this.isArticleEnabled = moduleConfig.articleEnabled;
      this.isPromotionEnabled = moduleConfig.promotionEnabled;
      this.isWillWritingEnabled = moduleConfig.willWritingEnabled;
      this.isInvestmentEnabled = moduleConfig.investmentEnabled;
      this.isComprehensiveEnabled = moduleConfig.comprehensiveEnabled;
      this.isComprehensiveLiveEnabled = moduleConfig.comprehensiveLiveEnabled;
    });

    // User Information Check Authentication
    this.userInfo = this.signUpService.getUserProfileInfo();
    if (this.authService.isSignedUser()) {
      this.isLoggedIn = true;
    }
    // User Information
    this.signUpService.userObservable$.subscribe((data) => {
      if (data) {
        this.userInfo = data;
        if (this.authService.isSignedUser()) {
          this.isLoggedIn = true;
          this.authService.isUserTypeCorporate = this.authService.isSignedUserWithRole(SIGN_UP_CONFIG.ROLE_CORP_FB_USER);
          this.authService.displayCorporateLogo$.next(this.authService.isUserTypeCorporate);
          this.accessReferrelProgramOnRoles = this.authService.accessCorporateUserFeature('REFERREL_PROGRAM');
        }
      }
    });

    this.constants = appConstants;
    this.journeyType = this.appService.getJourneyType();
    this.appService.journeyType$.subscribe((type: string) => {
      if (type && type !== '') {
        this.journeyType = type;
      }
    });

    // Log Out
    this.navbarService.logoutObservable$.subscribe((data) => {
      if (data === 'LOGGED_OUT') {
        if (this.appService.getCorporateDetails() && this.appService.getCorporateDetails().organisationEnabled) {
          this.clearLoginDetails(true, appConstants.USERTYPE.CORPORATE);
        } else {
          this.clearLoginDetails();
        }
      } else if (data === 'CLEAR_SESSION_DATA') {
        this.clearLoginDetails(false);
      }
    });
    this.hideHomepage = environment.hideHomepage;
    if (this.hideHomepage) {
      this.setMenuDisplay();
    }

    this.corpBizData = appService.getCorpBizData();

    //Device back navigation
    App.addListener('backButton', (BackButtonListener) => {
      console.log('Device Back Button Clicked');
      this.ngZone.run(() => {
        if (BackButtonListener.canGoBack) {
          console.log('Nav bar Go the previous screen');
          this.goBack();
        } else {
          console.log('Nav Bar No Back screen');
          App.exitApp();
        }
      });
    });
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', [])
  checkScroll() { // Emiting Navbar Details to Navbar Service
    this.navbarService.setNavbarDetails(this.NavBar);
    this.innerWidth = window.innerWidth;
  }

  ngOnInit() {
    this.hideMenu();
    this.notificationLimit = SIGN_UP_CONFIG.NOTIFICATION_MAX_LIMIT;
    this.innerWidth = window.innerWidth;
    this.navbarService.currentPageTitle.subscribe((title) => {
      this.pageTitle = title;
      // Workaround for delayed title text load. Trigger onPageChanged();
      this.onPageChanged();
    });
    this.navbarService.currentPageSubTitle.subscribe((subTitle) => {
      this.subTitle = subTitle;
    });
    this.navbarService.currentPageHelpIcon.subscribe((showHelpIcon) => {
      this.showHelpIcon = showHelpIcon;
    });
    this.navbarService.currentPagePaymentLockIcon.subscribe((showPaymentLockIcon) => {
      this.showPaymentLockIcon = showPaymentLockIcon;
    });
    this.navbarService.currentPageDropDownIcon.subscribe((showDropDownIcon) => {
      this.showDropDownIcon = showDropDownIcon;
    });
    this.navbarService.currentPageProdInfoIcon.subscribe((closeIcon) => this.closeIcon = closeIcon);
    this.navbarService.currentPageClearNotify.subscribe((showClearNotify) => {
      this.showNotificationClear = showClearNotify;
    });
    this.navbarService.currentPageSettingsIcon.subscribe((showSettingsIcon) => this.showSettingsIcon = showSettingsIcon);
    this.navbarService.currentPageFilterIcon.subscribe((filterIcon) => this.filterIcon = filterIcon);
    this.navbarService.isBackPressSubscribed.subscribe((subscribed) => {
      this.isBackPressSubscribed = subscribed;
    });
    this.navbarService.currentPageSuperTitle.subscribe((superTitle) => this.pageSuperTitle = superTitle);
    this.navbarService.promoAppliedCardObservable.subscribe((promoCard) => this.showPromoApplied = promoCard);

    this.navbarService.currentMenuItem.subscribe((menuItem) => {
      if (menuItem && typeof menuItem.iconClass !== 'undefined') {
        this.showMenuItem = true;
        this.menuItemClass = menuItem.iconClass;
        this.pageId = menuItem.id;
      } else {
        this.showMenuItem = false;
      }
    });

    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.onPageChanged();
        if (this.router.url !== this.currentUrl) {
          this.currentUrl = this.router.url;
          this.hideMenu();
        }
      }
    });

    this.navbarService.menuItemInvestUserEvent.subscribe((investUser) => {
      this.showMenuItemInvestUser = investUser;
    });

    this.navbarService.wiseIncomeDropDownShow.subscribe((subscribed) => {
      this.wiseIncomeDropDownShow = subscribed;
      if (!subscribed) {
        this.tab = 'tab';
      }
    });

    // sets current active scrolls to menu for wiseincome payout
    this.navbarService.currentActiveObserv.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((currentActive) => {
        this.currentActive = currentActive;
      });
  }

  ngAfterViewInit() {
    this.navbarService.currentNavbarMobileVisibility.subscribe((showHeaderNavbar) => {
      this.showHeaderNavbar = showHeaderNavbar;
    });
    this.navbarService.currentNavbarMode.subscribe((navbarMode) => {
      this.navbarMode = navbarMode;
      this.matrixResolver(navbarMode);
      // Enabling Notifications
      if (this.navbarConfig.showNotifications) {
        this.isNotificationEnabled = true;
      } else {
        this.isNotificationEnabled = false;
      }

      if (this.isNotificationEnabled && this.authService.isSignedUser()) {
        this.getRecentNotifications();
      }
      this.cdr.detectChanges();
    });
    this.navbarService.currentNavbarShadowVisibility.subscribe((showNavShadow) => {
      this.showNavShadow = showNavShadow;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }

  onPageChanged() {
    const comprehensiveUrlPath = '/' + APP_ROUTES.COMPREHENSIVE + '/';
    this.isComprehensivePath = (window.location.href.indexOf(comprehensiveUrlPath) !== -1);
    this.showComprehensiveTitle = this.isComprehensiveEnabled && this.isComprehensivePath
      && this.journeyType === appConstants.JOURNEY_TYPE_COMPREHENSIVE
      && !Util.isEmptyOrNull(this.pageTitle);
  }

  // MATRIX RESOLVER --- DO NOT DELETE IT'S IMPORTANT
  matrixResolver(navbarMode?: any) {
    const matrix = new NavbarConfig();
    let nc: INavbarConfig;
    if (navbarMode ? true : false && (navbarMode !== 'default')) {
      this.navbarMode = navbarMode;
      nc = matrix[navbarMode];
      // Just cos there is no automapper. FK
      this.processMatrix(nc);
    } else {
      this.navbarConfig = matrix['default'];
    }
  }

  processMatrix(nc: INavbarConfig) {
    // Buffer for Matrix
    Object.keys(nc).forEach((key) => {
      this.navbarConfig[key] = nc[key];
    });
    // Resetting Items to default
    if (!nc['showLabel']) {
      this.navbarConfig.showLabel = undefined;
    }
    // Implement Matrix
    const config = this.navbarConfig as INavbarConfig;
    this.showNavBackBtn = config.showNavBackBtn;
    this.showHeaderBackBtn = config.showHeaderBackBtn;
    this.showMenu = config.showMenu;
    this.showLogin = config.showLogin;
    this.showLogout = config.showLogout;
    this.showNavShadow = config.showNavShadow;
    this.showSearchBar = config.showSearchBar;
    this.showNotifications = config.showNotifications;
    this.showHeaderNavbar = config.showHeaderNavbar;
    this.showNotificationClear = false;
    this.showLabel = config.showLabel ? config.showLabel : false;
  }
  // End of MATRIX RESOLVER --- DO NOT DELETE IT'S IMPORTANT

  openSearchBar(toggle: boolean) {
    this.showSearchBar = toggle;
  }

  showMobilePopUp() {
    this.navbarService.showMobilePopUp(this.pageTitle);
  }

  onMenuItemClicked() {
    this.navbarService.menuItemClicked(this.pageId);
  }

  goBack() {
    if (this.isBackPressSubscribed) {
      this.navbarService.backPressed(this.pageTitle);
    } else {
      this.navbarService.goBack();
    }
  }

  goToExternal(url) {
    if (this.authService.isSignedUser()) {
      let welcomeFlowFlag = this.authService.getWelcomeFlowFlag();
      if (typeof welcomeFlowFlag == 'boolean' && !welcomeFlowFlag) {
        this.isLoggedIn = true;
        this.checkCurrentRouteAndNavigate(DASHBOARD_PATH);
      }
    }
    else {
      window.open(url, '_blank');
    }
  }

  goToHome(in_fragment?: string) {
    if (in_fragment) {
      const extra = { fragment: in_fragment } as NavigationExtras;
      // Added check to see if current route is same
      if (this.router.url === appConstants.HOME_ROUTE + in_fragment) {
        this.toggleMenu();
      } else {
        this.router.navigate([appConstants.homePageUrl], extra);
      }
    } else {
      this.router.navigate([appConstants.homePageUrl]);
    }
  }

  openDropdown(dropdown) {
    if (this.innerWidth > this.mobileThreshold) {
      dropdown.open();
    }
  }

  closeDropdown(dropdown) {
    if (this.innerWidth > this.mobileThreshold) {
      dropdown.close();
    }
  }

  hideMenu() {
    this.isNavbarCollapsed = true;
    this.renderer.removeClass(document.body, 'modal-open');
  }

  toggleMenu() {
    if (this.isNavbarCollapsed) {
      this.renderer.addClass(document.body, 'modal-open');
    } else {
      this.renderer.removeClass(document.body, 'modal-open');
    }
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
    if (!this.isNotificationHidden && innerWidth < this.mobileThreshold) {
      this.isNotificationHidden = true;
    }
  }

  // Notification Methods
  getRecentNotifications() {
    this.signUpService.getRecentNotifications().subscribe((response) => {
      this.notificationCount = response.objectList[0].unreadCount;
      this.recentMessages = response.objectList[0].notifications[0].messages;
      this.recentMessages.map((message) => {
        message.time = parseInt(message.time, 10);
      });
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  toggleRecentNotification() {
    this.renderer.removeClass(document.body, 'modal-open');
    this.isNotificationHidden = !this.isNotificationHidden;
    if (!this.isNotificationHidden) { // When Opened
      if (this.recentMessages && this.recentMessages.length) {
        this.updateNotifications(this.recentMessages, SIGN_UP_CONFIG.NOTIFICATION.READ_PAYLOAD_KEY);
      }
    } else { // When closed
      this.getRecentNotifications();
    }
    // Checking navbar collapsed
    if (!this.isNavbarCollapsed && innerWidth < this.mobileThreshold) {
      this.isNavbarCollapsed = true;
    }
  }

  updateNotifications(messages, type) {
    this.signUpService.updateNotifications(messages, type).subscribe((response) => {
    });
  }

  viewAllNotifications() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.VIEW_ALL_NOTIFICATIONS]);
    this.isNotificationHidden = true;
  }

  canActivateNotification() {
    return (
      this.router.url === DASHBOARD_PATH ||
      this.router.url === EDIT_PROFILE_PATH
    );
  }

  clearNotifications() {
    this.navbarService.clearNotification();
  }
  // End of Notifications

  // Logout Method
  logout() {
    this.navbarService.clearUrlHistory();
    if (this.authService.isSignedUser()) {
      this.authService.logout().subscribe((data) => {
        this.clearLoginDetails(true, this.signUpService.getUserType());
      });
    } else if (this.appService.getCorporateDetails() && this.appService.getCorporateDetails().organisationEnabled) {
      this.clearLoginDetails(true, appConstants.USERTYPE.CORPORATE);
    } else {
      this.clearLoginDetails();
    }
  }

  clearLoginDetails(isRedirect: boolean = true, userType = appConstants.USERTYPE.NORMAL) {
    this.signUpService.setUserProfileInfo(null);
    this.isLoggedIn = false;
    this.showMenuItemInvestUser = false;
    this.sessionsService.destroyInstance();
    this.authService.clearAuthDetails();
    this.authService.clearSession();
    this.sessionsService.createNewActiveInstance();
    this.authService.doClear2FASession({ errorPopup: false, updateData: false });
    this.appService.clearData();
    this.navbarService.setPromoCodeCpf(null);
    this.appService.startAppSession();
    this.selectedPlansService.clearData();
    if (isRedirect) {
      if (userType === appConstants.USERTYPE.CORPORATE) {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN], { queryParams: { orgID: this.appService.getCorporateDetails().uuid } });
      } else if (this.showHome) {
        this.router.navigate([appConstants.homePageUrl]);
      } else {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
      }
    }
  }

  // Route to Dashboard
  goToDashboard() {
    if (!this.authService.isSignedUser()) {
      this.clearLoginDetails();
      this.errorHandler.handleAuthError();
      if (this.appService.getCorporateDetails() && this.appService.getCorporateDetails().organisationEnabled) {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN], { queryParams: { orgID: this.appService.getCorporateDetails().uuid } });
      } else {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
      }
    } else {
      // If user is on dashboard page already, close the menu
      this.checkCurrentRouteAndNavigate(DASHBOARD_PATH);
    }
  }

  // Added to check if current route is same as the navigating route
  checkCurrentRouteAndNavigate(route) {
    //close the menu bar
    this.hideMenu();
    // If its not current route then navigate to the route
    if (this.router.url !== route) {
      this.router.navigate([route]);
    }
  }

  // Browser Error Core Methods
  browserCheck() {
    const ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    const is_ie = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
    const isFirefox = ua.toLowerCase().indexOf('firefox') > -1;
    if (is_ie) {
      this.router.navigate([APP_ROUTES.NOT_SUPPORTED]);
    } else if (isFirefox) {
      this.browserError = true;
    } else {
      this.browserError = false;
    }
  }
  closeBrowserError() {
    this.browserError = false;
  }
  reloadProgressTracker() {
    this.progressTrackerService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
  }

  setMenuDisplay() {
    this.showHome = MenuConfig.showHome;
    this.showInsure = MenuConfig.services.showInsure;
    this.showWills = MenuConfig.services.showWills;
    this.showInvest = MenuConfig.services.showInvest;
    this.showComprehensive = MenuConfig.services.showComprehensive;
    this.showFWP = MenuConfig.corporate.showFWP;
    this.showFLT = MenuConfig.corporate.showFLT;
    this.showPromotions = MenuConfig.showPromotions;
    this.showLearn = MenuConfig.showLearn;
    this.showAbtUs = MenuConfig.aboutUs.showAbtUs;
    this.showCustomerReviews = MenuConfig.aboutUs.showCustomerReviews;
    this.showWhyMO = MenuConfig.aboutUs.showWhyMO;
    this.showCareers = MenuConfig.aboutUs.showCareers;
    this.showContactUs = MenuConfig.aboutUs.showContactUs;
    this.showFAQs = MenuConfig.aboutUs.showFAQs;
  }

  goToWrapFeeDetails() {
    this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.FEES]);
  }

  //wiseIncome Dropdown
  wiseIncomeDropDown(event) {
    this.wiseIncomeDropDownShow = !this.wiseIncomeDropDownShow;
  }

  //wiseIncome Dropdown Scroll
  onClickScroll(elementId: string): void {
    this.navbarService.setScrollTo(elementId, this.NavBar.nativeElement.getBoundingClientRect().height);
    this.wiseIncomeDropDownShow = !this.wiseIncomeDropDownShow;
    if (elementId == 'payoutOption') {
      this.currentActive = 1;
    } else if (elementId == 'featureBenefits') {
      this.currentActive = 2;
    } else if (elementId == 'fundAssets') {
      this.currentActive = 3;
    } else {
      this.currentActive = 0;
    }
  }

}
