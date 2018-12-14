export class InvestmentAccountFormData {
    // Personal Information
    fullName: string;
    firstName: string;
    lastName: string;
    nricNumber: any;
    passportNumber: any;
    passportExpiry: any;
    dob: any;
    gender: string;
    optionList: any;
    salutation: any;
    birthCountry: any;
    passportIssuedCountry: any;
    race: any;

    // Residential Address
    country: string;
    countryCode: string;
    postalCode: number;
    address1: string;
    address2: string;
    floor: string;
    unitNo: string;
    city: string;
    state: string;
    zipCode: number;
    isMailingAddressSame: boolean;
    others: string;
    reason: string;
    reasonId: string;
    mailCountry: string;
    mailCountryCode: string;
    mailPostalCode: number;
    mailAddress1: string;
    mailAddress2: string;
    mailFloor: string;
    mailUnitNo: string;
    mailCity: string;
    mailState: string;
    mailZipCode: number;
    resUploadedPath: string;
    mailingUploadedPath: string;
    // SELECT NATIONLITY
    nationalityList: any;
    countryList: any;
    nationality: any;
    nationalityCode: any;
    unitedStatesResident: boolean;
    singaporeanResident: boolean;

    // Tax Info
    taxCountry: any;
    radioTin: any;
    tinNumber: any;
    noTinReason: any;

    // EmployementDetails

    employmentStatus: string;
    employStatus: string;
    companyName: string;
    occupation: string;
    industry: string;
    contactNumber: string;
    isEmployeAddresSame: boolean;
    empCountry: string;
    empPostalCode: number;
    empAddress1: string;
    empAddress2: string;
    empUnitNo: string;
    empCity: string;
    empState: string;
    empZipCode: number;
    employmentStatusList: any;

    // Upload documents
    nricFrontImage: File;
    nricBackImage: File;
    mailAdressProof: File;
    passportImage: File;
    resAddressProof: File;
    passportImageBO: File;

    // Personal Declaration
    sourceOfIncome: any;
    ExistingEmploye: any;
    pep: any;
    beneficial: any;

    // financial details
    annualHouseHoldIncomeRange: string;
    numberOfHouseHoldMembers: number;
    financialMonthlyIncome: string;
    financialPercentageOfSaving: string;
    financialTotalAssets: string;
    financialTotalLiabilities: string;

    source: string;
    expectedNumberOfTransation: number;
    expectedAmountPerTranction: number;
    personalSavings: string;
    otherSources: string;
    inheritanceGift: string;
    investmenteEarning: string;
    earningsGenerated: string;
    durationInvestment: number;

    // Additional declaration PEP
    fName: string;
    lName: string;
    cName: string;
    pepoccupation: string;
    pepCountry: string;
    pepPostalCode: number;
    pepAddress1: string;
    pepAddress2: string;
    pepFloor: string;
    pepUnitNo: string;
    pepCity: string;
    pepState: string;
    pepZipCode: string;

    // MyInfo
    isMyInfoEnabled: boolean;
    disableAttributes: any;

    // confirm portfolio
    invOneTime: number;
    invMonthly: number;
    riskProfileId: number;
    riskProfileType: string;

    // Fund Your Account
    Investment: string;
    oneTimeInvestmentAmount: number;
    portfolio: string;
    topupportfolioamount: number;
    MonthlyInvestmentAmount: number;

    callBackInvestmentAccount: boolean;

    // Edit Bank
    bank: any;
    accountNumber: any;
    bankUpdateId: any;
    accountHolderName: any;

    // Account Creation Status
    accountCreationStatus: string;
}
