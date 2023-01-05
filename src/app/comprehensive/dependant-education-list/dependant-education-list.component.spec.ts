
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Location, APP_BASE_HREF, DatePipe, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { Router, Routes, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtModule, JwtHelperService } from '@auth0/angular-jwt';
import { NgbActiveModal, NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppService } from '../../app.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { ComprehensiveService } from '../comprehensive.service';
import { FooterService } from './../../shared/footer/footer.service';
import { AuthenticationService } from './../../shared/http/auth/authentication.service';
import { NavbarService } from './../../shared/navbar/navbar.service';




import { tokenGetterFn, mockCurrencyPipe } from
  '../../../assets/mocks/service/shared-service';


import { HeaderService } from './../../shared/header/header.service';
import { createTranslateLoader } from '../comprehensive.module';

import { ApiService } from './../../shared/http/api.service';

import { StepIndicatorComponent } from './../../shared/components/step-indicator/step-indicator.component';
import { COMPREHENSIVE_ROUTES } from './../comprehensive-routes.constants';
import { AboutAge } from './../../shared/utils/about-age.util';
import { RoutingService } from './../../shared/Services/routing.service';

import { FileUtil } from './../../shared/utils/file.util';




export class TestComponent {
}
export const routes: Routes = [
  {
    path: COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_SELECTION_SUMMARY,
    component: TestComponent
  },
  { path: COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_SELECTION_SUMMARY + '/summary', component: TestComponent },
  { path: COMPREHENSIVE_ROUTES.STEPS + '/2', component: TestComponent },
];
class MockRouter {
  navigateByUrl(url: string) { return url; }
}

export class RouterStub {
  public url: string = COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_SELECTION_SUMMARY;
  constructor() { }
  navigate(url: any) {
    return this.url = url;
  }
}
import { DependantEducationListComponent } from './dependant-education-list.component';

describe('DependantEducationListComponent', () => {
  let component: DependantEducationListComponent;
  let fixture: ComponentFixture<DependantEducationListComponent>;

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
  const route = ({ routeConfig: { component: { name: 'DependantEducationListComponent' } } } as any) as ActivatedRoute;
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
      declarations: [DependantEducationListComponent, ErrorModalComponent, StepIndicatorComponent],
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
        DependantEducationListComponent,
        ApiService,
        AuthenticationService,
        TranslateService,
        CurrencyPipe,
        DatePipe,
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

        { provide: APP_BASE_HREF, useValue: '/' },
       { provide: Router, useClass: RouterStub },

        { provide: ActivatedRoute, useValue: route }
      ]
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [ErrorModalComponent, StepIndicatorComponent] } })
      .compileComponents();
    router = TestBed.get(Router);
    //router.initialNavigation();
    //spyOn(router, 'navigateByUrl');
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(DependantEducationListComponent);
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

    //router = new RouterStub();
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);


    translateService.setTranslation('en', translations);
    translateService.use('en');
    fixture.detectChanges();
  });


  afterEach(() => {
    TestBed.resetTestingModule();
    const summaryData: any =  {"comprehensiveEnquiry":{"enquiryId":130580,"sessionTrackerId":51756,"type":"Comprehensive","hasComprehensive":true,"hasDependents":true,"hasEndowments":"1","hasRegularSavingsPlans":true,"generatedTokenForReportNotification":null,"stepCompleted":4,"subStepCompleted":0,"reportStatus":"submitted","isValidatedPromoCode":true,"homeLoanUpdatedByLiabilities":false,"isLocked":true,"isDobUpdated":false,"dobPopUpEnable":false,"isDobChangedInvestment":null,"isConfirmationEmailSent":true,"paymentStatus":"PENDING","reportSubmittedTimeStamp":"2020-12-08T04:34:48.000+0000"},"baseProfile":{"firstName":"sws m","lastName":"sws","dateOfBirth":"25/04/1969","dateOfBirthInvestment":"","nation":null,"gender":"male","genderInvestment":"","email":"ntpraveen22@yopmail.com","mobileNumber":"98982222","nationalityStatus":"Others","dobUpdateable":true,"journeyType":null,"staff":false,"smoker":false},"dependentsSummaryList":{"dependentsList":[{"id":5723,"enquiryId":130580,"name":"ch","relationship":"Child","gender":"Female","dateOfBirth":"24/12/2004","nation":"Singaporean","isInsuranceNeeded":false},{"id":5724,"enquiryId":130580,"name":"ede","relationship":"Parent","gender":"Male","dateOfBirth":"23/05/1987","nation":"Singaporean","isInsuranceNeeded":false}],"noOfHouseholdMembers":3,"houseHoldIncome":"$5,001 to $6,500","noOfYears":null},"dependentEducationPreferencesList":[{"id":1399,"dependentId":5723,"enquiryId":130580,"location":"Singapore","educationCourse":"Medicine","endowmentMaturityAmount":1000.0,"endowmentMaturityYears":2020,"educationSpendingShare":53}],"comprehensiveIncome":{"enquiryId":130580,"employmentType":"Employed","monthlySalary":10000.0,"monthlyRentalIncome":0.0,"otherMonthlyWorkIncome":600.0,"otherMonthlyIncome":null,"annualBonus":8887.0,"annualDividends":88.0,"otherAnnualIncome":80.0},"comprehensiveSpending":{"enquiryId":130580,"monthlyLivingExpenses":4000.0,"adHocExpenses":700.0,"homeLoanPayOffUntil":2020,"mortgagePaymentUsingCPF":null,"mortgagePaymentUsingCash":null,"mortgageTypeOfHome":null,"mortgagePayOffUntil":null,"carLoanPayment":77.0,"carLoanPayoffUntil":2020,"otherLoanPayment":22.0,"otherLoanPayoffUntil":2020,"HLMortgagePaymentUsingCPF":77.0,"HLMortgagePaymentUsingCash":1000.0,"HLtypeOfHome":"New HDB"},"comprehensiveRegularSavingsList":[{"enquiryId":130580,"portfolioType":"MoneyOwl - Equity","amount":55.0,"fundType":"Cash"},{"enquiryId":130580,"portfolioType":"","amount":null,"fundType":null},{"enquiryId":130580,"portfolioType":"","fundType":null,"amount":null}],"comprehensiveDownOnLuck":{"enquiryId":130580,"badMoodMonthlyAmount":500.0,"hospitalPlanId":5,"hospitalPlanName":"Government Hospital Ward B2/C"},"comprehensiveAssets":{"enquiryId":130580,"cashInBank":100.0,"savingsBonds":200.0,"cpfOrdinaryAccount":null,"cpfSpecialAccount":null,"cpfMediSaveAccount":null,"cpfRetirementAccount":null,"schemeType":null,"estimatedPayout":null,"topupAmount":null,"withdrawalAmount":null,"retirementSum":null,"homeMarketValue":1000.0,"investmentPropertiesValue":100.0,"assetsInvestmentSet":[{"assetId":866,"typeOfInvestment":"MoneyOwl - Growth","investmentAmount":100.0}],"otherAssetsValue":100.0,"source":"MANUAL"},"comprehensiveLiabilities":{"enquiryId":130580,"homeLoanOutstandingAmount":null,"otherPropertyLoanOutstandingAmount":null,"otherLoanOutstandingAmount":null,"carLoansAmount":null},"comprehensiveInsurancePlanning":{"id":null,"enquiryId":130580,"haveHospitalPlan":null,"haveCPFDependentsProtectionScheme":null,"lifeProtectionAmount":0.0,"haveHDBHomeProtectionScheme":null,"homeProtectionCoverageAmount":null,"otherLifeProtectionCoverageAmount":0.0,"criticalIllnessCoverageAmount":0.0,"disabilityIncomeCoverageAmount":0.0,"haveLongTermElderShield":null,"longTermElderShieldAmount":0,"isDefaultLifeProtectionAmount":null,"haveHospitalPlanWithRider":0,"otherLongTermCareInsuranceAmount":0.0,"shieldType":"elderShield","haveTakenCareShieldQuestions":true,"haveLongTermPopup":false,"calculatedMonthlyPayout":null},"comprehensiveRetirementPlanning":{"enquiryId":130580,"retirementAge":"52","haveOtherSourceRetirementIncome":false,"retirementIncomeSet":[],"lumpSumBenefitSet":[]},"recommendedPortfolio":null,"riskAssessmentAnswer":null};
    comprehensiveService.setComprehensiveSummary(summaryData);
    spyOn(comprehensiveService, 'getChildEndowment').and.returnValue([]);
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
  it('buildEndowmentListForm', () => {
    component.buildEndowmentListForm();

  });
  it('buildEndowmentDetailsForm', () => {
    component.buildEndowmentDetailsForm(component.endowmentListForm);

  });
  it('goToNext', () => {
    component.goToNext(component.endowmentListForm);

  });
  it('showToolTipModal', () => {
    component.showToolTipModal();

  });
  it('checkDependant', () => {
    component.checkDependant();

  });
  it('validateDependantList', () => {
    component.validateDependantList(component.endowmentListForm);

  });
  it('payOffYearValid', () => {
    component.payOffYearValid(2020);

  });
  it('showSummaryModal', () => {
    component.showSummaryModal();

  });
  it('showSummaryModal', () => {
    component.showDependantSummary(component.endowmentListForm);

  });
  
  
  it('should set page title', () => {
    const setPageTitleSpy = spyOn(navbarService, 'setPageTitleWithIcon');
    component.setPageTitle('CMP.COMPREHENSIVE_STEPS.STEP_1_TITLE');
    expect(setPageTitleSpy).toHaveBeenCalledWith('CMP.COMPREHENSIVE_STEPS.STEP_1_TITLE', { id: 'DependantEducationListComponent', iconClass: 'navbar__menuItem--journey-map' });
  });
});
