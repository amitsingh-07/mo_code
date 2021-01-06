

import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { IPageComponent } from '../../shared/interfaces/page-component.interface';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { GuideMeApiService } from '../guide-me.api.service';
import { GuideMeService } from '../guide-me.service';
import { MobileModalComponent } from '../mobile-modal/mobile-modal.component';
import { LongTermCare, LONG_TERM_CARE_SHIELD } from './ltc-assessment';
import { AboutAge } from '../../shared/utils/about-age.util';

const assetImgPath = './assets/images/';

@Component({
  selector: 'app-ltc-assessment',
  templateUrl: './ltc-assessment.component.html',
  styleUrls: ['./ltc-assessment.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class LtcAssessmentComponent implements IPageComponent, OnInit, OnDestroy {

  pageTitle: string;
  pageSubTitle: string;
  modalData: any;
  longTermCareForm: FormGroup; // Working FormGroup
  longTermCareFormValues: LongTermCare;
  longTermCareList: any[];
  isFormValid = false;

  private subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder, private router: Router,
    private translate: TranslateService, private guideMeService: GuideMeService,
    public modal: NgbModal, public navbarService: NavbarService,
    private guideMeApiService: GuideMeApiService, private aboutAge: AboutAge
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('LTC_ASSESSMENT.TITLE');
      this.pageSubTitle = this.translate.instant('LTC_ASSESSMENT.SUB_TITLE');
      this.modalData = this.translate.instant('LTC_ASSESSMENT.MODAL_DATA');
      this.setPageTitle(this.pageTitle, this.pageSubTitle, true);
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarDirectGuided(true);
    this.longTermCareFormValues = this.guideMeService.getLongTermCare();
    this.longTermCareForm = new FormGroup({
      careGiverType: new FormControl(this.longTermCareFormValues.careGiverTypeId + '', Validators.required)
    });
    if (this.longTermCareFormValues.careGiverTypeId) {
      this.isFormValid = true;
    }
    const userInfo = this.guideMeService.getUserInfo();
    const today: Date = new Date();
    const getAge = this.aboutAge.calculateAge(userInfo.customDob, today);
    const careShield = (getAge >= LONG_TERM_CARE_SHIELD.AGE && userInfo.dob.year >= LONG_TERM_CARE_SHIELD.MIN_YEAR && userInfo.dob.year <= LONG_TERM_CARE_SHIELD.MAX_YEAR);
    this.guideMeApiService.getLongTermCareList().subscribe((data) => {      
      if (careShield) {
        this.longTermCareList = [];
        data.objectList.forEach((careList) => {
          if(careList.careGiverType && careList.careGiverType.toLowerCase() !== LONG_TERM_CARE_SHIELD.TYPE) {
            this.longTermCareList.push(careList);
          }
        });
      } else {
        this.longTermCareList = data.objectList; // Getting the information from the API
      }
    });

    this.subscription = this.navbarService.currentMobileModalEvent.subscribe((event) => {
      if (event === this.pageTitle) {
        this.showMobilePopUp();
      }
    });    
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.guideMeService.decrementProtectionNeedsIndex();
  }

  setPageTitle(title: string, subTitle?: string, helpIcon?: boolean) {
    this.navbarService.setPageTitle(title, subTitle, helpIcon);
  }

  validateForm(careGiver) {
    this.longTermCareFormValues = {
      careGiverType: careGiver.careGiverType,
      careGiverDescription: careGiver.careGiverDescription,
      careGiverTypeId: careGiver.id
    } as LongTermCare;
    this.isFormValid = true;
  }

  save(form: any) {
    const selectedCareGiverType: LongTermCare = {
      careGiverType: this.longTermCareFormValues.careGiverType,
      careGiverDescription: this.longTermCareFormValues.careGiverDescription,
      careGiverTypeId: this.longTermCareFormValues.careGiverTypeId,
      monthlyPayout: 0
    };
    this.guideMeService.setLongTermCare(selectedCareGiverType);
    return true;
  }

  goToNext(form) {
    if (this.save(form)) {
      this.router.navigate([this.guideMeService.getNextProtectionNeedsPage()]).then(() => {
        this.guideMeService.incrementProtectionNeedsIndex();
      });
    }
  }

  showMobilePopUp() {
    const ref = this.modal.open(MobileModalComponent, {
      centered: true, windowClass: 'ltc-mobile-modal'
    });
    ref.componentInstance.mobileTitle = this.modalData.TITLE;
    ref.componentInstance.description = this.modalData.DESCRIPTION;
    ref.componentInstance.icon_description = this.modalData.LOGO_DESCRIPTION;
    this.navbarService.showMobilePopUp('removeClicked');
  }
}
