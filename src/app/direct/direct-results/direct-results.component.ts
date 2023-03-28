import { GuideMeService } from './../../guide-me/guide-me.service';
import { Location } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, SubscriptionLike } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';

import { IPageComponent } from '../../shared/interfaces/page-component.interface';
import { StateStoreService } from '../../shared/Services/state-store.service';
import { PRODUCT_CATEGORY_INDEX } from '../direct.constants';
import { FBPixelService } from '../../shared/analytics/fb-pixel.service';
import { MobileModalComponent } from './../../guide-me/mobile-modal/mobile-modal.component';
import {
  CreateAccountModelComponent
} from './../../guide-me/recommendations/create-account-model/create-account-model.component';
import { AuthenticationService } from './../../shared/http/auth/authentication.service';
import { ToolTipModalComponent } from './../../shared/modal/tooltip-modal/tooltip-modal.component';
import { NavbarService } from './../../shared/navbar/navbar.service';
import { SelectedPlansService } from './../../shared/Services/selected-plans.service';
import { Formatter } from './../../shared/utils/formatter.util';
import { PlanWidgetComponent } from './../../shared/widgets/plan-widget/plan-widget.component';
import { SettingsWidgetComponent } from './../../shared/widgets/settings-widget/settings-widget.component';
import { DIRECT_ROUTE_PATHS } from './../direct-routes.constants';
import { DirectApiService } from './../direct.api.service';
import { DirectService } from './../direct.service';
import { DirectResultsState } from './direct-results.state';

const mobileThreshold = 567;

@Component({
  selector: 'app-direct-results',
  templateUrl: './direct-results.component.html',
  styleUrls: ['./direct-results.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DirectResultsComponent implements IPageComponent, OnInit, OnDestroy, AfterContentChecked {

  @Input() isMobileView: boolean;
  @ViewChildren('planWidget') planWidgets: QueryList<PlanWidgetComponent>;

  pageTitle: string;
  subTitle: string;

  routeSubscription: Subscription;
  locationSubscription: SubscriptionLike;
  state: DirectResultsState = new DirectResultsState();
  componentName: string;
  modalRef: NgbModalRef;

  filteredCountSubject = new Subject<any>();
  subscription: Subscription;
  filterCountSubscription: Subscription;
  backPressSubscription: Subscription;

  filteredResult = [];

  constructor(
    private directService: DirectService, private directApiService: DirectApiService,
    private fbPixelService: FBPixelService,
    private router: Router, private translate: TranslateService, public navbarService: NavbarService,
    public modal: NgbModal, private selectedPlansService: SelectedPlansService,
    private authService: AuthenticationService,
    private stateStoreService: StateStoreService, private location: Location, private guidemeService: GuideMeService,
    private changeDetector: ChangeDetectorRef) {

    /* ************** STATE HANDLING - START ***************** */
    this.componentName = DirectResultsComponent.name;

    this.routeSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.state.filteredResult = this.filteredResult;
        this.stateStoreService.saveState(this.componentName, this.state);
      } else if (event instanceof NavigationEnd) {

      }
    });
    if (this.stateStoreService.has(this.componentName)) {
      this.state = this.stateStoreService.getState(this.componentName);
      this.filteredResult = this.state.filteredResult;
    } else {
      this.state = new DirectResultsState();
    }

    this.locationSubscription = this.location.subscribe((popStateEvent: PopStateEvent) => {
      if (popStateEvent.type === 'popstate') {
        const eventSubscription = this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd && event.url === '/home') {
            this.stateStoreService.clearState(this.componentName);
            eventSubscription.unsubscribe();
          }
        });
      }
    });
    /* ************** STATE HANDLING - END ***************** */

    this.state.premiumFrequencyType = 'monthly';
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('RESULTS.TITLE');
      this.state.sortList = this.translate.instant('SETTINGS.SORT');
      this.state.filterTypes = this.translate.instant('SETTINGS.TYPES');
      this.state.sortProperty = this.state.sortList[0].value;
      this.setPageTitle(this.pageTitle);
      this.state.toolTips = this.translate.instant('FILTER_TOOLTIPS');

      this.state.filterTypes = this.translate.instant('SETTINGS.TYPES');
      this.state.filterModalData = this.translate.instant('FILTER_TOOLTIPS.CLAIM_CRITERIA');
      this.state.pageTitle = this.pageTitle;

      if (this.authService.isAuthenticated()) {
        this.initRecommendationsCall();
      } else {
        this.authService.authenticate().subscribe((token) => {
          this.initRecommendationsCall();
        });
      }
    });
    this.filterCountSubscription = this.filteredCountSubject.subscribe((planList) => {
      this.filteredResult = planList;
    });
    this.backPressSubscription = this.navbarService.subscribeBackPress().subscribe((event) => {});
  }

  initRecommendationsCall() {
    if (!this.stateStoreService.has(this.componentName) && (!this.state || !this.state.enquiryId)) {
      this.getRecommendations();
    }
  }

  ngOnInit() {
    this.state.isMobileView = this.state.isMobileView;
    setTimeout(() => {
      this.state.planWidgets = this.planWidgets;
    }, 500);

    this.subscription = this.navbarService.currentMobileModalEvent.subscribe((event) => {
      if (event === this.pageTitle) {
        this.showSettingsPopUp();
      }
    });
    if (window.innerWidth < mobileThreshold) {
      this.state.isMobileView = true;
    } else {
      this.state.isMobileView = false;
    }
  }

  ngAfterContentChecked() {
    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
    this.backPressSubscription.unsubscribe();
    this.subscription.unsubscribe();
    this.filterCountSubscription.unsubscribe();
    if (this.routeSubscription instanceof Subscription) {
      this.routeSubscription.unsubscribe();
    }

    try {
      this.locationSubscription.unsubscribe();
    } catch (e) {

    }

  }

  getRecommendations() {
    this.state.premiumFrequencyType = 'monthly';
    this.state.selectedCategory = this.directService.getProductCategory();
    this.directApiService.getSearchResults(this.directService.getProductCategory())
      .subscribe(
        (data) => {
          this.handleResponse(data);
          this.state.isResultsLoaded = true;
        },
        (error) => {
          this.state.resultsEmptyMessage = 'An error occurred. Please try again.';
          this.state.isResultsLoaded = true;
        });

    window.scroll(0, 0);
  }

  // tslint:disable-next-line:cognitive-complexity
  handleResponse(data) {
    if (data.responseMessage.responseCode === 6004) {
      this.state.enquiryId = data.objectList[0].enquiryId;
      this.state.resultsEmptyMessage = data.responseMessage.responseDescription;
      return;
    }
    if (this.state.selectedCategory.id === PRODUCT_CATEGORY_INDEX.CRITICAL_ILLNESS) {
      const { earlyCI } = this.directService.getCriticalIllnessForm();
      if (!earlyCI) {
        this.ciCoverDetailsPopup();
      }
    }
    this.state.resultsEmptyMessage = '';
    this.state.enquiryId = data.objectList[0].enquiryId;
    this.state.searchResult = data.objectList[0].productProtectionTypeList;
    this.filteredResult = this.state.searchResult;

    for (const productLists of data.objectList[0].productProtectionTypeList) {
      productLists.productList[0].bestValue = true;
      for (const productList of productLists.productList) {


        if (productList.insurer && productList.insurer.insurerName) {
          this.state.insurers[Formatter.createObjectKey(productList.insurer.insurerName)] = productList.insurer.insurerName;
        }
        if (productList.insurer && productList.insurer.rating) {
          this.state.insurersFinancialRating[Formatter.createObjectKey(productList.insurer.rating)] = productList.insurer.rating;
        }
        if (productList.premium && productList.premium.payoutDuration) {
          this.state.payoutYears[Formatter.createObjectKey(productList.premium.payoutDuration)] = productList.premium.payoutDuration;
        }
        if (productList.premium && productList.premium.retirementPayPeriodDisplay) {
          this.state.payoutPeriod[Formatter.createObjectKey(productList.premium.retirementPayPeriodDisplay)]
            = productList.premium.retirementPayPeriodDisplay;
        }
        if (productList.premium) {
          this.state.deferredPeriod[Formatter.createObjectKey(productList.premium.deferredPeriod)] = productList.premium.deferredPeriod;
        }
        if (productList.premium) {
          this.state.escalatingBenefit[Formatter.createObjectKey(productList.premium.escalatingBenefit)] =
            productList.premium.escalatingBenefit;
        }
        /*if (productList.rider && productList.rider.riderName) {
          this.state.fullPartialRider[Formatter.createObjectKey(productList.rider.riderName)] = productList.rider.riderName;
        }*/
        if (productList.insurer && productList.premium.claimFeature) {
          this.state.claimFeature[Formatter.createObjectKey(productList.premium.claimFeature)] = productList.premium.claimFeature;
        }
        if (productList.insurer && productList.premium.claimCriteria) {
          this.state.claimCriteria[Formatter.createObjectKey(productList.premium.claimCriteria)] = productList.premium.claimCriteria;
        }
      }
    }
    this.state.insurers = Object.values(this.state.insurers).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });
    this.state.insurersFinancialRating = Object.values(this.state.insurersFinancialRating).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });
    this.state.payoutYears = Object.values(this.state.payoutYears).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });
    this.state.payoutPeriod = Object.values(this.state.payoutPeriod).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });
    this.state.claimFeature = Object.values(this.state.claimFeature).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });
    this.state.deferredPeriod = Object.values(this.state.deferredPeriod).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });
    this.state.escalatingBenefit = Object.values(this.state.escalatingBenefit).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });
    /*this.state.fullPartialRider = Object.values(this.state.fullPartialRider).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });*/
    this.state.claimCriteria = Object.values(this.state.claimCriteria).map((key) => {
      return { value: key, checked: key === 'All' ? true : false };
    });

    const premiumFrequency = {
      title: this.state.filterTypes.PREMIUM_FREQUENCY, name: 'premiumFrequency',
      filterTypes: this.state.premiumFrequency, allBtn: false
    };
    const insurers = {
      title: this.state.filterTypes.INSURERS, name: 'insurerName',
      filterTypes: this.state.insurers, allBtn: true
    };
    const insurersFinancialRating = {
      title: this.state.filterTypes.INSURANCE_FINANCIAL_RATING, name: 'financialRating',
      filterTypes: this.state.insurersFinancialRating, allBtn: true
    };
    const claimFeature = {
      title: this.state.filterTypes.CLAIM_FEATURE,
      toolTip: { title: this.state.filterTypes.CLAIM_FEATURE, message: this.state.toolTips.CLIAM_FEATURE },
      name: 'claimFeature',
      filterTypes: this.state.claimFeature, allBtn: true
    };
    const deferredPeriod = {
      title: this.state.filterTypes.DEFERRED_PERIOD, toolTip:
        { title: this.state.filterTypes.DEFERRED_PERIOD, message: this.state.toolTips.DEFERRED_PERIOD },
      name: 'deferredPeriod',
      filterTypes: this.state.deferredPeriod, allBtn: true
    };
    const escalatingBenefit = {
      title: this.state.filterTypes.ESCALATING_BENEFIT,
      toolTip: { title: this.state.filterTypes.ESCALATING_BENEFIT, message: this.state.toolTips.ESCALATING_BENEFIT },
      name: 'escalatingBenefit',
      filterTypes: this.state.escalatingBenefit, allBtn: true
    };
    const payoutYears = {
      title: this.state.filterTypes.PAYOUT_YEARS, name: 'payoutYears',
      filterTypes: this.state.payoutYears, allBtn: true
    };
    const payoutPeriod = {
      title: this.state.filterTypes.PAYOUT_YEARS, name: 'payoutPeriod',
      filterTypes: this.state.payoutPeriod, allBtn: true
    };
    const claimCriteria = {
      title: this.state.filterTypes.CLAIM_CRITERIA, toolTip:
        { title: this.state.filterTypes.CLAIM_CRITERIA, message: this.state.toolTips.CLAIM_CRITERIA },
      name: 'claimCriteria',
      filterTypes: this.state.claimCriteria, allBtn: true
    };

    this.directService.setPremiumFrequencyFilter('monthly');

    this.state.filters.push(premiumFrequency);
    this.state.filters.push(insurers);
    this.state.filters.push(insurersFinancialRating);
    switch (this.state.selectedCategory.id) {
      case PRODUCT_CATEGORY_INDEX.CRITICAL_ILLNESS:
        this.state.filters.push(claimFeature);
        break;
      case PRODUCT_CATEGORY_INDEX.OCCUPATIONAL_DISABILITY:
        delete this.state.filters[1];
        delete this.state.filters[2];
        this.state.filters.push(deferredPeriod);
        this.state.filters.push(escalatingBenefit);
        break;
      case PRODUCT_CATEGORY_INDEX.HOSPITAL_PLAN:
        delete this.state.filters[0];
        /*this.state.filters.push(fullPartialRider);*/
        this.directService.setPremiumFrequencyFilter('yearly');
        break;
      case PRODUCT_CATEGORY_INDEX.LONG_TERM_CARE:
        delete this.state.filters[0];
        this.state.filters.push(payoutYears);
        this.state.filters.push(claimCriteria);
        this.directService.setPremiumFrequencyFilter('yearly');
        break;
      case PRODUCT_CATEGORY_INDEX.EDUCATION_FUND:
        delete this.state.filters[0];
        break;
      case PRODUCT_CATEGORY_INDEX.RETIREMENT_INCOME:
        this.state.filters.push(payoutPeriod);
        break;
      case PRODUCT_CATEGORY_INDEX.SRS_PLANS:
        delete this.state.filters[0];
        break;
    }
    this.state.filters = this.state.filters.filter(() => true);
  }

  ciCoverDetailsPopup() {
    this.modalRef = this.modal.open(ToolTipModalComponent, { centered: true });
    this.modalRef.componentInstance.tooltipTitle = this.translate.instant('CRITICAL_ILLNESS.POPUP.TITLE');
    this.modalRef.componentInstance.tooltipMessage = this.translate.instant('CRITICAL_ILLNESS.POPUP.MESSAGE'); 
  }

  setPageTitle(title: string) {
    setTimeout(() => {
      this.navbarService.setPageTitle(title, null, false, true);
    }, 0);
  }

  showSettingsPopUp() {
    const ref = this.modal.open(SettingsWidgetComponent, {
      centered: true,
      windowClass: 'settings-modal-dialog'
    });
    ref.componentInstance.filters = this.state.filters;
    ref.componentInstance.sort = this.state.sortList;
    ref.componentInstance.isMobile = true;
    ref.componentInstance.selectedFilterList = this.state.selectedFilterList;
    ref.componentInstance.filterProducts.subscribe((data) => {
      if (data !== null) {
        this.filterProducts(data);
      }
      ref.dismiss();
    });
    ref.componentInstance.showFilterTooltip.subscribe((toolTip) => {
      this.showSettingsToolTip(toolTip);
    });
    this.navbarService.showMobilePopUp('removeClicked');
  }

  showSettingsToolTip(toolTip) {
    if (toolTip !== null && toolTip !== '') {
      if (toolTip.title === this.state.filterTypes.CLAIM_CRITERIA) {
        const ref1 = this.modal.open(MobileModalComponent, {
          centered: true,
          windowClass: 'settings-tooltip-dialog'
        });
        ref1.componentInstance.mobileTitle = this.state.filterModalData.TITLE;
        ref1.componentInstance.description = this.state.filterModalData.DESCRIPTION;
        ref1.componentInstance.icon_description = this.state.filterModalData.LOGO_DESCRIPTION;
      } else {
        const ref1 = this.modal.open(ToolTipModalComponent, { centered: true });
        ref1.componentInstance.tooltipTitle = toolTip.title;
        ref1.componentInstance.tooltipMessage = toolTip.message;
      }
    }
  }

  editProdInfo() {

  }

  viewDetails(plan) {
  }

  selectPlan(data) {
    const index: number = this.state.selectedPlans.indexOf(data.plan);
    if (data.selected) {
      if (index === -1) {
        this.state.selectedPlans.push(data.plan);
      }
    } else {
      if (index !== -1) {
        this.state.selectedPlans.splice(index, 1);
      }
    }
    this.updateSelectedPlanData(data.plan);
  }

  updateSelectedPlanData(plan) {
    this.state.selectedPlans = this.state.selectedPlans
      .map((item) => {
        if (item.id === plan.id && item.premium.ranking === plan.premium.ranking) {
          return plan;
        }
        return item;
      });
  }

  comparePlan(data) {
    if (data.selected) {
      this.state.selectedComparePlans.push(data.plan);
    } else {
      const index: number = this.state.selectedComparePlans.indexOf(data.plan);
      if (index !== -1) {
        this.state.selectedComparePlans.splice(index, 1);
      }
    }
    this.updateComparePlanData(data.plan);
  }

  compare() {
    this.directService.setProtectionType(this.state.searchResult[0]['protectionType']);
    this.directService.setSelectedPlans(this.state.selectedComparePlans);
    this.router.navigate([DIRECT_ROUTE_PATHS.COMPARE_PLANS]);
  }

  updateComparePlanData(plan) {
    this.state.selectedComparePlans = this.state.selectedComparePlans
      // tslint:disable-next-line:no-identical-functions
      .map((item) => {
        if (item.id === plan.id && item.premium.ranking === plan.premium.ranking) {
          return plan;
        }
        return item;
      });
  }

  proceedSelection() {
    let enquiryProtectionTypeData;
    if (this.state.selectedPlans.length > 0) {
      enquiryProtectionTypeData = [];
    } else {
      const getDirectFormData = this.directService.getDirectFormData();
      enquiryProtectionTypeData = [{protectionTypeId: getDirectFormData.prodCategory.id, protectionType:  getDirectFormData.prodCategory.prodCatName}];
    }
    this.selectedPlansService.setSelectedPlan(this.state.selectedPlans, this.state.enquiryId, enquiryProtectionTypeData);
    this.fbPixelService.track('ProceedEnquiry');
    if (this.authService.isSignedUser()) {
      this.selectedPlansService.updateInsuranceEnquiry().subscribe((data) => {
        if (data.responseMessage.responseCode === 6000) {
          this.selectedPlansService.clearData();
          this.directService.clearServiceData();
          this.guidemeService.clearServiceData();
          this.stateStoreService.clearState(this.componentName);
          this.router.navigate(['email-enquiry/success']);
        }
      });
    } else {
      const modalRef = this.modal.open(CreateAccountModelComponent, {
        centered: true
      });
      modalRef.componentInstance.data = this.state.selectedPlans.length;
    }
  }

  toggleComparePlans() {
    if (!this.state.isComparePlanEnabled) {
      this.state.isViewMode = true;
    } else {
      this.state.isViewMode = false;
    }
    this.state.isComparePlanEnabled = !this.state.isComparePlanEnabled;
    this.resetUI();
  }

  resetUI() {
    this.state.selectedPlans = [];
    this.state.selectedComparePlans = [];
    this.state.planWidgets.forEach((widget) => {
      widget.unselectPlan();
    });
    window.scroll(0, 0);
  }

  filterProducts(data: any) {
    this.state.selectedFilterList = data.filters;
    if (this.state.selectedFilterList['premiumFrequency']) {
      const frequency: string[] = Array.from(this.state.selectedFilterList['premiumFrequency']);
      this.directService.setPremiumFrequencyFilter(frequency[0]);
    }
    this.state.filterArgs = data.filters;
    if (this.state.filterArgs.premiumFrequency && this.state.filterArgs.premiumFrequency.size > 0) {
      this.state.premiumFrequencyType = Array.from(this.state.filterArgs.premiumFrequency)[0];
      this.state.filterArgs.premiumFrequency.clear();
    }
    this.state.sortProperty = data.sortProperty;
    this.state.selectedComparePlans = [];
    this.state.selectedPlans = [];
    this.resetUI();
  }
}
