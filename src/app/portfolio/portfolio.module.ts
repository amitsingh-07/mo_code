import { HttpClient } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { NouisliderModule } from 'ng2-nouislider';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { CurrencyInputPortfolioDirective } from '../shared/directives/currency-input-p.directive';
import { PercentageInputDirective } from '../shared/directives/percentage-input.directive';
import { SharedModule } from '../shared/shared.module';
import { FundDetailsComponent } from './fund-details/fund-details.component';
import { GetStartedStep1Component } from './get-started-step1/get-started-step1.component';
import { GetStartedStep2Component } from './get-started-step2/get-started-step2.component';
import { IntroScreenComponent } from './intro-screen/intro-screen.component';
import { MyFinancialsComponent } from './my-financials/my-financials.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import {
    BreakdownAccordionComponent
} from './portfolio-recommendation/breakdown-accordion/breakdown-accordion.component';
import {
    BreakdownBarComponent
} from './portfolio-recommendation/breakdown-bar/breakdown-bar.component';
import {
    PortfolioRecommendationComponent
} from './portfolio-recommendation/portfolio-recommendation.component';
import { PortfolioRoutingModule } from './portfolio-routing.module';
import { RiskAssessmentComponent } from './risk-assessment/risk-assessment.component';
import { RiskProfileComponent } from './risk-profile/risk-profile.component';
import { WhatsTheRiskComponent } from './whats-the-risk/whats-the-risk.component';
import { SelectNationalityComponent } from './select-nationality/select-nationality.component';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(
    http,
    [
        { prefix: './assets/i18n/app/', suffix: '.json' },
        { prefix: './assets/i18n/portfolio/', suffix: '.json' }
    ]);
}

@NgModule({
  imports: [
    CommonModule, PortfolioRoutingModule, ReactiveFormsModule, NgbModule.forRoot(),
    NouisliderModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    GetStartedStep1Component,
    PersonalInfoComponent,
    MyFinancialsComponent,
    RiskAssessmentComponent,
    RiskProfileComponent,
    GetStartedStep2Component,
    IntroScreenComponent,
    PortfolioRecommendationComponent,
    CurrencyInputPortfolioDirective,
    PercentageInputDirective,
    WhatsTheRiskComponent,
    FundDetailsComponent,
    BreakdownBarComponent,
    BreakdownAccordionComponent,
    SelectNationalityComponent
  ],
  providers: [CurrencyPipe]
})
export class PortfolioModule { }