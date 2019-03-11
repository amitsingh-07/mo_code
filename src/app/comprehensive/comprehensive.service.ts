import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorModalComponent } from '../shared/modal/error-modal/error-modal.component';
import { SummaryModalComponent } from '../shared/modal/summary-modal/summary-modal.component';
import { ToolTipModalComponent } from '../shared/modal/tooltip-modal/tooltip-modal.component';
import { appConstants } from './../app.constants';
import {
    IProgressTrackerData,
    IProgressTrackerItem,
    IProgressTrackerSubItemList
} from './../shared/modal/progress-tracker/progress-tracker.types';
import { ComprehensiveFormData } from './comprehensive-form-data';
import { ComprehensiveFormError } from './comprehensive-form-error';
import { COMPREHENSIVE_ROUTE_PATHS } from './comprehensive-routes.constants';
import {
    HospitalPlan,
    IChildEndowment,
    IEducationPlan,
    IEPreference,
    IMyAssets,
    IMyDependant,
    IMyEarnings,
    IMyLiabilities,
    IMyProfile,
    IMySpendings,
    IProgressTrackerWrapper,
    IRegularSavePlan
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

    constructor(private http: HttpClient, private modal: NgbModal) {
        this.getComprehensiveFormData();
    }

    commit() {
        if (window.sessionStorage) {
            const cmpSessionData = this.getComprehensiveSessionData();
            cmpSessionData[ComprehensiveService.SESSION_KEY_FORM_DATA] = this.comprehensiveFormData;
            sessionStorage.setItem(appConstants.SESSION_KEY.COMPREHENSIVE, JSON.stringify(cmpSessionData));
        }
    }

    getComprehensiveSessionData() {
        if (window.sessionStorage && sessionStorage.getItem(appConstants.SESSION_KEY.COMPREHENSIVE)) {
            return JSON.parse(sessionStorage.getItem(appConstants.SESSION_KEY.COMPREHENSIVE));
        }
        return {};
    }

    getHospitalPlan(): HospitalPlan {
        if (!this.comprehensiveFormData.hospitalPlanData) {
            this.comprehensiveFormData.hospitalPlanData = {} as HospitalPlan;
        }
        return this.comprehensiveFormData.hospitalPlanData;
    }
    clearFormData() {
        this.comprehensiveFormData = {} as ComprehensiveFormData;
        this.commit();
    }

    // Return the entire Comprehensive Form Data
    getComprehensiveFormData(): ComprehensiveFormData {
        if (window.sessionStorage && sessionStorage.getItem(appConstants.SESSION_KEY.COMPREHENSIVE)) {
            const cmpSessionData = this.getComprehensiveSessionData();
            if (cmpSessionData[ComprehensiveService.SESSION_KEY_FORM_DATA]) {
                this.comprehensiveFormData = cmpSessionData[ComprehensiveService.SESSION_KEY_FORM_DATA];
            } else {
                this.comprehensiveFormData = {} as ComprehensiveFormData;
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
        if (!this.comprehensiveFormData.myProfile) {
            this.comprehensiveFormData.myProfile = {} as IMyProfile;
        }
        return this.comprehensiveFormData.myProfile;
    }
    getMyDependant() {
        /* #if (!this.comprehensiveFormData.myDependant) {
            this.comprehensiveFormData.myDependant = [] as IMyDependant[];
        } */
        return this.comprehensiveFormData.myDependant;
    }

    getChildEndowment() {
        if (!this.comprehensiveFormData.educationPlan) {
            this.comprehensiveFormData.educationPlan = {} as IEducationPlan;
        }
        return this.comprehensiveFormData.educationPlan;
    }
    /* Product Category drop down Handler */
    setMyProfile(profile: IMyProfile) {
        this.comprehensiveFormData.myProfile = profile;
        this.commit();
    }
    setMyDependant(dependant: IMyDependant[]) {
        this.comprehensiveFormData.myDependant = dependant;
        this.commit();
    }

    setEducationPreference(educationPreference: IEPreference[]) {
        this.comprehensiveFormData.educationPreference = educationPreference;
        this.commit();
    }

    getEducationPreference(): IEPreference[] {
        /* #if (!this.comprehensiveFormData.educationPreference) {
            this.comprehensiveFormData.educationPreference = [] as IEPreference[];
        } */
        return this.comprehensiveFormData.educationPreference;
    }

    setChildEndowment(hasEducationPlan: IEducationPlan) {
        this.comprehensiveFormData.educationPlan = hasEducationPlan;
        this.commit();
    }
    getMyLiabilities() {
        if (!this.comprehensiveFormData.myLiabilities) {
            this.comprehensiveFormData.myLiabilities = {} as IMyLiabilities;
        }
        return this.comprehensiveFormData.myLiabilities;
    }

    setMyLiabilities(myLiabilitiesData: IMyLiabilities) {
        this.comprehensiveFormData.myLiabilities = myLiabilitiesData;
        this.commit();
    }

    getMyEarnings() {
        if (!this.comprehensiveFormData.myEarnings) {
            this.comprehensiveFormData.myEarnings = {} as IMyEarnings;
        }
        return this.comprehensiveFormData.myEarnings;
    }

    setMyEarnings(myEarningsData: IMyEarnings) {
        this.comprehensiveFormData.myEarnings = myEarningsData;
        this.commit();
    }

    getMySpendings() {
        if (!this.comprehensiveFormData.mySpendings) {
            this.comprehensiveFormData.mySpendings = {} as IMySpendings;
        }
        return this.comprehensiveFormData.mySpendings;
    }

    setMySpendings(mySpendingsData: IMySpendings) {
        this.comprehensiveFormData.mySpendings = mySpendingsData;
        this.commit();
    }

    getStartingPage() {
        return this.comprehensiveFormData.startingPage;
    }

    setStartingPage(pageRoute: string) {
        this.comprehensiveFormData.startingPage = pageRoute;
        this.commit();
    }

    hasDependant() {
        return this.comprehensiveFormData.hasDependant;
    }

    setDependantSelection(selection: string) {
        this.comprehensiveFormData.hasDependant = selection;
        this.commit();
    }
    clearEndowmentPlan() {
        this.comprehensiveFormData.educationPlan = {} as IEducationPlan;
        this.commit();
    }
    getMyAssets() {
        if (!this.comprehensiveFormData.myAssets) {
            this.comprehensiveFormData.myAssets = {} as IMyAssets;
        }
        return this.comprehensiveFormData.myAssets;
    }
    setMyAssets(myAssets: IMyAssets) {
        this.comprehensiveFormData.myAssets = myAssets;
        this.commit();
    }
    getRSP() {
        if (!this.comprehensiveFormData.regularSavingsPlan) {
            this.comprehensiveFormData.regularSavingsPlan = {} as IRegularSavePlan;
        }
        return this.comprehensiveFormData.regularSavingsPlan;
    }
    setRSP(regularSavingsPlan: IRegularSavePlan) {
        this.comprehensiveFormData.regularSavingsPlan = regularSavingsPlan;
        this.commit();
    }
    getFormError(form, formName) {
        const controls = form.controls;
        const errors: any = {};
        errors.errorMessages = [];
        errors.errorMessages = [];
        errors.title = this.comprehensiveFormError[formName].formFieldErrors.errorTitle;

        for (const name in controls) {
            if (controls[name].invalid) {
                errors.errorMessages.push(
                    this.comprehensiveFormError[formName].formFieldErrors[name][
                        Object.keys(controls[name]['errors'])[0]
                    ].errorMessage
                );
            }
        }
        return errors;
    }

    getMultipleFormError(form, formName, formTitle) {
        const forms = form.controls;
        const errors: any = {};
        errors.errorMessages = [];
        errors.title = this.comprehensiveFormError[formName].formFieldErrors.errorTitle;

        let index = 0;

        // tslint:disable-next-line:forin
        for (const field in forms) {
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
        return errors;
    }

    openErrorModal(title: string, message: any, isMultipleForm: boolean, formName?: string) {
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
                message[index]['formName'] = element.formName.name;
            });
            ref.componentInstance.multipleFormErrors = message;
        }
        return false;
    }

    openSummaryModal(
        financeModal,
        retireModal,
        insurancePlanningDependantModal,
        insurancePlanningNonDependantModal,
        childrenEducationDependantModal,
        childrenEducationNonDependantModal,
        summaryModalDetails
    ) {
        const ref = this.modal.open(SummaryModalComponent, {
            centered: true,
            windowClass: 'custom-full-height'
        });

        let setTempleteModel = 1;
        if (setTempleteModel == 2) {
            // Finance Popup

            summaryModalDetails = {
                setTemplateModal: 2,
                titleImage: 'owl.svg',
                contentObj: financeModal,
                liabilitiesEmergency: false,
                liabilitiesLiquidCash: 30000,
                liabilitiesMonthlySpareCash: 200
            };
            summaryModalDetails = {
                setTemplateModal: 2,
                titleImage: 'owl.svg',
                contentObj: financeModal,
                liabilitiesEmergency: false,
                liabilitiesLiquidCash: 30000,
                liabilitiesMonthlySpareCash: 200
            };
            ref.componentInstance.summaryModalDetails = summaryModalDetails;
        } else if (setTempleteModel == 4) {
        } else if (setTempleteModel === 4) {
            // Retirement Popup

            summaryModalDetails = {
                setTemplateModal: 4,
                titleImage: 'owl.svg',
                contentObj: retireModal
            };
            ref.componentInstance.summaryModalDetails = summaryModalDetails;
        } else if (setTempleteModel == 3) {
        } else if (setTempleteModel === 3) {
            // InsurancePlanning Popup
            const dependantVar = false;

            summaryModalDetails = {
                setTemplateModal: 3,
                titleImage: 'owl.svg',
                contentImage: 'owl.svg',
                contentObj: dependantVar ? insurancePlanningDependantModal : insurancePlanningNonDependantModal,
                dependantModelSel: dependantVar,
                estimatedCost: 100000,
                termInsurance: 90,
                wholeLife: 10
            };
            ref.componentInstance.summaryModalDetails = summaryModalDetails;
        } else if (setTempleteModel == 1) {
            // CHILDREN_EDUCATION Popup
            const dependantVar = false;

            summaryModalDetails = {
                setTemplateModal: 1,
                titleImage: 'education-without-dependant.svg',
                dependantModelSel: dependantVar,
                contentObj: dependantVar ? childrenEducationDependantModal : childrenEducationNonDependantModal,
                dependantDetails: [
                    {
                        userName: 'Nathan Ng',
                        userAge: 19,
                        userEstimatedCost: 300000
                    },
                    {
                        userName: 'Marie Ng',
                        userAge: 20,
                        userEstimatedCost: 300000
                    }
                ],
                nonDependantDetails: {
                    livingCost: 2000,
                    livingPercent: 3,
                    livingEstimatedCost: 2788,
                    medicalBill: 5000,
                    medicalYear: 20,
                    medicalCost: 300000
                }
            };

            ref.componentInstance.summaryModalDetails = summaryModalDetails;
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
    openSummaryPopUpModal(summaryModalDetails) {
        const ref = this.modal.open(SummaryModalComponent, {
            centered: true,
            windowClass: 'full-height-comprehensive'
        });
        ref.componentInstance.summaryModalDetails = summaryModalDetails;
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

    generateProgressTrackerData(): IProgressTrackerData {
        this.progressData = {} as IProgressTrackerData;
        this.progressData = {
            title: 'Progress Tracker Title',
            subTitle: 'Time Taken: 20 mins',
            properties: {
                disabled: false
            },
            items: []
        };

        this.progressData.items.push(this.getGetStartedProgressData());
        this.progressData.items.push(this.getDependantsProgressData());
        this.progressData.items.push(this.getFinancesProgressData());

        return this.progressData;
    }

    getGetStartedProgressData(): IProgressTrackerItem {
        const myProfile: IMyProfile = this.getMyProfile();
        return {
            title: 'Get Started',
            expanded: true,
            completed: true,
            customStyle: 'get-started',
            subItems: [
                {
                    path: COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED,
                    title: 'Tell us about you',
                    value: myProfile.firstName,
                    completed: typeof myProfile.firstName !== 'undefined'
                }
            ]
        };
    }

    getDependantsProgressData(): IProgressTrackerItem {
        const dependantDetails: IMyDependant[] = this.getMyDependant();
        const eduPrefs: IEPreference[] = this.getEducationPreference();
        const eduPlan: IEducationPlan = this.getChildEndowment();

        let noOfDependants = '';
        if (dependantDetails) {
            noOfDependants = dependantDetails.length + '';
        }
        const prefsList: IProgressTrackerSubItemList[] = [];
        if (eduPrefs) {
            eduPrefs.forEach((item) => {
                prefsList.push({
                    title: item.id + '',
                    value: item.location + ', ' + item.educationCourse
                });
            });
        }

        let hasEndowmentPlans = '';
        if (eduPlan) {
            hasEndowmentPlans = eduPlan.hasEndowments ? 'Yes' : 'No';
        }

        let hasEduPlans = '';
        if (eduPrefs) {
            hasEduPlans = eduPrefs.length > 0 ? 'Yes' : 'No';
        }

        return {
            title: "What's on your shoulders",
            expanded: true,
            completed: true,
            customStyle: 'dependant',
            subItems: [
                {
                    path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_DETAILS,
                    title: 'Number of Dependant',
                    value: noOfDependants,
                    completed: typeof dependantDetails !== 'undefined'
                },
                {
                    path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_SELECTION,
                    title: 'Plan for children education',
                    value: hasEduPlans,
                    completed: typeof eduPrefs !== 'undefined'
                },
                {
                    path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION,
                    title: 'Education Preferences',
                    value: '',
                    completed: typeof eduPrefs !== 'undefined',
                    list: prefsList
                },
                {
                    path: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_SELECTION,
                    title: 'Do you have education endowment plan',
                    value: hasEndowmentPlans,
                    completed: typeof eduPlan !== 'undefined' && typeof eduPlan.hasEndowments !== 'undefined'
                }
            ]
        };
    }

    getFinancesProgressData(): IProgressTrackerItem {
        return {
            title: 'Your Finances',
            expanded: true,
            completed: false,
            customStyle: 'get-started',
            subItems: [
                {
                    path: 'GetStartedComponent',
                    title: 'Your Earnings',
                    value: '$38,000',
                    completed: true
                },
                {
                    path: 'GetStartedComponent1',
                    title: 'Your Spendings',
                    value: '',
                    completed: false
                },
                {
                    path: 'GetStartedComponent1',
                    title: 'Bad Mood Fund',
                    value: '',
                    completed: false
                },
                {
                    path: 'GetStartedComponent1',
                    title: 'Hospital Choice',
                    value: '',
                    completed: false
                }
            ]
        };
    }
}
