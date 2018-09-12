export const SIGN_UP_BASE_ROUTE = '../signup/';

export const SIGN_UP_ROUTES = {
  ROOT: '',
  ACCOUNT_CREATED: 'success',
  CREATE_ACCOUNT: 'account',
  EMAIL_VERIFIED: 'email-verification/:code',
  PASSWORD: 'password',
  VERIFY_MOBILE: 'verify-mobile',
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgot-password'
};

export const SIGN_UP_ROUTE_PATHS = {
  ROOT: '',
  ACCOUNT_CREATED: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.ACCOUNT_CREATED,
  CREATE_ACCOUNT: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.CREATE_ACCOUNT,
  EMAIL_VERIFIED: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.EMAIL_VERIFIED,
  PASSWORD: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.PASSWORD,
  VERIFY_MOBILE: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.VERIFY_MOBILE,
  LOGIN: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.LOGIN,
  FORGOT_PASSWORD: SIGN_UP_BASE_ROUTE + SIGN_UP_ROUTES.FORGOT_PASSWORD
};
