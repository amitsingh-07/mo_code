import { catchError } from 'rxjs/operators';

import { Component, OnInit, ViewEncapsulation  } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { InvestmentAccountCommon } from '../../investment/investment-account/investment-account-common';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../../investment/investment-account/investment-account-routes.constants';
import { InvestmentAccountService } from '../../investment/investment-account/investment-account-service';
import { INVESTMENT_ACCOUNT_CONSTANTS } from '../../investment/investment-account/investment-account.constant';
import { HeaderService } from '../../shared/header/header.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { FooterService } from './../../shared/footer/footer.service';
@Component({
  selector: 'app-edit-residential-address',
  templateUrl: './edit-residential-address.component.html',
  styleUrls: ['./edit-residential-address.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditResidentialAddressComponent implements OnInit {

  addressForm: FormGroup;
  pageTitle: string;
  formValues;
  countries;
  isUserNationalitySingapore;
  defaultThumb;
  showLoader;
  loaderTitle;
  loaderDesc;
  isResidentialAddressAvail: boolean;
  isMailingAddressAvail: boolean;
  formData: FormData = new FormData();
  investmentAccountCommon: InvestmentAccountCommon = new InvestmentAccountCommon();
  constructor(
    public readonly translate: TranslateService,
    private formBuilder: FormBuilder,
    private router: Router,
    private footerService: FooterService,
    public headerService: HeaderService,
    public navbarService: NavbarService,
    private modal: NgbModal,
    public investmentAccountService: InvestmentAccountService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('RESIDENTIAL_ADDRESS.TITLE');
      this.setPageTitle(this.pageTitle);
      this.defaultThumb = INVESTMENT_ACCOUNT_CONSTANTS.upload_documents.default_thumb;
      this.showLoader = false;
    });
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(100);
    this.footerService.setFooterVisibility(false);
    this.isUserNationalitySingapore = this.investmentAccountService.isSingaporeResident();
    this.formValues = this.investmentAccountService.getInvestmentAccountFormData();
    this.countries = this.investmentAccountService.getCountriesFormData();
    this.addressForm = this.buildForm();
    this.addOrRemoveAdditionalControls(this.addressForm.get('country').value);
    this.observeCountryChange();
    this.addOrRemoveMailingAddress();
    if (this.addressForm.get('mailingAddress')) {
      this.observeMailCountryChange();
    }
    this.isResidentialAddressAvail = this.formValues.resUploadedPath ? true : false;
    this.isMailingAddressAvail =  this.formValues.mailingUploadedPath ? true : false;
  }
  getNationalityCountryList() {
        this.investmentAccountService.getNationalityCountryList().subscribe((data) => {
            this.countries = this.investmentAccountService.getCountryList(data.objectList);
        });
}

buildForm(): FormGroup {
  return this.formBuilder.group({
    country: [{
      value: this.formValues.country,
      disabled: this.investmentAccountService.isDisabled('country')
    }, Validators.required],
    address1: [{ value: this.formValues.address1, disabled: this.investmentAccountService.isDisabled('address1') },
    [Validators.required, Validators.pattern(RegexConstants.AlphanumericWithSpaces)]],
    address2: [{ value: this.formValues.address2, disabled: this.investmentAccountService.isDisabled('address2') },
    [Validators.pattern(RegexConstants.AlphanumericWithSpaces)]],
    isMailingAddressSame: [this.formValues.isMailingAddressSame],
    resAddressProof: [this.formValues.resAddressProof]
  });
}

  addOrRemoveAdditionalControls(country) {
    const isSingapore = this.investmentAccountService.isCountrySingapore(country);
    if (isSingapore) {
      this.addressForm.addControl('postalCode', new FormControl({
        value: this.formValues.postalCode, disabled: this.investmentAccountService.isDisabled('postalCode')
      },
        [Validators.required, Validators.pattern(RegexConstants.NumericOnly)]));
      this.addressForm.addControl('floor', new FormControl({
        value: this.formValues.floor, disabled: this.investmentAccountService.isDisabled('floor')
      }, Validators.required));
      this.addressForm.addControl('unitNo', new FormControl({
        value: this.formValues.unitNo, disabled: this.investmentAccountService.isDisabled('unitNo')
      }, Validators.required));

      this.addressForm.removeControl('city');
      this.addressForm.removeControl('state');
      this.addressForm.removeControl('zipCode');
    } else {
      this.addressForm.addControl('city', new FormControl(
        this.formValues.city, [Validators.required, Validators.pattern(RegexConstants.OnlyAlphaWithoutLimit)]));
      this.addressForm.addControl('state', new FormControl(
        this.formValues.state, [Validators.required, Validators.pattern(RegexConstants.OnlyAlphaWithoutLimit)]));
      this.addressForm.addControl('zipCode', new FormControl({
        value: this.formValues.zipCode, disabled: this.investmentAccountService.isDisabled('zipCode')
      },
        [Validators.required, Validators.pattern(RegexConstants.NumericOnly)]));

      this.addressForm.removeControl('postalCode');
      this.addressForm.removeControl('floor');
      this.addressForm.removeControl('unitNo');
    }
  }

  observeCountryChange() {
    this.addressForm.get('country').valueChanges.subscribe((value) => {
      this.addOrRemoveAdditionalControls(value);
    });
  }

  addOrRemoveMailingAddress() {
    if (this.addressForm.controls.isMailingAddressSame.value !== true) {
      this.addressForm.addControl('mailingAddress', this.formBuilder.group({
        mailCountry: [{
          value: this.formValues.mailCountry ? this.formValues.mailCountry :
            this.investmentAccountService.getCountryFromNationalityCode(this.formValues.nationalityCode),
          disabled: this.investmentAccountService.isDisabled('mailCountry')
        }, Validators.required],
        mailAddress1: [{ value: this.formValues.mailAddress1, disabled: this.investmentAccountService.isDisabled('mailAddress1') },
        [Validators.required, Validators.pattern(RegexConstants.AlphanumericWithSpaces)]],
        mailAddress2: [{ value: this.formValues.mailAddress2, disabled: this.investmentAccountService.isDisabled('mailAddress2') },
        [Validators.pattern(RegexConstants.AlphanumericWithSpaces)]],
        mailAdressProof: [{ value: this.formValues.mailAdressProof, disabled: this.investmentAccountService.isDisabled('mailAdressProof') },
        [Validators.pattern(RegexConstants.AlphanumericWithSpaces)]],
         }));
      this.addOrRemoveAdditionalControlsMailing(this.addressForm.get('mailingAddress').get('mailCountry').value);
      this.observeMailCountryChange();
    } else {
      this.addressForm.removeControl('mailingAddress');
    }
  }

  addOrRemoveAdditionalControlsMailing(country) {
    const isSingapore = this.investmentAccountService.isCountrySingapore(country);
    const mailFormGroup = this.addressForm.get('mailingAddress') as FormGroup;
    if (isSingapore) {
      mailFormGroup.addControl('mailPostalCode', new FormControl({
        value: this.formValues.mailPostalCode,
        disabled: this.investmentAccountService.isDisabled('mailPostalCode')
      },  [Validators.required, Validators.pattern(RegexConstants.NumericOnly)]));
      mailFormGroup.addControl('mailFloor', new FormControl({
        value: this.formValues.mailFloor,
        disabled: this.investmentAccountService.isDisabled('mailFloor')
      }, Validators.required));
      mailFormGroup.addControl('mailUnitNo', new FormControl({
        value: this.formValues.mailUnitNo,
        disabled: this.investmentAccountService.isDisabled('mailUnitNo')
      }, Validators.required));

      mailFormGroup.removeControl('mailCity');
      mailFormGroup.removeControl('mailState');
      mailFormGroup.removeControl('mailZipCode');
    } else {
      mailFormGroup.addControl('mailCity', new FormControl({
        value: this.formValues.mailCity, disabled: this.investmentAccountService.isDisabled('mailCity')
      },
        [Validators.required, Validators.pattern(RegexConstants.OnlyAlphaWithoutLimit)]));
      mailFormGroup.addControl('mailState', new FormControl({
        value: this.formValues.mailState, disabled: this.investmentAccountService.isDisabled('mailState')
      },
        [Validators.required, Validators.pattern(RegexConstants.OnlyAlphaWithoutLimit)]));
      mailFormGroup.addControl('mailZipCode', new FormControl({
        value: this.formValues.mailZipCode, disabled: this.investmentAccountService.isDisabled('mailZipCode')
      },
        [Validators.required, Validators.pattern(RegexConstants.NumericOnly)]));

      mailFormGroup.removeControl('mailPostalCode');
      mailFormGroup.removeControl('mailFloor');
      mailFormGroup.removeControl('mailUnitNo');
    }
  }

  observeMailCountryChange() {
    this.addressForm.get('mailingAddress').get('mailCountry').valueChanges.subscribe((value) => {
      this.addOrRemoveAdditionalControlsMailing(value);
    });
  }

  getDefaultCountry() {
    let defaultCountry;
    if (this.formValues.country) {
      defaultCountry = this.formValues.country;
    } else if (this.isUserNationalitySingapore) {
      defaultCountry = this.investmentAccountService.getCountryFromNationalityCode(INVESTMENT_ACCOUNT_CONSTANTS.SINGAPORE_NATIONALITY_CODE);
    } else {
      defaultCountry = this.investmentAccountService.getCountryFromNationalityCode(this.formValues.nationalityCode);
    }
    return defaultCountry;
  }
getInlineErrorStatus(control) {
    return (!control.pristine && !control.valid);
  }

  setDropDownValue(key, value) {
    this.addressForm.controls[key].setValue(value);
  }
  setNestedDropDownValue(key, value, nestedKey) {
    this.addressForm.controls[nestedKey]['controls'][key].setValue(value);
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

  retrieveAddress(postalCode, address1Control, address2Control) {
    if (postalCode) {
    this.investmentAccountService.getAddressUsingPostalCode(postalCode).subscribe(
      (response: any) => {
        if (response) {
          if (response.Status.code === 200) {
            const address1 = response.Placemark[0].AddressDetails.Country.Thoroughfare.ThoroughfareName;
            const address2 = response.Placemark[0].AddressDetails.Country.AddressLine;
            address1Control.setValue(address1);
            address2Control.setValue(address2);
          } else {
            const ref = this.modal.open(ErrorModalComponent, { centered: true });
            ref.componentInstance.errorTitle = this.translate.instant('RESIDENTIAL_ADDRESS.POSTALCODE_NOT_FOUND_ERROR.TITLE');
            ref.componentInstance.errorMessage = this.translate.instant('RESIDENTIAL_ADDRESS.POSTALCODE_NOT_FOUND_ERROR.MESSAGE');
            address1Control.setValue('');
            address2Control.setValue('');
          }
        }
      },
      (err) => {
        const ref = this.modal.open(ErrorModalComponent, { centered: true });
        ref.componentInstance.errorTitle = this.translate.instant('RESIDENTIAL_ADDRESS.ERROR.POSTAL_CODE_TITLE');
        ref.componentInstance.errorMessage = this.translate.instant('RESIDENTIAL_ADDRESS.ERROR.POSTAL_CODE_DESC');
      });
    } else {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = this.translate.instant('RESIDENTIAL_ADDRESS.POSTALCODE_EMPTY_ERROR.TITLE');
      ref.componentInstance.errorMessage = this.translate.instant('RESIDENTIAL_ADDRESS.POSTALCODE_EMPTY_ERROR.MESSAGE');
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
      this.investmentAccountService.editResidentialAddressFormData(form.value).subscribe((data) => {
        if (form.controls.resAddressProof && form.controls.resAddressProof.value ) {
        this.uploadDocument();
        }
        if (this.addressForm.controls.isMailingAddressSame.value !== true) {
          if (form.controls.mail && form.controls.mailAdressProof.value ) {
            this.uploadDocument();
          }
        }
        this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
      });
    }
  }

  isDisabled(field) {
    return this.investmentAccountService.isDisabled(field);
  }

  uploadDocument() {
    this.showUploadLoader();
    this.investmentAccountService.uploadDocument(this.formData).subscribe((response) => {
      if (response) {
        this.hideUploadLoader();
        // INTERIM SAVE
        this.investmentAccountService.saveInvestmentAccount().subscribe((data) => {
          console.log ('After uploading ' + data);
        });
      }
    });
  }
  openFileDialog(elem) {
    if (!elem.files.length) {
      elem.click();
    }
  }

  fileSelected(control, controlname, fileElem, thumbElem?) {
    const response = this.investmentAccountCommon.fileSelected(this.formData, control, controlname, fileElem, thumbElem);
    if (!response.validFileSize) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      const errorTitle = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.FILE_SIZE_EXCEEDED.TITLE');
      const errorDesc = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.FILE_SIZE_EXCEEDED.MESSAGE');
      ref.componentInstance.errorTitle = errorTitle;
      ref.componentInstance.errorDescription = errorDesc;
      control.setValue('');
    } else if (!response.validFileType) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      const errorTitle = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.FILE_TYPE_MISMATCH.TITLE');
      const errorDesc = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.FILE_TYPE_MISMATCH.MESSAGE');
      ref.componentInstance.errorTitle = errorTitle;
      ref.componentInstance.errorDescription = errorDesc;
      control.setValue('');
    } else {
        const selFile = fileElem.target.files[0];
        control.setValue(selFile ? selFile.name : '');
    }
  }

  getPayloadKey(controlname) {
    const payloadKey = this.investmentAccountCommon.getPayloadKey(controlname);
    return payloadKey;
  }

  // uploadDocument() {
  //   this.showUploadLoader();
  //   this.investmentAccountService.uploadDocument(this.formData).subscribe((data) => {
  //     if (data) {
  //       this.hideUploadLoader();
  //       this.redirectToNextPage();
  //     }
  //   });
  // }

  setThumbnail(thumbElem, file) {
    // Set Thumbnail
    this.investmentAccountCommon.setThumbnail(thumbElem, file);
  }

  getFileName(fileElem) {
    let fileName;
    if (this.isResidentialAddressAvail) {
      fileName = this.formValues.resUploadedPath.split('/').pop();
    } else {
    fileName = this.investmentAccountCommon.getFileName(fileElem);
    }
    return fileName;
  }
  getFileNameMailing(fileElem) {
    let fileName;
    if (this.isMailingAddressAvail) {
      fileName = this.formValues.mailingUploadedPath.split('/').pop();
    } else {
    fileName = this.investmentAccountCommon.getFileName(fileElem);
    }
    return fileName;
  }

  clearFileSelection(type , controlName, control, event, thumbElem?) {
    if (type === 'Residential') {
    this.isResidentialAddressAvail = false;
    }
    if (type === 'Mailing') {
      this.isMailingAddressAvail = false;
    }
    const payloadKey = this.getPayloadKey(controlName);
    this.formData.delete(payloadKey);
    this.investmentAccountCommon.clearFileSelection(control, event, thumbElem);
  }

  showProofOfMailingDetails() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    const errorTitle = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.MAILING_ADDRESS_PROOF.TITLE');
    const errorDesc = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.MAILING_ADDRESS_PROOF.MESSAGE');
    ref.componentInstance.errorTitle = errorTitle;
    ref.componentInstance.errorDescription = errorDesc;
  }

  // tslint:disable-next-line:no-identical-functions
  showProofOfResDetails() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    const errorTitle = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.RES_ADDRESS_PROOF.TITLE');
    const errorDesc = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.RES_ADDRESS_PROOF.MESSAGE');
    ref.componentInstance.errorTitle = errorTitle;
    ref.componentInstance.errorDescription = errorDesc;
  }
  showUploadLoader() {
    this.showLoader = true;
    this.loaderTitle = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOADING_LOADER.TITLE');
    this.loaderDesc = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOADING_LOADER.MESSAGE');
  }

  hideUploadLoader() {
    this.showLoader = false;
  }
}
