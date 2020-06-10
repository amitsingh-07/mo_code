import { browser } from 'protractor';

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { FooterService } from '../../shared/footer/footer.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { CustomErrorHandlerService } from '../../shared/http/custom-error-handler.service';
import {
  EditMobileNumberComponent
} from '../../shared/modal/edit-mobile-number/edit-mobile-number.component';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { Util } from '../../shared/utils/util';
import { WillWritingService } from '../../will-writing/will-writing.service';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { appConstants } from './../../../app/app.constants';
import { AppService } from './../../../app/app.service';
import { DirectService } from './../../direct/direct.service';
import { GuideMeService } from './../../guide-me/guide-me.service';

@Component({
  selector: 'app-verify-mobile',
  templateUrl: './verify-mobile.component.html',
  styleUrls: ['./verify-mobile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class VerifyMobileComponent implements OnInit {
  private errorModal = {};
  private loading = {};

  verifyMobileForm: FormGroup;
  mobileNumber: any;
  mobileNumberVerifiedMessage: string;
  showCodeSentText = false;
  mobileNumberVerified: boolean;
  progressModal: boolean;
  newCodeRequested: boolean;
  editProfile: boolean;
  fromLoginPage: string;

  constructor(
    private formBuilder: FormBuilder,
    public navbarService: NavbarService,
    private modal: NgbModal,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private router: Router,
    private translate: TranslateService,
    private errorHandler: CustomErrorHandlerService,
    public authService: AuthenticationService,
    private selectedPlansService: SelectedPlansService,
    private willWritingService: WillWritingService,
    private directService: DirectService,
    private guidemeService: GuideMeService,
    private appService: AppService) {
    this.translate.use('en');
    this.translate.get('VERIFY_MOBILE').subscribe((result: any) => {
      this.errorModal['title'] = result.ERROR_MODAL.ERROR_TITLE;
      this.errorModal['message'] = result.ERROR_MODAL.ERROR_MESSAGE;
      this.errorModal['expiredTitle'] = result.EXPIRED_ERROR_MODAL.ERROR_TITLE;
      this.errorModal['expiredMessage'] = result.EXPIRED_ERROR_MODAL.ERROR_MESSAGE;
      this.loading['verifying'] = result.LOADING.VERIFYING;
      this.loading['verified'] = result.LOADING.VERIFIED;
      this.loading['sending'] = result.LOADING.SENDING;
      this.loading['verified2fa'] = result.LOADING.VERIFIED2FA;
    });
  }

  ngOnInit() {
    this.progressModal = false;
    this.mobileNumberVerified = false;
    this.editProfile = this.signUpService.getAccountInfo().editContact;
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(101);
    this.footerService.setFooterVisibility(false);
    this.buildVerifyMobileForm();
    this.fromLoginPage = this.signUpService.getFromLoginPage();
    if (this.fromLoginPage) {
      this.mobileNumber = {
        code: '+65',
        number: this.signUpService.getUserMobileNo()
      };
    } else {
      this.mobileNumber = this.signUpService.getMobileNumber();
    }


    if (this.authService.getFromJourney(SIGN_UP_ROUTE_PATHS.EDIT_PROFILE)) {
      this.editProfile = true;
    }
  }

  /**
   * build verify mobile number form.
   */
  buildVerifyMobileForm() {
    this.verifyMobileForm = this.formBuilder.group({
      otp1: ['', [Validators.required, Validators.pattern(RegexConstants.OTP)]],
      otp2: ['', [Validators.required, Validators.pattern(RegexConstants.OTP)]],
      otp3: ['', [Validators.required, Validators.pattern(RegexConstants.OTP)]],
      otp4: ['', [Validators.required, Validators.pattern(RegexConstants.OTP)]],
      otp5: ['', [Validators.required, Validators.pattern(RegexConstants.OTP)]],
      otp6: ['', [Validators.required, Validators.pattern(RegexConstants.OTP)]]
    });
  }

  /**
   * verify user mobile number.
   */
  save(form: any) {
    if (form.valid) {
      const otpArr = [];
      for (const value of Object.keys(form.value)) {
        otpArr.push(form.value[value]);
        if (value === 'otp6') {
          const otp = otpArr.join('');
          if (this.authService.getFromJourney(SIGN_UP_ROUTE_PATHS.EDIT_PROFILE)) {
            console.log('Calling Verity 2FA');
            this.verify2FA(otp);
          } else {
            console.log('Calling Verity OTP');
            this.verifyOTP(otp);
          }
        }
      }
    }
  }

  /**
   * verify user mobile number.
   * @param code - one time password.
   */
  verifyOTP(otp) {
    this.progressModal = true;
    this.mobileNumberVerifiedMessage = this.loading['verifying'];
    this.signUpApiService.verifyOTP(otp, this.editProfile).subscribe((data: any) => {
      if (data.responseMessage.responseCode === 6003) {
        this.mobileNumberVerified = true;
        this.mobileNumberVerifiedMessage = this.loading['verified'];
      } else if (data.responseMessage.responseCode === 5007 || data.responseMessage.responseCode === 5009) {
        const title = data.responseMessage.responseCode === 5007 ? this.errorModal['title'] : this.errorModal['expiredTitle'];
        const message = data.responseMessage.responseCode === 5007 ? this.errorModal['message'] : this.errorModal['expiredMessage'];
        const showErrorButton = data.responseMessage.responseCode === 5007 ? true : false;
        this.openErrorModal(title, message, showErrorButton);
      } else {
        this.progressModal = false;
        this.errorHandler.handleCustomError(data, true);
      }
    });
  }

  /**
   * verify 2fa mobile number
   * @param code - 2fa otp.
   */
  verify2FA(otp) {
    this.progressModal = true;
    this.mobileNumberVerifiedMessage = this.loading['verifying'];
    this.authService.doValidate2fa(otp).subscribe((data: any) => {
      if (data.responseMessage.responseCode === 6011) {
        this.mobileNumberVerified = true;
        this.authService.set2FAToken(data.responseMessage.responseCode);
        this.mobileNumberVerifiedMessage = this.loading['verified2fa'];
        this.authService.setFromJourney(SIGN_UP_ROUTE_PATHS.EDIT_PROFILE, false);
      } else if (data.responseMessage.responseCode === 5123 || data.responseMessage.responseCode === 5009) {
        const title = data.responseMessage.responseCode === 5123 ? this.errorModal['title'] : this.errorModal['expiredTitle'];
        const message = data.responseMessage.responseCode === 5123 ? this.errorModal['message'] : this.errorModal['expiredMessage'];
        this.openErrorModal(title, message, false);
      } else {
        this.progressModal = false;
        this.errorHandler.handleCustomError(data, true);
      }
    });
  }

  /**
   * request a new OTP.
   */
  requestNewCode() {
    this.progressModal = true;
    if (this.authService.getFromJourney(SIGN_UP_ROUTE_PATHS.EDIT_PROFILE)) {
      console.log('Triggering New Verify 2FA');
      this.requestNew2faOTP();
    } else {
      console.log('Triggering New Verify OTP');
      this.requestNewVerifyOTP();
    }
  }

  requestNewVerifyOTP() {
    this.signUpApiService.requestNewOTP(this.editProfile).subscribe((data) => {
      this.verifyMobileForm.reset();
      this.progressModal = false;
      this.showCodeSentText = true;
    });
  }
  /** 
   * request a new 2fa OTP
   */
  requestNew2faOTP() {
    this.progressModal = true;
    this.mobileNumberVerifiedMessage = this.loading['sending'];
    this.authService.send2faRequest().subscribe((data) => {
      this.verifyMobileForm.reset();
      this.progressModal = false;
      this.showCodeSentText = true;
    });
  }

  /**
   * redirect to password creation page.
   */
  redirectToPasswordPage() {
    const redirect_url = this.signUpService.getRedirectUrl();
    const journeyType = this.appService.getJourneyType();
    if (redirect_url && redirect_url === SIGN_UP_ROUTE_PATHS.EDIT_PROFILE) {
      this.signUpService.clearRedirectUrl();
      this.router.navigate([SIGN_UP_ROUTE_PATHS.ACCOUNT_UPDATED]);
    } else if (journeyType) {
        if (journeyType === appConstants.JOURNEY_TYPE_COMPREHENSIVE) {
          this.sendWelcomeEmail();
        }
        this.resendEmailVerification();
    } else if (redirect_url) {
      // Do a final redirect
      this.signUpService.clearRedirectUrl();
      const brokenRoute = Util.breakdownRoute(redirect_url);
      this.router.navigate([brokenRoute.base], {
        fragment: brokenRoute.fragments != null ? brokenRoute.fragments : null,
        preserveFragment: true,
        queryParams: brokenRoute.params != null ? brokenRoute.params : null,
        queryParamsHandling: 'merge',
      });
    }
  }

  sendWelcomeEmail() {
    const mobileNo = this.mobileNumber.number.toString();
    this.signUpApiService.sendWelcomeEmail(mobileNo, false).subscribe((data) => { });
  }

  resendEmailVerification() {
    const mobileNo = this.mobileNumber.number.toString();
    this.signUpApiService.resendEmailVerification(mobileNo, false).subscribe((data) => {
      if (data.responseMessage.responseCode === 6007) {
        this.signUpService.clearData();
        this.selectedPlansService.clearData();
        this.willWritingService.clearServiceData();
        this.directService.clearServiceData();
        this.guidemeService.clearServiceData();
        if (this.signUpService.getUserMobileNo() || this.fromLoginPage) {
          this.signUpService.removeFromLoginPage();
        }
        this.router.navigate([SIGN_UP_ROUTE_PATHS.ACCOUNT_CREATED]);
      }
    });
  }

  /**
   * redirect to create account page.
   */
  editNumber() {
    if (this.editProfile) {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.UPDATE_USER_ID]);
    } else {
      const ref = this.modal.open(EditMobileNumberComponent, {
        centered: true, backdrop: 'static',
        keyboard: false
      });
      ref.componentInstance.existingMobile = this.mobileNumber.number.toString();
      ref.componentInstance.updateMobileNumber.subscribe((mobileNo) => {
        this.signUpApiService.editMobileNumber(mobileNo).subscribe((data) => {
          ref.close();
          if (data.responseMessage.responseCode === 6000) {
            this.mobileNumber.number = mobileNo.toString();
            this.signUpService.updateMobileNumber(this.mobileNumber.code,
              mobileNo.toString());
            if (data.objectList[0] && data.objectList[0].customerRef) {
              this.signUpService.setCustomerRef(data.objectList[0].customerRef);
            }
          } else {
            const Modalref = this.modal.open(ErrorModalComponent, { centered: true });
            Modalref.componentInstance.errorMessage = data.responseMessage.responseDescription;
          }
        });
      });
    }
  }

  /**
   * restrict to enter numeric value.
   * @param currentElement - current element to check numeric value.
   * @param nextElement - next elemet to focus.
   */
  onlyNumber(currentElement, nextElement) {
    const elementName = currentElement.getAttribute('formcontrolname');
    currentElement.value = currentElement.value.replace(RegexConstants.OnlyNumeric, '');
    if (currentElement.value.length > 1) {
      currentElement.value = currentElement.value.charAt(0);
    }
    this.verifyMobileForm.controls[elementName].setValue(currentElement.value);
    if (currentElement.value && nextElement !== undefined && nextElement !== 'undefined') {
      nextElement.focus();
    }
  }

  /**
   * open invalid otp error modal.
   * @param title - title for error modal.
   * @param message - error description for error modal time password.
   * @param showErrorButton - show try again button or not.
   */
  openErrorModal(title, message, showErrorButton) {
    this.progressModal = false;
    const error = {
      errorTitle: title,
      errorMessage: message
    };
    const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'otp-error-modal' });
    ref.componentInstance.errorTitle = error.errorTitle;
    ref.componentInstance.errorMessage = error.errorMessage;
    ref.componentInstance.showErrorButton = showErrorButton;
    ref.result.then(() => {
      this.verifyMobileForm.reset();
    }).catch((e) => {
      this.verifyMobileForm.reset();
    });
  }

}
