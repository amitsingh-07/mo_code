import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { LoaderService } from '../../../shared/components/loader/loader.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { AuthenticationService } from '../../../shared/http/auth/authentication.service';
import {
  EditInvestmentModalComponent
} from '../../../shared/modal/edit-investment-modal/edit-investment-modal.component';
import {
  ModelWithButtonComponent
} from '../../../shared/modal/model-with-button/model-with-button.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { FormatCurrencyPipe } from '../../../shared/Pipes/format-currency.pipe';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import {
  INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS
} from '../../investment-engagement-journey/investment-engagement-journey-routes.constants';
import {
  InvestmentEngagementJourneyService
} from '../../investment-engagement-journey/investment-engagement-journey.service';
import { ProfileIcons } from '../../investment-engagement-journey/recommendation/profileIcons';
import { ManageInvestmentsService } from '../../manage-investments/manage-investments.service';
import { IInvestmentCriteria } from '../investment-common-form-data';
import { INVESTMENT_COMMON_ROUTE_PATHS } from '../investment-common-routes.constants';
import { InvestmentCommonService } from '../investment-common.service';

@Component({
  selector: 'app-confirm-portfolio',
  templateUrl: './confirm-portfolio.component.html',
  styleUrls: ['./confirm-portfolio.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmPortfolioComponent implements OnInit {
  uploadForm: FormGroup;
  pageTitle: string;
  countries;
  portfolio;
  colors: string[] = ['#ec681c', '#76328e', '#76328e'];
  userInputSubtext;
  iconImage;
  breakdownSelectionindex: number = null;
  isAllocationOpen = false;
  confirmPortfolioValue;
  investmentCriteria: IInvestmentCriteria;

  constructor(
    public readonly translate: TranslateService,
    private router: Router,
    public headerService: HeaderService,
    private modal: NgbModal,
    public navbarService: NavbarService,
    public footerService: FooterService,
    public investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    public manageInvestmentsService: ManageInvestmentsService,
    public investmentAccountService: InvestmentAccountService,
    private investmentCommonService: InvestmentCommonService,
    private authService: AuthenticationService,
    private formatCurrencyPipe: FormatCurrencyPipe
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('PORTFOLIO_RECOMMENDATION.TITLE');
      this.setPageTitle(this.pageTitle);
    });
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.getPortfolioDetails();
    this.getInvestmentCriteria();
  }

  getPortfolioDetails() {
    this.investmentAccountService
      .getPortfolioAllocationDetailsWithAuth()
      .subscribe((data) => {
        if (data.objectList && data.objectList.enquiryId) { /* Overwriting enquiry id */
          this.authService.saveEnquiryId(data.objectList.enquiryId);
        }
        this.portfolio = data.objectList;
       if( this.portfolio.portfolioType === 'Investment'){
        this.iconImage = ProfileIcons[this.portfolio.riskProfile.id - 1]['icon'];
       }
        const fundingParams = this.constructFundingParams(data.objectList);
        this.manageInvestmentsService.setFundingDetails(fundingParams);
        if (this.portfolio.fundingTypeId) {
          this.investmentCommonService.setInitialFundingMethod({ initialFundingMethodId: this.portfolio.fundingTypeId });
        }
        this.userInputSubtext = {
          onetime: this.formatCurrencyPipe.transform(
            this.portfolio.initialInvestment
          ),
          monthly: this.formatCurrencyPipe.transform(
            this.portfolio.monthlyInvestment
          ),
          period: this.portfolio.investmentPeriod
        };
      });
  }

  constructFundingParams(data) {
    return {
      source: 'FUNDING',
      redirectTo: 'YOUR_INVESTMENT',
      portfolio: {
        productName: data.portfolioName,
        riskProfile: data.riskProfile
      },
      oneTimeInvestment: data.initialInvestment,
      monthlyInvestment: data.monthlyInvestment,
      fundingType: '',
      isAmountExceedBalance: 0,
      exceededAmount: 0,
      customerPortfolioId: data.customerPortfolioId
    };
  }

  getInlineErrorStatus(control) {
    return !control.pristine && !control.valid;
  }

  setNestedDropDownValue(key, value, nestedKey) {
    this.uploadForm.controls[nestedKey]['controls'][key].setValue(value);
  }

  markAllFieldsDirty(form) {
    Object.keys(form.controls).forEach((key) => {
      if (form.get(key).controls) {
        Object.keys(form.get(key).controls).forEach((nestedKey) => {
          form.get(key).controls[nestedKey].markAsDirty();
        });
      } else {
        form.get(key).markAsDirty();
      }
    });
  }

  selectAllocation(event) {
    if (!this.isAllocationOpen) {
      this.breakdownSelectionindex = event;
      this.isAllocationOpen = true;
    } else {
      if (event !== this.breakdownSelectionindex) {
        // different tab
        this.breakdownSelectionindex = event;
        this.isAllocationOpen = true;
      } else {
        // same tab click
        this.breakdownSelectionindex = null;
        this.isAllocationOpen = false;
      }
    }
  }

  showPortfolioAssetModal() {
    const errorTitle = this.translate.instant(
      'PORTFOLIO_RECOMMENDATION.MODAL.PROJECTED_RETURNS.TITLE'
    );
    const errorMessage = this.translate.instant(
      'PORTFOLIO_RECOMMENDATION.MODAL.PROJECTED_RETURNS.MESSAGE'
    );
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    ref.componentInstance.imgType = 1;
    ref.componentInstance.errorTitle = errorTitle;
    ref.componentInstance.errorMessageHTML = errorMessage;
  }

  openEditInvestmentModal() {
    const ref = this.modal.open(EditInvestmentModalComponent, {
      centered: true
    });
    ref.componentInstance.investmentData = {
      oneTimeInvestment: this.portfolio.initialInvestment,
      monthlyInvestment: this.portfolio.monthlyInvestment
    };
    ref.componentInstance.investmentCriteria = this.investmentCriteria;
    ref.componentInstance.modifiedInvestmentData.subscribe((emittedValue) => {
      // update form data
      ref.close();
      this.saveUpdatedInvestmentData(emittedValue);
    });
    this.dismissPopup(ref);
  }

  dismissPopup(ref: NgbModalRef) {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        ref.close();
      }
    });
  }

  saveUpdatedInvestmentData(updatedData) {
    const params = this.constructUpdateInvestmentParams(updatedData);
    const customerPortfolioId = this.portfolio.customerPortfolioId;
    this.investmentAccountService.updateInvestment(customerPortfolioId, params).subscribe((data) => {
      this.getPortfolioDetails();
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  constructUpdateInvestmentParams(data) {
    return {
      initialInvestment: data.oneTimeInvestment,
      monthlyInvestment: data.monthlyInvestment
    };
  }

  goToWhatsTheRisk() {
    this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.WHATS_THE_RISK]);
  }

  confirmPortfolio() {
    this.investmentCommonService.confirmPortfolio(this.portfolio.customerPortfolioId).subscribe((data) => {
      if (data.responseMessage.responseCode === 6000 || data.responseMessage.responseCode === 5119) {
        this.investmentCommonService.clearAccountCreationActions();
        const namingFormData = {
          defaultPortfolioName: data.objectList.portfolioName,
          recommendedCustomerPortfolioId: this.portfolio.customerPortfolioId,
          recommendedRiskProfileId: this.portfolio.portfolioType === 'Investment' ? this.portfolio.riskProfile.id : 7
        };
        this.investmentAccountService.setPortfolioNamingFormData(namingFormData);
        this.router.navigate([INVESTMENT_COMMON_ROUTE_PATHS.FUNDING_ACCOUNT_DETAILS]);
      } else {
        this.investmentAccountService.showGenericErrorModal();
      }
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  getInvestmentCriteria() {
    this.investmentCommonService.getInvestmentCriteria().subscribe((data) => {
      this.investmentCriteria = data;
    });
  }
}
