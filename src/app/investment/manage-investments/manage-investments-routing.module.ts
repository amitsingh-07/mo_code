import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssetAllocationComponent } from './asset-allocation/asset-allocation.component';
import { HoldingsComponent } from './holdings/holdings.component';
import { InvestmentOverviewComponent } from './investment-overview/investment-overview.component';
import { ManageInvestmentsGuardService as  ManageInvestmentsGuard} from './manage-investments-guard.service';
import { MANAGE_INVESTMENTS_ROUTES } from './manage-investments-routes.constants';
import { TopUpComponent } from './top-up/top-up.component';
import { TopupStatusComponent } from './topup-status/topup-status.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { WithdrawalBankAccountComponent } from './withdrawal-bank-account/withdrawal-bank-account.component';
import { WithdrawalStatusComponent } from './withdrawal-status/withdrawal-status.component';
import { WithdrawalComponent } from './withdrawal/withdrawal.component';
import { YourPortfolioComponent } from './your-portfolio/your-portfolio.component';
import { TransferComponent } from './transfer/transfer.component';
import { TransferStatusComponent } from './transfer-status/transfer-status.component';

const routes: Routes = [
  {
    path: MANAGE_INVESTMENTS_ROUTES.ROOT,
    redirectTo: MANAGE_INVESTMENTS_ROUTES.YOUR_INVESTMENT,
    pathMatch: 'full'
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.TOPUP,
    component: TopUpComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.TOPUP_STATUS + '/:status',
    component: TopupStatusComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.YOUR_INVESTMENT,
    component: InvestmentOverviewComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.YOUR_INVESTMENT + '/:selectedPortfolio',
    component: InvestmentOverviewComponent,
    canActivate: [ManageInvestmentsGuard]
  },  
  {
    path: MANAGE_INVESTMENTS_ROUTES.YOUR_PORTFOLIO,
    component: YourPortfolioComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.WITHDRAWAL,
    component: WithdrawalComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.WITHDRAWAL_PAYMENT_METHOD,
    component: WithdrawalBankAccountComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.WITHDRAWAL_SUCCESS,
    component: WithdrawalStatusComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.TRANSACTION,
    component: TransactionsComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.HOLDINGS,
    component: HoldingsComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.ASSET_ALLOCATION,
    component: AssetAllocationComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.TRANSFER,
    component: TransferComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  {
    path: MANAGE_INVESTMENTS_ROUTES.TRANSFER_SUCCESS,
    component: TransferStatusComponent,
    canActivate: [ManageInvestmentsGuard]
  },
  { path: '**', redirectTo: '/page-not-found' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: []
})
export class ManageInvestmentsRoutingModule {}
