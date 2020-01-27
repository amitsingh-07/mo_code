import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'  // <- ADD THIS
})
export class InvestmentCommonFormData {
    accountCreationActions: IAccountCreationActions;
    investmentsSummary: any;
    portfolioName: string;
    initialFundingMethodId: number;
    confirmedFundingMethodId: number;
    fundingType: string;
    srsOperatorBank: any;
    srsAccountNumber: string;
}

export interface IAccountCreationActions {
    accountCreationState: string;
    allowEngagementJourney: boolean;
    portfolioLimitExceeded: boolean;
    showInvestmentAccountCreationForm: boolean;
    enquiryMappedToCustomer?: boolean;
}


export interface IInvestmentCriterias {
    oneTimeInvestmentMinimum: number;
    monthlyInvestmentMinimum: number;
}