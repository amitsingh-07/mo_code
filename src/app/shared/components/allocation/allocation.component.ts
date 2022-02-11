import { Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FundDetailsComponent } from '../../../investment/investment-common/fund-details/fund-details.component';
import { InvestmentEngagementJourneyService } from '../../../investment/investment-engagement-journey/investment-engagement-journey.service';
import { INVESTMENT_COMMON_CONSTANTS } from '../../../investment/investment-common/investment-common.constants';
import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from  './../../../investment/investment-engagement-journey/investment-engagement-journey.constants';
@Component({
  selector: 'app-allocation',
  templateUrl: './allocation.component.html',
  styleUrls: ['./allocation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AllocationComponent implements OnInit, OnChanges {
  @Input('assets') assets;
  @Input('funds') funds;
  @Input('colors') colors;
  @Input('portfolioType') portfolioType;

  event1 = true;
  event2 = true;
  allocationDetails: boolean;
  investmentEnabled: boolean;
  wiseSaverEnabled : boolean;
  wiseIncomeEnabled: boolean;
  cpfEnabled: boolean;
  assetTypeConst : any;

  constructor(
    private investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    public modal: NgbModal,
  ) { 
    this.assetTypeConst = INVESTMENT_COMMON_CONSTANTS.ASSET_TYPE;
  }

  ngOnInit() {
    if(this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVESTMENT.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVEST_PORTFOLIO.toLowerCase()){
      this.investmentEnabled = true;
      this.wiseSaverEnabled = false;
      this.wiseIncomeEnabled = false;
      this.cpfEnabled = false;
    }
    if(this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME_PORTFOLIO.toLowerCase()){
      this.investmentEnabled = false;
      this.wiseSaverEnabled = false;
      this.wiseIncomeEnabled = true;
      this.cpfEnabled = false;
    }
    if(this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER_PORTFOLIO.toLowerCase()){
      this.investmentEnabled = false;
      this.wiseSaverEnabled = true;
      this.wiseIncomeEnabled = false;
      this.cpfEnabled = false;
    }
    if((this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.CPF_PORTFOLIO.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.CPF_PORTFOLIO.toLowerCase() )){
      this.investmentEnabled = false;
      this.wiseSaverEnabled = false;
      this.wiseIncomeEnabled = false;
      this.cpfEnabled = true;
    }
  }
  ngOnChanges() {
    if (this.portfolioType.toUpperCase() === INVESTMENT_COMMON_CONSTANTS.WISESAVER_ASSET_ALLOCATION.TYPE) {
      this.assets = INVESTMENT_COMMON_CONSTANTS.WISESAVER_ASSET_ALLOCATION.ASSETS;
      this.allocationDetails = false;
    } else if (this.assets) {
      this.assets.forEach((allocation) => {
        allocation.groupedAllocationDetails = this.groupByProperty(allocation.groupedAllocationDetails);
      });
      this.allocationDetails = true;
    }
  }

  groupByProperty(targetObj) {
    const assetKeys = Object.keys(targetObj);
    const groupObjects = [];
    for (const prop of assetKeys) {
      if (prop.toLowerCase() === INVESTMENT_COMMON_CONSTANTS.ALLOCATION_DETAILS.MATURITY || prop.toLowerCase() === INVESTMENT_COMMON_CONSTANTS.ALLOCATION_DETAILS.CREDIT_RATING || prop.toLowerCase() === INVESTMENT_COMMON_CONSTANTS.ALLOCATION_DETAILS.CREDIT_RATING_ALLOCATION) {
        this.investmentEngagementJourneyService.sortByProperty(targetObj[prop], 'listingOrder', 'asc');
      } else {
        this.investmentEngagementJourneyService.sortByProperty(targetObj[prop], 'percentage', 'desc');
      }
      const classObj = {
        name: prop,
        value: targetObj[prop]
      };
      groupObjects.push(classObj);
    }
    return groupObjects;
  }

  showFundDetails() {
    this.investmentEngagementJourneyService.setFundDetails(this.funds);
    const ref = this.modal.open(FundDetailsComponent, {
      centered: true,
      windowClass: 'custom-full-height'
    });
    ref.componentInstance.portfolioType = this.portfolioType;
    return false;
  }

  showHidePanel(accordionEle, panelId, panelHeadEle) {
    accordionEle.toggle(panelId);
    if (panelHeadEle.currentTarget.classList.contains('active')) {
      // Opened State
      panelHeadEle.currentTarget.classList.remove('active');
    } else {
      // Closed State
      panelHeadEle.currentTarget.classList.add('active');
    }
  }
}
