export class InvestmentAccountFormData {
  // Personal Information
  fullName: string;
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
  showForeignerAlert: boolean;

  // Residential Address
  country: any;
  countryCode: string;
  postalCode: number;
  address1: string;
  address2: string;
  floor: string;
  unitNo: string;
  city: string;
  state: string;
  zipCode: number;
  isMailingAddressSame = true;
  reasonForOthers: string;
  reason: string;
  reasonId: string;
  mailCountry: any;
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
  taxObj: any;

  // EmployementDetails

  employmentStatus: string;
  employStatus: string;
  companyName: string;
  occupation: string;
  otherOccupation: string;
  industry: string;
  otherIndustry: string;
  contactNumber: string;
  empCountry: string;
  empPostalCode: number;
  empAddress1: string;
  empAddress2: string;
  empFloor: string;
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
  birthCertificateImage: File;

  // Personal Declaration
  sourceOfIncome: any;
  ExistingEmploye: any;
  pep: any;
  oldPep: boolean;
  beneficial: any;

  // financial details
  annualHouseHoldIncomeRange: any;
  numberOfHouseHoldMembers: any;

  source: string;
  expectedNumberOfTransation: number;
  expectedAmountPerTranction: number;
  personalSavings: string;
  otherSources: string;
  inheritanceGift: string;
  investmentEarnings: string;
  earningsGenerated: string;
  durationInvestment: number;

  // Source of Wealth fields
  sourceOfWealth: string;
  srcOfWealthPersonalSavings: string;
  srcOfWealthOtherSources: string;
  srcOfWealthInheritanceGift: string;
  srcOfWealthEarningsGenerated: string;
  srcOfWealthDurationInvestment: number;

  // Additional declaration PEP
  pepFullName: string;
  cName: string;
  pepoccupation: string;
  pepOtherOccupation: string;
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
  customerPortfolioId: any;

  // Account Creation Status
  accountCreationStatus: string;

  // Initial Message for Dashboard
  dashboardInitMessageShow: boolean;
  dashboardInitMessageTitle: string;
  dashboardInitMessageDesc: string;
  // fund account details
  fundingMethod: string;

  // portfolio naming
  defaultPortfolioName: string;
  recommendedCustomerPortfolioId: number;
  recommendedRiskProfileId: number;

  // Reasses Risk Profile
  isReassessActive: boolean;
}
