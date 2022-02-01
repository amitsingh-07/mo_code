import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { LoaderService } from '../../../shared/components/loader/loader.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { RegexConstants } from '../../../shared/utils/api.regex.constants';
import { SIGN_UP_CONFIG } from '../../../sign-up/sign-up.constant';
import { InvestmentAccountCommon } from '../../investment-account/investment-account-common';
import {
  INVESTMENT_ACCOUNT_ROUTE_PATHS
} from '../../investment-account/investment-account-routes.constants';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { INVESTMENT_ACCOUNT_CONSTANTS } from '../../investment-account/investment-account.constant';
import { INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS } from '../../investment-engagement-journey/investment-engagement-journey-routes.constants';
import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from '../../investment-engagement-journey/investment-engagement-journey.constants';
import { InvestmentEngagementJourneyService } from '../../investment-engagement-journey/investment-engagement-journey.service';
import { ProfileIcons } from '../../investment-engagement-journey/recommendation/profileIcons';
import { IToastMessage } from '../../manage-investments/manage-investments-form-data';
import {
  MANAGE_INVESTMENTS_ROUTE_PATHS
} from '../../manage-investments/manage-investments-routes.constants';
import { ManageInvestmentsService } from '../../manage-investments/manage-investments.service';
import {
  AccountCreationErrorModalComponent
} from '../confirm-portfolio/account-creation-error-modal/account-creation-error-modal.component';
import { IAccountCreationActions } from '../investment-common-form-data';
import { INVESTMENT_COMMON_ROUTE_PATHS } from '../investment-common-routes.constants';
import { INVESTMENT_COMMON_CONSTANTS } from '../investment-common.constants';
import { InvestmentCommonService } from '../investment-common.service';
import { PromoCodeService } from './../../../promo-code/promo-code.service';

@Component({
  selector: 'app-add-portfolio-name',
  templateUrl: './add-portfolio-name.component.html',
  styleUrls: ['./add-portfolio-name.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AddPortfolioNameComponent implements OnInit, OnDestroy {
  riskProfileIcon;
  characterLength;
  form: FormGroup;
  pageTitle;

  portfolioNameToBeSaved;
  showErrorMessage = false;
  isSubsequentPortfolio = false;
  isRequestSubmitted = false;
  formValues;
  fundingMethod: string;
  userPortfolioType: any;

  constructor(
    public investmentAccountService: InvestmentAccountService,
    private formBuilder: FormBuilder,
    private router: Router,
    private modal: NgbModal,
    public readonly translate: TranslateService,
    private investmentCommonService: InvestmentCommonService,
    private investmentEngagementService: InvestmentEngagementJourneyService,
    private manageInvestmentsService: ManageInvestmentsService,
    private loaderService: LoaderService,
    private renderer: Renderer2,
    public footerService: FooterService,
    private navbarService: NavbarService,
    private promoCodeService: PromoCodeService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('PORTFOLIO_RECOMMENDATION.ADD_PORTFOLIO_NAME.TITLE');
      this.setPageTitle(this.pageTitle);
      this.renderer.addClass(document.body, 'portfolioname-bg');
    });
    this.userPortfolioType = investmentEngagementService.getUserPortfolioType();
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.formValues = this.investmentAccountService.getInvestmentAccountFormData();
    this.fundingMethod = this.investmentCommonService.getConfirmedFundingMethodName();
    this.riskProfileIcon = ProfileIcons[this.formValues.recommendedRiskProfileId - 1]['icon'];
    this.form = this.formBuilder.group({
      portfolioName: new FormControl('', [Validators.pattern(RegexConstants.portfolioName)])
    });
  }

  submitForm() {
    if (this.form.valid) {
      // Integration with getCKAInfo api and post api is pending.
      let isCPFOA: boolean = JSON.parse(window.sessionStorage.getItem("app_inv_common_session")).portfolioDetails.fundingTypeValue === INVESTMENT_COMMON_CONSTANTS.FUNDING_METHODS.CPF_OA;

      if(isCPFOA) {
        this.investmentCommonService.getCustomerCKAInfo().subscribe((res) => {
          if((res.responseMessage.responseCode === 6000)) {
            let isCKACertificateUploadStatus: boolean = res.objectList.cKAStatusMessage === 'CKA_CERTIFICATE_UPLOAD';
            if (isCKACertificateUploadStatus) {
              this.updatePortfolioAccountStatus();
            } else {
              if (this.form.controls.portfolioName.value) {
                const userPortfolioNameTitleCase = this.convertToTitleCase(this.form.controls.portfolioName.value);
                this.saveNameOrContinueAccountCreation(userPortfolioNameTitleCase);
              } else {
                this.saveNameOrContinueAccountCreation(null);
              }
            }
          }
        });
      } else {
        if (this.form.controls.portfolioName.value) {
          const userPortfolioNameTitleCase = this.convertToTitleCase(this.form.controls.portfolioName.value);
          this.saveNameOrContinueAccountCreation(userPortfolioNameTitleCase);
        } else {
          this.saveNameOrContinueAccountCreation(null);
        }
      }
    }
  }

  saveNameOrContinueAccountCreation(userPortfolioName) {
    if (userPortfolioName && userPortfolioName.toUpperCase() !== this.formValues.defaultPortfolioName.toUpperCase()) {
      this.portfolioNameToBeSaved = userPortfolioName;
      this.savePortfolioName(userPortfolioName);
    } else {
      this.portfolioNameToBeSaved = this.formValues.defaultPortfolioName;
      if (!this.checkIfJointAccount()) {
        this.checkAmlAndCreateAccount();
      } else {
        this.redirectToPortfolioSummary();
      }
    }
  }

  constructSavePortfolioNameParams(portfolioNameValue) {
    return {
      customerPortfolioId: this.formValues.recommendedCustomerPortfolioId,
      portfolioName: portfolioNameValue
    };
  }

  constructUpdatePortfolioAccountStatusParams() {
    return {
      customerPortfolioId: +this.formValues.recommendedCustomerPortfolioId,
    };
  }

  savePortfolioName(portfolioName) {
    this.loaderService.showLoader({
      title: this.translate.instant(
        'PORTFOLIO_RECOMMENDATION.CREATING_ADDITIONAL_ACCOUNT_LOADER.TITLE'
      ),
      desc: this.translate.instant(
        'PORTFOLIO_RECOMMENDATION.CREATING_ADDITIONAL_ACCOUNT_LOADER.DESCRIPTION'
      ),
      autoHide: false
    });
    const param = this.constructSavePortfolioNameParams(portfolioName);
    this.investmentCommonService.savePortfolioName(param).subscribe((response) => {
      this.loaderService.hideLoaderForced();
      if (response.responseMessage.responseCode === 6000) {
        this.investmentAccountService.setDefaultPortfolioName(portfolioName);
        this.showErrorMessage = false;
        if (!this.checkIfJointAccount()) {
          this.checkAmlAndCreateAccount();
        } else {
          this.redirectToPortfolioSummary();
        }
      } else if (response.responseMessage.responseCode === 5120) {
        this.showErrorMessage = true;
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    },
      (err) => {
        this.loaderService.hideLoaderForced();
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  updatePortfolioAccountStatus() {
    this.loaderService.showLoader({
      title: this.translate.instant(
        'PORTFOLIO_RECOMMENDATION.UPDATING_PORTFOLIO_STATUS_LOADER.TITLE'
      ),
      desc: this.translate.instant(
        'PORTFOLIO_RECOMMENDATION.UPDATING_PORTFOLIO_STATUS_LOADER.DESCRIPTION'
      ),
      autoHide: false
    });
    const param = this.constructUpdatePortfolioAccountStatusParams();
    
    //service call to update the investment account status to CKA_CHECK_PENDING will go here
    
    this.investmentCommonService.updatePortfolioStatus(param).subscribe((response) => {
      this.loaderService.hideLoaderForced();
      if (response.responseMessage.responseCode === 6000) {
        this.redirectToPortfolioInProgress();
        this.showErrorMessage = false;
      } else if (response.responseMessage.responseCode === 5120) {
        this.showErrorMessage = true;
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    },
      (err) => {
        this.loaderService.hideLoaderForced();
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  checkAmlAndCreateAccount() {
    this.investmentCommonService.getAccountCreationActions().subscribe((data: IAccountCreationActions) => {
      if (data.accountCreationState && [SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_CREATION_FAILED,
      SIGN_UP_CONFIG.INVESTMENT.CDD_CHECK_FAILED].indexOf(data.accountCreationState) >= 0) {
        // tslint:disable-next-line: no-redundant-boolean
        const cddCheckFailed = (data.accountCreationState === SIGN_UP_CONFIG.INVESTMENT.CDD_CHECK_FAILED) ? true : false;
        const pepData = this.investmentAccountService.getPepData();
        const OldPepData = this.investmentAccountService.getOldPepData();
        if (pepData && !OldPepData) {
          this.goToAdditionalDeclaration();
        } else {
          this.createInvestmentAccount(cddCheckFailed);
        }
      } else if (this.investmentCommonService.isUsersFirstPortfolio(data)) { /* FIRST TIME PORTFOLIO */
        this.verifyAML();
      } else { /* SUBSEQUENT PORTFOLIO */
        this.isSubsequentPortfolio = true;
        this.createInvestmentAccount(false);
      }
    });
  }

  verifyAML() {
    if (!this.isRequestSubmitted) {
      this.isRequestSubmitted = true;
      this.loaderService.showLoader({
        title: this.translate.instant(
          'PORTFOLIO_RECOMMENDATION.CREATING_ACCOUNT_LOADER.TITLE'
        ),
        desc: this.translate.instant(
          'PORTFOLIO_RECOMMENDATION.CREATING_ACCOUNT_LOADER.DESCRIPTION'
        ),
        autoHide: false
      });
      const pepData = this.investmentAccountService.getPepData();
      this.investmentAccountService.verifyAML().subscribe(
        (response) => {
          this.isRequestSubmitted = false;
          this.loaderService.hideLoaderForced();
          if (response.objectList && response.objectList.status) {
            this.investmentAccountService.setAccountCreationStatus(
              response.objectList.status
            );
          }
          if (response.responseMessage.responseCode < 6000) {
            // ERROR SCENARIO
            if (
              response.objectList &&
              response.objectList.length &&
              response.objectList[response.objectList.length - 1].serverStatus &&
              response.objectList[response.objectList.length - 1].serverStatus.errors &&
              response.objectList[response.objectList.length - 1].serverStatus.errors.length
            ) {
              const errorResponse = response.objectList[response.objectList.length - 1];
              const errorList = errorResponse.serverStatus.errors;
              this.showInvestmentAccountErrorModal(errorList);
            } else if (response.responseMessage && response.responseMessage.responseDescription) {
              const errorResponse = response.responseMessage.responseDescription;
              this.showCustomErrorModal('Error!', errorResponse);
            } else {
              this.investmentAccountService.showGenericErrorModal();
            }
          } else if (
            response.objectList.status.toUpperCase() === INVESTMENT_ACCOUNT_CONSTANTS.status.aml_cleared.toUpperCase() &&
            !pepData
          ) {
            this.createInvestmentAccount(false);
          } else {
            this.goToAdditionalDeclaration();
          }
        },
        (err) => {
          this.isRequestSubmitted = false;
          this.loaderService.hideLoaderForced();
          this.investmentAccountService.showGenericErrorModal();
        }
      );
    }
  }

  goToAdditionalDeclaration() {
    this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.ADDITIONALDECLARATION]);
  }

  // tslint:disable-next-line:cognitive-complexity
  createInvestmentAccount(cddFailedStatus) {
    const params = this.constructCreateInvAccountParams(cddFailedStatus);
    if (!this.isRequestSubmitted) {
      this.isRequestSubmitted = true;
      this.loaderService.showLoader({
        title: this.isSubsequentPortfolio ? this.translate.instant(
          'PORTFOLIO_RECOMMENDATION.CREATING_ADDITIONAL_ACCOUNT_LOADER.TITLE'
        ) : this.translate.instant(
          'PORTFOLIO_RECOMMENDATION.CREATING_ACCOUNT_LOADER.TITLE'
        ),
        desc: this.isSubsequentPortfolio ? this.translate.instant(
          'PORTFOLIO_RECOMMENDATION.CREATING_ADDITIONAL_ACCOUNT_LOADER.DESCRIPTION'
        ) : this.translate.instant(
          'PORTFOLIO_RECOMMENDATION.CREATING_ACCOUNT_LOADER.DESCRIPTION'
        ),
        autoHide: false
      });
      this.investmentAccountService.createInvestmentAccount(params).subscribe(
        (response) => {
          this.isRequestSubmitted = false;
          this.loaderService.hideLoaderForced();
          if (response.responseMessage.responseCode < 6000) {
            // ERROR SCENARIO
            if (
              response.objectList &&
              response.objectList.length &&
              response.objectList[response.objectList.length - 1].serverStatus &&
              response.objectList[response.objectList.length - 1].serverStatus.errors &&
              response.objectList[response.objectList.length - 1].serverStatus.errors.length
            ) {
              const errorResponse = response.objectList[response.objectList.length - 1];
              const errorList = errorResponse.serverStatus.errors;
              this.showInvestmentAccountErrorModal(errorList);
            } else if (response.responseMessage && response.responseMessage.responseDescription) {
              const errorResponse = response.responseMessage.responseDescription;
              this.showCustomErrorModal('Error!', errorResponse);
            } else {
              this.investmentAccountService.showGenericErrorModal();
            }
          } else {
            // SUCCESS SCENARIO
            if (response.objectList[response.objectList.length - 1]) {
              // Restrict back navigation
              this.investmentAccountService.restrictBackNavigation();
              if (
                response.objectList[response.objectList.length - 1].data.status.toUpperCase() ===
                INVESTMENT_ACCOUNT_CONSTANTS.status.account_creation_confirmed.toUpperCase()
              ) {
                this.handleAccountCreationSuccess();
              } else {
                this.investmentAccountService.setAccountCreationStatus(
                  INVESTMENT_ACCOUNT_CONSTANTS.status.account_creation_pending
                );
                this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.STATUS]);
              }
              this.investmentCommonService.clearJourneyData();
              // On success remove the applied promo code
              this.promoCodeService.removeAppliedPromo();
            } else {
              this.investmentAccountService.showGenericErrorModal();
            }
          }
        },
        (err) => {
          this.isRequestSubmitted = false;
          this.loaderService.hideLoaderForced();
          this.investmentAccountService.showGenericErrorModal();
        }
      );
    }
  }

  handleAccountCreationSuccess() {
    this.investmentCommonService.setConfirmPortfolioName(this.portfolioNameToBeSaved); /* Needed data for Funding Instructions screen */
    this.setPortfolioSuccessToastMessage(); /* Needed for Investment Overview toast message */
    this.investmentAccountService.setAccountCreationStatus(
      INVESTMENT_ACCOUNT_CONSTANTS.status.account_creation_confirmed
    );
    this.manageInvestmentsService.activateToastMessage();
    if (this.isSubsequentPortfolio) {
      if ((this.fundingMethod).toUpperCase() === 'CASH') {
        if (this.checkIfJointAccount()) {
          this.redirectToPortfolioSummary();
        } else {
          this.redirectToFundAccount();
        }
      } else {
        this.redirectToYourInvestment();
      }
    } else {
      this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.STATUS]);
    }
  }

  setPortfolioSuccessToastMessage() {
    const toastMessage: IToastMessage = {
      isShown: false,
      desc: this.translate.instant('TOAST_MESSAGES.ADD_PORTFOLIO_SUCCESS', { userGivenPortfolioName: this.portfolioNameToBeSaved }),
      link_label: this.translate.instant('TOAST_MESSAGES.VIEW'),
      link_url: MANAGE_INVESTMENTS_ROUTE_PATHS.YOUR_PORTFOLIO,
      id: this.formValues.recommendedCustomerPortfolioId,
    };
    this.manageInvestmentsService.setToastMessage(toastMessage);
  }

  constructCreateInvAccountParams(cddFailedStatus) {
    return {
      isCDDFailed: cddFailedStatus,
      customerPortfolioId: this.formValues.recommendedCustomerPortfolioId,
      promoCodeId: this.promoCodeService.usedPromo.getValue()['id']
    };
  }

  showInvestmentAccountErrorModal(errorList) {
    const errorTitle = this.translate.instant(
      'PORTFOLIO_RECOMMENDATION.ACCOUNT_CREATION_ERROR_MODAL.TITLE'
    );
    const ref = this.modal.open(AccountCreationErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = errorTitle;
    ref.componentInstance.errorList = errorList;
  }

  showCustomErrorModal(title, desc) {
    const errorTitle = title;
    const errorMessage = desc;
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = errorTitle;
    ref.componentInstance.errorMessage = errorMessage;
  }

  updateCharacterCount(event) {
    this.characterLength = event.currentTarget.value.length;
  }

  convertToTitleCase(str) {
    return str.toLowerCase().split(' ')
      .map((name) => name.charAt(0).toUpperCase() + name.substring(1))
      .join(' ').trim().replace(/  +/g, ' ');
  }

  redirectToFundAccount() {
    this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.FUND_INTRO]);
  }

  redirectToPortfolioSummary() {
    this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.PORTFOLIO_SUMMARY]);
  }

  redirectToYourInvestment() {
    this.router.navigate([MANAGE_INVESTMENTS_ROUTE_PATHS.YOUR_INVESTMENT]);
  }

  redirectToPortfolioInProgress() {
    this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.PORTFOLIO_APP_INPROGRESS_SCREEN]);
  }

  clearData() {
    this.investmentAccountService.clearInvestmentAccountFormData();
    this.investmentCommonService.clearJourneyData();
    this.investmentCommonService.clearFundingDetails();
    this.investmentCommonService.clearAccountCreationActions();
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, 'portfolioname-bg');
  }

  checkIfJointAccount() {
    return this.userPortfolioType === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.PORTFOLIO_TYPE.JOINT_ACCOUNT_ID;
  }
}
