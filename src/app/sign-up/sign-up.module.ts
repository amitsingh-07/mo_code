import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgOtpInputModule } from 'ng-otp-input';
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { InputFocusDirective } from '../shared/directives/input-focus.directive';
import { SharedModule } from '../shared/shared.module';
import { ComprehensiveModule } from './../comprehensive/comprehensive.module';
import { AccountCreatedComponent } from './account-created/account-created.component';
import { AccountUpdatedComponent } from './account-updated/account-updated.component';
import { AddUpdateBankComponent } from './add-update-bank/add-update-bank.component';
import { AuthGuardService, SingpassLoginGuard } from './auth-guard.service';
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
import { SignUpRoutingModule } from './sign-up-routing.module';
import { SuccessMessageComponent } from './success-message/success-message.component';
import {
  TopBarWithClearButtonComponent
} from './top-bar-with-clear-button/top-bar-with-clear-button.component';
import { UpdateUserIdComponent } from './update-user-id/update-user-id.component';
import { VerifyMobileComponent } from './verify-mobile/verify-mobile.component';
import {
  ViewAllNotificationsComponent
} from './view-all-notifications/view-all-notifications.component';
import { EditMobileNumberComponent } from '../shared/modal/edit-mobile-number/edit-mobile-number.component';
import { AddUpdateSrsComponent } from './add-update-srs/add-update-srs.component';
import { TextMaskModule } from 'angular2-text-mask';
import { SrsSuccessModalComponent } from './add-update-srs/srs-success-modal/srs-success-modal.component';
import { TwoFactorAuthGuardService } from './two-factor-auth-guard.service';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ActivateSingpassModalComponent } from './edit-profile/activate-singpass-modal/activate-singpass-modal.component';
import { CreateAccountMyinfoComponent } from './create-account-myinfo/create-account-myinfo.component';
import { ReferAFriendComponent } from './refer-a-friend/refer-a-friend.component';
import { ReferalRedirectingPartComponent } from './referal-redirecting-part/referal-redirecting-part.component';
import { ManageProfileComponent } from './manage-profile/manage-profile.component';
import { AddUpdateCpfiaComponent } from './add-update-cpfia/add-update-cpfia.component';
import { CpfiaSuccessModalComponent } from './add-update-cpfia/cpfia-success-modal/cpfia-success-modal.component';
import { SingPassModule } from '../singpass/singpass.module';
import { CorpBizSignupComponent } from './corp-biz-signup/corp-biz-signup.component';
import { CorpBizSignupWithDataComponent } from './corp-biz-signup-with-data/corp-biz-signup-with-data.component';
import { CorpBizActivationLinkComponent } from './corp-biz-activation-link/corp-biz-activation-link.component';
import { LoginService } from './login.service';
import { InvestModalComponent } from './invest-modal/invest-modal.component';
import { RecommendedCardComponent } from './recommended-card/recommended-card.component';
import { RecommendedCardModalComponent } from './recommended-card-modal/recommended-card-modal.component';
import { CorpbizUpgradeScreenComponent } from './corpbiz-upgrade-screen/corpbiz-upgrade-screen.component';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(
    http,
    [
      { prefix: './assets/i18n/app/', suffix: '.json' },
      { prefix: './assets/i18n/sign-up/', suffix: '.json' },
      { prefix: './assets/i18n/error/', suffix: '.json' }
    ]);
}

@NgModule({
  imports: [
    CommonModule,
    SignUpRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    TextMaskModule,
    ComprehensiveModule,
    NgbModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    NgOtpInputModule,
    SingPassModule,
    SlickCarouselModule
  ],
  declarations: [
    AccountCreatedComponent,
    CreateAccountComponent,
    EmailVerificationComponent,
    VerifyMobileComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ForgotPasswordResultComponent,
    ResetPasswordComponent,
    SuccessMessageComponent,
    DashboardComponent,
    PreLoginComponent,
    InputFocusDirective,
    EditProfileComponent,
    EditPasswordComponent,
    EditResidentialAddressComponent,
    UpdateUserIdComponent,
    ViewAllNotificationsComponent,
    TopBarWithClearButtonComponent,
    AccountUpdatedComponent,
    AddUpdateBankComponent,
    AddUpdateSrsComponent,
    SrsSuccessModalComponent,
    VerifyEmailComponent,
    ActivateSingpassModalComponent,
    CreateAccountMyinfoComponent,
    ReferAFriendComponent,
    ReferalRedirectingPartComponent,
    ManageProfileComponent,
    AddUpdateCpfiaComponent,
    CpfiaSuccessModalComponent,
    CorpBizSignupComponent,
    CorpBizSignupWithDataComponent,
    CorpBizActivationLinkComponent,
    InvestModalComponent,
    RecommendedCardComponent,
    RecommendedCardModalComponent,
    CorpbizUpgradeScreenComponent
  ],
  providers: [SignUpAccessGuard, SignUpCorporateAccessGuard, AuthGuardService, TwoFactorAuthGuardService, SingpassLoginGuard, LoginService],
  entryComponents: [EditMobileNumberComponent, SrsSuccessModalComponent]
})
export class SignUpModule { }
