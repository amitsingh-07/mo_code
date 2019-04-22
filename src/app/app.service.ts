import { Injectable } from '@angular/core';

import { appConstants } from './app.constants';
import { ComprehensiveService } from './comprehensive/comprehensive.service';
import { DirectService } from './direct/direct.service';
import { GuideMeService } from './guide-me/guide-me.service';
import { InvestmentAccountService } from './investment-account/investment-account-service';
import { PortfolioService } from './portfolio/portfolio.service';
import { SignUpService } from './sign-up/sign-up.service';
import { TopupAndWithDrawService } from './topup-and-withdraw/topup-and-withdraw.service';
import { WillWritingService } from './will-writing/will-writing.service';

export const SESSION_STORAGE_KEY = 'app_journey_type';
export const SESSION_KEY = 'app_session';
const PROMO_CODE_ACTION_TYPE = 'app_promo_code_action_type';
const SESSION_CUSTOMER = 'app_customer_id';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  journeyType: string;
  promoCodeActionType: string;
  enquiryId: any;
  activeSession: string;
  customer = {
    id: ''
  };

  constructor(
    private directService: DirectService,
    private guideMeService: GuideMeService,
    private signUpService: SignUpService,
    private portfolioService: PortfolioService,
    private investmentAccountService: InvestmentAccountService,
    private topupAndWithDrawService: TopupAndWithDrawService,
    private willWritingService: WillWritingService,
    private comprehensiveService: ComprehensiveService
  ) { }

  commit(key, data) {
    if (window.sessionStorage) {
      sessionStorage.setItem(key, JSON.stringify(data));
    }
  }

  /**
   * clear session storage data.
   */
  clearData() {
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
    this.portfolioService.clearData();
    this.investmentAccountService.clearData();
    this.topupAndWithDrawService.clearData();
    this.comprehensiveService.clearFormData();
  }

  setJourneyType(type: string) {
    this.journeyType = type;
    this.commit(SESSION_STORAGE_KEY, this.journeyType);
  }

  getJourneyType() {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      this.journeyType = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
    }
    return this.journeyType;
  }

  getAction() {
    if (window.sessionStorage && sessionStorage.getItem(PROMO_CODE_ACTION_TYPE)) {
      this.promoCodeActionType = JSON.parse(sessionStorage.getItem(PROMO_CODE_ACTION_TYPE));
    }
    return this.promoCodeActionType;

  }
  setAction(promoCodeActionType: string) {
    this.promoCodeActionType = promoCodeActionType;
    this.commit(PROMO_CODE_ACTION_TYPE, this.promoCodeActionType);
  }
  clearJourneys() {
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
}

