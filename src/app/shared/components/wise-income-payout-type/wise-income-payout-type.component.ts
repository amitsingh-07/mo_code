import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import {
  INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS
} from './../../../investment/investment-engagement-journey/investment-engagement-journey-routes.constants';
import { INVESTMENT_COMMON_CONSTANTS } from '../../../investment/investment-common/investment-common.constants';
import { InvestmentAccountService } from '../../../investment/investment-account/investment-account-service';
import { InvestmentCommonService } from '../../../investment/investment-common/investment-common.service';

@Component({
  selector: 'app-wise-income-payout-type',
  templateUrl: './wise-income-payout-type.component.html',
  styleUrls: ['./wise-income-payout-type.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WiseIncomePayoutTypeComponent implements OnInit {
  @Input('portfolio') portfolio;
  @Input('payoutType') payoutType;
  payoutConst: any;
  payoutTimeInterval: any;

  constructor(private router: Router,
    private investmentAccountService: InvestmentAccountService,
    private investmentCommonService: InvestmentCommonService) {
    this.payoutConst = INVESTMENT_COMMON_CONSTANTS.WISE_INCOME_PAYOUT;
  }

  ngOnInit(): void {
    this.getPayoutTimeInterval();
  }

  goReviewInputs() {
    this.investmentAccountService.activateReassess();
    this.investmentCommonService.saveUpdateSessionData(this.portfolio);
    this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.WISE_INCOME_PAYOUT]);
  }

  getPayoutTimeInterval() {
    this.payoutTimeInterval = {
      investBeforeMonth: (this.portfolio && this.portfolio.investBeforeMonth) ? this.portfolio.investBeforeMonth : '',
      nextPayoutOrReinvestMonth: (this.portfolio && this.portfolio.nextPayoutOrReinvestMonth) ? this.portfolio.nextPayoutOrReinvestMonth : ''
    };
  }
}
