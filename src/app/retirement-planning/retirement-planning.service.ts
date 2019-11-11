import { Injectable } from '@angular/core';

import { IUserDetails, IRetirementPlanPayload, IRetirementNeedsGroup } from './retirement-planning-types';
import { RetirementPlanningData } from './retirement-planning-form-data';

import { ApiService } from '../shared/http/api.service';

const SESSION_STORAGE_KEY = 'app_retirement_planning_session';

@Injectable({
    providedIn: 'root'
})

export class RetirementPlanningService {
    private retirementPlanningForm: RetirementPlanningData = new RetirementPlanningData();

    private scheme: any = new Map([
        ['stableIncomeStream', 'Stable Income Stream'],
        ['flexibleIncomeStream', 'Flexible Income Stream'],
        ['longerPeriodOfIncome', 'Longer Period Of Income']
    ]);

    constructor(private apiService: ApiService) {
        // get data from session storage
        this.getRetirementPlanningFormData();
    }

    /**
    * set retirement planning form data from session storage when reload happens.
    */
    getRetirementPlanningFormData(): RetirementPlanningData {
        if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
            this.retirementPlanningForm = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
        }
        return this.retirementPlanningForm;
    }

    /**
     * save data in session storage.
     */
    commit() {
        if (window.sessionStorage) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.retirementPlanningForm));
        }
    }

    clearData() {
        this.retirementPlanningForm = {} as RetirementPlanningData;
        if (window.sessionStorage) {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }

    /**
    * set retirement planning details.
    * @param data - user retirement planning details.
    */
    setUserDetails(data: IUserDetails) {
        this.retirementPlanningForm.userDetails = data;
        this.commit();
    }

    /**
   * get retirement planning details.
   * @param data - user retirement planning details.
   */
    getUserDetails() {
        if (!this.retirementPlanningForm.userDetails) {
            this.retirementPlanningForm.userDetails = {} as IUserDetails;
        }
        return this.retirementPlanningForm.userDetails;
    }

    /**
    * set retirement needs detail.
    * @param data - user  retirement needs detail.
    */
    setRetirementNeeds(data: IRetirementNeedsGroup) {
        this.retirementPlanningForm.retirementNeedsGroup = data;
        this.commit();
    }

    /**
    * get retirement needs detail.
    * @param data - user  retirement needs detail.
    */
    getRetirementNeeds() {
        if (!this.retirementPlanningForm.retirementNeedsGroup) {
            this.retirementPlanningForm.retirementNeedsGroup = {} as IRetirementNeedsGroup;
        }
        return this.retirementPlanningForm.retirementNeedsGroup;
    }

    /**
    * set retirement plan payload detail.
    * @param data - retirement plan payload details.
    */
    retirementPlanPayload(incomeStream: Array<string>): IRetirementPlanPayload {
        const { retirementNeeds: retirementNeed, retirementAmountAvailable: retirementAmount } = this.retirementPlanningForm.retirementNeedsGroup;
        const schemeList = incomeStream.map((e: string) => this.scheme.get(e));

        return {
            firstName: this.retirementPlanningForm.userDetails.firstName,
            lastName: this.retirementPlanningForm.userDetails.lastName,
            mobileNumber: this.retirementPlanningForm.userDetails.mobileNumber,
            emailAddress: this.retirementPlanningForm.userDetails.emailAddress,
            retirementAge: retirementNeed.retirementAge,
            monthlyRetirementIncome: retirementNeed.monthlyRetirementIncome,
            dateOfBirth: this.convertDate(retirementNeed.dateOfBirth),
            lumpSumAmount: retirementAmount.lumpSumAmount,
            monthlyAmount: retirementAmount.monthlyAmount,
            retirementSchemeList: schemeList,
            receiveMarketingMaterials: this.retirementPlanningForm.userDetails.marketingAcceptance,
            contactedByMobile: this.retirementPlanningForm.userDetails.consent
        }
    }

    /**
    * create retirement plan.
    * @param data - retirement plan.
    */
    createRetirementPlan(incomeStream: Array<string>) {
        const payload: IRetirementPlanPayload = this.retirementPlanPayload(incomeStream);
        return this.apiService.enquireRetirementPlan(payload);
    }

    /**
    * convert date format.
    * @param dateObject - convert date to DD/MM/YYYY format.
    */
    private convertDate(dateObject) {
        return dateObject.day + '-' + dateObject.month + '-' + dateObject.year;
    }
}