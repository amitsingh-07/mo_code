import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FooterService } from '../../shared/footer/footer.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { PageTitleComponent } from '../page-title/page-title.component';
import { WILL_WRITING_ROUTE_PATHS } from '../will-writing-routes.constants';
import { WillWritingService } from './../will-writing.service';

@Component({
  selector: 'app-my-estate-distribution',
  templateUrl: './my-estate-distribution.component.html',
  styleUrls: ['./my-estate-distribution.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MyEstateDistributionComponent implements OnInit, OnDestroy {
  @ViewChild(PageTitleComponent) pageTitleComponent: PageTitleComponent;
  private subscription: Subscription;
  private confirmModal = {};
  pageTitle: string;
  step: string;
  beneficiaryList: any[] = [];
  distributionForm: FormGroup;
  remainingPercentage = 100;
  value = '';
  showForm = false;
  divider: number;
  distPercentageSum = 0;
  firstReset = false;
  isFormAltered = false;
  currentDist;
  errorMsg;
  filteredList;
  fromConfirmationPage = this.willWritingService.fromConfirmationPage;

  constructor(
    private translate: TranslateService,
    private willWritingService: WillWritingService,
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    public footerService: FooterService,
    public navbarService: NavbarService,
    private router: Router,
    private cdr: ChangeDetectorRef) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.step = this.translate.instant('WILL_WRITING.COMMON.STEP_2');
      this.pageTitle = this.translate.instant('WILL_WRITING.MY_ESTATE_DISTRIBUTION.TITLE');
      this.confirmModal['hasNoImpact'] = this.translate.instant('WILL_WRITING.COMMON.CONFIRM');
      this.errorMsg = this.translate.instant('WILL_WRITING.MY_ESTATE_DISTRIBUTION.ERROR_MODAL');
      this.setPageTitle(this.pageTitle);
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarMode(4);
    if (this.willWritingService.getBeneficiaryInfo().length > 0) {
      this.beneficiaryList = this.willWritingService.getBeneficiaryInfo();
    }

    this.buildBeneficiaryForm();
    this.calculateRemPercentage();
    this.headerSubscription();
    this.footerService.setFooterVisibility(false);
    this.buildBeneficiaryFormArray();
    this.refreshView();
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  refreshView(){
    this.cdr.detectChanges();

  }

  headerSubscription() {
    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        if (this.distributionForm.dirty) {
          this.pageTitleComponent.goBack();
        } else {
          this.navbarService.goBack();
        }
        return false;
      }
    });
  }

  buildBeneficiaryForm() {
    this.distributionForm = this.formBuilder.group({
      percent: this.formBuilder.array([])
    });
  }

  buildBeneficiaryFormArray(){
    for(const value of this.beneficiaryList){
      console.log(value.distPercentage);
      const control = new FormControl(value.distPercentage, [Validators.required]);
      (<FormArray>this.distributionForm.get('percent')).push(control);
    }
  }

  // buildBeneficiaryForm() {
  //   for(const value of this.beneficiaryList){
  //     this.distributionForm = this.formBuilder.group({
  //       percent: [value.distPercentage, [Validators.required]]
  //     });
  //   }

  // }

  calculateRemPercentage() {
    for (const percent of this.beneficiaryList) {
      this.remainingPercentage = (this.remainingPercentage - percent.distPercentage);
    }
    return this.remainingPercentage;
  }

  updateDistPercentage(index: number, event) {
    for (const percent of this.beneficiaryList) {
      this.beneficiaryList[index].distPercentage = Math.floor(event.target.value);
      this.distPercentageSum += percent.distPercentage;
    }
    if (this.beneficiaryList[index].distPercentage < 0 || this.beneficiaryList[index].distPercentage > 100) {
      this.currentDist = this.beneficiaryList[index].distPercentage;
      setTimeout(() => this.beneficiaryList[index].distPercentage = 0, 0);
      this.willWritingService.openToolTipModal(this.errorMsg.MIN_ERROR, '');
      this.distPercentageSum = 0;
      for (const percent of this.beneficiaryList) {
        this.distPercentageSum += percent.distPercentage;
      }
      this.remainingPercentage = 100 - (this.distPercentageSum - this.beneficiaryList[index].distPercentage);
    } else {
      this.remainingPercentage = 100 - this.distPercentageSum;
    }
    this.distPercentageSum = 0;
    this.isFormAltered = true;
  }

  calcAfterReset() {
    this.remainingPercentage = 100 - this.distPercentageSum;
  }

  ngOnDestroy() {
    this.willWritingService.sub.subscribe((val)=>{
      if(val=='yes'){
        //const arrayField = this.distributionForm.get('percent') as FormArray;
        //arrayField.clear();
        this.clearInputFields();
      }
    })
    this.subscription.unsubscribe();
    this.navbarService.unsubscribeBackPress();
    //this.clearInputFields();
    //this.triggerMethod();

    // const ref = this.modal.open(PageTitleComponent, { centered: true });
    // ref.componentInstance.yesTrigger.subscribe((value: String)=>{
    //   if(value=='yes'){
    //     console.log(value);
    //     this.distributionForm.reset();
    //   }
    // })
  }
  triggerMethod(){
    console.log(this.distributionForm);
  }

  clearInputFields(){
    // for(let i=0; i<this.beneficiaryList.length; i++){
    //   const arrayField = this.distributionForm.get('percent') as FormArray;
    //   console.log(arrayField);
    //   arrayField.controls[i].reset();
    // }
    const arrayField = this.distributionForm.get('percent') as FormArray;
    arrayField.clear();
  }


  openConfirmationModal(title: string, message: string, url: string, hasImpact: boolean) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.hasImpact = this.confirmModal['hasNoImpact'];
    ref.componentInstance.unSaved = true;
    ref.result.then((data) => {
      if (data === 'yes') {
        console.log("In the error modal");
        this.save(url);
      }
    });
    return false;
  }

  validateBeneficiaryForm() {
    const estateDistList = this.beneficiaryList.filter((checked) => checked.selected === true);
    const filteredArr = estateDistList.filter((greater) => greater.distPercentage < 1);
    //const ref = this.pageTitleComponent.yesTgr;

    //console.log(ref);

    if (this.remainingPercentage < 0) {
      this.willWritingService.openToolTipModal(this.errorMsg.MAX_PERCENTAGE, '');
      return false;
    } else if (this.remainingPercentage !== 0 && filteredArr.length < 1) {
      this.willWritingService.openToolTipModal(this.errorMsg.ADJUST_PERCENTAGE, '');
      return false;
    } else if (filteredArr.length > 0) {
      this.willWritingService.openToolTipModal(this.errorMsg.NON_ALLOCATED_PERCENTAGE, '');
      return false;
    }
    return true;
  }

  save(url) {
    this.willWritingService.setBeneficiaryInfo(this.beneficiaryList);
    this.router.navigate([url]);
  }

  goToNext() {
    if (this.validateBeneficiaryForm()) {
      const url = this.fromConfirmationPage ? WILL_WRITING_ROUTE_PATHS.CONFIRMATION : WILL_WRITING_ROUTE_PATHS.APPOINT_EXECUTOR_TRUSTEE;
      if (this.fromConfirmationPage && this.isFormAltered) {
        this.openConfirmationModal(this.confirmModal['title'], this.confirmModal['message'], url,
        this.willWritingService.getIsWillCreated());
        console.log("moving to error modal");
      } else if (this.fromConfirmationPage) {
        this.save(url);
      } else {
        this.save(url);
      }
    }
  }
}
