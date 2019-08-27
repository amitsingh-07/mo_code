import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from '../../investment-engagement-journey/investment-engagement-journey.constants';

export class TopUPFormError {

  formFieldErrors: object = {
    topupValidations: {
      // tslint:disable-next-line:no-duplicate-string
      zero: {
        errorTitle: 'Oops! Review Investment Amount',
        errorMessage: 'We require a one-time investment of at least $' + INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.my_financials.min_initial_amount + '.'
      },
      // tslint:disable-next-line:max-line-length
      more: {
        errorTitle: 'Oops! Review Investment Amount',
        errorMessage: 'We require a monthly investment of at least $' + INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.my_financials.min_monthly_amount + '.'
      }
      // tslint:disable-next-line:max-line-length
    }
  };
}