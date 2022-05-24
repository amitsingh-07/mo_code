import { ModelWithButtonComponent } from './../../shared/modal/model-with-button/model-with-button.component';
import { Location } from '@angular/common';
import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { flatMap } from 'rxjs/operators';

import { SessionsService } from './../../shared/Services/sessions/sessions.service';
import { appConstants } from '../../app.constants';
import { AppService } from '../../app.service';
import { ConfigService, IConfig } from '../../config/config.service';
import {
  INVESTMENT_ACCOUNT_ROUTE_PATHS
} from '../../investment/investment-account/investment-account-routes.constants';
import { InvestmentCommonService } from '../../investment/investment-common/investment-common.service';
import { FooterService } from '../../shared/footer/footer.service';
import { ApiService } from '../../shared/http/api.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { Formatter } from '../../shared/utils/formatter.util';
import { WILL_WRITING_ROUTE_PATHS } from '../../will-writing/will-writing-routes.constants';
import { WillWritingService } from '../../will-writing/will-writing.service';
import { ValidatePassword } from '../create-account/password.validator';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { IEnquiryUpdate } from '../signup-types';
import { COMPREHENSIVE_ROUTE_PATHS } from './../../comprehensive/comprehensive-routes.constants';
import { InvestmentAccountService } from './../../investment/investment-account/investment-account-service';
import { LoaderService } from './../../shared/components/loader/loader.service';
import { HelperService } from './../../shared/http/helper.service';
import { IError } from './../../shared/http/interfaces/error.interface';
import { StateStoreService } from './../../shared/Services/state-store.service';
import { LoginFormError } from './login-form-error';
import { HubspotService } from './../../shared/analytics/hubspot.service';
import { SIGN_UP_CONFIG } from './../sign-up.constant';
import { TermsModalComponent } from './../../shared/modal/terms-modal/terms-modal.component';
import { SingpassApiService } from '../../singpass/singpass.api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private distribution: any;
  private loginFormError: any = new LoginFormError();
  loginForm: FormGroup;
  formValues: any;
  defaultCountryCode;
  countryCodeOptions;
  heighlightMobileNumber;
  captchaSrc: any = '';
  showCaptcha: boolean;
  hideForgotPassword = false;
  duplicateError: any;
  progressModal = false;
  investmentEnquiryId;
  finlitEnabled = false;
  organisationEnabled = false;
  capsOn: boolean;
  capslockFocus: boolean;
  showPasswordLogin = true;
  showSingpassLogin = false;
  singpassEnabled = false;
  @ViewChild('welcomeTitle') welcomeTitle: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.showPasswordLogin = true;
    this.showSingpassLogin = false;
    if (/Android|Windows/.test(navigator.userAgent)) {
      this.welcomeTitle.nativeElement.scrollIntoView(true);
    }
  }

  constructor(
    // tslint:disable-next-line
    private formBuilder: FormBuilder, private appService: AppService,
    private modal: NgbModal, private configService: ConfigService,
    public authService: AuthenticationService,
    public sessionsService: SessionsService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private willWritingService: WillWritingService,
    private _location: Location,
    private translate: TranslateService,
    private apiService: ApiService,
    private selectedPlansService: SelectedPlansService,
    private changeDetectorRef: ChangeDetectorRef,
    private stateStoreService: StateStoreService,
    private investmentAccountService: InvestmentAccountService,
    private loaderService: LoaderService,
    private investmentCommonService: InvestmentCommonService,
    private hubspotService: HubspotService,
    private helper: HelperService,
    private singpassService: SingpassApiService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.duplicateError = this.translate.instant('COMMON.DUPLICATE_ERROR');
      this.route.queryParams.subscribe((qp) => {
        console.log('Get Router Params:', this.route.snapshot.queryParams);
        if(qp['code'] && qp['state']) {
          console.log("IM INSIDE "+ "code = "+qp['code']+ "state = "+ qp['state'])
          this.loginBySingpass();
        }
      });
    });
    this.route.params.subscribe((params) => {
      this.heighlightMobileNumber = params.heighlightMobileNumber;
    });
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.distribution = config.distribution;
    });
    if (route.snapshot.data[0]) {
      this.finlitEnabled = route.snapshot.data[0]['finlitEnabled'];
      this.organisationEnabled = route.snapshot.data[0]['organisationEnabled'];
      this.singpassEnabled = route.snapshot.data[0]['singpassEnabled'];
      this.appService.clearJourneys();
      this.appService.clearPromoCode();
    }   
    this.appService.setCorporateDetails({organisationEnabled: this.organisationEnabled, uuid: this.route.snapshot.queryParams.orgID || null});
    this.signUpService.removeUserType();
    if(this.authService.isSignedUserWithRole(SIGN_UP_CONFIG.ROLE_2FA)) {
      this.authService.clearTokenID();
      this.signUpService.removeFromLoginPage();
      this.signUpService.removeFromMobileNumber();
    }
    // Check if mobile device and set last login type
    this.getSetLoginPref();
  }
  /**
    * Initialize tasks.
    */
  ngOnInit() {
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(101);
    this.footerService.setFooterVisibility(false);
    this.investmentEnquiryId = this.authService.getEnquiryId();
    this.buildLoginForm();
    if (!this.authService.isAuthenticated()) {
      this.loaderService.showLoader({ title: 'Loading' });
      const userInfo = this.signUpService.getUserProfileInfo();
      if (userInfo) {
        this.signUpService.setUserProfileInfo(null);
        this.sessionsService.destroyInstance();
        this.authService.clearSession();
        this.sessionsService.createNewActiveInstance();
        this.authService.clearAuthDetails();
        this.navbarService.logoutUser();
        this.appService.clearData();
        this.appService.startAppSession();
        this.authService.authenticate().subscribe((token) => {
          this.loaderService.hideLoader();
          const customError: IError = {
            error: [],
            message: 'Your session has unexpectedly expired. Please login again'
          };
          this.helper.showCustomErrorModal(customError);
        });
      } else {
        this.authService.authenticate().subscribe((token) => {
          if (this.organisationEnabled && this.route.snapshot.queryParams.orgID) {
            this.getOrganisationCode();
          }
          this.loaderService.hideLoader();
        });
      }
    } else if (this.organisationEnabled && this.route.snapshot.queryParams.orgID) {
        this.getOrganisationCode();      
    }
    this.signUpService.setModalShownStatus('');
    if (this.organisationEnabled) {
        this.openTermsOfConditions();
    }
  }

  ngAfterViewInit() {
    if (this.signUpService.getCaptchaShown()) {
      this.setCaptchaValidator();
    }
    if (this.singpassEnabled) {
      this.initSingpassQR();
    }
  }

  async initSingpassQR() {
      const authParamsSupplier = async () => {
        const promise = await this.singpassService.getStateNonce().toPromise().catch(() => {
          // Error handling when app api fail
          console.log("Implement a nervous system check for this.");
        });
        return promise['objectList'][0];
      }
      this.singpassService.initSingpassAuthSession(authParamsSupplier);
  }

  setCaptchaValidator() {
    this.showCaptcha = true;
    const captchaControl = this.loginForm.controls['captchaValue'];
    captchaControl.setValidators([Validators.required]);
    this.refreshCaptcha();
  }

  /**
   * show / hide password field.
   * @param el - selected element.
   */
  showHidePassword(el) {
    if (el.type === 'password') {
      el.type = 'text';
    } else {
      el.type = 'password';
    }
  }

  /**
   * build login form.
   */
  buildLoginForm() {
    this.formValues = this.signUpService.getLoginInfo();
    if (this.distribution) {
      if (this.distribution.login) {
        this.loginForm = this.formBuilder.group({
          loginUsername: [this.formValues.loginUsername, [Validators.required, Validators.pattern(this.distribution.login.phoneRegex)]],
          loginPassword: [this.formValues.loginPassword, [Validators.required]],
          organisationCode: [null, this.organisationEnabled ? [Validators.required] : []],
          captchaValue: ['']
        });
        return false;
      }
    }
    let emailValidators = [Validators.required, Validators.pattern(RegexConstants.EmailOrMobile), this.signUpService.emailDomainValidator(this.organisationEnabled)];
    this.loginForm = this.formBuilder.group({
      loginUsername: [this.formValues.loginUsername, emailValidators],
      loginPassword: [this.formValues.loginPassword, [Validators.required]],
      organisationCode: [null, this.organisationEnabled ? [Validators.required] : []],
      captchaValue: ['']
    });
    if (this.finlitEnabled) {
      this.loginForm.addControl('accessCode', new FormControl(this.formValues.accessCode, [Validators.required]));
    }
    
    this.loginForm.get('organisationCode').valueChanges.subscribe(val => {
      if (val) {
        this.signUpService.organisationName = val;
      }
    })
    return true;
  }

  openTermsOfConditions() {
    if (localStorage.getItem('onInit') !== 'true') {
      const ref = this.modal.open(TermsModalComponent, { centered: true, windowClass: 'sign-up-terms-modal-dialog', backdrop: 'static'});
        ref.result.then((data) => {
          localStorage.setItem('onInit', 'true');
        });
      }
    }

  getOrganisationCode() {
    this.signUpApiService.getOrganisationCode(this.route.snapshot.queryParams.orgID).subscribe(res => {
      this.loginForm.get('organisationCode').patchValue(res.objectList[0]);
    });
  }
 
  /**
   * Show or hide inline error.
   * @param form - form control.
   */
  getInlineErrorStatus(control) {
    return (!control.pristine && !control.valid);
  }

  /**
   * login submit.
   * @param form - login form.
   */
  // tslint:disable-next-line:cognitive-complexity
  doLogin(form: any) {
    if (!this.authService.isAuthenticated()) {
      this.authService.authenticate().subscribe((token) => {
      });
    }
    this.signUpService.setEmail(form.value.loginUsername);
    const userType = (this.finlitEnabled ? appConstants.USERTYPE.FINLIT : (this.organisationEnabled ? appConstants.USERTYPE.CORPORATE : appConstants.USERTYPE.NORMAL));
    this.signUpService.setUserType(userType);
    const accessCode = (this.finlitEnabled) ? this.loginForm.value.accessCode : '';
    const organisationCode = this.organisationEnabled && this.loginForm.get('organisationCode').value || null;
    if (!form.valid || ValidatePassword(form.controls['loginPassword'])) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      let error;
      if (!form.valid) {
        this.markAllFieldsDirty(form);
        error = this.currentFormError(form);
        ref.componentInstance.errorTitle = error.errorTitle;
      } else {
        this.loginForm.controls['loginPassword'].reset();
        error = { errorMessage: 'User ID and/or password does not match.' };
        this.signUpService.setCaptchaCount();
        if (this.signUpService.getCaptchaShown() || this.signUpService.getCaptchaCount() >= 2) {
          this.signUpService.setCaptchaShown();
          this.loginForm.controls['captchaValue'].reset();
          this.setCaptchaValidator();
        }
      }
      ref.componentInstance.errorMessage = error.errorMessage;
      return false;
    } else if (this.authService.isAuthenticated()) {
      this.progressModal = true;
      const loginType = (SIGN_UP_CONFIG.AUTH_2FA_ENABLED) ? SIGN_UP_CONFIG.LOGIN_TYPE_2FA : '';
      this.signUpApiService.verifyLogin(this.loginForm.value.loginUsername, this.loginForm.value.loginPassword,
        this.loginForm.value.captchaValue, this.finlitEnabled, accessCode, loginType, organisationCode).subscribe((data) => {
          if(SIGN_UP_CONFIG.AUTH_2FA_ENABLED) {
            if (data.responseMessage && data.responseMessage.responseCode >= 6000) {
              try {
                if (data.objectList[0].customerId) {
                  this.appService.setCustomerId(data.objectList[0].customerId);
                }
              } catch (e) {
                console.log(e);
              }
              if(this.finlitEnabled && accessCode && accessCode !== '') {
                this.authService.saveAccessCode(accessCode);
              }
              this.authService.set2faVerifyAllowed(true);
              this.signUpService.removeCaptchaSessionId();
              this.signUpService.setUserMobileNo(data.objectList[0].mobileNumber);
              this.signUpService.setUserMobileCountryCode(data.objectList[0].countryCode);
              this.signUpService.setFromLoginPage();
              this.router.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_2FA]);
            } else if (data.responseMessage.responseCode === 5016 || data.responseMessage.responseCode === 5011) {
              this.loginForm.controls['captchaValue'].reset();
              this.loginForm.controls['loginPassword'].reset();
              this.openErrorModal(data.responseMessage.responseDescription);
              this.refreshCaptcha();
            } else if (data.responseMessage.responseCode === 5012 || data.responseMessage.responseCode === 5014) {
              if (data.responseMessage.responseCode === 5014) {
                this.signUpService.setUserMobileNo(data.objectList[0].mobileNumber);
                this.signUpService.setFromLoginPage();
              }
              if (data.objectList[0]) {
                this.signUpService.setCustomerRef(data.objectList[0].customerRef);
              }
             
              this.callErrorModal(data);
            } else {
              this.loginForm.controls['captchaValue'].reset();
              this.loginForm.controls['loginPassword'].reset();
              if (this.finlitEnabled) {
                this.loginForm.controls['accessCode'].reset();
              }
              this.openErrorModal(data.responseMessage.responseDescription);
              this.signUpService.setCaptchaCount();
              if (data.objectList[0] && data.objectList[0].sessionId) {
                this.signUpService.setCaptchaSessionId(data.objectList[0].sessionId);
              } else if (data.objectList[0].attempt >= 3 || this.signUpService.getCaptchaCount() >= 2) {
                this.signUpService.setCaptchaShown();
                this.setCaptchaValidator();
              }
            }
            
          } else {
            if (data.responseMessage && data.responseMessage.responseCode >= 6000) {
              // Pulling Customer information to log on Hubspot
              this.signUpApiService.getUserProfileInfo().subscribe((data) => {
                let userInfo = data.objectList;
                this.hubspotService.registerEmail(userInfo.emailAddress);
                this.hubspotService.registerPhone(userInfo.mobileNumber);
                const hsPayload = [
                  {
                    name: "email",
                    value: userInfo.emailAddress
                  },
                  {
                    name: "phone",
                    value: userInfo.mobileNumber
                  },
                  {
                    name: "firstname",
                    value: userInfo.firstName
                  },
                  {
                    name: "lastname",
                    value: userInfo.lastName
                  }];
                this.hubspotService.submitLogin(hsPayload);
              });
  
              this.investmentCommonService.clearAccountCreationActions();
              try {
                if (data.objectList[0].customerId) {
                  this.appService.setCustomerId(data.objectList[0].customerId);
                }
              } catch (e) {
                console.log(e);
              }
              this.signUpService.removeCaptchaSessionId();
              const insuranceEnquiry = this.selectedPlansService.getSelectedPlan();
              if (this.checkInsuranceEnquiry(insuranceEnquiry)) {
                this.updateInsuranceEnquiry(insuranceEnquiry, data, false);
              } else {
                this.goToNext();
              }
            } else if (data.responseMessage.responseCode === 5016 || data.responseMessage.responseCode === 5011) {
              this.loginForm.controls['captchaValue'].reset();
              this.loginForm.controls['loginPassword'].reset();
              this.openErrorModal(data.responseMessage.responseDescription);
              this.refreshCaptcha();
            } else if (data.responseMessage.responseCode === 5012 || data.responseMessage.responseCode === 5014) {
              if (data.responseMessage.responseCode === 5014) {
                this.signUpService.setUserMobileNo(data.objectList[0].mobileNumber);
                this.signUpService.setFromLoginPage();
              }
              if (data.objectList[0]) {
                this.signUpService.setCustomerRef(data.objectList[0].customerRef);
              }
              const insuranceEnquiry = this.selectedPlansService.getSelectedPlan();
              if (this.checkInsuranceEnquiry(insuranceEnquiry)) {
                this.updateInsuranceEnquiry(insuranceEnquiry, data, true);
              } else {
                this.callErrorModal(data);
              }
            } else {
              this.loginForm.controls['captchaValue'].reset();
              this.loginForm.controls['loginPassword'].reset();
              if (this.finlitEnabled) {
                this.loginForm.controls['accessCode'].reset();
              }
              this.openErrorModal(data.responseMessage.responseDescription);
              this.signUpService.setCaptchaCount();
              if (data.objectList[0] && data.objectList[0].sessionId) {
                this.signUpService.setCaptchaSessionId(data.objectList[0].sessionId);
              } else if (data.objectList[0].attempt >= 3 || this.signUpService.getCaptchaCount() >= 2) {
                this.signUpService.setCaptchaShown();
                this.setCaptchaValidator();
              }
            }

          }
        }).add(() => {
          this.progressModal = false;
        });
    }
  }

  goToNext() {
    const investmentRoutes = [INVESTMENT_ACCOUNT_ROUTE_PATHS.ROOT, INVESTMENT_ACCOUNT_ROUTE_PATHS.START];
    const redirect_url = this.signUpService.getRedirectUrl();
    const journeyType = this.appService.getJourneyType();
    if (this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_COMPREHENSIVE) {
      this.getUserProfileAndNavigate(appConstants.JOURNEY_TYPE_COMPREHENSIVE);
    } else if (redirect_url && investmentRoutes.indexOf(redirect_url) >= 0) {
      this.signUpService.clearRedirectUrl();
      this.getUserProfileAndNavigate(appConstants.JOURNEY_TYPE_INVESTMENT);
    } else if (journeyType === appConstants.JOURNEY_TYPE_WILL_WRITING && this.willWritingService.getWillCreatedPrelogin()) {
      this.getUserProfileAndNavigate(appConstants.JOURNEY_TYPE_WILL_WRITING);
    } else {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
    }
  }

  checkInsuranceEnquiry(insuranceEnquiry): boolean {
    return ((this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_DIRECT ||
      this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_GUIDED) &&
      ((insuranceEnquiry.plans && insuranceEnquiry.plans.length > 0)
        || (insuranceEnquiry.enquiryProtectionTypeData && insuranceEnquiry.enquiryProtectionTypeData.length > 0)));
  }

  updateInsuranceEnquiry(insuranceEnquiry, data, errorModal: boolean) {
    const journeyType = (insuranceEnquiry.journeyType === appConstants.JOURNEY_TYPE_DIRECT) ?
      appConstants.INSURANCE_JOURNEY_TYPE.DIRECT : appConstants.INSURANCE_JOURNEY_TYPE.GUIDED;
    const payload: IEnquiryUpdate = {
      customerId: data.objectList[0].customerId || data.objectList[0].customerRef,
      enquiryId: Formatter.getIntValue(insuranceEnquiry.enquiryId),
      selectedProducts: insuranceEnquiry.plans,
      enquiryProtectionTypeData: insuranceEnquiry.enquiryProtectionTypeData,
      journeyType: journeyType
    };
    this.apiService.updateInsuranceEnquiry(payload).subscribe(() => {
      if (errorModal) {
        this.callErrorModal(data);
      } else {
        this.selectedPlansService.clearData();
        this.stateStoreService.clearAllStates();
        this.router.navigate(['email-enquiry/success']);
      }
    });
  }

  callErrorModal(data) {
    if (data.responseMessage.responseCode === 5012) {
      this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.LOGIN_EMAIL_TITLE'),
        this.translate.instant('SIGNUP_ERRORS.VERIFY_EMAIL_MESSAGE'),
        this.translate.instant('SIGNUP_ERRORS.LOGIN_EMAIL_MESSAGE'),
        '', true);
    } else if (data.responseMessage.responseCode === 5014) {
      this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.TITLE'),
        this.translate.instant('SIGNUP_ERRORS.VERIFY_EMAIL_OTP'),
        this.translate.instant('COMMON.VERIFY_NOW'),
        (this.organisationEnabled && SIGN_UP_ROUTE_PATHS.CORPORATE_VERIFY_MOBILE) || SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE, false);
    }
  }

  showErrorModal(title: string, message: string, buttonLabel: string, redirect: string, emailResend: boolean) {
    this.loginForm.controls['captchaValue'].reset();
    this.loginForm.controls['loginPassword'].reset();
    this.refreshCaptcha();
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorMessage = message;
    ref.componentInstance.redirect_url = SIGN_UP_ROUTE_PATHS.VERIFY_EMAIL;
    ref.result.then((data) => {
      if (!data && redirect) {
        this.router.navigate([redirect]);
      }
    });
    if (title) {
      ref.componentInstance.errorTitle = title;
      ref.componentInstance.buttonLabel = buttonLabel;
    }
    if (emailResend) {
      ref.componentInstance.enableResendEmail = true;
      ref.componentInstance.resendEmail.pipe(
        flatMap(($e) =>
          this.resendEmailVerification()))
        .subscribe((data) => {
          if (data.responseMessage.responseCode === 6007) {
            ref.componentInstance.emailSent = true;
          }
        });
    }

  }


  resendEmailVerification() {
    const organisationCode = this.organisationEnabled && this.loginForm.get('organisationCode').value || null;
    const isEmail = this.authService.isUserNameEmail(this.loginForm.value.loginUsername);
    return this.signUpApiService.resendEmailVerification(this.loginForm.value.loginUsername, isEmail, organisationCode);
  }
  openErrorModal(error) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorMessage = error;
    return false;
  }

  ngOnDestroy() {
    this.navbarService.unsubscribeBackPress();
  }

  markAllFieldsDirty(form) {
    Object.keys(form.controls).forEach((key) => {
      if (form.get(key).controls) {
        Object.keys(form.get(key).controls).forEach((nestedKey) => {
          form.get(key).controls[nestedKey].markAsDirty();
        });
      } else {
        form.get(key).markAsDirty();
      }
    });
  }

  currentFormError(form) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        return this.loginFormError.formFieldErrors[name][Object.keys(controls[name]['errors'])[0]];
      }
    }
  }

  goBack() {
    this._location.back();
  }

  refreshCaptcha() {
    this.captchaSrc = this.authService.getCaptchaUrl();
    this.changeDetectorRef.detectChanges();
  }

  showCustomErrorModal(title, desc) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.errorMessage = desc;
  }

  getUserProfileAndNavigate(journeyType) {
    this.signUpApiService.getUserProfileInfo().subscribe((userInfo) => {
      if (userInfo.responseMessage.responseCode < 6000) {
        if (
          userInfo.objectList &&
          userInfo.objectList.length &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors.length
        ) {
          this.showCustomErrorModal(
            'Error!',
            userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors[0].msg
          );
        } else if (userInfo.responseMessage && userInfo.responseMessage.responseDescription) {
          const errorResponse = userInfo.responseMessage.responseDescription;
          this.showCustomErrorModal('Error!', errorResponse);
        } else {
          this.investmentAccountService.showGenericErrorModal();
        }
      } else {
        this.signUpService.setUserProfileInfo(userInfo.objectList);
        if (journeyType === appConstants.JOURNEY_TYPE_COMPREHENSIVE) {
          this.loaderService.showLoader({ title: 'Loading', autoHide: false });
          this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.ROOT], { skipLocationChange: true });
        } else if (journeyType === appConstants.JOURNEY_TYPE_INVESTMENT) {
          this.investmentCommonService.redirectToInvestmentFromLogin(this.investmentEnquiryId);
        } else if (journeyType === appConstants.JOURNEY_TYPE_WILL_WRITING) {
          this.router.navigate([WILL_WRITING_ROUTE_PATHS.VALIDATE_YOUR_WILL]);
        } else {
          this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
        }
      }
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }
  onFocus() {
    this.capslockFocus = true;
  }
  onBlur() {
    this.capslockFocus = false;
  }
  onPaste(event: ClipboardEvent, key) {
      const pastedEmailText = event.clipboardData.getData('text').replace(/\s/g, '').toUpperCase();
      const pastedText = (key == 'organisationCode'? event.clipboardData.getData('text').replace(/\s/g, '').toUpperCase() : event.clipboardData.getData('text').replace(/\s/g, ''));
      this.loginForm.controls[key].setValue(pastedText);
      event.preventDefault();    
  }
  onKeyupEvent(event, key) {
    if (event.target.value) {
      const emailValue = event.target.value.replace(/\s/g, '');
      this.loginForm.controls[key].setValue(emailValue);
    }
  }

  openSingpassModal(event, type?) {
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    if (type) {
      ref.componentInstance.errorTitle = this.translate.instant('LOGIN.SINGPASS_LOGIN_FAIL_MODAL.TITLE');
      ref.componentInstance.errorMessageHTML = this.translate.instant('LOGIN.SINGPASS_LOGIN_FAIL_MODAL.MESSAGE');
      ref.componentInstance.primaryActionLabel = this.translate.instant('LOGIN.SINGPASS_LOGIN_FAIL_MODAL.BACK_BTN');
      ref.componentInstance.primaryAction.subscribe(() => {
        this.modal.dismissAll();
      });
    } else {
      ref.componentInstance.errorTitle = this.translate.instant('LOGIN.SINGPASS_ACTIVATE_MODAL.TITLE');
      ref.componentInstance.errorMessageHTML = this.translate.instant('LOGIN.SINGPASS_ACTIVATE_MODAL.MESSAGE');
    }
    event.stopPropagation();
    event.preventDefault();
  }
  // Toggle UI for showing Singpass/Password Login
  toggleSingpass(type) {
    if (type === SIGN_UP_CONFIG.SINGPASS) {
      this.showSingpassLogin = true;
      this.showPasswordLogin = false;
    } else {
      this.showPasswordLogin = true;
      this.showSingpassLogin = false;
    }
    this.getSetLoginPref(type);
  }
  // Get or set the login pref for mobile view
  getSetLoginPref(type?) {
    if (window.localStorage && /Mobi|Android/i.test(navigator.userAgent)) {
      if (type) {
        if (type !== window.localStorage.getItem("LOGIN_PREFERENCE")) {
          console.log("SETTING LOGIN TYPE " + type)
          window.localStorage.setItem('LOGIN_PREFERENCE', type);
        }
      } else {
        if (window.localStorage.getItem("LOGIN_PREFERENCE")) {
          console.log("GETTING LOGIN TYPE " + window.localStorage.getItem("LOGIN_PREFERENCE"))
          this.toggleSingpass(window.localStorage.getItem("LOGIN_PREFERENCE"));
        }
      }
    }
  }
  // Login method by Singpass
  loginBySingpass() {
    // Check if User is authenticated yet
    if (!this.authService.isAuthenticated()) {
      this.authService.authenticate().subscribe((token) => {
      });
    }
    // If user not in our DB
    // openSingpassLoginFail possible pass in fail msg instead?
    // this.openSingpassModal(window.event, 'Fail');
  }
}