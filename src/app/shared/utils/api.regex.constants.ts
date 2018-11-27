export const RegexConstants = {
    OnlyAlpha: /^[a-zA-Z\s]{2,40}$/, // Only alpha values with space
    Alphanumeric: /^[a-zA-Z0-9]*$/,
    CharactersLimit: /\w{10,15}/, // Characters length should be 10 to 15
    OnlyNumeric: /[^0-9]/g, // Only numeric values
    OTP: /(?:[0-9])/,
    Password: {
        Full: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,20}$/,
        length: /^.{8,20}$/, // Characters length should be 8 to 20
        UpperLower: /^(?=.*[a-z])(?=.*[A-Z])/, // Should have atleast one lower case and one upper case
        NumberSymbol: /^(?=.*\d)(?=.*[$@$!%*?&])/ // Should have atleast one number and one speacial symbol
    },
    EmailOrMobile: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})|([0-9]{8,10})+$/,
    AlphanumericWithSpaces: /^[a-zA-Z0-9\s]*$/,
    SixDigitNumber: /^[0-9]{6}$/,
    SixDigitPromo: /^[a-zA-Z0-9]{6}$/,
    OnlyAlphaWithoutLimit: /^[a-zA-Z\s]*$/,
    NameWithSymbol: /^[a-zA-Z@-\s]{2,40}$/,
    UIN: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9}$/,
    ContactNumber: /^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$/,
    Email: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    NRIC: /^[STst][a-zA-Z0-9]{8}$/,
    SymbolNumber: /^[0-9*#+$@$!%?&]+$/,
    NumericOnly: /^[0-9]*$/,
    SymbolAlphabets: /^[a-zA-Z\s!@#~$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/
};
