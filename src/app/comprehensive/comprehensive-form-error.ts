export class ComprehensiveFormError {
    invalidName = 'Invalid Name';
    errorTitleDetails = 'Oops! Please enter the following details:';
    moGetStrdForm: object = {
        formFieldErrors: {
            errorTitle: this.errorTitleDetails,
            gender: {
                required: {
                    errorTitle: 'Invalid Gender',
                    errorMessage: 'Gender'
                }
            },
            ngbDob: {
                required: {
                    errorTitle: 'Invalid Date of Birth',
                    errorMessage: 'Date of Birth'
                }
            },
            nation: {
                required: {
                    errorTitle: 'Invalid Nationality',
                    errorMessage: 'Nationality'
                }
            },
            firstName: {
                required: {
                    errorTitle: this.invalidName,
                    errorMessage: 'Full Name (as per ID)'
                }
            }

        }
    };
    dependantForm: object = {
        formFieldErrors: {
            errorTitle: this.errorTitleDetails,
            name: {
                required: {
                        errorTitle: this.invalidName,
                        errorMessage: 'Full Name (as per ID)'
                },
                pattern: {
                        errorTitle:  this.invalidName,
                        // tslint:disable-next-line:max-line-length
                        errorMessage: 'Full Name - invalid characters. <br>Valid characters: a-z, A-Z, space and !"#$%&\'()*+,-./:;<=>?@[\\\]^_`{|}~'
                },
                minlength: {
                        errorTitle:  this.invalidName,
                        errorMessage: 'Full Name should be 2 - 100 characters long'
                },
                maxlength: {
                        errorTitle:  this.invalidName,
                        errorMessage: 'Full Name should be 2 - 100 characters long'
                }
        },
            gender: {
                required: {
                    errorTitle: 'Invalid Gender',
                    errorMessage: 'Gender'
                }
            },
            dateOfBirth: {
                required: {
                    errorTitle: 'Invalid Date of Birth',
                    errorMessage: 'Date of Birth'
                }
            },
            nation: {
                required: {
                    errorTitle: 'Invalid Nationality',
                    errorMessage: 'Nationality'
                }
            },
            relationship: {
                required: {
                    errorTitle: 'Invalid Relationship',
                    errorMessage: 'Relationship'
                }
            }

        }
    };
    educationPreferenceForm: object = {
        formFieldErrors: {
            errorTitle: this.errorTitleDetails,
            location: {
                required: {
                    errorTitle: 'Invalid Location',
                    errorMessage: 'Location'
                }
            },
            educationCourse: {
                required: {
                    errorTitle: 'Invalid Course',
                    errorMessage: 'Course'
                }
            },
        }
    };
     myLiabilitiesForm: object = {
        formFieldErrors: {
            errorTitle: this.errorTitleDetails,
            homeLoanOutstanding: {
                required: {
                    errorTitle: 'Invalid Home Loan Outstanding',
                    errorMessage: 'Home Loan Outstanding'
                }
            },
            otherPropertyLoan: {
                required: {
                    errorTitle: 'Invalid Other Property Loans',
                    errorMessage: 'Other Property Loans'
                }
            },
            otherLoanAmountOustanding: {
                required: {
                    errorTitle: 'Invalid Other Loans Amount Oustanding',
                    errorMessage: 'Other Loans Amount Oustanding'
                }
            },
            carLoan: {
                required: {
                    errorTitle: 'Invalid Car Loans',
                    errorMessage: 'Car Loans'
                }
            }

        }
    };

    myEarningsForm: object = {
        formFieldErrors: {
            errorTitle: this.errorTitleDetails,
            employmentType: {
                required: {
                    errorTitle: 'Invalid Employment Type',
                    errorMessage: 'Employment Type'
                }
            },
            monthlySalary: {
                required: {
                    errorTitle: 'Invalid Monthly Salary',
                    errorMessage: 'Other Monthly Salary'
                }
            },
            monthlyRentalIncome: {
                required: {
                    errorTitle: 'Invalid Monthly Rental Income',
                    errorMessage: 'Monthly Rental Income'
                }
            },
            otherMonthlyWorkIncome: {
                required: {
                    errorTitle: 'Invalid Other Monthly Work Income',
                    errorMessage: 'Other Monthly Work Income'
                }
            },
            otherMonthlyIncome: {
                required: {
                    errorTitle: 'Invalid Other Monthly Income',
                    errorMessage: 'Other Monthly Income'
                }
            },
            annualBonus: {
                required: {
                    errorTitle: 'Invalid Annual Bonus',
                    errorMessage: 'Annual Bonus'
                }
            },
            annualDividends: {
                required: {
                    errorTitle: 'Invalid Annual Dividends',
                    errorMessage: 'Annual Dividends'
                }
            },
            otherAnnualIncome: {
                required: {
                    errorTitle: 'Invalid Other Annual Income',
                    errorMessage: 'Other Annual Income'
                }
            }

        }
    };
    mySpendingsForm: object = {
        formFieldErrors: {
            errorTitle: 'Oops! Please enter the following details:',
            monthlyLivingExpenses: {
                required: {
                    errorTitle: 'Invalid Monthly Living Expenses',
                    errorMessage: 'Monthly Living Expenses'
                }
            },
            adHocExpenses: {
                required: {
                    errorTitle: 'Invalid Yearly or Ad-Hoc Expenses',
                    errorMessage: 'Other Yearly or Ad-Hoc Expenses'
                }
            },
            HLMortgagePaymentUsingCPF: {
                required: {
                    errorTitle: 'Invalid Mortgage Payment using CPF',
                    errorMessage: 'Mortgage Payment using CPF'
                }
            },
            HLMortgagePaymentUsingCash: {
                required: {
                    errorTitle: 'Invalid Other Mortgage Payment using Cash',
                    errorMessage: 'Other Mortgage Payment using Cash'
                }
            },
            HLtypeOfHome: {
                required: {
                    errorTitle: 'Invalid Type of Home',
                    errorMessage: 'Other Type of Home'
                }
            },
            homeLoanPayOffUntil: {
                required: {
                    errorTitle: 'Invalid To Pay Off',
                    errorMessage: 'To Pay Off'
                },
                pattern: {
                    errorTitle: 'Invalid To Pay Off',
                    errorMessage: 'To Pay Off'
                }
            },
            mortgagePaymentUsingCPF: {
                required: {
                    errorTitle: 'Invalid Mortgage Payment using CPF',
                    errorMessage: 'Mortgage Payment using CPF'
                }
            },
            mortgagePaymentUsingCash: {
                required: {
                    errorTitle: 'Invalid Other Mortgage Payment using Cash',
                    errorMessage: 'Other Mortgage Payment using Cash'
                }
            },
            mortgageTypeOfHome: {
                required: {
                    errorTitle: 'Invalid Type of Home',
                    errorMessage: 'Other Type of Home'
                }
            },
            mortgagePayOffUntil: {
                required: {
                    errorTitle: 'Invalid To Pay Off',
                    errorMessage: 'To Pay Off'
                },
                pattern: {
                    errorTitle: 'Invalid To Pay Off',
                    errorMessage: 'To Pay Off'
                }
            },
            carLoanPayment: {
                required: {
                    errorTitle: 'Invalid Monthly Car Loan Payment',
                    errorMessage: 'Monthly Car Loan Payment'
                }
            },
            otherLoanPayment: {
                required: {
                    errorTitle: 'Invalid Monthly Other Loan Payment',
                    errorMessage: 'Monthly Other Loan Payment'
                }
            },
            otherLoanPayoffUntil: {
                required: {
                    errorTitle: 'Invalid To Pay Off',
                    errorMessage: 'To Pay Off'
                },
                pattern: {
                    errorTitle: 'Invalid To Pay Off',
                    errorMessage: 'To Pay Off'
                }
            }

        }
    };
}
