import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  production: true,
  isDebugMode: false,
  apiBaseUrl: 'https://www.moneyowl.com.sg',
  myInfoClientId: {
    invest:'PROD-201820691C-MONEYOWL-CPACCT',
    signup: 'PROD-201820691C-MONEYOWL-BFA',
    cfp: 'PROD-201820691C-MONEYOWL-FPREPORT',
    corpbiz:'PROD-201820691C-MONEYOWL-CPACCT-FPREPORT',
    linkSingpass: 'PROD-201820691C-MONEYOWL-BFA',
    insurance: 'PROD-201820691C-MONEYOWL-INSURANCEANALYSIS'
  },
  myInfoCallbackBaseUrl: 'https://www.moneyowl.com.sg/app/myinfo',
  myInfoAuthorizeUrl: 'https://api.myinfo.gov.sg/com/v3/authorise',
  gAdPropertyId: 'AW-782920447',
  gtagPropertyId: 'GTM-59QTMNZ',
  gaPropertyId: 'UA-125256446-3',
  fbPropertyId: '1436376216665984',
  adRollPropertyId: 'IJWYLBK7MZGF7JMIJ2CP3K',
  adRollAdvId: 'J4Q6YE7JGFEZRKPTQGHN6D',
  hideHomepage: true,
  mockInvestAccount: false,
  expire2faTime: 298,
  expire2faPollRate: 2,
  expire2faMaxCheck: 5,
  promoCodeJsonUrl: 'https://mo-static-assets.s3-ap-southeast-1.amazonaws.com/promo/prod/promo-details.json',
  configJsonUrl: 'https://mo-static-assets.s3.ap-southeast-1.amazonaws.com/config/app-config.json',
  hsPortalId: '6324163',
  hsUrlTrack: '3e764f66-0b93-4f91-8e29-75fdf4dc9177',
  singpassClientId: 't0asVg7hrn6OsAWoFiM9oBaFQfwShtrn',
  singpassLoginUrl:'https://id.singpass.gov.sg/auth',
  singpassBaseUrl: 'https://www.moneyowl.com.sg'
};