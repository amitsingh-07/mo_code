import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { ComprehensiveService } from '../comprehensive.service';
import { ConfigService } from './../../config/config.service';
import { LoaderService } from './../../shared/components/loader/loader.service';
import { IServerResponse } from './../../shared/http/interfaces/server-response.interface';
import { ProgressTrackerService } from './../../shared/modal/progress-tracker/progress-tracker.service';
import { NavbarService } from './../../shared/navbar/navbar.service';
import { AboutAge } from './../../shared/utils/about-age.util';
import { COMPREHENSIVE_CONST } from './../comprehensive-config.constants';
import { IChildEndowment, IDependantDetail, IMySummaryModal } from './../comprehensive-types';

@Component({
  selector: 'app-dependant-education-selection',
  templateUrl: './dependant-education-selection.component.html',
  styleUrls: ['./dependant-education-selection.component.scss']
})
export class DependantEducationSelectionComponent implements OnInit, OnDestroy {

  hasEndowments: string;
  dependantDetailsArray: IDependantDetail[];
  education_plan_selection = true;
  pageId: string;
  pageTitle: string;
  dependantEducationSelectionForm: FormGroup;
  childEndowmentFormGroupArray: FormGroup[];
  childEndowmentArray: IChildEndowment[];
  educationPreference = true;
  menuClickSubscription: Subscription;
  subscription: Subscription;
  summaryModalDetails: IMySummaryModal;
  childrenEducationNonDependantModal: any;
  summaryRouterFlag: boolean;
  routerEnabled = false;
  viewMode: boolean;
  constructor(
    private route: ActivatedRoute, private router: Router, public navbarService: NavbarService,
    private translate: TranslateService, private formBuilder: FormBuilder,
    private configService: ConfigService, private comprehensiveService: ComprehensiveService,
    private aboutAge: AboutAge, private comprehensiveApiService: ComprehensiveApiService,
    private loaderService: LoaderService, private progressService: ProgressTrackerService) {
    this.viewMode = this.comprehensiveService.getViewableMode();
    this.routerEnabled = this.summaryRouterFlag = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.ROUTER_CONFIG.STEP1;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_1_TITLE');
        this.setPageTitle(this.pageTitle);
        this.childrenEducationNonDependantModal = this.translate.instant('CMP.MODAL.CHILDREN_EDUCATION_MODAL.NO_DEPENDANTS');
        if (this.route.snapshot.paramMap.get('summary') === 'summary' && this.summaryRouterFlag === true) {
          this.routerEnabled = !this.summaryRouterFlag;
          this.showSummaryModal();
        }
      });
    });
    this.dependantSelection();
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, { id: this.pageId, iconClass: 'navbar__menuItem--journey-map' });
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

    this.dependantEducationSelectionForm.valueChanges.subscribe((form: any) => {
      form.hasEndowments === '0' ? this.education_plan_selection = true : this.education_plan_selection = false;
      this.educationSelection(form);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.menuClickSubscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
    this.navbarService.unsubscribeMenuItemClick();
  }

  dependantSelection() {

    this.childEndowmentArray = [];
    this.childEndowmentFormGroupArray = [];

    this.comprehensiveService.updateComprehensiveSummary();
    this.hasEndowments = this.comprehensiveService.hasEndowment();
    this.hasEndowments === '0' ? this.education_plan_selection = true : this.education_plan_selection = false;
    this.childEndowmentArray = this.comprehensiveService.getChildEndowment();
    this.dependantDetailsArray = this.comprehensiveService.getMyDependant();
    if (this.childEndowmentArray.length > 0) {
      this.buildChildEndowmentFormArray();
      this.buildEducationSelectionForm();
    } else {
      this.dependantDetailsArray.forEach((dependant: IDependantDetail) => {
        const getAge = this.aboutAge.calculateAge(dependant.dateOfBirth, new Date());
        const maxAge = (dependant.gender.toLowerCase() === 'male') ? COMPREHENSIVE_CONST.CHILD_ENDOWMENT.MALE_MATURITY_AGE :
          COMPREHENSIVE_CONST.CHILD_ENDOWMENT.FEMALE_MATURITY_AGE;
        if (getAge < maxAge) {
          const newEndowment = this.getNewEndowmentItem(dependant);
          this.childEndowmentArray.push(newEndowment);
          this.childEndowmentFormGroupArray.push(this.formBuilder.group(newEndowment));
          this.buildEducationSelectionForm();
        }
      });
    }
  }

  getNewEndowmentItem(dependant: IDependantDetail) {
    let preferenceSelected = true;
    if (this.comprehensiveService.getComprehensiveSummary().comprehensiveEnquiry.hasEndowments === '2') {
      preferenceSelected = (dependant.isInsuranceNeeded === null || dependant.isInsuranceNeeded);
    } else if (this.comprehensiveService.getComprehensiveSummary().comprehensiveEnquiry.hasEndowments === '1') {
      preferenceSelected = false;
    }
    const getAge = this.aboutAge.calculateAge(dependant.dateOfBirth, new Date());
    const maturityAge = this.aboutAge.getAboutAge(getAge, (dependant.gender.toLowerCase() === 'male') ?
      COMPREHENSIVE_CONST.CHILD_ENDOWMENT.MALE_MATURITY_AGE : COMPREHENSIVE_CONST.CHILD_ENDOWMENT.FEMALE_MATURITY_AGE);
    return {
      id: 0,
      dependentId: dependant.id,
      name: dependant.name,
      dateOfBirth: dependant.dateOfBirth,
      gender: dependant.gender,
      enquiryId: dependant.enquiryId,
      location: null,
      educationCourse: null,
      endowmentMaturityAmount: 0,
      endowmentMaturityYears: null,
      age: maturityAge,
      preferenceSelection: preferenceSelected,
      nation: dependant.nation
    } as IChildEndowment;
  }

  // tslint:disable-next-line:cognitive-complexity
  buildChildEndowmentFormArray() {

    const tempChildEndowmentArray: IChildEndowment[] = [];
    this.childEndowmentFormGroupArray = [];
    this.dependantDetailsArray.forEach((dependant: IDependantDetail) => {
      const getAge = this.aboutAge.calculateAge(dependant.dateOfBirth, new Date());
      const maxAge = (dependant.gender.toLowerCase() === 'male') ? COMPREHENSIVE_CONST.CHILD_ENDOWMENT.MALE_MATURITY_AGE :
        COMPREHENSIVE_CONST.CHILD_ENDOWMENT.FEMALE_MATURITY_AGE;
      if (getAge < maxAge) {
        for (const childEndowment of this.childEndowmentArray) {
          if (childEndowment.dependentId === dependant.id) {
            const thisEndowment = this.comprehensiveService.getExistingEndowmentItem(childEndowment, dependant);
            // Filter the array to avoid duplicates
            if (tempChildEndowmentArray.filter((item: IChildEndowment) => item.dependentId === thisEndowment.dependentId).length === 0) {
              tempChildEndowmentArray.push(thisEndowment);
              this.childEndowmentFormGroupArray.push(this.formBuilder.group(thisEndowment));
            }
            break;
          }

        }

        // Filter the array to avoid duplicates

        if (tempChildEndowmentArray.filter((item: IChildEndowment) => item.dependentId === dependant.id).length === 0) {
          const thisNewEndowment = this.getNewEndowmentItem(dependant);
          tempChildEndowmentArray.push(thisNewEndowment);
          this.childEndowmentFormGroupArray.push(this.formBuilder.group(thisNewEndowment));
        }
      }
    });

    this.childEndowmentArray = tempChildEndowmentArray;
  }

  buildEducationSelectionForm() {
    this.dependantEducationSelectionForm = this.formBuilder.group({
      hasEndowments: [this.hasEndowments, Validators.required],
      endowmentDetailsList: this.formBuilder.array(this.childEndowmentFormGroupArray)
    });
    this.educationSelection(this.dependantEducationSelectionForm.value);
  }
  educationSelection(form) {
    let educationPreferenceAlert = true;
    form.endowmentDetailsList.forEach((dependant: IChildEndowment) => {
      if (dependant.preferenceSelection) {
        educationPreferenceAlert = !dependant.preferenceSelection;
      }
    });
    form.hasEndowments == null ? this.educationPreference = true : this.educationPreference = educationPreferenceAlert;
  }

  // tslint:disable-next-line:cognitive-complexity
  goToNext(form) {
    if (!this.viewMode) {
      const dependantArray = [];
      if (form.value.hasEndowments === '0') {
        this.loaderService.showLoader({ title: 'Saving' });
        this.comprehensiveService.setEndowment(form.value.hasEndowments);
        this.comprehensiveService.setChildEndowment([]);
        this.comprehensiveApiService.saveChildEndowment({
          hasEndowments: form.value.hasEndowments,
          endowmentDetailsList: [{
            id: 0,
            dependentId: 0,
            enquiryId: this.comprehensiveService.getEnquiryId(),
            location: null,
            educationCourse: null,
            endowmentMaturityAmount: null,
            endowmentMaturityYears: null
          } as IChildEndowment]
        }).subscribe((data: any) => {
          this.loaderService.hideLoader();
          this.showSummaryModal();
        });
      } else {
        let selectedChildArray: IChildEndowment[] = form.value.endowmentDetailsList
          .filter((item: IChildEndowment) => item.preferenceSelection);
        if (!form.pristine) {

          this.loaderService.showLoader({ title: 'Saving' });

          this.comprehensiveApiService.saveChildEndowment({
            hasEndowments: form.value.hasEndowments,
            endowmentDetailsList: selectedChildArray
          }).subscribe((data: IServerResponse) => {
            this.comprehensiveService.setEndowment(form.value.hasEndowments);
            this.comprehensiveService.setChildEndowment(selectedChildArray);
            // RESET Insurance Needed
            this.dependantDetailsArray.forEach((dependant: IDependantDetail, i: number) => {
              this.dependantDetailsArray[i].isInsuranceNeeded = false;
            });

            selectedChildArray.forEach((childItem: IChildEndowment) => {
              if (form.value.hasEndowments === '2') {
                this.dependantDetailsArray.forEach((dependant: IDependantDetail, i: number) => {
                  if (childItem.dependentId === dependant.id) {
                    selectedChildArray = [{
                      id: 0,
                      dependentId: dependant.id,
                      enquiryId: this.comprehensiveService.getEnquiryId(),
                      location: null,
                      educationCourse: null,
                      endowmentMaturityAmount: null,
                      endowmentMaturityYears: null
                    } as IChildEndowment]
                    this.dependantDetailsArray[i].isInsuranceNeeded = true;
                  }
                });
              }
            });
            this.comprehensiveService.setMyDependant(this.dependantDetailsArray);
            this.comprehensiveService.setChildEndowment(selectedChildArray);
            this.loaderService.hideLoader();
            this.gotoNextPage(form);
          });
        } else {
          this.gotoNextPage(form);
        }
      }
    } else {
      this.gotoNextPage(form);
    }
  }

  gotoNextPage(form) {
    if (form.value.hasEndowments === '1') {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_PREFERENCE]);
    } else {
      this.showSummaryModal();
    }
  }

  showSummaryModal() {
    if (this.routerEnabled) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_SELECTION + '/summary']);
    } else {
      this.summaryModalDetails = {
        setTemplateModal: 1, dependantModelSel: false,
        contentObj: this.childrenEducationNonDependantModal,
        nonDependantDetails: {
          livingCost: COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.EDUCATION_ENDOWMENT.NON_DEPENDANT.LIVING_EXPENSES.EXPENSE,
          livingPercent: COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.EDUCATION_ENDOWMENT.NON_DEPENDANT.LIVING_EXPENSES.PERCENT,
          livingEstimatedCost: COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.EDUCATION_ENDOWMENT.NON_DEPENDANT.LIVING_EXPENSES.COMPUTED_EXPENSE,
          medicalBill: COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.EDUCATION_ENDOWMENT.NON_DEPENDANT.MEDICAL_BILL.EXPENSE,
          medicalYear: COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.EDUCATION_ENDOWMENT.NON_DEPENDANT.MEDICAL_BILL.PERCENT,
          medicalCost: COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.EDUCATION_ENDOWMENT.NON_DEPENDANT.MEDICAL_BILL.COMPUTED_EXPENSE
        },
        nextPageURL: (COMPREHENSIVE_ROUTE_PATHS.STEPS) + '/2',
        routerEnabled: this.summaryRouterFlag
      };
      this.comprehensiveService.openSummaryPopUpModal(this.summaryModalDetails);
    }
  }
}
