export let TOPUPANDWITHDRAW_CONFIG = {
  ALLOW_TOPUP_WITHDRAW_GUARD: [
    'PORTFOLIO_PURCHASED',
    'ACCOUNT_CREATED',
    'ACCOUNT_FUNDED'
  ],
  TOPUP: {
    ONE_TIME_INVESTMENT_OPTION_ID: 1,
    MONTHLY_INVESTMENT_OPTION_ID: 2,
    MONTHLY_INVESTMENT: 'Monthly Investment',
    ONETINE_INVESTMENT: 'One-time Investment'
  },
  WITHDRAW: {
    WITHDRAWAL_TYPES: [
      { id: 1, name: 'Portfolio to Cash Account', value: 'PORTFOLIO_TO_CASH_ACCOUNT' },
      { id: 2, name: 'Portfolio to Bank Account', value: 'PORTFOLIO_TO_BANK_ACCOUNT' },
      { id: 3, name: 'Cash Account to Bank Ac', value: 'CASH_TO_BANK_ACCOUNT' }
    ],
    PORTFOLIO_TO_CASH_TYPE_ID: 1,
    PORTFOLIO_TO_BANK_TYPE_ID: 2,
    CASH_TO_BANK_TYPE_ID: 3,
    DEFAULT_WITHDRAW_MODE: 'BANK'
  },
  STATEMENT: {
    STATEMENT_BASE_PATH: window.location.origin + '/assets/docs/portfolio/transaction/'
  },
  FUND_YOUR_ACCOUNT: {
    ONETIME: 'ONETIME',
    MONTHLY: 'MONTHLY',
    BANK: 'bank',
    PAYNOW: 'PayNow',
    SUCCESS: '/success',
    PENDING: '/pending',
    FUNDING: 'FUNDING',
    TOPUP: 'TOPUP'
  },
  INVESTMENT_OVERVIEW: {
    MORE_LIST: [
      { id: 1, name: 'Transactions', value: 'TRANSACTIONS' },
      { id: 2, name: 'Withdrawal', value: 'WITHDRAWAL' }
    ],
    TRANSACTIONS: 'Transactions',
    WITHDRAWAL: 'Withdrawal'
  }
};
