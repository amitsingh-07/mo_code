import { flatMap } from 'rxjs/operators';
import {
  AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from '../../../app/shared/http/api.service';
import { appConstants } from '../../app.constants';
import { AppService } from '../../app.service';
import { ConfigService } from '../../config/config.service';
import { TermsComponent } from '../../shared/components/terms/terms.component';
import { FooterService } from '../../shared/footer/footer.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { Formatter } from '../../shared/utils/formatter.util';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { LoaderService } from './../../shared/components/loader/loader.service';
import { SignUpService } from '../sign-up.service';
import { ICorpBizData, IEnquiryUpdate } from '../signup-types';
import { ValidatePassword } from './password.validator';
import { ValidateRange } from './range.validator';
import { Util } from '../../shared/utils/util';
import { SIGN_UP_CONFIG } from '../sign-up.constant';
import { NgbDateCustomParserFormatter } from '../../shared/utils/ngb-date-custom-parser-formatter';
import { InvestmentAccountService } from '../../investment/investment-account/investment-account-service';
@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ],
  encapsulation: ViewEncapsulation.None,
})
export class CreateAccountComponent implements OnInit, AfterViewInit {
  private distribution: any;
  createAccountForm: FormGroup;
  defaultCountryCode;
  countryCodeOptions;
  captchaSrc: any = '';
  isPasswordValid = true;

  confirmEmailFocus = false;
  confirmPwdFocus = false;
  passwordFocus = false;

  submitted: boolean = false;
  capsOn: boolean;
  capslockFocus: boolean;

  // Referral Code
  showClearBtn: boolean = false;
  refCodeValidated: boolean = false;
  showSpinner: boolean = false;
  createAccBtnDisabled = true;
  finlitEnabled = false;
  showSingPassDetails = false;
  formValue: any;
  maxDate: any;
  minDate: any;
  organisationEnabled = false;
  isCorpBiz = false;
  corpBizData: ICorpBizData;
  isCorpBizMyInfoEnabled: boolean;
  isCorpBizUser: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    private loaderService: LoaderService,
    private configService: ConfigService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private authService: AuthenticationService,
    private appService: AppService,
    private apiService: ApiService,
    private selectedPlansService: SelectedPlansService,
    private changeDetectorRef: ChangeDetectorRef,
    private investmentAccountService: InvestmentAccountService
  ) {
    const today: Date = new Date();
    this.minDate = {
      year: today.getFullYear() - SIGN_UP_CONFIG.ACCOUNT_CREATION.DOB.DATE_PICKER_MAX_YEAR,
      month: today.getMonth() + 1, day: today.getDate()
    };
    this.maxDate = {
      year: today.getFullYear() - SIGN_UP_CONFIG.ACCOUNT_CREATION.DOB.DATE_PICKER_MIN_YEAR,
      month: today.getMonth() + 1, day: today.getDate()
    };
    this.translate.use('en');
    this.configService.getConfig().subscribe((config) => {
      this.distribution = config.distribution;
    });

    if (this.route.snapshot.data[0]) {
      this.finlitEnabled = this.route.snapshot.data[0]['finlitEnabled'];
      this.organisationEnabled = this.route.snapshot.data[0]['organisationEnabled'];
      this.appService.clearJourneys();
      this.appService.clearPromoCode();
    }
    this.appService.setCorporateDetails({ organisationEnabled: this.organisationEnabled, uuid: this.route.snapshot.queryParams.orgID || (this.appService.getCorporateDetails() && this.appService.getCorporateDetails().uuid) || null });

    // Set referral code base on the query param
    this.route.queryParams.subscribe((params) => {
      if (params['referral_code'] && !Util.isEmptyOrNull(params['referral_code'])) {
        if (this.finlitEnabled) {
          this.router.navigate([SIGN_UP_ROUTE_PATHS.FINLIT_CREATE_ACCOUNT_MY_INFO], { queryParams: { referral_code: params['referral_code'] } });
        } else {
          this.router.navigate([SIGN_UP_ROUTE_PATHS.CREATE_ACCOUNT_MY_INFO], { queryParams: { referral_code: params['referral_code'] } });
        }

      }
    });
    this.isCorpBizMyInfoEnabled = this.signUpService.getCorpBizMyInfoStatus();
    if (this.router.url.indexOf('corpbiz') > -1) {
      this.corpBizData = this.appService.getCorpBizData();
    }
    this.isCorpBiz = this.corpBizData?.isCorpBiz;
  }

  /**
   * Initialize tasks.
   */
  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.refreshToken();
    }
    if (this.appService.getJourneyType() == null || this.appService.getJourneyType() === '') {
      this.appService.setJourneyType(appConstants.JOURNEY_TYPE_SIGNUP);
    }
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(101);
    this.footerService.setFooterVisibility(false);
    this.formValue = this.signUpService.getAccountInfo();
    this.buildAccountInfoForm();
    this.getCountryCode();
    //Referral Code snapshot param
    if (this.route.snapshot.paramMap.get('referralCode') !== '' && !Util.isEmptyOrNull(this.route.snapshot.paramMap.get('referralCode')) && this.createAccountForm.controls['referralCode']) {
      this.createAccountForm.controls['referralCode'].setValue(this.route.snapshot.paramMap.get('referralCode'));
      this.showClearBtn = true;
    }
  }

  ngAfterViewInit() {
    if (!this.authService.isAuthenticated()) {
      this.loaderService.showLoader({ title: 'Loading' });
      this.authService.authenticate().subscribe((token) => {
        if (this.organisationEnabled && this.route.snapshot.queryParams.orgID) {
          this.getOrganisationCode();
        }
        this.refreshCaptcha();
        this.loaderService.hideLoader();
      });
    } else {
      this.refreshCaptcha();
      this.loaderService.hideLoader();
      if (this.organisationEnabled && this.route.snapshot.queryParams.orgID) {
        this.getOrganisationCode();
      }
    }
    this.createAccountForm.statusChanges.subscribe((data) => {
      if (this.createAccountForm.touched || this.createAccountForm.dirty) {
        this.createAccBtnDisabled = false;
      }
    });
  }

  getOrganisationCode() {
    this.signUpApiService.getOrganisationCode(this.route.snapshot.queryParams.orgID).subscribe(res => {
      this.createAccountForm.get('organisationCode').patchValue(res.objectList[0]);
    });
  }

  refreshToken() {
    this.authService.authenticate().subscribe((token) => {
      this.refreshCaptcha();
    });
  }

  get account() { return this.createAccountForm.controls; }


  buildAccountInfoForm() {
    const myInfoEmail = (this.formValue && this.formValue.isMyInfoEnabled && this.formValue.email) ? this.formValue.email : '';
    const myInfoMobile = (this.formValue && this.formValue.isMyInfoEnabled && this.formValue.mobileNumber) ? this.formValue.mobileNumber : '';
    const myInfoDob = (this.formValue && this.formValue.isMyInfoEnabled && this.formValue.dob) ? this.formValue.dob : '';
    const myInfoGender = (this.formValue && this.formValue.isMyInfoEnabled && this.formValue.gender) ? this.formValue.gender : '';
    if (this.distribution && this.distribution.login) {
      this.createAccountForm = this.formBuilder.group({
        countryCode: ['', [Validators.required]],
        mobileNumber: [ myInfoMobile || this.corpBizData?.mobileNumber, [Validators.required]],        
        email: [{
          value: this.corpBizData?.email || myInfoEmail,
          disabled: this.isCorpBiz
        }, [Validators.required, Validators.pattern(this.distribution.login.regex)]],
        confirmEmail: [''],
        password: ['', [Validators.required, ValidatePassword]],
        confirmPassword: [''],
        termsOfConditions: [true],
        marketingAcceptance: [false],
        captcha: ['', [Validators.required]],
        referralCode: [''],
        organisationCode: [null, this.organisationEnabled ? Validators.required : []],
        gender: [{
          value: myInfoGender,
          disabled: this.formValue && this.formValue.isMyInfoEnabled
        }, [Validators.required]],
        dob: [{
          value: myInfoDob || this.corpBizData?.dob,
          disabled: this.formValue && this.formValue.isMyInfoEnabled
        }, [Validators.required]]
      }, { validator: this.validateMatchPasswordEmail() })
      this.buildFormSingPass();
      return false;
    }
    let emailValidators = [Validators.required, Validators.email, Validators.pattern(RegexConstants.Email), this.signUpService.emailDomainValidator(this.organisationEnabled)];

    this.createAccountForm = this.formBuilder.group({
      countryCode: ['', [Validators.required]],
      mobileNumber: [myInfoMobile || this.corpBizData?.mobileNumber, [Validators.required]],
      email: [{
        value: this.corpBizData?.email || myInfoEmail,
        disabled: this.isCorpBiz
      }, emailValidators],
      confirmEmail: [''],
      password: ['', [Validators.required, ValidatePassword]],
      confirmPassword: [''],
      termsOfConditions: [true],
      marketingAcceptance: [false],
      captcha: ['', [Validators.required]],
      referralCode: [''],
      organisationCode: [null, this.organisationEnabled ? Validators.required : []],
      gender: [{
        value: myInfoGender,
        disabled: this.formValue && this.formValue.isMyInfoEnabled
      }, [Validators.required]],
      dob: [{
        value: myInfoDob || this.corpBizData?.dob,
        disabled: this.formValue && this.formValue.isMyInfoEnabled
      }, [Validators.required]]
    }, { validator: this.validateMatchPasswordEmail() })

    if (this.signUpService.organisationName) {
      this.createAccountForm.get('organisationCode').patchValue(this.signUpService.organisationName);
    }
    this.buildFormSingPass();
    return true;
  }
  /**
   * build account form.
   */
  buildFormSingPass() {
    if (this.formValue && this.formValue.isMyInfoEnabled) {
      this.showSingPassDetails = true;
      this.createAccountForm.addControl('fullName', new FormControl(this.formValue.fullName, Validators.required));
      this.createAccountForm.addControl('nricNumber', new FormControl(this.formValue.nricNumber, Validators.required));
      this.createAccountForm.removeControl('firstName');
      this.createAccountForm.removeControl('lastName');
      this.createAccountForm.addControl('singleLineDOB', new FormControl(this.dobObjToSingleLine()))
    } else {
      this.showSingPassDetails = false;
      this.createAccountForm.removeControl('fullName');
      this.createAccountForm.removeControl('nricNumber');
      this.createAccountForm.removeControl('singleLineDOB');
      this.createAccountForm.addControl('firstName', new FormControl('',
        [Validators.required, Validators.minLength(2),
        Validators.maxLength(40), Validators.pattern(RegexConstants.NameWithSymbol)]));
      this.createAccountForm.addControl('lastName', new FormControl('',
        [Validators.required, Validators.minLength(2),
        Validators.maxLength(40), Validators.pattern(RegexConstants.NameWithSymbol)]));
    }
  }

  dobObjToSingleLine() {
    if (this.formValue.dob && typeof this.formValue.dob === 'object') {
      return `${this.formValue.dob.day}/${this.formValue.dob.month}/${this.formValue.dob.year}`;
    }
  }
  /**
   * validate createAccountForm.
   * @param form - user account form detail.
   */
  save(form: any) {
    this.submitted = true;
    this.validateReferralCode();
    if (form.valid) {
      form.value.userType = (this.finlitEnabled ? appConstants.USERTYPE.FINLIT : (this.organisationEnabled ? appConstants.USERTYPE.CORPORATE : appConstants.USERTYPE.NORMAL));
      form.value.accountCreationType = (this.formValue && this.formValue.isMyInfoEnabled) ? appConstants.USERTYPE.SINGPASS : appConstants.USERTYPE.MANUAL;
      form.value.isMyInfoEnabled = (this.formValue && this.formValue.isMyInfoEnabled);
      form.value.organisationCode = this.organisationEnabled && this.createAccountForm.get('organisationCode').value || null;
      if (this.formValue && this.formValue.isMyInfoEnabled) {
        form.value.dob = (this.formValue && this.formValue.isMyInfoEnabled && this.formValue.dob) ? this.formValue.dob : '';
        form.value.gender = (this.formValue && this.formValue.isMyInfoEnabled && this.formValue.gender) ? this.formValue.gender : '';
      }
      if (this.isCorpBiz && form.value) {
        form.value.email = this.corpBizData?.email;
        form.value.enrolmentId = this.corpBizData?.enrollmentId;
        form.value.isCorpBizEnrollUser = this.corpBizData?.isCorpBiz;
      }
      this.signUpService.setAccountInfo(form.value);
      this.openTermsOfConditions();
    }
  }

  validateReferralCode() {
    // Check if referral code is empty or not
    // If not empty, check if the apply button has been press
    if (this.createAccountForm.controls['referralCode'].value === '') {
      this.createAccountForm.controls['referralCode'].setErrors(null);
    } else if (!this.refCodeValidated && !this.account.referralCode.errors?.invalidRefCode) {
      this.createAccountForm.controls['referralCode'].setErrors({ applyRefCode: true });
    }
  }

  /**
   * set country code.
   * @param countryCode - country code detail.
   */
  setCountryCode(countryCode) {
    const mobileControl = this.createAccountForm.controls['mobileNumber'];
    this.defaultCountryCode = countryCode;
    this.createAccountForm.controls['countryCode'].setValue(countryCode);
    if (countryCode === '+65') {
      mobileControl.setValidators([Validators.required, ValidateRange]);
    } else {
      mobileControl.setValidators([Validators.required, Validators.pattern(RegexConstants.CharactersLimit)]);
    }
    mobileControl.updateValueAndValidity();
  }

  /**
   * get country code.
   */
  getCountryCode() {
    this.signUpApiService.getCountryCodeList().subscribe((data) => {
      this.countryCodeOptions = [data[0]];
      const countryCode = this.countryCodeOptions[0].code;
      this.setCountryCode(countryCode);
    });
  }

  /**
   * request one time password.
   */
  createAccount() {
    if (!this.createAccBtnDisabled) {
      this.createAccBtnDisabled = true;
      this.signUpService.setEmail(this.createAccountForm.get('email').value);
      this.signUpApiService.createAccount(this.createAccountForm.value.captcha, this.createAccountForm.value.password)
        .subscribe((data: any) => {
          this.createAccBtnDisabled = false;
          const responseCode = [6000, 6008, 5006];
          if (responseCode.includes(data.responseMessage.responseCode)) {
            if (data.responseMessage.responseCode === 6000 ||
              data.responseMessage.responseCode === 6008) {
              this.signUpService.setCustomerRef(data.objectList[0].customerRef);
              this.appService.setCorpBizViaPublicData({ isCorpBiz: data.objectList[1]?.isCorpBiz });
            }
            const insuranceEnquiry = this.selectedPlansService.getSelectedPlan();
            if ((this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_DIRECT ||
              this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_GUIDED) &&
              ((insuranceEnquiry.plans && insuranceEnquiry.plans.length > 0)
                || (insuranceEnquiry.enquiryProtectionTypeData && insuranceEnquiry.enquiryProtectionTypeData.length > 0))) {
              const redirect = data.responseMessage.responseCode === 6000;
              this.updateInsuranceEnquiry(insuranceEnquiry, data, redirect);
            } else if (data.responseMessage.responseCode === 6000) {
              this.authService.set2faVerifyAllowed(false);
              this.signUpService.removeFromLoginPage();
              this.signUpService.removeFromMobileNumber();
              if (this.finlitEnabled) {
                this.router.navigate([SIGN_UP_ROUTE_PATHS.FINLIT_VERIFY_MOBILE]);
              } else if (this.organisationEnabled) {
                this.router.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_VERIFY_MOBILE]);
              } else if (this.isCorpBiz) {
                this.router.navigate([SIGN_UP_ROUTE_PATHS.CORPBIZ_VERIFY_MOBILE]);
              } else {
                this.router.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE]);
              }

            } else if (data.responseMessage.responseCode === 6008 ||
              data.responseMessage.responseCode === 5006) {
              this.isCorpBizUser = data.objectList[0].isCorpBiz;
              this.callErrorModal(data);
            }
          } else if (data.responseMessage.responseCode === 5016) {
            this.refreshCaptcha();
            this.createAccountForm.controls['captcha'].setErrors({ match: true });
            this.createAccountForm.controls['password'].reset();
            this.createAccountForm.controls['confirmPassword'].reset();
          } else if (data.responseMessage.responseCode === 5024) {
            this.createAccountForm.controls['referralCode'].setErrors({ invalidRefCode: true });
          } else if (data.responseMessage.responseCode === 5135) {
            this.openCorpBizErrorModal();
          } else {
            this.showErrorModal('', data.responseMessage.responseDescription, '', '', false);
          }
        }, (err) => {
          this.createAccBtnDisabled = false;
          this.investmentAccountService.showGenericErrorModal();
        }).add(() => {
          this.submitted = false;
        });
    }
  }

  callErrorModal(data: any) {
    let redirectUrl = this.organisationEnabled ? SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN :
      SIGN_UP_ROUTE_PATHS.LOGIN;
    if (data.responseMessage.responseCode === 6008) {
      this.signUpService.setUserMobileNo(this.createAccountForm.controls['mobileNumber'].value);
      this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.TITLE'),
        this.translate.instant('SIGNUP_ERRORS.VERIFY_MOBILE_OTP'),
        this.translate.instant('COMMON.VERIFY_NOW'),
        (this.finlitEnabled && SIGN_UP_ROUTE_PATHS.FINLIT_VERIFY_MOBILE) ||
        (this.organisationEnabled && SIGN_UP_ROUTE_PATHS.CORPORATE_VERIFY_MOBILE) ||
        SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE,
        false, false, true);
    } else if (data.objectList[0].accountAlreadyCreated) {
      this.showErrorModal(
        this.translate.instant('SIGNUP_ERRORS.TITLE'),
        this.translate.instant('SIGNUP_ERRORS.ACCOUNT_EXIST_MESSAGE'),
        this.translate.instant('COMMON.LOG_IN'),
        redirectUrl,
        false,
        true);
    } else if (!data.objectList[0].emailVerified) {
      this.signUpService.setUserMobileNo(this.createAccountForm.controls['mobileNumber'].value);
      this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.TITLE'),
        this.translate.instant('SIGNUP_ERRORS.VERIFY_EMAIL_MESSAGE'),
        this.translate.instant('COMMON.LOG_IN'),
        redirectUrl,
        true);
    }
  }

  openCorpBizErrorModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('CORP_BIZ_ERROR_MODAL.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant('CORP_BIZ_ERROR_MODAL.SUB_TITLE');
  }

  showErrorModal(title: string, message: string, buttonLabel: string, redirect: string, emailResend: boolean, accountAlreadyCreated = false, unverifiedAccount = false) {
    const windowClassOnCondition = this.appService.isUserFromCorpBizLink && unverifiedAccount ? 'corpbiz-verification-modal' : '';
    const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: windowClassOnCondition });
    if (title) {
      ref.componentInstance.errorTitle = title;
      ref.componentInstance.buttonLabel = buttonLabel;
    }
    if (this.appService.isUserFromCorpBizLink && accountAlreadyCreated) {      
      ref.componentInstance.errorMessageList = [
        this.translate.instant('SIGNUP_ERRORS.CORBIZ_ACCOUNT_EXIST_MESSAGE1'),
        this.translate.instant('SIGNUP_ERRORS.CORBIZ_ACCOUNT_EXIST_MESSAGE2')
      ];      
    } else if (this.appService.isUserFromCorpBizLink && unverifiedAccount) { 
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
    }).catch((e) => { });
    if (emailResend) {
      ref.componentInstance.enableResendEmail = true;
      if (!this.isCorpBizUser && !this.organisationEnabled) {
        ref.componentInstance.enableChangeEmail = true;
      }
      ref.componentInstance.resendEmail.pipe(
        flatMap(($e) =>
          this.resendEmailVerification()))
        .subscribe((data) => {
          if (data.responseMessage.responseCode === 6007) {
            ref.componentInstance.emailSent = true;
          } else if (data.responseMessage.responseCode === 5114) {
            ref.close('close');
            this.showErrorModal('', data.responseMessage.responseDescription, '', '', false);
          }
        });
    }
    this.refreshCaptcha();
    this.createAccountForm.controls['password'].reset();
    this.createAccountForm.controls['confirmPassword'].reset();
  }

  updateInsuranceEnquiry(insuranceEnquiry, data: any, redirect: boolean) {
    const journeyType = (insuranceEnquiry.journeyType === appConstants.JOURNEY_TYPE_DIRECT) ?
      appConstants.INSURANCE_JOURNEY_TYPE.DIRECT : appConstants.INSURANCE_JOURNEY_TYPE.GUIDED;
    const payload: IEnquiryUpdate = {
      customerId: data.objectList[0].customerRef,
      enquiryId: Formatter.getIntValue(insuranceEnquiry.enquiryId),
      newCustomer: true,
      selectedProducts: insuranceEnquiry.plans,
      enquiryProtectionTypeData: insuranceEnquiry.enquiryProtectionTypeData,
      journeyType: journeyType
    };
    this.apiService.updateInsuranceEnquiry(payload).subscribe(() => {
      if (redirect) {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE]);
      } else {
        this.callErrorModal(data);
      }
    });
  }

  onPasswordInputChange() {
    if (this.createAccountForm.controls.password.errors && this.createAccountForm.controls.password.dirty
      && this.createAccountForm.controls.password.value) {
      this.isPasswordValid = false;
    } else if (!this.createAccountForm.controls.password.value.length) {
      this.isPasswordValid = true;
    } else {
      const _self = this;
      setTimeout(() => {
        _self.isPasswordValid = true;
      }, 500);
    }
  }

  resendEmailVerification() {
    const organisationCode = this.organisationEnabled && this.createAccountForm.get('organisationCode').value || null;
    return this.signUpApiService.resendEmailVerification(this.createAccountForm.controls['email'].value, true, organisationCode);
  }

  onlyNumber(el) {
    this.createAccountForm.controls['mobileNumber'].setValue(el.value.replace(RegexConstants.OnlyNumeric, ''));
  }

  goBack() {
    this.navbarService.goBack();
  }

  openTermsOfConditions() {
    const ref = this.modal.open(TermsComponent, { centered: true, windowClass: 'sign-up-terms-modal-dialog' });
    ref.result.then((data) => {
      if (data === 'proceed') {
        this.createAccount();
      }
    });
  }

  refreshCaptcha() {
    if (!this.authService.isAuthenticated()) {
      this.refreshToken();
    } else {
      this.createAccountForm.controls['captcha'].reset();
      this.captchaSrc = this.authService.getCaptchaUrl();
      this.changeDetectorRef.detectChanges();
    }
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
   * validate confirm password.
   */
  private validateMatchPasswordEmail() {
    return (group: FormGroup) => {
      const passwordInput = group.controls['password'];
      const passwordConfirmationInput = group.controls['confirmPassword'];
      const emailInput = group.controls['email'];
      const emailConfirmationInput = group.controls['confirmEmail'];
      const mobileNumberInput = group.controls['mobileNumber'];
      const SINGAPORE_MOBILE_REGEXP = RegexConstants.MobileNumber;

      // Confirm Password
      if (!passwordConfirmationInput.value) {
        passwordConfirmationInput.setErrors({ required: true });
      } else if (passwordInput.value !== passwordConfirmationInput.value) {
        passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        passwordConfirmationInput.setErrors(null);
      }

      // Confirm E-mail
      if (!this.isCorpBiz && !emailConfirmationInput.value) {
        emailConfirmationInput.setErrors({ required: true });
      } else if (!this.isCorpBiz && emailInput.value && emailInput.value.toLowerCase() !== emailConfirmationInput.value.toLowerCase()) {
        emailConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        emailConfirmationInput.setErrors(null);
      }

      // Mobile Number
      if (!mobileNumberInput.value) {
        mobileNumberInput.setErrors({ required: true });
      } else if (!SINGAPORE_MOBILE_REGEXP.test(mobileNumberInput.value)) {
        mobileNumberInput.setErrors({ mobileRange: true });
      } else {
        mobileNumberInput.setErrors(null);
      }
    };
  }

  showValidity(from) {
    if (from === 'confirmEmail') {
      this.confirmEmailFocus = !this.confirmEmailFocus;
    } else if (from === 'confirmPassword') {
      this.confirmPwdFocus = !this.confirmPwdFocus;
    } else {
      this.passwordFocus = !this.passwordFocus;
    }
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
    this.createAccountForm.controls[key].setValue(pastedText);
    event.preventDefault();
  }
  onKeyupEvent(event, key) {
    if (event.target.value) {
      const enterEmail = event.target.value.replace(/\s/g, '');
      this.createAccountForm.controls[key].setValue(enterEmail);
      if (key === 'referralCode' && !this.showSpinner) {
        this.showClearBtn = true;
      } else {
        this.showClearBtn = false;
      }
    } else {
      if (key === 'referralCode') {
        this.showClearBtn = false;
      }
    }
  }

  // Referral Code changes

  applyReferralCode(event) {
    if (this.createAccountForm.controls['referralCode'].value) {
      // Show the spinner
      this.createAccountForm.controls['referralCode'].setErrors(null);
      this.showClearBtn = false;
      this.showSpinner = true;
      // Call validate referral code, replace below code
      this.signUpService.validateReferralCode(this.createAccountForm.controls['referralCode'].value).subscribe((response) => {
        if (response.responseMessage['responseCode'] === 6012) {
          setTimeout(() => {
            this.showSpinner = false;
            this.refCodeValidated = true;
          }, 1200);
        } else {
          setTimeout(() => {
            this.showSpinner = false;
            this.showClearBtn = true;
            this.createAccountForm.controls['referralCode'].setErrors({ invalidRefCode: true });
          }, 1200);
        }
      });
    }
    event.stopPropagation();
    event.preventDefault();
  }

  clearReferralCode(event) {
    this.createAccountForm.controls['referralCode'].setValue('');
    this.showClearBtn = false;
    event.stopPropagation();
    event.preventDefault();
  }

  // Go to Corp biz signup with data page 
  goToPrevious() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.CORP_BIZ_SIGNUP_DATA]);
  }
}
