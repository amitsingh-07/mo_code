import { Injectable } from '@angular/core';
import { appConstants } from './app.constants';
import { ComprehensiveService } from './comprehensive/comprehensive.service';
export const SESSION_STORAGE_KEY = 'app_journey_type';
export const SESSION_KEY = 'app_session';
const SESSION_CUSTOMER = 'app_customer_id';

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

  constructor() { }

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
    }
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
