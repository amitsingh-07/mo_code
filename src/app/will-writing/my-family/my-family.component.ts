import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { Subscription } from 'rxjs';
import { RegexConstants } from 'src/app/shared/utils/api.regex.constants';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { NgbDateCustomParserFormatter } from '../../shared/utils/ngb-date-custom-parser-formatter';
import { PageTitleComponent } from '../page-title/page-title.component';
import { WILL_WRITING_ROUTE_PATHS } from '../will-writing-routes.constants';
import { IChild, ISpouse } from '../will-writing-types';
import { WILL_WRITING_CONFIG } from '../will-writing.constants';
import { WillWritingService } from '../will-writing.service';

@Component({
  selector: 'app-my-family',
  templateUrl: './my-family.component.html',
  providers: [{ provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }],
  styleUrls: ['./my-family.component.scss']
})
export class MyFamilyComponent implements OnInit, OnDestroy {
  @ViewChild(PageTitleComponent) pageTitleComponent: PageTitleComponent;
  private subscription: Subscription;
  pageTitle: string;
  step: string;
  private confirmModal = {};

  myFamilyForm: FormGroup;
  childrenFormValues: IChild[];
  spouseFormValues: ISpouse[];
  hasSpouse: boolean;
  hasChild: boolean;
  submitted: boolean;
  unsavedMsg: string;
  toolTip;

  fromConfirmationPage = this.willWritingService.fromConfirmationPage;

  constructor(
    private config: NgbDatepickerConfig,
    private formBuilder: FormBuilder,
    private parserFormatter: NgbDateParserFormatter,
    private router: Router,
    private _location: Location,
    private modal: NgbModal, public navbarService: NavbarService,
    private translate: TranslateService,
    private willWritingService: WillWritingService
  ) {
    const today: Date = new Date();
    config.minDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
    config.maxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
    config.outsideDays = 'collapsed';
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.step = this.translate.instant('WILL_WRITING.COMMON.STEP_1');
      this.pageTitle = this.translate.instant('WILL_WRITING.MY_FAMILY.TITLE');
      this.confirmModal['title'] = this.translate.instant('WILL_WRITING.COMMON.CONFIRM');
      this.confirmModal['message'] = this.translate.instant('WILL_WRITING.COMMON.CONFIRM_IMPACT_MESSAGE');
      this.unsavedMsg = this.translate.instant('WILL_WRITING.COMMON.UNSAVED');
      this.toolTip = this.translate.instant('WILL_WRITING.COMMON.ID_TOOLTIP');
      this.setPageTitle(this.pageTitle);
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarMode(4);
    this.hasSpouse = this.willWritingService.getAboutMeInfo().maritalStatus === WILL_WRITING_CONFIG.MARRIED;
    this.hasChild = this.willWritingService.getAboutMeInfo().noOfChildren > 0;
    this.childrenFormValues = this.willWritingService.getChildrenInfo();
    this.spouseFormValues = this.willWritingService.getSpouseInfo();
    this.buildMyFamilyForm();
    this.headerSubscription();
  }

  /**
   * build about me form.
   */
  buildMyFamilyForm() {
    this.myFamilyForm = this.formBuilder.group({
      spouse: this.formBuilder.array([this.buildSpouseForm()]),
      children: this.formBuilder.array([this.buildChildrenForm(0)]),
    });
    if (this.hasChild) {
      const childrenCount: number = this.willWritingService.getAboutMeInfo().noOfChildren;
      for (let i = 1; i <= childrenCount - 1; i++) {
        this.addChildrenForm(i);
      }
    }
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  headerSubscription() {
    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        if (this.myFamilyForm.dirty) {
          this.pageTitleComponent.goBack();
        } else {
          this._location.back();
        }
        return false;
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
  }

  buildSpouseForm(): FormGroup {
    if (this.hasSpouse) {
      return this.formBuilder.group({
        name: [this.spouseFormValues.length > 0 ? this.spouseFormValues[0].name : '',
        [Validators.required, Validators.pattern(RegexConstants.NameWithSymbol)]],
        uin: [this.spouseFormValues.length > 0 ? this.spouseFormValues[0].uin : '',
        [Validators.required, Validators.pattern(RegexConstants.UIN)]],
      });
    }
    return this.formBuilder.group({});
  }

  buildChildrenForm(index: number): FormGroup {
    if (this.hasChild) {
      return this.formBuilder.group({
        name: [this.childrenFormValues.length > index ?
          this.childrenFormValues[index].name : '', [Validators.required, Validators.pattern(RegexConstants.NameWithSymbol)]],
        uin: [this.childrenFormValues.length > index ?
          this.childrenFormValues[index].uin : '', [Validators.required, Validators.pattern(RegexConstants.UIN)]],
        dob: [this.childrenFormValues.length > index ? this.childrenFormValues[index].dob : '', [Validators.required]]
      });
    }
    return this.formBuilder.group({});
  }

  addChildrenForm(index: number): void {
    const items: FormArray = this.myFamilyForm.get('children') as FormArray;
    items.push(this.buildChildrenForm(index));
  }

  /**
   * validate aboutMeForm.
   * @param form - user personal detail.
   */
  validateFamilyForm(form: any) {
    this.submitted = true;
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      const error = this.willWritingService.getMultipleFormError(form, 'myFamilyForm');
      this.willWritingService.openErrorModal(error.title, error.errorMessages, true);
      return false;
    }
    return true;
  }

  openToolTipModal() {
    this.willWritingService.openToolTipModal(this.toolTip.TITLE, this.toolTip.MESSAGE);
  }

  save(form) {
    if (this.hasSpouse) {
      this.willWritingService.setSpouseInfo(form.value.spouse[0]);
    }
    if (this.hasChild) {
      this.willWritingService.setChildrenInfo(form.value.children);
    }
    return true;
  }

  openConfirmationModal(title: string, message: string, url: string, hasImpact: boolean, form: any) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.unSaved = true;
    if (hasImpact) {
      ref.componentInstance.hasImpact = message;
    }
    ref.result.then((data) => {
      if (data === 'yes') {
        this.save(form);
        this.router.navigate([url]);
      }
    });
    return false;
  }

  /**
   * redirect to next page.
   * @param form - aboutMeForm.
   */
  goToNext(form) {
    if (this.validateFamilyForm(form)) {
      let url = this.fromConfirmationPage ? WILL_WRITING_ROUTE_PATHS.CONFIRMATION : WILL_WRITING_ROUTE_PATHS.DISTRIBUTE_YOUR_ESTATE;
      url = (this.hasChild && this.willWritingService.getGuardianInfo().length === 0 &&
        this.willWritingService.checkChildrenAge(form.value.children)) ?
        WILL_WRITING_ROUTE_PATHS.MY_CHILD_GUARDIAN : url;
      if ((this.hasChild && this.childrenFormValues.length !== this.willWritingService.getAboutMeInfo().noOfChildren) ||
        (this.hasSpouse && this.spouseFormValues.length === 0)) {
        if (this.save(form)) {
          this.router.navigate([url]);
        }
      } else {
        if (this.myFamilyForm.dirty) {
          this.openConfirmationModal(this.confirmModal['title'], this.confirmModal['message'], url, false, form);
        } else {
          this.router.navigate([url]);
        }
      }
    }
  }

}
