
import { of as observableOf, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { LoaderService } from '../../shared/components/loader/loader.service';
import { SIGN_UP_ROUTE_PATHS } from '../../sign-up/sign-up.routes.constants';
import {
  INVESTMENT_ACCOUNT_ROUTE_PATHS
} from '../investment-account/investment-account-routes.constants';
import { InvestmentAccountService } from '../investment-account/investment-account-service';
import { InvestmentApiService } from '../investment-api.service';
import {
  INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS
} from '../investment-engagement-journey/investment-engagement-journey.constants';
import {
  InvestmentEngagementJourneyService
} from '../investment-engagement-journey/investment-engagement-journey.service';
import {
  IAccountCreationActions, IInvestmentCriteria, InvestmentCommonFormData
} from './investment-common-form-data';
import { INVESTMENT_COMMON_ROUTES, INVESTMENT_COMMON_ROUTE_PATHS } from './investment-common-routes.constants';
import { INVESTMENT_COMMON_CONSTANTS } from './investment-common.constants';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SignUpService } from '../../sign-up/sign-up.service';

const SESSION_STORAGE_KEY = 'app_inv_common_session';
@Injectable({
  providedIn: 'root'
})
export class InvestmentCommonService {

  constructor(
    private investmentCommonFormData: InvestmentCommonFormData,
    private investmentApiService: InvestmentApiService,
    private investmentAccountService: InvestmentAccountService,
    private translate: TranslateService,
    private router: Router,
    private investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    private loaderService: LoaderService,
    public navbarService: NavbarService,
    private signUpService: SignUpService
  ) {
    this.getInvestmentCommonFormData();
  }
  savePortfolioName(data) {
    return this.investmentApiService.savePortfolioName(data);
  }

  updatePortfolioStatus(data: { customerPortfolioId: number }) {
    return this.investmentApiService.updatePortfolioStatus(data);
  }

  confirmPortfolio(customerPortfolioId) {
    return this.investmentApiService.confirmPortfolio(customerPortfolioId);
  }
  // Return the entire Form Data
  getInvestmentCommonFormData() {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      this.investmentCommonFormData = JSON.parse(
        sessionStorage.getItem(SESSION_STORAGE_KEY)
      );
    }
    return this.investmentCommonFormData;
  }

  commit() {
    if (window.sessionStorage) {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify(this.investmentCommonFormData)
      );
    }
  }

  clearData() {
    this.clearInvestmentCommonFormData();
    if (window.sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  clearFundingDetails() {
    this.investmentCommonFormData.initialFundingMethodId = null;
    this.investmentCommonFormData.confirmedFundingMethodId = null;
    this.investmentCommonFormData.fundingType = null;
    this.investmentCommonFormData.srsOperatorBank = null;
    this.investmentCommonFormData.srsAccountNumber = null;
    this.investmentCommonFormData.initialWiseIncomePayoutTypeId = null;
    this.investmentCommonFormData.wiseIncomeActiveTabId = null;
    this.commit();
  }

  clearInvestmentCommonFormData() {
    this.investmentCommonFormData = new InvestmentCommonFormData();
    this.commit();
  }

  setAccountCreationActionsToSession(accountCreationActions: IAccountCreationActions) {
    this.investmentCommonFormData.accountCreationActions = accountCreationActions;
    this.commit();
  }

  clearAccountCreationActions() {
    this.investmentCommonFormData.accountCreationActions = null;
    this.commit();
  }

  getAccountCreationActions(enquiryId?): Observable<IAccountCreationActions> {
    const accStatusInfoFromSession = this.getInvestmentCommonFormData().accountCreationActions;
    if (accStatusInfoFromSession) {
      return observableOf(accStatusInfoFromSession);
    } else {
      return this.getFirstInvAccountCreationStatus(enquiryId).pipe(map((data: any) => {
        if (data && data.objectList) {
          this.setAccountCreationActionsToSession(data.objectList);
          return {
            accountCreationState: data.objectList.accountCreationState,
            allowEngagementJourney: data.objectList.allowEngagementJourney,
            portfolioLimitExceeded: data.objectList.portfolioLimitExceeded,
            showInvestmentAccountCreationForm: data.objectList.showInvestmentAccountCreationForm,
            enquiryMappedToCustomer: data.objectList.enquiryMappedToCustomer
          };
        } else {
          this.investmentAccountService.showGenericErrorModal();
        }
      },
        (err) => {
          this.investmentAccountService.showGenericErrorModal();
        }));
    }
  }

  getFirstInvAccountCreationStatus(enquiryId?) {
    return this.investmentApiService.getFirstInvAccountCreationStatus(enquiryId);
  }

  /* Login Redirection Logic */
  redirectToInvestmentFromLogin(enquiryId) {
    this.getAccountCreationActions(enquiryId).subscribe((data: IAccountCreationActions) => {
      if (enquiryId && !data.enquiryMappedToCustomer) { /* enquiryId will not be available only in sign up flow */
        if (data.portfolioLimitExceeded) { // HAVE LESS THAN 20 PORTFOLIOS?
          this.goToDashboard('INVESTMENT_ADD_PORTFOLIO_ERROR.MAX_PORTFOLIO_LIMIT_TITLE',
            'INVESTMENT_ADD_PORTFOLIO_ERROR.MAX_PORTFOLIO_LIMIT_ERROR');
        } else if (!data.allowEngagementJourney) { // ACCOUNT CREATION PENDING ?
          this.goToDashboard('INVESTMENT_ADD_PORTFOLIO_ERROR.ACCOUNT_CREATION_PENDING_TITLE',
            'INVESTMENT_ADD_PORTFOLIO_ERROR.ACCOUNT_CREATION_PENDING_ERROR');
        } else {
          this.goToDashboard();
        }
      } else if (this.isUsersFirstPortfolio(data)) {// FIRST PORTFOLIO
        this.goToFirstAccountCreation(data);
      } else { // SECOND PORTFOLIO
        this.goToAdditionalAccountCreation(data);
      }
    });
  }

  goToFirstAccountCreation(data) {
    this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.START]);
  }

  goToAdditionalAccountCreation(data) {
    if (data.accountCreationState === INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_PURCHASED) {
      this.navbarService.setMenuItemInvestUser(true);
    }
    if (this.signUpService.getRedirectUrl() && this.signUpService.getRedirectUrl().indexOf(INVESTMENT_COMMON_ROUTES.ACCEPT_JA_HOLDER) >= 0) {
      const redirectURL = this.signUpService.getRedirectUrl();
      this.signUpService.clearRedirectUrl();
      this.router.navigate([redirectURL]);
      return;
    }
    this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.CONFIRM_PORTFOLIO]);
  }

  setInvestmentsSummary(investmentsSummary) {
    this.investmentCommonFormData.investmentsSummary = investmentsSummary;
    this.commit();
  }

  getInvestmentStatus() {
    const investmentsSummary = this.investmentCommonFormData.investmentsSummary;
    const investmentStatus = investmentsSummary && investmentsSummary.investmentAccountStatus &&
      investmentsSummary.investmentAccountStatus.accountCreationState ?
      investmentsSummary.investmentAccountStatus.accountCreationState.toUpperCase() : null;
    return investmentStatus;
  }

  setConfirmPortfolioName(data) {
    this.investmentCommonFormData.portfolioName = data;
    this.commit();
  }

  getConfirmPortfolioName() {
    return this.investmentCommonFormData.portfolioName;
  }

  clearConfirmPortfolioName() {
    this.investmentCommonFormData.portfolioName = null;
    this.commit();
  }

  setCKARedirectFromLocation(redirectLocation) {
    this.investmentCommonFormData.ckaRedirectFromLocation = redirectLocation;
    this.commit();
  }

  getCKARedirectFromLocation() {
    return this.investmentCommonFormData.ckaRedirectFromLocation;
  }

  isUsersFirstPortfolio(data: IAccountCreationActions) {
    if (data.showInvestmentAccountCreationForm
      && INVESTMENT_COMMON_CONSTANTS.FIRST_PORTFOLIO_GUARD.indexOf(data.accountCreationState) < 0) {
      return true;
    }
    return false;
  }

  isUserNotAllowed(data: IAccountCreationActions) {
    if (INVESTMENT_COMMON_CONSTANTS.NOT_ALLOW_USER_GUARD.indexOf(data.accountCreationState) >= 0) {
      return true;
    }
    return false;
  }

  clearJourneyData() {
    this.investmentEngagementJourneyService.clearData();
    this.clearAccountCreationActions();
  }

  goToDashboard(title?, error?) {
    if (title && error) {
      const dashboardMessage = {
        show: true,
        title: this.translate.instant(title),
        desc: this.translate.instant(error)
      };
      this.investmentAccountService.setDashboardInitialMessage(dashboardMessage);
    }
    this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
  }
  getInitialFundingMethod() {
    return {
      initialFundingMethodId: this.investmentCommonFormData.initialFundingMethodId
    };
  }
  setInitialFundingMethod(data) {
    this.investmentCommonFormData.initialFundingMethodId = data.initialFundingMethodId;
    this.commit();
  }
  setConfirmedFundingMethod(data) {
    this.investmentCommonFormData.confirmedFundingMethodId = data.confirmedFundingMethodId;
    this.commit();
  }
  getConfirmedFundingMethodName() {
    return this.investmentCommonFormData.fundingType;
  }
  clearConfirmedFundingMethod() {
    this.investmentCommonFormData.confirmedFundingMethodId = null;
    this.commit();
  }
  // tslint:disable-next-line:no-identical-functions
  getFundingAccountDetails() {
    return {
      fundingAccountMethod: this.investmentCommonFormData.confirmedFundingMethodId,
      srsOperatorBank: this.investmentCommonFormData.srsOperatorBank,
      srsAccountNumber: this.investmentCommonFormData.srsAccountNumber
    };
  }
  setFundingAccountDetails(data, fundingType) {
    this.investmentCommonFormData.fundingType = fundingType;
    this.investmentCommonFormData.confirmedFundingMethodId = data.confirmedFundingMethodId;
    this.investmentCommonFormData.srsOperatorBank = data.srsFundingDetails ? data.srsFundingDetails.srsOperatorBank : null;
    this.investmentCommonFormData.srsAccountNumber = data.srsFundingDetails ? data.srsFundingDetails.srsAccountNumber : null;
    this.commit();
  }
  saveSrsAccountDetails(params, customerPortfolioId) {
    return this.investmentApiService.saveSrsAccountDetails(params, customerPortfolioId);
  }
  saveProfileSrsAccountDetails(params, customerId) {
    return this.investmentApiService.saveProfileSrsAccountDetails(params, customerId);
  }

  getInvestmentCriteriaFromApi(selectPortfolioType) {
    const params = this.constructParamsForInvestmentCriteria(selectPortfolioType);
    return this.investmentApiService.getInvestmentCriteria(params);
  }

  constructParamsForInvestmentCriteria(selectPortfolioType) {
    return {
      features: [
        'ONE_TIME_INVESTMENT_MINIMUM',
        'MONTHLY_INVESTMENT_MINIMUM'
      ],
      "portfolioType": selectPortfolioType
    };
  }

  getInvestmentCriteria(selectPortfolioType): Observable<IInvestmentCriteria> {
    this.loaderService.showLoader({
      title: this.translate.instant('COMMON_LOADER.TITLE'),
      desc: this.translate.instant('COMMON_LOADER.DESC')
    });
    return this.getInvestmentCriteriaFromApi(selectPortfolioType).pipe(map((data: any) => {
      this.loaderService.hideLoader();
      return data.objectList;
    }), catchError(
      (error) => {
        this.loaderService.hideLoader();
        // getDefault placeholder
        return observableOf(null);
      }
    ));
  }
  setPortfolioType(portfolioType) {
    this.investmentCommonFormData.portfolioType = portfolioType;
    this.commit();
  }
  getPortfolioType() {
    return {
      portfolioType: this.investmentCommonFormData.portfolioType
    };
  }
  getWiseSaverDetails() {
    return this.investmentApiService.getWiseSaverDetails();
  }
  //WISE INCOME PAYOUT METHOD
  setWiseIncomePayOut(data, activeTabId) {
    this.investmentCommonFormData.initialWiseIncomePayoutTypeId = data.initialWiseIncomePayoutTypeId;
    this.investmentCommonFormData.wiseIncomeActiveTabId = activeTabId;
    this.commit();
  }
  getWiseIncomePayOut() {
    return {
      initialWiseIncomePayoutTypeId: this.investmentCommonFormData.initialWiseIncomePayoutTypeId,
      activeTabId: this.investmentCommonFormData.wiseIncomeActiveTabId
    }
  }
  setPortfolioDetails(portfolioDetails) {
    this.investmentCommonFormData.portfolioDetails = portfolioDetails;
  }
  getPortfolioDetails() {
    return {
      portfolioDetails: this.investmentCommonFormData.portfolioDetails
    }
  }
  //  nric validation
  constructValidationInfo(data, source) {
    return {
      uin: data,
      source: source,
    };
  }
  getUserNricValidation(data, source) {
    const payload = this.constructValidationInfo(data, source);
    return this.investmentApiService.getUserNricValidationInfo(payload);
  }
  saveUpdateSessionData(formData) {
    let activeTabId;
    switch (formData.payoutType) {
      case INVESTMENT_COMMON_CONSTANTS.WISE_INCOME_PAYOUT.GROW:
        activeTabId = 1;
        break;
      case INVESTMENT_COMMON_CONSTANTS.WISE_INCOME_PAYOUT.FOUR_PERCENT:
        activeTabId = 2;
        break;
      case INVESTMENT_COMMON_CONSTANTS.WISE_INCOME_PAYOUT.EIGHT_PERCENT:
        activeTabId = 3;
        break;
    }
    if (formData && formData.payoutTypeId) {
      this.setWiseIncomePayOut({ initialWiseIncomePayoutTypeId: formData.payoutTypeId }, activeTabId);
    }
    if (formData && formData.investmentPeriod) {
      this.investmentEngagementJourneyService.setPersonalInfo({ investmentPeriod: formData.investmentPeriod });
    }
    const investmentFormData = this.setYourInvestmentAmount(formData);
    this.investmentEngagementJourneyService.setYourInvestmentAmount(investmentFormData);
    if (!this.investmentAccountService.isReassessActive()) {
      this.setInitialFundingMethod({ initialFundingMethodId: formData.fundingTypeId });
    }
    const portfolioType = this.toDecidedPortfolioType(formData.portfolioType);
    this.investmentEngagementJourneyService.setSelectPortfolioType({ selectPortfolioType: portfolioType })
    this.commit();

  }
  setYourInvestmentAmount(formData) {
    if (formData && formData.initialInvestment && formData.monthlyInvestment) {
      return {
        initialInvestment: formData.initialInvestment,
        monthlyInvestment: formData.monthlyInvestment,
        firstChkBox: true,
        secondChkBox: true
      }
    } else if (formData && formData.initialInvestment) {
      return {
        initialInvestment: formData.initialInvestment,
        firstChkBox: true,
        secondChkBox: false
      }
    } else {
      return {
        monthlyInvestment: formData.monthlyInvestment,
        firstChkBox: false,
        secondChkBox: true
      }
    }
  }
  toDecidedPortfolioType(selectedPortfolioValue) {
    if (selectedPortfolioValue.toUpperCase() ===
      INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER.toUpperCase()) {
      return INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER_PORTFOLIO
    } else if (selectedPortfolioValue.toUpperCase() ===
      INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVESTMENT.toUpperCase()) {
      return INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVEST_PORTFOLIO
    } else if (selectedPortfolioValue.toUpperCase() ===
      INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.CPF_PORTFOLIO.toUpperCase()) {
      return INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.CPF_PORTFOLIO
    } else {
      return INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME_PORTFOLIO
    }
  }
  acceptAndGetPortfolioDetails(customerPortfolioId) {
    return this.investmentApiService.acceptAndGetPortfolioDetails(customerPortfolioId);
  }
  // GET THE PORTFOLIO SUMMARY DETAILS FOR PORTFOLIO SUMMARY PAGE
  getPortFolioSummaryDetails(customerPortfolioId) {
    return this.investmentApiService.getPortFolioSummaryDetails(customerPortfolioId);
  }

  getJAAccountDetails(customerPortfolioId, isJAAccount, isEngagementJourney) {
    return this.investmentApiService.getJABankDetails(customerPortfolioId, isJAAccount, isEngagementJourney);
  }

  setNavigationType(url, expectedURL, navigationType) {
    if (url.indexOf(expectedURL) >= 0) {
      return navigationType;
    }
    return null;
  }

  private formCKAMethod1SaveRequest(json) {
    if (json && json.others) {
      return {
        hasEduQualification: true,
        eduQualOptionId: json.question1.id,
        eduQualInstitutionOptionId: json.question2.id,
        eduQualInstitutionOthers: json.others
      }
    } else {
      return {
        hasEduQualification: true,
        eduQualOptionId: json.question1.id,
        eduQualInstitutionOptionId: json.question2.id,
        eduQualInstitutionOthers: ''
      }
    }
  }

  private formCKAMethod2SaveRequest(json) {
    if (json && json.others) {
      return {
        hasFinQualification: true,
        finQualOptionId: json.question1.id,
        finQualInstitutionOptionId: json.question2.id,
        finQualInstitutionOthers: json.others
      }
    } else {
      return {
        hasFinQualification: true,
        finQualOptionId: json.question1.id,
        finQualInstitutionOptionId: json.question2.id,
        finQualInstitutionOthers: ''
      }
    }
  }

  private formCKAMethod3SaveRequest(json) {
    if (json && json.others) {
      return {
        hasInvestQualification: true,
        investExpUnListedSIP: json.question1.id,
        investExpUnListedSIPOthers: json.others
      }
    } else {
      return {
        hasInvestQualification: true,
        investExpUnListedSIP: json.question1.id,
        investExpUnListedSIPOthers: ''
      }
    }
  }

  private formCKAMethod4SaveRequest(json) {
    if (json && json.others) {
      return {
        hasWorkExperience: true,
        workExpOptionId: json.question1.id,
        workExpCompanyOptionId: json.question2.id,
        workExpCompanyOthers: json.others
      }
    } else {
      return {
        hasWorkExperience: true,
        workExpOptionId: json.question1.id,
        workExpCompanyOptionId: json.question2.id,
        workExpCompanyOthers: ''
      }
    }
  }

  formCKASaveReq(json) {
    if (json.method === INVESTMENT_COMMON_CONSTANTS.CKA.METHODS[0]) {
      return this.formCKAMethod1SaveRequest(json);
    } else if (json.method === INVESTMENT_COMMON_CONSTANTS.CKA.METHODS[1]) {
      return this.formCKAMethod2SaveRequest(json);
    } else if (json.method === INVESTMENT_COMMON_CONSTANTS.CKA.METHODS[3]) {
      return this.formCKAMethod4SaveRequest(json);
    } else if (json.method === INVESTMENT_COMMON_CONSTANTS.CKA.METHODS[2]) {
      return this.formCKAMethod3SaveRequest(json);
    }
  }

  saveCKAMethodQNA(json: any) {
    const req = this.formCKASaveReq(json);
    return this.investmentApiService.saveCKAMethodQNA(req);
  }

  getCKADocument(documentType) {
    const data = {
      "docType": documentType
    };
    return this.investmentApiService.getCKADocument(data);
  }

  setCKAStatus(ckaStatus) {
    this.investmentCommonFormData.ckaStatus = ckaStatus;
    this.commit();
  }

  getCKAStatus() {
    return this.investmentCommonFormData.ckaStatus;
  }

  getCKAAssessmentStatus() {
    return this.investmentApiService.getCKAAssessmentStatus();
  }

  getCKABankDetails(twoFaReq) {
    return this.investmentApiService.getCKABankAccount(twoFaReq);
  }

  saveCKABankAccount(data) {
    return this.investmentApiService.saveCKABankAccount(data);
  }

  setCKAInformation(ckaInfo) {
    this.investmentCommonFormData.ckaDetails = ckaInfo;
    this.commit();
  }

  getCKAInformation() {
    return this.investmentCommonFormData.ckaDetails;
  }

  setIfCPFBankEdited(isCPFBankEdited: string) {
    this.investmentCommonFormData.isCPFBankEdited = isCPFBankEdited;
    this.commit();
  }

  getIfCPFBankEdited() {
    return this.investmentCommonFormData.isCPFBankEdited;
  }
}
