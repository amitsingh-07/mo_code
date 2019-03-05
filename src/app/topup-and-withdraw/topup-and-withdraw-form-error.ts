export class TopUpAndWithdrawFormError {
  formFieldErrors: object = {
    errorTitle: 'Error !',
    oneTimeInvestmentAmount: {
      required: {
        errorTitle: 'Invalid Investment Amount',
        errorMessage: 'Please enter Investment Amount.'
      }
    },
    MonthlyInvestmentAmount: {
      required: {
        errorTitle: 'Invalid Investment Amount',
        errorMessage: 'Please enter Investment Amount.'
      }
    },
    portfolio: {
      required: {
        errorTitle: 'Invalid Portfolio',
        errorMessage: 'Please select a Portfolio.'
      }
    },
    Investment: {
      required: {
        errorTitle: 'Invalid Investment Type',
        errorMessage: 'Please select One-time or Monthly Investment.'
      }
    },
    withdrawType: {
      required: {
        errorTitle: 'Invalid Withdraw Type',
        errorMessage: 'Please select a Withdraw Type.'
      }
    },
    withdrawAmount: {
      required: {
        errorTitle: 'Invalid Withdraw Amount',
        errorMessage: 'Please enter Withdraw Amount.'
      },
      portfolioToBank: {
        errorTitle: 'Invalid Withdraw Type Amount',
        errorMessage: 'Withdrawal amount should not be more than the Portfolio Value.'
      },
      PortfolioToCash: {
        errorTitle: 'Invalid Withdraw Type Amount',
        errorMessage: 'Withdrawal amount should not be more than the Cash Account Value.'
      }
    },
    withdrawPortfolio: {
      required: {
        errorTitle: 'Invalid Portfolio',
        errorMessage: 'Please select a Portfolio.'
      }
    },
    withdrawBank: {
      required: {
        errorTitle: 'Invalid Bank',
        errorMessage: 'Please select a bank or add new bank to withdraw.'
      }
    }
  };
}
