export let SIGN_UP_CONFIG = {
    SHOW_BANK_DETAILS: [
        'PORTFOLIO_PURCHASED',
        'ACCOUNT_CREATED',
        'ACCOUNT_FUNDED'
      ],
    NOTIFICATION_MAX_LIMIT: 99,
    RECENT_NOTIFICATION_COUNT: 3,
    NOTIFICATION: {
        READ_PAYLOAD_KEY: 'READ',
        DELETE_PAYLOAD_KEY: 'DELETE'
    },
    INVESTMENT: {
        START_INVESTING: 'START_INVESTING',
        PORTFOLIO_PURCHASED: 'PORTFOLIO_PURCHASED',
        ACCOUNT_CREATED: 'ACCOUNT_CREATED',
        INVESTMENT_ACCOUNT_DETAILS_SAVED: 'INVESTMENT_ACCOUNT_DETAILS_SAVED',
        ACCOUNT_CREATION_FAILED: 'ACCOUNT_CREATION_FAILED',
        CDD_CHECK_PENDING: 'CDD_CHECK_PENDING',
        RECOMMENDED: 'RECOMMENDED',
        PROPOSED: 'PROPOSED',
        ACCEPTED_NATIONALITY: 'ACCEPTED_NATIONALITY',
        CDD_CHECK_FAILED: 'CDD_CHECK_FAILED',
        BLOCKED_NATIONALITY: 'BLOCKED_NATIONALITY',
        EDD_CHECK_PENDING: 'EDD_CHECK_PENDING',
        EDD_CHECK_FAILED: 'EDD_CHECK_FAILED',
        ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
        DOCUMENTS_UPLOADED: 'DOCUMENTS_UPLOADED',
        EDD_CHECK_CLEARED: 'EDD_CHECK_CLEARED',
        ACCOUNT_FUNDED: 'ACCOUNT_FUNDED'
    },
    BANK_KEYS: { /* ACCOUNT NUMBER LENGTH FOR LIST OF BANK CODES */
        BANK_OF_CHINA: 'Bank of China',
        STANDARD_CHARTED_BANK: 'Standard Chartered Bank',
        DBS: 'DBS',
        CITIBANK: 'Citibank',
        MAYBANK: 'MayBank',
        OCBC: 'OCBC',
        RHB_BANK: 'RHB Bank',
        UOB: 'UOB',
        ANZ_BANK: 'ANZ Bank',
        CIMB: 'CIMB',
        HSBC: 'HSBC',
        POSB: 'POSB'
    }
};
