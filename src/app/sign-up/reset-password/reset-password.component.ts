import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { APP_ROUTES } from './../../app-routes.constants';
import { FooterService } from './../../shared/footer/footer.service';
import { CustomErrorHandlerService } from './../../shared/http/custom-error-handler.service';
import { ValidatePassword } from '../create-account/password.validator';
import { appConstants } from './../../app.constants';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  formValues: any;
  queryParams;
  token;

  passwordFocus = false;
  confirmPwdFocus = false;
  isPasswordValid = true;

  submitted: boolean = false;
  organisationEnabled = false;

  constructor(
    // tslint:disable-next-line
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    public authService: AuthenticationService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private translate: TranslateService, private errorHandler: CustomErrorHandlerService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
    });
    if (this.route.snapshot.data[0]) {
      this.organisationEnabled = this.route.snapshot.data[0]['organisationEnabled'];
    }
  }

  get reset() { return this.resetPasswordForm.controls; }

  buildResetPasswordForm() {
    this.resetPasswordForm = this.formBuilder.group({
      // tslint:disable-next-line:max-line-length
      resetPassword: ['', [Validators.required, ValidatePassword]],
      // tslint:disable-next-line:max-line-length
      resetConfirmPassword: [''],
      profileType: [this.organisationEnabled ? appConstants.USERTYPE.CORPORATE : appConstants.USERTYPE.PUBLIC]
    }, { validator: this.validateMatchPassword() });
  }

  ngOnInit() {
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(101);
    this.navbarService.setNavbarMobileVisibility(false);
    this.navbarService.setNavbarShadowVisibility(false);
    this.footerService.setFooterVisibility(false);
    this.queryParams = this.route.snapshot.queryParams;
    this.buildResetPasswordForm();
    this.token = encodeURIComponent(this.queryParams.key);
    if (!this.token) {
      this.gotoHomePage(null);
    } else {
      this.authService.authenticate().subscribe(() => {
        this.signUpApiService.checkEmailValidity({ resetKey: `${this.token}` }).subscribe((data) => {
          if (data.responseMessage.responseCode < 6000) {
            this.gotoHomePage(data);
          }
        });
      });
    }
  }

  gotoHomePage(data) {
    this.router.navigate([APP_ROUTES.ROOT]);
    if (data !== null) {
      this.errorHandler.handleCustomError(data);
    }
  }

  showHidePassword(el) {
    if (el.type === 'password') {
      el.type = 'text';
    } else {
      el.type = 'password';
    }
  }

  save(form: any) {
    this.submitted = true;
    if (form.valid) {
      this.signUpApiService.resetPassword(form.value.resetPassword, this.token, form.value.profileType).subscribe((data) => {
        // tslint:disable-next-line:triple-equals
        if (data.responseMessage.responseCode == 6000) {
          // tslint:disable-next-line:max-line-length
          const redirectTo = this.organisationEnabled ? SIGN_UP_ROUTE_PATHS.CORP_SUCCESS_MESSAGE : SIGN_UP_ROUTE_PATHS.SUCCESS_MESSAGE;
          this.router.navigate([redirectTo], { queryParams: { buttonTitle: 'Login Now', redir: SIGN_UP_ROUTE_PATHS.LOGIN, Message: 'Password Successfully Reset!' }, fragment: 'loading' });
        }
      }).add(() => {
        this.submitted = false;
      });
    }
  }

  /**
   * validate confirm password.
   */
  private validateMatchPassword() {
    return (group: FormGroup) => {
      const passwordInput = group.controls['resetPassword'];
      const passwordConfirmationInput = group.controls['resetConfirmPassword'];

      // Confirm Password
      if (!passwordConfirmationInput.value) {
        passwordConfirmationInput.setErrors({ required: true });
      } else if (passwordInput.value !== passwordConfirmationInput.value) {
        passwordConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        passwordConfirmationInput.setErrors(null);
      }
    };
  }

  onPasswordInputChange() {
    if (this.resetPasswordForm.controls.resetPassword.errors && this.resetPasswordForm.controls.resetPassword.dirty
      && this.resetPasswordForm.controls.resetPassword.value) {
        this.isPasswordValid = false;
      } else if (!this.resetPasswordForm.controls.resetPassword.value.length) {
        this.isPasswordValid = true;
      } else {
        const _self = this;
        setTimeout(() => {
          _self.isPasswordValid = true;
        }, 500);
      }
  }

  showValidity(from) {
    if (from === 'resetConfirmPassword') {
      this.confirmPwdFocus = !this.confirmPwdFocus;
    } else {
      this.passwordFocus = !this.passwordFocus;
    }
  }
}
