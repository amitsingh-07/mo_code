import { Component, OnInit,  } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
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
export class RegularSavingPlanComponent implements OnInit {

  pageTitle: string;
  RSPForm: FormGroup;
  dependantsArray: any;
  constructor(private route: ActivatedRoute, private router: Router, public navbarService: NavbarService,
              private translate: TranslateService, private formBuilder: FormBuilder,
              private configService: ConfigService) {
    this.configService.getConfig().subscribe((config) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
    });
    this.translate.get('COMMON').subscribe((result: string) => {
      // meta tag and title
      this.pageTitle = this.translate.instant('DEPENDANT_SELECTION.TITLE');
      this.setPageTitle(this.pageTitle);
    });

  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.buildRSPForm();
  }
  buildRSPForm() {

    this.RSPForm = this.formBuilder.group({
      RSPSelection: ['', Validators.required],
      RSPDetails: this.formBuilder.array([this.buildRSPDetailsForm()]),

    });

  }
  buildRSPDetailsForm() {
    return this.formBuilder.group({
      unitTypeTrust: ['', [Validators.required]],
      paidByCash: ['', [Validators.required]],
      paidByCPF: ['', [Validators.required]]

    });
  }
  addRSP() {
    const RSPDetails = this.RSPForm.get('RSPDetails') as FormArray;
    RSPDetails.push(this.buildRSPDetailsForm());
  }
  removeRSP(i) {
    const dependantdetails = this.RSPForm.get('RSPDetails') as FormArray;
    dependantdetails.removeAt(i);
  }
  goToNext(form) {
    this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.BAD_MOOD_FUND]);
  }
}
