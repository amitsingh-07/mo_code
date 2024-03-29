import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { INVESTMENT_COMMON_CONSTANTS } from '../../../investment/investment-common/investment-common.constants';
import {
  InvestmentAccountService
} from '../../../investment/investment-account/investment-account-service';
import {
  InvestmentEngagementJourneyService
} from '../../../investment/investment-engagement-journey/investment-engagement-journey.service';
import {
  MANAGE_INVESTMENTS_CONSTANTS
} from '../../../investment/manage-investments/manage-investments.constants';
import {
  ManageInvestmentsService
} from '../../../investment/manage-investments/manage-investments.service';

@Component({
  selector: 'app-review-buy-request-modal',
  templateUrl: './review-buy-request-modal.component.html',
  styleUrls: ['./review-buy-request-modal.component.scss']
})
export class ReviewBuyRequestModalComponent implements OnInit {
  @Input() fundDetails;
  cashBalance: number;
  requestAmount: number;
  requestType: string;
  portfolioType: string;
  riskProfileImg: string;
  noteArray;
  oneTimeMonthlyLbl: string;
  isAmtExceeded = false;
  oneTimeMonthlyInfo: string;
  @Output() submitRequest: EventEmitter<any> = new EventEmitter();
  @Input() srsDetails;
  @Input() cpfDetails;
  portfolioCatagories: any;
  @Output() closeAction = new EventEmitter<any>();

  constructor(public activeModal: NgbActiveModal,
    public readonly translate: TranslateService,
    public manageInvestmentsService: ManageInvestmentsService,
    public investmentAccountService: InvestmentAccountService,
    public investmentEngagementJourneyService: InvestmentEngagementJourneyService) {
  }

  ngOnInit() {
    this.cashBalance = this.fundDetails['portfolio']['cashAccountBalance'] || 0;
    if (this.fundDetails['fundingType'] === MANAGE_INVESTMENTS_CONSTANTS.FUNDING_INSTRUCTIONS.ONETIME) {
      this.oneTimeBuyRequestInfo();
    } else if (this.fundDetails['fundingType'] === MANAGE_INVESTMENTS_CONSTANTS.FUNDING_INSTRUCTIONS.MONTHLY) {
      this.monthlyBuyRequestInfo();
    }
    this.portfolioType = this.fundDetails['portfolio']['riskProfileType'];
    if (this.fundDetails['portfolio']['riskProfileId']) {
      this.riskProfileImg =
        this.investmentEngagementJourneyService.getRiskProfileIcon(this.portfolioType, false);
    }
    this.portfolioCatagories = INVESTMENT_COMMON_CONSTANTS.PORTFOLIO_CATEGORY;
  }

  oneTimeBuyRequestInfo() {
    this.requestAmount = Number(this.fundDetails['oneTimeInvestment']) || 0;
    this.requestType = MANAGE_INVESTMENTS_CONSTANTS.TOPUP.ONETIME_BUY_REQUEST;
    this.oneTimeMonthlyLbl = this.translate.instant('REVIEW_BUY_REQUEST.ONE_TIME_LBL');
    if (this.fundDetails.portfolio.fundingTypeValue.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.CASH) {
      if (this.fundDetails['isAmountExceedBalance'] === true) {
        this.noteArray = this.translate.instant('REVIEW_BUY_REQUEST.INSUFFICIENT_ONETIME_CASH_NOTE');
      } else {
        this.noteArray = this.translate.instant('REVIEW_BUY_REQUEST.SUFFICIENT_ONETIME_CASH_NOTE');
      }
    } else if (this.fundDetails.portfolio.fundingTypeValue.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.CPF) {
      this.noteArray = this.translate.instant('REVIEW_BUY_REQUEST.ONETIME_CPF_NOTE');
      this.oneTimeMonthlyInfo = this.translate.instant('REVIEW_BUY_REQUEST.INFO_CPF_ONETIME');
    } else {
      this.noteArray = this.translate.instant('REVIEW_BUY_REQUEST.ONETIME_SRS_NOTE');
      this.oneTimeMonthlyInfo = this.translate.instant('REVIEW_BUY_REQUEST.INFO_SRS_ONETIME');
    }
  }
  monthlyBuyRequestInfo() {
    this.requestAmount = Number(this.fundDetails['monthlyInvestment']) || 0;
    this.requestType = MANAGE_INVESTMENTS_CONSTANTS.TOPUP.MONTHLY_BUY_REQUEST;
    this.oneTimeMonthlyLbl = this.translate.instant('REVIEW_BUY_REQUEST.MONTHLY_LBL');
    if (this.fundDetails.portfolio.fundingTypeValue.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.CASH) {
      this.noteArray = this.translate.instant('REVIEW_BUY_REQUEST.MONTHLY_CASH_NOTE');
    } else if (this.fundDetails.portfolio.fundingTypeValue.toUpperCase() === MANAGE_INVESTMENTS_CONSTANTS.TOPUP.FUNDING_METHODS.CPF) {
      this.noteArray = this.translate.instant('REVIEW_BUY_REQUEST.MONTHLY_CPF_NOTE');
      this.oneTimeMonthlyInfo = this.translate.instant('REVIEW_BUY_REQUEST.INFO_CPF_MONTHLY');
    } else {
      this.noteArray = this.translate.instant('REVIEW_BUY_REQUEST.MONTHLY_SRS_NOTE');
      this.oneTimeMonthlyInfo = this.translate.instant('REVIEW_BUY_REQUEST.INFO_SRS_MONTHLY');
    }
  }

  onSubmit() {
    this.submitRequest.emit();
    this.activeModal.close();
  }

  closeIconAction() {
    this.closeAction.emit();
    this.activeModal.dismiss('Cross click');
  }
}
