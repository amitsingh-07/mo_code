import {
  AfterViewInit, ChangeDetectorRef, Component, OnInit, Renderer2, ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

 

import { appConstants } from '../../../app.constants';
import { FooterService } from '../../../shared/footer/footer.service';
import { HeaderService } from '../../../shared/header/header.service';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { INVESTMENT_COMMON_ROUTE_PATHS } from '../../investment-common/investment-common-routes.constants';
import { INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS } from '../investment-engagement-journey-routes.constants';
import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from '../investment-engagement-journey.constants';
import { InvestmentEngagementJourneyService } from '../investment-engagement-journey.service';
import { AppService } from './../../../app.service';
import { AuthenticationService } from './../../../shared/http/auth/authentication.service';
import { InvestmentCommonService } from './../../investment-common/investment-common.service';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoaderService } from '../../../shared/components/loader/loader.service';

 

@Component({
  selector: 'app-wise-income-payout',
  templateUrl: './wise-income-payout.component.html',
  styleUrls: ['./wise-income-payout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WiseIncomePayoutComponent implements OnInit {
  pageTitle: string;
  wiseIncomePayOutForm: FormGroup;
  formBuilder: any;
  wiseIncomePayOuts;
  formValues;
  loaderTitle: string;
  loaderDesc: string;
  wiseIncomePayOutType;
  portfolioType;
  constructor(
    public readonly translate: TranslateService,
    public activeModal: NgbActiveModal,
    private router: Router,
    public headerService: HeaderService,
    public authService: AuthenticationService,
    private investmentCommonService: InvestmentCommonService,
    private appService: AppService,
    private investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private modal: NgbModal,
    private cd: ChangeDetectorRef,
    private renderer: Renderer2,
    private loaderService:LoaderService,
    private investmentAccountService: InvestmentAccountService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('WISE_INCOME_PAYOUT.TITLE');
      this.setPageTitle(this.pageTitle);
    });
  }
  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.portfolioType = this.investmentEngagementJourneyService.getSelectPortfolioType();
    this.formValues = this.investmentCommonService.getWiseIncomePayOut();
    this.wiseIncomePayOutForm = new FormGroup({
      WiseIncomePayout: new FormControl(
        this.formValues.WiseIncomePayout, Validators.required)
      });
      this.getWiseIncomePayOutDetails();
  }
  getWiseIncomePayOutDetails() {
    this.loaderService.showLoader({
      title: this.loaderTitle,
      desc: this.loaderDesc
    });
    this.investmentAccountService.getSpecificDropList('wiseIncomePayoutType').subscribe((data) => {
      this.loaderService.hideLoader();
      this.wiseIncomePayOuts = data.objectList.wiseIncomePayoutType;
     console.log(this.wiseIncomePayOuts);
    },
      (err) => {
        this.loaderService.hideLoader();
        this.investmentAccountService.showGenericErrorModal();
      });
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }
  goToNext(form){
    this.investmentCommonService.setWiseIncomePayOut(form.value);
    if (form.value.WiseIncomePayout.name === 'Grow & invest payout') {
      this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.FUNDING_METHOD]);
    } else{
      this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.INVESTMENT_AMOUNT]);
    }
  }
}
 