import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { UserInfo } from './../guide-me/get-started/get-started-form/user-info';
import { HospitalPlan } from './../guide-me/hospital-plan/hospital-plan';
import { GoogleAnalyticsService } from './../shared/ga/google-analytics.service';
import { IProtectionTypeData } from './../shared/interfaces/recommendations.request';
import { DirectFormData } from './direct-form-data';
import { ICriticalIllness } from './product-info/critical-illness-form/critical-illness.interface';
import { IEducation } from './product-info/education-form/education.interface';
import { FormError } from './product-info/form-error';
import { IHospital } from './product-info/hospital-plan-form/hospital-plan.interface';
import { ILifeProtection } from './product-info/life-protection-form/life-protection.interface';
import { ILongTermCare } from './product-info/long-term-care-form/long-term-care.interface';
import { IOcpDisability } from './product-info/ocp-disability-form/ocp-disability-form.interface';
import { IProductCategory } from './product-info/product-category/product-category';
import { IRetirementIncome } from './product-info/retirement-income-form/retirement-income.interface';
import { ISrsApprovedPlans } from './product-info/srs-approved-plans-form/srs-approved-plans-form.interface';

const SESSION_STORAGE_KEY = 'app_direct_session';

@Injectable({
  providedIn: 'root'
})
export class DirectService {
  searchStatus: boolean;

  tooltipData = {
    title: '',
    message: ''
  };

  private formError: any = new FormError();
  private directFormData: DirectFormData = new DirectFormData();

  private modalFreeze = new BehaviorSubject(false);
  private prodCategory = new BehaviorSubject(0);
  private prodSearchInfo = new BehaviorSubject('');
  private searchBtn = new BehaviorSubject('');
  private modalToolTip = new BehaviorSubject(this.tooltipData);

  modalFreezeCheck = this.modalFreeze.asObservable();
  prodCategoryIndex = this.prodCategory.asObservable();
  prodSearchInfoData = this.prodSearchInfo.asObservable();
  searchBtnTrigger = this.searchBtn.asObservable();
  modalToolTipTrigger = this.modalToolTip.asObservable();
  currentIndexValue: number;

  constructor(private currencyPipe: CurrencyPipe, private googleAnalyticsService: GoogleAnalyticsService) {
  }

  commit() {
    if (window.sessionStorage) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.directFormData));
    }
  }

  clearData() {
    if (window.sessionStorage) {
      sessionStorage.clear();
    }
  }

  getDirectFormData(): DirectFormData {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      this.directFormData = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
    }
    return this.directFormData;
  }

  setUserInfo(userInfo: UserInfo) {
    this.directFormData.userInfo = userInfo;
    this.commit();
  }

  getUserInfo(): UserInfo {
    if (!this.directFormData.userInfo) {
      this.directFormData.userInfo = {} as UserInfo;
    }
    return this.directFormData.userInfo;
  }

  /* Setting Freeze for manual modal, Edit Profile */
  setModalFreeze(isFrozen: boolean) {
    this.modalFreeze.next(isFrozen);
  }
  /* Setting Initial Product Category based on selected index */
  setProdCategoryIndex(prodCategoryIndex: number) {
    this.prodCategory.next(prodCategoryIndex);
  }
  /* Search Button Trigger */
  triggerSearch(event) {
    this.searchBtn.next(event);
  }
  /* Search Button Success */
  gaDirectSuccess(category: string) {
    if (this.googleAnalyticsService.getTime('initialDirectSearch') !== false) {
      this.googleAnalyticsService.emitTime('initialDirectSearch', 'Direct', 'Success');
    }
    this.googleAnalyticsService.emitEvent('Direct', 'Recommend', 'Success');
    this.googleAnalyticsService.emitEvent('Direct', category, 'Success');
  }

  /* Get Product Category List */
  getProductCategory() {
    if (!this.directFormData.prodCategory) {
      this.directFormData.prodCategory = {} as IProtectionTypeData;
    }
    return this.directFormData.prodCategory;
  }
  /* Product Category drop down Handler */
  setProductCategory(prodCat: IProtectionTypeData) {
    this.directFormData.prodCategory = prodCat;
    console.log(this.directFormData.prodCategory);
    this.commit();
  }

  /* Handling Tooltip Modal */
  showToolTipModal(in_title: string, in_message: string) {
    this.tooltipData.title = in_title;
    this.tooltipData.message = in_message;
    this.modalToolTip.next(this.tooltipData);
  }

  /* Handling Minified Product Info */
  setMinProdInfo(prodString: string) {
    this.prodSearchInfo.next(prodString);
  }

  /* Custom Currency */
  convertToCurrency(in_amount: number) {
    const amount = this.currencyPipe.transform(in_amount, 'USD');
    const final_amount = amount.split('.')[0].replace('$', '');
    return final_amount;
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
    return this.formError.formFieldErrors[formCtrlName][validation];
  }

  /* Setting Life Protection Form into Direct Form */
  setLifeProtectionForm(data: ILifeProtection) {
    this.directFormData.lifeProtection = data;
    this.gaDirectSuccess('life-protection');
  }

  getLifeProtectionForm(): ILifeProtection {
    if (!this.directFormData.lifeProtection) {
      this.directFormData.lifeProtection = {} as ILifeProtection;
    }
    return this.directFormData.lifeProtection;
  }

  /* Setting Critical Illness Form into Direct Form */
  setCriticalIllnessForm(data: ICriticalIllness) {
    this.directFormData.criticalIllness = data;
    this.gaDirectSuccess('critical-illness');
    const userInfo = this.getUserInfo();
    userInfo.dob = data.dob;
    userInfo.gender = data.gender;
    userInfo.smoker = data.smoker;
    this.setUserInfo(userInfo);
    this.commit();
  }

  getCriticalIllnessForm(): ICriticalIllness {
    if (!this.directFormData.criticalIllness) {
      this.directFormData.criticalIllness = {} as ICriticalIllness;
    }
    return this.directFormData.criticalIllness;
  }

  getEmptyExistingCoverage() {
    const hospitalPlan = {
      hospitalClassId: 0,
      hospitalClass: 'None',
      hospitalClassDescription: ''
    } as HospitalPlan;

    const existingCoverage = {
      criticalIllnessCoverage: 0,
      lifeProtectionCoverage: 0,
      longTermCareCoveragePerMonth: 0,
      occupationalDisabilityCoveragePerMonth: 0,
      selectedHospitalPlan: hospitalPlan
    };
    return existingCoverage;
  }

  setLongTermCareForm(data: ILongTermCare) {
    this.directFormData.longTermCare = data;
    this.gaDirectSuccess('long-term-care');
    const userInfo = this.getUserInfo();
    userInfo.dob = data.dob;
    userInfo.gender = data.gender;
    this.setUserInfo(userInfo);
    this.commit();
  }

  getLongTermCareForm(): ILongTermCare {
    if (!this.directFormData.longTermCare) {
      this.directFormData.longTermCare = {} as ILongTermCare;
    }
    return this.directFormData.longTermCare;
  }

  getRetirementIncomeForm(): IRetirementIncome {
    if (!this.directFormData.retirementIncome) {
      this.directFormData.retirementIncome = {} as IRetirementIncome;
    }
    return this.directFormData.retirementIncome;
  }

  setRetirementIncomeForm(data: IRetirementIncome) {
    this.directFormData.retirementIncome = data;
    this.gaDirectSuccess('retirement-income');
  }

  getOcpDisabilityForm(): IOcpDisability {
    if (!this.directFormData.ocpDisability) {
      this.directFormData.ocpDisability = {} as IOcpDisability;
    }
    return this.directFormData.ocpDisability;
  }

  setOcpDisabilityForm(data: IOcpDisability) {
    if (data.smoker) {
      data.smoker = 'smoker';
    } else {
      data.smoker = 'non-smoker';
    }
    this.directFormData.ocpDisability = data;
    this.gaDirectSuccess('occupational-disability');
    const userInfo = this.getUserInfo();
    userInfo.dob = data.dob;
    userInfo.gender = data.gender;
    userInfo.smoker = data.smoker;
    this.setUserInfo(userInfo);
  }

  setEducationForm(data: IEducation) {
    this.directFormData.education = data;
    this.gaDirectSuccess('education');
  }

  setHospitalPlanForm(data: IHospital) {
    this.directFormData.hospital = data;
    this.gaDirectSuccess('hospital-plan');
    const userInfo = this.getUserInfo();
    userInfo.dob = data.dob;
    userInfo.gender = data.gender;
    this.setUserInfo(userInfo);
    this.commit();
  }

  getHospitalPlanForm() {
    if (!this.directFormData.hospital) {
      this.directFormData.hospital = {} as IHospital;
    }
    return this.directFormData.hospital;
  }

  getEducationForm() {
    if (!this.directFormData.education) {
      this.directFormData.education = {} as IEducation;
    }
    return this.directFormData.education;
  }

  setSelectedPlans(plan) {
    this.directFormData.selectedPlans = plan;
    this.commit();
  }

  getSelectedPlans() {
    if (!this.directFormData.selectedPlans) {
      this.directFormData.selectedPlans = [];
    }
    return this.directFormData.selectedPlans;
  }

  setSrsApprovedPlansForm(data: ISrsApprovedPlans) {
    this.directFormData.srsApprovedPlans = data;
  }
  getSrsApprovedPlansForm() {
    if (!this.directFormData.srsApprovedPlans) {
      this.directFormData.srsApprovedPlans = {} as ISrsApprovedPlans;
    }
    return this.directFormData.srsApprovedPlans;
  }
}

