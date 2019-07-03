import { Component, OnDestroy, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { LoaderService } from '../../shared/components/loader/loader.service';
import { AboutAge } from '../../shared/utils/about-age.util';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { NgbDateCustomParserFormatter } from '../../shared/utils/ngb-date-custom-parser-formatter';
import { ComprehensiveApiService } from '../comprehensive-api.service';
import { COMPREHENSIVE_FORM_CONSTANTS } from '../comprehensive-form-constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { ConfigService } from './../../config/config.service';
import { ProgressTrackerService } from './../../shared/modal/progress-tracker/progress-tracker.service';
import { NavbarService } from './../../shared/navbar/navbar.service';
import { COMPREHENSIVE_CONST } from './../comprehensive-config.constants';
import { IDependantDetail, IMySummaryModal } from './../comprehensive-types';
import { ComprehensiveService } from './../comprehensive.service';

@Component({
  selector: 'app-dependants-details',
  templateUrl: './dependants-details.component.html',
  styleUrls: ['./dependants-details.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }],
  encapsulation: ViewEncapsulation.None
})
export class DependantsDetailsComponent implements OnInit, OnDestroy {
  hasDependant: boolean;
  genderList: any;
  myDependantForm: FormGroup;
  formName: string[] = [];
  pageTitle: string;
  dependant: any = [];
  relationShipList: any;
  nationalityList: any;
  dependantDetails: IDependantDetail[];
  relationship: string;
  submitted = false;
  pageId: string;
  summaryModalDetails: IMySummaryModal;
  menuClickSubscription: Subscription;
  subscription: Subscription;
  childrenEducationNonDependantModal: any;
  summaryRouterFlag: boolean;
  routerEnabled = false;
  viewMode: boolean;

  constructor(
    private route: ActivatedRoute, private router: Router, public navbarService: NavbarService,
    private loaderService: LoaderService, private progressService: ProgressTrackerService,
    private translate: TranslateService, private formBuilder: FormBuilder, private configService: ConfigService,
    private comprehensiveService: ComprehensiveService, private comprehensiveApiService: ComprehensiveApiService,
    private parserFormatter: NgbDateCustomParserFormatter, private configDate: NgbDatepickerConfig, private aboutAge: AboutAge) {
    const today: Date = new Date();
    configDate.minDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
    configDate.maxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
    configDate.outsideDays = 'collapsed';
    this.pageId = this.route.routeConfig.component.name;
    this.viewMode = this.comprehensiveService.getViewableMode();
    this.dependantDetails = [];
    this.routerEnabled = this.summaryRouterFlag = COMPREHENSIVE_CONST.SUMMARY_CALC_CONST.ROUTER_CONFIG.STEP1;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.relationShipList = this.translate.instant('CMP.DEPENDANT_DETAILS.RELATIONSHIP_LIST');
        this.nationalityList = this.translate.instant('CMP.NATIONALITY');
        this.genderList = this.translate.instant('CMP.GENDER');
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_1_TITLE');
        this.setPageTitle(this.pageTitle);
        this.childrenEducationNonDependantModal = this.translate.instant('CMP.MODAL.CHILDREN_EDUCATION_MODAL.NO_DEPENDANTS');
        if (this.route.snapshot.paramMap.get('summary') === 'summary' && this.summaryRouterFlag === true) {
          this.routerEnabled = !this.summaryRouterFlag;
          this.showSummaryModal();
        }
      });
    });
    this.dependantDetails = this.comprehensiveService.getMyDependant();
    this.buildDependantForm();
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
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.menuClickSubscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
    this.navbarService.unsubscribeMenuItemClick();
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitleWithIcon(title, { id: this.pageId, iconClass: 'navbar__menuItem--journey-map' });
  }
  buildDependantForm() {
    const dependantFormArray = [];
    if (this.dependantDetails.length > 0) {
      this.dependantDetails.forEach((dependant) => {
        dependantFormArray.push(this.buildDependantDetailsForm(dependant));
      });
    } else {
      dependantFormArray.push(this.buildEmptyForm());
    }
    this.myDependantForm = this.formBuilder.group({
      dependentMappingList: this.formBuilder.array(dependantFormArray),
    });
  }

  getCurrentFormsCount() {
    return this.myDependantForm.controls['dependentMappingList']['controls'].length;
  }

  selectRelationship(status, i) {
    const relationship = status ? status : '';
    this.myDependantForm.controls['dependentMappingList']['controls'][i].controls.relationship.setValue(relationship);
    this.myDependantForm.controls['dependentMappingList']['controls'][i].markAsDirty();

  }
  selectGender(status, i) {
    const gender = status ? status : '';
    this.myDependantForm.controls['dependentMappingList']['controls'][i].controls.gender.setValue(gender);
    this.myDependantForm.controls['dependentMappingList']['controls'][i].markAsDirty();
  }
  selectNationality(status, i) {
    const nationality = status ? status : '';
    this.myDependantForm.controls['dependentMappingList']['controls'][i].controls.nation.setValue(nationality);
    this.myDependantForm.controls['dependentMappingList']['controls'][i].markAsDirty();
  }

  buildDependantDetailsForm(thisDependant) {
    return this.formBuilder.group({
      id: [thisDependant.id],
      name: [thisDependant.name, [Validators.required, Validators.minLength(2), Validators.maxLength(100)
        , Validators.pattern(RegexConstants.NameWithSymbol)]],
      relationship: [thisDependant.relationship, [Validators.required]],
      gender: [thisDependant.gender, [Validators.required]],
      dateOfBirth: [this.parserFormatter.parse(thisDependant.dateOfBirth), [Validators.required]],
      nation: [thisDependant.nation, [Validators.required]]
    });
  }

  buildEmptyForm() {
    return this.formBuilder.group({
      id: [0],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)
        , Validators.pattern(RegexConstants.NameWithSymbol)]],
      relationship: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      nation: ['', [Validators.required]]
    });
  }

  addDependant() {
    const dependantdetails = this.myDependantForm.get('dependentMappingList') as FormArray;
    dependantdetails.push(this.buildEmptyForm());
  }
  removeDependant(i) {
    const dependantdetails = this.myDependantForm.get('dependentMappingList') as FormArray;
    dependantdetails.removeAt(i);
    this.myDependantForm.get('dependentMappingList').markAsDirty();
  }
  validateDependantForm(form: FormGroup) {

    this.submitted = true;
    if (!form.valid) {
      const error = this.comprehensiveService.getMultipleFormError(form, COMPREHENSIVE_FORM_CONSTANTS.dependantForm,
        this.translate.instant('CMP.ERROR_MODAL_TITLE.DEPENDANT_DETAIL'));
      this.comprehensiveService.openErrorModal(error.title, error.errorMessages, true,
      );
      return false;
    }
    return true;
  }
  goToNext(form: FormGroup) {

    if (!this.viewMode) {
      if (this.validateDependantForm(form)) {
        form.value.dependentMappingList.forEach((dependant: any, index) => {
          form.value.dependentMappingList[index].dateOfBirth = this.parserFormatter.format(dependant.dateOfBirth);
          form.value.dependentMappingList[index].enquiryId = this.comprehensiveService.getEnquiryId();
        });
        if (!form.pristine) {
          this.hasDependant = form.value.dependentMappingList.length > 0; // #this.comprehensiveService.hasDependant();
          form.value.hasDependents = this.hasDependant;
          this.loaderService.showLoader({ title: 'Saving Details' });
          this.comprehensiveApiService.addDependents(form.value).subscribe(((data: any) => {
            this.loaderService.hideLoader();
            this.comprehensiveService.setHasDependant(true);
            this.comprehensiveService.setMyDependant(data.objectList);
            this.comprehensiveService.clearEndowmentPlan();
            this.comprehensiveService.setEndowment(null);
            this.goToNextPage();
          }));
        } else {
          this.goToNextPage();
        }
      }
    } else {
      this.goToNextPage();
    }

  }

  goToNextPage() {
    const hasChildDependant = this.comprehensiveService.hasChildDependant();
    if (hasChildDependant) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION_SELECTION]);
    } else {
      this.showSummaryModal();
    }
  }

  showSummaryModal() {
    if (this.routerEnabled) {
      this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_DETAILS + '/summary']);
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
  getWrapText(name: any) {
    name.value = name.value.replace(/\n/g, '');
  }
  setDependentName(name: any, i: number) {
    if (name !== undefined) {
      name = name.replace(/\n/g, '');
      this.myDependantForm.controls['dependentMappingList']['controls'][i].controls.name.setValue(name);
      this.myDependantForm.controls['dependentMappingList']['controls'][i].markAsDirty();
      return name;
    }
  }
  onKeyPressEvent(event: any, dependentName: any) {
    //return (event.which !== 13 && dependentName.length < 100);
    if (dependentName.length >= 100) {
      const id = event.target.id;
      const el = document.querySelector("#" + id);//document.getElementById(id);
      this.setCaratTo(el, 100, dependentName);
      event.preventDefault();
    }
    return (event.which !== 13);
  }
  @HostListener('input', ['$event'])
  onChange(event) {
    const id = event.target.id;
    if (id !== '') {
      const arr = id.split('-');
      const dependentName = event.target.innerText;
      if (dependentName.length >= 100) {
        const dependentNameList = dependentName.substring(0, 100);
        //event.target.innerText = dependentNameList;
        this.myDependantForm.controls['dependentMappingList']['controls'][arr[1]].controls.name.setValue(dependentNameList);
        this.myDependantForm.controls['dependentMappingList']['controls'][arr[1]].markAsDirty();
        const el = document.querySelector("#" + id);//document.getElementById(id);
        this.setCaratTo(el, 100, dependentNameList);
      }/* else if (dependentName.length > 0) {
        const el = document.querySelector("#" + id);//document.getElementById(id);
        this.setCaratTo(el, dependentName.length, dependentName);
      }*/
    }
  }
  setCaratTo(contentEditableElement, position, dependentName) {
    contentEditableElement.innerText = dependentName;
    if (document.createRange) {
      const range = document.createRange();
      range.selectNodeContents(contentEditableElement);

      range.setStart(contentEditableElement.firstChild, position);
      range.setEnd(contentEditableElement.firstChild, position);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}
