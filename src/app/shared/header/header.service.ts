import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HeaderService {
    private pageTitle = new BehaviorSubject('');
    private pageSubTitle = new BehaviorSubject('');
    private pageHelpIcon = new BehaviorSubject(true);
    private pageProdInfoIcon = new BehaviorSubject(false);
    private mobileModal = new BehaviorSubject('');
    private closeProdInfo = new BehaviorSubject('');
    private headerVisibility = new BehaviorSubject(true);

    currentPageTitle = this.pageTitle.asObservable();
    currentPageSubTitle = this.pageSubTitle.asObservable();
    currentPageHelpIcon = this.pageHelpIcon.asObservable();
    currentPageProdInfoIcon = this.pageProdInfoIcon.asObservable();
    currentMobileModalEvent = this.mobileModal.asObservable();
    currentHeaderVisibility = this.headerVisibility.asObservable();

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
    // Initiate Buttons

    setProdButtonVisibility(isVisible: boolean) {
        this.pageProdInfoIcon.next(isVisible);
    }

    setHeaderVisibility(isVisible: boolean) {
        this.headerVisibility.next(isVisible);
    }

    // Showing Mobile PopUp Trigger
    showMobilePopUp(event) {
        this.mobileModal.next(event);
    }

    // Hiding Product Info Modal Trigger
    hideProdInfo(event) {
        this.closeProdInfo.next(event);
    }
}
