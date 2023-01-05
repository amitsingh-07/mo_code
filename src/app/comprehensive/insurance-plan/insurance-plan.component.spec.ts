
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Router, Routes, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtModule, JwtHelperService } from '@auth0/angular-jwt';
import { NgbActiveModal, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { LoaderService } from './../../shared/components/loader/loader.service';
import { ProgressTrackerService } from './../../shared/modal/progress-tracker/progress-tracker.service';
import { NavbarService } from './../../shared/navbar/navbar.service';
import { ComprehensiveApiService } from './../comprehensive-api.service';
import { ComprehensiveService } from './../comprehensive.service';

import { CurrencyPipe } from '@angular/common';

import { tokenGetterFn, mockCurrencyPipe } from
  '../../../assets/mocks/service/shared-service';

import { FooterService } from './../../shared/footer/footer.service';
import { HeaderService } from './../../shared/header/header.service';
import { createTranslateLoader } from '../comprehensive.module';
import { AppService } from './../../app.service';
import { ApiService } from './../../shared/http/api.service';
import { AuthenticationService } from './../../shared/http/auth/authentication.service';

import { ErrorModalComponent } from './../../shared/modal/error-modal/error-modal.component';
import { StepIndicatorComponent } from './../../shared/components/step-indicator/step-indicator.component';
import { COMPREHENSIVE_ROUTES } from './../comprehensive-routes.constants';
import { AboutAge } from './../../shared/utils/about-age.util';
import { RoutingService } from './../../shared/Services/routing.service';

import { InsurancePlanComponent } from './insurance-plan.component';
export class TestComponent {
}
export const routes: Routes = [
  {
    path: COMPREHENSIVE_ROUTES.BAD_MOOD_FUND,
    component: TestComponent
  },
  { path: COMPREHENSIVE_ROUTES.REGULAR_SAVING_PLAN, component: TestComponent },
  { path: COMPREHENSIVE_ROUTES.STEPS + '/3', component: TestComponent },
];
class MockRouter {
  navigateByUrl(url: string) { return url; }
}

// tslint:disable-next-line: max-classes-per-file
export class RouterStub {
  public url: string = COMPREHENSIVE_ROUTE_PATHS.REGULAR_SAVING_PLAN;
  constructor() { }
  navigate(url: any) {
    return this.url = url;
  }
}


describe('InsurancePlanComponent', () => {
  let component: InsurancePlanComponent;
  let fixture: ComponentFixture<InsurancePlanComponent>;
  let injector: Injector;
  let location: Location;
  let ngbModalService: NgbModal;
  let ngbModalRef: NgbModalRef;
  let formBuilder: FormBuilder;


  let comp: InsurancePlanComponent;
  let progressTrackerService: ProgressTrackerService;
  let footerService: FooterService;
  let translateService: TranslateService;
  let http: HttpTestingController;
  let navbarService: NavbarService;
  let appService: AppService;
  let authService: AuthenticationService;
  let apiService: ApiService;
  let comprehensiveService: ComprehensiveService;
  let loader: LoaderService;
  let comprehensiveAPiService: ComprehensiveApiService;
  let router: Router;
  const route = ({ routeConfig: { component: { name: 'InsurancePlanComponent'} } } as any) as ActivatedRoute;
  let httpClientSpy;
  let currencyPipe: CurrencyPipe;
  const mockAppService = {
    setJourneyType(type) {
      return true;
    }
  };
  //let translations: any = '';
  let translations = require('../../../assets/i18n/comprehensive/en.json');

  const routerStub = {
    navigate: jasmine.createSpy('navigate'),
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InsurancePlanComponent, ErrorModalComponent, StepIndicatorComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: createTranslateLoader,
            deps: [HttpClient]
          }
        }),
        NgbModule,
        JwtModule.forRoot({
          config: {
            tokenGetter: tokenGetterFn
          }
        }),
        HttpClientTestingModule,
        //RouterTestingModule.withRoutes(routes),
        RouterTestingModule.withRoutes([]),
        //RouterModule.forRoot(routes)
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        NgbModal,
        NgbActiveModal,
        InsurancePlanComponent,
        ApiService,
        AuthenticationService,
        TranslateService,
        CurrencyPipe,
        { provide: CurrencyPipe, useValue: mockCurrencyPipe },
        { provide: AppService, useValue: mockAppService },
        FooterService,
        NavbarService,
        HeaderService,
        LoaderService,
        FormBuilder,
        ComprehensiveService,
        ComprehensiveApiService,
        AboutAge,
        RoutingService,
        JwtHelperService,
        ProgressTrackerService,
       // { provide: APP_BASE_HREF, useValue: '/' },
       // { provide: Router, useClass: RouterStub },

       {provide: ActivatedRoute, useValue: route}
      ]
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [ErrorModalComponent, StepIndicatorComponent] } })
      .compileComponents();
    router = TestBed.get(Router);	
    //router.initialNavigation();
    //spyOn(router, 'navigateByUrl');
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsurancePlanComponent);
    component = fixture.componentInstance;

    ngbModalService = TestBed.get(NgbModal);
    injector = getTestBed();
    loader = TestBed.get(LoaderService);
    location = TestBed.get(Location);
    http = TestBed.get(HttpTestingController);
    formBuilder = TestBed.get(FormBuilder);

    appService = TestBed.get(AppService);
    apiService = TestBed.get(ApiService);
    authService = TestBed.get(AuthenticationService);
    navbarService = TestBed.get(NavbarService);
    footerService = TestBed.get(FooterService);
    translateService = injector.get(TranslateService);
	//translateService.use('en');
    comprehensiveService = TestBed.get(ComprehensiveService);
    //comprehensiveAPiService = TestBed.get(comprehensiveAPiService);
    progressTrackerService = TestBed.get(ProgressTrackerService);
    //router = new RouterStub();
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    
	
    translateService.setTranslation('en', translations);
	translateService.use('en');

  });

  afterEach(() => {
    TestBed.resetTestingModule();
    const summaryData: any = {
      comprehensiveEnquiry: { enquiryId: 131297, sessionTrackerId: 55877, type: 'Comprehensive-Lite', hasComprehensive: true, hasDependents: true, hasEndowments: '1', hasRegularSavingsPlans: false, generatedTokenForReportNotification: null, stepCompleted: 4, subStepCompleted: 0, reportStatus: 'edit', isValidatedPromoCode: false, homeLoanUpdatedByLiabilities: null, isLocked: false, isDobUpdated: true, dobPopUpEnable: false, isDobChangedInvestment: null, isConfirmationEmailSent: null, paymentStatus: null, reportSubmittedTimeStamp: '2020-05-06T21:31:35.000+0000' }, baseProfile: { firstName: 'rini', lastName: 'test', dateOfBirth: '06/10/1988', dateOfBirthInvestment: '06/10/1988', nation: null, gender: 'male', genderInvestment: 'male', email: 'mo2uatapr2_1@yopmail.com', mobileNumber: '8998110734', nationalityStatus: 'Singapore PR', dobUpdateable: false, journeyType: 'Investment', smoker: false }, dependentsSummaryList: {
        dependentsList: [{
          id: 1,
          customerId: 0,
          name: "Navin",
          relationship: 'Brother',
          gender: 'Male',
          dateOfBirth: '25/12/1996',
          nation: 'singaporean'
        }], noOfHouseholdMembers: 2, houseHoldIncome: "Below $2,000", noOfYears: 0
      }, dependentEducationPreferencesList: [{
        id: 0,
        dependentId: 1,
        enquiryId: 131297,
        location: 'singapore',
        educationCourse: null,
        educationSpendingShare: 50,
        endowmentMaturityAmount: 100,
        endowmentMaturityYears: 2021
      }], comprehensiveIncome: { enquiryId: 131297, employmentType: 'Employed', monthlySalary: 70000.0, monthlyRentalIncome: 0.0, otherMonthlyWorkIncome: 0.0, otherMonthlyIncome: 0.0, annualBonus: null, annualDividends: 0.0, otherAnnualIncome: 0.0 }, comprehensiveSpending: { enquiryId: 131297, monthlyLivingExpenses: 60000.0, adHocExpenses: null, homeLoanPayOffUntil: null, mortgagePaymentUsingCPF: 0.0, mortgagePaymentUsingCash: 0.0, mortgageTypeOfHome: '', mortgagePayOffUntil: null, carLoanPayment: 0.0, carLoanPayoffUntil: null, otherLoanPayment: null, otherLoanPayoffUntil: null, HLMortgagePaymentUsingCPF: null, HLMortgagePaymentUsingCash: null, HLtypeOfHome: '' }, comprehensiveRegularSavingsList: [], comprehensiveDownOnLuck: { enquiryId: 131297, badMoodMonthlyAmount: 300.0, hospitalPlanId: 2, hospitalPlanName: 'Government Hospital Ward A' }, comprehensiveAssets: { enquiryId: 131297, cashInBank: 7000.0, savingsBonds: 8000.0, cpfOrdinaryAccount: null, cpfSpecialAccount: null, cpfMediSaveAccount: null, cpfRetirementAccount: null, schemeType: null, estimatedPayout: null, topupAmount: null, withdrawalAmount: null, retirementSum: null, homeMarketValue: 0.0, investmentPropertiesValue: 0.0, assetsInvestmentSet: [{ assetId: 628, typeOfInvestment: 'MoneyOwl - Equity', investmentAmount: null }], otherAssetsValue: 0.0, source: 'MANUAL' }, comprehensiveLiabilities: { enquiryId: 131297, homeLoanOutstandingAmount: null, otherPropertyLoanOutstandingAmount: 0.0, otherLoanOutstandingAmount: null, carLoansAmount: 0.0 }, comprehensiveInsurancePlanning: null, comprehensiveRetirementPlanning: { enquiryId: 131297, retirementAge: '45', haveOtherSourceRetirementIncome: null, retirementIncomeSet: [], lumpSumBenefitSet: [] }
    };
    comprehensiveService.setComprehensiveSummary(summaryData);

    spyOn(comprehensiveService, 'getMyDependant').and.returnValue([]);
    spyOn(comprehensiveService, 'getMyProfile').and.returnValue([]);

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('form invalid when empty', () => {
    expect(component.insurancePlanForm.valid).toBeFalsy();
  });

  it('should trigger ngOnInit', () => {	
    const setNavbarModeSpy = spyOn(navbarService, 'setNavbarComprehensive');
    component.ngOnInit();
      progressTrackerService.setProgressTrackerData(comprehensiveService.generateProgressTrackerData());
    progressTrackerService.setReadOnly(true);
    navbarService.setNavbarComprehensive(true);

    expect(setNavbarModeSpy).toHaveBeenCalledWith(true);
  });


  it('should buildInsuranceForm', () => {
    component.buildInsuranceForm();
  });
  it('should buildInsuranceForm', () => {
    component.resetHDBScheme();
  });
  it('should resetLifeProtectionAmount', () => {
    component.resetLifeProtectionAmount();
  });
  it('should resetLongTermShieldAmount', () => {
    component.resetLongTermShieldAmount();
  });
  it('should showSummaryModal', () => {
    component.showSummaryModal();
  });
  it('should buildInsuranceForm', () => {
    component.showToolTipModal('CPF_TITLE','CPF_MESSAGE');
  });
  it('should trigger goToNext true', () => {
    component.viewMode = true;
    component.goToNext(component.insurancePlanForm);
  });
  
  it('should trigger goToNext false', () => {
    component.viewMode = false;
    component.goToNext(component.insurancePlanForm);
  });

  it('should trigger ngOnDestroy', () => {
    component.ngOnDestroy();
  });
    
  it('should set page title', () => {
    const setPageTitleSpy = spyOn(navbarService, 'setPageTitleWithIcon');
    component.setPageTitle('CMP.COMPREHENSIVE_STEPS.STEP_3_TITLE');
    expect(setPageTitleSpy).toHaveBeenCalledWith('CMP.COMPREHENSIVE_STEPS.STEP_3_TITLE', { id:  'InsurancePlanComponent', iconClass: 'navbar__menuItem--journey-map' });
  });
  
  

 
});

  