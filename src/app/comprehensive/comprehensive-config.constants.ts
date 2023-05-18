export const COMPREHENSIVE_CONST = {
    PROMOTION: {
        AMOUNT: 99
    },
    PROMO_CODE: {
        GET: 'GET_PROMO_CODE',
        VALIDATE: 'VALIDATE_PROMO_CODE',
        TYPE: 'COMPRE'
    },
    YOUR_PROFILE: {
        APP_MIN_AGE: 15,
        APP_MAX_AGE: 70,
        DATE_PICKER_MIN_YEAR: 0,
        DATE_PICKER_MAX_YEAR: 100
    },
    CHILD_ENDOWMENT: {
        MALE_MATURITY_AGE: 21,
        FEMALE_MATURITY_AGE: 19
    },
    YOUR_FINANCES: {
        YOUR_EARNINGS: {
            API_KEY: 'comprehensiveIncome',
            API_TOTAL_BUCKET_KEY: 'totalAnnualIncomeBucket',
            MONTHLY_INPUT_CALC: ['monthlySalary', 'monthlyRentalIncome', 'otherMonthlyWorkIncome', 'otherMonthlyIncome'],
            POP_FORM_INPUT: ['enquiryId', 'totalAnnualIncomeBucket', 'customerId', 'id'],
            BUCKET_INPUT_CALC: ['monthlySalary', 'annualBonus', 'monthlyRentalIncome', 'otherMonthlyWorkIncome',
                'otherMonthlyIncome', 'annualDividends', 'otherAnnualIncome'],
            BUCKET_INPUT_CALC_LITE: ['monthlySalary', 'annualBonus']
        },
        YOUR_SPENDING: {
            API_KEY: 'comprehensiveSpending',
            API_TOTAL_BUCKET_KEY: 'totalAnnualExpenses',
            MONTHLY_INPUT_CALC: ['monthlyLivingExpenses', 'HLMortgagePaymentUsingCash',
                'mortgagePaymentUsingCash', 'carLoanPayment', 'otherLoanPayment'],
            POP_FORM_INPUT: ['enquiryId', 'totalAnnualExpenses', 'HLtypeOfHome', 'homeLoanPayOffUntil',
                'mortgageTypeOfHome', 'mortgagePayOffUntil', 'otherLoanPayoffUntil', 'customerId', 'id',
                'HLMortgagePaymentUsingCPF', 'mortgagePaymentUsingCPF', 'carLoanPayoffUntil']
        },
        YOUR_ASSETS: {
            API_KEY: 'comprehensiveAssets',
            API_TOTAL_BUCKET_KEY: 'totalAnnualAssets',
            MONTHLY_INPUT_CALC: [],
            POP_FORM_INPUT: ['enquiryId', 'totalAnnualAssets', 'customerId', 'id', 'assetId', 'estimatedPayout', 'retirementSum', 'topupAmount', 'withdrawalAmount'],
            BUCKET_INPUT_CALC: ['cashInBank', 'savingsBonds', 'cpfOrdinaryAccount', 'cpfSpecialAccount', 'cpfMediSaveAccount',
                'homeMarketValue', 'investmentAmount_0', 'otherAssetsValue', 'investmentPropertiesValue', 'cpfRetirementAccount'],
            RETIREMENT_AGE: 54,
            RETIREMENT_SUM_BIRTH_DATE: {
                1948: {
                    BORN_DATE: '07/01/1948',
                    TILL_DATE: '06/30/1949',
                    BRS: '40,000',
                    FRS: '80,000'
                },
                1949: {
                    BORN_DATE: '07/01/1949',
                    TILL_DATE: '06/30/1950',
                    BRS: '42,250',
                    FRS: '84,500'
                },
                1950: {
                    BORN_DATE: '07/01/1950',
                    TILL_DATE: '06/30/1951',
                    BRS: '45,000',
                    FRS: '90,000'
                },
                1951: {
                    BORN_DATE: '07/01/1951',
                    TILL_DATE: '06/30/1952',
                    BRS: '47,300',
                    FRS: '94,600'
                },
                1952: {
                    BORN_DATE: '07/01/1952',
                    TILL_DATE: '06/30/1953',
                    BRS: '49,800',
                    FRS: '99,600'
                },
                1953: {
                    BORN_DATE: '07/01/1953',
                    TILL_DATE: '06/30/1954',
                    BRS: '53,000',
                    FRS: '106,000'
                },
                1954: {
                    BORN_DATE: '07/01/1954',
                    TILL_DATE: '06/30/1955',
                    BRS: '58,500',
                    FRS: '117,000'
                },
                1955: {
                    BORN_DATE: '07/01/1955',
                    TILL_DATE: '06/30/1956',
                    BRS: '61,500',
                    FRS: '123,000'
                },
                1956: {
                    BORN_DATE: '07/01/1956',
                    TILL_DATE: '06/30/1957',
                    BRS: '65,500',
                    FRS: '131,000'
                },
                1957: {
                    BORN_DATE: '07/01/1957',
                    TILL_DATE: '06/30/1958',
                    BRS: '69,500',
                    FRS: '139,000'
                },
                1958: {
                    BORN_DATE: '07/01/1958',
                    TILL_DATE: '06/30/1959',
                    BRS: '74,000',
                    FRS: '148,000'
                },
                1959: {
                    BORN_DATE: '07/01/1959',
                    TILL_DATE: '06/30/1960',
                    BRS: '77,500',
                    FRS: '155,000'
                },
                1960: {
                    BORN_DATE: '07/01/1960',
                    TILL_DATE: '12/31/1961',
                    BRS: '80,500',
                    FRS: '161,000'
                },
                1962: {
                    BORN_DATE: '01/01/1962',
                    TILL_DATE: '12/31/1962',
                    BRS: '83,000',
                    FRS: '166,000'
                },
                1963: {
                    BORN_DATE: '01/01/1963',
                    TILL_DATE: '12/31/1963',
                    BRS: '85,500',
                    FRS: '171,000'
                },
                1964: {
                    BORN_DATE: '01/01/1964',
                    TILL_DATE: '12/31/1964',
                    BRS: '88,000',
                    FRS: '176,000'
                },
                1965: {
                    BORN_DATE: '01/01/1965',
                    TILL_DATE: '12/31/1965',
                    BRS: '90,500',
                    FRS: '181,000'
                },
                1966: {
                    BORN_DATE: '01/01/1966',
                    TILL_DATE: '12/31/1966',
                    BRS: '93,000',
                    FRS: '186,000'
                },
                1967: {
                    BORN_DATE: '01/01/1967',
                    TILL_DATE: '12/31/1967',
                    BRS: '96,000',
                    FRS: '192,000'
                },
                1968: {
                    BORN_DATE: '01/01/1968',
                    TILL_DATE: '12/31/1968',
                    BRS: '99,400',
                    FRS: '198,800'
                },
                1969: {
                    BORN_DATE: '01/01/1969',
                    TILL_DATE: '12/31/1969',
                    BRS: '102,900',
                    FRS: '205,800'
                },
                1970: {
                    BORN_DATE: '01/01/1970',
                    TILL_DATE: '12/31/1970',
                    BRS: '106,500',
                    FRS: '213,000'
                },
                1971: {
                    BORN_DATE: '01/01/1971',
                    TILL_DATE: '12/31/1971',
                    BRS: '110,200',
                    FRS: '220,400'
                },
                1972: {
                    BORN_DATE: '01/01/1972',
                    TILL_DATE: '12/31/1972',
                    BRS: '114,100',
                    FRS: '228,200'
                }
            },
        },
        YOUR_LIABILITIES: {
            API_KEY: 'comprehensiveLiabilities',
            API_TOTAL_BUCKET_KEY: 'totalAnnualLiabilities',
            MONTHLY_INPUT_CALC: [],
            POP_FORM_INPUT: ['enquiryId', 'totalAnnualLiabilities', 'customerId', 'id'],
            BUCKET_INPUT_CALC: ['homeLoanOutstandingAmount', 'otherLoanOutstandingAmount', 'carLoansAmount',
                'otherPropertyLoanOutstandingAmount']
        },
    },
    INSURANCE_PLAN: {
        LONG_TERM_INSURANCE_AGE: 29,
        LONG_TERM_INSURANCE_YEAR: 1969,
        LIFE_PROTECTION_AMOUNT_AGE_LESS_THAN_SIXTY: 70000,
        LIFE_PROTECTION_AMOUNT_AGE_SIXTY_TO_SIXTYFIVE: 55000,
        LIFE_PROTECTION_AMOUNT_AGE_ABOVE_SIXTY_FIVE: 0,
        LONG_TERM_INSURANCE_AGE_OLD: 40,
        LIFE_PROTECTION_AMOUNT_AGE_SIXTY: 60,
        LIFE_PROTECTION_AMOUNT_AGE_SIXTY_FIVE: 65
    },
    SUMMARY_CALC_CONST: {
        EDUCATION_ENDOWMENT: {
            DEPENDANT: {
                UNIVERSITY_FEE: {
                    'Medicine': {
                        'Singapore': 160000,
                        'Singapore PR': 220000,
                        'USA': 676800,
                        'United Kingdom': 482400,
                        'Australia': 489600,
                        'Others': 335000
                    },
                    'Non-Medicine': {
                        'Singapore': 44000,
                        'Singapore PR': 64000,
                        'USA': 252800,
                        'United Kingdom': 210800,
                        'Australia': 163600,
                        'Others': 96000
                    },
                    'PERCENT': 4
                },
                LIVING_EXPENSES: {
                    'Medicine': {
                        'Singapore': 60000,
                        'Singapore PR': 60000,
                        'USA': 192800,
                        'United Kingdom': 138000,
                        'Australia': 175200,
                        'Others': 60000
                    },
                    'Non-Medicine': {
                        'Singapore': 48000,
                        'Singapore PR': 48000,
                        'USA': 96400,
                        'United Kingdom': 92000,
                        'Australia': 116800,
                        'Others': 48000
                    },
                    'PERCENT': 3
                }
            },
            NON_DEPENDANT: {
                LIVING_EXPENSES: {
                    EXPENSE: 2000,
                    PERCENT: 3,
                    ABOUT_AGE: 10,
                    COMPUTED_EXPENSE: 2688
                },
                MEDICAL_BILL: {
                    EXPENSE: 5000,
                    PERCENT: 8,
                    ABOUT_AGE: 10,
                    COMPUTED_EXPENSE: 10795
                }
            }
        },
        INSURANCE_PLAN: {
            ESTIMATED_COST: 100000,
            DEPENDENT_AGE: 70,
        },
        ROUTER_CONFIG: {
            STEP1: true,
            STEP2: true,
            STEP3: true,
            STEP4: true,
        },
        YOUR_FINANCES: {
            HOME_PAY_CPF_EMPLOYED_BREAKDOWN: 6000,
            HOME_PAY_CPF_EMPLOYED_PERCENT: 0.8,
            HOME_PAY_CPF_SELF_EMPLOYED_BREAKDOWN: 6000,
            HOME_PAY_CPF_SELF_EMPLOYED_PERCENT: 0.96,
            SPARE_CASH_EARN_SPEND_PERCENT: 0.75,
            SPARE_CASH_ANNUAL_PERCENT: 0.50,
            ANNUAL_PAY_CPF_BREAKDOWN: 102000
        }
    },
    PAY_OFF_YEAR: 50,
    YOUR_RESULTS: {
        YOUR_EARNINGS: {
            API_KEY: 'comprehensiveIncome',
            VALIDATION_INPUT: ['monthlySalary', 'otherMonthlyWorkIncome'],
        },
        YOUR_ASSETS: {
            API_KEY: 'comprehensiveAssets',
            VALIDATION_INPUT: ['cashInBank', 'savingsBonds'],
        }
    },
    REPORT_STATUS: {
        NEW: 'new',
        EDIT: 'edit',
        SUBMITTED: 'submitted',
        READY: 'ready',
        ERROR: 'error'
    },
    REPORT_PDF_NAME: 'MoneyOwl-Comprehensive.pdf',
    RETIREMENT_PLAN: {
        MIN_AGE: 45,
        MAX_AGE: 71,
        STEP: 1
    },
    VERSION_TYPE: {
        FULL: 'comprehensive-plus',
        REPORT: 'COMPREHENSIVE_REPORT'
    },
    ROLES: {
        ROLE_COMPRE_LITE: 'ROLE_COMPRE_LITE',
        ROLE_DISCOUNT_PROMOTION: 'ROLE_DISCOUNT_PROMOTION',
        PUBLIC: 'public',
        CORPORATE: 'corporate',
        COMPREHENSIVE_REPORT: 'COMPREHENSIVE_REPORT',
        COMPREHENSIVE_ADVISOR: 'COMPREHENSIVE_ADVISOR'
    },
    RISK_ASSESSMENT: {
        SPECIAL_QUESTION_ORDER: 4
    },
    BANNER_NOTE_START_TIME: 1580918400000,
    BANNER_NOTE_END_TIME: 1581436799000,
    PAYMENT_STATUS: {
        PARTIAL_PENDING: 'partial_pending',
        PENDING: 'pending',
        PAID: 'paid',
        WAIVED: 'waived'
    },
    LONG_TERM_SHIELD_TYPE: {
        CARE_SHIELD: "careShield",
        ELDER_SHIELD: "elderShield",
        NO_SHIELD: "noShield"
    },
    CPF_SOURCE: {
        MY_INFO: "MyInfo",
        MANUAL: "MANUAL",
    },
    API_SOURCE: "Robo3",
    NTUC_PROMO_DATE: "2021-06-01T00:00:00.000+08:00",
    REVIEW_INPUTS: "Review Inputs",
    PROGRESS_TRACKER: {
        STEPS: {
            RISK_PROFILE: { // step: 4
                NO: 4,
                TITLE: "Start Risk Profile"
            },
            REVIEW_INPUTS: { // step: 5
                NO: 5,
                TITLE: "Review Inputs"
            }
        }
    },
    JOURNEY_TYPE: 'journeyType',
    TAX_CLEARANCE: {
        YES: {
            VALUE: 'Y',
            DESC: '(Clearance)'
        }
    },
    EXCLUDABLE_CFP_AUTOFILL_MY_INFO_ATTRIBUTES: {
        CPF_HOUSING_WITHDRAWAL: 'cpfhousingwithdrawal',
        VEHICLES: 'vehicles'
    },
    UNACCESSED_ATTRIBUTES: ['name', 'sex', 'dob'],
    MY_INFO_ATTRIBUTES: [
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
    GENDER: {
        MALE: 'male',
        FEMALE: 'female'
    }
};
