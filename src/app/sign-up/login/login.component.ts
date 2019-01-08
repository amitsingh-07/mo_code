import { Location } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { WillWritingService } from '../../will-writing/will-writing.service';
import { AppService } from './../../app.service';
import { FooterService } from './../../shared/footer/footer.service';

import { WillWritingApiService } from 'src/app/will-writing/will-writing.api.service';
import {
  INVESTMENT_ACCOUNT_ROUTE_PATHS, INVESTMENT_ACCOUNT_ROUTES
} from '../../investment-account/investment-account-routes.constants';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { WILL_WRITING_ROUTE_PATHS } from '../../will-writing/will-writing-routes.constants';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { appConstants } from './../../app.constants';
import { LoginFormError } from './login-form-error';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private loginFormError: any = new LoginFormError();
  private pageTitle: string;
  private description: string;
  private duplicateError: string;

  loginForm: FormGroup;
  formValues: any;
  defaultCountryCode;
  countryCodeOptions;
  heighlightMobileNumber;
  captchaSrc: any = '';
  showCaptcha: boolean;
  hideForgotPassword = false;

  constructor(
    // tslint:disable-next-line
    private formBuilder: FormBuilder, private appService: AppService,
    private modal: NgbModal,
    public authService: AuthenticationService,
    private willWritingApiService: WillWritingApiService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private willWritingService: WillWritingService,
    private _location: Location,
    private translate: TranslateService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.duplicateError = this.translate.instant('COMMON.DUPLICATE_ERROR');
    });
    this.route.params.subscribe((params) => {
      this.heighlightMobileNumber = params.heighlightMobileNumber;
    });
  }

  /**
   * Initialize tasks.
   */
  ngOnInit() {
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(5);
    this.navbarService.setNavbarMobileVisibility(false);
    this.navbarService.setNavbarShadowVisibility(false);
    this.footerService.setFooterVisibility(false);
    this.buildLoginForm();
    if (!this.authService.isAuthenticated()) {
      this.authService.authenticate().subscribe((token) => {
      });
    }
  }

  ngAfterViewInit() {
    if (this.signUpService.getCaptchaShown()) {
      this.setCaptchaValidator();
    }
  }

  setCaptchaValidator() {
    this.showCaptcha = true;
    const captchaControl = this.loginForm.controls['captchaValue'];
    captchaControl.setValidators([Validators.required]);
    this.refreshCaptcha();
  }

  /**
   * show / hide password field.
   * @param el - selected element.
   */
  showHidePassword(el) {
    if (el.type === 'password') {
      el.type = 'text';
    } else {
      el.type = 'password';
    }
  }

  /**
   * build login form.
   */
  buildLoginForm() {
    this.formValues = this.signUpService.getLoginInfo();
    this.loginForm = this.formBuilder.group({
      loginUsername: [this.formValues.loginUsername, [Validators.required, Validators.pattern(RegexConstants.EmailOrMobile)]],
      loginPassword: [this.formValues.loginPassword, [Validators.required]],
      captchaValue: ['']
    });
  }

  /**
   * Show or hide inline error.
   * @param form - form control.
   */
  getInlineErrorStatus(control) {
    return (!control.pristine && !control.valid);
  }

  /**
   * login submit.
   * @param form - login form.
   */
  // tslint:disable-next-line:cognitive-complexity
  doLogin(form: any) {
    if (!form.valid) {
      this.markAllFieldsDirty(form);
      const error = this.currentFormError(form);
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = error.errorTitle;
      ref.componentInstance.errorMessage = error.errorMessage;
      return false;
    } else {
      this.signUpApiService.verifyLogin(this.loginForm.value.loginUsername, this.loginForm.value.loginPassword,
        this.loginForm.value.captchaValue).subscribe((data) => {
          if (data.responseMessage && data.responseMessage.responseCode >= 6000) {
            try {
              if (data.objectList[0].customerId) {
                this.appService.setCustomerId(data.objectList[0].customerId);
              }
            } catch (e) {
              console.log(e);
            }
            this.signUpApiService.getUserProfileInfo().subscribe((userInfo) => {
              this.signUpService.setUserProfileInfo(userInfo.objectList);
              const redirect_url = this.signUpService.getRedirectUrl();
              if (redirect_url) {
                this.signUpService.clearRedirectUrl();
                this.router.navigate([redirect_url]);
              } else if (this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_WILL_WRITING &&
                this.willWritingService.getExecTrusteeInfo().length > 0) {
                if (!this.willWritingService.getIsWillCreated()) {
                  this.willWritingApiService.createWill().subscribe((data) => {
                    if (data.responseMessage && data.responseMessage.responseCode >= 6000) {
                      this.willWritingService.setIsWillCreated(true);
                      this.router.navigate([WILL_WRITING_ROUTE_PATHS.VALIDATE_YOUR_WILL]);
                    } else if (data.responseMessage && data.responseMessage.responseCode === 5006) {
                      const ref = this.modal.open(ErrorModalComponent, { centered: true });
                      ref.componentInstance.errorTitle = '';
                      ref.componentInstance.errorMessage = this.duplicateError;
                    }
                  });
                } else {
                  this.router.navigate([WILL_WRITING_ROUTE_PATHS.VALIDATE_YOUR_WILL]);
                }
              } else {
                this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
              }
            });
            this.signUpService.removeCaptchaSessionId();
          } else if (data.responseMessage.responseCode === 5016) {
            this.loginForm.controls['captchaValue'].reset();
            this.loginForm.controls['loginPassword'].reset();
            this.openErrorModal(data.responseMessage.responseDescription);
            this.refreshCaptcha();
          } else {
            this.loginForm.controls['captchaValue'].reset();
            this.loginForm.controls['loginPassword'].reset();
            this.openErrorModal(data.responseMessage.responseDescription);
            if (data.objectList[0] && data.objectList[0].sessionId) {
              this.signUpService.setCaptchaSessionId(data.objectList[0].sessionId);
            } else if (data.objectList[0].attempt >= 3) {
              this.signUpService.setCaptchaShown();
              this.setCaptchaValidator();
            }
          }
        });
    }
  }

  openErrorModal(error) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorMessage = error;
    return false;
  }

  ngOnDestroy() {
    this.navbarService.unsubscribeBackPress();
  }

  markAllFieldsDirty(form) {
    Object.keys(form.controls).forEach((key) => {
      if (form.get(key).controls) {
        Object.keys(form.get(key).controls).forEach((nestedKey) => {
          form.get(key).controls[nestedKey].markAsDirty();
        });
      } else {
        form.get(key).markAsDirty();
      }
    });
  }

  currentFormError(form) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        return this.loginFormError.formFieldErrors[name][Object.keys(controls[name]['errors'])[0]];
      }
    }
  }

  goBack() {
    this._location.back();
  }

  refreshCaptcha() {
    this.captchaSrc = this.authService.getCaptchaUrl();
  }
}
