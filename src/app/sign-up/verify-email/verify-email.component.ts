import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { RecaptchaComponent } from 'ng-recaptcha';

import { ConfigService, IConfig } from '../../config/config.service';
import { FooterService } from '../../shared/footer/footer.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { ModelWithButtonComponent } from '../../shared/modal/model-with-button/model-with-button.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VerifyEmailComponent implements OnInit {

  private distribution: any;
  emailNotFoundTitle: any;
  emailNotFoundDesc: any;
  forgotPasswordForm: FormGroup;
  formValues: any;
  countryCodeOptions;
  heighlightMobileNumber;
  buttonTitle;
  emailResend: string;
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
      email: [this.formValues.email, [Validators.required, Validators.email, this.signUpService.emailDomainValidator(this.authService.isUserTypeCorporate)]]
    });
    return true;
  }

  save(reCaptchaToken, form: any) {
    if(reCaptchaToken){
      this.authService.setReCaptchaResponse(reCaptchaToken);
    } else {
      return false;
    }
    this.signUpService.setRestEmailInfo(form.value.email, this.signUpService.getEmail()).subscribe((data) => {
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
        this.router.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_EMAIL_RESULT]);
      } else if (data.responseMessage.responseCode === 5012) {
        this.signUpApiService.resendEmailVerification(form.value.email, true).subscribe((data) => {
          if (data.responseMessage.responseCode === 6007) {
            const ref = this.modal.open(ErrorModalComponent, { centered: true });
            ref.componentInstance.errorMessage = this.emailResend;
          }
        });
      } else {
        this.reCaptchaRef.reset();
        const ref = this.modal.open(ErrorModalComponent, { centered: true });
        ref.componentInstance.errorMessage = data.responseMessage.responseDescription;
      }
    });

  }

  goBack() {
    this.navbarService.goBack();
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
