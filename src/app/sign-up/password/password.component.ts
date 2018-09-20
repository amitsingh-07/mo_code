import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeaderService } from '../../shared/header/header.service';
import { APP_JWT_TOKEN_KEY } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpApiService } from './../sign-up.api.service';
import { SignUpService } from './../sign-up.service';
import { ValidatePassword } from './password.validator';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  passwordForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              public headerService: HeaderService,
              private modal: NgbModal,
              private selectedPlansService: SelectedPlansService,
              private signUpApiService: SignUpApiService,
              private signUpService: SignUpService,
              private router: Router,
              private translate: TranslateService) {
    this.translate.use('en');
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.CREATE_ACCOUNT]);
  }

  /**
   * Initialize tasks.
   */
  ngOnInit() {
    this.buildPasswordForm();
    this.headerService.setHeaderVisibility(false);
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
   * build password form.
   */
  buildPasswordForm() {
    this.passwordForm = this.formBuilder.group({
      password: ['', [ValidatePassword]],
      confirmPassword: [''],
    }, {validator: this.validateMatchPassword('password', 'confirmPassword')});
  }

  /**
   * validate confirm password.
   * @param password - password field.
   * @param confirmPassword - confirm password field.
   */
  private validateMatchPassword(password: string, confirmPassword: string) {
    return (group: FormGroup) => {
      const passwordInput = group.controls['password'];
      const passwordConfirmationInput = group.controls['confirmPassword'];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({notEquivalent: true});
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
  }

  /**
   * check validation.
   */
  save(form: any) {
    if (form.valid) {
      this.setPassword(form.value.password);
    }
    return false;
  }

  /**
   * create user account.
   */
  setPassword(pwd) {
    this.signUpApiService.setPassword(pwd).subscribe((data: any) => {
      if (data.responseMessage.responseCode === 6000) {
        this.signUpService.clearData();
        this.selectedPlansService.clearData();
        sessionStorage.removeItem(APP_JWT_TOKEN_KEY);
        this.router.navigate([SIGN_UP_ROUTE_PATHS.ACCOUNT_CREATED]);
      }
    });
  }

}