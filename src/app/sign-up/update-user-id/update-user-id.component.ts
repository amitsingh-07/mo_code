import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ConfigService, IConfig } from '../../config/config.service';
import { InvestmentAccountService } from '../../investment/investment-account/investment-account-service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { environment } from './../../../environments/environment';
import { FooterService } from './../../shared/footer/footer.service';
import { SignUpApiService } from './../sign-up.api.service';
import { SignUpService } from './../sign-up.service';
import { ValidateChange, ValidateRange } from './range.validator';

@Component({
  selector: 'app-update-user-id',
  templateUrl: './update-user-id.component.html',
  styleUrls: ['./update-user-id.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdateUserIdComponent implements OnInit {
  private distribution: any;
  private pageTitle: string;

  updateUserIdForm: FormGroup;
  formValues: any;
  defaultCountryCode;
  countryCodeOptions;
  editNumber;
  OldCountryCode;
  OldMobileNumber;
  OldEmail;
  updateMobile: boolean;
  updateEmail: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private _location: Location,
    private investmentAccountService: InvestmentAccountService,
    private configService: ConfigService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('UPDATE_USER_ID.TITLE');
      this.setPageTitle(this.pageTitle);
    });
    this.route.params.subscribe((params) => {
      this.editNumber = params.editNumber;
    });
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.distribution = config.distribution;
    });
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  /**
   * Initialize tasks.
   */
  ngOnInit() {
    if (environment.hideHomepage) {
      this.navbarService.setNavbarMode(104);
    } else {
      this.navbarService.setNavbarMode(102);
    }
    this.buildUpdateAccountForm();
    this.getCountryCode();
    this.footerService.setFooterVisibility(false);

    this.authService.get2faAuthEvent.subscribe((token) => {
      if (!token) {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
      }
    });

    this.signUpService.getEditProfileInfo().subscribe((data) => {
      const personalData = data.objectList.personalInformation;
      if (personalData) {
        if (this.updateUserIdForm) {
          this.updateUserIdForm.setValidators(
            this.validateGroupChange({
              'countryCode': personalData.countryCode,
              'mobileNumber': personalData.mobileNumber,
              'email': personalData.email
            }));
        }
        this.updateUserIdForm.patchValue({
          countryCode: personalData.countryCode,
          mobileNumber: personalData.mobileNumber,
          email: personalData.email
        });

        this.signUpService.setContactDetails(personalData.countryCode, personalData.mobileNumber, personalData.email);
        this.OldCountryCode = personalData.countryCode;
        this.OldEmail = personalData.email;
        this.OldMobileNumber = personalData.mobileNumber;
      }

    });
  }

  /**
   * build update account form.
   */
  buildUpdateAccountForm() {
    this.formValues = this.signUpService.getAccountInfo();
    this.formValues.countryCode = this.formValues.countryCode ? this.formValues.countryCode : this.defaultCountryCode;
    this.OldCountryCode = this.formValues.OldCountryCode;
    this.OldMobileNumber = this.formValues.OldMobileNumber;
    this.OldEmail = this.formValues.OldEmail;
    this.updateUserIdForm = this.formBuilder.group({
      countryCode: [this.formValues.countryCode, [Validators.required]],
      mobileNumber: [this.formValues.mobileNumber, [Validators.required, ValidateRange]],
      email: [this.formValues.email, [Validators.required, Validators.email]]
    }, {
      validator: this.validateGroupChange({
        'countryCode': this.OldCountryCode,
        'mobileNumber': this.OldMobileNumber,
        'email': this.OldEmail
      })
    }
    );
  }

  /**
   * validate updateUserIdForm.
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
      if (this.OldMobileNumber !== form.value.mobileNumber) {
        this.updateMobile = true;
      }
      if (this.OldEmail !== form.value.email) {
        this.updateEmail = true;
      }
      this.updateUserAccount();
    }
  }
  /**
   * set country code.
   * @param countryCode - country code detail.
   */
  setCountryCode(countryCode) {
    const mobileControl = this.updateUserIdForm.controls['mobileNumber'];
    this.defaultCountryCode = countryCode;
    this.updateUserIdForm.controls['countryCode'].setValue(countryCode);
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
  updateUserAccount() {
    let formValues = this.updateUserIdForm.value;
    if (this.distribution) {
      const newValues = {
        'countryCode': this.updateUserIdForm.controls['countryCode'].value,
        'mobileNumber': this.updateUserIdForm.controls['mobileNumber'].value,
        'email': this.updateUserIdForm.controls['email'].value
      };
      formValues = newValues;
    }
    this.signUpApiService.updateAccount(formValues).subscribe((data: any) => {
      if (data.responseMessage.responseCode === 6000) {
        this.signUpService.setContactDetails(this.updateUserIdForm.value.countryCode,
          this.updateUserIdForm.value.mobileNumber, this.updateUserIdForm.value.email);
        this.signUpService.setEditContact(true, this.updateMobile, this.updateEmail);
        this.signUpService.setRedirectUrl(SIGN_UP_ROUTE_PATHS.EDIT_PROFILE);
        if (data.objectList[0] && data.objectList[0].customerRef) {
          this.signUpService.setCustomerRef(data.objectList[0].customerRef);
        }
        if (this.updateMobile) {
          this.router.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE]);
        } else {
          this.router.navigate([SIGN_UP_ROUTE_PATHS.ACCOUNT_UPDATED]);
        }
      } else if (data.responseMessage && data.responseMessage.responseDescription) {
        const ref = this.modal.open(ErrorModalComponent, { centered: true });
        ref.componentInstance.errorMessage = data.responseMessage.responseDescription;
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    });
  }

  private validateGroupChange(params: any): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const keys = Object.keys(params);
      let hasChange = false;
      for (const key of keys) {
        if (group.controls[key]) {
          if (params[key] !== group.controls[key].value) {
            hasChange = true;
          }
        }
      }
      if (hasChange) {
        return null;
      } else {
        return { notChanged: true };
      }
    };
  }

  private validateContacts() {
    return (group: FormGroup) => {
      if (this.OldMobileNumber === group.controls['mobileNumber'].value
        && this.OldEmail === group.controls['email'].value) {
        return group.controls['mobileNumber'].setErrors({ notChanged: true });
      } else {
        return group.controls['mobileNumber'].setErrors(null);
      }
    };
  }

  onlyNumber(el) {
    this.updateUserIdForm.controls['mobileNumber'].setValue(el.value.replace(RegexConstants.OnlyNumeric, ''));
  }

  goBack() {
    this._location.back();
  }
}
