import { MANAGE_INVESTMENTS_CONSTANTS } from './manage-investments.constants';

export class ManageInvestmentsFormError {
  formFieldErrors: object = {
    errorTitle: 'Error !',
    oneTimeInvestmentAmount: {
      required: {
        errorTitle: 'Invalid Investment Amount',
        errorMessage: 'Enter Investment Amount.'
      }
    },
    MonthlyInvestmentAmount: {
      required: {
        errorTitle: 'Invalid Investment Amount',
        errorMessage: 'Enter Investment Amount.'
      }
    },
    portfolio: {
      required: {
        errorTitle: 'Invalid Portfolio',
        errorMessage: 'Select a Portfolio.'
      }
    },
    Investment: {
      required: {
        errorTitle: 'Invalid Investment Type',
        errorMessage: 'Select One-time or Monthly Investment.'
      }
    },
    withdrawType: {
      required: {
        errorTitle: 'Invalid Withdraw Type',
        errorMessage: 'Select a Withdraw Type.'
      }
    },
    withdrawAmount: {
      required: {
        errorTitle: 'Invalid Withdraw Amount',
        errorMessage: 'Enter Withdraw Amount.'
      },
      MoreThanBalancePortfolio: {
        errorTitle: 'Invalid Withdraw Type Amount',
        errorMessage: 'Withdrawal amount should not be more than the Portfolio Value.'
      },
      MoreThanBalanceCash: {
        errorTitle: 'Invalid Withdraw Type Amount',
        errorMessage: 'Withdrawal amount should not be more than the Cash Account Value.'
      },
      MinValue: {
        errorTitle: 'Invalid Withdraw Type Amount',
        errorMessage: 'Withdrawal amount should be more than 0.'
      },
      MinWithdrawal: {
        errorTitle: 'Minimum Withdrawal amount',
        errorMessage: ' Please note that minimum withdrawal amount is $' + MANAGE_INVESTMENTS_CONSTANTS.WITHDRAW.MIN_WITHDRAW_AMOUNT + '.'
      },
      MinBalance: {
        errorTitle: 'Minimum Retention amount',
        errorMessage: 'Please note that minimum portfolio amount is $' + MANAGE_INVESTMENTS_CONSTANTS.WITHDRAW.MIN_BALANCE_AMOUNT + '. If you wish to maintain your portfolio, you are to maintain a minimum portfolio value of $' + MANAGE_INVESTMENTS_CONSTANTS.WITHDRAW.MIN_BALANCE_AMOUNT + ' or continue to redeem all.'
      }
    },
    withdrawPortfolio: {
      required: {
        errorTitle: 'Invalid Portfolio',
        errorMessage: 'Select a Portfolio.'
      }
    },
    withdrawBank: {
      required: {
        errorTitle: 'Invalid Bank',
        errorMessage: 'Select a bank or add new bank to withdraw.'
      }
    },
    transferAmount: {
      required: {
        errorTitle: 'Invalid Transfer Amount',
        errorMessage: 'Enter Transfer Amount.'
      },
      MoreThanCashBalance: {
        errorTitle: 'Invalid Transfer Type Amount',
        errorMessage: 'Transfer amount should not be more than the Cash balance.'
      },
     
      MinValue: {
        errorTitle: 'Invalid Withdraw Type Amount',
        errorMessage: 'Withdrawal amount should be more than 0.'
      }
    }
  };
}
