export class ManageInvestmentsFormData {
  // PERSONAL INFO
  investmentype: string;
  oneTimeInvestmentAmount: number;
  MonthlyInvestmentAmount: number;
  portfolio: string;
  Investment: string;
  topupportfolioamount: number;
  topupValues: any;
  fundDetails: any;
  minimumBalanceOfTopup: number;
  topupMode: string;

  // withdraw
  withdrawType: any;
  withdrawAmount: number;
  withdrawPortfolio: any;
  withdrawMode: string;
  withdrawBank: any;
  isRedeemAll: boolean;

  userPortfolios: any;
  cashAccountBalance: number;

  // your portfolio
  holdingList;
  assetAllocationValues;

  toastMessage: IToastMessage;

  selectedCustomerPortfolioId: any;
  selectedCustomerPortfolio: any;
  srsAccountDetails: ISrsAccountDetails;
  cpfiaAccountDetails: ICPFIAccountDetails;
  isSrsAccountUpdated: boolean; //issrsaccountupdated

  investmentNote: any;

  //TRANSFER SCREEN
  transferFrom: any;
  transferTo: any;
  transferAmount: number;
  TransferAll: boolean;

  //JA User
  isJointAccountUser: boolean;
}

export interface IToastMessage {
  /* TOAST MESSAGE */
  isShown: boolean;
  desc: string;
  link_label?: string;
  link_url?: any;
  id?: number;
}
export interface ISrsAccountDetails {
  srsAccountNumber: string;
  srsOperator: any;
}

export interface ICPFIAccountDetails {
  cpfiaAccountNumber: any;
  cpfiaOperator: string;
}
