import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LoaderService } from '../../../shared/components/loader/loader.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { GroupByPipe } from '../../../shared/Pipes/group-by.pipe';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { InvestmentEngagementJourneyService } from '../../investment-engagement-journey/investment-engagement-journey.service';
import { ManageInvestmentsService } from '../manage-investments.service';
import { environment } from './../../../../environments/environment';
import { FileUtil } from '../../../shared//utils/file.util';
import { CapacitorUtils } from '../../../shared/utils/capacitor.util';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransactionsComponent implements OnInit {
  pageTitle: string;
  transactionHistory: any;
  statementMonthsList: any;
  Object = Object;
  activeTransactionIndex;
  userProfileInfo;
  portfolio: any;
  isTransactionExceeded: boolean;
  constructor(
    public footerService: FooterService,
    public navbarService: NavbarService,
    private translate: TranslateService,
    private manageInvestmentsService: ManageInvestmentsService,
    private investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    private investmentAccountService: InvestmentAccountService,
    private loaderService: LoaderService,
    private fileUtil: FileUtil
  ) {
    this.portfolio = this.manageInvestmentsService.getSelectedCustomerPortfolio();
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('TRANSACTIONS.TITLE');
      this.setPageTitle(this.pageTitle);
    });
  }
  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    if (environment.hideHomepage) {
      this.navbarService.setNavbarMode(105);
    } else {
      this.navbarService.setNavbarMode(103);
    }
    this.footerService.setFooterVisibility(false);
    this.getTransactionHistory();
    this.createTransactionStatement();
  }

  createTransactionStatement() {
    if (this.portfolio && this.portfolio.statementStartDate) {
      const statementStartDate = this.convertStringToDate(
        this.portfolio.statementStartDate
      );
      const recentStatementAvailDate = this.convertStringToDate(
        this.portfolio.statementCreatedDate
      );
      this.statementMonthsList = this.manageInvestmentsService.getMonthListByPeriod(
        statementStartDate,
        recentStatementAvailDate
      );
    }
  }

  setPageTitle(title: string) {
    console.log(this.portfolio.portfolioName);
    this.navbarService.setPageTitle(title, null, false, false, true, this.portfolio.portfolioName);
  }

  convertStringToDate(dateStr) {
    const dateArr = dateStr.split('-');
    return new Date(dateArr[2], dateArr[1] - 1, dateArr[0]);
  }

  getTransactionHistory() {
    this.translate.get('COMMON').subscribe((result: string) => {
      this.loaderService.showLoader({
        title: this.translate.instant('TRANSACTIONS.MODAL.TRANSACTION_FETCH_LOADER.TITLE'),
        desc: this.translate.instant('TRANSACTIONS.MODAL.TRANSACTION_FETCH_LOADER.MESSAGE'),
        autoHide: false
      });
    });
    if (this.portfolio) {
      this.manageInvestmentsService.getTransactionHistory(
        this.portfolio.customerPortfolioId).subscribe((response) => {
          this.loaderService.hideLoaderForced();
          this.transactionHistory = response.objectList.transactionsHistory;
          this.transactionHistory = this.calculateSplitAmounts(this.transactionHistory);
          this.isTransactionExceeded = response.objectList.isTransactionPeriodExceeded;
          this.investmentEngagementJourneyService.sortByProperty(
            this.transactionHistory,
            'createdDate',
            'desc'
          );
          this.transactionHistory = new GroupByPipe().transform(
            this.transactionHistory,
            'displayCreatedDate'
          );
        },
          (err) => {
            this.loaderService.hideLoaderForced();
            this.investmentAccountService.showGenericErrorModal();
          });
    } else {
      this.loaderService.hideLoaderForced();
    }
  }

  calculateSplitAmounts(transactionHistory) {
    if (transactionHistory) {
      transactionHistory.forEach((transaction) => {
        if (transaction.fundInvestmentSplits) {
          transaction.fundInvestmentSplits.forEach((breakdown) => {
            breakdown.splitAmount = breakdown.unit * breakdown.unitPrice;
          });
        }
      });
    }
    return transactionHistory;
  }

  downloadStatement(month) {
    let newWindow;
    if (CapacitorUtils.isIosWeb) {
      newWindow = window.open();
    }
    const params = this.constructDonwloadStatementParams(month);
    this.translate.get('COMMON').subscribe((result: string) => {
      this.loaderService.showLoader({
        title: this.translate.instant('TRANSACTIONS.MODAL.STATEMENT_FETCH_LOADER.TITLE'),
        desc: this.translate.instant('TRANSACTIONS.MODAL.STATEMENT_FETCH_LOADER.MESSAGE')
      });
    });
    this.manageInvestmentsService.downloadStatement(params, this.portfolio.customerPortfolioId).subscribe((response) => {
      this.loaderService.hideLoader();
      if (response) {
        const fileName = month.monthName + '_' + month.year + '_' + '.pdf';
        this.fileUtil.downloadPDF(response, newWindow, fileName);
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    },
      (err) => {
        this.loaderService.hideLoader();
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  constructDonwloadStatementParams(data) {
    if (data && data.monthName) {
      return data.year + '/' + data.monthName.substring(0, 3).toUpperCase();
    }
    return '';
  }

  expandCollapseAccordion(groupIndex, transactionIndex) {
    const index = groupIndex.toString() + transactionIndex.toString();
    if (index !== this.activeTransactionIndex) {
      this.activeTransactionIndex = index;
    } else {
      this.activeTransactionIndex = null;
    }
  }
}

