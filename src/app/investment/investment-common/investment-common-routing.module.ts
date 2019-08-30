import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService as AuthGuard } from '../../sign-up/auth-guard.service';
import {
    InvestmentAccountGuardService as InvestmentAccountGuard
} from '../investment-account/investment-account-guard.service';
import { FundingIntroComponent } from '../investment-common/funding-intro/funding-intro.component';
import { AcknowledgementComponent } from './acknowledgement/acknowledgement.component';
import { AddPortfolioNameComponent } from './add-portfolio-name/add-portfolio-name.component';
import { AddPortfolioStatusComponent } from './add-portfolio-status/add-portfolio-status.component';
import { ConfirmPortfolioComponent } from './confirm-portfolio/confirm-portfolio.component';
import {
    FundingInstructionsComponent
} from './funding-instructions/funding-instructions.component';
import { INVESTMENT_COMMON_ROUTES } from './investment-common-routes.constants';

const routes: Routes = [
  {
    path: INVESTMENT_COMMON_ROUTES.ACKNOWLEDGEMENT,
    component: AcknowledgementComponent,
    canActivate: [InvestmentAccountGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.CONFIRM_PORTFOLIO,
    component: ConfirmPortfolioComponent,
    canActivate: []
  },
  {
    path: INVESTMENT_COMMON_ROUTES.FUNDING_INSTRUCTIONS,
    component: FundingInstructionsComponent,
    canActivate: []
  },
  {
    path: INVESTMENT_COMMON_ROUTES.ADD_PORTFOLIO_NAME,
    component: AddPortfolioNameComponent,
    canActivate: []
  },
  {
    path: INVESTMENT_COMMON_ROUTES.ADD_PORTFOLIO_STATUS,
    component: AddPortfolioStatusComponent,
    canActivate: []
  },
  {
    path: INVESTMENT_COMMON_ROUTES.FUND_INTRO,
    component: FundingIntroComponent,
    canActivate: []
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: []
})
export class InvestmentCommonRoutingModule {}
