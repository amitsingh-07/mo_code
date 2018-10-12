export class InvestmentAccountFormError {
    formFieldErrors: object = {
        errorTitle: 'Error !',
        country: {
            required: {
                errorTitle: 'Invalid Country',
                errorMessage: 'Please select your country.'
            },
        },
        mailCountry: {
            required: {
                errorTitle: 'Invalid Country in mailing address',
                errorMessage: 'Please select country in mailing address.'
            },
        },
        postalCode: {
            required: {
                errorTitle: 'Invalid Postal Code',
                errorMessage: 'Please enter your postal code.'
            },
            pattern: {
                errorTitle: 'Invalid Postal Code',
                errorMessage: 'Postal Code should contain only 6 digit number.'
            }
        },
        mailPostalCode: {
            required: {
                errorTitle: 'Invalid Postal Code in mailing address',
                errorMessage: 'Please enter your Postal Code in mailing address.'
            },
            pattern: {
                errorTitle: 'Invalid Postal Code',
                errorMessage: 'Postal Code should contain only 6 digit number.'
            }
        },
        address1: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid Address Line 1',
                errorMessage: 'Please enter Address Line 1.'
            },
            pattern: {
                errorTitle: 'Invalid Address Line 1',
                errorMessage: 'Address Line 1 should not contain special characters.'
            }
        },
        mailAddress1: {
            required: {
                errorTitle: 'Invalid Address Line 1 in mailing address.',
                errorMessage: 'Please enter Address Line 1 in mailing address.'
            },
            pattern: {
                errorTitle: 'Invalid mail Address Line 1',
                errorMessage: 'Address Line 1 should not contain special characters in mailing address.'
            }
        },
        unitNo: {
            required: {
                errorTitle: 'Invalid Unit No.',
                errorMessage: 'Please enter your unit no.'
            }
        },
        mailUnitNo: {
            required: {
                errorTitle: 'Invalid unit no. in mailing address.',
                errorMessage: 'Please enter your unit no. in mailing address.'
            }
        },
        city: {
            required: {
                errorTitle: 'Invalid city',
                errorMessage: 'Please enter your city.'
            },
            pattern: {
                errorTitle: 'Invalid city',
                errorMessage: 'City should not contain numbers and special characters.'
            }
        },
        mailCity: {
            required: {
                errorTitle: 'Invalid mail city in mailing address',
                errorMessage: 'Please enter your city in mailing address.'
            },
            pattern: {
                errorTitle: 'Invalid city in mailing address',
                errorMessage: 'City should not contain numbers and special characters in mailing address.'
            }
        },
        state: {
            required: {
                errorTitle: 'Invalid state',
                errorMessage: 'Please enter your state.'
            },
            pattern: {
                errorTitle: 'Invalid state',
                errorMessage: 'State should not contain numbers and special characters.'
            }
        },
        mailState: {
            required: {
                errorTitle: 'Invalid state in mailing address',
                errorMessage: 'Please enter your state in mailing address.'
            },
            pattern: {
                errorTitle: 'Invalid state in mailing address',
                errorMessage: 'State should not contain numbers and special characters in mailing address.'
            }
        },
        zipCode: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid zipcode',
                errorMessage: 'Please enter zipcode.'
            },
            pattern: {
                errorTitle: 'Invalid zipcode',
                errorMessage: 'Zipcode should not contain special characters.'
            }
        },
        mailZipCode: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid zipcode in mailing address',
                errorMessage: 'Please enter zipcode in mailing address.'
            },
            pattern: {
                errorTitle: 'Invalid zipcode in mailing address',
                errorMessage: 'Zipcode should not contain special characters in mailing address.'
            }
        },
        tinNumber: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid TIN',
                errorMessage: 'Please enter your TIN number.'
            }
        },
        taxCountry: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid country',
                errorMessage: 'Please select your country.'
            }
        },
        noTinReason: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid reason',
                errorMessage: 'Please select a reason.'
            }
        },
        fullName: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid full name',
                errorMessage: 'Please enter full name.'
            },
            pattern: {
                errorTitle: 'Invalid full name',
                errorMessage: 'full name should not contain alphabet.'
            }
        },
        firstName: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid full name',
                errorMessage: 'Please enter  first Name.'
            },
            pattern: {
                errorTitle: 'Invalid full name',
                errorMessage: 'first Name should not contain alphabet.'
            }
        },

        lastName: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid full name',
                errorMessage: 'Please enter last Name.'
            },
            pattern: {
                errorTitle: 'Invalid full name',
                errorMessage: 'last Name should not contain alphabet.'
            }
        },
        nricNumber: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid NRIC number',
                errorMessage: 'Please enter NRIC number.'
            },
            pattern: {
                errorTitle: 'Invalid NRIC number',
                errorMessage: 'NRIC number should not contain special characters.'
            }
        },
        passportNumber: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid passport  number',
                errorMessage: 'Please enter passport  number.'
            },
          pattern: {
                errorTitle: 'Invalid passport  number',
                errorMessage: 'passport number should not contain special characters.'
            }
        },
        passportExpiry: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid passport expiry date',
                errorMessage: 'Please enter passport expiry date.'
            },
            pattern: {
                errorTitle: 'Invalid passport expiry date',
                errorMessage: 'passport expiry date should not contain alphabet.'
            }
        },
        dob: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid date of birth',
                errorMessage: 'Please enter Date of birth date.'
            },
            pattern: {
                errorTitle: 'Invalid date of birth',
                errorMessage: 'passportExpiry date should not contain alphabet.'
            }
        },
        sourceOfIncome: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid sourcwe',
                errorMessage: 'Please select your source of investment funds.'
            }
        },
        companyName: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid companany name',
                errorMessage: 'Please enter compnany Name.'
            }
        },
        occupation: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid occupation',
                errorMessage: 'Please select your occupation.'
            }
        },
        industry: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid industry name',
                errorMessage: 'Please select your industry'
            }
        },
        contactNumber: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid contact number',
                errorMessage: 'Please enter contact number.'
            }
        },
        empPostalCode: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid postal code',
                errorMessage: 'Please enter postal code.'
            },
            pattern: {
                errorTitle: 'Invalid Postal Code',
                errorMessage: 'Postal Code should contain only 6 digit number.'
            }
        },
        empAddress1: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid employement address1',
                errorMessage: 'Please enter employement address1.'
            }
        },
        empAddress2: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid employement address2',
                errorMessage: 'Please enter employement address2.'
            }
        },

        empUnitNo: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid employement unit number',
                errorMessage: 'Please enter  employement unit number'
            }
        },

        empCity: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid employement employement city',
                errorMessage: 'Please enter employement city.'
            }
        },

        empState: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid employement State',
                errorMessage: 'Please enter employement State.'
            }
        },

        empZipCode: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid employement ZipCode',
                errorMessage: 'Please enter employement ZipCode.'
            }
        },
        annualHouseHoldIncome: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid annual HouseHoldIncome',
                errorMessage: 'Please enter annual HouseHoldIncome.'
            }
        },
        numberOfHouseHoldMembers: {
            required: {
                // tslint:disable-next-line:no-duplicate-string

                errorTitle: 'Invalid number Of House Hold Members',
                errorMessage: 'Please enter number Of House Hold Members.'
            }
        },
        monthlyIncome: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid financial Monthly Income',
                errorMessage: 'Please enter Monthly Income.'
            }
        },
        percentageOfSaving: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid financial Percentage Of Saving',
                errorMessage: 'Please enter Percentage Of Saving.'
            }
        },
        totalAssets: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid financial TotalAssets',
                errorMessage: 'Please enter  TotalAssets.'
            }
        },
        totalLiabilities: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid  financial Total Liabilities',
                errorMessage: 'Please enter Total Liabilities.'
            }
        },
        pepoccupation: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid occupation',
                errorMessage: 'Please select your occupation.'
            }
        },
        fName: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid First Name',
                errorMessage: 'Please enter your first name.'
            }
        },
        lName: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid Last Name',
                errorMessage: 'Please enter your last name.'
            }
        },
        cName: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid Company Name',
                errorMessage: 'Please enter your Company name.'
            }
        },
        pepCountry: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid Country',
                errorMessage: 'Please select your Country.'
            }
        },
        pepPostalCode: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid Postal code',
                errorMessage: 'Please enter your postal code.'
            }
        },
        pepAddress1: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid Address',
                errorMessage: 'Please enter your Address1.'
            }
        },
        pepAddress2: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid Address',
                errorMessage: 'Please enter your Address2.'
            }
        },

        pepUnitNo: {
            required: {
                // tslint:disable-next-line:no-duplicate-string
                errorTitle: 'Invalid Unit No',
                errorMessage: 'Please enter your Unit no.'
            }
        },
    };

}
