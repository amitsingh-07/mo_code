export interface ISignUp {
    customer: ICustomer;
    sessionId: any;
    captcha: string;
    journeyType: string;
    enquiryId: number;
    referralCode: string;
    userType: string;
    accountCreationType:string;
    organisationCode?: string;
}

export interface IEnquiryUpdate {
    customerId: string;
    enquiryId: number;
    newCustomer?: boolean;
    selectedProducts: IPlan[];
    enquiryProtectionTypeData: IProtectionType[];
    journeyType: string;
}

export interface IPlan {
    typeId: number;
    productName: string;
    premium: IPremium;
}

export interface IPremium {
    premiumAmount: string;
    premiumFrequency: string;
}

export interface ICustomer {
    countryCode: string;
    mobileNumber: string;
    firstName?: string;
    lastName?: string;
    emailAddress: string;
    password: string;
    acceptMarketingNotifications: boolean;
    uin?:string;
    fullName?:string;
    dob: string;
    gender: string;
  
}

export interface IVerifyRequestOTP {
    customerRef: string;
    otp?: number;
    editProfile?: boolean;
}
export interface IEmailRequestOTP {
    emailAddress: string;
    actionType: string;
}

export interface IVerifyCode {
    code: string;
}

export interface IResendEmail {
    mobileNumber: string;
    emailAddress: string;
    callbackUrl: string;
    hostedServerName: string;    
    organisationCode?: string;
}

export interface IUpdateMobileNumber {
    customerRef: string;
    mobileNumber: string;
    countryCode: string;
}

export interface IProtectionType {
    protectionTypeId: number;
    protectionType: string;
}

export interface CustomerJointAccountInfo {
    bankId: number;
    bankName: string;
    accountHolderName: string;
    bankAccountNumber: string;
    customerPortfolioId: number;
    accountType: string;
    customerPortfolioName: string;
}
