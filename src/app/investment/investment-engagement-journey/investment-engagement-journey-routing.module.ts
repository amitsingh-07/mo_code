import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectPortfolioTypeComponent } from './select-portfolio-type/select-portfolio-type.component';
import { SelectPortfolioComponent } from './select-portfolio/select-portfolio.component';
import { FundingMethodComponent } from './funding-method/funding-method.component';
import { GetStartedStep1Component } from './get-started-step1/get-started-step1.component';
import { GetStartedStep2Component } from './get-started-step2/get-started-step2.component';
import {
    InvestmentEngagementJourneyGuardService as InvestmentEngagementJourneyGuard
} from './investment-engagement-journey-guard.service';
import {
    INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES
} from './investment-engagement-journey-routes.constants';
import { InvestmentPeriodComponent } from './investment-period/investment-period.component';
import { PortfolioDetailsComponent } from './portfolio-details/portfolio-details.component';
import { PortfolioExistComponent } from './portfolio-exist/portfolio-exist.component';
import { RecommendationComponent } from './recommendation/recommendation.component';
import { RiskWillingnessComponent } from './risk-willingness/risk-willingness.component';
import { StartJourneyComponent } from './start-journey/start-journey.component';
import { YourFinancialsComponent } from './your-financials/your-financials.component';
import {
    YourInvestmentAmountComponent
} from './your-investment-amount/your-investment-amount.component';
import { RiskAcknowledgementComponent } from './risk-acknowledgement/risk-acknowledgement.component';
import { WiseIncomePayoutComponent } from './wise-income-payout/wise-income-payout.component';
import { AddSecondaryHolderComponent } from './add-secondary-holder/add-secondary-holder.component';

const routes: Routes = [
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.ROOT,
    redirectTo: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.START,
    pathMatch: 'full',
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.SELECT_PORTFOLIO_TYPE,
    component: SelectPortfolioTypeComponent,
    // canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.SELECT_PORTFOLIO,
    component: SelectPortfolioComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.FUNDING_METHOD,
    component: FundingMethodComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.GET_STARTED_STEP1,
    component: GetStartedStep1Component,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  { path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.PORTFOLIO_EXIST, component: PortfolioExistComponent },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.PERSONAL_INFO,
    component: InvestmentPeriodComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.INVESTMENT_AMOUNT,
    component: YourInvestmentAmountComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.MY_FINANCIAL,
    component: YourFinancialsComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.GET_STARTED_STEP2,
    component: GetStartedStep2Component,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.RISK_ASSESSMENT,
    redirectTo: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.RISK_ASSESSMENT + '/1',
    pathMatch: 'full',
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.RISK_ASSESSMENT + '/:id',
    component: RiskWillingnessComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.RISK_PROFILE,
    component: RecommendationComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.PORTFOLIO_RECOMMENDATION,
    component: PortfolioDetailsComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.START,
    component: StartJourneyComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.RISK_ACKNOWLEDGEMENT,
    component: RiskAcknowledgementComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.WISE_INCOME_PAYOUT,
    component: WiseIncomePayoutComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  {
    path: INVESTMENT_ENGAGEMENT_JOURNEY_ROUTES.ADD_SECONDARY_HOLDER,
    component: AddSecondaryHolderComponent,
    canActivate: [InvestmentEngagementJourneyGuard]
  },
  { path: '**', redirectTo: '/page-not-found' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: []
})
export class InvestmentEngagementJourneyRoutingModule {}
