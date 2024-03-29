import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService as AuthGuard } from '../../sign-up/auth-guard.service';
import { FundingIntroComponent } from '../investment-common/funding-intro/funding-intro.component';
import { AcknowledgementComponent } from './acknowledgement/acknowledgement.component';
import { AddPortfolioNameComponent } from './add-portfolio-name/add-portfolio-name.component';
import { CkaMethodQnaComponent } from './cka-method-qna/cka-method-qna.component';
import { ConfirmPortfolioComponent } from './confirm-portfolio/confirm-portfolio.component';
import { ConfirmWithdrawalComponent } from './confirm-withdrawal/confirm-withdrawal.component';
import { CpfPrerequisitesComponent } from './cpf-prerequisites/cpf-prerequisites.component';
import {
  FundingAccountDetailsComponent
} from './funding-account-details/funding-account-details.component';
import {
  FundingInstructionsComponent
} from './funding-instructions/funding-instructions.component';
import { InvestmentCommonGuardService } from './investment-common-guard.service';
import { INVESTMENT_COMMON_ROUTES } from './investment-common-routes.constants';
import { PortfolioSummaryComponent } from './portfolio-summary/portfolio-summary.component';

const routes: Routes = [
  {
    path: INVESTMENT_COMMON_ROUTES.ROOT,
    redirectTo: INVESTMENT_COMMON_ROUTES.ENGAGEMENT_START,
    pathMatch: 'full'
  },
  {
    path: INVESTMENT_COMMON_ROUTES.ACKNOWLEDGEMENT,
    component: AcknowledgementComponent,
    canActivate: [InvestmentCommonGuardService]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.CONFIRM_PORTFOLIO,
    component: ConfirmPortfolioComponent,
    canActivate: [InvestmentCommonGuardService]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.ADD_PORTFOLIO_NAME,
    component: AddPortfolioNameComponent,
    canActivate: [InvestmentCommonGuardService]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.FUND_INTRO,
    component: FundingIntroComponent,
    canActivate: [AuthGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.FUNDING_INSTRUCTIONS,
    component: FundingInstructionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.FUNDING_ACCOUNT_DETAILS,
    component: FundingAccountDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.ACCEPT_JA_HOLDER + '/:customerPortfolioId',
    component: ConfirmPortfolioComponent,
    canActivate: [InvestmentCommonGuardService]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.EDIT_FUNDING_ACCOUNT_DETAILS,
    component: FundingAccountDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.PORTFOLIO_SUMMARY,
    component: PortfolioSummaryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.CONFIRM_WITHDRAWAL,
    component: ConfirmWithdrawalComponent,
    canActivate: [AuthGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.EDIT_WITHDRAWAL,
    component: ConfirmWithdrawalComponent,
    canActivate: [AuthGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.CKA_METHOD_BASED_QNA + '/:methodname',
    component: CkaMethodQnaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: INVESTMENT_COMMON_ROUTES.CPF_PREREQUISITES,
    component: CpfPrerequisitesComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/page-not-found' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: []
})
export class InvestmentCommonRoutingModule { }
