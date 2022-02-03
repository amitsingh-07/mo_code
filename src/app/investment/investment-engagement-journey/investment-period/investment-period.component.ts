import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NouisliderComponent } from 'ng2-nouislider';

import { INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS } from '../investment-engagement-journey.constants';
import { FooterService } from '../../../shared/footer/footer.service';
import { IPageComponent } from '../../../shared/interfaces/page-component.interface';
import { ErrorModalComponent } from '../../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../../shared/navbar/navbar.service';
import { NgbDateCustomParserFormatter } from '../../../shared/utils/ngb-date-custom-parser-formatter';
import { INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS } from '../investment-engagement-journey-routes.constants';
import { InvestmentEngagementJourneyService } from '../investment-engagement-journey.service';
import { ModelWithButtonComponent } from '../../../shared/modal/model-with-button/model-with-button.component';

const assetImgPath = './assets/images/';

@Component({
  selector: 'app-investment-period',
  templateUrl: './investment-period.component.html',
  styleUrls: ['./investment-period.component.scss'],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ],
  encapsulation: ViewEncapsulation.None
})
export class InvestmentPeriodComponent implements OnInit, AfterViewInit, IPageComponent {
  @ViewChild('piInvestmentSlider') piInvestmentSlider: NouisliderComponent;
  personalInfoForm: FormGroup;
  pageTitle: string;
  formValues: any;
  ciAssessmentFormValues: any;
  sliderMinValue = 0;
  sliderMaxValue = INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.personal_info.max_investment_years;
  isSufficientInvYears = false;
  isCpfEnabled: boolean;

  constructor(
    // tslint:disable-next-line
    private router: Router,
    private formBuilder: FormBuilder,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private config: NgbDatepickerConfig,
    private investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    private modal: NgbModal,
    private elRef: ElementRef,
    private parserFormatter: NgbDateParserFormatter,
    public readonly translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('PERSONAL_INFO.TITLE');
      this.setPageTitle(this.pageTitle);
    });
  }
  ciSliderConfig: any = {
    behaviour: 'snap',
    animate: false,
    start: 0,
    connect: [true, false],
    format: {
      to: (value) => {
        return Math.round(value);
      },
      from: (value) => {
        return Math.round(value);
      }
    }
  };

  ngAfterViewInit() {
    this.piInvestmentSlider.writeValue(this.formValues.investmentPeriod);
    this.onSliderChange(this.formValues.investmentPeriod);
    this.piInvestmentSlider.writeValue(this.formValues.investmentPeriod);
    this.onSliderChange(this.formValues.investmentPeriod ? this.formValues.investmentPeriod : '0');
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.formValues = this.investmentEngagementJourneyService.getPersonalInfo();
    this.personalInfoForm = this.formBuilder.group({
      investmentPeriod: ['', Validators.required],
      sliderValueSetter: ['']
    });

    this.personalInfoForm.get('sliderValueSetter').valueChanges.subscribe((value) => {
      this.piInvestmentSlider.writeValue(value);
      this.onSliderChange(value);
    });
    this.isCpfEnabled = this.investmentEngagementJourneyService.isCpfSelected();
  }


  setPageTitle(title: string) {
    const stepLabel = this.translate.instant('PERSONAL_INFO.STEP_1_LABEL');
    this.navbarService.setPageTitle(
      title,
      undefined,
      undefined,
      undefined,
      undefined,
      stepLabel
    );
  }

  onSliderChange(value): void {
    const self = this;
    setTimeout(() => {
      self.personalInfoForm.controls.investmentPeriod.setValue(value);
      const pointerPosition = self.elRef.nativeElement.querySelectorAll('.noUi-origin')[0]
        .style.transform;
      self.elRef.nativeElement.querySelectorAll(
        '.pointer-container'
      )[0].style.transform = pointerPosition;
    }, 1);
    this.isSufficientInvYears =
      value > INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.personal_info.min_investment_period ? true : false;

    this.cd.detectChanges();
  }

  isValueBetweenRange(x, min, max) {
    return x > min && x <= max;
  }

  changeSlide($event) {
    const slideValue = ($event.target.value > 40) ? 40 : $event.target.value
    this.piInvestmentSlider.writeValue(slideValue);
    this.personalInfoForm.controls.investmentPeriod.setValue(slideValue);
    this.onSliderChange(slideValue);
  }

  save(form: any) {
    const investmentPeriodValue = {
      period: form.value.investmentPeriod == 1 ? form.value.investmentPeriod + ' ' + 'year' : form.value.investmentPeriod + ' ' + 'years'
    };
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = this.investmentEngagementJourneyService.currentFormError(form)[
        'errorTitle'
      ];
      ref.componentInstance.errorMessage = this.investmentEngagementJourneyService.currentFormError(form)[
        'errorMessage'
      ];
      return false;
    } else if (form.value.investmentPeriod < 4 && [INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVEST_PORTFOLIO, INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER_PORTFOLIO].includes(this.investmentEngagementJourneyService.getPortfolioFormData().selectPortfolioType)) {
      this.showModalPopUp(this.translate.instant('PERSONAL_INFO.MODAL.TITLE'), this.translate.instant('PERSONAL_INFO.MODAL.BTN_LBL1'), this.translate.instant('PERSONAL_INFO.MODAL.BTN_LBL2'), this.translate.instant('PERSONAL_INFO.MODAL.MESSAGE', investmentPeriodValue));
    } else if (form.value.investmentPeriod < 11 && [INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.CPF_PORTFOLIO, INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER_PORTFOLIO].includes(this.investmentEngagementJourneyService.getPortfolioFormData().selectPortfolioType)) {
      this.showModalPopUp(this.translate.instant('PERSONAL_INFO.CPF.MODAL.TITLE'), this.translate.instant('PERSONAL_INFO.CPF.MODAL.BTN_LBL1'), this.translate.instant('PERSONAL_INFO.CPF.MODAL.BTN_LBL2'), this.translate.instant('PERSONAL_INFO.CPF.MODAL.MESSAGE', investmentPeriodValue))
    }
    else {
      this.investmentEngagementJourneyService.setPersonalInfo(form.value);
      return true;
    }
  }

  showModalPopUp(title, btn1, btn2, msg) {
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.errorMessageHTML = msg;
    ref.componentInstance.investmentPeriodImg = true;
    ref.componentInstance.primaryActionLabel = btn1;
    ref.componentInstance.secondaryActionLabel = btn2;
    ref.componentInstance.secondaryActionDim = true;
    ref.componentInstance.primaryAction.subscribe((emittedValue) => {
      ref.dismiss();
    });
    ref.componentInstance.secondaryAction.subscribe((emittedValue) => {
      if (this.investmentEngagementJourneyService.getPortfolioFormData().selectPortfolioType == INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.INVEST_PORTFOLIO) {
        this.investmentEngagementJourneyService.setSelectPortfolioType({ selectPortfolioType: INVESTMENT_ENGAGEMENT_JOURNEY_CONSTANTS.SELECT_POROFOLIO_TYPE.WISESAVER_PORTFOLIO });
        this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.SELECT_PORTFOLIO_GOAL_MORE_INFO]);
      }
      else {
        this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.SELECT_PORTFOLIO]);
      }
    });
  }

  goToNext(form) {
    if (this.save(form)) {
      this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.INVESTMENT_AMOUNT]);
    }
  }

}
