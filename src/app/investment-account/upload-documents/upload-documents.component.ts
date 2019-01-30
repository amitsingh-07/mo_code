import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { FooterService } from 'src/app/shared/footer/footer.service';
import { HeaderService } from '../../shared/header/header.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import {
  ModelWithButtonComponent
} from '../../shared/modal/model-with-button/model-with-button.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { InvestmentAccountCommon } from '../investment-account-common';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../investment-account-routes.constants';
import { InvestmentAccountService } from '../investment-account-service';
import { INVESTMENT_ACCOUNT_CONFIG } from '../investment-account.constant';

@Component({
  selector: 'app-upload-documents',
  templateUrl: './upload-documents.component.html',
  styleUrls: ['./upload-documents.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UploadDocumentsComponent implements OnInit {

  uploadForm: FormGroup;
  pageTitle: string;
  formValues;
  countries;
  isUserNationalitySingapore;
  defaultThumb;
  loaderVisible;
  loaderInfo;
  formData: FormData = new FormData();
  investmentAccountCommon: InvestmentAccountCommon = new InvestmentAccountCommon();
  constructor(
    public readonly translate: TranslateService,
    private formBuilder: FormBuilder,
    private router: Router,
    public headerService: HeaderService,
    private modal: NgbModal,
    public navbarService: NavbarService,
    public footerService: FooterService,
    public investmentAccountService: InvestmentAccountService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('UPLOAD_DOCUMENTS.TITLE');
      this.setPageTitle(this.pageTitle);
      this.defaultThumb = INVESTMENT_ACCOUNT_CONFIG.upload_documents.default_thumb;
      this.loaderVisible = false;
    });
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.isUserNationalitySingapore = this.investmentAccountService.isSingaporeResident();
    this.formValues = this.investmentAccountService.getInvestmentAccountFormData();
    this.uploadForm = this.isUserNationalitySingapore ? this.buildFormForSingapore() : this.buildFormForOtherCountry();
    this.addOrRemoveMailingAddressproof();
  }

  buildFormForSingapore(): FormGroup {
    return this.formBuilder.group({
      nricFrontImage: [this.formValues.nricFrontImage, Validators.required],
      nricBackImage: [this.formValues.nricBackImage, Validators.required]
    });
  }

  buildFormForOtherCountry(): FormGroup {
    return this.formBuilder.group({
      passportImage: [this.formValues.passportImage, Validators.required],
      resAddressProof: [this.formValues.resAddressProof, Validators.required]
    });
  }
  addOrRemoveMailingAddressproof() {
    if (!(this.formValues.isMailingAddressSame)) {
      this.uploadForm.addControl('mailAdressProof', new FormControl('', Validators.required));
    }
  }
  getInlineErrorStatus(control) {
    return (!control.pristine && !control.valid);
  }

  setNestedDropDownValue(key, value, nestedKey) {
    this.uploadForm.controls[nestedKey]['controls'][key].setValue(value);
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

  uploadDocument() {
    this.showUploadLoader();
    this.investmentAccountService.uploadDocument(this.formData).subscribe((response) => {
      if (response) {
        // INTERIM SAVE
        this.investmentAccountService.saveInvestmentAccount().subscribe((data) => {
          this.hideUploadLoader();
          this.redirectToNextPage();
        });
      }
    });
  }

  setThumbnail(thumbElem, file) {
    // Set Thumbnail
    this.investmentAccountCommon.setThumbnail(thumbElem, file);
  }

  getFileName(fileElem) {
    const fileName = this.investmentAccountCommon.getFileName(fileElem);
    return fileName;
  }

  clearFileSelection(control, event, thumbElem?, fileElem?) {
    this.investmentAccountCommon.clearFileSelection(control, event, thumbElem, fileElem);
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

  goToNext(form) {
    if (!form.valid) {
      const errorTitle = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOAD_LATER.TITLE');
      const errorMessage = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOAD_LATER.MESSAGE');
      const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
      ref.componentInstance.errorTitle = errorTitle;
      ref.componentInstance.errorMessageHTML = errorMessage;
      ref.componentInstance.primaryActionLabel = this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOAD_LATER.CONFIRM_PROCEED');
      ref.componentInstance.primaryAction.subscribe(() => {
        this.investmentAccountService.saveInvestmentAccount().subscribe((data) => {
          this.investmentAccountService.setAccountCreationStatus(INVESTMENT_ACCOUNT_CONFIG.status.documents_pending);
          this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.SETUP_PENDING]);
        });
      });
    } else {
      this.proceed(form);
    }
  }

  proceed(form) {
    this.uploadDocument();
  }

  showUploadLoader() {
    this.loaderVisible = true;
    this.loaderInfo = {
      title: this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOADING_LOADER.TITLE'),
      desc: this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOADING_LOADER.MESSAGE')
    };
  }

  hideUploadLoader() {
    this.loaderVisible = false;
  }

  redirectToNextPage() {
    const boStatus = this.investmentAccountService.getBOStatus();
    if (boStatus) {
      this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.UPLOAD_DOCUMENTS_BO]);
    } else {
      this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.ACKNOWLEDGEMENT]);
    }
  }

}
