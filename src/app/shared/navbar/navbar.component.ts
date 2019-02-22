import { Location } from '@angular/common';
import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, Renderer2,
  ViewChild
} from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { NgbDropdownConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AuthenticationService } from 'src/app/shared/http/auth/authentication.service';
import { DASHBOARD_PATH, SIGN_UP_ROUTE_PATHS } from 'src/app/sign-up/sign-up.routes.constants';
import {
  TransactionModalComponent
} from '../../shared/modal/transaction-modal/transaction-modal.component';
import { SIGN_UP_CONFIG } from '../../sign-up/sign-up.constant';
import { SignUpService } from '../../sign-up/sign-up.service';
import { appConstants } from './../../app.constants';
import { AppService } from './../../app.service';
import { ConfigService, IConfig } from './../../config/config.service';
import { NavbarService } from './navbar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  providers: [NgbDropdownConfig]
})

export class NavbarComponent implements OnInit, AfterViewInit {
  browserError: boolean;
  showMobileNavbar = false;
  navbarMode: number;
  showNavShadow: boolean;
  showSearchBar = false;
  modalRef: NgbModalRef;
  pageTitle: string;
  notificationMaxLimit: number;
  isNotificationHidden = true;
  subTitle = '';
  pageSuperTitle = '';
  helpIcon = false;
  closeIcon = false;
  settingsIcon = false;
  filterIcon = false;
  currentUrl: string;
  backListener = '';
  isBackPressSubscribed = false;

  innerWidth: any;
  mobileThreshold = 567;
  isNavbarCollapsed = true;
  recentMessages: any;
  count: any;
  isNotificationEnabled: boolean;

  isPromotionEnabled = false;
  isArticleEnabled = false;
  isWillWritingEnabled = false;
  isInvestmentEnabled = false;
  isComprehensiveEnabled = true;

  isLoggedIn = false;
  userInfo;

  @ViewChild('navbar') NavBar: ElementRef;
  @ViewChild('navbarDropshadow') NavBarDropShadow: ElementRef;
  constructor(
    private navbarService: NavbarService, private _location: Location,
    private config: NgbDropdownConfig, private renderer: Renderer2,
    private cdr: ChangeDetectorRef, private router: Router, private configService: ConfigService,
    private signUpService: SignUpService, private authService: AuthenticationService,
    private modal: NgbModal,
    private appService: AppService) {
    this.browserCheck();
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
    });

    this.userInfo = this.signUpService.getUserProfileInfo();
    if (this.authService.isSignedUser()) {
      this.isLoggedIn = true;
    }

    this.signUpService.userObservable$.subscribe((data) => {
      if (data) {
        if (data === 'LOGGED_OUT') {
          this.isLoggedIn = false;
          this.clearLoginDetails();
        } else {
          this.userInfo = data;
          if (this.authService.isSignedUser()) {
            this.isLoggedIn = true;
          }
        }
      }
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
    this.isNotificationEnabled = this.canActivateNotification();
    this.notificationMaxLimit = SIGN_UP_CONFIG.NOTIFICATION_MAX_LIMIT;
    this.innerWidth = window.innerWidth;
    this.navbarService.currentPageTitle.subscribe((title) => this.pageTitle = title);
    this.navbarService.currentPageSubTitle.subscribe((subTitle) => this.subTitle = subTitle);
    this.navbarService.currentPageHelpIcon.subscribe((helpIcon) => this.helpIcon = helpIcon);
    this.navbarService.currentPageProdInfoIcon.subscribe((closeIcon) => this.closeIcon = closeIcon);
    this.navbarService.currentPageSettingsIcon.subscribe((settingsIcon) => this.settingsIcon = settingsIcon);
    this.navbarService.currentPageFilterIcon.subscribe((filterIcon) => this.filterIcon = filterIcon);
    this.navbarService.isBackPressSubscribed.subscribe((subscribed) => {
      this.isBackPressSubscribed = subscribed;
    });
    this.navbarService.currentPageSuperTitle.subscribe((superTitle) => this.pageSuperTitle = superTitle);

    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (this.router.url !== this.currentUrl) {
          this.currentUrl = this.router.url;
          this.hideMenu();
        }
      }
    });
  }

  ngAfterViewInit() {
    this.navbarService.currentNavbarMobileVisibility.subscribe((showMobileNavbar) => {
      this.showMobileNavbar = showMobileNavbar;
    });
    this.navbarService.currentNavbarMode.subscribe((navbarMode) => {
      this.navbarMode = navbarMode;
      if (navbarMode !== 2) {
        this.isNotificationEnabled = this.canActivateNotification();
      } else {
        this.isNotificationEnabled = false;
      }
      if (this.isNotificationEnabled) {
        this.getRecentNotifications();
      }
      this.cdr.detectChanges();
    });
    this.navbarService.currentNavbarShadowVisibility.subscribe((showNavShadow) => {
      this.showNavShadow = showNavShadow;
      this.cdr.detectChanges();
    });
  }

  openSearchBar(toggle: boolean) {
    this.showSearchBar = toggle;
  }

  showMobilePopUp() {
    this.navbarService.showMobilePopUp(this.pageTitle);
  }

  goBack() {
    if (this.isBackPressSubscribed) {
      this.navbarService.backPressed(this.pageTitle);
    } else {
      this._location.back();
    }
  }
  goToLink(fragment) {
    console.log(fragment);
  }
  goToHome(in_fragment?: string) {
    if (in_fragment) {
      const extra = { fragment: in_fragment } as NavigationExtras;
      this.router.navigate([appConstants.homePageUrl], extra);
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
  }

  getRecentNotifications() {
    this.signUpService.getRecentNotifications().subscribe((response) => {
      this.count = response.objectList[0].unreadCount;
      this.recentMessages = response.objectList[0].notifications[0].messages;
      this.recentMessages.map((message) => {
        message.time = parseInt(message.time, 10);
    });
    });
  }

  toggleRecentNotification() {
    this.isNotificationHidden = !this.isNotificationHidden;
    if (!this.isNotificationHidden) { // When Opened
      if (this.recentMessages && this.recentMessages.length) {
        this.updateNotifications(this.recentMessages, SIGN_UP_CONFIG.NOTIFICATION.READ_PAYLOAD_KEY);
      }
    } else { // When closed
      this.getRecentNotifications();
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
    return (this.router.url === DASHBOARD_PATH);
  }

  showFilterModalPopUp(data) {
    this.modalRef = this.modal.open(TransactionModalComponent, { centered: true });
  }
  logout() {
    this.authService.logout().subscribe((data) => {
      this.clearLoginDetails();
    });
  }

  clearLoginDetails() {
    this.signUpService.setUserProfileInfo(null);
    this.isLoggedIn = false;
    this.authService.clearAuthDetails();
    this.appService.clearData();
    this.appService.startAppSession();
    this.router.navigate([appConstants.homePageUrl]);
  }

  goToDashboard() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
  }

  browserCheck() {
    const ua = navigator.userAgent;
    /* MSIE used to detect old browsers and Trident used to newer ones*/
    const is_ie = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;

    if (is_ie) {
      this.browserError = true;
    } else {
      this.browserError = false;
    }
  }
  closeBrowserError() {
    this.browserError = false;
  }
}
