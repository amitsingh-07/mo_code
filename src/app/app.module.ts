import 'hammerjs';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import {
  CurrencyPipe, LocationStrategy, PathLocationStrategy, TitleCasePipe
} from '@angular/common';
import {
  HTTP_INTERCEPTORS, HttpClient, HttpClientJsonpModule, HttpClientModule,
  HttpBackend, HttpXhrBackend
} from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { NativeHttpModule, NativeHttpBackend, NativeHttpFallback } from 'ionic-native-http-connection-backend';
import { Platform } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { appConstants } from './app.constants';
import { AppService } from './app.service';
import { CallBackComponent } from './call-back/call-back.component';
import { PendingChangesGuard } from './changes.guard';
import { HelpModalComponent } from './guide-me/help-modal/help-modal.component';
import {
  ExistingCoverageModalComponent
} from './guide-me/insurance-results/existing-coverage-modal/existing-coverage-modal.component';
import {
  RestrictAlphabetsDirective
} from './guide-me/insurance-results/existing-coverage-modal/restrict-alphabets.directive';
import {
  InsuranceResultModalComponent
} from './guide-me/insurance-results/insurance-result-modal/insurance-result-modal.component';
import {
  LifeProtectionModalComponent
} from './guide-me/life-protection/life-protection-form/life-protection-modal/life-protection-modal.component';
import { MobileModalComponent } from './guide-me/mobile-modal/mobile-modal.component';
import {
  CreateAccountModelComponent
} from './guide-me/recommendations/create-account-model/create-account-model.component';
import { HammerConfig } from './hammer.config';
import {
  FundDetailsComponent
} from './investment/investment-common/fund-details/fund-details.component';
import {
  InvestmentChildEnableGuard
} from './investment/investment-engagement-journey/investment-child-enable-guard';
import {
  InvestmentEnableGuard
} from './investment/investment-engagement-journey/investment-enable-guard';
import {
  RestrictAddPortfolioModalComponent
} from './investment/manage-investments/investment-overview/restrict-add-portfolio-modal/restrict-add-portfolio-modal.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TermsComponent } from './shared/components/terms/terms.component';
import {
  WillDisclaimerComponent
} from './shared/components/will-disclaimer/will-disclaimer.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { AuthenticationService } from './shared/http/auth/authentication.service';
import { JwtInterceptor } from './shared/http/auth/jwt.interceptor';
import { CustomErrorHandlerService } from './shared/http/custom-error-handler.service';
import { RequestCache } from './shared/http/http-cache.service';
import { ConsoleLoggerService } from './shared/logger/console-logger.service';
import { LoggerService } from './shared/logger/logger.service';
import { BankDetailsComponent } from './shared/modal/bank-details/bank-details.component';
import { ConfirmationModalComponent } from './shared/modal/confirmation-modal/confirmation-modal.component';
import { DefaultErrors } from './shared/modal/error-modal/default-errors';
import { ErrorModalComponent } from './shared/modal/error-modal/error-modal.component';
import { LoaderComponent } from './shared/modal/loader/loader.component';
import {
  ModelWithButtonComponent
} from './shared/modal/model-with-button/model-with-button.component';
import {
  PaymentInstructionModalComponent
} from './shared/modal/payment-instruction-modal/payment-instruction-modal.component';
import {
  RecommendationsModalComponent
} from './shared/modal/recommendations-modal/recommendations-modal.component';

import { onAppInit } from './app.initializer';
import { ComprehensiveChildEnableGuard } from './comprehensive/comprehensive-child-enable-guard';
import { ComprehensiveEnableGuard } from './comprehensive/comprehensive-enable-guard';
import { EmailEnquirySuccessComponent } from './email-enquiry-success/email-enquiry-success.component';
import { ExternalRouteGuard } from './external-route-guard';
import { InvestmentMaintenanceComponent } from './investment-maintenance/investment-maintenance.component';
import { PaymentChildEnableGuard } from './payment/payment-child-enable-guard';
import { PaymentEnableGuard } from './payment/payment-enable-guard';
import {
  LoginCreateAccountModelComponent
} from './shared/modal/login-create-account-model/login-create-account-model.component';
import { SummaryModalComponent } from './shared/modal/summary-modal/summary-modal.component';
import { TermsModalComponent } from './shared/modal/terms-modal/terms-modal.component';
import { ToolTipModalComponent } from './shared/modal/tooltip-modal/tooltip-modal.component';
import {
  UnsupportedDeviceModalComponent
} from './shared/modal/unsupported-device-modal/unsupported-device-modal.component';
import { NavbarService } from './shared/navbar/navbar.service';
import { RoutingService } from './shared/Services/routing.service';
import { StateStoreService } from './shared/Services/state-store.service';
import { SharedModule } from './shared/shared.module';
import { AboutAge } from './shared/utils/about-age.util';
import { FileUtil } from './shared/utils/file.util';
import { Formatter } from './shared/utils/formatter.util';
import { Util } from './shared/utils/util';
import {
  SettingsWidgetComponent
} from './shared/widgets/settings-widget/settings-widget.component';
import { SignUpService } from './sign-up/sign-up.service';
import { TestMyInfoComponent } from './test-my-info/test-my-info.component';
import { UrlRedirectComponent } from './url-redirect.component';
import { WillWritingChildEnableGuard } from './will-writing/will-writing-child-enable-guard';
import { WillWritingEnableGuard } from './will-writing/will-writing-enable-guard';
import { SessionsService } from './shared/Services/sessions/sessions.service';
import { NotSupportedComponent } from './not-supported/not-supported.component';
import { RefereeComponent } from './shared/modal/referee/referee.component';

// tslint:disable-next-line:max-line-length
export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(
    http,
    [
      { prefix: './assets/i18n/app/', suffix: '.json' }
    ]);
}

export function tokenGetterFn() {
  return sessionStorage.getItem(appConstants.APP_JWT_TOKEN_KEY);
}
// Fixed for Native Http Issue with blob/file type
export class FileReaderReplace extends window['FileReader'] {
  constructor() {
    super();
    const zoneOriginalInstance = (this as any)['__zone_symbol__originalInstance'];
    return zoneOriginalInstance || this;
  }
}
window.FileReader = FileReaderReplace;

@NgModule({
  declarations: [
    AppComponent,
    HelpModalComponent,
    MobileModalComponent,
    LoaderComponent,
    ErrorModalComponent,
    BankDetailsComponent,
    ToolTipModalComponent,
    ModelWithButtonComponent,
    RefereeComponent,
    LifeProtectionModalComponent,
    InsuranceResultModalComponent,
    CreateAccountModelComponent,
    LoginCreateAccountModelComponent,
    ExistingCoverageModalComponent,
    RestrictAlphabetsDirective,
    HeaderComponent,
    FooterComponent,
    CallBackComponent,
    UrlRedirectComponent,
    TestMyInfoComponent,
    FundDetailsComponent,
    UnsupportedDeviceModalComponent,
    SummaryModalComponent,
    NotFoundComponent,
    EmailEnquirySuccessComponent,
    RestrictAddPortfolioModalComponent,
    InvestmentMaintenanceComponent,
    PaymentInstructionModalComponent,
    NotSupportedComponent
  ],
  imports: [
    NativeHttpModule,
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    SharedModule.forRoot(),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetterFn
      }
    })
  ],
  providers: [
    {provide: HttpBackend, useClass: NativeHttpFallback, deps: [Platform, NativeHttpBackend, HttpXhrBackend]},
    {
      provide: APP_INITIALIZER,
      useFactory: onAppInit,
      multi: true,
      deps: [Injector]
    },
    NgbActiveModal,
    AuthenticationService, CustomErrorHandlerService, RequestCache,
    AppService, TitleCasePipe, PendingChangesGuard, DefaultErrors,
    { provide: LoggerService, useClass: ConsoleLoggerService },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
      deps: [AuthenticationService, RequestCache, CustomErrorHandlerService, Router, NavbarService, SessionsService]
    }, Formatter, CurrencyPipe, RoutingService,
    StateStoreService, Util, FileUtil,
    InvestmentEnableGuard,
    InvestmentChildEnableGuard,
    WillWritingEnableGuard,
    WillWritingChildEnableGuard,
    SignUpService,
    ComprehensiveEnableGuard,
    ComprehensiveChildEnableGuard,
    AboutAge,
    PaymentEnableGuard,
    PaymentChildEnableGuard,
    ExternalRouteGuard,
    DatePipe
  ],
  bootstrap: [AppComponent],
  entryComponents: [RefereeComponent,HelpModalComponent, LoaderComponent, ErrorModalComponent, BankDetailsComponent, ToolTipModalComponent, ModelWithButtonComponent,
    LifeProtectionModalComponent, MobileModalComponent, InsuranceResultModalComponent,
    CreateAccountModelComponent, ExistingCoverageModalComponent, RecommendationsModalComponent, TermsModalComponent,
    SettingsWidgetComponent, ConfirmationModalComponent, TermsComponent, WillDisclaimerComponent,
    FundDetailsComponent, UnsupportedDeviceModalComponent, RestrictAddPortfolioModalComponent,
    LoginCreateAccountModelComponent, SummaryModalComponent, PaymentInstructionModalComponent]
})

export class AppModule {
  /**
   * Allows for retrieving singletons using `AppModule.injector.get(MyService)`
   * This is good to prevent injecting the service as constructor parameter.
   */
  static injector: Injector;
  constructor(injector: Injector, routingService: RoutingService) {
    AppModule.injector = injector;
    routingService.loadRouting();
  }
}