import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorModalComponent } from '../shared/modal/error-modal/error-modal.component';
import { ToolTipModalComponent } from '../shared/modal/tooltip-modal/tooltip-modal.component';
import { WillWritingFormData } from './will-writing-form-data';
import { WillWritingFormError } from './will-writing-form-error';
import {
  IAboutMe, IBeneficiary, IChild, IEligibility,
  IExecTrustee, IGuardian, IPromoCode, ISpouse
} from './will-writing-types';
import { WILL_WRITING_CONFIG } from './will-writing.constants';

const SESSION_STORAGE_KEY = 'app_will_writing_session';

@Injectable({
  providedIn: 'root'
})
export class WillWritingService {
  private willWritingFormData: WillWritingFormData = new WillWritingFormData();
  private willWritingFormError: any = new WillWritingFormError();
  isBeneficiaryAdded = false;
  constructor(
    private http: HttpClient,
    private modal: NgbModal
  ) {
    // get data from session storage
    this.getWillWritingFormData();
  }

  /**
   * set will writing form data from session storage when reload happens.
   */
  getWillWritingFormData(): WillWritingFormData {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      this.willWritingFormData = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
    }
    return this.willWritingFormData;
  }

  /**
   * save data in session storage.
   */
  commit() {
    if (window.sessionStorage) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.willWritingFormData));
    }
  }

  /**
   * clear session storage data.
   */
  clearData() {
    if (window.sessionStorage) {
      sessionStorage.clear();
    }
  }

  clearWillWritingData(isMaritalStatusChanged, isNoOfChildrenChanged) {
    if (isMaritalStatusChanged) {
      this.willWritingFormData.spouse = [];
    }
    if (isNoOfChildrenChanged) {
      this.willWritingFormData.children = [];
    }
    this.willWritingFormData.guardian = [];
    this.willWritingFormData.beneficiary = [];
    this.willWritingFormData.execTrustee = [];
  }

  /**
   * get form errors.
   * @param form - form details.
   * @returns first error of the form.
   */
  getFormError(form, formName) {
    const controls = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.willWritingFormError[formName].formFieldErrors.errorTitle;
    for (const name in controls) {
      if (controls[name].invalid) {
        errors.errorMessages.push(
          this.willWritingFormError[formName].formFieldErrors[name][Object.keys(controls[name]['errors'])[0]].errorMessage);
      }
    }
    return errors;
  }

  /**
   * get form errors.
   * @param form - form details.
   * @returns first error of the form.
   */
  getMultipleFormError(form, formName) {
    const forms = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.willWritingFormError[formName].formFieldErrors.errorTitle;

    // tslint:disable-next-line:forin
    for (const field in forms) {
      for (const control of forms[field].controls) {
        const formGroup = { formName: field, errors: [] };
        // tslint:disable-next-line:forin
        for (const name in control.controls) {
          if (control.controls[name].invalid) {
            formGroup.errors.push(
              this.willWritingFormError[formName].formFieldErrors[field][name][Object.keys(control.controls[name]['errors'])
              [0]].errorMessage);
          }
        }
        if (formGroup.errors.length > 0) {
          errors.errorMessages.push(formGroup);
        }
      }
    }
    return errors;
  }

  /**
   * get about me details.
   * @returns about me details.
   */
  getAboutMeInfo(): IAboutMe {
    if (!this.willWritingFormData.aboutMe) {
      this.willWritingFormData.aboutMe = {} as IAboutMe;
    }
    return this.willWritingFormData.aboutMe;
  }

  /**
   * set about me details.
   * @param data - about me details.
   */
  setAboutMeInfo(data: IAboutMe) {
    if (this.getAboutMeInfo()) {
      const isMaritalStatusChanged = this.getAboutMeInfo().maritalStatus !== data.maritalStatus;
      const isNoOfChildrenChanged = this.getAboutMeInfo().noOfChildren !== data.noOfChildren;
      if (isMaritalStatusChanged || isNoOfChildrenChanged) {
        this.clearWillWritingData(isMaritalStatusChanged, isNoOfChildrenChanged);
      }
    }
    this.willWritingFormData.aboutMe = data;
    this.commit();
  }

  /**
   * get spouse details.
   * @returns spouse details.
   */
  getSpouseInfo(): ISpouse[] {
    if (!this.willWritingFormData.spouse) {
      this.willWritingFormData.spouse = [] as ISpouse[];
    }
    return this.willWritingFormData.spouse;
  }

  /**
   * set spouse details.
   * @param data - spouse details.
   */
  setSpouseInfo(data: ISpouse) {
    this.willWritingFormData.spouse = [];
    data.relationship = 'spouse';
    this.willWritingFormData.spouse.push(data);
    this.commit();
  }

  /**
   * get children details.
   * @returns children details.
   */
  getChildrenInfo(): IChild[] {
    if (!this.willWritingFormData.children) {
      this.willWritingFormData.children = [] as IChild[];
    }
    return this.willWritingFormData.children;
  }

  /**
   * set children details.
   * @param data - children details.
   */
  setChildrenInfo(data: IChild[]) {
    this.willWritingFormData.children = [];
    for (const children of data) {
      children.relationship = 'child';
      this.willWritingFormData.children.push(children);
    }
    this.commit();
  }

  /**
   * get guardian details.
   * @returns guardian details.
   */
  getGuardianInfo(): IGuardian[] {
    if (!this.willWritingFormData.guardian) {
      this.willWritingFormData.guardian = [] as IGuardian[];
    }
    return this.willWritingFormData.guardian;
  }

  /**
   * set guardian details.
   * @param data - guardian details.
   */
  setGuardianInfo(data: IGuardian[]) {
    this.willWritingFormData.guardian = data;
    this.commit();
  }

  /**
   * clear children details.
   */
  clearGuardianInfo() {
    delete this.willWritingFormData.guardian;
    this.commit();
  }

  /**
   * get eligibility details.
   * @returns eligibility details.
   */
  getEligibilityDetails(): IEligibility {
    if (!this.willWritingFormData.eligibility) {
      this.willWritingFormData.eligibility = {} as IEligibility;
    }
    return this.willWritingFormData.eligibility;
  }

  /**
   * set eligibility details.
   * @param data - eligibility details.
   */
  setEligibilityDetails(data: IEligibility) {
    this.willWritingFormData.eligibility = data;
    this.commit();
  }

  /**
   * get PromoCode details.
   * @returns PromoCode details.
   */
  getPromoCode(): IPromoCode {
    if (!this.willWritingFormData.promoCode) {
      this.willWritingFormData.promoCode = {} as IPromoCode;
    }
    return this.willWritingFormData.promoCode;
  }

  /**
   * get guardian details.
   * @returns guardian details.
   */
  getExecTrusteeInfo(): IExecTrustee[] {
    if (!this.willWritingFormData.execTrustee) {
      this.willWritingFormData.execTrustee = [] as IExecTrustee[];
    }
    return this.willWritingFormData.execTrustee;
  }

  /**
   * set guardian details.
   * @param data - guardian details.
   */
  setExecTrusteeInfo(data: IExecTrustee[]) {
    this.willWritingFormData.execTrustee = data;
    this.commit();
  }

  /**
   * set PromoCode details.
   * @param data - PromoCode details.
   */
  setPromoCode(data: IPromoCode) {
    this.willWritingFormData.promoCode = data;
    this.commit();
  }

  /**
   * get Beneficiary details.
   * @returns Beneficiary details.
   */
  getBeneficiaryInfo(): IBeneficiary[] {
    if (!this.willWritingFormData.beneficiary) {
      this.willWritingFormData.beneficiary = [] as IBeneficiary[];
    }
    return this.willWritingFormData.beneficiary;
  }

  /**
   * set Beneficiary details.
   * @param data - Beneficiary details.
   */
  setBeneficiaryInfo(data: IBeneficiary[]) {
    this.willWritingFormData.beneficiary = data;
    this.commit();
  }

  checkBeneficiaryAge() {
    const beneficiaries = this.getBeneficiaryInfo().filter((beneficiary) =>
      beneficiary.relationship === 'child' && beneficiary.selected === true);
    return this.checkChildrenAge(beneficiaries);
  }

  checkChildrenAge(childrens): boolean {
    for (const children of childrens) {
      const dob = children.dob;
      const today = new Date();
      const birthDate = new Date(dob['year'], dob['month'], dob['day']);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < WILL_WRITING_CONFIG.CHILD_GUARDIAN_AGE) {
        return true;
      }
    }
    return false;
  }

  openToolTipModal(title: string, message: string) {
    const ref = this.modal.open(ToolTipModalComponent, { centered: true });
    ref.componentInstance.tooltipTitle = title;
    ref.componentInstance.tooltipMessage = message;
    return false;
  }

  openErrorModal(title: string, message: string, isMultipleForm: boolean) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    if (!isMultipleForm) {
      ref.componentInstance.errorMessageList = message;
    } else {
      ref.componentInstance.multipleFormErrors = message;
    }
    return false;
  }

}
