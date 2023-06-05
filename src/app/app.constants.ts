import { GUIDE_ME_ROUTES } from './guide-me/guide-me-routes.constants';

export let appConstants = {
    APP_JWT_TOKEN_KEY: 'app-jwt-token',
    APP_SESSION_ID_KEY: 'app-session-id',
    APP_2FA_KEY: 'app-2fa',
    APP_ENQUIRY_ID: 'app-enquiry-id',
    APP_CUSTOMER_ID: 'app_customer_id',
    accessTokenLocalStorage: '',
    defaultContentTypeHeader: '',
    userLocalStorage: '',
    loginPageUrl: GUIDE_ME_ROUTES.ROOT,
    homePageUrl: '',
    accessTokenServer: '',
    MY_INFO_CALLBACK_URL: 'myinfo',
    INVESTMENT_PROMO_CODE_TYPE: 'INVEST',
    COMPREHENSIVE_PROMO_CODE_TYPE: 'COMPRE',
    JOURNEY_TYPE_SIGNUP: 'SignUp',
    JOURNEY_TYPE_INVESTMENT: 'investment',
    JOURNEY_TYPE_DIRECT: 'DIRECT',
    JOURNEY_TYPE_GUIDED: 'GUIDED',
    JOURNEY_TYPE_WILL_WRITING: 'WILL_WRITING',
    HOME_ROUTE: '/home#',
    JOURNEY_TYPE_COMPREHENSIVE: 'comprehensive-plus',
    BASE_HREF: '/app/',
    SESSION_KEY: {
        COMPREHENSIVE: 'app-comprehensive-session',
        CFP_USER_ROLE: 'app-comprehensive-user'
    },
    USERTYPE: {
        NORMAL: "normal",
        FINLIT: "finlit",
        MANUAL: "MANUAL",
        SINGPASS: "SINGPASS",
        PUBLIC: 'PUBLIC',
        CORPORATE: 'CORPORATE',
        FACEBOOK: "FACEBOOK",
        CORPBIZ: "CORPBIZ"
    },
    ORGANISATION_ROLES: {
        ALLOWED_DOMAIN_CORP: ['@fb.com', '@facebook.com', '@yopmail.com', '@moneyowl.com'],
        ROLE_CORP_FB_USER: {
            EMAIL_UPDATE : false,
            REFERREL_PROGRAM : false,
            CREATE_JOINT_ACCOUNT : false
        }
    },
    RESTRICTED_DOMAIN_PUBLIC: ['@fb.com', '@facebook.com'], 
    CORPORATE_FAQ : '/assets/docs/faq/corporate_faq.pdf',
    INSURANCE_JOURNEY_TYPE: {
        DIRECT: 'insurance-direct',
        GUIDED: 'insurance-guided'
    },
   BROWSER_CLOSE :'BROWSER_CLOSE' ,
   LOGOUT_BUTTON :'LOGOUT_BUTTON',
   FINLIT_ACCESS_CODE: 'finlit-access-code',
   SINGAPORE_COUNTRY_CODE: '+65',
   OTP_WAITING_SECONDS: 30,
   SHOW_NEWUPDATES_MODAL_START_DATE : '2022-04-10T00:00:00.000+08:00',
   SHOW_NEWUPDATES_MODAL_END_DATE : '2022-04-10T11:59:59.000+08:00',
   MYINFO_CORPBIZ_SIGNUP: 'corpbiz',
   MYINFO_INVEST: 'invest',
   MYINFO_SIGNUP: 'signup',
   MYINFO_CFP: 'cfp',
   MYINFO_LINK_SINGPASS: 'linkSingpass',
   MYINFO_LINK_INSURANCE: 'insurance',
   MYINFO_INSURANCE_ATTRIBUTES: ['uinfin','cpfbalances'],
   CHECK_MYINFO_INSURANCE_ATTRIBUTES: 'uinfin,cpfbalances',
   RESTRICTED_HYPERLINK_URL_CONTENTS: ['mailto', 'javascript:', 'tel:', 'callto:', '.pdf'],
   COMPREHENSIVE_PAYMENT_FAQ: 'https://www.moneyowl.com.sg/faq-comprehensive/#comprehensive|2',
   WISE_INCOME_FAQ: 'https://www.moneyowl.com.sg/faq-investment/#wise-income',
   PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.moneyowl.app',
   APP_STORE_URL: 'https://apps.apple.com/us/app/moneyowl-plan-invest-insure/id6445839454',
   MOBILE_APP_SCHEME: 'moneyowl:/'
};
