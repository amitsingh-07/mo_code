import {
  ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { RecaptchaComponent } from 'ng-recaptcha';

import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { ConfigService, IConfig } from '../../config/config.service';
import { FooterService } from '../../shared/footer/footer.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { ModelWithButtonComponent } from '../../shared/modal/model-with-button/model-with-button.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { appConstants } from './../../app.constants';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordComponent implements OnInit {

  private distribution: any;
  emailNotFoundTitle: any;
  emailNotFoundDesc: any;
  forgotPasswordForm: FormGroup;
  formValues: any;
  countryCodeOptions;
  heighlightMobileNumber;
  buttonTitle;
  emailResend: string;
  finlitEnabled = false;
  organisationEnabled = false;
  isCorpBiz: boolean = false;
  @ViewChild('reCaptchaRef') reCaptchaRef: RecaptchaComponent;

  constructor(
    // tslint:disable-next-line
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    private configService: ConfigService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private authService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef) {
    this.translate.use('en');
    this.route.params.subscribe((params) => {
      this.heighlightMobileNumber = params.heighlightMobileNumber;
    });
    this.isCorpBiz = this.route.snapshot.queryParams.isCorpBiz;
    this.translate.get('COMMON').subscribe((result: string) => {
      this.emailNotFoundTitle = this.translate.instant('FORGOTPASSWORD.EMAIL_NOT_FOUND');
      this.emailNotFoundDesc = this.translate.instant('FORGOTPASSWORD.EMAIL_NOT_FOUND_DESC');
      this.buttonTitle = this.translate.instant('COMMON.TRY_AGAIN');
      this.emailResend = this.translate.instant('FORGOTPASSWORD.EMAIL_RESEND');
    });
    if (!this.authService.isAuthenticated()) {
      this.authService.authenticate().subscribe((token) => {
      });
    }
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.distribution = config.distribution;
    });
    if (this.route.snapshot.data[0]) {
      this.finlitEnabled = this.route.snapshot.data[0]['finlitEnabled'];
      this.organisationEnabled = this.route.snapshot.data[0]['organisationEnabled'];
    }
  }

  ngOnInit() {
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(101);
    this.footerService.setFooterVisibility(false);
    this.buildForgotPasswordForm();
  }

  buildForgotPasswordForm() {
    this.formValues = this.signUpService.getForgotPasswordInfo();
    if (this.distribution) {
      if (this.distribution.login) {
        this.forgotPasswordForm = this.formBuilder.group({
          email: [this.formValues.email, [Validators.required, Validators.pattern(this.distribution.login.regex)]]
        });
        return false;
      }
    }
    this.forgotPasswordForm = this.formBuilder.group({
      email: [this.formValues.email, [Validators.required, Validators.email, Validators.pattern(RegexConstants.Email)]],
      profileType: [this.organisationEnabled ? appConstants.USERTYPE.CORPORATE : appConstants.USERTYPE.PUBLIC]
    });
    return true;
  }

  save(reCaptchaToken, form: any) {
    this.authService.setReCaptchaResponse(reCaptchaToken);
    this.signUpService.setForgotPasswordInfo(form.value.email, form.value.profileType).subscribe((data) => {
      // tslint:disable-next-line:triple-equals
      if (data.responseMessage.responseCode == 6004) {
        const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
        ref.componentInstance.errorTitle = this.emailNotFoundTitle;
        ref.componentInstance.errorMessage = this.emailNotFoundDesc;
        ref.componentInstance.primaryActionLabel = this.buttonTitle;
        // tslint:disable-next-line:triple-equals
      } else if (data.responseMessage.responseCode == 6000) {
        if (this.authService.isSignedUser()) {
          this.navbarService.logoutUser();
        }
        if(this.organisationEnabled) {            
          this.router.navigate([SIGN_UP_ROUTE_PATHS.CORP_FORGOT_PASSWORD_RESULT]);
        } else {
          this.router.navigate([SIGN_UP_ROUTE_PATHS.FORGOT_PASSWORD_RESULT]);
        }
      } else if (data.responseMessage.responseCode === 5012) {
        this.signUpApiService.resendEmailVerification(form.value.email, true).subscribe((data) => {
          if (data.responseMessage.responseCode === 6007) {
            const ref = this.modal.open(ErrorModalComponent, { centered: true });
            ref.componentInstance.errorMessage = this.emailResend;
          }
        });
      } else if (data.responseMessage.responseCode === 5014) {
        this.signUpService.setCustomerRef(data.objectList[0].customerRef);
        this.signUpService.setUserMobileNo(data.objectList[0].mobileNumber);
        // setting from_login_page flag as true to enable verify mobile OTP flow
        // While navigating from forgot password page
        this.signUpService.setFromLoginPage();
        this.showErrorModal(this.translate.instant('SIGNUP_ERRORS.TITLE'),
          this.translate.instant('SIGNUP_ERRORS.VERIFY_MOBILE_OTP'),
          this.translate.instant('COMMON.VERIFY_NOW'),
          (this.finlitEnabled && SIGN_UP_ROUTE_PATHS.FINLIT_VERIFY_MOBILE) || 
          (this.organisationEnabled && SIGN_UP_ROUTE_PATHS.CORPORATE_VERIFY_MOBILE) ||
          SIGN_UP_ROUTE_PATHS.VERIFY_MOBILE,
          false);
      } else {
        const ref = this.modal.open(ErrorModalComponent, { centered: true });
        ref.componentInstance.errorMessage = data.responseMessage.responseDescription;
      }
    });
  }
  goBack() {
    this.navbarService.goBack();
  }

  showErrorModal(title: string, message: string, buttonLabel: string, redirect: string, emailResend: boolean) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorMessage = message;
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.buttonLabel = buttonLabel;
    ref.result.then((data) => {
      if (!data && redirect) {
        this.router.navigate([redirect]);
      }
    });
  }

  validateRecaptcha(form) {
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      const error = this.signUpService.currentFormError(form);
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = error.errorTitle;
      ref.componentInstance.errorMessage = error.errorMessage;
      return false;
    } else {
    this.reCaptchaRef.execute();
    }
  }
}
