import { APP_ROUTES } from '../app-routes.constants';

export const COMPREHENSIVE_BASE_ROUTE = '../' + APP_ROUTES.COMPREHENSIVE + '/';

export const COMPREHENSIVE_ROUTES = {
  ROOT: '',
  STEPS: 'steps',
  GETTING_STARTED: 'getting-started',
  DEPENDANT_SELECTION: 'dependant-selection',
  DEPENDANT_SELECTION_SUMMARY: 'dependant-selection',
  DEPENDANT_DETAILS: 'dependant-details',
  DEPENDANT_DETAILS_SUMMARY: 'dependant-details',
  DEPENDANT_EDUCATION: 'dependant-education',
  DEPENDANT_EDUCATION_LIST: 'dependant-education-list',
  DEPENDANT_EDUCATION_LIST_SUMMARY: 'dependant-education-list',
  DEPENDANT_EDUCATION_SELECTION: 'dependant-education-selection',
  DEPENDANT_EDUCATION_SELECTION_SUMMARY: 'dependant-education-selection',
  DEPENDANT_EDUCATION_PREFERENCE: 'dependant-education-preference',
  MY_EARNINGS: 'my-earnings',
  MY_SPENDINGS: 'my-spendings',
  REGULAR_SAVING_PLAN: 'regular-saving-plan',
  MY_ASSETS: 'my-assets',
  MY_LIABILITIES: 'my-liabilities',
  MY_LIABILITIES_SUMMARY: 'my-liabilities',
  BAD_MOOD_FUND: 'bad-mood-fund',
  FIRST_REPORT: 'first-report',
  PROGRESS_TRACKER: 'progress-tracker',
  RETIREMENT_PLAN: 'retirement-plan',
  RETIREMENT_PLAN_SUMMARY: 'retirement-plan',
  INSURANCE_PLAN: 'insurance-plan',
  INSURANCE_PLAN_SUMMARY: 'insurance-plan',
  RESULT: 'result',
  DASHBOARD: '/accounts/dashboard',
  ENQUIRY: 'enquiry',
  VALIDATE_RESULT: 'validate-result',
  REVIEW: 'review',
  SPEAK_TO_ADVISOR: 'speak-to-advisor',
  RISK_PROFILE: 'risk-profile',
  CFP_AUTOFILL: 'myinfo-autofill'
};

export const COMPREHENSIVE_ROUTE_PATHS = {
  ROOT: COMPREHENSIVE_BASE_ROUTE + '',
  GETTING_STARTED: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.GETTING_STARTED,
  STEPS: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.STEPS,
  DEPENDANT_SELECTION: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_SELECTION,
  DEPENDANT_SELECTION_SUMMARY: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_SELECTION_SUMMARY,
  DEPENDANT_DETAILS: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_DETAILS,
  DEPENDANT_DETAILS_SUMMARY: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_DETAILS_SUMMARY,
  DEPENDANT_EDUCATION: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION,
  DEPENDANT_EDUCATION_LIST: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_LIST,
  DEPENDANT_EDUCATION_LIST_SUMMARY: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_LIST_SUMMARY,
  DEPENDANT_EDUCATION_SELECTION: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_SELECTION,
  DEPENDANT_EDUCATION_SELECTION_SUMMARY: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_SELECTION_SUMMARY,
  DEPENDANT_EDUCATION_PREFERENCE: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_PREFERENCE,
  MY_EARNINGS: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.MY_EARNINGS,
  MY_SPENDINGS: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.MY_SPENDINGS,
  REGULAR_SAVING_PLAN: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.REGULAR_SAVING_PLAN,
  MY_ASSETS: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.MY_ASSETS,
  MY_LIABILITIES: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.MY_LIABILITIES,
  MY_LIABILITIES_SUMMARY: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.MY_LIABILITIES_SUMMARY,
  BAD_MOOD_FUND: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.BAD_MOOD_FUND,
  RETIREMENT_PLAN: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.RETIREMENT_PLAN,
  RETIREMENT_PLAN_SUMMARY: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.RETIREMENT_PLAN_SUMMARY,
  INSURANCE_PLAN: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.INSURANCE_PLAN,
  INSURANCE_PLAN_SUMMARY: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.INSURANCE_PLAN_SUMMARY,
  RESULT: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.RESULT,
  DASHBOARD: COMPREHENSIVE_ROUTES.DASHBOARD,
  ENQUIRY: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.ENQUIRY,
  VALIDATE_RESULT: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.VALIDATE_RESULT,
  REVIEW: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.REVIEW,
  SPEAK_TO_ADVISOR: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.SPEAK_TO_ADVISOR,
  RISK_PROFILE: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.RISK_PROFILE,
  CFP_AUTOFILL: COMPREHENSIVE_BASE_ROUTE + COMPREHENSIVE_ROUTES.CFP_AUTOFILL
};

export const COMPREHENSIVE_FULL_ROUTER_CONFIG = {
  0: COMPREHENSIVE_ROUTE_PATHS.GETTING_STARTED,
  1: COMPREHENSIVE_ROUTE_PATHS.STEPS + '/1',
  2: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_SELECTION,
  3: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_DETAILS,
  4: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_SELECTION,
  5: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_PREFERENCE,
  6: COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_LIST,
  7: COMPREHENSIVE_ROUTE_PATHS.STEPS + '/2',
  8: COMPREHENSIVE_ROUTE_PATHS.MY_EARNINGS,
  9: COMPREHENSIVE_ROUTE_PATHS.MY_SPENDINGS,
  10: COMPREHENSIVE_ROUTE_PATHS.REGULAR_SAVING_PLAN,
  11: COMPREHENSIVE_ROUTE_PATHS.BAD_MOOD_FUND,
  12: COMPREHENSIVE_ROUTE_PATHS.MY_ASSETS,
  13: COMPREHENSIVE_ROUTE_PATHS.MY_LIABILITIES,
  14: COMPREHENSIVE_ROUTE_PATHS.STEPS + '/3',
  15: COMPREHENSIVE_ROUTE_PATHS.INSURANCE_PLAN,
  16: COMPREHENSIVE_ROUTE_PATHS.STEPS + '/4',
  17: COMPREHENSIVE_ROUTE_PATHS.RETIREMENT_PLAN,
  18: COMPREHENSIVE_ROUTE_PATHS.STEPS + '/5',
  19: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/1',
  20: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/2',
  21: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/3',
  22: COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/4',
  23: COMPREHENSIVE_ROUTE_PATHS.VALIDATE_RESULT,
  24: COMPREHENSIVE_ROUTE_PATHS.REVIEW,
  25: COMPREHENSIVE_ROUTE_PATHS.SPEAK_TO_ADVISOR,
  26: COMPREHENSIVE_ROUTE_PATHS.RESULT,
  27: COMPREHENSIVE_ROUTE_PATHS.CFP_AUTOFILL
};
