import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDatepickerConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { userInfo } from 'os';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive-routes.constants';
import { appConstants } from './../../app.constants';
import { AppService } from './../../app.service';
import { ConfigService } from './../../config/config.service';
import { FooterService } from './../../shared/footer/footer.service';
import { apiConstants } from './../../shared/http/api.constants';
import { NavbarService } from './../../shared/navbar/navbar.service';
@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  registeredUser = true;
  pageTitle: string;
  userDetails: any;
  myProfileForm: FormGroup;
  nationality = '';
  nationalityList: string;

  constructor(private route: ActivatedRoute, private router: Router, public navbarService: NavbarService,
              private translate: TranslateService, private formBuilder: FormBuilder, private configService: ConfigService,
              private configDate: NgbDatepickerConfig) {

    this.configService.getConfig().subscribe((config) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
    });
    this.translate.get('COMMON').subscribe((result: string) => {
      // meta tag and title
      this.pageTitle = this.translate.instant('DEPENDANT_DETAILS.TITLE');
      this.nationalityList = this.translate.instant('NATIONALITY');
      this.setPageTitle(this.pageTitle);
    });
    const today: Date = new Date();
    configDate.minDate = { year: (today.getFullYear() - 100), month: (today.getMonth() + 1), day: today.getDate() };
    configDate.maxDate = { year: today.getFullYear(), month: (today.getMonth() + 1), day: today.getDate() };
    configDate.outsideDays = 'collapsed';

    this.userDetails = {
      name: 'kelvin NG',
      gender: 'male',
      dob: '04/05/1995',
      nationality: 'singaporean',
      registeredUser: false

    };
    this.registeredUser = this.userDetails.registeredUser;

  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {

    this.buildMyProfileForm(this.userDetails);
  }
  buildMyProfileForm(userDetails) {
    this.myProfileForm = this.formBuilder.group({
      name: [userDetails.name, [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      gender: [userDetails.gender, [Validators.required]],
      nationality: [userDetails.nationality, [Validators.required]],
      dob: [userDetails.dob, [Validators.required]],

    });
  }
  goToNext(profileForm) {
    this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.DEPENDANT_EDUCATION]);
  }
  selectNationality(nationality) {
    nationality = nationality ? nationality : { text: '', value: '' };
    this.nationality = nationality.text;
    this.myProfileForm.controls['nationality'].setValue(nationality.value);
    this.myProfileForm.markAsDirty();
  }
}
