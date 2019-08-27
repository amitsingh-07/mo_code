// Production release path
export const INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE = '../investment/engagement/';
// Soft release path
// export const INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE = '../20190316invest/';

export const INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES = {
  ROOT: '',
  START: 'start-journey',
  GET_STARTED_STEP1: 'step-1',
  PERSONAL_INFO: 'investment-period',
  INVESTMENT_AMOUNT: 'investment-amount',
  MY_FINANCIAL: 'your-financial',
  GET_STARTED_STEP2: 'step-2',
  RISK_ASSESSMENT: 'risk-willingness',
  RISK_PROFILE: 'recommendation',
  PORTFOLIO_RECOMMENDATION: 'portfolio-details',
  WHATS_THE_RISK: 'whats-the-risk',
  FUND_DETAILS: 'fund-details',
  PORTFOLIO_EXIST: 'portfolio-exist'
};

export const INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS = {
  ROOT: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.ROOT,
  GET_STARTED_STEP1: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.GET_STARTED_STEP1,
  PORTFOLIO_EXIST: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.PORTFOLIO_EXIST,
  PERSONAL_INFO: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.PERSONAL_INFO,
  INVESTMENT_AMOUNT: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.INVESTMENT_AMOUNT,
  MY_FINANCIAL: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.MY_FINANCIAL,
  GET_STARTED_STEP2: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.GET_STARTED_STEP2,
  RISK_ASSESSMENT: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.RISK_ASSESSMENT,
  RISK_PROFILE: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.RISK_PROFILE,
  PORTFOLIO_RECOMMENDATION:
    INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.PORTFOLIO_RECOMMENDATION,
  WHATS_THE_RISK: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.WHATS_THE_RISK,
  FUND_DETAILS: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.FUND_DETAILS,
  START: INVESTMENT_ENGAGEMENT_JOURNEY_BASE_ROUTE + INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.START
};