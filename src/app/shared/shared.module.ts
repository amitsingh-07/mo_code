import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { CommonModule, UpperCasePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { RoadmapComponent } from '../shared/components/roadmap/roadmap.component';
import { PercentageInputDirective } from '../shared/directives/percentage-input.directive';
import { CarouselModalComponent } from '../shared/modal/carousel-modal/carousel-modal.component';
import {
  EditInvestmentModalComponent
} from '../shared/modal/edit-investment-modal/edit-investment-modal.component';
import {
  ReviewBuyRequestModalComponent
} from '../shared/modal/review-buy-request-modal/review-buy-request-modal.component';
import { TimeAgoPipe } from '../shared/Pipes/time-ago.pipe';
import { AllocationComponent } from './components/allocation/allocation.component';
import { AnnualFeesComponent } from './components/annual-fees/annual-fees.component';
import { DisclosuresComponent } from './components/disclosures/disclosures.component';
import {
  InvestmentTitleBarComponent
} from './components/investment-title-bar/investment-title-bar.component';
import { LoaderComponent } from './components/loader/loader.component';
import { PortfolioInfoComponent } from './components/portfolio-info/portfolio-info.component';
import { PortfolioListComponent } from './components/portfolio-list/portfolio-list.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { StepIndicatorComponent } from './components/step-indicator/step-indicator.component';
import { TermsOfUseComponent } from './components/terms-of-use/terms-of-use.component';
import { TermsComponent } from './components/terms/terms.component';
import { WillDisclaimerComponent } from './components/will-disclaimer/will-disclaimer.component';
import { CurrencyInputDirective } from './directives/currency-input.directive';
import { DistributePercentDirective } from './directives/distribute-percent.directive';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { DropdownWithSearchComponent } from './dropdown-with-search/dropdown-with-search.component';
import {
  InstructionStepsComponent
} from './modal/bank-details/instruction-steps/instruction-steps.component';
import {
  ConfirmationModalComponent
} from './modal/confirmation-modal/confirmation-modal.component';
import { EditMobileNumberComponent } from './modal/edit-mobile-number/edit-mobile-number.component';
import { IfastErrorModalComponent } from './modal/ifast-error-modal/ifast-error-modal.component';
import {
  ProgressTrackerModalComponent
} from './modal/progress-tracker/progress-tracker-modal.component';
import { ProgressTrackerComponent } from './modal/progress-tracker/progress-tracker.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { ProgressTrackerService } from './modal/progress-tracker/progress-tracker.service';
import {
  RecommendationsModalComponent
} from './modal/recommendations-modal/recommendations-modal.component';
import { TermsModalComponent } from './modal/terms-modal/terms-modal.component';
import {
  TransferInstructionsModalComponent
} from './modal/transfer-instructions-modal/transfer-instructions-modal.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FormatDatePipe } from './Pipes/date-format.pipe';
import { FormatCurrencyPipe } from './Pipes/format-currency.pipe';
import { FormatCurrencyPipe4dp } from './Pipes/format-currency-4dp.pipe';
import { GroupByPipe } from './Pipes/group-by.pipe';
import { OrderByPipe } from './Pipes/order-by.pipe';
import { PlanFilterPipe } from './Pipes/plan-filter.pipe';
import { RoundPipe } from './Pipes/round.pipe';
import { SecurePipe } from './Pipes/secure.pipe';
import { TruncatePipe } from './Pipes/truncate.pipe';
import { StartsWithPipe } from './utils/starts-with.pipe';
import {
  PlanDetailsWidgetComponent
} from './widgets/plan-details-widget/plan-details-widget.component';
import { PlanWidgetComponent } from './widgets/plan-widget/plan-widget.component';
import { SettingsWidgetComponent } from './widgets/settings-widget/settings-widget.component';
import { NotesComponent } from './components/notes/notes.component';
import { CapsLockInputDirective } from './directives/caps-lock-input.directive';
import { CopyClipboardDirective } from './directives/copy-clipboard.directive';
import { WiseIncomePayoutTypeComponent } from './components/wise-income-payout-type/wise-income-payout-type.component';
import { WiseIncomeFundComponent } from './components/wise-income-fund/wise-income-fund.component';
import { ReferralRewardDetailsComponent } from './components/referral-reward-details/referral-reward-details.component';
import { BankDetailsComponent } from './components/bank-details/bank-details.component';
import { UploadDocComponent } from './components/upload-document/upload-document.component';
import { CurrencyEditorPipe } from './Pipes/currency-editor.pipe';
import { MyinfoModalComponent } from './modal/myinfo-modal/myinfo-modal.component';
import { CustomRadioControllerComponent } from './components/custom-radio-controller/custom-radio-controller.component';
import { UploadDocumentOptionsComponent } from './components/upload-document-options/upload-document-options.component';
import { RECAPTCHA_SETTINGS, RecaptchaModule, RecaptchaSettings } from 'ng-recaptcha';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(
    http,
    [
      { prefix: './assets/i18n/app/', suffix: '.json' }
    ]);
}

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    FormsModule,
    ReactiveFormsModule,
    SlickCarouselModule,
    RecaptchaModule
  ],
  exports: [
    CurrencyInputDirective,
    PercentageInputDirective,
    CapsLockInputDirective,
    PlanWidgetComponent,
    StepIndicatorComponent,
    SettingsWidgetComponent,
    PlanFilterPipe,
    OrderByPipe,
    ProductDetailComponent,
    PlanDetailsWidgetComponent,
    LoaderComponent,
    TruncatePipe,
    TimeAgoPipe,
    FormatDatePipe,
    DistributePercentDirective,
    GroupByPipe,
    AllocationComponent,
    AnnualFeesComponent,
    PortfolioInfoComponent,
    NumberOnlyDirective,
    ProgressTrackerModalComponent,
    InvestmentTitleBarComponent,
    RoundPipe,
    NavbarComponent,
    EditMobileNumberComponent,
    DropdownWithSearchComponent,
    StartsWithPipe,
    RoadmapComponent,
    SecurePipe,
    PortfolioListComponent,
    InstructionStepsComponent,
    FormatCurrencyPipe,
    FormatCurrencyPipe4dp,
    NotesComponent,
    CopyClipboardDirective,
    SpinnerComponent,
    WiseIncomePayoutTypeComponent,
    WiseIncomeFundComponent,
    ReferralRewardDetailsComponent,
    BankDetailsComponent,    
    UploadDocComponent,
    CurrencyEditorPipe,
    MyinfoModalComponent,
    CustomRadioControllerComponent,
    UploadDocumentOptionsComponent,
    RecaptchaModule
  ],
  declarations: [
    CurrencyInputDirective,
    PlanWidgetComponent,
    StepIndicatorComponent,
    SettingsWidgetComponent,
    PlanFilterPipe,
    OrderByPipe,
    GroupByPipe,
    FormatDatePipe,
    RecommendationsModalComponent,
    ProductDetailComponent,
    PlanDetailsWidgetComponent,
    LoaderComponent,
    ConfirmationModalComponent,
    SpinnerComponent,
    PrivacyPolicyComponent,
    DisclosuresComponent,
    TermsComponent,
    WillDisclaimerComponent,
    TermsOfUseComponent,
    PercentageInputDirective,
    TruncatePipe,
    TimeAgoPipe,
    DistributePercentDirective,
    AllocationComponent,
    AnnualFeesComponent,
    PortfolioInfoComponent,
    EditInvestmentModalComponent,
    NumberOnlyDirective,
    ProgressTrackerComponent,
    ProgressTrackerModalComponent,
    IfastErrorModalComponent,
    InvestmentTitleBarComponent,
    RoundPipe,
    NavbarComponent,
    RoadmapComponent,
    EditMobileNumberComponent,
    TransferInstructionsModalComponent,
    InstructionStepsComponent,
    DropdownWithSearchComponent,
    StartsWithPipe,
    TermsModalComponent,
    SecurePipe,
    PortfolioListComponent,
    CarouselModalComponent,
    ReviewBuyRequestModalComponent,
    FormatCurrencyPipe,
    FormatCurrencyPipe4dp,
    NotesComponent,
    CapsLockInputDirective,
    CopyClipboardDirective,
    WiseIncomePayoutTypeComponent,
    WiseIncomeFundComponent,
    ReferralRewardDetailsComponent,
    BankDetailsComponent,    
    UploadDocComponent, CurrencyEditorPipe,
    MyinfoModalComponent,
    CustomRadioControllerComponent,
    UploadDocumentOptionsComponent
  ],
  entryComponents: [
    EditInvestmentModalComponent,
    ProgressTrackerModalComponent,
    IfastErrorModalComponent,
    TransferInstructionsModalComponent,
    InstructionStepsComponent,
    CarouselModalComponent,
    ReviewBuyRequestModalComponent
  ],
  providers: [ProgressTrackerService, RoundPipe, UpperCasePipe, LowerCasePipe, TitleCasePipe,
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: "6LdXrh8mAAAAAE7OLrKaKIGETLeqfdv_9U5uFJ0J" } as RecaptchaSettings
    }
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [ProgressTrackerService]
    };
  }
}
