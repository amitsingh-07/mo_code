import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private pageTitle = new BehaviorSubject('');
  private pageSubTitle = new BehaviorSubject('');
  private pageHelpIcon = new BehaviorSubject(true);
  private mobileModal = new BehaviorSubject(event);
  private headerVisibility = new BehaviorSubject(true);

  currentPageTitle = this.pageTitle.asObservable();
  currentPageSubTitle = this.pageSubTitle.asObservable();
  currentPageHelpIcon = this.pageHelpIcon.asObservable();
  currentHeaderVisibility = this.headerVisibility.asObservable();
  currentMobileModalEvent: any;

  constructor() { }

  setPageTitle(title: string, subTitle?: string, helpIcon?: boolean) {
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
    this.headerVisibility.next(true);
  }

  setHeaderVisibility(isVisible: boolean) {
    this.headerVisibility.next(isVisible);
  }

  // Showing Mobile PopUp Trigger
  showMobilePopUp(event) {
    console.log('Showing Mobile Popup -- Service Call');
    this.mobileModal.next(event);
  }
  initMobilePopUp() {
    this.currentMobileModalEvent = this.mobileModal.asObservable();
  }
}
