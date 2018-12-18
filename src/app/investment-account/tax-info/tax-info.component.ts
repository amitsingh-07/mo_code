import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { HeaderService } from '../../shared/header/header.service';
import { IPageComponent } from '../../shared/interfaces/page-component.interface';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import {
  ModelWithButtonComponent
} from '../../shared/modal/model-with-button/model-with-button.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../investment-account-routes.constants';
import { InvestmentAccountService } from '../investment-account-service';

@Component({
  selector: 'app-tax-info',
  templateUrl: './tax-info.component.html',
  styleUrls: ['./tax-info.component.scss']
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
  constructor(
    public headerService: HeaderService,
    public navbarService: NavbarService,
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private router: Router,
    private investmentAccountService: InvestmentAccountService,
    private modal: NgbModal,
    public readonly translate: TranslateService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe(() => {
      this.pageTitle = this.translate.instant('TAX_INFO.TITLE');
      this.translator = this.translate.instant('TAX_INFO');
      this.setPageTitle(this.pageTitle);
    });
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(2);
    this.getReasonList();
    this.taxInfoFormValues = this.investmentAccountService.getInvestmentAccountFormData();
    this.countries = this.investmentAccountService.getCountriesFormData();
    this.taxInfoForm = this.formBuilder.group({
      addTax: this.formBuilder.array([])
    });
    if (this.taxInfoFormValues.taxObj) { // Existing Value
      this.taxInfoFormValues.taxObj.addTax.map((item) => {
        this.addTaxForm(item);
      });
    } else { // New form
      this.addTaxForm(null);
    }
    this.singPlaceHolder = '';
  }

  addTaxForm(data): void {
      console.log('leng' + this.taxInfoForm.controls.addTax.value.length);
      const control = this.taxInfoForm.controls['addTax'] as FormArray;
      const newFormGroup = this.createForm(data);
      control.push(newFormGroup);
      if (data) {
        this.isTinNumberAvailChanged(data.radioTin, newFormGroup, data);
      }
      this.formCount = this.taxInfoForm.controls.addTax.value.length;
  }

  createForm(data) {
    let formGroup;
    formGroup = this.formBuilder.group({
      radioTin: new FormControl(data ? data.radioTin : '', Validators.required),
      taxCountry: new FormControl(data ? data.taxCountry : '', Validators.required),
    });
    return formGroup;
  }

  getReasonList() {
    this.investmentAccountService.getAllDropDownList().subscribe((data) => {
      this.noTinReasonlist = data.objectList.noTinReason;
    });
  }

  selectCountry(country, taxInfoItem) {
    taxInfoItem.controls.taxCountry.setValue(country);
    if (taxInfoItem.controls.tinNumber) {
      if (country.countryCode === 'SG') {
        this.singPlaceHolder = 'E.g S9840139C';
      } else {
        this.singPlaceHolder = '';
      }
    }
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
      formgroup.addControl('tinNumber',
        new FormControl(data ? data.tinNumber : '', [Validators.required, Validators.pattern(RegexConstants.Alphanumeric)]));
      formgroup.removeControl('noTinReason');
    } else {
      formgroup.addControl('noTinReason',
        new FormControl(data ? data.noTinReason : '', Validators.required));
      formgroup.removeControl('tinNumber');
    }
  }
  setDropDownValue(key, value) {
    this.taxInfoForm.controls[key].setValue(value);
  }
  getInlineErrorStatus(control) {
    //return (!control.pristine && !control.valid);
  }

  goToNext(form) {
    console.log(form.getRawValue());
    const taxObj = form.getRawValue();
    const selCountryArr = [];
    if (taxObj) { // Existing Value
      taxObj.addTax.map((item) => {
        selCountryArr.push(item.taxCountry.countryCode);
      });
    }
    if (this.hasDuplicates(selCountryArr)) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = 'Country can not be same';
      ref.componentInstance.errorMessage = 'Please check your selected countries';
      return false;
    } else {
    if (!form.valid) {
      this.markAllFieldsDirty(form);
      const error = this.investmentAccountService.getFormErrorList(form.controls.addTax);
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

  removeTaxForm(formGroup, index): void {
    const control = formGroup.controls['addTax'] as FormArray;
    control.removeAt(index);
    this.formCount = this.taxInfoForm.controls.addTax.value.length;
  }
  getPlaceholder(country, taxInfoItem) {
    if (taxInfoItem.controls.tinNumber && country) {
      if (country.countryCode === 'SG') {
        return 'E.g S9840139C';
      } else {
        return '';
      }
    } else {
      return '';
    }

  }
  hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
  }
}
