import { ApiService } from './../shared/http/api.service';
import { CurrencyPipe, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';

import { AuthenticationService } from './../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../shared/modal/error-modal/error-modal.component';
import { SummaryModalComponent } from '../shared/modal/summary-modal/summary-modal.component';
import { ToolTipModalComponent } from '../shared/modal/tooltip-modal/tooltip-modal.component';
import { NavbarService } from '../shared/navbar/navbar.service';
import { AboutAge } from '../shared/utils/about-age.util';
import { Util } from '../shared/utils/util';
import { appConstants } from './../app.constants';
import { ProgressTrackerUtil } from './../shared/modal/progress-tracker/progress-tracker-util';
import {
  IProgressTrackerData,
  IProgressTrackerItem,
  IProgressTrackerSubItem,
  IProgressTrackerSubItemList
} from './../shared/modal/progress-tracker/progress-tracker.types';
import { RoutingService } from './../shared/Services/routing.service';
import { ComprehensiveApiService } from './comprehensive-api.service';
import { COMPREHENSIVE_CONST } from './comprehensive-config.constants';
import { ComprehensiveFormData } from './comprehensive-form-data';
import { ComprehensiveFormError } from './comprehensive-form-error';
import {
  COMPREHENSIVE_BASE_ROUTE,
  COMPREHENSIVE_FULL_ROUTER_CONFIG,
  COMPREHENSIVE_LITE_ROUTER_CONFIG,
  COMPREHENSIVE_ROUTE_PATHS
} from './comprehensive-routes.constants';
import {
  HospitalPlan,
  IChildEndowment,
  IComprehensiveDetails,
  IComprehensiveEnquiry,
  IDependantDetail,
  IHospitalPlanList,
  IInsurancePlan,
  IMyAssets,
  IMyEarnings,
  IMyLiabilities,
  IMyProfile,
  IMySpendings,
  IProgressTrackerWrapper,
  IPromoCode,
  IRegularSavings,
  IRetirementPlan,
  IdependentsSummaryList
} from './comprehensive-types';
@Injectable({
  providedIn: 'root'
})
export class ComprehensiveService {
  public static SESSION_KEY_FORM_DATA = 'cmp-form-data';
  private comprehensiveFormData: ComprehensiveFormData = new ComprehensiveFormData();
  private comprehensiveFormError: any = new ComprehensiveFormError();
  private progressData: IProgressTrackerData;
  private progressWrapper: IProgressTrackerWrapper;
  private getStartedStyle = 'get-started';
  private comprehensiveLiteEnabled = false;
  constructor(
    private http: HttpClient,
    private modal: NgbModal,
    private location: Location,
    private aboutAge: AboutAge,
    private currencyPipe: CurrencyPipe,
    private routingService: RoutingService,
    private router: Router,
    private navbarService: NavbarService,
    private ageUtil: AboutAge,
    private comprehensiveApiService: ComprehensiveApiService,
    private authService: AuthenticationService,
    private apiService:ApiService
  ) {
    this.getComprehensiveFormData();
    this.comprehensiveLiteEnabled = this.authService.isSignedUserWithRole(COMPREHENSIVE_CONST.ROLES.ROLE_COMPRE_LITE);
  }
  setComprehensiveVersion(versionType: string) {
    //console.log(versionType);
    //console.log(this.comprehensiveLiteEnabled);
    //console.log(COMPREHENSIVE_CONST.VERSION_TYPE.LITE);
    /* Robo3 FULL or LITE Config*/
    if (COMPREHENSIVE_CONST.COMPREHENSIVE_LITE_ENABLED && versionType === COMPREHENSIVE_CONST.VERSION_TYPE.LITE) {
      sessionStorage.setItem(
        appConstants.SESSION_KEY.COMPREHENSIVE_VERSION,
        COMPREHENSIVE_CONST.VERSION_TYPE.LITE
      );
      //console.log('lite');
    } else {
      sessionStorage.setItem(
        appConstants.SESSION_KEY.COMPREHENSIVE_VERSION,
        COMPREHENSIVE_CONST.VERSION_TYPE.FULL
      );
      //console.log('full');
    }
  }
  commit() {
    if (window.sessionStorage) {
      const comprehensiveVersionType = this.getComprehensiveSessionVersion();

      /* Robo3 FULL or LITE Config*/
      const cmpSessionData = this.getComprehensiveSessionData();
      cmpSessionData[
        ComprehensiveService.SESSION_KEY_FORM_DATA
      ] = this.comprehensiveFormData;
      sessionStorage.setItem(
        comprehensiveVersionType,
        JSON.stringify(cmpSessionData)
      );
    }
  }
  getComprehensiveSessionVersion() {
    // tslint:disable-next-line: prefer-immediate-return
    const comprehensiveVersionType = (sessionStorage.getItem(appConstants.SESSION_KEY.COMPREHENSIVE_VERSION)
      === COMPREHENSIVE_CONST.VERSION_TYPE.LITE && COMPREHENSIVE_CONST.COMPREHENSIVE_LITE_ENABLED)
      ? appConstants.SESSION_KEY.COMPREHENSIVE_LITE : appConstants.SESSION_KEY.COMPREHENSIVE;
    return comprehensiveVersionType;
  }
  getComprehensiveCurrentVersion() {
    // tslint:disable-next-line: prefer-immediate-return
    const comprehensiveVersionType = sessionStorage.getItem(appConstants.SESSION_KEY.COMPREHENSIVE_VERSION);
    return comprehensiveVersionType;
  }
  getComprehensiveVersion() {
    // tslint:disable-next-line: prefer-immediate-return
    const comprehensiveVersionType = !(sessionStorage.getItem(appConstants.SESSION_KEY.COMPREHENSIVE_VERSION)
      === COMPREHENSIVE_CONST.VERSION_TYPE.LITE && COMPREHENSIVE_CONST.COMPREHENSIVE_LITE_ENABLED);
    return comprehensiveVersionType;
  }
  getComprehensiveSessionData() {
    // tslint:disable-next-line: max-line-length
    const comprehensiveVersionType = this.getComprehensiveSessionVersion();
    if (
      window.sessionStorage &&
      sessionStorage.getItem(comprehensiveVersionType)
    ) {
      return JSON.parse(
        sessionStorage.getItem(comprehensiveVersionType)
      );
    }
    return {};
  }

  getHospitalPlan(): IHospitalPlanList[] {
    if (!this.comprehensiveFormData.hospitalPlanList) {
      this.comprehensiveFormData.hospitalPlanList = [] as IHospitalPlanList[];
    }
    return this.comprehensiveFormData.hospitalPlanList;
  }
  clearComprehensiveFormData() {
    this.comprehensiveFormData = {} as ComprehensiveFormData;
    this.commit();
    sessionStorage.removeItem(appConstants.SESSION_KEY.COMPREHENSIVE);
    sessionStorage.removeItem(appConstants.SESSION_KEY.COMPREHENSIVE_LITE);
    this.getComprehensiveFormData();
  }
  clearFormData() {
    this.comprehensiveFormData = {} as ComprehensiveFormData;
    this.commit();
    sessionStorage.removeItem(appConstants.SESSION_KEY.COMPREHENSIVE_VERSION);
    sessionStorage.removeItem(appConstants.SESSION_KEY.COMPREHENSIVE);
    sessionStorage.removeItem(appConstants.SESSION_KEY.COMPREHENSIVE_LITE);
    this.getComprehensiveFormData();
  }

  getComprehensiveUrlList(urlList: any) {
    Object.keys(urlList).forEach(key => {
      urlList[key] = ProgressTrackerUtil.trimPath(urlList[key]);
    });

    return urlList;
  }
  // Return the entire Comprehensive Form Data
  getComprehensiveFormData(): ComprehensiveFormData {
    if (window.sessionStorage) {
      const cmpSessionData = this.getComprehensiveSessionData();
      if (cmpSessionData[ComprehensiveService.SESSION_KEY_FORM_DATA]) {
        this.comprehensiveFormData =
          cmpSessionData[ComprehensiveService.SESSION_KEY_FORM_DATA];
      } else {
        this.comprehensiveFormData = {} as ComprehensiveFormData;
      }

      if (!this.comprehensiveFormData.comprehensiveDetails) {
        this.comprehensiveFormData.comprehensiveDetails = this.getComprehensiveSummary();
      }
    }
    return this.comprehensiveFormData;
  }

  isProgressToolTipShown() {
    if (!this.comprehensiveFormData.isToolTipShown) {
      this.comprehensiveFormData.isToolTipShown = false;
    }
    return this.comprehensiveFormData.isToolTipShown;
  }

  setProgressToolTipShown(shown: boolean) {
    this.comprehensiveFormData.isToolTipShown = shown;
    this.commit();
  }

  getMyProfile() {
    if ( !this.comprehensiveFormData.comprehensiveDetails.baseProfile) {
      this.comprehensiveFormData.comprehensiveDetails.baseProfile = {} as IMyProfile;
    }
    return this.comprehensiveFormData.comprehensiveDetails.baseProfile;
  }
  getMyDependant() {
    if (!this.comprehensiveFormData.comprehensiveDetails.dependentsSummaryList) {
      this.comprehensiveFormData.comprehensiveDetails.dependentsSummaryList.dependentsList = [] as IDependantDetail[];
    }
    return this.comprehensiveFormData.comprehensiveDetails.dependentsSummaryList.dependentsList;
  }

  getChildEndowment() {
    if (
      !this.comprehensiveFormData.comprehensiveDetails
        .dependentEducationPreferencesList
    ) {
      this.comprehensiveFormData.comprehensiveDetails.dependentEducationPreferencesList = [] as IChildEndowment[];
    }
    return this.comprehensiveFormData.comprehensiveDetails
      .dependentEducationPreferencesList;
  }
  getPromoCode() {
    if (!this.comprehensiveFormData.promoCode) {
      this.comprehensiveFormData.promoCode = {} as IPromoCode;
    }
    return this.comprehensiveFormData.promoCode;
  }
  setPromoCode(promoCode: IPromoCode) {
    this.comprehensiveFormData.promoCode = promoCode;
    this.commit();
  }
  setPromoCodeValidation(promoCodeValidated: boolean) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.isValidatedPromoCode = promoCodeValidated;
  }

  /**
   * Get the comprehensive summary object.
   *
   * @returns
   * @memberof ComprehensiveService
   */
  getComprehensiveSummary(): IComprehensiveDetails {
    if (!this.comprehensiveFormData.comprehensiveDetails) {
      this.comprehensiveFormData.comprehensiveDetails = {} as IComprehensiveDetails;
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry = {} as IComprehensiveEnquiry;
    }
    return this.comprehensiveFormData.comprehensiveDetails;
  }
  /**
   * 
   * @return
   * ComprehensiveEnquiry
   */

  getComprehensiveEnquiry() {
    if (!this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry = {} as IComprehensiveEnquiry;
    }
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry;
  }

  /**
   * Set the comprehensive summary object.
   *
   * @param {IComprehensiveDetails} comprehensiveDetails
   * @memberof ComprehensiveService
   */
  setComprehensiveSummary(comprehensiveDetails: IComprehensiveDetails) {
    if (comprehensiveDetails === null ) {
      this.comprehensiveFormData = {} as ComprehensiveFormData;      
      this.commit();
    } else {
      this.comprehensiveFormData.comprehensiveDetails = comprehensiveDetails;
      this.reloadDependantDetails();
      this.setBucketAmountByCal();
      this.setViewableMode(false);
      this.commit();
    }
  }

  /**
   * Wrapper method to update the comprehensive details object
   *
   * @memberof ComprehensiveService
   */
  updateComprehensiveSummary() {
    this.setComprehensiveSummary(
      this.comprehensiveFormData.comprehensiveDetails
    );
  }

  /**
   * Reload and update the dependant education preference details with dependant name and date of birth.
   *
   * @memberof ComprehensiveService
   */
  reloadDependantDetails() {
    const comprehensiveDetails = this.comprehensiveFormData
      .comprehensiveDetails;
    const enquiry: IComprehensiveEnquiry =
      comprehensiveDetails.comprehensiveEnquiry;
    if (
      enquiry !== null &&
      enquiry.hasDependents &&
      (enquiry.hasEndowments === '1' || enquiry.hasEndowments === '2')
    ) {
      if (
        comprehensiveDetails.dependentsSummaryList.dependentsList &&
        comprehensiveDetails.dependentEducationPreferencesList
      ) {
        comprehensiveDetails.dependentEducationPreferencesList.forEach(
          (eduPref, index) => {
            comprehensiveDetails.dependentsSummaryList.dependentsList.forEach(dependant => {
              if (dependant.id === eduPref.dependentId) {
                comprehensiveDetails.dependentEducationPreferencesList[
                  index
                ] = this.getExistingEndowmentItem(eduPref, dependant);
              }
            });
          }
        );
      }
    }

    this.comprehensiveFormData.comprehensiveDetails = comprehensiveDetails;
  }

  /**
   * Check whether there are any child dependant. Child dependant age criteria `MALE = 21`, `FEMALE = 19`
   *
   * @returns {boolean}
   * @memberof ComprehensiveService
   */
  hasChildDependant(): boolean {
    let hasChildDependant = false;
    this.getMyDependant().forEach((dependant: any) => {
      // console.log(dependant)
      const getAge = this.aboutAge.calculateAgeByYear(
        dependant.dateOfBirth,
        new Date()
      );
      const maxAge = dependant.gender.toLowerCase() === 'male' ? 21 : 19;
      if (getAge < maxAge) {
        hasChildDependant = true;
        return;
      }
    });

    return hasChildDependant;
  }
  setMyProfile(profile: IMyProfile) {
    this.comprehensiveFormData.comprehensiveDetails.baseProfile = profile;
    this.commit();
  }

  setHasDependant(hasDependant: boolean) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.hasDependents = hasDependant;
    this.updateComprehensiveSummary();
  }

  setMyDependant(dependant: IDependantDetail[]) {
    this.comprehensiveFormData.comprehensiveDetails.dependentsSummaryList.dependentsList = dependant;
    this.updateComprehensiveSummary();
    this.commit();
  }

  setChildEndowment(dependentEducationPreferencesList: IChildEndowment[]) {
    this.comprehensiveFormData.comprehensiveDetails.dependentEducationPreferencesList = dependentEducationPreferencesList;
    this.updateComprehensiveSummary();
    this.commit();
  }

  getExistingEndowmentItem(
    childEndowment: IChildEndowment,
    dependant: IDependantDetail
  ) {
    const getAge = this.aboutAge.calculateAgeByYear(
      dependant.dateOfBirth,
      new Date()
    );
    const maturityAge = this.aboutAge.getAboutAge(
      getAge,
      dependant.gender.toLowerCase() === 'male' ? 21 : 19
    );

    let preferenceSelected = true;
    if (
      this.getComprehensiveSummary().comprehensiveEnquiry.hasEndowments === '2'
    ) {
      preferenceSelected =
        dependant.isInsuranceNeeded === null || dependant.isInsuranceNeeded;
    } else if (
      this.getComprehensiveSummary().comprehensiveEnquiry.hasEndowments === '1'
    ) {
      preferenceSelected = true;
    }

    return {
      id: 0, // #childEndowment.id,
      dependentId: dependant.id,
      name: dependant.name,
      dateOfBirth: dependant.dateOfBirth,
      gender: dependant.gender,
      enquiryId: dependant.enquiryId,
      location: childEndowment.location,
      educationCourse: childEndowment.educationCourse,
      educationSpendingShare: childEndowment.educationSpendingShare,
      endowmentMaturityAmount: childEndowment.endowmentMaturityAmount,
      endowmentMaturityYears: childEndowment.endowmentMaturityYears,
      age: maturityAge,
      preferenceSelection: preferenceSelected,
      nation: dependant.nation
    } as IChildEndowment;
  }

  getMyLiabilities() {
    if (
      !this.comprehensiveFormData.comprehensiveDetails.comprehensiveLiabilities
    ) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveLiabilities = {} as IMyLiabilities;
    }
    return this.comprehensiveFormData.comprehensiveDetails
      .comprehensiveLiabilities;
  }

  setMyLiabilities(myLiabilitiesData: IMyLiabilities) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveLiabilities = myLiabilitiesData;
    this.commit();
  }

  getHomeLoanChanges() {
    if (!this.comprehensiveFormData.comprehensiveDetails.comprehensiveLiabilities) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.homeLoanUpdatedByLiabilities = {} as boolean;
    }
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.homeLoanUpdatedByLiabilities
  }

  setHomeLoanChanges(homeLoanUpdatedByLiabilities: boolean) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.homeLoanUpdatedByLiabilities = homeLoanUpdatedByLiabilities;
    this.commit();
  }

  getMyEarnings() {
    if (!this.comprehensiveFormData.comprehensiveDetails.comprehensiveIncome) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveIncome = {} as IMyEarnings;
    }
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveIncome;
  }

  setMyEarnings(myEarningsData: IMyEarnings) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveIncome = myEarningsData;
    this.commit();
  }

  getMySpendings() {
    if (
      !this.comprehensiveFormData.comprehensiveDetails.comprehensiveSpending
    ) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveSpending = {} as IMySpendings;
    }
    return this.comprehensiveFormData.comprehensiveDetails
      .comprehensiveSpending;
  }
  getEnquiryId() {
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry
      .enquiryId;
  }
  setMySpendings(mySpendingsData: IMySpendings) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveSpending = mySpendingsData;
    this.commit();
  }

  /**
   * Get the starting page route for the comprehensive module.
   *
   * @returns
   * @memberof ComprehensiveService
   */
  getStartingPage() {
    return this.comprehensiveFormData.startingPage;
  }

  /**
   * Set the starting page for the comprehensive module.
   *
   * @param {string} pageRoute
   * @memberof ComprehensiveService
   */
  setStartingPage(pageRoute: string) {
    this.comprehensiveFormData.startingPage = pageRoute;
    this.commit();
  }

  hasDependant() {
    if (this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry) {
      return this.comprehensiveFormData.comprehensiveDetails
        .comprehensiveEnquiry.hasDependents;
    }
  }
  gethouseHoldDetails() {
    if (!this.comprehensiveFormData.comprehensiveDetails) {
      this.comprehensiveFormData.comprehensiveDetails.dependentsSummaryList = {} as IdependentsSummaryList;
    }
    return this.comprehensiveFormData.comprehensiveDetails
      .dependentsSummaryList;
  }
  sethouseHoldDetails(dependantSummaryList: IdependentsSummaryList) {
    this.comprehensiveFormData.comprehensiveDetails.dependentsSummaryList = dependantSummaryList;
    this.commit();
  }
  getDownOnLuck() {
    if (
      !this.comprehensiveFormData.comprehensiveDetails.comprehensiveDownOnLuck
    ) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveDownOnLuck = {} as HospitalPlan;
    }
    return this.comprehensiveFormData.comprehensiveDetails
      .comprehensiveDownOnLuck;
  }
  setDownOnLuck(comprehensiveDownOnLuck: HospitalPlan) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveDownOnLuck = comprehensiveDownOnLuck;
    this.commit();
  }
  clearBadMoodFund() {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveDownOnLuck.badMoodMonthlyAmount = 0;
    this.commit();
  }
  saveBadMoodFund() {
    this.clearBadMoodFund();
    this.comprehensiveApiService
      .saveDownOnLuck(this.getDownOnLuck())
      .subscribe(data => { });
  }
  hasBadMoodFund() {
    const maxBadMoodFund = Math.floor(
      (this.getMyEarnings().totalAnnualIncomeBucket -
        this.getMySpendings().totalAnnualExpenses) /
      12
    );
    return maxBadMoodFund >= 0;
  }

  setDependantSelection(selection: boolean) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.hasDependents = selection;
    this.commit();
  }
  hasEndowment() {
    if (this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry) {
      return this.comprehensiveFormData.comprehensiveDetails
        .comprehensiveEnquiry.hasEndowments;
    }
  }

  setEndowment(selection: string) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.hasEndowments = selection;
    this.commit();
  }
  clearEndowmentPlan() {
    this.comprehensiveFormData.comprehensiveDetails.dependentEducationPreferencesList = [] as IChildEndowment[];
    this.commit();
  }
  getMyAssets() {
    if (!this.comprehensiveFormData.comprehensiveDetails.comprehensiveAssets) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveAssets = {} as IMyAssets;
    }
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveAssets;
  }
  setMyAssets(myAssets: IMyAssets) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveAssets = myAssets;
    this.commit();
  }
  getRegularSavingsList() {
    if (!this.comprehensiveFormData.comprehensiveDetails) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveRegularSavingsList = [] as IRegularSavings[];
    }
    return this.comprehensiveFormData.comprehensiveDetails
      .comprehensiveRegularSavingsList;
  }
  setRegularSavingsList(regularSavingsPlan: IRegularSavings[]) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveRegularSavingsList = regularSavingsPlan;
    this.commit();
  }
  hasRegularSavings() {
    if (this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry) {
      return this.comprehensiveFormData.comprehensiveDetails
        .comprehensiveEnquiry.hasRegularSavingsPlans;
    }
  }
  setRegularSavings(selection: boolean) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.hasRegularSavingsPlans = selection;
    this.commit();
  }
  getInsurancePlanningList() {
    if (!this.comprehensiveFormData.comprehensiveDetails) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveInsurancePlanning = {} as IInsurancePlan;
    }
    return this.comprehensiveFormData.comprehensiveDetails
      .comprehensiveInsurancePlanning;
  }
  setInsurancePlanningList(comprehensiveInsurancePlanning: IInsurancePlan) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveInsurancePlanning = comprehensiveInsurancePlanning;
    this.commit();
  }
  setHospitalPlan(hospitalPlanList: IHospitalPlanList[]) {
    this.comprehensiveFormData.hospitalPlanList = hospitalPlanList;
    this.commit();
  }
  getRetirementPlan() {
    if (!this.comprehensiveFormData.comprehensiveDetails) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveRetirementPlanning = {} as IRetirementPlan;
    }
    return this.comprehensiveFormData.comprehensiveDetails
      .comprehensiveRetirementPlanning;
  }
  setRetirementPlan(comprehensiveRetirementPlanning: IRetirementPlan) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveRetirementPlanning = comprehensiveRetirementPlanning;
    this.commit();
  }
  getQuestionsList() {
    return this.comprehensiveApiService.getQuestionsList();
  }
  getSelectedOptionByIndex(index) {
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveRiskProfile['riskAssessQuest' + index];
  }
  setRiskAssessment(data, questionIndex) {
    console.log(data,questionIndex)
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveRiskProfile['riskAssessQuest' + questionIndex] = data;
    this.commit();
  }
  saveRiskAssessment() {
    const data = this.constructRiskAssessmentSaveRequest();
    return this.comprehensiveApiService.saveRiskAssessment(data);
  }
  constructRiskAssessmentSaveRequest() {
    const formData =  this.comprehensiveFormData.comprehensiveDetails.comprehensiveRiskProfile;
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
      enquiryId: this.getEnquiryId(),
      answers: selAnswers
    };
  }
  getFormError(form, formName) {
    const controls = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.comprehensiveFormError[
      formName
    ].formFieldErrors.errorTitle;

    for (const name in controls) {
      if (
        !controls[name].hasOwnProperty('controls') &&
        controls[name].invalid
      ) {
        errors.errorMessages.push(
          this.comprehensiveFormError[formName].formFieldErrors[name][
            Object.keys(controls[name]['errors'])[0]
          ].errorMessage
        );
      } else {
        const formGroup = {
          formName: '',
          errors: [],
          errorStatus: false
        };
        for (const subFormName in controls[name].controls) {
          if (controls[name].controls[subFormName].invalid) {
            formGroup.errorStatus = true;
          }
        }
        if (formGroup.errorStatus === true) {
          errors.errorMessages.push(
            this.comprehensiveFormError[formName].formFieldErrors[name][
              'required'
            ].errorMessage
          );
        }
      }
    }
    return errors;
  }

  getMultipleFormError(form, formName, formTitle) {
    const forms = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.comprehensiveFormError[
      formName
    ].formFieldErrors.errorTitle;
    let index = 0;

    // tslint:disable-next-line:forin
    for (const field in forms) {
      if (forms[field].status === 'INVALID') {
        for (const control of forms[field].controls) {
          const formGroup = {
            formName: '',
            errors: []
          };
          // tslint:disable-next-line:forin
          for (const name in control.controls) {
            formGroup.formName = formTitle[index];
            if (control.controls[name].invalid) {
              formGroup.errors.push(
                this.comprehensiveFormError[formName].formFieldErrors[name][
                  Object.keys(control.controls[name]['errors'])[0]
                ].errorMessage
              );
            }
          }
          if (formGroup.errors.length > 0) {
            errors.errorMessages.push(formGroup);
          }
          index++;
        }
      }
    }
    return errors;
  }

  openErrorModal(
    title: string,
    message: any,
    isMultipleForm: boolean,
    formName?: string
  ) {
    const ref = this.modal.open(ErrorModalComponent, {
      centered: true,
      windowClass: 'will-custom-modal'
    });
    ref.componentInstance.errorTitle = title;
    if (!isMultipleForm) {
      ref.componentInstance.formName = formName;

      ref.componentInstance.errorMessageList = message;
    } else {
      message.forEach((element: any, index) => {
        if (element.formName) {
          message[index]['formName'] = element.formName.name;
        }
      });
      ref.componentInstance.multipleFormErrors = message;
    }
    return false;
  }

  openTooltipModal(toolTipParam) {
    const ref = this.modal.open(ToolTipModalComponent, {
      centered: true
    });
    ref.componentInstance.tooltipTitle = toolTipParam.TITLE;
    ref.componentInstance.tooltipMessage = toolTipParam.DESCRIPTION;
  }
  openTooltipModalWithDismiss(toolTipParam) {
    const ref = this.modal.open(ToolTipModalComponent, {
      centered: true
    });
    ref.componentInstance.tooltipTitle = toolTipParam.TITLE;
    ref.componentInstance.tooltipMessage = toolTipParam.DESCRIPTION;
    ref.result.then(
      result => { },
      reason => {
        if (reason === 'Cross click' && toolTipParam.URL) {
          this.router.navigate([toolTipParam.URL]);
        }
      }
    );
    return false;
  }
  openSummaryPopUpModal(summaryModalDetails) {
    const ref = this.modal.open(SummaryModalComponent, {
      centered: true,
      windowClass: 'full-height-comprehensive',
      backdrop: 'static',
      keyboard: false
    });
    ref.componentInstance.summaryModalDetails = summaryModalDetails;
    ref.result.then(
      result => { },
      reason => {
        if (reason === 'dismiss' && summaryModalDetails.routerEnabled) {
          const previousUrl = this.getPreviousUrl(this.router.url);
          if (previousUrl !== null) {
            this.router.navigate([previousUrl]);
          } else {
            this.navbarService.goBack();
          }
        }
      }
    );
    return false;
  }

  // tslint:disable-next-line:cognitive-complexity
  additionOfCurrency(formValues, inputParams = []) {
    let sum: any = 0;

    for (const i in formValues) {
      if (formValues[i] !== null && formValues[i] !== '') {
        const Regexp = new RegExp('[,]', 'g');
        let thisValue: any = (formValues[i] + '').replace(Regexp, '');
        thisValue = parseInt(formValues[i], 10);
        if (!isNaN(thisValue)) {
          if (inputParams.indexOf(i) >= 0) {
            sum += thisValue !== 0 ? thisValue * 12 : 0;
          } else {
            sum += parseInt(thisValue, 10);
          }
        }
      }
    }
    return sum.toFixed();
  }

  /**
   * Get the previous url to navigate.
   *
   * @param {string} currentUrl
   * @returns {string}
   * @memberof ComprehensiveService
   */
  getPreviousUrl(currentUrl: string): string {
    const urlList = (!this.getComprehensiveVersion()) ? this.getComprehensiveUrlList(COMPREHENSIVE_LITE_ROUTER_CONFIG) : this.getComprehensiveUrlList(COMPREHENSIVE_FULL_ROUTER_CONFIG);
    const currentUrlIndex = toInteger(Util.getKeyByValue(urlList, currentUrl));
    if (currentUrlIndex > 0) {
      const previousUrl = urlList[currentUrlIndex - 1];
      if (
        previousUrl ===
        ProgressTrackerUtil.trimPath(this.routingService.getCurrentUrl())
      ) {
        return null;
      } else {
        return previousUrl;
      }
    }
    return COMPREHENSIVE_BASE_ROUTE;
  }

  /**
   * Check whether the current URL is accessible if not, return the next accessible URL.
   *
   * @param {string} url
   * @returns {string}
   * @memberof ComprehensiveService
   */
  // tslint:disable-next-line:cognitive-complexity
  getAccessibleUrl(url: string): string {
    if (!this.getComprehensiveVersion()) {
      const urlLists = this.getComprehensiveUrlList(COMPREHENSIVE_LITE_ROUTER_CONFIG);
      return this.getAccessibleLiteJourney(urlLists, url);
    } else {
      const urlLists = this.getComprehensiveUrlList(COMPREHENSIVE_FULL_ROUTER_CONFIG);
      return this.getAccessibleFullJourney(urlLists, url);
    }
  }
  // Return Access Url for Full Journey
  getAccessibleFullJourney(urlList: any, url: any) {
  
    this.generateProgressTrackerData();

    const currentUrlIndex = toInteger(Util.getKeyByValue(urlList, url));
    let accessibleUrl = '';

    const profileData = this.getMyProfile();
    const cmpSummary = this.getComprehensiveSummary();

    const enquiry = this.getComprehensiveSummary().comprehensiveEnquiry;
    const childEndowmentData: IChildEndowment[] = this.getChildEndowment();

    const dependantProgressData = this.getDependantsProgressData();
    const financeProgressData = this.getFinancesProgressData();
    const fireProofingProgressData = this.getFireproofingProgressData();
    const retirementProgressData = this.getRetirementProgressData();
    const reportStatusData = this.getReportStatus();
    const stepCompleted = this.getMySteps();
    let userAge = 0;
    if (cmpSummary && (cmpSummary.baseProfile.dateOfBirth !== null || cmpSummary.baseProfile.dateOfBirth !== '')) {      
      userAge = this.aboutAge.calculateAge(
        cmpSummary.baseProfile.dateOfBirth,
        new Date()
      );
    } 

    let accessPage = true;
    if (userAge < COMPREHENSIVE_CONST.YOUR_PROFILE.APP_MIN_AGE
      || userAge > COMPREHENSIVE_CONST.YOUR_PROFILE.APP_MAX_AGE) {
      accessPage = false;
    }

    for (let index = currentUrlIndex; index >= 0; index--) {
      if (accessibleUrl !== '') {
        break;
      } else {
        let canAccess = true;
        dependantProgressData.subItems.forEach(subItem => {
          if (!subItem.completed && subItem.hidden !== true) {
            canAccess = false;
          }
        });
        switch (index) {
          // 'getting-started'
          case 0:
            // TODO : change the condition to check `cmpSummary.enquiry.promoCodeValidated`
            if (
              !cmpSummary.comprehensiveEnquiry.enquiryId ||
              !cmpSummary.comprehensiveEnquiry.isValidatedPromoCode
            ) {
              accessibleUrl = COMPREHENSIVE_BASE_ROUTE;
            }
            break;

          // 'steps/1',
          case 1:
          // 'dependant-selection'
          case 2:
            if (accessPage && profileData.nationalityStatus) {
              accessibleUrl = urlList[index];
            }
            break;

          // 'dependant-selection/summary'
          case 3:
            if (
              accessPage && enquiry.hasDependents === false &&
              dependantProgressData.subItems[2].value === '0'
            ) {
              accessibleUrl = urlList[index];
            }
            break;

          // 'dependant-details'
          case 4:
            if (
              accessPage && enquiry.hasDependents !== null &&
              enquiry.hasDependents !== false
            ) {
              accessibleUrl = urlList[index];
            }
            break;

          // 'dependant-details/summary'
          case 5:
            if (accessPage && !this.hasChildDependant() && enquiry.hasDependents) {
              accessibleUrl = urlList[index];
            }
            break;

          // 'dependant-education-selection'
          case 6:
            if (accessPage && this.hasChildDependant()) {
              accessibleUrl = urlList[index];
            }
            break;

          // 'dependant-education-selection/summary'
          case 7:
            if (
              accessPage && this.hasChildDependant() &&
              (this.hasEndowment() === '0' || this.hasEndowment() === '2')
            ) {
              accessibleUrl = urlList[index];
            }
            break;

          // 'dependant-education-preference'
          case 8:
            if (accessPage && this.hasChildDependant() && this.hasEndowment() === '1') {
              accessibleUrl = urlList[index];
            }
            break;

          // 'dependant-education-list'
          case 9:
          // 'dependant-education-list/summary'
          case 10:
            let eduPref = '';
            if (
              childEndowmentData.length > 0 &&
              childEndowmentData[0].location !== null
            ) {
              eduPref = childEndowmentData[0].location;
            }
            if (
              accessPage && this.hasChildDependant() &&
              this.hasEndowment() === '1' &&
              eduPref !== ''
            ) {
              accessibleUrl = urlList[index];
            }
            break;

          // 'steps/2'
          case 11:
            if (accessPage && canAccess) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-earnings'
          case 12:
            if (accessPage && canAccess && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-spendings'
          case 13:
            if (accessPage && canAccess && financeProgressData.subItems[0].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'regular-saving-plan'
          case 14:
            if (accessPage && canAccess && financeProgressData.subItems[1].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'bad-mood-fund'
          case 15:
            if (accessPage && canAccess && financeProgressData.subItems[2].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-assets'
          case 16:
            if (accessPage && canAccess && financeProgressData.subItems[4].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-liabilities'
          case 17:
            if (accessPage && canAccess && financeProgressData.subItems[5].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-liabilities/summary'
          case 18:
          // 'steps/3'
          case 19:
            if (accessPage && canAccess && financeProgressData.subItems[6].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'insurance-plan'
          case 20:
            if (accessPage && canAccess && financeProgressData.subItems[6].completed && stepCompleted > 1) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'insurance-plan/summary'
          case 21:
          // 'steps/4'
          case 22:
            if (accessPage && canAccess && fireProofingProgressData.subItems[0].completed && stepCompleted > 1) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'retirement-plan'
          case 23:
            if (accessPage && canAccess && fireProofingProgressData.subItems[0].completed && stepCompleted > 2) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'retirement-plan/summary'
          case 24:
          // 'result'
          case 25:
          case 26:
            if (accessPage && canAccess && retirementProgressData.subItems[0].completed && stepCompleted >= 3) {
              accessibleUrl = urlList[index];
            }
            break;
          case 27:
            if (
              accessPage && canAccess &&
              retirementProgressData.subItems[0].completed &&
              reportStatusData === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED
            ) {
              accessibleUrl = urlList[index];
            }
            break;
        }
      }
    }
    if (accessibleUrl === '') {
      accessibleUrl = urlList[0];
    }
    return accessibleUrl;
  }
  // Return Access Url for Lite Journey
  getAccessibleLiteJourney(urlList: any, url: any) {
    this.generateProgressTrackerData();

    const currentUrlIndex = toInteger(Util.getKeyByValue(urlList, url));
    let accessibleUrl = '';

    const profileData = this.getMyProfile();
    const cmpSummary = this.getComprehensiveSummary();

    const enquiry = this.getComprehensiveSummary().comprehensiveEnquiry;
    const childEndowmentData: IChildEndowment[] = this.getChildEndowment();

    const dependantProgressData = this.getDependantsProgressData();
    const financeProgressData = this.getFinancesProgressData();
    const fireProofingProgressData = this.getFireproofingProgressData();
    const retirementProgressData = this.getRetirementProgressData();
    const reportStatusData = this.getReportStatus();
    const stepCompleted = this.getMySteps();

    let userAge = 0;
    if (cmpSummary && (cmpSummary.baseProfile.dateOfBirth !== null || cmpSummary.baseProfile.dateOfBirth !== '')) {      
      userAge = this.aboutAge.calculateAge(
        cmpSummary.baseProfile.dateOfBirth,
        new Date()
      );
    } 

    let accessPage = true;
    /*if (userAge < COMPREHENSIVE_CONST.YOUR_PROFILE.APP_MIN_AGE
      || userAge > COMPREHENSIVE_CONST.YOUR_PROFILE.APP_MAX_AGE) {
      accessPage = false;
    }*/

    for (let index = currentUrlIndex; index >= 0; index--) {
      if (accessibleUrl !== '') {
        break;
      } else {
        let canAccess = true;
        /*console.log(dependantProgressData);
        dependantProgressData.subItems.forEach(subItem => {
          if (!subItem.completed && subItem.hidden !== true) {
            canAccess = false;
          }
        });
        if (!(accessPage && enquiry.hasDependents === false &&
          dependantProgressData.subItems[2].value === '0')) {
          canAccess = false;
        }*/
        switch (index) {
          // 'getting-started'
          case 0:
            // TODO : change the condition to check `cmpSummary.enquiry.promoCodeValidated`
            if (
              !cmpSummary.comprehensiveEnquiry.enquiryId
            ) {
              accessibleUrl = COMPREHENSIVE_BASE_ROUTE;
            }
            break;

          // 'steps/1',
          case 1:
          // 'dependant-selection'
          case 2:
            if (accessPage && profileData.nationalityStatus) {
              accessibleUrl = urlList[index];
            }
            break;

          // 'steps/2'
          case 3:
            if (accessPage && canAccess) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-earnings'
          case 4:
            if (accessPage && canAccess && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-spendings'
          case 5:
            if (accessPage && canAccess && financeProgressData.subItems[0].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'regular-saving-plan'
          case 6:
            if (accessPage && canAccess && financeProgressData.subItems[1].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'bad-mood-fund'
          case 7:
            if (accessPage && canAccess && financeProgressData.subItems[2].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-assets'
          case 8:
            if (accessPage && canAccess && financeProgressData.subItems[4].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'my-liabilities'
          case 9:
            if (accessPage && canAccess && financeProgressData.subItems[5].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'steps/3'
          case 10:
            if (accessPage && canAccess && financeProgressData.subItems[6].completed && stepCompleted > 0) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'retirement-plan'
          case 11:
            if (accessPage && canAccess && financeProgressData.subItems[6].completed && stepCompleted > 1) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'steps/4'
          case 12:
            if (accessPage && canAccess && retirementProgressData.subItems[0].completed && stepCompleted > 1) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'Risk Profile'
          case 13:
          case 14:
          case 15:
          case 16:
            if (accessPage && canAccess && retirementProgressData.subItems[0].completed && stepCompleted > 2) {
              accessibleUrl = urlList[index];
            }
            break;
          // 'result'
          case 17:
          case 18:
            if (accessPage && canAccess && retirementProgressData.subItems[0].completed && stepCompleted >= 3) {
              accessibleUrl = urlList[index];
            }
            break;
          case 19:
            if (
              accessPage && canAccess &&
              retirementProgressData.subItems[0].completed &&
              reportStatusData === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED
            ) {
              accessibleUrl = urlList[index];
            }
            break;
        }
      }
    }
    if (accessibleUrl === '') {
      accessibleUrl = urlList[0];
    }
    return accessibleUrl;
  }

  generateProgressTrackerData(): IProgressTrackerData {
    const comprehensiveVersion = this.getComprehensiveVersion();
    this.progressData = {} as IProgressTrackerData;
    this.progressData = {
      title: 'Your Progress Tracker',
      subTitle: (!comprehensiveVersion)
        ? 'Est. Time Required: 10 mins' : 'Est. Time Required: 20 mins',
      properties: {
        disabled: false
      },
      items: []
    };

    this.progressData.items.push(this.getGetStartedProgressData());
    this.progressData.items.push(this.getDependantsProgressData());
    this.progressData.items.push(this.getFinancesProgressData());
    if (comprehensiveVersion) {
      this.progressData.items.push(this.getFireproofingProgressData());
    }
    this.progressData.items.push(this.getRetirementProgressData());
    if (!comprehensiveVersion) {
      this.progressData.items.push(this.getRiskProfileProgressData());
    }
    return this.progressData;
  }

  getGetStartedProgressData(): IProgressTrackerItem {
    const myProfile: IMyProfile = this.getMyProfile();
    return {
      title: 'Get Started',
      expanded: true,
      completed: typeof myProfile.gender !== 'undefined',
      customStyle: this.getStartedStyle,
      subItems: [
        {
          id: COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED,
          path: COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED,
          title: 'Tell us about yourself',
          value: myProfile.firstName,
          completed: typeof myProfile.firstName !== 'undefined'
        }
      ]
    };
  }

  // tslint:disable-next-line:cognitive-complexity
  getDependantsProgressData(): IProgressTrackerItem {
    const subItemsArray: IProgressTrackerSubItem[] = [];

    let hasDependants = false;
    let hasEndowments = false;
    let hasRegularSavings = false;
    const enquiry = this.getComprehensiveSummary().comprehensiveEnquiry;
    const childEndowmentData: IChildEndowment[] = this.getChildEndowment();
    const dependantData: IDependantDetail[] = this.getMyDependant();
    const dependentHouseHoldData: IdependentsSummaryList = this.gethouseHoldDetails();
    const comprehensiveVersion = this.getComprehensiveVersion();

    if (enquiry && enquiry.hasDependents !== null && dependantData && dependantData.length > 0) {
      hasDependants = true;
    }
    if (
      enquiry &&
      enquiry.hasEndowments === '1' &&
      childEndowmentData.length > 0
    ) {
      hasEndowments = true;
    }
    if (enquiry && enquiry.hasRegularSavingsPlans !== null) {
      hasRegularSavings = true;
    }

    let noOfDependants = '';
    if (dependantData && comprehensiveVersion) {
      noOfDependants = dependantData.length + '';
    }
    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_SELECTION,
      path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_SELECTION,
      title: 'No. of Household Members',
      value: dependentHouseHoldData.noOfHouseholdMembers == 0 || dependentHouseHoldData.noOfHouseholdMembers ? dependentHouseHoldData.noOfHouseholdMembers + '' : '',
      completed: enquiry.hasDependents !== null
    });
    subItemsArray.push({
      id: '',
      path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_SELECTION,
      title: 'Household Income',
      value: dependentHouseHoldData.houseHoldIncome ? dependentHouseHoldData.houseHoldIncome + '' : '',
      completed: enquiry.hasDependents !== null
    });

    if (comprehensiveVersion) {
      subItemsArray.push({
        id: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_DETAILS,
        path:
          enquiry.hasDependents !== null && enquiry.hasDependents !== false
            ? COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_DETAILS
            : COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_SELECTION,
        title: 'Number of Dependant(s)',
        value: noOfDependants,
        completed: enquiry.hasDependents !== null
      });
    }
    if (comprehensiveVersion && (enquiry.hasDependents === null || dependantData && dependantData.length > 0)) {
      const eduPrefs: IChildEndowment[] = this.getChildEndowment();
      const eduPlan: string = this.hasEndowment();

      const prefsList: IProgressTrackerSubItemList[] = [];
      let prefsListCompleted = false;
      let hasEndowmentAmount = false;
      const tempPrefsList = [];

      if (
        eduPrefs &&
        enquiry.hasDependents !== null &&
        enquiry.hasEndowments === '1'
      ) {
        eduPrefs.forEach(item => {
          if (!Util.isEmptyOrNull(item.location)) {
            tempPrefsList.push(item);
          }
          if (!Util.isEmptyOrNull(item.endowmentMaturityYears)) {
            hasEndowmentAmount = true;
          }
          prefsList.push({
            title: item.name,
            value:
              (item.location === null ? '' : item.location) +
              (item.educationCourse === null ? '' : ', ' + item.educationCourse) +
              (item.educationSpendingShare === null ? '' : ', ' + item.educationSpendingShare) + '% Share'
          });
        });
      }

      if (tempPrefsList.length === prefsList.length) {
        prefsListCompleted = true;
      }

      let hasEndowmentPlans = '';
      if (eduPlan === '1') {
        hasEndowmentPlans = hasEndowmentAmount ? 'Yes' : 'No';
      } else if (eduPlan === '2') {
        hasEndowmentPlans = 'No';
      }

      let hasEduPlansValue = '';
      if (hasEndowments) {
        hasEduPlansValue = 'Yes';
      } else if (enquiry.hasEndowments !== '1') {
        hasEduPlansValue = 'No';
      }

      subItemsArray.push({
        id: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_SELECTION,
        path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_SELECTION,
        title: 'Plan for children education',
        value: hasEduPlansValue,
        completed:
          enquiry.hasEndowments !== null &&
          hasDependants &&
          eduPrefs &&
          typeof eduPrefs !== 'undefined',
        hidden: !this.hasChildDependant()
      });

      if (enquiry.hasEndowments === '1') {
        subItemsArray.push({
          id: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_PREFERENCE,
          path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_PREFERENCE,
          title: 'Education Preferences',
          value:
            prefsList.length === 0 || enquiry.hasEndowments !== '1' ? 'No' : '',
          completed:
            hasDependants &&
            hasEndowments &&
            eduPrefs &&
            typeof eduPrefs !== 'undefined' &&
            prefsListCompleted,
          list: prefsList
        });
        subItemsArray.push({
          id: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_LIST,
          path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_LIST,
          title: 'Do you have education endowment plan',
          value: hasEndowmentPlans,
          completed:
            hasDependants &&
            hasEndowments &&
            prefsListCompleted &&
            (typeof eduPlan !== 'undefined' || eduPlan !== '0')
        });
      }
    }
    return {
      title: "What's On Your Shoulders",
      expanded: true,
      completed: hasDependants,
      customStyle: 'dependant',
      subItems: subItemsArray
    };
  }

  transformAsCurrency(in_amount: any): string {
    return this.currencyPipe.transform(
      in_amount,
      'USD',
      'symbol-narrow',
      '1.0-2'
    );
  }

  getFinancesProgressData(): IProgressTrackerItem {
    const subItemsArray: IProgressTrackerSubItem[] = [];
    const earningsData: IMyEarnings = this.getMyEarnings();
    const spendingsData: IMySpendings = this.getMySpendings();
    const assetsData: IMyAssets = this.getMyAssets();
    const liabilitiesData: IMyLiabilities = this.getMyLiabilities();

    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.MY_EARNINGS,
      path: COMPREHENSIVE_ROUTE_PATHS.MY_EARNINGS,
      title: 'Your Earnings',
      value:
        earningsData && earningsData.totalAnnualIncomeBucket >= 0
          ? this.transformAsCurrency(earningsData.totalAnnualIncomeBucket) + ''
          : '',
      completed: !Util.isEmptyOrNull(earningsData)
    });
    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.MY_SPENDINGS,
      path: COMPREHENSIVE_ROUTE_PATHS.MY_SPENDINGS,
      title: 'Your Spendings',
      value:
        spendingsData && spendingsData.totalAnnualExpenses >= 0
          ? this.transformAsCurrency(spendingsData.totalAnnualExpenses) + ''
          : '',
      completed: !Util.isEmptyOrNull(spendingsData)
    });

    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.REGULAR_SAVING_PLAN,
      path: COMPREHENSIVE_ROUTE_PATHS.REGULAR_SAVING_PLAN,
      title: 'Regular Savings Plan',
      value: '',
      completed:
        this.hasRegularSavings() !== null ||
        !Util.isEmptyOrNull(this.getRegularSavingsList()),
      hidden: true
    });

    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.BAD_MOOD_FUND,
      path: COMPREHENSIVE_ROUTE_PATHS.BAD_MOOD_FUND,
      title: 'Bad Mood Fund',
      value: this.getDownOnLuck().badMoodMonthlyAmount
        ? this.transformAsCurrency(this.getDownOnLuck().badMoodMonthlyAmount) +
        ''
        : typeof this.getDownOnLuck().hospitalPlanId !== 'undefined'
          ? this.transformAsCurrency(0)
          : '',
      completed: typeof this.getDownOnLuck().hospitalPlanId !== 'undefined',
      hidden: !this.hasBadMoodFund() && !Util.isEmptyOrNull(earningsData)
    });

    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.BAD_MOOD_FUND + '1',
      path: COMPREHENSIVE_ROUTE_PATHS.BAD_MOOD_FUND,
      title: 'Hospital Choice',
      value:
        typeof this.getDownOnLuck().hospitalPlanId !== 'undefined'
          ? this.getDownOnLuck().hospitalPlanName
          : '',
      completed: typeof this.getDownOnLuck().hospitalPlanId !== 'undefined'
    });

    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.MY_ASSETS,
      path: COMPREHENSIVE_ROUTE_PATHS.MY_ASSETS,
      title: 'Assets (What You Own)',
      value:
        assetsData && assetsData.totalAnnualAssets >= 0
          ? this.transformAsCurrency(assetsData.totalAnnualAssets) + ''
          : '',
      completed: !Util.isEmptyOrNull(assetsData)
    });
    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.MY_LIABILITIES,
      path: COMPREHENSIVE_ROUTE_PATHS.MY_LIABILITIES,
      title: 'Liabilities (What You Owe)',
      value:
        liabilitiesData && liabilitiesData.totalAnnualLiabilities >= 0
          ? this.transformAsCurrency(liabilitiesData.totalAnnualLiabilities) +
          ''
          : '',
      completed: !Util.isEmptyOrNull(liabilitiesData)
    });
    return {
      title: 'Your Finances',
      expanded: true,
      completed: false,
      customStyle: 'finances',
      subItems: subItemsArray
    };
  }

  /**
   * Get progress tracker data for  the 'Your Current Fireproofing' section.
   *
   * @returns {IProgressTrackerItem}
   * @memberof ComprehensiveService
   */
  // tslint:disable-next-line:cognitive-complexity
  getFireproofingProgressData(): IProgressTrackerItem {
    const cmpSummary = this.getComprehensiveSummary();
    const isCompleted = cmpSummary.comprehensiveInsurancePlanning !== null;
    let hospitalPlanValue = '';
    let cpfDependantProtectionSchemeValue = '$0';
    let criticalIllnessValue = '$0';
    let ocpDisabilityValue = '$0 /mth';
    let longTermCareValue = '$0 /mth';
    let otherLongTermCareValue = '$0 /mth';
    let longTermCareList = [];

    if (isCompleted) {
      const haveHospitalPlan =
        cmpSummary.comprehensiveInsurancePlanning.haveHospitalPlan;
      if (haveHospitalPlan) {
        hospitalPlanValue = 'Yes';
      } else if (haveHospitalPlan !== null && !haveHospitalPlan) {
        hospitalPlanValue = 'No';
      }

      const haveCPFDependentsProtectionScheme =
        cmpSummary.comprehensiveInsurancePlanning
          .haveCPFDependentsProtectionScheme;
      if (!Util.isEmptyOrNull(haveCPFDependentsProtectionScheme)) {
        if (haveCPFDependentsProtectionScheme === 1) {
          const otherLifeProtectionCoverageAmount =
            cmpSummary.comprehensiveInsurancePlanning
              .otherLifeProtectionCoverageAmount;
          const lifeProtectionAmount =
            cmpSummary.comprehensiveInsurancePlanning.lifeProtectionAmount;
          const homeProtectionCoverageAmount =
            cmpSummary.comprehensiveInsurancePlanning
              .homeProtectionCoverageAmount;
          cpfDependantProtectionSchemeValue = this.transformAsCurrency(
            Util.toNumber(otherLifeProtectionCoverageAmount) +
            Util.toNumber(lifeProtectionAmount) +
            Util.toNumber(homeProtectionCoverageAmount)
          );
        } else if (haveCPFDependentsProtectionScheme === 0) {
          cpfDependantProtectionSchemeValue = 'No';
        } else if (haveCPFDependentsProtectionScheme === 2) {
          cpfDependantProtectionSchemeValue = 'Not Sure';
        }
      }

      if (
        !Util.isEmptyOrNull(
          cmpSummary.comprehensiveInsurancePlanning
            .criticalIllnessCoverageAmount
        )
      ) {
        criticalIllnessValue = this.transformAsCurrency(
          cmpSummary.comprehensiveInsurancePlanning
            .criticalIllnessCoverageAmount
        );
      }

      if (
        !Util.isEmptyOrNull(
          cmpSummary.comprehensiveInsurancePlanning
            .disabilityIncomeCoverageAmount
        )
      ) {
        ocpDisabilityValue = this.transformAsCurrency(
          cmpSummary.comprehensiveInsurancePlanning
            .disabilityIncomeCoverageAmount
        ) + " /mth";
      }

      if (
        !Util.isEmptyOrNull(
          cmpSummary.comprehensiveInsurancePlanning.haveLongTermElderShield
        )
      ) {
        if (
          cmpSummary.comprehensiveInsurancePlanning.haveLongTermElderShield ===
          1
        ) {
          longTermCareValue = this.transformAsCurrency(
            cmpSummary.comprehensiveInsurancePlanning.longTermElderShieldAmount
          ) + " /mth";
          otherLongTermCareValue = this.transformAsCurrency(
            cmpSummary.comprehensiveInsurancePlanning.otherLongTermCareInsuranceAmount
          ) + " /mth";
          longTermCareList.push({
            title: 'Other coverage amount',
            value: otherLongTermCareValue,
          })


        } else if (
          cmpSummary.comprehensiveInsurancePlanning.haveLongTermElderShield ===
          0
        ) {
          longTermCareValue = 'No';
        } else if (
          cmpSummary.comprehensiveInsurancePlanning.haveLongTermElderShield ===
          2
        ) {
          longTermCareValue = 'Not Sure';
        }
      }
    }


    return {
      title: 'Risk-Proof Your Journey',
      expanded: true,
      completed: false,
      customStyle: 'risk-proof',
      subItems: [
        {
          id: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN,
          path: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN,
          title: 'Do you have a hospital plan',
          value: hospitalPlanValue,
          completed: isCompleted
        },
        {
          id: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN + '1',
          path: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN,
          title: 'Life Protection',
          value: cpfDependantProtectionSchemeValue,
          completed: isCompleted
        },
        {
          id: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN + '2',
          path: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN,
          title: 'Critical Illness',
          value: criticalIllnessValue,
          completed: isCompleted
        },
        {
          id: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN + '3',
          path: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN,
          title: 'Occupational Disability',
          value: ocpDisabilityValue,
          completed: isCompleted
        },
        {
          id: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN + '4',
          path: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN,
          title: 'Long-Term Care',
          value: longTermCareValue,
          completed: isCompleted,
          hidden: this.getMyProfile().dateOfBirth
            ? this.ageUtil.calculateAge(
              this.getMyProfile().dateOfBirth,
              new Date()
            ) < COMPREHENSIVE_CONST.INSURANCE_PLAN.LONG_TERM_INSURANCE_AGE
            : true,
          list: longTermCareList
        }
      ]
    };
  }

  /**
   * Get progress tracker data for  the 'Your Risk Profile' section.
   *
   * @returns {IProgressTrackerItem}
   * @memberof ComprehensiveService
   */
  // tslint:disable-next-line:cognitive-complexity
  getRiskProfileProgressData(): IProgressTrackerItem {
    const cmpSummary = this.getComprehensiveSummary();
    const isCompleted = false; //cmpSummary.comprehensiveInsurancePlanning !== null;
    
    return {
      title: 'Your Risk Profile',
      expanded: true,
      completed: false,
      customStyle: 'risk-profile',
      subItems: [
        {
          id: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '1',
          path: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/1',
          title: 'Temporary Losses',
          value: '',
          completed: isCompleted
        },
        {
          id: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '2',
          path: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/2',
          title: 'Unrealised/Paper Loss',
          value: '',
          completed: isCompleted
        },
        {
          id: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '3',
          path: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/3',
          title: 'Stress Level',
          value: '',
          completed: isCompleted
        },
        {
          id: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '4',
          path: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/4',
          title: 'Portfolio Type',
          value: '',
          completed: isCompleted
        }
      ]
    };
  }


  /**
   * Get progress tracker data for the 'Financial Independence' section.
   *
   * @returns {IProgressTrackerItem}
   * @memberof ComprehensiveService
   */
  getRetirementProgressData(): IProgressTrackerItem {
    let retirementAgeValue = '';
    const cmpSummary = this.getComprehensiveSummary();
    const isCompleted = cmpSummary.comprehensiveRetirementPlanning !== null;
    if (
      isCompleted &&
      cmpSummary.comprehensiveRetirementPlanning.retirementAge
    ) {
      // tslint:disable-next-line:radix
      const retireAgeVal = parseInt(
        cmpSummary.comprehensiveRetirementPlanning.retirementAge
      );
      retirementAgeValue = retireAgeVal + ' yrs old';
    }
    let subItemsArray = [];
    subItemsArray.push({
      id: COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN,
      path: COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN,
      title: 'Retirement Age',
      value: retirementAgeValue,
      completed: isCompleted
    })
    if (this.getComprehensiveVersion() && cmpSummary.comprehensiveRetirementPlanning) {
      cmpSummary.comprehensiveRetirementPlanning.retirementIncomeSet.forEach((item, index) => {
        subItemsArray.push({
          id: COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN + '1',
          path: COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN,
          title: 'Retirement Income ' + (index + 1),
          value: '',
          completed: isCompleted,
          list: [{
            title: 'Monthly Payout',
            value: this.transformAsCurrency(item.monthlyPayout)
          },
          {
            title: 'Payout Start Age',
            value: item.payoutStartAge + ' years old'
          },
          {
            title: 'Payout Duration',
            value: item.payoutDuration
          }]
        })
      });


      cmpSummary.comprehensiveRetirementPlanning.lumpSumBenefitSet.forEach((item, index) => {
        subItemsArray.push({
          id: COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN + '2',
          path: COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN,
          title: 'Lump Sum Amount ' + (index + 1),
          value: '',
          completed: isCompleted,
          list: [{
            title: 'Maturity Amount',
            value: this.transformAsCurrency(item.maturityAmount)
          },
          {
            title: 'Maturity Year',
            value: item.maturityYear
          }]
        })
      });
    }

    return {
      title: 'Financial Independence',
      expanded: true,
      completed: false,
      customStyle: 'retirement-icon',
      subItems: subItemsArray

    };
  }

  /**
   * Bucket Calculation for Earnings and Assets
   */
  setBucketImage(bucketParams: any, formValues: any, totalBucket) {
    const bucketFlag = [];
    for (const i in bucketParams) {
      if (formValues[bucketParams[i]] > 0) {
        bucketFlag.push(true);
      } else {
        bucketFlag.push(false);
      }
    }
    if (bucketFlag.indexOf(true) >= 0 && bucketFlag.indexOf(false) < 0) {
      return 'filledBucket';
    } else if (
      (bucketFlag.indexOf(true) >= 0 && bucketFlag.indexOf(false) >= 0) ||
      totalBucket > 0
    ) {
      return 'middleBucket';
    } else {
      return 'emptyBucket';
    }
  }
  /**
   * Set Total Bucket Income For Earnings
   */
  setBucketAmountByCal() {
    Object.keys(COMPREHENSIVE_CONST.YOUR_FINANCES).forEach(financeInput => {
      const financeData = COMPREHENSIVE_CONST.YOUR_FINANCES[financeInput];
      const inputBucket = Object.assign(
        {},
        this.comprehensiveFormData.comprehensiveDetails[financeData.API_KEY]
      );
      if (
        Object.keys(inputBucket).length > 0 &&
        inputBucket.constructor === Object
      ) {
        const popInputBucket = financeData.POP_FORM_INPUT;
        const filterInput = this.unSetObjectByKey(inputBucket, popInputBucket);
        const inputParams = financeData.MONTHLY_INPUT_CALC;
        if (financeInput === 'YOUR_EARNINGS') {
          const inputTotal = this.getTotalAnnualIncomeByEarnings(filterInput);
          this.comprehensiveFormData.comprehensiveDetails[financeData.API_KEY][
            financeData.API_TOTAL_BUCKET_KEY
          ] = !isNaN(inputTotal) && inputTotal > 0 ? inputTotal : 0;
        } else {
          const inputTotal = this.additionOfCurrency(filterInput, inputParams);
          this.comprehensiveFormData.comprehensiveDetails[financeData.API_KEY][
            financeData.API_TOTAL_BUCKET_KEY
          ] = !isNaN(inputTotal) && inputTotal > 0 ? inputTotal : 0;
        }
      }
    });
  }
  /**
   * Remove key from Object
   * First Parameter is Object and Second Parameter is array with key need to pop
   */
  // tslint:disable-next-line: cognitive-complexity
  unSetObjectByKey(inputObject: any, removeKey: any) {
    Object.keys(inputObject).forEach(key => {
      if (Array.isArray(inputObject[key])) {
        inputObject[key].forEach((objDetails: any, index) => {
          Object.keys(objDetails).forEach(innerKey => {
            if (
              innerKey !== 'enquiryId' &&
              innerKey !== 'customerId' &&
              innerKey !== 'id' &&
              removeKey.indexOf(innerKey) < 0
            ) {
              const Regexp = new RegExp('[,]', 'g');
              let thisValue: any = (objDetails[innerKey] + '').replace(
                Regexp,
                ''
              );
              thisValue = parseInt(objDetails[innerKey], 10);
              if (!isNaN(thisValue)) {
                inputObject[innerKey + '_' + index] = thisValue;
              }
            }
          });
        });
      }
    });
    if (removeKey) {
      Object.keys(removeKey).forEach(key => {
        if (key !== '') {
          delete inputObject[removeKey[key]];
        }
      });
    }
    return inputObject;
  }
  /**
   * Compute Expense Calculation for Summary Page
   * PV x (1+r)^n
   */
  getComputedExpense(amount: number, percent: any, aboutAge: number) {
    let percentCal: any;
    let computedVal: any;
    let finalResult = 0;
    if (!isNaN(amount) && !isNaN(percent) && !isNaN(aboutAge)) {
      percentCal = percent / 100;
      computedVal = Math.pow(1 + percentCal, aboutAge);
      finalResult = Math.round(computedVal * amount);
    }
    return finalResult;
  }
  /**
   * Dependant Summary Page Compute
   */
  setDependantExpense(location: any, univ: any, aboutAge: number, nation: any) {
    let totalExpense: any = 0;
    const summaryConst =
      COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.EDUCATION_ENDOWMENT.DEPENDANT;
    Object.keys(summaryConst).forEach(expenseInput => {
      let locationChange = location;
      if (
        location === 'Singapore' &&
        (nation === 'Others' || nation === 'Singapore PR')
      ) {
        locationChange = nation;
      }
      const expenseConfig = summaryConst[expenseInput];
      totalExpense += this.getComputedExpense(
        expenseConfig[univ][locationChange],
        expenseConfig.PERCENT,
        aboutAge
      );
    });
    return totalExpense;
  }
  /**
   * Summary Page Finance - Compute Liquid Cash
   * (Cash + SavingBond) - (Expense/2)
   */
  getLiquidCash() {
    const assetDetails = this.getMyAssets();
    const expenseDetails = this.getHomeExpenses('cash', false);
    let sumLiquidCash = 0;
    if (assetDetails && assetDetails.cashInBank) {
      sumLiquidCash += this.getValidAmount(assetDetails.cashInBank);
    }
    if (assetDetails && assetDetails.savingsBonds) {
      sumLiquidCash += this.getValidAmount(assetDetails.savingsBonds);
    }
    if (expenseDetails) {
      sumLiquidCash -= 6 * expenseDetails;
    }
    return Math.floor(sumLiquidCash);
  }
  /**
   * Compute Spare Cash
   * 75% of (HomePay - RSP - BadMood - Expense)
   * 50% of (Annual Bonus/Dividend)
   */
  getComputeSpareCash() {
    let spareCash = 0;
    const summaryConfig = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.YOUR_FINANCES;
    const earningDetails = this.getMyEarnings();
    const homePayTotal = this.getTakeHomeSalary(
      earningDetails,
      summaryConfig,
      true,
      false
    );
    const regularSavingTotal = this.getRegularSaving('cash', true);
    const badMoodTotal = this.getBadMoodFund();
    const expenseTotal = this.getHomeExpenses('cash', true);
    const annualBonusCheck =
      earningDetails && earningDetails.annualBonus
        ? this.getValidAmount(earningDetails.annualBonus)
        : 0;
    const annualBonus =
      annualBonusCheck > 0
        ? this.getAnnualBonus(earningDetails, summaryConfig)
        : 0;
    const annualDividend =
      earningDetails && earningDetails.annualDividends
        ? this.getValidAmount(earningDetails.annualDividends)
        : 0;
    spareCash =
      summaryConfig.SPARE_CASH_EARN_SPEND_PERCENT *
      (homePayTotal - expenseTotal - regularSavingTotal - badMoodTotal) +
      summaryConfig.SPARE_CASH_ANNUAL_PERCENT * (annualBonus + annualDividend);
    return Math.floor(spareCash);
  }
  /**
   * Compute Take Home
   * annual Flag = true for annual calculation
   * annual Flag = false for monthly calculation
   */
  getTakeHomeSalary(
    earningDetails: any,
    summaryConfig: any,
    annualFlag: boolean,
    summaryFlag: boolean
  ) {
    const baseProfile = this.getMyProfile();
    let homeSalary = 0;
    let homeCpfSalary = 0;
    if (
      earningDetails &&
      earningDetails !== null &&
      (earningDetails.totalAnnualIncomeBucket > 0 || summaryFlag)
    ) {
      if (baseProfile && baseProfile.nationalityStatus === 'Others') {
        homeSalary += this.getValidAmount(earningDetails.monthlySalary);
        homeSalary += this.getValidAmount(
          earningDetails.otherMonthlyWorkIncome
        );
      } else {
        const cpfDetails = {
          amountLimitCpf: summaryConfig.HOME_PAY_CPF_SELF_EMPLOYED_BREAKDOWN,
          cpfPercent: summaryConfig.HOME_PAY_CPF_SELF_EMPLOYED_PERCENT
        };
        if (earningDetails.employmentType === 'Employed') {
          cpfDetails.amountLimitCpf =
            summaryConfig.HOME_PAY_CPF_EMPLOYED_BREAKDOWN;
          cpfDetails.cpfPercent = summaryConfig.HOME_PAY_CPF_EMPLOYED_PERCENT;
        }
        homeCpfSalary += this.getValidAmount(earningDetails.monthlySalary);
        homeCpfSalary += this.getValidAmount(
          earningDetails.otherMonthlyWorkIncome
        );
        if (homeCpfSalary > cpfDetails.amountLimitCpf) {
          homeSalary =
            cpfDetails.amountLimitCpf * cpfDetails.cpfPercent +
            (homeCpfSalary - cpfDetails.amountLimitCpf);
        } else {
          homeSalary = homeCpfSalary * cpfDetails.cpfPercent;
        }
      }
      homeSalary += this.getValidAmount(earningDetails.monthlyRentalIncome);
      homeSalary += this.getValidAmount(earningDetails.otherMonthlyIncome);
      if (annualFlag) {
        homeSalary *= 12;
        homeSalary += this.getValidAmount(earningDetails.otherAnnualIncome);
      }
    }
    return homeSalary;
  }
  /**
   * compute Regular Saving Plan
   * based on cash mode, cpf mode or both cpf/cash
   * annual Flag = true for annual calculation
   * annual Flag = false for monthly calculation
   */
  getRegularSaving(mode: any, annualFlag: boolean) {
    const rspDetails = this.getRegularSavingsList();
    if (rspDetails && rspDetails !== null) {
      const inputParams = { rsp: rspDetails };
      const removeParams = ['enquiryId'];
      if (mode === 'cash') {
        removeParams.push('regularPaidByCPF');
      } else if (mode === 'cpf') {
        removeParams.push('regularPaidByCash');
      }
      const filterInput = this.unSetObjectByKey(inputParams, removeParams);
      const monthlySumCal = this.additionOfCurrency(filterInput);
      if (annualFlag) {
        return monthlySumCal * 12;
      } else {
        return monthlySumCal;
      }
    } else {
      return 0;
    }
  }
  /**
   * get Expense based on cash mode, cpf mode or both cpf/cash
   * annual Flag = true for annual calculation
   * annual Flag = false for monthly calculation
   */
  getHomeExpenses(modeType: any, annualFlag: boolean) {
    const expenseDetails = this.getMySpendings();
    let homeExpenses = 0;
    if (expenseDetails && expenseDetails !== null) {
      homeExpenses += this.getValidAmount(expenseDetails.monthlyLivingExpenses);
      homeExpenses += this.getValidAmount(expenseDetails.carLoanPayment);
      homeExpenses += this.getValidAmount(expenseDetails.otherLoanPayment);
      if (modeType === 'cash' || modeType === 'both') {
        homeExpenses += this.getValidAmount(
          expenseDetails.HLMortgagePaymentUsingCash
        );
        homeExpenses += this.getValidAmount(
          expenseDetails.mortgagePaymentUsingCash
        );
      }
      if (modeType === 'cpf' || modeType === 'both') {
        homeExpenses += this.getValidAmount(
          expenseDetails.HLMortgagePaymentUsingCPF
        );
        homeExpenses += this.getValidAmount(
          expenseDetails.mortgagePaymentUsingCPF
        );
      }
      if (annualFlag) {
        homeExpenses *= 12;
        homeExpenses += this.getValidAmount(expenseDetails.adHocExpenses);
      }
    }
    return homeExpenses;
  }
  /**
   * Set Bad Mood Input value for Maximum
   * Bad Mood Fund =  Take Home Pay - Expenses - Less RSP (cash Component)
   */
  computeBadMoodFund() {
    const summaryConfig = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.YOUR_FINANCES;
    const earningDetails = this.getMyEarnings();
    const homeExpenseTotal = this.getHomeExpenses('cash', false);
    const homePayTotal = this.getTakeHomeSalary(
      earningDetails,
      summaryConfig,
      false,
      false
    );
    const regularSavingTotal = this.getRegularSaving('cash', false);
    let maxAmount = 0;
    maxAmount = homePayTotal - homeExpenseTotal - regularSavingTotal;
    return Math.floor(maxAmount);
  }
  /**
   * compute Bad Mood Fund
   */
  getBadMoodFund() {
    const badMoodDetails = this.getDownOnLuck();
    if (
      badMoodDetails &&
      badMoodDetails !== null &&
      badMoodDetails.badMoodMonthlyAmount
    ) {
      const badMoodMonthly = this.getValidAmount(
        badMoodDetails.badMoodMonthlyAmount
      );
      return badMoodMonthly * 12;
    } else {
      return 0;
    }
  }
  /**
   * check Number
   */
  getValidAmount(thisValue) {
    if (thisValue && thisValue !== null && !isNaN(thisValue)) {
      return toInteger(thisValue);
    } else {
      return 0;
    }
  }
  /**
   * Summary Dynamic Value
   * Get Static Json value for Fire Proofing
   */
  getCurrentFireProofing() {
    const getComprehensiveDetails = this.getComprehensiveSummary();
    const enquiry: IComprehensiveEnquiry =
      getComprehensiveDetails.comprehensiveEnquiry;
    const userGender = getComprehensiveDetails.baseProfile.gender.toLowerCase();
    const userAge = this.aboutAge.calculateAge(
      getComprehensiveDetails.baseProfile.dateOfBirth,
      new Date()
    );
    const fireProofingDetails = {
      dependant: false,
      gender: userGender.toLowerCase(),
      age: userAge
    };
    if (enquiry.hasDependents) {
      getComprehensiveDetails.dependentsSummaryList.dependentsList.forEach(dependant => {
        fireProofingDetails.dependant = true;
      });
    }
    return fireProofingDetails;
  }
  /**
   * Disable Form Element
   */
  getFormDisabled(formDetails: any) {
    formDetails.disable();
  }
  /**
   * View / Edit Mode Flag Service
   * True = View False = Edit Mode
   */
  getViewableMode() {
    if (this.comprehensiveFormData.comprehensiveDetails.comprehensiveViewMode) {
      return this.comprehensiveFormData.comprehensiveDetails
        .comprehensiveViewMode;
    }
    return false;
  }
  setViewableMode(commitFlag: boolean) {
    if (this.comprehensiveFormData.comprehensiveDetails && 
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry !== null &&
      (this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry
        .reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.SUBMITTED || this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry
          .reportStatus === COMPREHENSIVE_CONST.REPORT_STATUS.READY) && this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry
        .isLocked) {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveViewMode = true;
    } else {
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveViewMode = false;
    }
    if (commitFlag) {
      this.commit();
    }
    return true;
  }
  /**
   * Result Validation before report generation
   */
  checkResultData() {
    const getCompData = this.getComprehensiveSummary();
    let validateFlag = true;
    if (
      !getCompData ||
      !getCompData.comprehensiveEnquiry.reportStatus ||
      getCompData.comprehensiveEnquiry.reportStatus === null ||
      getCompData.comprehensiveEnquiry.reportStatus === '' ||
      getCompData.comprehensiveEnquiry.reportStatus !==
      COMPREHENSIVE_CONST.REPORT_STATUS.NEW
    ) {
      validateFlag = false;
    }
    const getResultConfig = COMPREHENSIVE_CONST.YOUR_RESULTS;
    let totalAmount = 0;
    Object.keys(getResultConfig).forEach(financeInput => {
      const apiInput = getResultConfig[financeInput].API_KEY;
      const validationDataSet = getResultConfig[financeInput].VALIDATION_INPUT;
      validationDataSet.forEach(dataSet => {
        if (getCompData[apiInput][dataSet]) {
          const getAmount = this.getValidAmount(getCompData[apiInput][dataSet]);
          totalAmount += getAmount;
        }
      });
    });
    if (totalAmount <= 0) {
      validateFlag = false;
    }
    return validateFlag;
  }
  /**
   * Step Validation before api call
   */
  checkStepValidation(currentStep: number) {
    const progressData = [];
    const comprehensiveVersion = this.getComprehensiveVersion();
    progressData.push(this.getDependantsProgressData());
    progressData.push(this.getFinancesProgressData());
    if (comprehensiveVersion) {
      progressData.push(this.getFireproofingProgressData());
    }
    progressData.push(this.getRetirementProgressData());
    if (!comprehensiveVersion) {
      progressData.push(this.getRiskProfileProgressData());
    }
    let goToStep = 0;
    let stepStatus = true;
    const stepIndicator = this.getMySteps();
    if (stepIndicator > currentStep) {
      stepStatus = false;
      goToStep = stepIndicator + 1;
    } else {
      for (let t = 0; t < currentStep; t++) {
        if (goToStep === 0) {
          if (!this.getSubItemStatus(progressData[t])) {
            stepStatus = false;
            goToStep = t;
          }
        }
      }
    }
    return { status: stepStatus, stepIndicate: goToStep };
  }
  getSubItemStatus(progressData: any) {
    let completedStatus = true;
    // tslint:disable-next-line:no-commented-code
    /*if (!progressData.completed) {
            completedStatus = false;
        }*/
    Object.keys(progressData.subItems).forEach(completedData => {
      if (
        !progressData.subItems[completedData].completed &&
        !progressData.subItems[completedData].hidden
      ) {
        completedStatus = false;
      }
    });
    return completedStatus;
  }
  setMySteps(currentStep: number) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.stepCompleted = currentStep;
    this.commit();
  }
  getMySteps() {
    if (
      this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry
        .stepCompleted
    ) {
      return this.comprehensiveFormData.comprehensiveDetails
        .comprehensiveEnquiry.stepCompleted;
    } else {
      return 0;
    }
  }
  setReportStatus(reportStatus: string) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.reportStatus = reportStatus;
    this.commit();
  }
  getReportStatus() {
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry
      .reportStatus;
  }
  setLocked(lock: boolean) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.isLocked = lock;
    this.commit();
  }
  getLocked() {
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry
      .isLocked;
  }
  setReportId(reportId: number) {
    this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry.reportId = reportId;
    this.commit();
  }
  getReportId() {
    return this.comprehensiveFormData.comprehensiveDetails.comprehensiveEnquiry
      .reportId;
  }
  /**
   * Compute Take Home Earnings
   */
  getTotalEarningsBucket(earningDetails: any) {
    const summaryConfig = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.YOUR_FINANCES;
    const baseProfile = this.getMyProfile();
    let homeSalary = 0;
    let annualSalary = 0;
    let homeCpfSalary = 0;
    if (earningDetails && earningDetails !== null) {
      if (baseProfile && baseProfile.nationalityStatus === 'Others') {
        homeSalary += this.getValidAmount(earningDetails.monthlySalary);
        homeSalary += this.getValidAmount(
          earningDetails.otherMonthlyWorkIncome
        );
        annualSalary += this.getValidAmount(earningDetails.annualBonus);
      } else {
        const cpfDetails = {
          amountLimitCpf: summaryConfig.ANNUAL_PAY_CPF_BREAKDOWN,
          cpfPercent: summaryConfig.HOME_PAY_CPF_SELF_EMPLOYED_PERCENT
        };
        if (earningDetails.employmentType === 'Employed') {
          cpfDetails.amountLimitCpf = summaryConfig.ANNUAL_PAY_CPF_BREAKDOWN;
          cpfDetails.cpfPercent = summaryConfig.HOME_PAY_CPF_EMPLOYED_PERCENT;
        }
        homeCpfSalary += this.getValidAmount(earningDetails.monthlySalary);
        homeCpfSalary += this.getValidAmount(
          earningDetails.otherMonthlyWorkIncome
        );
        homeCpfSalary *= 12;
        homeCpfSalary += this.getValidAmount(earningDetails.annualBonus);
        if (homeCpfSalary > cpfDetails.amountLimitCpf) {
          annualSalary +=
            cpfDetails.amountLimitCpf * cpfDetails.cpfPercent +
            (homeCpfSalary - cpfDetails.amountLimitCpf);
        } else {
          annualSalary += homeCpfSalary * cpfDetails.cpfPercent;
        }
      }
      homeSalary += this.getValidAmount(earningDetails.monthlyRentalIncome);
      homeSalary += this.getValidAmount(earningDetails.otherMonthlyIncome);

      homeSalary *= 12;
      annualSalary += this.getValidAmount(earningDetails.annualDividends);
      annualSalary += this.getValidAmount(earningDetails.otherAnnualIncome);
      homeSalary += annualSalary;
    }
    return Math.floor(homeSalary);
  }
  /**
   * Compute Annual Bonus for step2 summary
   */
  getAnnualBonus(earningDetails: any, summaryConfig: any) {
    const baseProfile = this.getMyProfile();
    let homeSalary = 0;
    let annualSalary = 0;
    let homeCpfSalary = 0;
    if (earningDetails && earningDetails !== null) {
      const annualBonus = this.getValidAmount(earningDetails.annualBonus);
      if (baseProfile && baseProfile.nationalityStatus === 'Others') {
        annualSalary += annualBonus;
      } else {
        const cpfDetails = {
          amountLimitCpf: summaryConfig.ANNUAL_PAY_CPF_BREAKDOWN,
          cpfPercent: summaryConfig.HOME_PAY_CPF_SELF_EMPLOYED_PERCENT,
          salaryCeilCpf: summaryConfig.HOME_PAY_CPF_SELF_EMPLOYED_BREAKDOWN
        };
        if (earningDetails.employmentType === 'Employed') {
          cpfDetails.amountLimitCpf = summaryConfig.ANNUAL_PAY_CPF_BREAKDOWN;
          cpfDetails.cpfPercent = summaryConfig.HOME_PAY_CPF_EMPLOYED_PERCENT;
          cpfDetails.salaryCeilCpf =
            summaryConfig.HOME_PAY_CPF_EMPLOYED_BREAKDOWN;
        }
        homeCpfSalary += this.getValidAmount(earningDetails.monthlySalary);
        homeCpfSalary += this.getValidAmount(
          earningDetails.otherMonthlyWorkIncome
        );
        if (homeCpfSalary > cpfDetails.salaryCeilCpf) {
          homeSalary += cpfDetails.salaryCeilCpf;
        } else {
          homeSalary += homeCpfSalary;
        }
        //console.log("A" + homeSalary);
        const cutOffSalary = cpfDetails.amountLimitCpf - homeSalary * 12;
        //console.log("B" + cutOffSalary); console.log("AB" + annualBonus);
        let eligibleAnnualBonus = 0;
        let notEligibleAnnualBonus = 0;
        if (cutOffSalary > annualBonus) {
          eligibleAnnualBonus = annualBonus;
          notEligibleAnnualBonus = 0;
        } else {
          eligibleAnnualBonus = cutOffSalary;
          notEligibleAnnualBonus = annualBonus - eligibleAnnualBonus;
        }
        //console.log("C" + eligibleAnnualBonus); console.log("D" + notEligibleAnnualBonus);
        annualSalary =
          eligibleAnnualBonus * cpfDetails.cpfPercent + notEligibleAnnualBonus;
      }
    }
    //console.log("E" + annualSalary);
    return Math.floor(annualSalary);
  }
  /**
   * Annual Income Updated Formula
   * 
   */
  getTotalAnnualIncomeByEarnings(earningDetails: any) {
    const summaryConfig = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.YOUR_FINANCES;
    let takeHomeCal = 0;
    const homePayTotal = this.getTakeHomeSalary(
      earningDetails,
      summaryConfig,
      true,
      true
    );
    const annualBonusCheck =
      earningDetails && earningDetails.annualBonus
        ? this.getValidAmount(earningDetails.annualBonus)
        : 0;
    const annualBonus =
      annualBonusCheck > 0
        ? this.getAnnualBonus(earningDetails, summaryConfig)
        : 0;
    const annualDividend =
      earningDetails && earningDetails.annualDividends
        ? this.getValidAmount(earningDetails.annualDividends)
        : 0;
    takeHomeCal = homePayTotal + annualBonus + annualDividend;
    return Math.floor(takeHomeCal);
  }
}

