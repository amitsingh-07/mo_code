import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiService } from '../http/api.service';
import { ErrorModalComponent } from '../modal/error-modal/error-modal.component';
import { ModelWithButtonComponent } from '../modal/model-with-button/model-with-button.component';
import { SIGN_UP_ROUTE_PATHS } from './../../sign-up/sign-up.routes.constants';

const MYINFO_ATTRIBUTE_KEY = 'myinfo_person_attributes';
const CORP_BIZ_MYINFO_ATTRIBUTE_KEY = 'corpbiz_myinfo_person_attributes';
declare var window: Window;

const CANCELLED = -2;
const FAILED = -1;
const SUCCESS = 1;

@Injectable({
  providedIn: 'root'
})
export class MyInfoService {

  changeListener = new Subject();

  authApiUrl = environment.myInfoAuthorizeUrl;
  clientId = environment.myInfoClientId;
  private attributes = '';
  purpose = 'financial planning and advisory.';
  redirectUrl = environment.myInfoCallbackBaseUrl;
  state = Math.floor(100 + Math.random() * 90);
  myInfoValue: any;
  loadingModalRef: NgbModalRef;
  isMyInfoEnabled = false;
  status;
  windowRef: Window;

  constructor(
    private modal: NgbModal, private apiService: ApiService, private router: Router
  ) { }

  setMyInfoAttributes(attributes) {
    this.attributes = attributes;
    window.sessionStorage.setItem(MYINFO_ATTRIBUTE_KEY, this.attributes);
  }

  getMyInfoAttributes() {
    return window.sessionStorage.getItem(MYINFO_ATTRIBUTE_KEY);
  }

  goToMyInfo(linkAccount?) {
    let currentUrl = window.location.toString();
    let endPoint = currentUrl.split(currentUrl.split('/')[2])[currentUrl.split(currentUrl.split('/')[2]).length - 1].substr(1);
    window.sessionStorage.setItem('currentUrl', endPoint);
    const authoriseUrl = this.authApiUrl +
      '?client_id=' + this.clientId +
      '&attributes=' + this.getMyInfoAttributes() +
      '&purpose=' + this.purpose +
      '&state=' + this.state +
      '&redirect_uri=' + this.redirectUrl;
    this.newWindow(authoriseUrl, linkAccount);
  }

  goToUAT1MyInfo() {
    window.sessionStorage.setItem('currentUrl', window.location.hash.split(';')[0]);
    const authoriseUrl = 'https://bfa-uat.ntucbfa.com/9462test-myinfo?project=robo2';
    this.newWindow(authoriseUrl);
  }

  newWindow(authoriseUrl, linkAccount?): void {
    const self = this;
    this.openFetchPopup(linkAccount);
    this.isMyInfoEnabled = true;
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const left = 0;
    const top = 0;
    this.windowRef = window.open(authoriseUrl);

    const timer = setInterval(() => {
      if (this.windowRef.closed) {
        clearInterval(timer);
        this.status = 'FAILED';
        this.changeListener.next(this.getMyinfoReturnMessage(FAILED));
      }
    }, 500);

    window.failed = (value) => {
      clearInterval(timer);
      window.failed = () => null;
      this.windowRef.close();
      if (value === 'FAILED') {
        this.status = 'FAILED';
        this.changeListener.next(this.getMyinfoReturnMessage(FAILED));
      } else {
        this.changeListener.next(this.getMyinfoReturnMessage(CANCELLED));
        this.isMyInfoEnabled = false;
      }
      return 'MY_INFO';
    };

    window.success = (values) => {
      clearInterval(timer);
      window.success = () => null;
      this.windowRef.close();
      const params = new HttpParams({ fromString: values });
      if (window.sessionStorage.currentUrl && params && params.get('code')) {
        const myInfoAuthCode = params.get('code');
        this.setMyInfoValue(myInfoAuthCode);
        this.status = 'SUCCESS';
        this.changeListener.next(this.getMyinfoReturnMessage(SUCCESS, myInfoAuthCode));
      } else {
        this.status = 'FAILED';
        this.changeListener.next(this.getMyinfoReturnMessage(FAILED));
      }
      return 'MY_INFO';
    };

    // Robo2 - MyInfo changes
    // tslint:disable-next-line:only-arrow-functions
    window.addEventListener('message', function (event) {
      console.log('received: ' + event.data);
      clearInterval(timer);
      window.success = () => null;
      self.robo2SetMyInfo(event.data);
      return 'MY_INFO';
    });

  }

  robo2SetMyInfo(myInfoAuthCode) {
    if (myInfoAuthCode && myInfoAuthCode.indexOf('-') !== -1) {
      if (!this.windowRef.closed) {
        this.windowRef.close();
      }
      this.router.navigate(['myinfo'], { queryParams: { code: myInfoAuthCode } });
    } else {
      this.status = 'FAILED';
      this.changeListener.next(this.getMyinfoReturnMessage(FAILED));
    }
  }

  getMyinfoReturnMessage(status: number, code?: string): any {
    if (status === SUCCESS) {
      return { status: 'SUCCESS', authorizeCode: code };
    } else if (status === CANCELLED) {
      return { status: 'CANCELLED' };
    } else {
      return { status: 'FAILED' };
    }
  }

  openFetchPopup(linkAccount?) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      windowClass: 'my-info'
    };
    this.loadingModalRef = this.modal.open(ModelWithButtonComponent, ngbModalOptions);
    this.loadingModalRef.componentInstance.spinner = true;
    this.loadingModalRef.componentInstance.closeBtn = false;
    if (linkAccount) {
      this.loadingModalRef.componentInstance.errorTitle = 'Linking Account…';
      this.loadingModalRef.componentInstance.errorMessage = 'Please be patient while we are linking up your MoneyOwl account.';
    } else {
      this.loadingModalRef.componentInstance.errorTitle = 'Fetching Data...';
      this.loadingModalRef.componentInstance.errorMessage = 'Please be patient while we fetch your required data from Myinfo.';
    }
    this.loadingModalRef.componentInstance.primaryActionLabel = 'Cancel';
    this.loadingModalRef.componentInstance.closeAction.subscribe(() => {
      this.changeListener.next(this.getMyinfoReturnMessage(CANCELLED));
      this.cancelMyInfo();
    });
    this.loadingModalRef.result.then(() => {
      this.changeListener.next(this.getMyinfoReturnMessage(CANCELLED));
      this.cancelMyInfo();
    }).catch((e) => {
    });
  }

  cancelMyInfo() {
    if (!this.windowRef.closed) {
      this.windowRef.close();
    }
    this.loadingModalRef.close();
  }

  closeFetchPopup() {
    if (this.loadingModalRef) {
      this.loadingModalRef.close();
    }
  }

  closeMyInfoPopup(error: boolean) {
    this.isMyInfoEnabled = false;
    this.closeFetchPopup();
    if (error) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'my-info'});
      ref.componentInstance.errorTitle = 'Oops, Unable to Connect';
      ref.componentInstance.errorMessage = 'We are unable to connect to Myinfo temporarily. You may choose to fill in your information manually or try again later.';
      ref.componentInstance.isMyinfoError = true;
      ref.componentInstance.closeBtn = false;
      ref.result.then(() => {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      }).catch((e) => {
      });
    }
  }

  setMyInfoValue(code) {
    this.myInfoValue = code;
  }

  getMyInfoData() {
    const code = {
      authorizationCode: this.myInfoValue,
      personAttributes: this.getMyInfoAttributes()
    };
    return this.apiService.getMyInfoData(code);
  }

  // singpass account link
  getSingpassAccountData() {
    const code = {
      authorizationCode: this.myInfoValue,
      personAttributes: this.getMyInfoAttributes()
    };
    return this.apiService.getSingpassAccountData(code);
  }

  // CREATE ACCOUNT
  getMyInfoAccountCreateData(){
    const code = {
      authorizationCode: this.myInfoValue,
      personAttributes: this.getMyInfoAttributes()
    };
    return this.apiService.getCreateAccountMyInfoData(code);
  }

  // Check if the source page matches with the session stored one
  checkMyInfoSourcePage() {
    const currentUrl = window.location.toString();
    const currentPath = currentUrl.split(currentUrl.split('/')[2])[currentUrl.split(currentUrl.split('/')[2]).length - 1].substr(1);
    if (this.getMyInfoAttributes() === 'cpfbalances'
      && window.sessionStorage.getItem('currentUrl') === currentPath) {
      return true;
    } else {
      return false;
    }
  }

  // Corp Biz Changes
  setCorpBizMyInfoAttributes(attributes) {
    this.attributes = attributes;
    window.sessionStorage.setItem(CORP_BIZ_MYINFO_ATTRIBUTE_KEY, this.attributes);
  }
}
