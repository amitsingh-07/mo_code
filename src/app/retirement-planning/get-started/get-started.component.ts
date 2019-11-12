import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RegexConstants } from 'src/app/shared/utils/api.regex.constants';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';
import { RetirementPlanningService } from '../retirement-planning.service';
import { AuthenticationService } from 'src/app/shared/http/auth/authentication.service';
import { RETIREMENT_PLANNING_ROUTE_PATHS } from '../retirement-planning-routes.constants';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class GetStartedComponent implements OnInit {
  retirementPlanningForm: FormGroup;
  distribution: any;
  pageTitle: string;
  formValues: any;

  submitted: boolean = false;
  confirmEmailFocus = false;

  constructor(
    public navbarService: NavbarService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    public retirementPlanningService: RetirementPlanningService,
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('RETIREMENT_PLANNING.GET_STARTED.LABEL');
      this.navbarService.setPageTitle(this.pageTitle, undefined, undefined, undefined, undefined, undefined);
    });
  }

  get retirementPlan() {
    return this.retirementPlanningForm.controls;
  }

  ngOnInit() {
    this.navbarService.setNavbarMode(8);
    this.buildFormData();
    this.authService.authenticate().subscribe((token) => {
    });
  }

  buildFormData() {
    this.formValues = this.retirementPlanningService.getUserDetails();
    if (!this.formValues.firstName) {
      this.formValues.marketingAcceptance = true;
      this.formValues.consent = true;
    }
    this.retirementPlanningForm = this.formBuilder.group({
      firstName: [this.formValues.firstName, [Validators.required, Validators.minLength(2),
      Validators.maxLength(40), Validators.pattern(RegexConstants.NameWithSymbol)]],
      lastName: [this.formValues.lastName, [Validators.required, Validators.minLength(2),
      Validators.maxLength(40), Validators.pattern(RegexConstants.NameWithSymbol)]],
      emailAddress: [this.formValues.emailAddress, [Validators.required, Validators.email]],
      confirmEmail: [this.formValues.confirmEmail],
      mobileNumber: [this.formValues.mobileNumber, [Validators.required]],
      marketingAcceptance: [this.formValues.marketingAcceptance],
      consent: [this.formValues.consent]
    }, { validator: this.validateMatchEmail() });
  }

  /**
  * save retirementPlanningForm.
  * @param form - retirement plan - user form details.
  */
  save() {
    this.submitted = true;
    if (this.retirementPlanningForm.valid) {
      this.retirementPlanningService.setUserDetails(this.retirementPlanningForm.value);
      this.router.navigate([RETIREMENT_PLANNING_ROUTE_PATHS.RETIREMENT_NEEDS]);
    }
  }


  /**
   * validate confirm email.
   */
  private validateMatchEmail() {
    return (group: FormGroup) => {
      const emailInput = group.controls['emailAddress'];
      const emailConfirmationInput = group.controls['confirmEmail'];

      const mobileNumberInput = group.controls['mobileNumber'];
      const SINGAPORE_MOBILE_REGEXP = RegexConstants.MobileNumber;

      // Confirm E-mail
      if (!emailConfirmationInput.value) {
        emailConfirmationInput.setErrors({ required: true });
      } else if (emailInput.value && emailInput.value.toLowerCase() !== emailConfirmationInput.value.toLowerCase()) {
        emailConfirmationInput.setErrors({ notEquivalent: true });
      } else {
        emailConfirmationInput.setErrors(null);
      }

      // Mobile Number
      if (!mobileNumberInput.value) {
        mobileNumberInput.setErrors({ required: true });
      } else if (!SINGAPORE_MOBILE_REGEXP.test(mobileNumberInput.value)) {
        mobileNumberInput.setErrors({ mobileRange: true });
      } else {
        mobileNumberInput.setErrors(null);
      }
    };
  }

  showValidity(from) {
    if (from === 'confirmEmail') {
      this.confirmEmailFocus = !this.confirmEmailFocus;
    }
  }

  onlyNumber(el) {
    this.retirementPlanningForm.controls['mobileNumber'].setValue(el.value.replace(RegexConstants.OnlyNumeric, ''));
  }

}
