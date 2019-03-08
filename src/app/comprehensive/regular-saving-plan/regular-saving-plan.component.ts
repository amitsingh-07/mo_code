import { Component, HostListener, OnDestroy, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { Subscription } from 'rxjs';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { IRegularSavePlan } from '../comprehensive-types';
import { ComprehensiveService } from '../comprehensive.service';
import { appConstants } from './../../app.constants';
import { AppService } from './../../app.service';
import { ConfigService } from './../../config/config.service';
import { FooterService } from './../../shared/footer/footer.service';
import { apiConstants } from './../../shared/http/api.constants';
import { NavbarService } from './../../shared/navbar/navbar.service';

@Component({
  selector: 'app-regular-saving-plan',
  templateUrl: './regular-saving-plan.component.html',
  styleUrls: ['./regular-saving-plan.component.scss']
})
export class RegularSavingPlanComponent implements OnInit, OnDestroy {

  pageTitle: string;
  RSPForm: FormGroup;
  investmentList: any;
  pageId: string;
  menuClickSubscription: Subscription;
  RSPSelection: boolean;
  regularSavingsArray: IRegularSavePlan;
  constructor(private route: ActivatedRoute, private router: Router, public navbarService: NavbarService,
              private translate: TranslateService, private formBuilder: FormBuilder,
              private configService: ConfigService, private comprehensiveService: ComprehensiveService) {
    this.pageId = this.route.routeConfig.component.name;
    this.configService.getConfig().subscribe((config: any) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      this.translate.get(config.common).subscribe((result: string) => {
        // meta tag and title
        this.investmentList = this.translate.instant('CMP.INVESTMENT_TYPE_LIST');
        this.pageTitle = this.translate.instant('CMP.COMPREHENSIVE_STEPS.STEP_2_TITLE');
        this.setPageTitle(this.pageTitle);
      });
    });

  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }
  @HostListener('input', ['$event'])
  onChange() {
    this.rspSelection();
  }
  rspSelection() {
    this.RSPForm.valueChanges.subscribe((form: any) => {
      this.RSPSelection =  form.hasRegularSavings === 'true'  ? true : false;
    });
  }
  ngOnInit() {
    this.navbarService.setNavbarComprehensive(true);
    this.menuClickSubscription = this.navbarService.onMenuItemClicked.subscribe((pageId) => {
      if (this.pageId === pageId) {
        alert('Menu Clicked');
      }
    });
    this.regularSavingsArray = this.comprehensiveService.getRSP();
    this.buildRSPForm();
  }
  ngOnDestroy() {
    this.navbarService.unsubscribeMenuItemClick();
    this.menuClickSubscription.unsubscribe();
  }

  buildRSPForm() {
    const regularSavings = [];
    if (this.regularSavingsArray.comprehensiveRegularSavingsList) {

      this.RSPSelection = this.regularSavingsArray.hasRegularSavings;
      this.regularSavingsArray.comprehensiveRegularSavingsList.forEach((regularSavePlan: any) => {
        regularSavings.push(this.buildRSPDetailsForm(regularSavePlan));
      });
    } else {
      regularSavings.push(this.buildEmptyRSPForm());
    }
    this.RSPForm = this.formBuilder.group({
      hasRegularSavings: [this.regularSavingsArray.hasRegularSavings, Validators.required],
      comprehensiveRegularSavingsList: this.formBuilder.array(regularSavings),
    });
  }
  buildRSPDetailsForm(value) {
    return this.formBuilder.group({
      regularUnitTrust: [value.regularUnitTrust, [Validators.required]],
      regularPaidByCash: [value.regularPaidByCash, [Validators.required]],
      regularPaidByCPF: [value.regularPaidByCash, [Validators.required]]

    });
  }
  buildEmptyRSPForm() {
    return this.formBuilder.group({
      regularUnitTrust: ['', [Validators.required]],
      regularPaidByCash: ['', [Validators.required]],
      regularPaidByCPF: ['', [Validators.required]]

    });
  }
  addRSP() {
    const RSPDetails = this.RSPForm.get('comprehensiveRegularSavingsList') as FormArray;
    RSPDetails.push(this.buildEmptyRSPForm());
  }
  removeRSP(i) {
    const dependantDetails = this.RSPForm.get('comprehensiveRegularSavingsList') as FormArray;
    dependantDetails.removeAt(i);
  }
  selectInvest(status, i) {
    const investment = status ? status : '';
    this.RSPForm.controls['comprehensiveRegularSavingsList']['controls'][i].controls.regularUnitTrust.setValue(investment);
  }
  goToNext(form) {
  this.comprehensiveService.setRSP(form.value);
  this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.BAD_MOOD_FUND]);
  }
}
