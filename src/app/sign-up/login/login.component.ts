import {
  Component, ElementRef, HostListener, OnDestroy, OnInit,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { mergeMap } from 'rxjs/operators';

import { SessionsService } from './../../shared/Services/sessions/sessions.service';
import { appConstants } from '../../app.constants';
import { AppService } from '../../app.service';
import { ConfigService, IConfig } from '../../config/config.service';
import { FooterService } from '../../shared/footer/footer.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { ValidatePassword } from '../create-account/password.validator';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { LoaderService } from './../../shared/components/loader/loader.service';
import { HelperService } from './../../shared/http/helper.service';
import { IError } from './../../shared/http/interfaces/error.interface';
import { LoginFormError } from './login-form-error';
import { SIGN_UP_CONFIG } from './../sign-up.constant';
import { TermsModalComponent } from './../../shared/modal/terms-modal/terms-modal.component';
import { LoginService } from './../login.service';
import { SingpassService } from '../../singpass/singpass.service';
import { RecaptchaComponent } from 'ng-recaptcha';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  private distribution: any;
  private loginFormError: any = new LoginFormError();
  loginForm: FormGroup;
  formValues: any;
  defaultCountryCode;
  countryCodeOptions;
  heighlightMobileNumber;
  hideForgotPassword = false;
  duplicateError: any;
  progressModal = false;
  investmentEnquiryId;
  finlitEnabled = false;
  organisationEnabled = false;
  capsOn: boolean;
  capslockFocus: boolean;
  showPasswordLogin = true;
  showSingpassLogin = true;
  singpassEnabled = true;
  isCorpBiz: boolean = false;

  @ViewChild('welcomeTitle') welcomeTitle: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (/Android|Windows/.test(navigator.userAgent)) {
      this.welcomeTitle.nativeElement.scrollIntoView(true);
    }
  }
  @ViewChild('reCaptchaRef') reCaptchaRef: RecaptchaComponent;

  constructor(
    // tslint:disable-next-line
    private formBuilder: FormBuilder, public appService: AppService,
    private modal: NgbModal, private configService: ConfigService,
    public authService: AuthenticationService,
    public sessionsService: SessionsService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private selectedPlansService: SelectedPlansService,
    private loaderService: LoaderService,
    private helper: HelperService,
    private loginService: LoginService,
    private singpassService: SingpassService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.duplicateError = this.translate.instant('COMMON.DUPLICATE_ERROR');
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
      this.singpassEnabled = false;
      this.appService.clearJourneys();
      this.appService.clearPromoCode();
    }
    this.appService.setCorporateDetails({ organisationEnabled: this.organisationEnabled, uuid: this.route.snapshot.queryParams.orgID || null });
    this.signUpService.removeUserType();
    if (this.authService.isSignedUserWithRole(SIGN_UP_CONFIG.ROLE_2FA)) {
      this.authService.clearTokenID();
      this.signUpService.removeFromLoginPage();
      this.signUpService.removeFromMobileNumber();
    }
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
          this.singpassService.getStateNonce();
          this.loaderService.hideLoader();
          const customError: IError = {
            error: [],
            message: 'Your session has unexpectedly expired. Please login again'
          };
          this.helper.showCustomErrorModal(customError);
        });
      } else {
        this.authService.authenticate().subscribe((token) => {
          this.singpassService.getStateNonce();
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
    this.navbarService.welcomeJourneyCompleted = false;
  }

  setCaptchaValidator() {
    this.reCaptchaRef.execute();
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
          organisationCode: [null, this.organisationEnabled ? [Validators.required] : []]
        });
        return false;
      }
    }
    let emailValidators = [];
    if (this.organisationEnabled) {
      emailValidators = [Validators.required, Validators.pattern(RegexConstants.EmailOrMobile), this.signUpService.emailDomainValidator(this.organisationEnabled)];
    } else {
      emailValidators = [Validators.required, Validators.pattern(RegexConstants.EmailOrMobile)];
    }
    this.loginForm = this.formBuilder.group({
      loginUsername: [this.formValues.loginUsername, emailValidators],
      loginPassword: [this.formValues.loginPassword, [Validators.required]],
      organisationCode: [null, this.organisationEnabled ? [Validators.required] : []]
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
      const ref = this.modal.open(TermsModalComponent, { centered: true, windowClass: 'sign-up-terms-modal-dialog', backdrop: 'static' });
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
   *  will trigger reCAPTCHA if user provided invalid username/password from 3rd login attempt.
   * @param form - login form.
   */
  validateRecaptcha(form) {
    if (!this.authService.isAuthenticated()) {
      this.authService.authenticate().subscribe((token) => {
      });
    }
    this.signUpService.setEmail(form.value.loginUsername);
    const userType = (this.finlitEnabled ? appConstants.USERTYPE.FINLIT : (this.organisationEnabled ? appConstants.USERTYPE.CORPORATE : appConstants.USERTYPE.NORMAL));
    this.signUpService.setUserType(userType);
    if (!form.valid || ValidatePassword(form.controls['loginPassword'])) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'no-title' });
      let error;
      if (!form.valid) {
        this.markAllFieldsDirty(form);
        error = this.currentFormError(form);
        ref.componentInstance.errorTitle = error.errorTitle;
      } else {
        this.loginForm.controls['loginPassword'].reset();
        error = { errorMessage: 'User ID and/or password does not match.' };
        this.signUpService.setCaptchaCount();
      }
      ref.componentInstance.errorMessage = error.errorMessage;
      return false;
    } else {
      if (this.signUpService.getCaptchaShown() || this.signUpService.getCaptchaCount() >= 2) {
        this.signUpService.setCaptchaShown();
        this.reCaptchaRef.execute();
      } else {
        this.doLogin(form, false)
      }
    }
  }

  /**
   * login submit.
   * @param form - login form.
   */
  // tslint:disable-next-line:cognitive-complexity
  doLogin(form: any, reCaptchaToken = null) {
    if (reCaptchaToken) {
      this.authService.setReCaptchaResponse(reCaptchaToken);
    }
    const accessCode = (this.finlitEnabled) ? this.loginForm.value.accessCode : '';
    const organisationCode = this.organisationEnabled && this.loginForm.get('organisationCode').value || null;
      if (this.authService.isAuthenticated()) {
      this.progressModal = true;
      const loginType = (SIGN_UP_CONFIG.AUTH_2FA_ENABLED) ? SIGN_UP_CONFIG.LOGIN_TYPE_2FA : '';
      this.signUpApiService.verifyLogin(this.loginForm.value.loginUsername, this.loginForm.value.loginPassword,
        this.finlitEnabled, accessCode, loginType, organisationCode).subscribe((data) => {
          this.isCorpBiz = this.authService.isCorpBiz;
          if (SIGN_UP_CONFIG.AUTH_2FA_ENABLED) {
            if (data.responseMessage && data.responseMessage.responseCode >= 6000) {
              try {
                if (data.objectList[0].customerId) {
                  this.appService.setCustomerId(data.objectList[0].customerId);
                }
              } catch (e) {
                console.log(e);
              }
              if (this.finlitEnabled && accessCode && accessCode !== '') {
                this.authService.saveAccessCode(accessCode);
              }
              this.authService.set2faVerifyAllowed(true);
              this.signUpService.removeCaptchaSessionId();
              this.signUpService.setUserMobileNo(data.objectList[0].mobileNumber);
              this.signUpService.setUserMobileCountryCode(data.objectList[0].countryCode);
              this.signUpService.setFromLoginPage();
              this.router.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_2FA]);
            } else {
              this.handleError(data);
            }
          } else {
            if (data.responseMessage && data.responseMessage.responseCode >= 6000) {
              this.loginService.onSuccessLogin(data);
            } else {
              this.handleError(data);
            }
          }
        }).add(() => {
          this.progressModal = false;
        });
    }
  }

  handleError(data) {
    this.signUpService.setCaptchaCount();
    if (data.responseMessage.responseCode === 5011 || data.responseMessage.responseCode === 5016) {
      this.loginForm.controls['loginPassword'].reset();
      this.openErrorModal(data.responseMessage.responseDescription);
    } else if (data.responseMessage.responseCode === 5012 || data.responseMessage.responseCode === 5014) {
      if (data.responseMessage.responseCode === 5014) {
        this.signUpService.setUserMobileNo(data.objectList[0].mobileNumber);
        this.signUpService.setFromLoginPage();
      }
      if (data.objectList[0]) {
        this.signUpService.setCustomerRef(data.objectList[0].customerRef);
      }
      if (SIGN_UP_CONFIG.AUTH_2FA_ENABLED) {
        this.callErrorModal(data);
      } else {
        const insuranceEnquiry = this.selectedPlansService.getSelectedPlan();
        if (this.loginService.checkInsuranceEnquiry(insuranceEnquiry)) {
          this.loginService.updateInsuranceEnquiry(insuranceEnquiry, data);
          setTimeout(() => {
            this.callErrorModal(data);
          });
        } else {
          this.callErrorModal(data);
        }
      }
    } else {
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

  callErrorModal(data) {
    if (data.responseMessage.responseCode === 5012) {
      this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.LOGIN_EMAIL_TITLE'),
        this.translate.instant('SIGNUP_ERRORS.VERIFY_EMAIL_MESSAGE'),
        this.translate.instant('SIGNUP_ERRORS.LOGIN_EMAIL_MESSAGE'),
        '', true, true);
    } else if (data.responseMessage.responseCode === 5014) {
      this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.TITLE'),
        this.translate.instant('SIGNUP_ERRORS.VERIFY_MOBILE_OTP'),
        this.translate.instant('COMMON.VERIFY_NOW'),
        (this.finlitEnabled && SIGN_UP_ROUTE_PATHS.FINLIT_VERIFY_MOBILE) ||
        (this.organisationEnabled && SIGN_UP_ROUTE_PATHS.CORPORATE_VERIFY_MOBILE) ||
        SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE,
        false,
        true);
    }
  }

  showErrorModal(title: string, message: string, buttonLabel: string, redirect: string, emailResend: boolean, unverifiedAccount = false) {
    this.loginForm.controls['loginPassword'].reset();
    const windowClassOnCondition = this.appService.isUserFromCorpBizLink && unverifiedAccount ? 'corpbiz-verification-modal': '';
    const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: windowClassOnCondition });
    if (title) {
      ref.componentInstance.errorTitle = title;
      ref.componentInstance.buttonLabel = buttonLabel;
    }
    if (this.appService.isUserFromCorpBizLink && unverifiedAccount) {
      redirect = SIGN_UP_ROUTE_PATHS.LOGIN; 
      ref.componentInstance.errorTitle = this.translate.instant('SIGNUP_ERRORS.CORBIZ_UNVERIFIED_TITLE');
      ref.componentInstance.buttonLabel = this.translate.instant('COMMON.LOGIN');
      ref.componentInstance.errorMessageList = [
        this.translate.instant('SIGNUP_ERRORS.CORBIZ_UNVERIFIED_MESSAGE1'),
        this.translate.instant('SIGNUP_ERRORS.CORBIZ_UNVERIFIED_MESSAGE2')
      ];      
    } else {
      ref.componentInstance.errorMessage = message;
    }
    ref.componentInstance.redirect_url = SIGN_UP_ROUTE_PATHS.VERIFY_EMAIL;
    ref.result.then((data) => {
      if (!data && redirect) {
        if (this.appService.isUserFromCorpBizLink && unverifiedAccount && redirect.includes('/login')) {
          this.appService.clearCorpBizUserData();
        }
        this.router.navigate([redirect]);
      }
    });
    if (emailResend) {
      ref.componentInstance.enableResendEmail = this.appService.isUserFromCorpBizLink ? false : true;
      if (!this.isCorpBiz && !this.organisationEnabled && !this.appService.isUserFromCorpBizLink) {
        ref.componentInstance.enableChangeEmail = true;
      }
      ref.componentInstance.resendEmail.pipe(
        mergeMap(($e) =>
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
    this.navbarService.goBack();
  }

  onFocus() {
    this.capslockFocus = true;
  }
  onBlur() {
    this.capslockFocus = false;
  }
  onPaste(event: ClipboardEvent, key) {
    const pastedEmailText = event.clipboardData.getData('text').replace(/\s/g, '').toUpperCase();
    const pastedText = (key == 'organisationCode' ? event.clipboardData.getData('text').replace(/\s/g, '').toUpperCase() : event.clipboardData.getData('text').replace(/\s/g, ''));
    this.loginForm.controls[key].setValue(pastedText);
    event.preventDefault();
  }
  onKeyupEvent(event, key) {
    if (event.target.value) {
      const emailValue = event.target.value.replace(/\s/g, '');
      this.loginForm.controls[key].setValue(emailValue);
    }
  }

  navigateForgotPassword(){
    if(this.organisationEnabled){
      this.router.navigate([SIGN_UP_ROUTE_PATHS.FORGOT_PASSWORD_CORPORATE]);
    } else {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.FORGOT_PASSWORD]);
    }
  }

  navigateSignUp(){
    if(this.finlitEnabled){
      this.router.navigate([SIGN_UP_ROUTE_PATHS.FINLIT_CREATE_ACCOUNT_MY_INFO]);
    } else if(this.organisationEnabled){
      this.router.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_CREATE_ACCOUNT_MY_INFO]);
    } else {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.CREATE_ACCOUNT_MY_INFO]);
    }
  }

  showCorbizHelpModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'corpbiz-help-modal' });    
    ref.componentInstance.errorTitle = this.translate.instant('LOGIN.CORBIZ_HELP_TITLE');
    ref.componentInstance.buttonLabel = this.translate.instant('LOGIN.CORBIZ_HELP_BUTTON_LABEL');  
    ref.componentInstance.closeBtn = false; 
      ref.componentInstance.errorMessageList = [
        this.translate.instant('LOGIN.CORBIZ_HELP_MESSAGE'),
        this.translate.instant('SIGNUP_ERRORS.CORBIZ_ACCOUNT_EXIST_MESSAGE2')
      ];      
    ref.result.then((data) => {      
    }).catch((e) => { })
  }

}