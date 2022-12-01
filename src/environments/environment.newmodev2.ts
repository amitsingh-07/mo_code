import { isDebugMode } from '../app/shared/logger/console-logger.service';
import { IEnvironment } from './environment.interface';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment: IEnvironment = {
  production: false,
  isDebugMode: true,
  apiBaseUrl: 'https://bfa-dev2.ntucbfa.cloud',
  myInfoClientId: {
    invest:'STG-201820691C-MONEYOWL-BFA',
    signup: 'STG-201820691C-MONEYOWL-BFA',
    cfp: 'STG-201820691C-MONEYOWL-BFA',
    corpbiz:'STG-201820691C-MONEYOWL-BFA',
    linkSingpass: 'STG-201820691C-MONEYOWL-BFA',
    insurance: 'STG-201820691C-MONEYOWL-INSURANCEANALYSIS'
  },
  myInfoCallbackBaseUrl: 'https://bfa-dev2.ntucbfa.cloud/app/myinfo',
  myInfoAuthorizeUrl: 'https://test.api.myinfo.gov.sg/com/v3/authorise',
  gAdPropertyId: 'AW-782920447',
  gaPropertyId: 'UA-125256446-1',
  hideHomepage: false,
  mockInvestAccount: true,
  expire2faTime: 178,
  expire2faPollRate: 2,
  expire2faMaxCheck: 5,
  promoCodeJsonUrl: 'https://mo-static-assets.s3-ap-southeast-1.amazonaws.com/promo/non-prod/promo-details.json',
  configJsonUrl: 'https://mo-static-assets.s3.ap-southeast-1.amazonaws.com/promo/KS098130_newmodev_config.json',
  hsPortalId: '6411917',
  hsUrlTrack: '9f0ad9ef-ba87-4059-9ee9-60d46880dc5f',
  singpassClientId: 'iROTlv1CU9Cz3GlYiNosMsZDGIYwWSB3',
  singpassLoginUrl:'https://stg-id.singpass.gov.sg/auth',
  singpassBaseUrl: 'https://bfa-dev2.ntucbfa.cloud'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.