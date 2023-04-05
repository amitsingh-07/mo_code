import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountCreatedComponent } from './account-created/account-created.component';
import { AccountUpdatedComponent } from './account-updated/account-updated.component';
import { AddUpdateBankComponent } from './add-update-bank/add-update-bank.component';
import { AuthGuardService as AuthGuard, SingpassLoginGuard } from './auth-guard.service';
import { FinlitLoggedUserService as FinlitLoggedUserGuard } from './auth-guard.service';
import { LoggedUserService as LoggedUserGuard } from './auth-guard.service';
import { FacebookLoggedUserService as FacebookLoggedUserGuard } from './auth-guard.service';
import { CorpbizAuthGuardService as CorpbizAuthGuard } from './auth-guard.service';
import { CorpbizWelcomeFlowAuthGuardService as UpgradeAuthGuard  } from './auth-guard.service';
import { CreateAccountComponent } from './create-account/create-account.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditPasswordComponent } from './edit-password/edit-password.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import {
  EditResidentialAddressComponent
} from './edit-residential-address/edit-residential-address.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import {
  ForgotPasswordResultComponent
} from './forgot-password-result/forgot-password-result.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { PreLoginComponent } from './pre-login/pre-login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignUpAccessGuard, SignUpCorporateAccessGuard } from './sign-up-access-guard';
import { SIGN_UP_ROUTES } from './sign-up.routes.constants';
import { SIGN_UP_CONFIG } from './sign-up.constant';
import { SuccessMessageComponent } from './success-message/success-message.component';
import { UpdateUserIdComponent } from './update-user-id/update-user-id.component';
import { VerifyMobileComponent } from './verify-mobile/verify-mobile.component';
import {
  ViewAllNotificationsComponent
} from './view-all-notifications/view-all-notifications.component';

import { AddUpdateSrsComponent } from './add-update-srs/add-update-srs.component';
import { TwoFactorAuthGuardService, TwoFactorScreenGuardService } from './two-factor-auth-guard.service';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { CreateAccountMyinfoComponent } from './create-account-myinfo/create-account-myinfo.component';
import { ReferAFriendComponent } from './refer-a-friend/refer-a-friend.component';
import { ReferalRedirectingPartComponent } from './referal-redirecting-part/referal-redirecting-part.component';
import { ManageProfileComponent } from './manage-profile/manage-profile.component';
import { AddUpdateCpfiaComponent } from './add-update-cpfia/add-update-cpfia.component';
import { CorpBizSignupComponent } from './corp-biz-signup/corp-biz-signup.component';
import { CorpBizSignupWithDataComponent } from './corp-biz-signup-with-data/corp-biz-signup-with-data.component';
import { CorpBizActivationLinkComponent } from './corp-biz-activation-link/corp-biz-activation-link.component';
import { CorpbizUpgradeScreenComponent } from './corpbiz-upgrade-screen/corpbiz-upgrade-screen.component';

const routes: Routes = [
  {
    path: SIGN_UP_ROUTES.ROOT,
    pathMatch: 'full',
    redirectTo: SIGN_UP_ROUTES.CREATE_ACCOUNT_MY_INFO
  },
  {
    path: SIGN_UP_ROUTES.PRELOGIN,
    component: PreLoginComponent
  },
  {
    path: SIGN_UP_ROUTES.CREATE_ACCOUNT,
    component: CreateAccountComponent,
    canActivate: [LoggedUserGuard]
  },
  {
    path: SIGN_UP_ROUTES.VERIFY_MOBILE,
    component: VerifyMobileComponent,
    canActivate: [SignUpAccessGuard]
  },
  {
    path: SIGN_UP_ROUTES.FINLIT_VERIFY_MOBILE,
    component: VerifyMobileComponent,
    canActivate: [SignUpAccessGuard, FinlitLoggedUserGuard],
    data: [{ finlitEnabled: SIGN_UP_CONFIG.LOGIN.FINLIT_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.CORPORATE_VERIFY_MOBILE,
    component: VerifyMobileComponent,
    canActivate: [SignUpCorporateAccessGuard, FacebookLoggedUserGuard],
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.CORPBIZ_VERIFY_MOBILE,
    component: VerifyMobileComponent,
    canActivate: [CorpbizAuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.TWOFA_MOBILE,
    component: VerifyMobileComponent,
    canActivate: [TwoFactorScreenGuardService],
    data: [{ twoFactorEnabled: SIGN_UP_CONFIG.VERIFY_MOBILE.TWO_FA }]
  },
  {
    path: SIGN_UP_ROUTES.ACCOUNT_CREATED_FINLIT,
    component: AccountCreatedComponent,
    canActivate: [FinlitLoggedUserGuard],
    data: [{ finlitEnabled: SIGN_UP_CONFIG.LOGIN.FINLIT_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.ACCOUNT_CREATED_CORPORATE,
    component: AccountCreatedComponent,
    canActivate: [FacebookLoggedUserGuard],
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.ACCOUNT_CREATED_CORPBIZ,
    component: AccountCreatedComponent
  },
  {
    path: SIGN_UP_ROUTES.ACCOUNT_CREATED,
    component: AccountCreatedComponent
  },
  {
    path: SIGN_UP_ROUTES.EMAIL_VERIFIED,
    component: EmailVerificationComponent
  },
  {
    path: SIGN_UP_ROUTES.CORP_EMAIL_VERIFIED,
    component: EmailVerificationComponent,
    canActivate: [FacebookLoggedUserGuard],
  },
  {
    path: SIGN_UP_ROUTES.CORPBIZ_EMAIL_VERIFIED,
    component: EmailVerificationComponent,
  },
  {
    path: SIGN_UP_ROUTES.LOGIN,
    component: LoginComponent,
    canActivate: [SingpassLoginGuard],
    runGuardsAndResolvers: 'pathParamsOrQueryParamsChange'
  },
  {
    path: SIGN_UP_ROUTES.CORPORATE_LOGIN,
    component: LoginComponent,
    canActivate: [FacebookLoggedUserGuard],
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.FORGOT_PASSWORD,
    component: ForgotPasswordComponent
  },
  {
    path: SIGN_UP_ROUTES.FORGOT_PASSWORD_CORPORATE,
    component: ForgotPasswordComponent,
    canActivate: [FacebookLoggedUserGuard],
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.FORGOT_PASSWORD_RESULT,
    component: ForgotPasswordResultComponent
  },
  {
    path: SIGN_UP_ROUTES.CORP_FORGOT_PASSWORD_RESULT,
    component: ForgotPasswordResultComponent,
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.VERIFY_EMAIL_RESULT,
    component: ForgotPasswordResultComponent,
    data: [{ verifyEmail: true }]
  },
  {
    path: SIGN_UP_ROUTES.RESET_PASSWORD,
    component: ResetPasswordComponent
  },
  {
    path: SIGN_UP_ROUTES.CORPORATE_RESET_PASSWORD,
    component: ResetPasswordComponent,
    canActivate: [FacebookLoggedUserGuard],
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.CORP_SUCCESS_MESSAGE,
    component: SuccessMessageComponent,
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.SUCCESS_MESSAGE,
    component: SuccessMessageComponent
  },
  {
    path: SIGN_UP_ROUTES.DASHBOARD,
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.PRELOGIN,
    component: PreLoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.EDIT_PROFILE,
    component: EditProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.EDIT_PASSWORD,
    component: EditPasswordComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.EDIT_RESIDENTIAL,
    component: EditResidentialAddressComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.UPDATE_USER_DETAILS + '/:editType',
    component: UpdateUserIdComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.ACCOUNT_UPDATED,
    component: AccountUpdatedComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.VIEW_ALL_NOTIFICATIONS,
    component: ViewAllNotificationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.UPDATE_BANK,
    component: AddUpdateBankComponent,
    canActivate: [AuthGuard, TwoFactorAuthGuardService]
  },
  {
    path: SIGN_UP_ROUTES.UPDATE_SRS,
    component: AddUpdateSrsComponent,
    canActivate: [AuthGuard, TwoFactorAuthGuardService]
  },
  {
    path: SIGN_UP_ROUTES.FINLIT_LOGIN,
    component: LoginComponent,
    canActivate: [FinlitLoggedUserGuard],
    data: [{ finlitEnabled: SIGN_UP_CONFIG.LOGIN.FINLIT_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.FINLIT_CREATE_ACCOUNT,
    component: CreateAccountComponent,
    canActivate: [FinlitLoggedUserGuard],
    data: [{ finlitEnabled: SIGN_UP_CONFIG.LOGIN.FINLIT_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.CORPORATE_CREATE_ACCOUNT,
    component: CreateAccountComponent,
    canActivate: [FacebookLoggedUserGuard],
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.VERIFY_EMAIL,
    component: VerifyEmailComponent
  },
  {
    path: SIGN_UP_ROUTES.CREATE_ACCOUNT_MY_INFO,
    component: CreateAccountMyinfoComponent
  },
  {
    path: SIGN_UP_ROUTES.CREATE_ACCOUNT + '/:referralCode',
    component: CreateAccountComponent,
    canActivate: [LoggedUserGuard]
  },
  {
    path: SIGN_UP_ROUTES.FINLIT_CREATE_ACCOUNT_MY_INFO,
    component: CreateAccountMyinfoComponent,
    canActivate: [FinlitLoggedUserGuard],
    data: [{ finlitEnabled: SIGN_UP_CONFIG.LOGIN.FINLIT_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.CORPORATE_CREATE_ACCOUNT_MY_INFO,
    component: CreateAccountMyinfoComponent,
    canActivate: [FacebookLoggedUserGuard],
    data: [{ organisationEnabled: SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN }]
  }, 
  {
    path: SIGN_UP_ROUTES.FINLIT_CREATE_ACCOUNT + '/:referralCode',
    component: CreateAccountComponent,
    canActivate: [FinlitLoggedUserGuard],
    data: [{ finlitEnabled: SIGN_UP_CONFIG.LOGIN.FINLIT_LOGIN }]
  },
  {
    path: SIGN_UP_ROUTES.REFER_FRIEND,
    component: ReferAFriendComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.REFER_REDIRECT + '/:term',
    component: ReferalRedirectingPartComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.MANAGE_PROFILE,
    component: ManageProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.UPDATE_CPFIA,
    component: AddUpdateCpfiaComponent,
    canActivate: [AuthGuard, TwoFactorAuthGuardService]
  },
  {
    path: SIGN_UP_ROUTES.CORP_BIZ_SIGNUP,
    component: CorpBizSignupComponent,
    canActivate: [CorpbizAuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.CORP_BIZ_SIGNUP_DATA,
    component: CorpBizSignupWithDataComponent
  },
  {
    path: SIGN_UP_ROUTES.CORPBIZ_CREATE_ACCOUNT,
    component: CreateAccountComponent,
    canActivate: [CorpbizAuthGuard]
  },
  {
    path: SIGN_UP_ROUTES.CORP_BIZ_ACTIVATIONLINK,
    component: CorpBizActivationLinkComponent
  },
  {
    path: SIGN_UP_ROUTES.CORP_BIZ_UPGRADE_SCREEN,
    component: CorpbizUpgradeScreenComponent,
    canActivate: [UpgradeAuthGuard]
  },
  { path: '**', redirectTo: '/page-not-found' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignUpRoutingModule { }
