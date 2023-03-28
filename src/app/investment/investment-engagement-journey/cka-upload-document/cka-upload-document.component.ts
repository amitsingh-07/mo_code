import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { LoaderService } from '../../../shared/components/loader/loader.service';
import { InvestmentEngagementJourneyService } from '../investment-engagement-journey.service';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { InvestmentCommonService } from '../../investment-common/investment-common.service';
import { UploadDocumentService } from '../../../shared/Services/upload-document.service';

import { ModelWithButtonComponent } from '../../../shared/modal/model-with-button/model-with-button.component';

import { INVESTMENT_ACCOUNT_CONSTANTS } from '../../../investment/investment-account/investment-account.constant';
import { INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS } from '../investment-engagement-journey-routes.constants';
import { INVESTMENT_COMMON_CONSTANTS } from '../../investment-common/investment-common.constants';
import { SIGN_UP_ROUTE_PATHS } from '../../../sign-up/sign-up.routes.constants';
import { MANAGE_INVESTMENTS_ROUTE_PATHS } from '../../manage-investments/manage-investments-routes.constants';
import { INVESTMENT_COMMON_ROUTE_PATHS } from '../../investment-common/investment-common-routes.constants';
@Component({
  selector: 'app-cka-upload-document',
  templateUrl: './cka-upload-document.component.html',
  styleUrls: ['./cka-upload-document.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CkaUploadDocumentComponent implements OnInit {
  defaultThumb: any;
  ckaDocumentInfo: any;
  streamResponse: any;
  pageTitle: string;
  certificateName: String;
  uploadDoc = false;

  ckaUploadForm: FormGroup;
  formData: FormData = new FormData();

  constructor(public readonly translate: TranslateService,
    public modal: NgbModal,
    private router: Router,
    public headerService: HeaderService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private formBuilder: FormBuilder,
    private loaderService: LoaderService,
    public investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    public investmentAccountService: InvestmentAccountService,
    public investmentCommonService: InvestmentCommonService,
    public uploadDocumentService: UploadDocumentService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('NONE_OF_THE_ABOVE.PAGE_TITLE');
      this.setPageTitle(this.pageTitle);
      this.certificateName = this.translate.instant('UPLOAD_DOCUMENTS.CKA_CERTIFICATE');
    });
  }

  ngOnInit(): void {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);

    this.translate.get('UPLOAD_DOCUMENTS').subscribe((result: string) => {
      this.certificateName = result['CKA_CERTIFICATE'];
      this.defaultThumb = INVESTMENT_ACCOUNT_CONSTANTS.upload_documents.default_cka_thumb;
      this.buildForm();
      this.buildDocumentInfo();
    });
  }

  private buildDocumentInfo() {
    this.ckaDocumentInfo = {
      documentType: this.certificateName,
      defaultThumb: this.defaultThumb,
      formData: this.formData
    };

    this.getCKADocumentFromS3();
  }

  private buildForm() {
    this.ckaUploadForm = this.formBuilder.group({
      ckaDoc: this.formBuilder.group({
        document: ['', Validators.required]
      }),
      tncCheckboxFlag: ['', Validators.requiredTrue]
    });
  }

  private getCKADocumentFromS3() {
    const ckaStatus = this.investmentCommonService.getCKAStatus();
    if (ckaStatus && ckaStatus != INVESTMENT_COMMON_CONSTANTS.CKA.CKA_REJECTED_STATUS) {
      this.showLoader();
      this.investmentCommonService.getCKADocument(this.certificateName).subscribe((response: any) => {
        if (response && response['objectList'] && response['objectList']['content']) {
          this.uploadDocumentService.setStreamResponse(response['objectList']);
          this.ckaUploadForm.get('tncCheckboxFlag').setValue(true);
          this.loaderService.hideLoader();
        } else {
          this.loaderService.hideLoader();
          this.investmentAccountService.showGenericErrorModal();
        }
      }, () => {
        this.loaderService.hideLoader();
        this.investmentAccountService.showGenericErrorModal();
      });
    }
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  reselect() {
    this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.CKA_ASSESSMENT]);
  }

  goToNext() {
    const fromLocation = this.investmentCommonService.getCKARedirectFromLocation();
    if (fromLocation && fromLocation.includes(INVESTMENT_COMMON_CONSTANTS.CKA_REDIRECT_CONSTS.PROFILE)) {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);      
    } else if (fromLocation && fromLocation.includes(INVESTMENT_COMMON_CONSTANTS.CKA_REDIRECT_CONSTS.PREREQUISITES)) {
      this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.CPF_PREREQUISITES]);      
    } else if (fromLocation && fromLocation.includes(INVESTMENT_COMMON_CONSTANTS.CKA_REDIRECT_CONSTS.TOPUP)) {
      this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.TOPUP]);      
    }
  }

  eventTriggered(event) {
    if (event && event.clearBtn) {
      this.ckaUploadForm.get('tncCheckboxFlag').setValue(false);
    }

    if (event && event.fileSelected) {
      this.uploadDoc = true;
    }
  }

  uploadDocument() {
    if (this.ckaUploadForm.valid && this.uploadDoc) {
      this.showInstantLoader();
      if (this.formData) {
        this.investmentEngagementJourneyService.uploadDocument(this.formData).subscribe((response) => {
          this.loaderService.hideLoader();
          if (response && response.objectList &&
            response.objectList.length &&
            response.objectList[response.objectList.length - 1].responseInfo) {
            this.gentleReminderPopup();
          }
        }, () => {
          this.loaderService.hideLoader();
          this.investmentAccountService.showGenericErrorModal();
        });
      }
    } else {
      this.goToNext();
    }
  }

  private showLoader() {
    this.translate.get('UPLOAD_DOCUMENTS').subscribe((result: string) => {
      this.loaderService.showLoader({
        title: result['MODAL.UPLOADING_LOADER.TITLE'],
        desc: result['MODAL.UPLOADING_LOADER.MESSAGE']
      });
    });
  }

  private showInstantLoader() {
    this.loaderService.showLoader({
      title: this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOADING_LOADER.TITLE'),
      desc: this.translate.instant('UPLOAD_DOCUMENTS.MODAL.UPLOADING_LOADER.MESSAGE')
    });
  }

  private gentleReminderPopup() {
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true, windowClass: 'custom-cka-upload' });
    ref.componentInstance.imgType = 1;
    ref.componentInstance.errorTitle = this.translate.instant('CKA_UPLOAD_DOCUMENT.GENTLE_REMINDER_TITLE');
    ref.componentInstance.errorMessageHTML = this.translate.instant('CKA_UPLOAD_DOCUMENT.GENTLE_REMINDER_DESC');
    ref.componentInstance.primaryActionLabel = this.translate.instant('UPLOAD_DOCUMENTS.OKAY_GOT_IT_BTN');
    ref.componentInstance.closeBtn = false;
    ref.componentInstance.primaryAction.subscribe(() => {
      this.goToNext();
    });
  }
}
