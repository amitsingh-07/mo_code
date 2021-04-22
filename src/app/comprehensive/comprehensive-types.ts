import { IProgressTrackerItem } from '../shared/modal/progress-tracker/progress-tracker.types';


export interface IComprehensiveDetails {
    baseProfile: IMyProfile;
    dependentsSummaryList: IdependentsSummaryList;
    comprehensiveEnquiry: IComprehensiveEnquiry;
    dependentEducationPreferencesList: IChildEndowment[];
    comprehensiveDownOnLuck: HospitalPlan;
    comprehensiveRegularSavingsList: IRegularSavings[];
    comprehensiveLiabilities: IMyLiabilities;
    comprehensiveIncome: IMyEarnings;
    comprehensiveSpending: IMySpendings;
    comprehensiveAssets: IMyAssets;
    comprehensiveInsurancePlanning: IInsurancePlan;
    comprehensiveRetirementPlanning: IRetirementPlan;
    comprehensiveViewMode?: boolean;
    comprehensiveJourneyMode: boolean;
    riskAssessmentAnswer?: IRiskAssesmentAnswers;
    riskQuestionList?: any;
}
export interface IComprehensiveEnquiry {
    customerId: number;
    enquiryId: number;
    hasDependents: boolean;
    hasEndowments: string;
    hasRegularSavingsPlans: boolean;
    type: string;
    isValidatedPromoCode: boolean;
    promoCodeValidated?: boolean;
    reportStatus: string;
    stepCompleted: number;
    subStepCompleted: number;
    reportId: number;
    homeLoanUpdatedByLiabilities?: boolean;
    isLocked: boolean;
    reportSubmittedTimeStamp: string;
    isDobUpdated: boolean;
    dobPopUpEnable: boolean;
    paymentStatus:string;
}
export interface IPromoCode {
    comprehensivePromoCodeToken: string;
    enquiryId: number;
}
export interface IMyProfile {
    id: string;
    firstName: string;
    dateOfBirth: any;
    nationalityStatus: string;
    gender: string;
    ngbDob: any;
    dobUpdateable: boolean;
    enquiryId: number;
}

export interface IDependantDetail {
    id: number;
    name: string;
    relationship: string;
    gender: string;
    dateOfBirth: string;
    nation: string;
    isInsuranceNeeded: boolean;
}
export interface IdependentsSummaryList {
    dependentsList: IDependantDetail[];
    houseHoldIncome: string;
    noOfHouseholdMembers: number;
    noOfYears: number;
    enquiryId: number;
}
export interface IChildEndowment {
    id: number;
    dependentId: number;
    name: string;
    enquiryId: number;
    location: string;
    educationCourse: string;
    educationSpendingShare: number;
    endowmentMaturityAmount: number;
    endowmentMaturityYears: number;
    dateOfBirth: string;
    age: number;
    gender: string;
    preferenceSelection: boolean;
    nation?: string;
}

export interface IMyLiabilities {
    enquiryId: number;
    homeLoanOutstandingAmount: number;
    otherPropertyLoanOutstandingAmount: number;
    otherLoanOutstandingAmount: number;
    carLoansAmount: number;
    totalAnnualLiabilities: number;
}
export class HospitalPlan {
    hospitalClass: string;
    hospitalPlanName: string;
    hospitalClassDescription: string;
    hospitalClassId: number;
    hospitalPlanId: number;
    isFullRider = false;
    badMoodMonthlyAmount: number;
    enquiryId: number;
}
export interface IHospitalPlanList {
    id: number;
    hospitalClass: string;
    hospitalClassDescription: string;
    hospitalClassId: number;
    hospitalPlanId: number;
}
export interface IMySummaryModal {
    setTemplateModal: number;
    title?: any;
    dependantModelSel?: boolean;
    contentObj: any;
    contentImage?: string;
    dependantDetails?: ISummaryDependantDetails[];
    nonDependantDetails?: {
        livingCost: number;
        livingPercent: number;
        livingEstimatedCost: number;
        medicalBill: number;
        medicalYear: number;
        medicalCost: number;
    };
    estimatedCost?: number;
    termInsurance?: number;
    wholeLife?: number;
    liabilitiesEmergency?: boolean;
    liabilitiesLiquidCash?: number;
    liabilitiesMonthlySpareCash?: number;
    nextPageURL: any;
    routerEnabled?: boolean;
}

export interface ISummaryDependantDetails {
    userName: string;
    userAge: number;
    userEstimatedCost: number;
}

export interface IMyEarnings {
    enquiryId: number;
    employmentType: string;
    monthlySalary: number;
    monthlyRentalIncome: number;
    otherMonthlyWorkIncome: number;
    otherMonthlyIncome: number;
    annualBonus: number;
    annualDividends: number;
    otherAnnualIncome: number;
    totalAnnualIncomeBucket: number;
}

export interface IMySpendings {
    enquiryId: number;
    monthlyLivingExpenses: number;
    adHocExpenses: number;
    HLMortgagePaymentUsingCPF: number;
    HLMortgagePaymentUsingCash: number;
    HLtypeOfHome: string;
    homeLoanPayOffUntil: number;
    mortgagePaymentUsingCPF: number;
    mortgagePaymentUsingCash: number;
    mortgageTypeOfHome: string;
    mortgagePayOffUntil: number;
    carLoanPayment: number;
    carLoanPayoffUntil: number;
    otherLoanPayment: number;
    otherLoanPayoffUntil: number;
    totalAnnualExpenses: number;

}

export interface IProgressTrackerWrapper {
    getStarted: IProgressTrackerItem;
    dependants: IProgressTrackerItem;
    finances: IProgressTrackerItem;
    insurancePlans: IProgressTrackerItem;
    retirementPlan: IProgressTrackerItem;
}
export interface IMyAssets {
    enquiryId: number;
    cashInBank: number;
    savingsBonds: number;
    cpfOrdinaryAccount: number;
    cpfSpecialAccount: number;
    cpfMediSaveAccount: number;
    cpfRetirementAccount: number;
    homeMarketValue: number;
    investmentPropertiesValue: number;
    assetsInvestmentSet: IOtherProperties[];
    otherAssetsValue: number;
    totalAnnualAssets: number;
    source: string;
    schemeType?: string;
    estimatedPayout?: number;
    retirementSum?: number;
    topupAmount?: number;
    withdrawalAmount?: number;
}
export interface IOtherProperties {
    enquiryId: number;
    typeOfInvestment: string;
    investmentAmount: number;
    fundType: string
}
export interface IRegularSavings {
    portfolioType: string;
    amount: number;
    fundType: string;
    enquiryId: number;
}
export interface IInsurancePlan {
    enquiryId: number;
    haveHospitalPlan: boolean;
    haveHospitalPlanWithRider: number;
    haveCPFDependentsProtectionScheme: number;
    haveHDBHomeProtectionScheme: number;
    homeProtectionCoverageAmount: number;
    lifeProtectionAmount: number;
    otherLifeProtectionCoverageAmount: number;
    criticalIllnessCoverageAmount: number;
    disabilityIncomeCoverageAmount: number;
    haveLongTermElderShield: number;
    longTermElderShieldAmount: number;
    otherLongTermCareInsuranceAmount: number;
    shieldType:string;
    haveLongTermPopup:boolean;
}
export interface IRetirementPlan {
    enquiryId: number;
    retirementAge: string;
    haveOtherSourceRetirementIncome: boolean;
    retirementIncomeSet: IRetirementIncome[];
    lumpSumBenefitSet: ILumpSumBenefitSet[];
}

export interface IRetirementIncome {
    monthlyPayout: number;
    payoutStartAge: number;
    payoutDuration: string;
}
export interface ILumpSumBenefitSet {
    maturityAmount: number;
    maturityYear: number;
}
export interface IRiskAssesmentAnswers {
    enquiryId: number;
    answers: IRiskAnswers[];
    riskProfileAnswers: IRiskProfile;

}
export interface IRiskProfile {
    riskAssessQuest1: any;
    riskAssessQuest2: any;
    riskAssessQuest3: any;
    riskAssessQuest4: any;
}

export interface IRiskAnswers {
    questionOptionId: number;
}