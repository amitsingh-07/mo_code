import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TOPUP_AND_WITHDRAW_ROUTES } from './topup-and-withdraw-routes.constants';

import { TopUpComponent } from './top-up/top-up.component';
import { TopupRequestComponent } from './topup-request/topup-request.component';

import { YourInvestmentComponent } from './your-investment/your-investment.component';

const routes: Routes = [
  {
    path: TOPUP_AND_WITHDRAW_ROUTES.ROOT,
    redirectTo: TOPUP_AND_WITHDRAW_ROUTES.TOPUP,
    pathMatch: 'full',

  },
  {
    path: TOPUP_AND_WITHDRAW_ROUTES.TOPUP,
    component: TopUpComponent
  },
  {
    path: TOPUP_AND_WITHDRAW_ROUTES.TOPUP_REQUEST,
    component: TopupRequestComponent
  },
  {
    path: TOPUP_AND_WITHDRAW_ROUTES.YOUR_INVESY_TMENT,
    component: YourInvestmentComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  declarations: []
})
export class TopupAndWithdrawRoutingModule { }
