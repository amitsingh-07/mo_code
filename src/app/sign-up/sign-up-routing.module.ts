import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountCreatedComponent } from './account-created/account-created.component';
import { AuthGuardService as AuthGuard } from './auth-guard.service';
import { CreateAccountComponent } from './create-account/create-account.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { ForgotPasswordResultComponent } from './forgot-password-result/forgot-password-result.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './password/password.component';
import { PostLoginComponent } from './post-login/post-login.component';
import { PreLoginComponent } from './pre-login/pre-login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignUpAccessGuard } from './sign-up-access-guard';
import { SIGN_UP_ROUTES } from './sign-up.routes.constants';
import { SuccessMessageComponent } from './success-message/success-message.component';
import { VerifyMobileComponent } from './verify-mobile/verify-mobile.component';

const routes: Routes = [
  {
    path: SIGN_UP_ROUTES.ROOT,
    pathMatch: 'full',
    redirectTo: SIGN_UP_ROUTES.CREATE_ACCOUNT
  },
  {
    path: SIGN_UP_ROUTES.CREATE_ACCOUNT,
    component: CreateAccountComponent
  },
  { path: SIGN_UP_ROUTES.VERIFY_MOBILE,
    component: VerifyMobileComponent,
    canActivate: [SignUpAccessGuard]
  },
  { path: SIGN_UP_ROUTES.PASSWORD,
    component: PasswordComponent,
    canActivate: [SignUpAccessGuard]
  },
  { path: SIGN_UP_ROUTES.ACCOUNT_CREATED,
    component: AccountCreatedComponent
  },
  { path: SIGN_UP_ROUTES.EMAIL_VERIFIED,
    component: EmailVerificationComponent
  },
  { path: SIGN_UP_ROUTES.LOGIN,
    component: LoginComponent
  },
  /*
  { path: SIGN_UP_ROUTES.FORGOT_PASSWORD,
    component: ForgotPasswordComponent
  },
  { path: SIGN_UP_ROUTES.FORGOT_PASSWORD_RESULT,
    component: ForgotPasswordResultComponent
  },
  { path: SIGN_UP_ROUTES.RESET_PASSWORD,
    component: ResetPasswordComponent
  },
  { path: SIGN_UP_ROUTES.SUCCESS_MESSAGE,
    component: SuccessMessageComponent
  },
  */
  { path: SIGN_UP_ROUTES.DASHBOARD,
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { path: SIGN_UP_ROUTES.POSTLOGIN,
    component: PostLoginComponent
  },
  { path: SIGN_UP_ROUTES.PRELOGIN,
    component: PreLoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignUpRoutingModule { }
