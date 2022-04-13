export const SIGN_UP_BASE_ROUTE = '../accounts/';
export const DASHBOARD_PATH = '/accounts/dashboard';
export const EDIT_PROFILE_PATH = '/accounts/edit-profile';
export const INVESTMENT_MANAGEMENT_PATH = 'investment/manage/';

export const SIGN_UP_ROUTES = {
  ROOT: '',
  ACCOUNT_CREATED: 'success',
  ACCOUNT_UPDATED: 'account-updated',
  CREATE_ACCOUNT: 'sign-up-account',
  CREATE_ACCOUNT_MY_INFO: 'sign-up',
  EMAIL_VERIFIED: 'email-verification',
  VERIFY_MOBILE: 'verify-mobile',
  TWOFA_MOBILE: '2fa-mobile',
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgot-password',
  FORGOT_PASSWORD_CORPORATE: 'corp/forgot-password',
  FORGOT_PASSWORD_RESULT: 'forgotpass-result',
  CORP_FORGOT_PASSWORD_RESULT: 'corp/forgotpass-result',
  VERIFY_EMAIL_RESULT: 'verify-email-result',
  VERIFY_EMAIL: 'verify-email',
  RESET_PASSWORD: 'reset-password',
  CORPORATE_RESET_PASSWORD: 'corp/reset-password',
  SUCCESS_MESSAGE: 'success-message',
  CORP_SUCCESS_MESSAGE: 'corp/success-message',
  DASHBOARD: 'dashboard',
  PRELOGIN: 'pre-login',
  EDIT_PROFILE: 'edit-profile',
  EDIT_PASSWORD: 'edit-password',
  EDIT_RESIDENTIAL: 'edit-residential',
  UPDATE_USER_DETAILS: 'update-user-details',
  VIEW_ALL_NOTIFICATIONS: 'view-notifications',
  UPDATE_BANK: 'update-bank',
  UPDATE_SRS: 'update-srs',
  TOPUP: 'portfolio/top-up',
  FINLIT_LOGIN: 'finlit/login',
  CORPORATE_LOGIN: 'corp/login',
  FINLIT_CREATE_ACCOUNT: 'finlit/sign-up-account',
  CORPORATE_CREATE_ACCOUNT: 'corp/sign-up-account',
  ACCOUNT_CREATED_FINLIT: 'finlit/success',
  ACCOUNT_CREATED_CORPORATE: 'corp/success',
  FINLIT_VERIFY_MOBILE: 'finlit/verify-mobile',
  CORPORATE_VERIFY_MOBILE: 'corp/verify-mobile',
  SINGPASS_LOGIN: 'singpass-test/login',
  FINLIT_CREATE_ACCOUNT_MY_INFO: 'finlit/sign-up',
  CORPORATE_CREATE_ACCOUNT_MY_INFO: 'corp/sign-up',
  REFER_FRIEND: 'refer-a-friend',
  REFER_REDIRECT : 'referee',
  MANAGE_PROFILE : 'manage-profile',
  UPDATE_CPFIA: 'update-cpfia'
};

export const SIGN_UP_ROUTE_PATHS = {
  ROOT: '',
  PRELOGIN: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.PRELOGIN,
  ACCOUNT_CREATED: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.ACCOUNT_CREATED,
  ACCOUNT_CREATED_FINLIT: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.ACCOUNT_CREATED_FINLIT,
  ACCOUNT_CREATED_CORPORATE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.ACCOUNT_CREATED_CORPORATE,
  ACCOUNT_UPDATED: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.ACCOUNT_UPDATED,
  CREATE_ACCOUNT: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CREATE_ACCOUNT,
  FINLIT_CREATE_ACCOUNT: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.FINLIT_CREATE_ACCOUNT,
  CORPORATE_CREATE_ACCOUNT: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CORPORATE_CREATE_ACCOUNT,
  EMAIL_VERIFIED: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.EMAIL_VERIFIED,
  VERIFY_MOBILE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.VERIFY_MOBILE,
  FINLIT_VERIFY_MOBILE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.FINLIT_VERIFY_MOBILE,
  CORPORATE_VERIFY_MOBILE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CORPORATE_VERIFY_MOBILE,
  VERIFY_2FA: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.TWOFA_MOBILE,
  LOGIN: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.LOGIN,
  FINLIT_LOGIN: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.FINLIT_LOGIN,
  CORPORATE_LOGIN: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CORPORATE_LOGIN,
  FORGOT_PASSWORD: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.FORGOT_PASSWORD,
  FORGOT_PASSWORD_CORPORATE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.FORGOT_PASSWORD_CORPORATE, 
  FORGOT_PASSWORD_RESULT: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.FORGOT_PASSWORD_RESULT,
  CORP_FORGOT_PASSWORD_RESULT: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CORP_FORGOT_PASSWORD_RESULT,
  VERIFY_EMAIL: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.VERIFY_EMAIL,
  RESET_PASSWORD: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.RESET_PASSWORD,
  CORPORATE_RESET_PASSWORD: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CORPORATE_RESET_PASSWORD,
  SUCCESS_MESSAGE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.SUCCESS_MESSAGE,
  CORP_SUCCESS_MESSAGE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CORP_SUCCESS_MESSAGE,
  DASHBOARD: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.DASHBOARD,
  EDIT_PROFILE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.EDIT_PROFILE,
  EDIT_PASSWORD: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.EDIT_PASSWORD,
  EDIT_RESIDENTIAL: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.EDIT_RESIDENTIAL,
  UPDATE_USER_DETAILS: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.UPDATE_USER_DETAILS,
  VIEW_ALL_NOTIFICATIONS: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.VIEW_ALL_NOTIFICATIONS,
  UPDATE_BANK: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.UPDATE_BANK,
  UPDATE_SRS: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.UPDATE_SRS,
  TOPUP: INVESTMENT_MANAGEMENT_PATH + SIGN_UP_ROUTES.TOPUP,
  VERIFY_EMAIL_RESULT:SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.VERIFY_EMAIL_RESULT,
  CREATE_ACCOUNT_MY_INFO:SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CREATE_ACCOUNT_MY_INFO,
  FINLIT_CREATE_ACCOUNT_MY_INFO:SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.FINLIT_CREATE_ACCOUNT_MY_INFO,
  CORPORATE_CREATE_ACCOUNT_MY_INFO:SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CORPORATE_CREATE_ACCOUNT_MY_INFO,
  REFER_FRIEND:SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.REFER_FRIEND,
  REFER_REDIRECT:SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.REFER_REDIRECT,
  MANAGE_PROFILE:SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.MANAGE_PROFILE,
  UPDATE_CPFIA: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.UPDATE_CPFIA
};