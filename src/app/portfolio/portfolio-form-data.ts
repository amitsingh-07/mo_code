import { FormArray, FormGroup } from '@angular/forms';
export class PortfolioFormData {
    // PERSONAL INFO
    dob: any;
    investmentPeriod: number;

    // RISK ASSESSMENT
    riskAssessQuest1: number;
    riskAssessQuest2: number;
    riskAssessQuest3: number;
    riskAssessQuest4: number;
    riskAssessQuest5: number;

    // MY FINANCIALS
    monthlyIncome: number;
    percentageOfSaving: number;
    totalAssets: number;
    totalLiabilities: number;
    initialInvestment: number;
    monthlyInvestment: number;
    suffEmergencyFund: string;

    // RISK PROFILE
    riskProfileId: number;
    riskProfileName: string;
    htmlDescription: string;

    selectedFund;
    // SELECTNATIONLITY
     nationality: string;
     countries: any;
     selectNationalitySig: string;
     otherCoutryQuestionOne: string;
     otherCoutryQuestionTwo: string;
}
