export let SIGN_UP_CONFIG = {
  MY_INFO_ATTRIBUTES: [
    'name',
    'email',
    'mobileno',
    'dob',
    'sex',
    'uinfin'
  ],
  SHOW_BANK_DETAILS: [
    'PORTFOLIO_PURCHASED',
    'ACCOUNT_CREATED',
    'ACCOUNT_FUNDED'
  ],
  NOTIFICATION_MAX_LIMIT: 99,
  ACCOUNT_NUM_MAX_LIMIT: 100,
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
    ACCOUNT_FUNDED: 'ACCOUNT_FUNDED',
    PORTFOLIO_CONFIRMED: 'PORTFOLIO_CONFIRMED',
    CKA_PENDING: 'CKA_PENDING'
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
  },
  LOGIN: {
    FINLIT_LOGIN: true,
    CORPORATE_LOGIN: true
  },
  SIGN_UP: {
    EMAIL: "email"
  },
  SINGPASSLINKSTATUS: {
    LINKED: "LINKED",
    NOT_LINKED: "NOT_LINKED",
    DISABLED: "DISABLED"
  },
  CREATE_ACCOUNT_STATIC: {
    SUCCESS: "SUCCESS",
    CANCELLED: "CANCELLED"
  },
  SINGPASS: "SINGPASS",
  VERIFY_MOBILE: {
    TWO_FA: "2FA",
    UPDATE_CONTACT: "Update Contact",
    SIGN_UP: "Signup"
  },
  SOCIAL_REFERRER_LINK: {
    FACEBOOK: "https://www.facebook.com/sharer.php?quote=",
    TELEGRAM: "https://telegram.me/share/url?url=",
    WHATSAPP: "https://api.whatsapp.com/send?text=",
    MAILTO: "mailto:?body=",
    SIGN_UP_URL: "/app/accounts/sign-up?referral_code="
  },
  REFEREE_REWARDS: {
    CFP: "CFP",
    INVESTMENT: "INVESTMENT",
    INSURANCE: "INSURANCE",
    NOT_ISSUED: "NOT_ISSUED",
    ISSUED: "ISSUED",
    NOT_APPLICABLE: "NOT_APPLICABLE",
    REFER_A_FRIEND: "refer-a-friend",
    DASHBOARD: "dashboard",
    GRAB: "Grab"
  },
  AUTH_2FA_ENABLED: true,
  ROLE_2FA: 'ROLE_2FA',
  ROLE_CORP_FB_USER: 'ROLE_CORP_FB_USER',
  LOGIN_TYPE_2FA: 'MANUAL',
  ACCOUNT_CREATION: {
    DOB: {
      DATE_PICKER_MIN_YEAR: 0,
      DATE_PICKER_MAX_YEAR: 100
    }
  },
  EDIT_ROUTE_TYPE: {
    EMAIL: 'email',
    MOBILE: 'mobile'
  },
  SINGAPORE_COUNTRY_CODE: '+65',
  GENDER: {
    MALE: {
      DESC: 'male',
      VALUE: 'M'
    },
    FEMALE: {
      DESC: 'female',
      VALUE: 'F'
    }
  },
  LIFE_STATUS: {
    ALIVE: {
      VALUE: 'A',
      DESC: 'Alive'
    },
    DECEASED: {
      VALUE: 'D',
      DESC: 'Deceased'
    }
  },
  MARITAL_STATUS: {
    SINGLE: {
      VALUE: 1,
      DESC: 'Single'
    },
    MARRIED: {
      VALUE: 2,
      DESC: 'Married'
    },
    WIDOWED: {
      VALUE: 3,
      DESC: 'Widowed'
    },
    DIVORCED: {
      VALUE: 5,
      DESC: 'Divorced'
    }
  },
  CPF_ACC_TYPE: {
    MA: 'ma',
    SA: 'sa',
    RA: 'ra',
    OA: 'oa'
  },
  RESIDENTIAL_STATUS: {
    CITIZEN: {
      DESC: 'Citizen',
      VALUE: 'CITIZEN'
    },
    PR: {
      DESC: 'PR',
      VALUE: 'PR'
    },
    ALIEN: {
      DESC: 'Alien',
      VALUE: 'ALIEN'
    }
  },
  TAX_CLEARANCE: {
    YES: {
      VALUE: 'Y',
      DESC: '(Clearance)'
    }
  },
  VEHICLE_STATUS: {
    LIVE: {
      VALUE: '1',
      DESC: 'Live'
    },
    DEREGISTERED: {
      VALUE: '2',
      DESC: 'Deregistered'
    }
  },
  CUSTOMER_PORTFOLIOS: {
    JOINT_ACCOUNT: {
      SATUS: 'ACTIVE'
    }
  },
  OWNERSHIP_STATUS: {
    YES: {
      VALUE: 'Yes'
    },
    NO: {
      VALUE: 'No'
    }
  },
  CORP_BIZ_MY_INFO_ATTRIBUTES: [
    'name',
    'sex',
    'dob',
    'residentialstatus',
    'cpfbalances',
    'cpfhousingwithdrawal',
    'noa',
    'uinfin',
    'hdbownership.dateofpurchase',
    'hdbownership.monthlyloaninstalment',
    'hdbownership.loangranted',
    'hdbownership.outstandingloanbalance',
    'vehicles.coeexpirydate',
    'vehicles.openmarketvalue',
    'vehicles.firstregistrationdate',
    'vehicles.status',
    'childrenbirthrecords.name',
    'childrenbirthrecords.sex',
    'childrenbirthrecords.dob',
    'childrenbirthrecords.lifestatus',
    'sponsoredchildrenrecords.name',
    'sponsoredchildrenrecords.sex',
    'sponsoredchildrenrecords.dob',
    'sponsoredchildrenrecords.lifestatus',
    'sponsoredchildrenrecords.residentialstatus'
  ],
  EXCLUDABLE_CORP_BIZ_MY_INFO_ATTRIBUTES: {
    CPF_HOUSING_WITHDRAWAL: 'cpfhousingwithdrawal',
    VEHICLES: 'vehicles'
  },
  ACC_TYPE_CORPBIZ: 'corpbiz',
  CORP_BIZ_ACTIVATIONLINK: {
    INVALID_USER: 'invalid-user',
    LINK_EXPIRED: 'link-expired',
    ACC_EXIST: 'account-exists'
  },
  RECOMMENDED_CARD: {
    ICONS_PATH: 'assets/images/recommended-card/',
    PAGE_COUNT: 5,
    PAGE_SIZE: 0,
    CAROUSEL_CONFIG: {
      SCREEN_SIZE: 567,
      DESKTOP_SLIDES_TO_SCROLL: 2,
      MOBILE_SLIDES_TO_SCROLL: 1,
      SLIDES_TO_SHOW_DESKTOP: 2.5,
      SLIDES_TO_SHOW_MOB: 1.2
    }
  }
};
