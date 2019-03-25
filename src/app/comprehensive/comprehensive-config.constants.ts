export const COMPREHENSIVE_CONST = {
    YOUR_FINANCES: {
        YOUR_EARNINGS: {
            API_KEY: 'comprehensiveIncome',
            API_TOTAL_BUCKET_KEY: 'totalAnnualIncomeBucket',
            MONTHLY_INPUT_CALC : ['monthlySalary', 'monthlyRentalIncome', 'otherMonthlyWorkIncome', 'otherMonthlyIncome'],
            POP_FORM_INPUT: ['enquiryId', 'totalAnnualIncomeBucket'],
            BUCKET_INPUT_CALC: ['monthlySalary', 'annualBonus']
        },
        YOUR_SPENDING: {
            API_KEY: 'comprehensiveSpending',
            API_TOTAL_BUCKET_KEY: 'totalAnnualExpenses',
            MONTHLY_INPUT_CALC : ['monthlyLivingExpenses', 'HLMortgagePaymentUsingCPF', 'HLMortgagePaymentUsingCash',
            'mortgagePaymentUsingCPF', 'mortgagePaymentUsingCash', 'carLoanPayment', 'otherLoanPayment'],
            POP_FORM_INPUT: ['enquiryId', 'totalAnnualExpenses', 'HLtypeOfHome', 'homeLoanPayOffUntil',
            'mortgageTypeOfHome', 'mortgagePayOffUntil', 'otherLoanPayoffUntil']
        },
        YOUR_ASSETS: {
            API_KEY: 'comprehensiveAssets',
            API_TOTAL_BUCKET_KEY: 'totalAnnualAssets',
            MONTHLY_INPUT_CALC : [''],
            POP_FORM_INPUT: ['enquiryId', 'totalAnnualAssets'],
            BUCKET_INPUT_CALC: ['cashInBank', 'singaporeSavingsBond', 'CPFOA', 'CPFSA', 'CPFMA', 'yourHome',
            'otherInvestment0', 'otherAssets']
        }
    }
};
