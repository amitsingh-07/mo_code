import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { LoaderService } from '../../../shared/components/loader/loader.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { RegexConstants } from '../../../shared/utils/api.regex.constants';
import { NgbDateCustomParserFormatter } from '../../../shared/utils/ngb-date-custom-parser-formatter';
import { SignUpService } from '../../../sign-up/sign-up.service';
import { InvestmentAccountCommon } from '../investment-account-common';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../investment-account-routes.constants';
import { InvestmentAccountService } from '../investment-account-service';
import { INVESTMENT_ACCOUNT_CONSTANTS } from '../investment-account.constant';

@Component({
  selector: 'app-inv-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ],
  encapsulation: ViewEncapsulation.None
})
export class PersonalInfoComponent implements OnInit {
  @ViewChild('expiryInput') expiryInput;
  @ViewChild('dobInput') dobInput;
  pageTitle: string;
  invPersonalInfoForm: FormGroup;
  formValues: any;
  passportMinDate: any;
  passportMaxDate: any;
  unitedStatesResident: string;
  showPassport = false;
  showNric = true;
  userProfileInfo;
  optionList: any;
  salutaionList: any;
  countries: any;
  raceList: any;
  investmentAccountCommon: InvestmentAccountCommon = new InvestmentAccountCommon();
  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private formBuilder: FormBuilder,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private config: NgbDatepickerConfig,
    private modal: NgbModal,
    private signUpService: SignUpService,
    private investmentAccountService: InvestmentAccountService,
    public readonly translate: TranslateService,
    private loaderService: LoaderService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('PERSONAL_INFO.TITLE');
      this.setPageTitle(this.pageTitle);
      const today: Date = new Date();
      config.minDate = {
        year: today.getFullYear() - 100,
        month: today.getMonth() + 1,
        day: today.getDate()
      };
      config.maxDate = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
      };
      this.passportMinDate = {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
      };
      this.passportMaxDate = {
        year: today.getFullYear() + 20,
        month: today.getMonth() + 1,
        day: today.getDate()
      };
    });
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.setOptionList();
    this.investmentAccountService.loadInvestmentAccountRoadmap();
  }

  buildForm() {
    this.formValues = this.investmentAccountService.getInvestmentAccountFormData();
    if (this.investmentAccountService.isSingaporeResident()) {
      this.invPersonalInfoForm = this.buildFormForNricNumber();
      this.showPassport = false;
      this.showNric = true;
    } else {
      this.invPersonalInfoForm = this.buildFormForPassportDetails();
      this.showPassport = true;
      this.showNric = false;
    }
  }

  buildFormForNricNumber(): FormGroup {
    return this.formBuilder.group(
      {
        salutation: [
          {
            value: this.formValues.salutation,
            disabled: this.investmentAccountService.isDisabled('salutation')
          }
        ],
        fullName: [
          {
            value: this.formValues.fullName,
            disabled: this.investmentAccountService.isDisabled('fullName')
          },
          [Validators.required, Validators.pattern(RegexConstants.NameWithSymbol)]
        ],
        nricNumber: [
          {
            value: this.formValues.nricNumber,
            disabled: this.investmentAccountService.isDisabled('nricNumber')
          },
          [Validators.required, this.validateNric.bind(this)]
        ],
        dob: [
          {
            value: this.formValues.dob,
            disabled: this.investmentAccountService.isDisabled('dob')
          },
          [Validators.required, this.validateMinimumAge]
        ],
        gender: [
          {
            value: this.formValues.gender,
            disabled: this.investmentAccountService.isDisabled('gender')
          },
          Validators.required
        ],
        birthCountry: [
          {
            value: this.formValues.birthCountry,
            disabled: this.investmentAccountService.isDisabled('birthCountry')
          },
          Validators.required
        ],
        passportIssuedCountry: [
          {
            value: this.formValues.passportIssuedCountry
              ? this.formValues.passportIssuedCountry
              : this.investmentAccountService.getCountryFromNationalityCode(
                this.formValues.nationalityCode
              ),
            disabled: this.investmentAccountService.isDisabled('passportIssuedCountry')
          },
          Validators.required
        ],
        race: [
          {
            value: this.formValues.race,
            disabled: this.investmentAccountService.isDisabled('race')
          },
          [Validators.required]
        ]
      }
    );
  }
  buildFormForPassportDetails(): FormGroup {
    return this.formBuilder.group(
      {
        salutation: [
          {
            value: this.formValues.salutation,
            disabled: this.investmentAccountService.isDisabled('salutation')
          }
        ],
        fullName: [
          {
            value: this.formValues.fullName,
            disabled: this.investmentAccountService.isDisabled('fullName')
          },
          [Validators.required, Validators.pattern(RegexConstants.NameWithSymbol)]
        ],
        dob: [
          {
            value: this.formValues.dob,
            disabled: this.investmentAccountService.isDisabled('dob')
          },
          [Validators.required, this.validateMinimumAge]
        ],
        gender: [
          {
            value: this.formValues.gender,
            disabled: this.investmentAccountService.isDisabled('gender')
          },
          Validators.required
        ],
        birthCountry: [
          {
            value: this.formValues.birthCountry,
            disabled: this.investmentAccountService.isDisabled('birthCountry')
          },
          Validators.required
        ],
        passportNumber: [
          {
            value: this.formValues.passportNumber,
            disabled: this.investmentAccountService.isDisabled('passportNumber')
          },
          [Validators.required, Validators.pattern(RegexConstants.PassportNumber)]
        ],
        passportIssuedCountry: [
          {
            value: this.formValues.passportIssuedCountry
              ? this.formValues.passportIssuedCountry
              : this.investmentAccountService.getCountryFromNationalityCode(
                this.formValues.nationalityCode
              ),
            disabled: this.investmentAccountService.isDisabled('passportIssuedCountry')
          },
          Validators.required
        ],
        passportExpiry: [
          {
            value: this.formValues.passportExpiry,
            disabled: this.investmentAccountService.isDisabled('passportExpiry')
          },
          [Validators.required, this.validateExpiry]
        ],
        race: [
          {
            value: this.formValues.race,
            disabled: this.investmentAccountService.isDisabled('race')
          },
          [Validators.required]
        ]
      }
    );
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
  toggleDate(openEle, closeEle) {
    if (openEle) {
      openEle.toggle();
    }
    if (closeEle) {
      closeEle.close();
    }
  }
  goToNext(form) {
    if (!form.valid) {
      this.markAllFieldsDirty(form);
      const error = this.investmentAccountService.getFormErrorList(form);
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = error.title;
      ref.componentInstance.errorMessageList = error.errorMessages;
      return false;
    } else {
      this.investmentAccountService.setPersonalInfo(form.getRawValue());
      this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.RESIDENTIAL_ADDRESS]);
    }
  }

  private validateMinimumAge(control: AbstractControl) {
    const value = control.value;
    if (control.value !== undefined && isNaN(control.value)) {
      const isMinAge =
        new Date(
          value.year + INVESTMENT_ACCOUNT_CONSTANTS.personal_info.min_age,
          value.month - 1,
          value.day
        ) <= new Date();
      if (!isMinAge) {
        return { isMinAge: true };
      }
    }
    return null;
  }

  private validateExpiry(control: AbstractControl) {
    const value = control.value;
    const today = new Date();
    if (control.value !== undefined && isNaN(control.value)) {
      const isMinExpiry =
        new Date(value.year, value.month - 1, value.day) >=
        new Date(
          today.getFullYear(),
          today.getMonth() + INVESTMENT_ACCOUNT_CONSTANTS.personal_info.min_passport_expiry,
          today.getDate()
        );
      if (!isMinExpiry) {
        return { isMinExpiry: true };
      }
    }
    return null;
  }

  validateNric(control: AbstractControl) {
    const value = control.value;
    if (value && value !== undefined) {
      const isValidNric = this.investmentAccountCommon.isValidNric(value);
      if (!isValidNric) {
        return { nric: true };
      }
    }
    return null;
  }

  setOptionList() {
    this.loaderService.showLoader({
      title: this.translate.instant(
        'COMMON_LOADER.TITLE'
      ),
      desc: this.translate.instant(
        'COMMON_LOADER.DESC'
      )
    });
    this.investmentAccountService.getAllDropDownList().subscribe((data) => {
      this.loaderService.hideLoader();
      this.investmentAccountService.setOptionList(data.objectList);
      this.optionList = this.investmentAccountService.getOptionList();
      this.salutaionList = this.optionList.salutation;
      this.raceList = this.optionList.race;
      this.countries = this.investmentAccountService.getCountriesFormData();
      this.buildForm();
    },
      (err) => {
        this.loaderService.hideLoader();
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  setDropDownValue(event, key, value) {
    setTimeout(() => {
      this.invPersonalInfoForm.controls[key].setValue(value);
    }, 100);
  }

  isDisabled(fieldName) {
    return this.investmentAccountService.isDisabled(fieldName);
  }

  setControlValue(value, controlName, formName) {
    this.investmentAccountService.setControlValue(value, controlName, formName);
  }

  onKeyPressEvent(event: any, content: any) {
    this.investmentAccountService.onKeyPressEvent(event , content);
  }

  @HostListener('input', ['$event'])
  onChange(event) {
    const id = event.target.id;
    if (id !== '') {
      const content = event.target.innerText;
      if (content.length >= 100) {
        const contentList = content.substring(0, 100);
        this.invPersonalInfoForm.controls.fullName.setValue(contentList);
        const el = document.querySelector('#' + id);
        this.investmentAccountService.setCaratTo(el, 100, contentList);
      }
    }
  }
}