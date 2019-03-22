import { Location } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { TermsComponent } from '../../shared/components/terms/terms.component';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { FooterService } from './../../shared/footer/footer.service';
import { SignUpApiService } from './../sign-up.api.service';
import { SignUpService } from './../sign-up.service';
import { ValidatePassword } from './password.validator';
import { ValidateRange } from './range.validator';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateAccountComponent implements OnInit, AfterViewInit {
  private pageTitle: string;
  private description: string;

  createAccountForm: FormGroup;
  formValues: any;
  defaultCountryCode;
  countryCodeOptions;
  editNumber;
  captchaSrc: any = '';
  isPasswordValid = true;

  constructor(
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private _location: Location,
    private authService: AuthenticationService,
  ) {
    this.translate.use('en');
    this.route.params.subscribe((params) => {
      this.editNumber = params.editNumber;
    });
  }

  /**
   * Initialize tasks.
   */
  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.authService.authenticate().subscribe((token) => {
        this.refreshCaptcha();
      });
    }
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(101);
    this.footerService.setFooterVisibility(false);
    this.buildAccountInfoForm();
    this.getCountryCode();
  }

  ngAfterViewInit() {
    this.refreshCaptcha();
  }

  /**
   * build account form.
   */
  buildAccountInfoForm() {
    this.formValues = this.signUpService.getAccountInfo();
    this.formValues.countryCode = this.formValues.countryCode ? this.formValues.countryCode : this.defaultCountryCode;
    this.formValues.termsOfConditions = this.formValues.termsOfConditions ? this.formValues.termsOfConditions : true;
    this.formValues.marketingAcceptance = this.formValues.marketingAcceptance ? this.formValues.marketingAcceptance : false;
    let confirmEmail = this.formValues.email || '';
    this.createAccountForm = this.formBuilder.group({
      countryCode: [this.formValues.countryCode, [Validators.required]],
      mobileNumber: [this.formValues.mobileNumber, [Validators.required, ValidateRange]],
      firstName: [this.formValues.firstName, [Validators.required, Validators.pattern(RegexConstants.OnlyAlpha)]],
      lastName: [this.formValues.lastName, [Validators.required, Validators.pattern(RegexConstants.OnlyAlpha)]],
      email: [this.formValues.email, [Validators.required, Validators.email]],
      confirmEmail: [confirmEmail, [Validators.required]],
      password: ['', [ValidatePassword]],
      confirmPassword: ['',],
      termsOfConditions: [this.formValues.termsOfConditions],
      marketingAcceptance: [this.formValues.marketingAcceptance],
      captcha: ['', [Validators.required]]
    }, { validator: this.validateMatchPasswordEmail() });
  }

  /**
   * validate createAccountForm.
   * @param form - user account form detail.
   */
  save(form: any) {
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      const error = this.signUpService.getSignupFormError(form);
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = error.title;
      ref.componentInstance.errorMessageList = error.errorMessages;
      return false;
    } else {
      this.signUpService.setAccountInfo(form.value);
      this.openTermsOfConditions();
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
      const countryCode = this.formValues.countryCode ? this.formValues.countryCode : this.countryCodeOptions[0].code;
      this.setCountryCode(countryCode);
    });
  }

  /**
   * request one time password.
   */
  createAccount() {
    this.signUpApiService.createAccount(this.createAccountForm.value.captcha).subscribe((data: any) => {
      if (data.responseMessage.responseCode === 6000) {
        this.signUpService.setCustomerRef(data.objectList[0].customerRef);
        this.router.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE]);
      } else if (data.responseMessage.responseCode === 6001) {
        this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.TITLE'),
          this.translate.instant('SIGNUP_ERRORS.ACCOUNT_EXIST_MESSAGE'),
          this.translate.instant('COMMON.LOG_IN'),
          SIGN_UP_ROUTE_PATHS.LOGIN, false);
      } else if (data.responseMessage.responseCode === 6002) {
        this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.TITLE'),
          this.translate.instant('SIGNUP_ERRORS.VERIFY_EMAIL_MESSAGE'),
          this.translate.instant('COMMON.LOG_IN'),
          SIGN_UP_ROUTE_PATHS.LOGIN, true);
      } else if (data.responseMessage.responseCode === 6003) {
        this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.TITLE'),
          this.translate.instant('SIGNUP_ERRORS.VERIFY_EMAIL_OTP'),
          this.translate.instant('COMMON.VERIFY_NOW'),
          SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE, false);
      } else {
        this.showErrorModal('', data.responseMessage.responseDescription, '', '', false);
      }
    });
  }

  onPasswordInputChange() {
    if (this.createAccountForm.controls.password.errors && this.createAccountForm.controls.password.dirty) {
      this.isPasswordValid = false;
    } else {
      const _self = this;
      setTimeout(() => {
        _self.isPasswordValid = true;
      }, 500);
    }
  }

  showErrorModal(title: string, message: string, buttonLabel: string, redirect: string, emailResend: boolean) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorMessage = message;
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
      ref.componentInstance.resendEmail.subscribe(($e) => {
        this.resendEmailVerification();
      });
    }
    this.refreshCaptcha();
  }

  resendEmailVerification() {
    this.signUpApiService.resendEmailVerification();
  }

  onlyNumber(el) {
    this.createAccountForm.controls['mobileNumber'].setValue(el.value.replace(RegexConstants.OnlyNumeric, ''));
  }

  goBack() {
    this._location.back();
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
    this.createAccountForm.controls['captcha'].reset();
    this.captchaSrc = this.authService.getCaptchaUrl();
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
      if (passwordInput.value !== passwordConfirmationInput.value) {
        passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        passwordConfirmationInput.setErrors({ notEquivalent: false });
      }
      if (emailInput.value !== emailConfirmationInput.value) {
        emailConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        emailConfirmationInput.setErrors({ notEquivalent: false });
      }
    };
  }
}
