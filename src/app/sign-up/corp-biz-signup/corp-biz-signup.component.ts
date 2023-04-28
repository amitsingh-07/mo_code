import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfigService, IConfig } from '../../config/config.service';
import { MyInfoService } from '../../shared/Services/my-info.service';
import { FooterService } from '../../shared/footer/footer.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SignUpService } from '../sign-up.service';
import { ModelWithButtonComponent } from '../../shared/modal/model-with-button/model-with-button.component';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SIGN_UP_CONFIG } from '../sign-up.constant';
import { AppService } from '../../app.service';
import { appConstants } from '../../app.constants';
import { MyinfoModalComponent } from '../../shared/modal/myinfo-modal/myinfo-modal.component';

@Component({
  selector: 'app-corp-biz-signup',
  templateUrl: './corp-biz-signup.component.html',
  styleUrls: ['./corp-biz-signup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CorpBizSignupComponent implements OnInit {

  secondTimer: any;
  loader2StartTime: any;
  loader1Modal: any;
  loader2Modal: any;
  loader3Modal: any;
  loadingModalRef: NgbModalRef;
  myInfoSubscription: any;
  modalBtnTxt: string;
  myinfoChangeListener: Subscription;
  disabledAttributes: any;
  myinfoModalDesc: string;

  constructor(
    private modal: NgbModal,
    private router: Router,
    private configService: ConfigService,
    private myInfoService: MyInfoService,
    private signUpService: SignUpService,
    private navbarService: NavbarService,
    private footerService: FooterService,
    private readonly translate: TranslateService,
    private appService: AppService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.loader2Modal = this.translate.instant(
        'CORP_BIZ_SIGN_UP.LOADER2'
      );
      this.loader3Modal = this.translate.instant(
        'CORP_BIZ_SIGN_UP.LOADER3'
      );
      this.modalBtnTxt = this.translate.instant(
        'CORP_BIZ_SIGN_UP.MY_INFO_MODAL.BTN'
      );
      this.myinfoModalDesc = this.translate.instant(
        'CORP_BIZ_SIGN_UP.MY_INFO_MODAL.MY_INFO_DESC'
      );
      this.loader1Modal = this.translate.instant(
        'CORP_BIZ_SIGN_UP.LOADER1'
      );
    });

    this.configService.getConfig().subscribe((config: IConfig) => {
      this.loader2StartTime = config.account.loaderStartTime * 1000;
    });
  }

  ngOnInit(): void {
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(106);
    this.footerService.setFooterVisibility(false);

    this.myinfoChangeListener = this.myInfoService.changeListener.subscribe((myinfoObj: any) => {
      let attributeList = this.signUpService.corpBizMyInfoAttributes;
      if (this.disabledAttributes) {
        attributeList = this.removeMyInfoAttributes(this.disabledAttributes.cpfHousingFlag, SIGN_UP_CONFIG.EXCLUDABLE_CORP_BIZ_MY_INFO_ATTRIBUTES.CPF_HOUSING_WITHDRAWAL, attributeList);
        attributeList = this.removeMyInfoAttributes(this.disabledAttributes.vehicleFlag, SIGN_UP_CONFIG.EXCLUDABLE_CORP_BIZ_MY_INFO_ATTRIBUTES.VEHICLES, attributeList);
      }
      if (myinfoObj && myinfoObj !== '' &&
        (this.myInfoService.getMyInfoAttributes() === this.signUpService.corpBizMyInfoAttributes.join() ||
          (this.disabledAttributes &&
            (attributeList.join() === this.myInfoService.getMyInfoAttributes())
          ))) {
        if (myinfoObj.status && myinfoObj.status === SIGN_UP_CONFIG.CREATE_ACCOUNT_STATIC.SUCCESS && this.myInfoService.isMyInfoEnabled) {
          this.getMyInfoAccountCreateData();
        } else if (myinfoObj.status && myinfoObj.status === SIGN_UP_CONFIG.CREATE_ACCOUNT_STATIC.CANCELLED) {
          this.cancelMyInfo();
        } else {
          this.closeMyInfoPopup(false);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.myinfoChangeListener) {
      this.myinfoChangeListener.unsubscribe();
    }
  }

  getMyInfoAccountCreateData() {
    this.showFetchPopUp();
    let email = this.appService.getCorpBizData()?.email;
    let mobile = this.appService.getCorpBizData()?.mobileNumber;
    this.myInfoSubscription = this.myInfoService.getCorpBizMyInfoAccountCreateData(email, mobile, false)
      .subscribe((data) => {
        if (data.responseMessage.responseCode === 6000 && data && data.objectList[0]) {
          this.closeMyInfoPopup(false);
          if (Object.keys(this.signUpService.getCorpBizUserMyInfoData()).length > 0) {
            this.signUpService.clearCorpbizSessionData();
          }
          this.signUpService.setCorpBizMyInfoStatus(true);
          this.signUpService.setCreateAccountMyInfoFormData(data.objectList[0],email,mobile);
          this.signUpService.loadCorpBizUserMyInfoData(data.objectList[0]);
          this.router.navigate([SIGN_UP_ROUTE_PATHS.CORP_BIZ_SIGNUP_DATA]);
        } else if (data.responseMessage.responseCode === 6014) {
          this.closeMyInfoPopup(false);
          const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
          ref.componentInstance.errorTitle = this.loader1Modal.title;
          ref.componentInstance.errorMessageHTML = this.loader1Modal.message;
          ref.componentInstance.primaryActionLabel = this.loader1Modal.btn;
        }
        else {
          this.closeMyInfoPopup(true);
        }
      }, (error) => {
        this.closeMyInfoPopup(true);
      });
  }

  redirectToLogin() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
  }

  getMyInfo(attributesFlags: any) {
    let attributes = this.signUpService.corpBizMyInfoAttributes;
    if (attributesFlags) {
      attributes = this.removeMyInfoAttributes(attributesFlags.cpfHousingFlag, SIGN_UP_CONFIG.EXCLUDABLE_CORP_BIZ_MY_INFO_ATTRIBUTES.CPF_HOUSING_WITHDRAWAL, attributes);
      attributes = this.removeMyInfoAttributes(attributesFlags.vehicleFlag, SIGN_UP_CONFIG.EXCLUDABLE_CORP_BIZ_MY_INFO_ATTRIBUTES.VEHICLES, attributes);
    }
    this.myInfoService.setMyInfoAttributes(attributes);
    this.myInfoService.setMyInfoAppId(appConstants.MYINFO_CORPBIZ_SIGNUP);
    this.myInfoService.goToMyInfo(); // Method to call MyInfo
  }

  removeMyInfoAttributes(flag: any, attribute: any, attributes: any) {
    let attributeList = JSON.parse(JSON.stringify(attributes));
    if (!flag) {
      attributeList = attributeList.filter(attr => !attr.includes(attribute));
    }
    return attributeList;
  }

  proceedToMyInfo() {
    const ref = this.modal.open(MyinfoModalComponent, { centered: true });
    ref.componentInstance.primaryActionLabel = this.modalBtnTxt;
    ref.componentInstance.modalDesc = this.myinfoModalDesc;
    ref.componentInstance.myInfoEnableFlags.subscribe((value: any) => {
      ref.result
        .then(() => {
          this.disabledAttributes = value;
          this.getMyInfo(value);
        })
        .catch((e) => { });
    });
  }

  showFetchPopUp() {
    this.secondTimer = setTimeout(() => {
      if (this.myInfoService.loadingModalRef) {
        this.openSecondPopup();
      }
    }, this.loader2StartTime);
  }

  openSecondPopup() {
    this.myInfoService.loadingModalRef.componentInstance.errorMessage = this.loader2Modal.message;
  }

  closeMyInfoPopup(error: boolean) {
    this.myInfoService.closeMyInfoPopup(false);
    clearTimeout(this.secondTimer);
    if (error) {
      const ngbModalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        centered: true,
      };
      this.loadingModalRef = this.modal.open(ModelWithButtonComponent, ngbModalOptions);
      this.loadingModalRef.componentInstance.errorTitle = this.loader3Modal.title;
      this.loadingModalRef.componentInstance.errorMessage = this.loader3Modal.message;
      this.loadingModalRef.componentInstance.primaryActionLabel = this.loader3Modal.primaryActionLabel;
      this.loadingModalRef.componentInstance.secondaryActionLabel = this.loader3Modal.secondaryActionLabel;
      this.loadingModalRef.componentInstance.secondaryActionDim = true;
      this.loadingModalRef.componentInstance.closeBtn = false;
      this.loadingModalRef.componentInstance.primaryAction.subscribe(() => {
        this.modal.dismissAll();
      });
      this.loadingModalRef.componentInstance.secondaryAction.subscribe(() => {
        this.modal.dismissAll();
        this.skipMyInfo();
      });
    }
  }

  cancelMyInfo() {
    this.myInfoService.isMyInfoEnabled = false;
    this.closeMyInfoPopup(false);
    if (this.myInfoSubscription) {
      this.myInfoSubscription.unsubscribe();
    }
  }

  skipMyInfo() {
    this.signUpService.setCorpBizMyInfoStatus(false);
    this.signUpService.setMyInfoStatus(false);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.CORP_BIZ_CREATE_ACC]);
  }
}
