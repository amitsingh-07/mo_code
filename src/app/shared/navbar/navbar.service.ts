import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';

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

  existingNavbar = this.navbar.asObservable();
  getNavbarEvent = this.getNavEvent.asObservable();
  currentNavbarMode = this.navbarMode.asObservable();
  currentNavbarVisibility = this.navbarVisibility.asObservable();
  currentNavbarMobileVisibility = this.navbarMobileVisibility.asObservable();
  currentNavbarShadowVisibility = this.navbarShadowVisibility.asObservable();
  currentBackListener = this.backListener.asObservable();

  /* Header Params */
  private pageTitle = new BehaviorSubject('');
  private pageSubTitle = new BehaviorSubject('');
  private pageHelpIcon = new BehaviorSubject(true);
  private pageProdInfoIcon = new BehaviorSubject(false);

  private mobileModal = new BehaviorSubject('');
  private closeProdInfo = new BehaviorSubject('');
  private pageSettingsIcon = new BehaviorSubject(true);
  private pageFilterIcon = new BehaviorSubject(true);

  currentPageTitle = this.pageTitle.asObservable();
  currentPageSubTitle = this.pageSubTitle.asObservable();
  currentPageHelpIcon = this.pageHelpIcon.asObservable();
  currentPageProdInfoIcon = this.pageProdInfoIcon.asObservable();
  currentMobileModalEvent = this.mobileModal.asObservable();
  currentPageSettingsIcon = this.pageSettingsIcon.asObservable();
  currentPageFilterIcon = this.pageFilterIcon.asObservable();

  constructor() { }

  /* Navbar Generic Element Details*/
  setNavbarDetails(navbar: ElementRef) {
    this.navbar.next(navbar);
  }

  getNavbarDetails() {
    this.getNavEvent.next(true);
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

  /* Header Functions*/
  // Setting Page Title
  setPageTitle(title: string, subTitle?: string, helpIcon?: boolean, settingsIcon?: boolean, filterIcon?: boolean) {
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
  }
  // Showing Mobile PopUp Trigger
  showMobilePopUp(event) {
    this.mobileModal.next(event);
  }

  // Hiding Product Info Modal Trigger
  hideProdInfo(event) {
    this.closeProdInfo.next(event);
  }

  backPressed(pageTitle: string) {
    this.backListener.next(pageTitle);
  }

  subscribeBackPress() {
    this.isBackPressSubscribed.next(true);
    return this.currentBackListener;
  }

  unsubscribeBackPress() {
    this.isBackPressSubscribed.next(false);
    this.backListener.next('');
  }
}
