import { Location } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '../../../environments/environment';
import { TermsComponent } from '../../shared/components/terms/terms.component';
import { APP_JWT_TOKEN_KEY, AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { FooterService } from './../../shared/footer/footer.service';
import { SignUpApiService } from './../sign-up.api.service';
import { SignUpService } from './../sign-up.service';
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
    private selectedPlansService: SelectedPlansService,
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
    this.createAccountForm = this.formBuilder.group({
      countryCode: [this.formValues.countryCode, [Validators.required]],
      mobileNumber: [this.formValues.mobileNumber, [Validators.required, ValidateRange]],
      firstName: [this.formValues.firstName, [Validators.required, Validators.pattern(RegexConstants.AlphaWithSymbol)]],
      lastName: [this.formValues.lastName, [Validators.required, Validators.pattern(RegexConstants.AlphaWithSymbol)]],
      email: [this.formValues.email, [Validators.required, Validators.email]],
      termsOfConditions: [this.formValues.termsOfConditions],
      marketingAcceptance: [this.formValues.marketingAcceptance],
      captcha: ['', [Validators.required]]
    });
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
        //sessionStorage.setItem(APP_JWT_TOKEN_KEY, data.objectList[0].securityToken);
        this.router.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE]);
      } else {
        const ref = this.modal.open(ErrorModalComponent, { centered: true });
        ref.componentInstance.errorMessage = data.responseMessage.responseDescription;
        this.refreshCaptcha();
      }
    });
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
}
