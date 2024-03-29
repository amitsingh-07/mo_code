import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { appConstants } from '../../../app.constants';
import { AppService } from '../../../app.service';
import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { AuthenticationService } from '../../../shared/http/auth/authentication.service';
import {
  ModelWithButtonComponent
} from '../../../shared/modal/model-with-button/model-with-button.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { SIGN_UP_ROUTE_PATHS } from '../../../sign-up/sign-up.routes.constants';
import { SignUpService } from '../../../sign-up/sign-up.service';
import {
  INVESTMENT_ACCOUNT_ROUTE_PATHS
} from '../../investment-account/investment-account-routes.constants';
import { InvestmentEngagementJourneyService } from '../../investment-engagement-journey/investment-engagement-journey.service';
import { RiskProfile } from '../../investment-engagement-journey/recommendation/riskprofile';
import { ManageInvestmentsService } from '../manage-investments.service';
import { environment } from './../../../../environments/environment';

@Component({
  selector: 'app-asset-allocation',
  templateUrl: './asset-allocation.component.html',
  styleUrls: ['./asset-allocation.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssetAllocationComponent implements OnInit {
  pageTitle: string;
  subTitle: string;
  portfolio;
  selectedRiskProfile: RiskProfile;
  breakdownSelectionindex: number = null;
  isAllocationOpen = false;
  colors: string[] = ['#ec681c', '#76328e', '#76328e'];
  formValues;

  constructor(
    private appService: AppService,
    private router: Router,
    public headerService: HeaderService,
    public navbarService: NavbarService,
    private translate: TranslateService,
    public footerService: FooterService,
    public authService: AuthenticationService,
    public modal: NgbModal,
    public manageInvestmentsService: ManageInvestmentsService,
    private signUpService: SignUpService,
    private investmentEngagementJourneyService: InvestmentEngagementJourneyService
  ) {
    this.formValues = this.manageInvestmentsService.getTopUpFormData();
    this.portfolio = this.formValues.selectedCustomerPortfolio;
    this.translate.use('en');
    const self = this;
    this.translate.get('COMMON').subscribe((result: string) => {
      self.pageTitle = this.translate.instant('ASSET_ALLOCATION.TITLE');
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
  }

  setPageTitle(title: string) {
    const stepLabel = this.portfolio.portfolioName;
    this.navbarService.setPageTitle(
      title,
      undefined,
      undefined,
      undefined,
      undefined,
      stepLabel
    );
  }
  constructgetAllocationParams() {
    const formData = this.investmentEngagementJourneyService.getRiskProfile();
    const enqId = this.authService.getEnquiryId();
    return {
      riskProfileId: formData.riskProfileId,
      enquiryId: enqId
    };
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

  showLoginOrSignupModal() {
    const errorMessage = this.translate.instant('PRELOGIN_MODAL.DESC');
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    ref.componentInstance.imgType = 1;
    ref.componentInstance.errorMessageHTML = errorMessage;
    ref.componentInstance.primaryActionLabel = this.translate.instant(
      'PRELOGIN_MODAL.LOG_IN'
    );
    ref.componentInstance.secondaryActionLabel = this.translate.instant(
      'PRELOGIN_MODAL.CREATE_ACCOUNT'
    );
    ref.componentInstance.secondaryActionDim = true;
    ref.componentInstance.primaryAction.subscribe(() => {
      // Login
      this.signUpService.setRedirectUrl(INVESTMENT_ACCOUNT_ROUTE_PATHS.ROOT);
      this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
    });
    ref.componentInstance.secondaryAction.subscribe(() => {
      // Sign up
      this.signUpService.setRedirectUrl(INVESTMENT_ACCOUNT_ROUTE_PATHS.START);
      this.router.navigate([SIGN_UP_ROUTE_PATHS.CREATE_ACCOUNT_MY_INFO]);
    });
  }

  goToNext() {
    this.appService.setJourneyType(appConstants.JOURNEY_TYPE_INVESTMENT);
    this.showLoginOrSignupModal();
  }
}
