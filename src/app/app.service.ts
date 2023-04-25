import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { appConstants } from './app.constants';
import { ComprehensiveService } from './comprehensive/comprehensive.service';
import { DirectService } from './direct/direct.service';
import { GuideMeService } from './guide-me/guide-me.service';
import { InvestmentAccountService } from './investment/investment-account/investment-account-service';
import { InvestmentEngagementJourneyService } from './investment/investment-engagement-journey/investment-engagement-journey.service';
import { SignUpService } from './sign-up/sign-up.service';
import { ManageInvestmentsService } from './investment/manage-investments/manage-investments.service';
import { WillWritingService } from './will-writing/will-writing.service';
import { InvestmentCommonService } from './investment/investment-common/investment-common.service';

export const SESSION_STORAGE_KEY = 'app_journey_type';
export const SESSION_KEY = 'app_session';
const PROMO_CODE_ACTION_TYPE = 'app_promo_code_action_type';
const PROMO_CODE = 'app_promo_code';
const SESSION_CUSTOMER = 'app_customer_id';
const CORPORATE_DETAILS = 'app_corporate_details';
const CORP_BIZ_DATA = 'app_corpbiz_data';
const CORPBIZ_VIA_PUBLIC = 'app_corpbiz_via_public';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  journeyType: string;
  enquiryId: any;
  activeSession: string;
  customer = {
    id: ''
  };

  private journeyTypeSubject: BehaviorSubject<string> = new BehaviorSubject('');
  journeyType$: Observable<string>;
  constructor(
    private directService: DirectService,
    private guideMeService: GuideMeService,
    private signUpService: SignUpService,
    private investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    private investmentAccountService: InvestmentAccountService,
    private manageInvestmentsService: ManageInvestmentsService,
    private willWritingService: WillWritingService,
    private investmentCommonService: InvestmentCommonService,
    private comprehensiveService: ComprehensiveService
  ) {
    this.journeyType$ = this.journeyTypeSubject.asObservable();
  }

  commit(key, data) {
    if (window.sessionStorage) {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  }

  /**
   * clear session storage data.
   */
  clearData() {
    this.journeyType = null;
    if (window.sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_CUSTOMER);
    }
    this.clearServiceData();
  }

  clearServiceData() {
    this.willWritingService.clearServiceData();
    this.guideMeService.clearServiceData();
    this.directService.clearServiceData();
    this.signUpService.clearData();
    this.investmentEngagementJourneyService.clearData();
    this.investmentAccountService.clearData();
    this.manageInvestmentsService.clearData();
    this.investmentCommonService.clearData();
    this.comprehensiveService.clearFormData();
  }

  setJourneyType(type: string) {
    this.journeyType = type;
    this.journeyTypeSubject.next(type);
    this.commit(SESSION_STORAGE_KEY, this.journeyType);
  }

  getJourneyType() {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      this.journeyType = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
    }
    this.journeyTypeSubject.next(this.journeyType);
    return this.journeyType;
  }

  getAction() {
    let promoCodeActionType = '';
    if (window.sessionStorage && sessionStorage.getItem(PROMO_CODE_ACTION_TYPE)) {
      promoCodeActionType = JSON.parse(sessionStorage.getItem(PROMO_CODE_ACTION_TYPE));
    }
    return promoCodeActionType;

  }
  setAction(promoCodeActionType: string) {
    this.commit(PROMO_CODE_ACTION_TYPE, promoCodeActionType);
  }
  getPromoCode() {
    let promoCode = '';
    if (window.sessionStorage && sessionStorage.getItem(PROMO_CODE)) {
      promoCode = JSON.parse(sessionStorage.getItem(PROMO_CODE));
    }
    return promoCode;
  }
  setPromoCode(promoCode: string) {
    this.commit(PROMO_CODE, promoCode);
  }
  clearPromoCode() {
    if (window.sessionStorage) {
      sessionStorage.removeItem(PROMO_CODE);
      sessionStorage.removeItem(PROMO_CODE_ACTION_TYPE);
    }
  }
  clearJourneys() {
    this.journeyType = null;
    if (window.sessionStorage) {
      // App data
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      // Selected Data
      sessionStorage.removeItem('app_selected_plan_session_storage_key');
      // Direct Journey Data
      sessionStorage.removeItem('app_direct_session');
      // Guided Journey Data
      sessionStorage.removeItem('app_guided_session');
      // Insurance results
      sessionStorage.removeItem('insurance_results_counter');
      // Comprehensive Journey
      sessionStorage.removeItem(appConstants.SESSION_KEY.COMPREHENSIVE);
      // Clear comprehensive promo code
      this.clearPromoCode();
      // User mobile no for resend email verification link
      sessionStorage.removeItem('user_mobile');
    }
  }

  startAppSession() {
    this.activeSession = 'active';
    this.commit(SESSION_KEY, this.activeSession);
  }

  isSessionActive() {
    if (window.sessionStorage) {
      if (sessionStorage.getItem(SESSION_KEY)) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  getCustomer() {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_CUSTOMER)) {
      this.customer = JSON.parse(sessionStorage.getItem(SESSION_CUSTOMER));
    }
    return this.customer;
  }

  setCustomer(customer) {
    this.customer = customer;
    this.commit(SESSION_CUSTOMER, this.customer);
  }

  setCustomerId(customerId: string) {
    const customer = this.getCustomer();
    customer.id = customerId;
    this.commit(SESSION_CUSTOMER, this.customer);
  }

  getCustomerId() {
    return this.getCustomer().id;
  }

  setCorporateDetails(corporateObj) {
    sessionStorage.setItem(CORPORATE_DETAILS, JSON.stringify(corporateObj))
  }

  getCorporateDetails(): {organisationEnabled: boolean, uuid: string} {
    return JSON.parse(sessionStorage.getItem(CORPORATE_DETAILS));
  } 

  setCorpBizData(corpBizData) {
    sessionStorage.setItem(CORP_BIZ_DATA, JSON.stringify(corpBizData))
  }

  getCorpBizData() {
    return JSON.parse(sessionStorage.getItem(CORP_BIZ_DATA));
  }

  get isUserFromCorpBizLink() {
    return this.getCorpBizData()?.isCorpBiz;
  } 

  setCorpBizViaPublicData(corpBizViaPublic) {
    sessionStorage.setItem(CORPBIZ_VIA_PUBLIC, JSON.stringify(corpBizViaPublic))
  }

  getCorpBizViaPublicData() {
    return JSON.parse(sessionStorage.getItem(CORPBIZ_VIA_PUBLIC));
  }

  clearCorpBizUserData() {
    if (window.sessionStorage) {
      sessionStorage.removeItem(CORP_BIZ_DATA);
    }
  }
}
