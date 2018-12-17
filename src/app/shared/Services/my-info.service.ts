import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiService } from '../http/api.service';
import { ErrorModalComponent } from '../modal/error-modal/error-modal.component';

const MYINFO_ATTRIBUTE_KEY = 'myinfo_person_attributes';
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
  purpose = 'demonstrating MyInfo APIs';
  redirectUrl = environment.myInfoCallbackBaseUrl;
  state = Math.floor(100 + Math.random() * 90);
  myInfoValue: any;
  loadingModalRef: NgbModalRef;
  isMyInfoEnabled = false;
  status;
  constructor(
    private modal: NgbModal, private apiService: ApiService, private router: Router) { }

  setMyInfoAttributes(attributes) {
    this.attributes = attributes;
    window.sessionStorage.setItem(MYINFO_ATTRIBUTE_KEY, this.attributes);
  }

  getMyInfoAttributes() {
    return window.sessionStorage.getItem(MYINFO_ATTRIBUTE_KEY);
  }

  goToMyInfo() {
    window.sessionStorage.setItem('currentUrl', window.location.hash.split(';')[0]);
    const authoriseUrl = this.authApiUrl +
      '?client_id=' + this.clientId +
      '&attributes=' + this.getMyInfoAttributes() +
      '&purpose=' + this.purpose +
      '&state=' + this.state +
      '&redirect_uri=' + this.redirectUrl;
    this.newWindow(authoriseUrl);
  }

  goToUAT1MyInfo() {
    window.sessionStorage.setItem('currentUrl', window.location.hash.split(';')[0]);
    const authoriseUrl = 'https://bfa-uat.ntucbfa.com/#/9462test-myinfo?project=robo2';
    this.newWindow(authoriseUrl);
  }

  newWindow(authoriseUrl): void {
    this.openFetchPopup();
    this.isMyInfoEnabled = true;
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const left = 0;
    const top = 0;
    // tslint:disable-next-line:max-line-length
    // Todo - Robo2 changes
    // const windowRef: Window = window.open(authoriseUrl, 'SingPass', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + screenWidth + ', height=' + screenHeight + ', top=' + top + ', left=' + left);
    const windowRef: Window = window.open(authoriseUrl);

    const timer = setInterval(() => {
      if (windowRef.closed) {
        clearInterval(timer);
        this.status = 'FAILED';
        this.changeListener.next(this.getMyinfoReturnMessage(FAILED));
      }
    }, 500);

    window.failed = (value) => {
      clearInterval(timer);
      window.failed = () => null;
      windowRef.close();
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
      windowRef.close();
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
    window.addEventListener('message', function(event) {
      console.log('received: ' + event.data);
      clearInterval(timer);
      window.success = () => null;
      windowRef.close();
      robo2SetMyInfo(event.data);
      return 'MY_INFO';
    });
    function robo2SetMyInfo(myInfoAuthCode) {
      if (myInfoAuthCode && myInfoAuthCode.indexOf('-') !== -1) {
        //this.router.navigate(['myinfo'], { queryParams: { code: myInfoAuthCode}});
        window.location.href = '/#/myinfo?code=' + myInfoAuthCode;
      } else {
        this.status = 'FAILED';
        this.changeListener.next(this.getMyinfoReturnMessage(FAILED));
      }
    }
    // Robo2 - MyInfo changes - End
  }

  getMyinfoReturnMessage(status: number, code?: string): any {
    if (status === SUCCESS) {
      return { status: 'SUCCESS', authorizeCode: code };
    } else {
      return { status: 'FAILED' };
    }
  }

  openFetchPopup() {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      windowClass: 'hide-close'
    };
    this.loadingModalRef = this.modal.open(ErrorModalComponent, ngbModalOptions);
    this.loadingModalRef.componentInstance.errorTitle = 'Fetching Data...';
    this.loadingModalRef.componentInstance.errorMessage = 'Please be patient while we fetch your required data from MyInfo.';
  }

  closeFetchPopup() {
    this.loadingModalRef.close();
  }

  closeMyInfoPopup(error: boolean) {
    this.isMyInfoEnabled = false;
    this.closeFetchPopup();
    if (error) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = 'Oops, Error!';
      ref.componentInstance.errorMessage = 'We weren’t able to fetch your data from MyInfo.';
      ref.componentInstance.isError = true;
      ref.result.then(() => {
        // Todo - Robo2 MyInfo changes
        // this.goToMyInfo();
        this.goToUAT1MyInfo();
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
}
