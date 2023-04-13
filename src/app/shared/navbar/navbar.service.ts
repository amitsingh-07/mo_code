import { Location } from '@angular/common';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { filter, tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CapacitorUtils } from '../utils/capacitor.util';

import { IHeaderMenuItem } from './navbar.types';
import { appConstants } from '../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  isBackPressSubscribed = new BehaviorSubject(false);

  private navbar = new Subject(); // The navbar itself
  private getNavEvent = new BehaviorSubject(true);
  private navbarMode = new BehaviorSubject(1);
  private navbarVisibility = new BehaviorSubject(true);
  private navbarMobileVisibility = new BehaviorSubject(true);
  private navbarShadowVisibility = new BehaviorSubject(true);
  private backListener = new BehaviorSubject('');
  private promoAppliedCardVisibility = new BehaviorSubject(false);
  private scrollTo = new Subject();
  private currentActive = new Subject();
  private setCpfPromoCode = new BehaviorSubject(null);


  existingNavbar = this.navbar.asObservable();
  getNavbarEvent = this.getNavEvent.asObservable();
  currentNavbarMode = this.navbarMode.asObservable();
  currentNavbarVisibility = this.navbarVisibility.asObservable();
  currentNavbarMobileVisibility = this.navbarMobileVisibility.asObservable();
  currentNavbarShadowVisibility = this.navbarShadowVisibility.asObservable();
  currentBackListener = this.backListener.asObservable();
  scrollToObserv = this.scrollTo.asObservable();
  currentActiveObserv = this.currentActive.asObservable();
  getCpfPromoCodeObservable = this.setCpfPromoCode.asObservable();

  /* Header Params */
  private pageTitle = new BehaviorSubject('');
  private pageSubTitle = new BehaviorSubject('');
  private pageHelpIcon = new BehaviorSubject(false);
  private pageProdInfoIcon = new BehaviorSubject(false);
  private pageClearNotify = new BehaviorSubject(false);
  private pageDropDownIcon = new BehaviorSubject(false);
  private paymentLockIcon = new BehaviorSubject(false);

  private investPageTitle = new BehaviorSubject('');
  private investPageSuperTitle = new BehaviorSubject('');

  private mobileModal = new BehaviorSubject('');
  private clearNotificationEvent = new BehaviorSubject(false);
  private closeProdInfo = new BehaviorSubject('');
  private pageSettingsIcon = new BehaviorSubject(true);
  private pageFilterIcon = new BehaviorSubject(true);
  private pageSuperTitle = new BehaviorSubject('');
  private menuItem = new BehaviorSubject({} as IHeaderMenuItem);
  private $menuItemClick = new BehaviorSubject('');
  private menuItemInvestUser = new BehaviorSubject(false);

  menuItemInvestUserEvent = this.menuItemInvestUser.asObservable();
  currentPageTitle = this.pageTitle.asObservable();
  currentPageSubTitle = this.pageSubTitle.asObservable();
  currentPageHelpIcon = this.pageHelpIcon.asObservable();
  currentPageDropDownIcon = this.pageDropDownIcon.asObservable();
  currentPageProdInfoIcon = this.pageProdInfoIcon.asObservable();
  currentMobileModalEvent = this.mobileModal.asObservable();
  currentPageClearNotify = this.pageClearNotify.asObservable();
  currentClearNotificationEvent = this.clearNotificationEvent.asObservable();

  currentPageSettingsIcon = this.pageSettingsIcon.asObservable();
  currentPageFilterIcon = this.pageFilterIcon.asObservable();
  currentPageSuperTitle = this.pageSuperTitle.asObservable();
  currentMenuItem = this.menuItem.asObservable();

  onMenuItemClicked = this.$menuItemClick.asObservable();
  investmentPageTitle = this.investPageTitle.asObservable();
  investmentPageSuperTitle = this.investPageSuperTitle.asObservable();
  currentPagePaymentLockIcon = this.paymentLockIcon.asObservable();

  promoAppliedCardObservable = this.promoAppliedCardVisibility.asObservable();
  // logout
  private logoutSubject = new Subject();
  logoutObservable$ = this.logoutSubject.asObservable();
  wiseIncomeDropDownShow = new BehaviorSubject(false);
  displayingWelcomeFlowContent$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  welcomeJourneyCompleted: boolean = false;
  upgradeScreenShown = false;
  urlHistory = { currentUrl: null, previousUrl: []};
  isBackClicked = false;
  activeModals = 0;

  constructor(private router: Router, private _location: Location, private ngZone: NgZone, private modal: NgbModal) {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      if (CapacitorUtils.isApp) { 
        this.handlingMobileAppNavigationUrlHistory(event);
      }
      this.unsubscribeBackPress();
      if (event.navigationTrigger === 'popstate' && this.activeModals > 0) {
        this.modal.dismissAll();
      }
    });
    
    this.modal.activeInstances.subscribe(list => {
			this.activeModals = list.length;
		});
  }

  /* Navbar Generic Element Details*/
  setNavbarDetails(navbar: ElementRef) {
    this.navbar.next(navbar);
  }

  getNavbarDetails() {
    this.getNavEvent.next(true);
  }

  setNavbarComprehensive(secondaryVisible: boolean) {
    this.setNavbarVisibility(true);
    this.setNavbarMode(7);
    this.setNavbarMobileVisibility(secondaryVisible);
    this.setNavbarShadowVisibility(false);
  }

  /* Visibility Functions */
  setNavbarDirectGuided(secondaryVisible: boolean) {
    this.setNavbarVisibility(true);
    this.setNavbarMode(2);
    this.setNavbarMobileVisibility(secondaryVisible);
    this.setNavbarShadowVisibility(false);
  }

  setNavbarWillWriting() {
    this.setNavbarVisibility(true);
    this.setNavbarMode(2);
    this.setNavbarMobileVisibility(false);
    this.setNavbarShadowVisibility(false);
  }

  setNavbarVisibility(isVisible: boolean) {
    this.navbarVisibility.next(isVisible);
  }

  setNavbarMobileVisibility(isVisible: boolean) {
    this.navbarMobileVisibility.next(isVisible);
  }
  // Shadow Visibility
  setNavbarShadowVisibility(isVisible: boolean) {
    this.navbarShadowVisibility.next(isVisible);
  }

  /* Header Mode*/
  setNavbarMode(mode: number) {
    this.navbarMode.next(mode);
  }

  setProdButtonVisibility(isVisible: boolean) {
    this.pageProdInfoIcon.next(isVisible);
  }

  setPageTitleWithIcon(title: string, menuItem: IHeaderMenuItem) {
    this.pageTitle.next(title);
    this.menuItem.next(menuItem);
    this.pageHelpIcon.next(false);
    this.pageSettingsIcon.next(false);
    this.pageFilterIcon.next(false);
    this.pageSuperTitle.next('');
    this.pageSubTitle.next('');
    this.pageDropDownIcon.next(false);
  }
  setClearAllNotify(isVisible: boolean) {
    this.pageClearNotify.next(isVisible);
  }

  setInvestPageTitle(title: string, superTitle?: string) {
    this.investPageTitle.next(title);
    this.investPageSuperTitle.next(superTitle);
  }

  /* Header Functions*/
  // Setting Page Title
  setPageTitle(title: string, subTitle?: string, helpIcon?: boolean, settingsIcon?: boolean, filterIcon?: boolean, superTitle?: string, dropDownIcon?: boolean) {
    this.setInvestPageTitle(title, superTitle ? superTitle : '');
    this.pageTitle.next(title);
    if (subTitle) {
      this.pageSubTitle.next(subTitle);
    } else {
      this.pageSubTitle.next('');
    }
    if (helpIcon) {
      this.pageHelpIcon.next(true);
    } else {
      this.pageHelpIcon.next(false);
    }
    if (settingsIcon) {
      this.pageSettingsIcon.next(true);
    } else {
      this.pageSettingsIcon.next(false);
    }
    if (filterIcon) {
      this.pageFilterIcon.next(true);
    } else {
      this.pageFilterIcon.next(false);
    }
    if (superTitle) {
      this.pageSuperTitle.next(superTitle);
    } else {
      this.pageSuperTitle.next('');
    }
    if (dropDownIcon) {
      this.pageDropDownIcon.next(true);
    } else {
      this.pageDropDownIcon.next(false);
    }
    // Reset/Hide menuItem
    this.menuItem.next({} as IHeaderMenuItem);
  }
  // Showing Mobile PopUp Trigger
  showMobilePopUp(event) {
    this.mobileModal.next(event);
  }

  menuItemClicked(pageId) {
    this.$menuItemClick.next(pageId);
  }

  // Hiding Product Info Modal Trigger
  backPressed(pageTitle: string) {
    this.backListener.next(pageTitle);
  }

  goBack() {
    if (CapacitorUtils.isApp) {
      this.isBackClicked = true; 
      this.urlHistory.previousUrl = this.urlHistory.previousUrl.filter(item => !item.includes(appConstants.MY_INFO_CALLBACK_URL) );
      this.urlHistory.currentUrl = this.urlHistory.previousUrl[this.urlHistory.previousUrl.length - 1];
      this.urlHistory.previousUrl.splice(this.urlHistory.previousUrl.length - 1, 1);
      this.router.navigate([this.urlHistory.currentUrl]);
    } else {
      this.ngZone.run(() => {
        this._location.back();
      });
    }
  }

  // Clearing Notification
  clearNotification() {
    this.clearNotificationEvent.next(true);
  }

  unsubscribeClearNotification() {
    this.clearNotificationEvent.next(false);
  }

  subscribeBackPress() {
    this.isBackPressSubscribed.next(true);
    return this.currentBackListener;
  }

  unsubscribeBackPress() {
    this.isBackPressSubscribed.next(false);
    this.backListener.next('');
  }

  unsubscribeMenuItemClick() {
    this.menuItem.next(null);
    this.$menuItemClick.next('');
  }

  subscribeDropDownIcon() {
    this.wiseIncomeDropDownShow.next(true);
  }

  unsubscribeDropDownIcon() {
    this.wiseIncomeDropDownShow.next(false);
  }

  logoutUser() {
    this.setPromoCodeCpf('');
    this.logoutSubject.next('LOGGED_OUT');
  }

  clearSessionData() {
    this.logoutSubject.next('CLEAR_SESSION_DATA');
  }

  showPromoAppliedToast() {
    this.promoAppliedCardVisibility.next(true);
    // Set timeout to show card for how long
    setTimeout(() => {
      this.promoAppliedCardVisibility.next(false);
    }, 3000);
  }

  setMenuItemInvestUser(isVisible: boolean) {
    this.menuItemInvestUser.next(isVisible);
  }

  /*WiseIncome Dropdown Scroll*/
  setScrollTo(elementName, navBarHeight) {
    let scrollOption = {
      elementName: elementName,
      menuHeight: navBarHeight
    }
    this.scrollTo.next(scrollOption);
  }

  setCurrentActive(currentActive) {
    this.currentActive.next(currentActive);
  }

  setPaymentLockIcon(lockIcon: boolean) {
    this.paymentLockIcon.next(lockIcon);
  }

  setPromoCodeCpf(promoCode: any) {
    this.setCpfPromoCode.next(promoCode);
  }

  /** This method restrict browser's backbutton action */
  preventBackButton(): Observable<Event> {
    history.pushState(null, "null", window.location.href);
    return fromEvent(window, 'popstate')
      .pipe(tap(res => {
        history.pushState(null, "null", window.location.href);
      })
      );
  }

  handlingMobileAppNavigationUrlHistory(event) {
    if (!this.isBackClicked && !event.url.includes('/accounts/update-bank')) {
      this.urlHistory.currentUrl && this.urlHistory.previousUrl.push(this.urlHistory.currentUrl);
      this.urlHistory.currentUrl = event.url;
    }
    if (this.isBackClicked) {
      this.isBackClicked = false;
    }
  }

  clearUrlHistory() {
    this.urlHistory = { currentUrl: null, previousUrl: [] };
  }

}
