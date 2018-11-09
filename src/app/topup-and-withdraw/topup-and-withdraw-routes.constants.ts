export const TOPUP_AND_WITHDRAW_BASE_ROUTE = '../topup-and-withdraw/';

export const TOPUP_AND_WITHDRAW_ROUTES = {
  ROOT: '',
  TOPUP: 'top-up',
  TOPUP_REQUEST: 'topup-request',
  WITHDRAW: 'withdraw'
};

export const TOPUP_AND_WITHDRAW_ROUTE_PATHS = {
  ROOT: '',
  TOPUP: TOPUP_AND_WITHDRAW_BASE_ROUTE + TOPUP_AND_WITHDRAW_ROUTES.TOPUP,
  TOPUP_REQUEST: TOPUP_AND_WITHDRAW_BASE_ROUTE + TOPUP_AND_WITHDRAW_ROUTES.TOPUP_REQUEST,
  WITHDRAW: TOPUP_AND_WITHDRAW_BASE_ROUTE + TOPUP_AND_WITHDRAW_ROUTES.WITHDRAW
};
