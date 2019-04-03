import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { BreakdownAccordionComponent } from '../shared/components/breakdown-accordion/breakdown-accordion.component';
import { BreakdownBarComponent } from '../shared/components/breakdown-bar/breakdown-bar.component';
import { PercentageInputDirective } from '../shared/directives/percentage-input.directive';
import {
    EditInvestmentModalComponent
} from '../shared/modal/edit-investment-modal/edit-investment-modal.component';
import {
  IfastErrorModalComponent
} from '../shared/modal/ifast-error-modal/ifast-error-modal.component';
import { TimeAgoPipe } from '../shared/Pipes/time-ago.pipe';
import { AllocationComponent } from './components/allocation/allocation.component';
import { AnnualFeesComponent } from './components/annual-fees/annual-fees.component';
import { DisclosuresComponent } from './components/disclosures/disclosures.component';
import { FairDealingComponent } from './components/fair-dealing/fair-dealing.component';
import { LoaderComponent } from './components/loader/loader.component';
import { PortfolioInfoComponent } from './components/portfolio-info/portfolio-info.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { StepIndicatorComponent } from './components/step-indicator/step-indicator.component';
import { TermsOfUseComponent } from './components/terms-of-use/terms-of-use.component';
import { TermsComponent } from './components/terms/terms.component';
import { WillDisclaimerComponent } from './components/will-disclaimer/will-disclaimer.component';
import { CurrencyInputDirective } from './directives/currency-input.directive';
import { DistributePercentDirective } from './directives/distribute-percent.directive';
import { ConfirmationModalComponent } from './modal/confirmation-modal/confirmation-modal.component';
import { RecommendationsModalComponent } from './modal/recommendations-modal/recommendations-modal.component';
import { FormatDatePipe } from './Pipes/date-format.pipe';
import { GroupByPipe } from './Pipes/group-by.pipe';
import { OrderByPipe } from './Pipes/order-by.pipe';
import { PlanFilterPipe } from './Pipes/plan-filter.pipe';

import { TruncatePipe } from './Pipes/truncate.pipe';
import { PlanDetailsWidgetComponent } from './widgets/plan-details-widget/plan-details-widget.component';
import { PlanWidgetComponent } from './widgets/plan-widget/plan-widget.component';
import { SettingsWidgetComponent } from './widgets/settings-widget/settings-widget.component';

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
    NgbModule.forRoot(),
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [CurrencyInputDirective, PercentageInputDirective, PlanWidgetComponent, StepIndicatorComponent, SettingsWidgetComponent,
    PlanFilterPipe, OrderByPipe, ProductDetailComponent, PlanDetailsWidgetComponent, LoaderComponent,
    BreakdownBarComponent, BreakdownAccordionComponent, TruncatePipe, TimeAgoPipe, FormatDatePipe, DistributePercentDirective,
    GroupByPipe, AllocationComponent, AnnualFeesComponent, PortfolioInfoComponent],
  declarations: [CurrencyInputDirective, PlanWidgetComponent, StepIndicatorComponent, SettingsWidgetComponent, PlanFilterPipe,
    OrderByPipe, GroupByPipe, FormatDatePipe, RecommendationsModalComponent, ProductDetailComponent, PlanDetailsWidgetComponent,
    LoaderComponent, ConfirmationModalComponent,
    PrivacyPolicyComponent,
    FairDealingComponent,
    DisclosuresComponent,
    TermsComponent,
    WillDisclaimerComponent,
    TermsOfUseComponent,
    BreakdownBarComponent,
    BreakdownAccordionComponent,
    PercentageInputDirective,
    TruncatePipe,
    TimeAgoPipe,
    DistributePercentDirective,
    AllocationComponent,
    AnnualFeesComponent,
    PortfolioInfoComponent,
    EditInvestmentModalComponent,
    IfastErrorModalComponent
  ],
  entryComponents: [
    EditInvestmentModalComponent,
    IfastErrorModalComponent
  ]
})
export class SharedModule { }
