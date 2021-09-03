import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { appConstants } from '../../app.constants';
import { ApiService } from '../../shared/http/api.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { SignUpService } from '../../sign-up/sign-up.service';
import { InvestmentApiService } from '../investment-api.service';
import { InvestmentEngagementJourneyFormData } from './investment-engagement-journey-form-data';
import { InvestmentEngagementJourneyFormErrors } from './investment-engagement-journey-form-errors';
import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from './investment-engagement-journey.constants';
import { PersonalInfo } from './investment-period/investment-period';

const PORTFOLIO_RECOMMENDATION_COUNTER_KEY = 'portfolio_recommendation-counter';
const SESSION_STORAGE_KEY = 'app_engage_journey_session';
@Injectable({
  providedIn: 'root'
})
export class InvestmentEngagementJourneyService {
  private investmentEngagementJourneyFormData: InvestmentEngagementJourneyFormData = new InvestmentEngagementJourneyFormData();
  private investmentEngagementJourneyFormErrors: any = new InvestmentEngagementJourneyFormErrors();
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private signUpService: SignUpService,
    private investmentApiService: InvestmentApiService,
    public authService: AuthenticationService
  ) {
    this.getPortfolioFormData();
  }

  commit() {
    if (window.sessionStorage) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.investmentEngagementJourneyFormData));
    }
  }

  getPortfolioFormData(): InvestmentEngagementJourneyFormData {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      this.investmentEngagementJourneyFormData = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
    }
    return this.investmentEngagementJourneyFormData;
  }

  // GET PERSONAL INFO
  getPersonalInfo() {
    return {
      // dob: this.investmentEngagementJourneyFormData.dob,
      investmentPeriod: this.investmentEngagementJourneyFormData.investmentPeriod
    };
  }


  // Risk Profile
  getRiskProfile() {
    return {
      riskProfileId: this.investmentEngagementJourneyFormData.riskProfileId,
      riskProfileName: this.investmentEngagementJourneyFormData.riskProfileName,
      htmlDescription: this.investmentEngagementJourneyFormData.htmlDescription,
      alternateRiskProfileId: this.investmentEngagementJourneyFormData.alternateRiskProfileId,
      alternateRiskProfileType: this.investmentEngagementJourneyFormData.alternateRiskProfileType
    };
  }

  setRiskProfile(data) {
    this.investmentEngagementJourneyFormData.riskProfileId = data.primaryRiskProfileId;
    this.investmentEngagementJourneyFormData.riskProfileName = data.primaryRiskProfileType;
    this.investmentEngagementJourneyFormData.htmlDescription = data.htmlDescObject;
    this.investmentEngagementJourneyFormData.alternateRiskProfileId = data.alternateRiskProfileId;
    this.investmentEngagementJourneyFormData.alternateRiskProfileType = data.alternateRiskProfileType;

    this.commit();
  }
  setSelectedRiskProfileId(RiskProfileID) {
    this.investmentEngagementJourneyFormData.selectedriskProfileId = RiskProfileID;
  }
  getSelectedRiskProfileId() {
    return {
      riskProfileId: this.investmentEngagementJourneyFormData.selectedriskProfileId
    };
  }

  currentFormError(form) {
    const invalid = [];
    const invalidFormat = [];
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        invalidFormat.push(Object.keys(controls[name]['errors']));
      }
    }
    return this.getFormError(invalid[0], invalidFormat[0][0]);
  }
  getFormError(formCtrlName: string, validation: string): string {
    return this.investmentEngagementJourneyFormErrors.formFieldErrors[formCtrlName][validation];
  }

  // tslint:disable-next-line:cognitive-complexity
  investmentAmountValidation(form, investmentCriteria) {
    if (form.value.firstChkBox && form.value.secondChkBox) {
      // tslint:disable-next-line:max-line-length
      if (
        Number(this.removeCommas(form.value.initialInvestment)) <
        investmentCriteria.oneTimeInvestmentMinimum &&
        Number(this.removeCommas(form.value.monthlyInvestment)) <
        investmentCriteria.monthlyInvestmentMinimum
      ) {
        return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['one'];
      } else if (
        Number(this.removeCommas(form.value.monthlyInvestment)) <
        investmentCriteria.monthlyInvestmentMinimum
      ) {
        return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['two'];
      } else if (
        Number(this.removeCommas(form.value.initialInvestment)) <
        investmentCriteria.oneTimeInvestmentMinimum
      ) {
        return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['three'];
      }
    } else if (form.value.firstChkBox) {
      if (
        Number(this.removeCommas(form.value.initialInvestment)) <
        investmentCriteria.oneTimeInvestmentMinimum
      ) {
        return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['three'];
      }
    } else if (form.value.secondChkBox) {
      if (
        Number(this.removeCommas(form.value.monthlyInvestment)) <
        investmentCriteria.monthlyInvestmentMinimum
      ) {
        return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['two'];
      }
    } else {
      return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['four'];
    }
    // tslint:disable-next-line:triple-equals
    if (
      Number(this.removeCommas(form.value.initialInvestment)) === 0 &&
      Number(this.removeCommas(form.value.monthlyInvestment)) === 0
    ) {
      return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['zero'];
      // tslint:disable-next-line:max-line-length
    } else if (
      Number(this.removeCommas(form.value.initialInvestment)) < investmentCriteria.oneTimeInvestmentMinimum &&
      Number(this.removeCommas(form.value.monthlyInvestment)) < investmentCriteria.monthlyInvestmentMinimum
    ) {
      return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['more'];
      // tslint:disable-next-line:max-line-length
    } else {
      return false;
    }
  }
  financialValidation(form, investAmount) {
    if (
      Number(this.removeCommas(investAmount.initialInvestment)) >
      Number(this.removeCommas(form.value.totalAssets)) &&
      Number(this.removeCommas(investAmount.monthlyInvestment)) >
      (Number(this.removeCommas(form.value.percentageOfSaving)) *
        Number(this.removeCommas(form.value.monthlyIncome)) / 100)
    ) {
      return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations'][
        'moreassetandinvestment'
      ];
    } else if (
      Number(this.removeCommas(investAmount.initialInvestment)) >
      Number(this.removeCommas(form.value.totalAssets))
    ) {
      return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations']['moreasset'];
      // tslint:disable-next-line:max-line-length
    } else if (
      Number(this.removeCommas(investAmount.monthlyInvestment)) >
      (Number(this.removeCommas(form.value.percentageOfSaving)) *
        Number(this.removeCommas(form.value.monthlyIncome)) / 100)
    ) {
      return this.investmentEngagementJourneyFormErrors.formFieldErrors['financialValidations'][
        'moreinvestment'
      ];
    } else {
      return false;
    }
  }
  // tslint:disable-next-line:cognitive-complexity
  removeCommas(str) {
    if (str) {
      if (str.length > 3) {
        while (str.search(',') >= 0) {
          str = (str + '').replace(',', '');
        }
      }
    }
    return str;
  }

  setPersonalInfo(data: PersonalInfo) {
    this.investmentEngagementJourneyFormData.investmentPeriod = data.investmentPeriod;
    this.commit();
  }

  // RISK ASSESSMENT
  getQuestionsList() {
    return this.investmentApiService.getQuestionsList();
  }
  constructGetQuestionsRequest() { }

  getSelectedOptionByIndex(index) {
    return this.investmentEngagementJourneyFormData['riskAssessQuest' + index];
  }
  setRiskAssessment(data, questionIndex) {
    this.investmentEngagementJourneyFormData['riskAssessQuest' + questionIndex] = data;
    this.commit();
  }

  // SAVE FOR STEP 2
  saveRiskAssessment() {
    const data = this.constructRiskAssessmentSaveRequest();
    return this.investmentApiService.saveRiskAssessment(data);
  }
  constructRiskAssessmentSaveRequest() {
    const formData = this.getPortfolioFormData();
    const selAnswers = [
      {
        questionOptionId: formData.riskAssessQuest1
      },
      {
        questionOptionId: formData.riskAssessQuest2
      },
      {
        questionOptionId: formData.riskAssessQuest3
      },
      {
        questionOptionId: formData.riskAssessQuest4
      }
    ];
    return {
      enquiryId: this.authService.getEnquiryId(),
      answers: selAnswers
    };
  }

  getYourFinancial() {
    return {
      monthlyIncome: this.investmentEngagementJourneyFormData.monthlyIncome,
      percentageOfSaving: this.investmentEngagementJourneyFormData.percentageOfSaving,
      totalAssets: this.investmentEngagementJourneyFormData.totalAssets,
      totalLiabilities: this.investmentEngagementJourneyFormData.totalLiabilities,
      suffEmergencyFund: this.investmentEngagementJourneyFormData.suffEmergencyFund,
      firstTimeUser: this.investmentEngagementJourneyFormData.firstTimeUser

    };
  }
  setYourFinancial(formData) {
    this.investmentEngagementJourneyFormData.monthlyIncome = formData.monthlyIncome;
    this.investmentEngagementJourneyFormData.percentageOfSaving = formData.percentageOfSaving;
    this.investmentEngagementJourneyFormData.totalAssets = formData.totalAssets;
    this.investmentEngagementJourneyFormData.totalLiabilities = formData.totalLiabilities;
    this.investmentEngagementJourneyFormData.suffEmergencyFund = formData.suffEmergencyFund;
    this.investmentEngagementJourneyFormData.portfolioTypeId = formData.portfolioTypeId;
    this.commit();
  }
  getYourInvestmentAmount() {
    return {
      initialInvestment: this.investmentEngagementJourneyFormData.initialInvestment,
      monthlyInvestment: this.investmentEngagementJourneyFormData.monthlyInvestment,
      oneTimeInvestmentChkBox: this.investmentEngagementJourneyFormData.oneTimeInvestmentChkBox,
      monthlyInvestmentChkBox: this.investmentEngagementJourneyFormData.monthlyInvestmentChkBox
    };
  }
  setYourInvestmentAmount(formData) {
    this.investmentEngagementJourneyFormData.initialInvestment = formData.initialInvestment;
    this.investmentEngagementJourneyFormData.monthlyInvestment = formData.monthlyInvestment;
    this.investmentEngagementJourneyFormData.oneTimeInvestmentChkBox = formData.firstChkBox;
    this.investmentEngagementJourneyFormData.monthlyInvestmentChkBox = formData.secondChkBox;
    this.investmentEngagementJourneyFormData.portfolioTypeId = formData.portfolioTypeId;
    this.commit();
  }

  // SAVE FOR STEP 1
  savePersonalInfo(invCommonFormValues) {
    const payload = this.constructInvObjectiveRequest(invCommonFormValues);
    return this.investmentApiService.savePersonalInfo(payload);
  }
  constructInvObjectiveRequest(invCommonFormValues) {
    const selectedPortfolioType = this.getSelectPortfolioType();
    const formData = this.getPortfolioFormData();
    const enquiryIdValue = Number(this.authService.getEnquiryId());
    if (selectedPortfolioType === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVEST_PORTFOLIO) {
      return {
        investmentPeriod: formData.investmentPeriod,
        monthlyIncome: formData.monthlyIncome,
        initialInvestment: formData.initialInvestment,
        monthlyInvestment: formData.monthlyInvestment,
        percentageOfSaving: formData.percentageOfSaving,
        totalAssets: formData.totalAssets,
        totalLiabilities: formData.totalLiabilities,
        enquiryId: enquiryIdValue,
        fundingTypeId: invCommonFormValues.initialFundingMethodId,
        portfolioTypeId: formData.portfolioTypeId,

      };
    } else if (selectedPortfolioType === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER_PORTFOLIO) {
      return {
        enquiryId: enquiryIdValue,
        initialInvestment: formData.initialInvestment,
        monthlyInvestment: formData.monthlyInvestment,
        fundingTypeId: invCommonFormValues.initialFundingMethodId,
        portfolioTypeId: formData.portfolioTypeId
      };
    } else {
      return {
        investmentPeriod: formData.investmentPeriod,
        monthlyIncome: formData.monthlyIncome,
        initialInvestment: formData.initialInvestment,
        monthlyInvestment: formData.monthlyInvestment,
        percentageOfSaving: formData.percentageOfSaving,
        totalAssets: formData.totalAssets,
        totalLiabilities: formData.totalLiabilities,
        enquiryId: enquiryIdValue,
        fundingTypeId: invCommonFormValues.initialFundingMethodId,
        portfolioTypeId: formData.portfolioTypeId,
        payoutTypeId: invCommonFormValues.initialWiseIncomePayoutTypeId
      };
    }
  }

  setPortfolioSplashModalCounter(value: number) {
    if (window.sessionStorage) {
      sessionStorage.setItem(PORTFOLIO_RECOMMENDATION_COUNTER_KEY, value.toString());
    }
  }

  getPortfolioRecommendationModalCounter() {
    return parseInt(sessionStorage.getItem(PORTFOLIO_RECOMMENDATION_COUNTER_KEY), 10);
  }
  getPortfolioAllocationDetails(params) {
    return this.investmentApiService.getPortfolioAllocationDetails(params);
  }

  getFundDetails() {
    return this.investmentEngagementJourneyFormData.fundDetails;
  }

  setFundDetails(fundDetails) {
    this.investmentEngagementJourneyFormData.fundDetails = fundDetails;
    this.commit();
  }

  // tslint:disable-next-line:cognitive-complexity
  sortByProperty(list, prop, order) {
    list.sort((a, b) => {
      const itemA = typeof a[prop] === 'string' ? a[prop].toLowerCase() : a[prop];
      const itemB = typeof b[prop] === 'string' ? b[prop].toLowerCase() : b[prop];
      if (order === 'asc') {
        if (itemA < itemB) {
          return -1;
        }
        if (itemA > itemB) {
          return 1;
        }
      } else {
        if (itemA > itemB) {
          return -1;
        }
        if (itemA < itemB) {
          return 1;
        }
      }
      return 0;
    });
  };

  findGroupByGroupName(groupList, groupName) {
    return groupList.filter(
      (group) => group.groupName === groupName
    )[0];
  }

  clearFormData() {
    this.investmentEngagementJourneyFormData = new InvestmentEngagementJourneyFormData();
    this.commit();
  }

  clearData() {
    this.authService.removeEnquiryId();
    this.clearFormData();
    if (window.sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(PORTFOLIO_RECOMMENDATION_COUNTER_KEY);
    }
  }

  buildQueryString(parameters) {
    let qs = '';
    Object.keys(parameters).forEach((key) => {
      const value = parameters[key];
      qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
    });
    if (qs.length > 0) {
      qs = qs.substring(0, qs.length - 1);
    }
    return '?' + qs;
  }
  verifyPromoCode(promoCodeData) {
    const promoCodeType = appConstants.INVESTMENT_PROMO_CODE_TYPE;
    const promoCode = {
      promoCode: promoCodeData,
      sessionId: this.authService.getSessionId(),
      promoCodeCat: promoCodeType
    };
    return this.apiService.verifyPromoCode(promoCode);
  }
  // #SET THE FINANCIAL PAGE.
  getUserFinancialDetails() {
    return this.investmentApiService.getUserFinancialDetails();
  }
  getFundingDetailsDetails() {
    return this.investmentApiService.getAllDropdownList();
  }
  setFinancialDetails(financialDetails) {
    if (financialDetails) {
      this.investmentEngagementJourneyFormData.monthlyIncome = financialDetails.monthlyIncome;
      this.investmentEngagementJourneyFormData.percentageOfSaving = financialDetails.incomePercentageSaved;
      this.investmentEngagementJourneyFormData.totalAssets = financialDetails.totalAssets;
      this.investmentEngagementJourneyFormData.totalLiabilities = financialDetails.totalLoans;
    }
    this.investmentEngagementJourneyFormData.firstTimeUser = false;
    this.commit();
  }
  getSelectPortfolioType() {
    return this.investmentEngagementJourneyFormData.selectPortfolioType;
  }

  setSelectPortfolioType(formValue) {
    this.investmentEngagementJourneyFormData.selectPortfolioType = formValue.selectPortfolioType;
    this.commit();
  }
  /* Filter object from array of objects*/
  filterDataByInput(inputObject: any, keyMapped: any, data: any) {
    if (inputObject) {
      const filteredData = inputObject.filter((summaryData) => summaryData[keyMapped].toUpperCase() === data.toUpperCase());
      if (filteredData && filteredData[0]) {
        return filteredData[0];
      } else {
        return '';
      }
    }
  }// wiseincome fundlist
  getFundListMethod(portfolioTypeId) {
    return this.investmentApiService.getFundListMethod(portfolioTypeId);
  }

  /* Set user account type */
  setUserPortfolioType(portfolioType) {
    this.investmentEngagementJourneyFormData.userPortfolioType = portfolioType;
    this.commit();
  }

  /* Get user account type */
  getUserPortfolioType() {
    return this.investmentEngagementJourneyFormData?.userPortfolioType;
  }

  setMajorSecondaryHolderData(majorHolderFormData) {
    this.investmentEngagementJourneyFormData.majorSecondaryHolderFormData = majorHolderFormData;
    this.commit();
  }

  /* Get user account type */
  getMajorSecondaryHolderData() {
    return this.investmentEngagementJourneyFormData?.majorSecondaryHolderFormData;
  }

  setMinorSecondaryHolderData(minorHolderFormData) {
    this.investmentEngagementJourneyFormData.minorSecondaryHolderFormData = minorHolderFormData;
    this.commit();
  }

  /* Get user account type */
  getMinorSecondaryHolderData() {
    return this.investmentEngagementJourneyFormData?.minorSecondaryHolderFormData;
  }

  buildMajorHolderData() {
    debugger;
    const formData = this.investmentEngagementJourneyFormData?.majorSecondaryHolderFormData;
    return {
      nricOrPassport: formData?.nricNumber,
      email: formData?.email,
      relationship: formData?.relationship.name
    }
  }

  buildMinorHolderData() {
    const formData = this.investmentEngagementJourneyFormData?.minorSecondaryHolderFormData;
    return {

    }
  }

  // Validate Major Secondary Holder
  validateMajorSecondaryHolder() {
    const data = this.buildMajorHolderData();
    return this.investmentApiService.validateMajorSecondaryHolder(data);
  }
  // Save Minor Secondary Holder
  saveMinorSecondaryHolder() {
    const data = this.buildMinorHolderData();
    return this.investmentApiService.saveMinorSecondaryHolder(data);
  }
}