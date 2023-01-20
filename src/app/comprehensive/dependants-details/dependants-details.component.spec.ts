
import { waitForAsync, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Location, DatePipe, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtModule, JwtHelperService } from '@auth0/angular-jwt';
import { NgbActiveModal, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppService } from '../../app.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { ComprehensiveService } from '../comprehensive.service';
import { FooterService } from './../../shared/footer/footer.service';
import { AuthenticationService } from './../../shared/http/auth/authentication.service';
import { NavbarService } from './../../shared/navbar/navbar.service';
import { tokenGetterFn, mockCurrencyPipe } from '../../../assets/mocks/service/shared-service';
import { HeaderService } from './../../shared/header/header.service';
import { createTranslateLoader } from '../comprehensive.module';
import { ApiService } from './../../shared/http/api.service';
import { StepIndicatorComponent } from './../../shared/components/step-indicator/step-indicator.component';
import { AboutAge } from './../../shared/utils/about-age.util';
import { RoutingService } from './../../shared/Services/routing.service';
import { FileUtil } from './../../shared/utils/file.util';
class MockRouter {
  navigateByUrl(url: string) { return url; }
}

import { DependantsDetailsComponent } from './dependants-details.component';
import { NgbDateCustomParserFormatter } from './../../shared/utils/ngb-date-custom-parser-formatter';

describe('DependantsDetailsComponent', () => {
  let component: DependantsDetailsComponent;
  let fixture: ComponentFixture<DependantsDetailsComponent>;
  let injector: Injector;
  let location: Location;
  let ngbModalService: NgbModal;
  let ngbModalRef: NgbModalRef;
  let formBuilder: FormBuilder;
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
  const route = ({ routeConfig: { component: { name: 'DependantsDetailsComponent' } } } as any) as ActivatedRoute;
  let httpClientSpy;
  let currencyPipe: CurrencyPipe;
  const mockAppService = {
    setJourneyType(type) {
      return true;
    }
  };
  let translations = require('../../../assets/i18n/comprehensive/en.json');
  const routerStub = {
    navigate: jasmine.createSpy('navigate'),
    navigateByUrl: jasmine.createSpy('navigateByUrl')
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DependantsDetailsComponent, ErrorModalComponent, StepIndicatorComponent],
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
        RouterTestingModule.withRoutes([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        NgbModal,
        NgbActiveModal,
        DependantsDetailsComponent,
        ApiService,
        AuthenticationService,
        TranslateService,
        CurrencyPipe,
        DatePipe,
        NgbDateCustomParserFormatter,
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
        FileUtil,
        { provide: ActivatedRoute, useValue: route }
      ]
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [ErrorModalComponent, StepIndicatorComponent] } })
      .compileComponents();
    router = TestBed.get(Router);
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(DependantsDetailsComponent);
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
    comprehensiveService = TestBed.get(ComprehensiveService);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
    translateService.setTranslation('en', translations);
    translateService.use('en');
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    const summaryData: any = { comprehensiveEnquiry: { enquiryId: 131297, sessionTrackerId: 55877, type: 'Comprehensive-Lite', hasComprehensive: true, hasDependents: false, hasEndowments: '0', hasRegularSavingsPlans: false, generatedTokenForReportNotification: null, stepCompleted: 4, subStepCompleted: 0, reportStatus: 'edit', isValidatedPromoCode: false, homeLoanUpdatedByLiabilities: null, isLocked: false, isDobUpdated: true, dobPopUpEnable: false, isDobChangedInvestment: null, isConfirmationEmailSent: null, paymentStatus: null, reportSubmittedTimeStamp: '2020-05-06T21:31:35.000+0000' }, baseProfile: { firstName: 'rini', lastName: 'test', dateOfBirth: '06/10/1988', dateOfBirthInvestment: '06/10/1988', nation: null, gender: 'male', genderInvestment: 'male', email: 'mo2uatapr2_1@yopmail.com', mobileNumber: '8998110734', nationalityStatus: 'Singapore PR', dobUpdateable: false, journeyType: 'Investment', smoker: false }, "dependentsSummaryList": { "dependentsList": [], "noOfHouseholdMembers": 2, "houseHoldIncome": "Below $2,000", "noOfYears": 0 }, "dependentEducationPreferencesList": [], comprehensiveIncome: { enquiryId: 131297, employmentType: 'Employed', monthlySalary: 70000.0, monthlyRentalIncome: 0.0, otherMonthlyWorkIncome: 0.0, otherMonthlyIncome: 0.0, annualBonus: null, annualDividends: 0.0, otherAnnualIncome: 0.0 }, comprehensiveSpending: { enquiryId: 131297, monthlyLivingExpenses: 60000.0, adHocExpenses: null, homeLoanPayOffUntil: null, mortgagePaymentUsingCPF: 0.0, mortgagePaymentUsingCash: 0.0, mortgageTypeOfHome: '', mortgagePayOffUntil: null, carLoanPayment: 0.0, carLoanPayoffUntil: null, otherLoanPayment: null, otherLoanPayoffUntil: null, HLMortgagePaymentUsingCPF: null, HLMortgagePaymentUsingCash: null, HLtypeOfHome: '' }, comprehensiveRegularSavingsList: [], comprehensiveDownOnLuck: { enquiryId: 131297, badMoodMonthlyAmount: 300.0, hospitalPlanId: 2, hospitalPlanName: 'Government Hospital Ward A' }, comprehensiveAssets: { enquiryId: 131297, cashInBank: 7000.0, savingsBonds: 8000.0, cpfOrdinaryAccount: null, cpfSpecialAccount: null, cpfMediSaveAccount: null, cpfRetirementAccount: null, schemeType: null, estimatedPayout: null, topupAmount: null, withdrawalAmount: null, retirementSum: null, homeMarketValue: 0.0, investmentPropertiesValue: 0.0, assetsInvestmentSet: [{ assetId: 628, typeOfInvestment: 'MoneyOwl - Equity', investmentAmount: null }], otherAssetsValue: 0.0, source: 'MANUAL' }, comprehensiveLiabilities: { enquiryId: 131297, homeLoanOutstandingAmount: null, otherPropertyLoanOutstandingAmount: 0.0, otherLoanOutstandingAmount: null, carLoansAmount: 0.0 }, comprehensiveInsurancePlanning: null, comprehensiveRetirementPlanning: { enquiryId: 131297, retirementAge: '45', haveOtherSourceRetirementIncome: null, retirementIncomeSet: [], lumpSumBenefitSet: [] } };
    comprehensiveService.setComprehensiveSummary(summaryData);
    spyOn(comprehensiveService, 'getMyDependant').and.returnValue([]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('ngOnInit', () => {
    component.ngOnInit();
  });
  it('ngOnDestroy', () => {
    component.ngOnDestroy();
  });
  it('selectHouseHoldIncome', () => {
    component.buildDependantForm();
  });
  it('getCurrentFormsCount', () => {
    component.getCurrentFormsCount();
  });
  it('showSummaryModal', () => {
    component.showSummaryModal();
  });
  it('Select Relationship', () => {
    component.selectRelationship("brother", 0);
  });
  it('Select Relationship', () => {
    component.selectGender("male", 0);
  });
  it(' selectNationality', () => {
    component.selectNationality("singaporean", 0);
  });
  it(' buildDependantDetailsForm', () => {
    component.buildDependantDetailsForm(component.myDependantForm);
  });
  it(' buildDependantDetailsForm', () => {
    component.buildEmptyForm();
  });
  it(' addDependant', () => {
    component.addDependant();
  });
  it(' removeDependant', () => {
    component.removeDependant(0);
  });
  it(' validateDependantForm', () => {
    component.validateDependantForm(component.myDependantForm);
  });
  it(' goToNext', () => {
    component.goToNext(component.myDependantForm);
  });
  it(' goToNextPage', () => {
    component.goToNextPage();
  });
  it(' showSummaryModal', () => {
    component.showSummaryModal();
  });
  it(' getWrapText', () => {
    component.getWrapText('Name-');
  });
  it(' setDependentName', () => {
    component.setDependentName('Name  ', 0);
  });
  it(' onKeyPressEvent', () => {
    component.onKeyPressEvent(Event, "Name");
  });
  it(' onChange', () => {
    component.onChange(Event);
  });
  it(' setCaratTo', () => {
    component.setCaratTo(60, 'position', 'dependentName');
  });
  it('should set page title', () => {
    const setPageTitleSpy = spyOn(navbarService, 'setPageTitleWithIcon');
    component.setPageTitle('CMP.COMPREHENSIVE_STEPS.STEP_1_TITLE');
    expect(setPageTitleSpy).toHaveBeenCalledWith('CMP.COMPREHENSIVE_STEPS.STEP_1_TITLE', { id: 'DependantsDetailsComponent', iconClass: 'navbar__menuItem--journey-map' });
  });
});
