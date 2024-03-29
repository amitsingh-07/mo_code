import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { InvestmentEngagementJourneyService } from '../../investment-engagement-journey/investment-engagement-journey.service';
import { InvestmentAccountCommon } from '../investment-account-common';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../investment-account-routes.constants';
import { InvestmentAccountService } from '../investment-account-service';
import { INVESTMENT_ACCOUNT_CONSTANTS } from '../investment-account.constant';

@Component({
  selector: 'app-tax-info',
  templateUrl: './tax-info.component.html',
  styleUrls: ['./tax-info.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TaxInfoComponent implements OnInit {
  taxInfoForm: FormGroup;
  countries: any;
  noTinReasonlist: any;
  taxInfoFormValues: any;
  nationalityObj: any;
  nationality: any;
  country: any;
  reason: any;
  pageTitle: string;
  translator: any;
  addTax: FormArray;
  singPlaceHolder;
  selectedCountries: any;
  formCount: number;
  investmentAccountCommon: InvestmentAccountCommon = new InvestmentAccountCommon();
  showNricHint = false;
  tooltipDetails: any;
  radioLabelValue = [];
  defaultRadioStyleClass = 'btn-outline-primary fixed-btn--sm';

  constructor(
    public headerService: HeaderService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private router: Router,
    private investmentAccountService: InvestmentAccountService,
    private modal: NgbModal,
    public readonly translate: TranslateService,
    private investmentEngagementService: InvestmentEngagementJourneyService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe(() => {
      this.pageTitle = this.translate.instant('TAX_INFO.TITLE');
      this.translator = this.translate.instant('TAX_INFO');
      this.tooltipDetails = this.translate.instant('BLOCKED_COUNTRY_TOOLTIP');
      this.setPageTitle(this.pageTitle);
      this.radioLabelValue = [{
        name: this.translate.instant('TAX_INFO.YES_LABEL'),
        value: this.translate.instant('COMMON.LBL_TRUE_VALUE')
      }, {
        name: this.translate.instant('TAX_INFO.NO_LABEL'),
        value: this.translate.instant('COMMON.LBL_FALSE_VALUE')
      }];
    });
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.getReasonList();
    this.taxInfoFormValues = this.investmentAccountService.getInvestmentAccountFormData();
    this.countries = this.investmentAccountService.getCountriesFormDataByFilter();
    this.taxInfoForm = this.formBuilder.group({
      addTax: this.formBuilder.array([])
    });
    if (this.taxInfoFormValues.taxObj) {
      // Existing Value
      this.taxInfoFormValues.taxObj.addTax.map((item) => {
        this.addTaxForm(item);
      });
    } else if (this.investmentAccountService.isSingaporeResident()) {
      const data = {
        taxCountry: this.investmentAccountService.getCountryFromCountryCodeByFilter(INVESTMENT_ACCOUNT_CONSTANTS.SINGAPORE_COUNTRY_CODE),
        radioTin: true,
        tinNumber: this.taxInfoFormValues.nricNumber
      };
      this.addTaxForm(data);
    } else {
      // New form
      this.addTaxForm(null);
    }
    this.singPlaceHolder = '';
    this.investmentAccountService.loadInvestmentAccountRoadmap();
  }

  addTaxForm(data): void {
    const control = this.taxInfoForm.controls['addTax'] as FormArray;
    const newFormGroup = this.createForm(data);
    this.showHint(newFormGroup.controls.taxCountry.value.countryCode, newFormGroup);
    control.push(newFormGroup);
    if (data) {
      let tinNoOrReasonValue;
      if (data.radioTin) {
        tinNoOrReasonValue = data.tinNumber ? data.tinNumber.toUpperCase() : null;
      } else {
        tinNoOrReasonValue = data.noTinReason ? data.noTinReason : null;
      }
      this.isTinNumberAvailChanged(data.radioTin, newFormGroup, tinNoOrReasonValue);
      this.setDefaultTinNoAndPlaceholder(newFormGroup, data);
    }
    this.formCount = this.taxInfoForm.controls.addTax.value.length;
  }

  createForm(data) {
    let formGroup;
    formGroup = this.formBuilder.group({
      radioTin: new FormControl(data ? data.radioTin : '', Validators.required),
      taxCountry: new FormControl(data ? data.taxCountry : '', Validators.required),
      showTinHint: new FormControl(false)
    });
    return formGroup;
  }

  getReasonList() {
    this.investmentAccountService.getAllDropDownList().subscribe((data) => {
      this.noTinReasonlist = data.objectList.noTinReason;
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  selectCountry(country, taxInfoItem) {
    taxInfoItem.controls.taxCountry.setValue(country);
    taxInfoItem.removeControl('tinNumber');
    taxInfoItem.removeControl('noTinReason');
    setTimeout(() => { /* Removing and adding control instantly, causes view to not refresh, hence settimeout */
      taxInfoItem.controls.radioTin.setValue(null);
      this.setDefaultTinNoAndPlaceholder(taxInfoItem, null);
      this.showHint(country.countryCode, taxInfoItem);
    });
  }

  /*
  * Method to show TIN hint based on country code if singapore
  */
  showHint(countryCode, taxInfoItem) {
    this.showNricHint = countryCode === INVESTMENT_ACCOUNT_CONSTANTS.SINGAPORE_COUNTRY_CODE;
    taxInfoItem.controls.showTinHint.setValue(this.showNricHint);
  }

  selectReason(reasonObj, taxInfoItem) {
    taxInfoItem.controls.noTinReason.setValue(reasonObj);
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
  showHelpModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translator.TAX_MODEL_TITLE;
    // tslint:disable-next-line:max-line-length
    ref.componentInstance.errorDescription = this.translator.TAX_MODEL_DESC;
    return false;
  }

  isTinNumberAvailChanged(flag, formgroup, data) {
    if (flag) {
      formgroup.addControl(
        'tinNumber',
        new FormControl('', [
          Validators.required,
          this.investmentEngagementService.validateTin.bind(this)
        ])
      );
      formgroup.controls.tinNumber.setValue(data);
      formgroup.removeControl('noTinReason');
    } else {
      formgroup.addControl(
        'noTinReason',
        new FormControl('', Validators.required)
      );
      formgroup.controls.noTinReason.setValue(data);
      formgroup.removeControl('tinNumber');
    }
  }
  setDropDownValue(key, value) {
    this.taxInfoForm.controls[key].setValue(value);
  }
  getInlineErrorStatus(control) {
    return !control.pristine && !control.valid;
  }

  goToNext(form) {
    const taxObj = form.getRawValue();
    const selCountryArr = [];
    if (taxObj) {
      // Existing Value
      taxObj.addTax.map((item) => {
        selCountryArr.push(item.taxCountry.countryCode);
      });
    }
    if (this.hasDuplicates(selCountryArr)) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = this.translate.instant('TAX_INFO.COUNTRY_ERROR');
      ref.componentInstance.errorMessage = this.translate.instant(
        'TAX_INFO.COUNTRY_ERROR_MSG'
      );
      return false;
    } else {
      if (!form.valid) {
        this.markAllFieldsDirty(form);
        const error = this.investmentAccountService.getFormErrorList(
          form.controls.addTax
        );
        const ref = this.modal.open(ErrorModalComponent, { centered: true });
        ref.componentInstance.errorTitle = error.title;
        ref.componentInstance.errorMessageList = error.errorMessages;
        return false;
      } else {
        this.investmentAccountService.setTaxInfoFormData(form.getRawValue());
        this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.PERSONAL_DECLARATION]);
      }
    }
  }
  getBorder() {
    return this.taxInfoForm.get('addTax')['controls'].length > 1;
  }
  removeTaxForm(formGroup, index): void {
    const control = formGroup.controls['addTax'] as FormArray;
    control.removeAt(index);
    this.formCount = this.taxInfoForm.controls.addTax.value.length;
  }
  getPlaceholder(country, taxInfoItem) {
    if (taxInfoItem.controls.tinNumber && country) {
      if (country.countryCode === 'SG') {
        return 'e.g S****5678C';
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
  hasDuplicates(array) {
    return new Set(array).size !== array.length;
  }

  setDefaultTinNoAndPlaceholder(taxInfoItem, data) {
    if (taxInfoItem.controls.taxCountry.value.countryCode === INVESTMENT_ACCOUNT_CONSTANTS.SINGAPORE_COUNTRY_CODE) {
      this.singPlaceHolder = 'e.g S****5678C';
      if (this.investmentAccountService.isSingaporeResident()) {
        taxInfoItem.controls.radioTin.setValue(true);
        this.isTinNumberAvailChanged(true, taxInfoItem, this.taxInfoFormValues.nricNumber);
        this.setControlEnableDisable(taxInfoItem, 'radioTin', false);
        this.setControlEnableDisable(taxInfoItem, 'tinNumber', false);
      } else {
        this.setTinNoValue(taxInfoItem, data ? data.tinNumber : null);
        this.singPlaceHolder = '';
        this.setControlEnableDisable(taxInfoItem, 'radioTin', true);
        this.setControlEnableDisable(taxInfoItem, 'tinNumber', true);
      }
    } else {
      this.setTinNoValue(taxInfoItem, data ? data.tinNumber : null);
      this.singPlaceHolder = '';
      this.setControlEnableDisable(taxInfoItem, 'radioTin', true);
      this.setControlEnableDisable(taxInfoItem, 'tinNumber', true);
    }
  }

  setTinNoValue(taxInfoItem, value) {
    if (taxInfoItem.controls.tinNumber) {
      taxInfoItem.controls.tinNumber.setValue(value);
      taxInfoItem.controls.tinNumber.updateValueAndValidity();
    }
  }

  setControlEnableDisable(taxInfoItem, controlName, enableFlag) {
    if (taxInfoItem.controls[controlName]) {
      if (enableFlag) {
        (taxInfoItem.controls[controlName] as FormControl).enable();
      } else {
        (taxInfoItem.controls[controlName] as FormControl).disable();
      }
    }
  }

  showHelpModalCountry() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.tooltipDetails.TITLE;
    // tslint:disable-next-line:max-line-length
    ref.componentInstance.errorDescription = this.tooltipDetails.DESC;
    ref.componentInstance.tooltipButtonLabel = this.tooltipDetails.GOT_IT;
    return false;
  }
}
