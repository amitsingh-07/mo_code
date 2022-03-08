export class LoginFormError {
    formFieldErrors: object = {
        errorTitle: 'Error !',
        loginUsername: {
                required : {
                        errorTitle: 'Mobile No. or Email Address required',
                        errorMessage: 'Please enter your Mobile No. or Email Address'
                },
                pattern : {
                        errorTitle: 'Invalid Mobile No. or Email Address',
                        errorMessage: 'Please enter your valid username'
                }
        },
        loginPassword: {
                required : {
                        // tslint:disable-next-line:no-duplicate-string
                        errorTitle: 'Password required',
                        // tslint:disable-next-line:no-duplicate-string
                        errorMessage: 'Please enter your Password'
                }
        },
        accessCode: {
                required: {
                        // tslint:disable-next-line:no-duplicate-string
                        errorTitle: 'Access Code required',
                        // tslint:disable-next-line:no-duplicate-string
                        errorMessage: 'Please enter your Access Code'
                }
        },
        organisationCode: {
                required: {
                        errorTitle: 'Organization Name required',
                        errorMessage: 'Please enter your Organization Name'
                }
        },
        captchaValue: {
                required : {
                        errorTitle: 'Invalid captcha',
                        errorMessage: 'Please enter valid captcha'
                }
        }
    };
}
