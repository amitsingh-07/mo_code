import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { InvestmentEngagementJourneyService } from '../../investment-engagement-journey/investment-engagement-journey.service';
import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from './../../../investment/investment-engagement-journey/investment-engagement-journey.constants';
import { FileUtil } from '../../../shared/utils/file.util';

@Component({
  selector: 'app-fund-details',
  templateUrl: './fund-details.component.html',
  styleUrls: ['./fund-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FundDetailsComponent implements OnInit {
  fundDetails: any;
  investmentEnabled: boolean;
  wiseSaverEnabled: boolean;
  wiseIncomeEnabled: boolean;
  cpfEnabled: boolean;
  activeTabId = 1;

  @Input('portfolioType') portfolioType;

  constructor(
    public readonly translate: TranslateService,
    public activeModal: NgbActiveModal,
    public investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    private fileUtil: FileUtil
  ) {
    this.translate.use('en');
  }
  ngOnInit() {
    this.fundDetails = this.investmentEngagementJourneyService.getFundDetails();
    if ((this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVESTMENT.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVEST_PORTFOLIO.toLowerCase())) {
      this.investmentEnabled = true;
      this.wiseSaverEnabled = false;
      this.wiseIncomeEnabled = false;
      this.cpfEnabled = false;
    }
    if ((this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME_PORTFOLIO.toLowerCase())) {
      this.investmentEnabled = false;
      this.wiseSaverEnabled = false;
      this.wiseIncomeEnabled = true;
      this.cpfEnabled = false;
    }
    if ((this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER_PORTFOLIO.toLowerCase())) {
      this.investmentEnabled = false;
      this.wiseSaverEnabled = true;
      this.wiseIncomeEnabled = false;
      this.cpfEnabled = false;
    }
    if ((this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.CPF_PORTFOLIO.toLowerCase())) {
      this.investmentEnabled = false;
      this.wiseSaverEnabled = false;
      this.wiseIncomeEnabled = false;
      this.cpfEnabled = true;
    }
  }

  showHide(el) {
    const fundContentEle = document.getElementsByClassName('funding-content')[el];
    if (
      fundContentEle.classList.contains('active') ||
      fundContentEle.classList.contains('first')
    ) {
      fundContentEle.classList.remove('active');
      fundContentEle.classList.remove('first');
      document.getElementsByClassName('fund-heading')[el].classList.remove('active');
    } else {
      fundContentEle.classList.add('active');
      document.getElementsByClassName('fund-heading')[el].classList.add('active');
    }
  }

  getHighlightSheetLink(fund) {
    let highlightSheetFileName;
    if (fund.factSheetLink) {
      highlightSheetFileName = fund.factSheetLink.split('|')[1];
    }
    this.fileUtil.createDownloadUrl(highlightSheetFileName, INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.FUND_DOC_PATH + highlightSheetFileName);
  }
  getProspectusLink() {
    let prospectusFileName;
    if (this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVESTMENT.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVEST_PORTFOLIO.toLowerCase()) {
      prospectusFileName = INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.PROSPECTUS_FILE.INVESTMENT;
    } else if (this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER_PORTFOLIO.toLowerCase()) {
      prospectusFileName = INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.PROSPECTUS_FILE.WISESAVER;
    } else if (this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME.toLowerCase() || this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISEINCOME_PORTFOLIO.toLowerCase()) {
      prospectusFileName = INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.PROSPECTUS_FILE.WISEINCOME;
    } else if (this.portfolioType.toLowerCase() === INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.CPF_PORTFOLIO.toLowerCase()) {
      if (this.activeTabId === 1) {
        prospectusFileName = INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.PROSPECTUS_FILE.CPF_LGI;
      }
      else {
        prospectusFileName = INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.PROSPECTUS_FILE.CPF_UOB;
      }
    }
    this.fileUtil.createDownloadUrl(prospectusFileName, INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.FUND_DOC_PATH + prospectusFileName);
  }

}
