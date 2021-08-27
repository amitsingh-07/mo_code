import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ConfigService } from './../../config/config.service';
import { IPageComponent } from '../../shared/interfaces/page-component.interface';
import { ProgressTrackerService } from '../../shared/modal/progress-tracker/progress-tracker.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { COMPREHENSIVE_CONST } from '../comprehensive-config.constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { ComprehensiveApiService } from './../comprehensive-api.service';
import { ComprehensiveService } from './../comprehensive.service';

@Component({
  selector: 'app-risk-profile',
  templateUrl: './risk-profile.component.html',
  styleUrls: ['./risk-profile.component.scss']
})
export class RiskProfileComponent implements IPageComponent, OnInit {

  pageTitle: any;
  pageId: string;
  QuestionLabel: string;
  ofLabel: string;
  riskAssessmentForm: FormGroup;
  riskFormValues: any;
  questionsList: any[] = [];
  questionIndex: number;
  currentQuestion: any;
  isSpecialCase = false;
  question1 = true;
  menuClickSubscription: Subscription;
  subscription: Subscription;
  isRiskProfileAnswer: boolean;
  riskProfileAnswers: any;
  viewMode: boolean;
  skipRiskProfile: boolean = false;

  constructor(
    public navbarService: NavbarService,
    public readonly translate: TranslateService,
    private comprehensiveApiService: ComprehensiveApiService,
    private comprehensiveService: ComprehensiveService,
    private progressService: ProgressTrackerService,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService
  ) {
    this.pageId = this.route.routeConfig.component.name;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_5_TITLE');
        this.setPageTitle(this.pageTitle);
      });
    });

    this.viewMode = this.comprehensiveService.getViewableMode();
    const self = this;
    if (route.snapshot.data[0]) {
      self.questionIndex = +route.snapshot.data[0]['param'];
      this.riskAssessmentForm = new FormGroup({
        riskProfileCheckboxFlag: new FormControl(false),
        questSelOption: new FormControl('', [Validators.required])
      });
      if (!self.questionsList.length) {
        self.getQuestions();
      } else {
        self.setCurrentQuestion();
      }
    }
  }

  ngOnInit() {
    this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
    this.navbarService.setNavbarComprehensive(true);
    this.menuClickSubscription = this.navbarService.onMenuItemClicked.subscribe((pageId) => {
      if (this.pageId === pageId) {
        this.progressService.show();
      }
    });
    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        const previousUrl = this.comprehensiveService.getPreviousUrl(this.router.url);
        if (previousUrl !== null) {
          this.router.navigate([previousUrl]);
        } else {
          this.navbarService.goBack();
        }
      }
    });
    this.setRiskProfileFlag();

  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, {
      id: this.pageId,
      iconClass: 'navbar__menuItem--journey-map'
    });
  }

  setRiskProfileFlag() {
    this.skipRiskProfile = this.comprehensiveService.getRiskProfileFlag();
    this.riskAssessmentForm.controls.riskProfileCheckboxFlag.setValue(this.skipRiskProfile);
    this.onCheckboxChange();
  }

  getQuestions() {
    this.comprehensiveService.getQuestionsList().subscribe((data) => {
      this.questionsList = data.objectList;
      this.setCurrentQuestion();
    });
  }
  setCurrentQuestion() {
    this.currentQuestion = this.questionsList[this.questionIndex - 1];
    this.isSpecialCase = this.currentQuestion.listOrder ===
      COMPREHENSIVE_CONST.RISK_ASSESSMENT.SPECIAL_QUESTION_ORDER ? true : false;
    const selectedOption = this.comprehensiveService.getSelectedOptionByIndex(
      this.questionIndex
    );
    if (selectedOption) {
      this.riskAssessmentForm.controls.questSelOption.setValue(selectedOption);
    }
  }
  save(form): boolean {
    if (!form.valid) {
      return false;
    } else {
      return true;
    }
  }

  goToNext(form) {
    if (this.save(form)) {
      this.comprehensiveService.setRiskAssessment(form.controls.riskProfileCheckboxFlag.value,
        form.controls.questSelOption.value,
        this.questionIndex
      );

      //SKIP PROFILE FLAG save
      this.comprehensiveService.saveSkipRiskProfile().subscribe(() => { 

      if (form.controls.riskProfileCheckboxFlag.value) {
        this.comprehensiveService.setStepCompletion(4, this.questionIndex).subscribe(() => {
          this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
          const routerURL = this.viewMode ? COMPREHENSIVE_ROUTE_PATHS.DASHBOARD
            : COMPREHENSIVE_ROUTE_PATHS.VALIDATE_RESULT;
          this.router.navigate([routerURL]);
        });
      } else {
        if (this.questionIndex < this.questionsList.length) {
          // NEXT QUESTION
          this.comprehensiveService.saveRiskAssessment().subscribe((data) => {
            if (this.comprehensiveService.getMySteps() === 4
              && this.comprehensiveService.getMySubSteps() < (this.questionIndex + 1)) {
              this.comprehensiveService.setStepCompletion(4, this.questionIndex).subscribe((data1: any) => {
                this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
                this.router.navigate([
                  COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/' + (this.questionIndex + 1)
                ]);
              });
            } else {
              this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
              this.router.navigate([
                COMPREHENSIVE_ROUTE_PATHS.RISK_PROFILE + '/' + (this.questionIndex + 1)
              ]);
            }
          });
        } else {
          this.comprehensiveService.saveRiskAssessment().subscribe((data) => {
            if (this.comprehensiveService.getMySteps() === 4
              && this.comprehensiveService.getMySubSteps() < 4) {
              this.comprehensiveService.setStepCompletion(4, 4).subscribe((data1: any) => {
                this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
                const routerURL = this.viewMode ? COMPREHENSIVE_ROUTE_PATHS.DASHBOARD
                  : COMPREHENSIVE_ROUTE_PATHS.VALIDATE_RESULT;
                this.router.navigate([routerURL]);
              });
            } else {
              this.progressService.setProgressTrackerData(this.comprehensiveService.generateProgressTrackerData());
              const routerURL = this.viewMode ? COMPREHENSIVE_ROUTE_PATHS.DASHBOARD
                : COMPREHENSIVE_ROUTE_PATHS.VALIDATE_RESULT;
              this.router.navigate([routerURL]);
            }
          });
        }
      }});
    }
  }

  onCheckboxChange() {
    if (this.riskAssessmentForm.get('riskProfileCheckboxFlag').value) {
      this.skipRiskProfile = true;
      this.riskAssessmentForm.controls['questSelOption'].clearValidators();
    } else {
      this.skipRiskProfile = false;
      this.riskAssessmentForm.controls['questSelOption'].setValidators([Validators.required]);
    }
    this.riskAssessmentForm.controls['questSelOption'].updateValueAndValidity();
  }

  ngOnDestroy() {
    this.navbarService.unsubscribeMenuItemClick();
    this.menuClickSubscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
    this.subscription.unsubscribe();
  }
}
