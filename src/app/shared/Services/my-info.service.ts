import { HttpParams } from '@angular/common/http';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { appConstants } from '../../app.constants';
import { environment } from '../../../environments/environment';
import { ApiService } from '../http/api.service';
import { ErrorModalComponent } from '../modal/error-modal/error-modal.component';
import { ModelWithButtonComponent } from '../modal/model-with-button/model-with-button.component';
import { SIGN_UP_ROUTES, SIGN_UP_ROUTE_PATHS } from './../../sign-up/sign-up.routes.constants';
import { CapacitorUtils } from '../utils/capacitor.util';
import { CapacitorPluginService } from './capacitor-plugin.service';
import { Util } from '../utils/util';

const MYINFO_ATTRIBUTE_KEY = 'myinfo_person_attributes';
declare var window: Window;

const CANCELLED = -2;
const FAILED = -1;
const SUCCESS = 1;

@Injectable({
  providedIn: 'root'
})
export class MyInfoService implements OnDestroy {

  changeListener = new Subject();
  authApiUrl = environment.myInfoAuthorizeUrl;
  clientId = environment.myInfoClientId;
  private attributes = '';
  private myInfoServices = '';
  purpose = 'financial planning and advisory.';
  redirectUrl = environment.myInfoCallbackBaseUrl;
  state = Math.floor(100 + Math.random() * 90);
  myInfoValue: any;
  loadingModalRef: NgbModalRef;
  isMyInfoEnabled = false;
  status;
  windowRef: any;
  getMyInfoDataSubscription: any;
  closeBtnSubscription: any;

  constructor(
    private modal: NgbModal, private apiService: ApiService, private router: Router, private zone: NgZone,
    private capPluginService: CapacitorPluginService,
    public translate: TranslateService
  ) { }

  ngOnDestroy() {
    this.getMyInfoDataSubscription.unsubscribe();
    this.closeBtnSubscription.unsubscribe();
  }

  setMyInfoAttributes(attributes) {
    this.attributes = attributes;
    window.sessionStorage.setItem(MYINFO_ATTRIBUTE_KEY, this.attributes);
  }

  getMyInfoAttributes() {
    return window.sessionStorage.getItem(MYINFO_ATTRIBUTE_KEY);
  }


  setMyInfoAppId(myInfoServices) {
    this.myInfoServices = myInfoServices;
    var clientIdObj, x;
    clientIdObj = this.clientId;
    x = clientIdObj[myInfoServices];
    window.sessionStorage.setItem('myinfo_app_id', x);
  }

  getMyInfoAppId() {
    return window.sessionStorage.getItem('myinfo_app_id');
  }

  goToMyInfo(linkAccount?) {
    this.redirectUrl = CapacitorUtils.isApp ? appConstants.MOBILE_APP_SCHEME + appConstants.BASE_HREF + appConstants.MY_INFO_CALLBACK_URL : this.redirectUrl;
    let currentUrl = window.location.toString();
    let endPoint = currentUrl.split(currentUrl.split('/')[2])[currentUrl.split(currentUrl.split('/')[2]).length - 1].substring(1);
    window.sessionStorage.setItem('currentUrl', endPoint);
    let authoriseUrl = this.authApiUrl +
      '?client_id=' + this.getMyInfoAppId() +
      '&attributes=' + this.getMyInfoAttributes() +
      '&purpose=' + this.purpose +
      '&state=' + this.state +
      '&redirect_uri=' + this.redirectUrl;
    if (CapacitorUtils.isApp) {
      this.capPluginService.checkCameraPhotoPermission('camera').then((status) => {
        if (status) {
          Util.openExternalUrl(encodeURI(authoriseUrl));
        }
      });
    }
    else {
      this.newWindow(authoriseUrl, linkAccount);
    }
  }

  goToUAT1MyInfo() {
    window.sessionStorage.setItem('currentUrl', window.location.hash.split(';')[0]);
    const authoriseUrl = 'https://bfa-uat.ntucbfa.com/9462test-myinfo?project=robo2';
    this.newWindow(authoriseUrl);
  }

  newWindow(authoriseUrl, linkAccount?): void {
    const self = this;
    setTimeout(() => {
      this.openFetchPopup(linkAccount);
    }, 500);

    this.isMyInfoEnabled = true;

    this.windowRef = window.open(authoriseUrl);
    const timer = setInterval(() => {
      if (this.windowRef.closed) {
        clearInterval(timer);
        this.setFailedStatus();
      }
    }, 500);

    window.failed = (value) => {
      clearInterval(timer);
      window.failed = () => null;
      this.windowRef.close();
      if (value === 'FAILED') {
        this.setFailedStatus();
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
        this.setSuccessStatus(myInfoAuthCode);
      } else {
        this.setFailedStatus();
      }
      return 'MY_INFO';
    };

    // Robo2 - MyInfo changes
    window.addEventListener('message', function (event) {
      clearInterval(timer);
      window.success = () => null;
      if (event.data !== "recaptcha-setup") {
        self.robo2SetMyInfo(event.data);
      }
      return 'MY_INFO';
    });
  }

  setFailedStatus() {
    this.status = 'FAILED';
    this.changeListener.next(this.getMyinfoReturnMessage(FAILED));
  }

  setSuccessStatus(code) {
    this.status = 'SUCCESS';
    this.changeListener.next(this.getMyinfoReturnMessage(SUCCESS, code));
  }

  robo2SetMyInfo(myInfoAuthCode) {
    if (myInfoAuthCode && myInfoAuthCode.indexOf('-') !== -1) {
      if (!this.windowRef.closed) {
        this.windowRef.close();
      }
      this.router.navigate(['myinfo'], { queryParams: { code: myInfoAuthCode } });
    } else {
      this.setFailedStatus();
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
      this.loadingModalRef.componentInstance.errorTitle = this.translate.instant("MYINFO.LINK_ACCOUNT.TITLE");
      this.loadingModalRef.componentInstance.errorMessage = this.translate.instant("MYINFO.LINK_ACCOUNT.DESCRIPTION");
    } else {
      this.loadingModalRef.componentInstance.errorTitle = this.translate.instant("MYINFO.LINK_MODAL_DATA.TITLE");
      this.loadingModalRef.componentInstance.errorMessage = this.translate.instant("MYINFO.LINK_MODAL_DATA.DESCRIPTION");
    }
    this.loadingModalRef.componentInstance.primaryActionLabel = this.translate.instant("MYINFO.CANCEL_MODAL.BTN-TEXT");
    this.closeBtnSubscription = this.loadingModalRef.componentInstance.closeAction.subscribe(() => {
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
      const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'my-info' });
      ref.componentInstance.errorTitle = this.translate.instant("MYINFO.ERROR_MODAL_DATA.TITLE");
      ref.componentInstance.errorMessage = this.translate.instant("MYINFO.ERROR_MODAL_DATA.DESCRIPTION");
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
      appId: this.getMyInfoAppId(),
      authorizationCode: this.myInfoValue,
      personAttributes: this.getMyInfoAttributes(),
      isMobileApp: CapacitorUtils.isApp
    };
    return this.apiService.getMyInfoData(code);
  }

  // singpass account link
  getSingpassAccountData() {
    const code = {
      appId: this.getMyInfoAppId(),
      authorizationCode: this.myInfoValue,
      personAttributes: this.getMyInfoAttributes(),
      isMobileApp: CapacitorUtils.isApp
    };
    return this.apiService.getSingpassAccountData(code);
  }

  // CREATE ACCOUNT
  getMyInfoAccountCreateData() {
    const code = {
      appId: this.getMyInfoAppId(),
      authorizationCode: this.myInfoValue,
      personAttributes: this.getMyInfoAttributes(),
      isMobileApp: CapacitorUtils.isApp
    };
    return this.apiService.getCreateAccountMyInfoData(code);
  }

  // CREATE ACCOUNT FOR CORPBIZ USERS
  getCorpBizMyInfoAccountCreateData(email, mobile, isOrganisationEnabled) {
    const payload = {
      authorizationCode: this.myInfoValue,
      personAttributes: this.getMyInfoAttributes(),
      appId: this.getMyInfoAppId(),
      isCorpBizUser: true,
      organisationCode: isOrganisationEnabled ? appConstants.USERTYPE.FACEBOOK : null,
      email: email,
      mobileNumber: mobile,
      profileType: isOrganisationEnabled ? appConstants.USERTYPE.CORPORATE : appConstants.USERTYPE.PUBLIC,
      isMobileApp: CapacitorUtils.isApp
    };
    return this.apiService.getCreateAccountMyInfoData(payload);
  }

  // Check if the source page matches with the session stored one
  checkMyInfoSourcePage() {
    const currentUrl = window.location.toString();
    const currentPath = currentUrl.split(currentUrl.split('/')[2])[currentUrl.split(currentUrl.split('/')[2]).length - 1].substring(1);
    if (this.getMyInfoAttributes() === appConstants.CHECK_MYINFO_INSURANCE_ATTRIBUTES
      && window.sessionStorage.getItem('currentUrl') === currentPath) {
      return true;
    } else {
      return false;
    }
  }

  mobileMyInfoCheck(code) {
    if (this.myInfoValue !== code) {
      this.isMyInfoEnabled = true;
      this.setMyInfoValue(code);
      if (window.sessionStorage.getItem('currentUrl').includes(SIGN_UP_ROUTES.EDIT_PROFILE)) {
        this.openFetchPopup(true);
      } else {
        this.openFetchPopup();
      }
      this.zone.run(() => {
        this.router.navigate([window.sessionStorage.getItem('currentUrl')]).then(() => {
          this.setSuccessStatus(code);
        });
      });
    }
  }

}
