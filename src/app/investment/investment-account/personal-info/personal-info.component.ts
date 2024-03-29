import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { LoaderService } from '../../../shared/components/loader/loader.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { RegexConstants } from '../../../shared/utils/api.regex.constants';
import { NgbDateCustomParserFormatter } from '../../../shared/utils/ngb-date-custom-parser-formatter';
import { InvestmentAccountCommon } from '../investment-account-common';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../investment-account-routes.constants';
import { InvestmentAccountService } from '../investment-account-service';
import { INVESTMENT_ACCOUNT_CONSTANTS } from '../investment-account.constant';
import {
  ModelWithButtonComponent
} from '../../../shared/modal/model-with-button/model-with-button.component';
import { InvestmentCommonService } from '../../investment-common/investment-common.service';
import { InvestmentEngagementJourneyService } from '../../investment-engagement-journey/investment-engagement-journey.service';
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
  minDate: any;
  maxDate: any;
  investmentAccountCommon: InvestmentAccountCommon = new InvestmentAccountCommon();
  source: any;
  radioLabelValue = [];
  isGenderDisabled = false;
  genderDisabledStyleClass = 'fixed-btn--sm';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private modal: NgbModal,
    private investmentAccountService: InvestmentAccountService,
    public readonly translate: TranslateService,
    private loaderService: LoaderService,
    private investmentCommonService: InvestmentCommonService,
    private investmentEngagementService: InvestmentEngagementJourneyService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('PERSONAL_INFO.TITLE');
      this.setPageTitle(this.pageTitle);
      const today: Date = new Date();
      this.minDate = {
        year: today.getFullYear() - 100,
        month: today.getMonth() + 1,
        day: today.getDate()
      };
      this.maxDate = {
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
      this.radioLabelValue = [{
        name: this.translate.instant('LABEL.MALE'),
        value: this.translate.instant('COMMON.LBL_MALE_VALUE')
      }, {
        name: this.translate.instant('LABEL.FEMALE'),
        value: this.translate.instant('COMMON.LBL_FEMALE_VALUE')
      }]
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
    this.isGenderDisabled = this.investmentAccountService.isDisabled('gender');
    this.genderDisabledStyleClass = this.isGenderDisabled ? `${this.genderDisabledStyleClass} disabled` : this.genderDisabledStyleClass;
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
          [Validators.required, this.investmentEngagementService.validateNric.bind(this)]
        ],
        dob: [
          {
            value: this.formValues.dob,
            disabled: this.investmentAccountService.isDisabled('dob')
          },
          [Validators.required, this.investmentEngagementService.validateMinimumAge]
        ],
        gender: [
          {
            value: this.formValues.gender,
            disabled: this.isGenderDisabled
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
          [Validators.required, this.investmentEngagementService.validateMinimumAge]
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
          [Validators.required, this.investmentEngagementService.validateExpiry]
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
    }
    else {
      this.investmentAccountService.setPersonalInfo(form.getRawValue());
      this.source = this.formValues.isMyInfoEnabled ? INVESTMENT_ACCOUNT_CONSTANTS.VALIDATE_SOURCE.MYINFO : INVESTMENT_ACCOUNT_CONSTANTS.VALIDATE_SOURCE.MANUAL;
      if (this.source == INVESTMENT_ACCOUNT_CONSTANTS.VALIDATE_SOURCE.MANUAL && this.showNric) {
        this.investmentCommonService.getUserNricValidation(form.getRawValue().nricNumber, this.source).subscribe((data) => {
          if (data.responseMessage.responseCode === 6013) {
            this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.RESIDENTIAL_ADDRESS]);
          }
          else if (data.responseMessage.responseCode === 6014) {
            const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
            ref.componentInstance.errorTitle = this.translate.instant(
              'PERSONAL_INFO.ERROR.TITLE'
            );
            ref.componentInstance.errorMessage = this.translate.instant(
              'PERSONAL_INFO.ERROR.MESSAGE1'
            );
            ref.componentInstance.primaryActionLabel = this.translate.instant(
              'PERSONAL_INFO.ERROR.BTN-TEXT'
            );
          }
          else if (data.responseMessage.responseCode === 6015) {
            const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
            ref.componentInstance.errorTitle = this.translate.instant(
              'PERSONAL_INFO.ERROR.TITLE'
            );
            ref.componentInstance.errorMessage = this.translate.instant(
              'PERSONAL_INFO.ERROR.MESSAGE2'
            );
            ref.componentInstance.primaryActionLabel = this.translate.instant(
              'PERSONAL_INFO.ERROR.BTN-TEXT'
            );
          }
        });
      }
      else {
        this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.RESIDENTIAL_ADDRESS]);
      }
    }
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
    value = value.trim().replace(RegexConstants.trimSpace, ' ');
    this.investmentAccountService.setControlValue(value, controlName, formName);
  }

  onKeyPressEvent(event: any, content: any) {
    this.investmentAccountService.onKeyPressEvent(event, content);
  }

  @HostListener('input', ['$event'])
  onChange(event) {
    const id = event.target.id;
    if (id === 'fullname') {
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
