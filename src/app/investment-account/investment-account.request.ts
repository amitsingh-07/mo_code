export interface ISaveInvestmentAccountRequest {
    myInfoVerified: boolean;
    isSingaporePR: boolean;
    sameAsMailingAddress: boolean;
    personalInfo: IPersonalInfo;
    residentialAddress: IAddress;
    mailingAddress: IAddress;
    employmentDetails: IEmployment;
    householdDetails: IHousehold;
    financialDetails: IFinancial;
    taxDetails: ITax[];
    personalDeclarations: IPersonalDeclaration;
}

export interface IPersonalInfo {
    nationalityCode: string;
    fullName: string;
    firstName: string;
    lastName: string;
    nricNumber: string;
    passportNumber: string;
    passportExpiryDate: string;
    passportIssuedCountryId: number;
    dateOfBirth: string;
    gender: string;
    salutation: any;
    birthCountryId: any;
    race: any;
}

export interface IAddress {
    countryId: number;
    state: string;
    postalCode: string;
    addressLine1: string;
    addressLine2: string;
    floor: string;
    unitNumber: string;
    townName: string;
    city: string;
}

export interface IEmployment {
    employmentStatusId: number;
    industryId: number;
    otherIndustry: string;
    occupationId: number;
    otherOccupation: string;
    employerName: string;
    contactNumber: string;
    unemployedReason: string;
    employerAddress: IAddress;
}

export interface IHousehold {
    numberOfMembers: number;
    houseHoldIncome: number;
}

export interface IFinancial {
    incomeRange: string;
}

export interface ITax {
    taxCountryId: number;
    tinNumber: string;
    noTinReason: string;
}

export interface IPersonalDeclaration {
    investmentSourceId: number;
    beneficialOwner: boolean;
    politicallyExposed: boolean;
    connectedToInvestmentFirm: boolean;
    pepDeclaration: IPep;
}

export interface IPep {
    firstName: string;
    lastName: string;
    companyName: string;
    occupationId: number;
    otherOccupation: string;
    pepAddress: IAddress;
    expectedNumberOfTransactions: number;
    expectedAmountPerTransaction: number;
    investmentSourceId: number;
    additionalInfo: string;
    investmentDuration: number;
    earningSourceId: number;
}
