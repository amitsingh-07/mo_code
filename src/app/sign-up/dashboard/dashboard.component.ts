import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { AppService } from '../../app.service';
import {
    INVESTMENT_ACCOUNT_ROUTE_PATHS
} from '../../investment-account/investment-account-routes.constants';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { PORTFOLIO_ROUTE_PATHS } from '../../portfolio/portfolio-routes.constants';
import { FooterService } from '../../shared/footer/footer.service';
import { ApiService } from '../../shared/http/api.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SelectedPlansService } from '../../shared/Services/selected-plans.service';
import { Formatter } from '../../shared/utils/formatter.util';
import {
    TOPUP_AND_WITHDRAW_ROUTE_PATHS
} from '../../topup-and-withdraw/topup-and-withdraw-routes.constants';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_CONFIG } from '../sign-up.constant';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { IEnquiryUpdate } from '../signup-types';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  userProfileInfo: any;
  insuranceEnquiry: any;
  showPortffolioPurchased = false;
  showStartInvesting = false;
  showInvestmentDetailsSaved = false;
  showNoInvestmentAccount = false;
  showAddportfolio = false;
  showCddCheckOngoing = false;
  showSuspendedAccount = false;
  showBlockedNationalityStatus = false;
  showSetupAccount = false;
  showCddCheckFail = false;
  showEddCheckFailStatus = false;
  totalValue: any;
  totalReturns: any;
  availableBalance: any;

  constructor(
    private router: Router,
    private signUpApiService: SignUpApiService,
    private investmentAccountService: InvestmentAccountService,
    public readonly translate: TranslateService, private appService: AppService,
    private signUpService: SignUpService, private apiService: ApiService,
    public navbarService: NavbarService, public footerService: FooterService, private selectedPlansService: SelectedPlansService) {
    this.translate.use('en');
  }

  ngOnInit() {
    this.navbarService.setNavbarVisibility(true);
    this.navbarService.setNavbarMode(1);
    this.navbarService.setNavbarMobileVisibility(true);
    this.footerService.setFooterVisibility(false);
    this.loadOptionListCollection();
    this.signUpApiService.getUserProfileInfo().subscribe((userInfo) => {
      this.signUpService.setUserProfileInfo(userInfo.objectList);
      this.userProfileInfo = this.signUpService.getUserProfileInfo();
      this.getDashboardList();
      this.insuranceEnquiry = this.selectedPlansService.getSelectedPlan();
      if (this.insuranceEnquiry && this.insuranceEnquiry.plans && this.insuranceEnquiry.plans.length > 0) {
        const payload: IEnquiryUpdate = {
          customerId: this.appService.getCustomerId(),
          enquiryId: Formatter.getIntValue(this.insuranceEnquiry.enquiryId),
          selectedProducts: this.insuranceEnquiry.plans
        };
        this.apiService.updateInsuranceEnquiry(payload).subscribe((data) => {
          this.selectedPlansService.clearData();
        });
      }
    });
  }

  loadOptionListCollection() {
    this.investmentAccountService.getAllDropDownList().subscribe((data) => {
      this.investmentAccountService.setOptionList(data.objectList);
    });
  }

  goToEngagement() {
    this.router.navigate([PORTFOLIO_ROUTE_PATHS.GET_STARTED_STEP1]);
  }

  goToEditProfile() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
  }

  goToInvOverview() {
    this.router.navigate([TOPUP_AND_WITHDRAW_ROUTE_PATHS.ROOT]);
  }

  goToDocUpload() {
    this.investmentAccountService.getNationalityCountryList().subscribe((data) => {
      const nationalityList = data.objectList;
      const countryList = this.getCountryList(data.objectList);
      this.investmentAccountService.setNationalitiesCountries(nationalityList, countryList);
      const beneficialOwner = this.userProfileInfo.investementDetails
        && this.userProfileInfo.investementDetails.beneficialOwner ? this.userProfileInfo.investementDetails.beneficialOwner : false;
      const pep = this.userProfileInfo.investementDetails && this.userProfileInfo.investementDetails.isPoliticallyExposed ?
        this.userProfileInfo.investementDetails.isPoliticallyExposed : false;
      const myInfoVerified = this.userProfileInfo.investementDetails && this.userProfileInfo.investementDetails.myInfoVerified ?
        this.userProfileInfo.investementDetails.myInfoVerified : false;
      this.investmentAccountService.setDataForDocUpload(this.userProfileInfo.nationality, beneficialOwner, pep, myInfoVerified);
      if (myInfoVerified) {
        if (beneficialOwner) {
          this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.UPLOAD_DOCUMENTS_BO]);
        } else {
          this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.ACKNOWLEDGEMENT]);
        }
      } else {
        this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.UPLOAD_DOCUMENTS]);
      }
    });
  }

  getCountryList(data) {
    const countryList = [];
    data.forEach((nationality) => {
      if (!nationality.blocked) {
        nationality.countries.forEach((country) => {
          countryList.push(country);
        });
      }
    });
    return countryList;
  }
  goToInvestmentAccount() {
    this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.ROOT]);
  }

  getDashboardList() {
    const investmentStatus = this.signUpService.getInvestmentStatus();
    if (investmentStatus === SIGN_UP_CONFIG.INVESTMENT.PORTFOLIO_PURCHASED ||
      investmentStatus === SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_CREATED) {
      this.totalValue = this.userProfileInfo.investementDetails.totalValue ? this.userProfileInfo.investementDetails.totalValue : 0;
      this.totalReturns = this.userProfileInfo.investementDetails.totalReturns ? this.userProfileInfo.investementDetails.totalReturns : 0;
      this.availableBalance = this.userProfileInfo.investementDetails.cashAccountDetails &&
        this.userProfileInfo.investementDetails.cashAccountDetails.availableBalance ?
        this.userProfileInfo.investementDetails.cashAccountDetails.availableBalance : 0;
    }
    switch (investmentStatus) {
      case SIGN_UP_CONFIG.INVESTMENT.RECOMMENDED: {
        this.showSetupAccount = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.ACCEPTED_NATIONALITY: {
        this.showSetupAccount = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.BLOCKED_NATIONALITY: {
        this.showBlockedNationalityStatus = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.INVESTMENT_ACCOUNT_DETAILS_SAVED: {
        this.showInvestmentDetailsSaved = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.CDD_CHECK_PENDING: {
        this.showCddCheckOngoing = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.DOCUMENTS_UPLOADED: {
        this.showInvestmentDetailsSaved = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_CLEARED: {
        this.showCddCheckOngoing = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_PENDING: {
        this.showCddCheckOngoing = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.EDD_CHECK_FAILED: {
        this.showEddCheckFailStatus = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.CDD_CHECK_FAILED: {
        this.showCddCheckFail = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_CREATED: {
        this.showPortffolioPurchased = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_FUNDED: {
        this.showPortffolioPurchased = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.ACCOUNT_SUSPENDED: {
        this.showSuspendedAccount = true;
        break;
      }
      case SIGN_UP_CONFIG.INVESTMENT.PORTFOLIO_PURCHASED: {
        this.showPortffolioPurchased = true;
        break;
      }
      default: {
        this.showStartInvesting = true;
        break;
      }
    }
  }

  verifyCustomerDetails() {
    this.signUpService.getDetailedCustomerInfo().subscribe((customerData) => {
      this.investmentAccountService.getNationalityCountryList().subscribe((nationalityData) => {
        const nationalityList = nationalityData.objectList;
        const countryList = this.getCountryList(nationalityData.objectList);
        this.investmentAccountService.setNationalitiesCountries(nationalityList, countryList);
        this.investmentAccountService.setInvestmentAccountFormData(customerData.objectList);
        this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.SELECT_NATIONALITY]);
      });
    });
  }
}
