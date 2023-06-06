const INSURANCE_API_BASE_URL = 'svc/insurance/insurance-needs-microservice/api';
const INSURANCE_RECOMMEND_API_BASE_URL = 'svc/recommend/recomm-microservice/api';
const ARTICLE_API_BASE_URL = 'svc/product/insurance-product/api/article';
const ABOUT_US_API_BASE_URL = 'svc/product/insurance-product/api';
const ACCOUNT_API_BASE_URL = 'svc/account/account-microservice/api';
const SUBSCRIPTION_API_BASE_URL = 'svc/product/insurance-product/api';
const WILL_WRITING_API_BASE_URL = 'svc/wills/wills-microservice/api/wills';
const NOTIFICATION_API_BASE_URL = 'svc/notification/notify-microservice/api/notifications';
const COMPREHENSIVE_API_BASE_URL = 'svc/recommend/recomm-microservice/api/customer/comprehensive/';
const FINANCE_API_BASE_URL = 'svc/finance/finhealth/api/customer/comprehensive/';
const COMPREHENSIVE_REPORT_API_BASE_URL = 'svc/comp/comprehensive-microservice/api/';
const PAYMENT_API_BASE_URL = 'svc/pymtgw/';
const INVEST_API_BASE_URL = 'svc/invest/investment-microservice/api/';
const SINGPASS_API_BASE_URL = 'svc/singpass/singpass-microservice/api/';

export let apiConstants = {
    endpoint: {
        getCaptcha: 'svc/account/account-microservice/getCaptcha',
        authenticate: 'svc/account/account-microservice/authenticate',
        authenticateWorkshop: 'svc/account/account-microservice/authenticateWorkshop',
        authenticateCorporate: 'svc/account/account-microservice/authenticateCorporate',
        login: 'login',
        logout: ACCOUNT_API_BASE_URL + '/logout?source=$LOGOUT_BUTTON$',
        send2faOTP: ACCOUNT_API_BASE_URL + '/send2FAOTP',
        sendOTPEmail :ACCOUNT_API_BASE_URL + '/sendOTPEmail',
        authenticate2faOTP: ACCOUNT_API_BASE_URL + '/validate2FA',
        send2faOTPLogin: ACCOUNT_API_BASE_URL + '/send2FAOTPLogin',
        authenticate2faOTPLogin: ACCOUNT_API_BASE_URL + '/validate2FALogin',
        verify2faOTP: ACCOUNT_API_BASE_URL + '/is2FAuthenticated',
        getProfileList: ACCOUNT_API_BASE_URL + '/getProfileTypeList',
        getProtectionTypesList: INSURANCE_API_BASE_URL + '/getProtectionTypesList',
        getLongTermCareList: INSURANCE_API_BASE_URL + '/getCareGiverList',
        getHospitalPlanList: INSURANCE_API_BASE_URL + '/getHospitalClassList',
        saveRiskProfileFlag: INSURANCE_RECOMMEND_API_BASE_URL + '/saveSkipRiskProfile',
        getRiskAssessmentQuestions: INVEST_API_BASE_URL + 'RiskAssessment',
        getRecommendations: INSURANCE_RECOMMEND_API_BASE_URL + '/getRecommendations',
        updateProductEnquiry: ACCOUNT_API_BASE_URL + '/updateCustomerEnquiry',
        getMyInfoValues: 'svc/sginfo/myinfo-microservice/api/getMyInfoV3',
        getCreateAccountMyInfoValue: ACCOUNT_API_BASE_URL + '/singpass/signup/nric/validation',
        signUp: ACCOUNT_API_BASE_URL + '/signupV2',
        updateUserId: ACCOUNT_API_BASE_URL + '/updatePersonalDetails?handleError=true',
        verifyOTP: ACCOUNT_API_BASE_URL + '/verifyOTP',
        resendOTP: ACCOUNT_API_BASE_URL + '/resendOTP',
        verifyEmail: ACCOUNT_API_BASE_URL + '/verifyEmail',
        resetPassword: ACCOUNT_API_BASE_URL + '/resetPassword',
        forgotPassword: ACCOUNT_API_BASE_URL + '/forgotPassword?handleError=true',
        resetEmail: ACCOUNT_API_BASE_URL + '/resetEmail',
        userProfileInfo: ACCOUNT_API_BASE_URL + '/getCustomerProfileDetails?handleError=true',
        editContactDeatails: ACCOUNT_API_BASE_URL + '/updateAddress',
        editPassword: ACCOUNT_API_BASE_URL + '/editPassword',
        editProfile: ACCOUNT_API_BASE_URL + '/customer/customerProfile?handleError=true',
        editEmployerAddress: ACCOUNT_API_BASE_URL + '/updateEmployment',
        emailValidityCheck: ACCOUNT_API_BASE_URL + '/emailValidityCheck',
        corporateEmailValidityCheck: ACCOUNT_API_BASE_URL + '/corporateEmailValidityCheck',
        detailCustomerSummary: ACCOUNT_API_BASE_URL + '/getDetailedCustomerSummary',
        getCustomerInsuranceDetails: INSURANCE_RECOMMEND_API_BASE_URL + '/customer/getDetailedInsuranceSummary?handleError=true',
        resendEmailVerification: ACCOUNT_API_BASE_URL + '/resendEmailVerification',
        editMobileNumber: ACCOUNT_API_BASE_URL + '/update-mobileno',
        registerBundleEnquiry: ACCOUNT_API_BASE_URL + '/registerBundleEnquiry',
        enquiryByEmail: ACCOUNT_API_BASE_URL + '/enquiryByEmail',
        getPopupStatus: ACCOUNT_API_BASE_URL + '/getTrackStatus',
        setPopupStatus: ACCOUNT_API_BASE_URL + '/setTrackStatus',
        enquireRetirementPlan: ACCOUNT_API_BASE_URL + '/postRetirementPlanning',
        sendWelcomeMail: ACCOUNT_API_BASE_URL + '/sendWelcomeMail',
        financialWellness: ACCOUNT_API_BASE_URL + '/corp/updateLeadGen',
        validateReferralCode: ACCOUNT_API_BASE_URL + '/referralcode/validateReferralCode?handleError=true',
        getSingpassAccount: ACCOUNT_API_BASE_URL + '/activate/singpass',
        getReferralCode: ACCOUNT_API_BASE_URL + '/referralcode/welcomeRewards',
        getRefereeList: ACCOUNT_API_BASE_URL + '/referralcode/getRefereeList',   
        getCustOrgPromoCode: ACCOUNT_API_BASE_URL + '/promocode/getCustOrgPromoCode',
        directContactMeForm: ACCOUNT_API_BASE_URL + '/contactMe?handleError=true',
        getInterestedInList: ACCOUNT_API_BASE_URL + '/getInstestedInsruanceList',
        customer: {
            validateUIN: ACCOUNT_API_BASE_URL + '/customer/validateUin',
        },
        article: {
            getRecentArticles: ARTICLE_API_BASE_URL + '/getTop8Articles',
            getArticleCategory: ARTICLE_API_BASE_URL + '/getCountForAllTags',
            getArticleCategoryList: ARTICLE_API_BASE_URL + '/getArticlesByTagId',
            getArticleCategoryAllList: ARTICLE_API_BASE_URL + '/getAllArticles',
            getArticle: ARTICLE_API_BASE_URL + '/getArticleById',
            getRelatedArticle: ARTICLE_API_BASE_URL + '/getTop3ArticlesByTagId'
        },
        aboutus: {
            getCustomerReviews: ABOUT_US_API_BASE_URL + '/review/getAllReviews',
            sendContactUs: ACCOUNT_API_BASE_URL + '/contactus'
        },
        subscription: {
            base: SUBSCRIPTION_API_BASE_URL + '/mailinglist/subscribe'
        },
        notification: {
            getRecentNotifications: NOTIFICATION_API_BASE_URL + '/recent',
            getAllNotifications: NOTIFICATION_API_BASE_URL + '/getNotification',
            updateNotifications: NOTIFICATION_API_BASE_URL + '/updateNotification'
        },
        willWriting: {
            verifyPromoCode: ACCOUNT_API_BASE_URL + '/promocode/validatePromoCode',
            createWill: WILL_WRITING_API_BASE_URL + '/createWillProfile?handleError=true',
            getWill: WILL_WRITING_API_BASE_URL + '/getWillProfile',
            updateWill: WILL_WRITING_API_BASE_URL + '/updateWillProfile?handleError=true',
            downloadWill: WILL_WRITING_API_BASE_URL + '/downloadWillDocument'
        },
        comprehensive: {
            getComprehensiveSummary: COMPREHENSIVE_API_BASE_URL + 'getComprehensiveUserSummary',
            autofillCFPData: COMPREHENSIVE_API_BASE_URL + 'autofill',
            addPersonalDetails: ACCOUNT_API_BASE_URL + '/customer/comprehensive/addPersonalDetails',
            addDependents: ACCOUNT_API_BASE_URL + '/customer/comprehensive/saveDependents',
            saveEndowmentPlan: ACCOUNT_API_BASE_URL + '/customer/comprehensive/saveChildEndowmentPlans',
            saveEarnings: FINANCE_API_BASE_URL + 'saveEarnings',
            getSpendings: COMPREHENSIVE_API_BASE_URL + 'getExpenses',
            saveSpendings: FINANCE_API_BASE_URL + 'saveExpenses',
            saveDownOnLuck: FINANCE_API_BASE_URL + 'saveDownOnLuck',
            saveRegularSavings: FINANCE_API_BASE_URL + 'saveRegularSavings',
            saveInsurancePlan: INSURANCE_API_BASE_URL + '/customer/comprehensive/saveInsurancePlanning',
            saveRetirementPlan: INSURANCE_API_BASE_URL + '/customer/comprehensive/saveRetirementPlanning',
            saveAssets: FINANCE_API_BASE_URL + 'saveComprehensiveAssets',
            saveLiabilities: FINANCE_API_BASE_URL + 'saveComprehensiveLiabilities',
            getPromoCode: ACCOUNT_API_BASE_URL + '/customer/comprehensive/requestComprehensivePromoCode?category=COMPRE',
            generateComprehensiveEnquiry: ACCOUNT_API_BASE_URL + '/customer/comprehensive/mapAndGenerateCFPEnquiryId',
            downloadComprehensiveReport: COMPREHENSIVE_REPORT_API_BASE_URL + 'downloadCompreReportPdf',
            saveStepIndicator: COMPREHENSIVE_API_BASE_URL + 'saveComprehensiveStepCompletion',
            generateComprehensiveReport: COMPREHENSIVE_API_BASE_URL + 'generateComprehensiveReport',
            getReport: COMPREHENSIVE_REPORT_API_BASE_URL + 'getReport',
            getComprehensiveSummaryDashboard: COMPREHENSIVE_API_BASE_URL + 'fetchComprehensiveStatus',
            getProductAmount: ACCOUNT_API_BASE_URL + '/productPricing',
            updateComprehensiveStatus: COMPREHENSIVE_API_BASE_URL +'updateComprehensiveReportStatus',
            insuranceData: 'assets/comprehensive/insurancePlan.json',
            generateComprehensiveCashflow: FINANCE_API_BASE_URL + 'generateComprehensiveCashflow',
            generateReport: INSURANCE_RECOMMEND_API_BASE_URL + '/customer/comprehensive/myinfo',
            getUserDob: ACCOUNT_API_BASE_URL+ '/customer/dateOfBirth'
        },
        payment: {
            getRequestSignature: PAYMENT_API_BASE_URL + 'getRequestSignature',
            cancelPayment: PAYMENT_API_BASE_URL + 'cancelPayment',
            getLastSuccessfulSubmittedTs: PAYMENT_API_BASE_URL + 'getLastSuccessfulSubmittedTs',
            getCustPromoCodeByCategory: ACCOUNT_API_BASE_URL + '/promocode/getCustPromoCodeByCategory',
            getPaymentCheckoutCfpDetails: ACCOUNT_API_BASE_URL + '/promocode/checkout/details',
            getCheckoutSpeakToAdvisor : INSURANCE_RECOMMEND_API_BASE_URL + '/checkoutSpeakToAdvisor'
        },
        promoCode: {
            getCustomerInvestmentPromoCode: ACCOUNT_API_BASE_URL + '/promocode/getCustomerInvestmentPromoCode',
            validateInvestPromoCode: ACCOUNT_API_BASE_URL + '/promocode/validateInvestmentPromoCode?handleError=true',
            saveCustomerPromoCode: ACCOUNT_API_BASE_URL + '/promocode/saveCustomerPromoCode',
            checkNtucMember : ACCOUNT_API_BASE_URL + '/ntuc/membership/verification',
            validatePromo : ACCOUNT_API_BASE_URL + '/promocode/validateComprehensivePromoCode'
        },
        organisation: {
            getOrganisationCodeByUUID: ACCOUNT_API_BASE_URL+ '/getOrganisationCodeByUUID'
        },
        singpass: {
            getStateNonce: SINGPASS_API_BASE_URL+ 'getStateNonce?handleError=true',
            loginSingpass: SINGPASS_API_BASE_URL+ 'loginSingpass?handleError=true'
        },
        recommendedCards: {
            getDashboardCards: INSURANCE_RECOMMEND_API_BASE_URL + '/customer/recommended/card?pageNo=$PAGE_NO$&pageSize=$SIZE$',
            dismissCard: INSURANCE_RECOMMEND_API_BASE_URL + '/customer/recommended/card/$CARD_ID$/dismiss',
            getCardById: INSURANCE_RECOMMEND_API_BASE_URL + '/customer/recommended/card/'
        },
        captchaVerify: ACCOUNT_API_BASE_URL + '/captchaVerify'
    }
};
