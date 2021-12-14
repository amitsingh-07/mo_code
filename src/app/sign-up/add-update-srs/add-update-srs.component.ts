

import { Component, HostListener, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Subject, Subscription } from 'rxjs';

import { InvestmentAccountService } from '../../investment/investment-account/investment-account-service';
import { InvestmentEngagementJourneyService } from '../../investment/investment-engagement-journey/investment-engagement-journey.service';
import { ManageInvestmentsService } from '../../investment/manage-investments/manage-investments.service';
import { FooterService } from '../../shared/footer/footer.service';
import { HeaderService } from '../../shared/header/header.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { SIGN_UP_CONFIG } from '../sign-up.constant';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';

import { InvestmentCommonService } from '../../investment/investment-common/investment-common.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-update-srs',
  templateUrl: './add-update-srs.component.html',
  styleUrls: ['./add-update-srs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddUpdateSrsComponent implements OnInit, OnDestroy {
  pageTitle: string;
  addUpdateSrsFrom: FormGroup;
  formValues;
  investmentAccountFormValues;
  fundingMethods: any;
  srsAgentBankList;
  srsDetail;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  subscription: Subscription;

  isEdit = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private footerService: FooterService,
    public headerService: HeaderService,
    public navbarService: NavbarService,
    private signUpService: SignUpService,
    private authService: AuthenticationService,
    public investmentAccountService: InvestmentAccountService,
    public manageInvestmentsService: ManageInvestmentsService,
    public readonly translate: TranslateService,
    public investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    private investmentCommonService: InvestmentCommonService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe(() => {
    });
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.subscribeBackEvent();
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.footerService.setFooterVisibility(false);
    this.translate.get('COMMON').subscribe(() => {
      this.pageTitle = this.translate.instant('ADD_UPDATE_SRS.TITLE');
      this.setPageTitle(this.pageTitle);
    });
    this.footerService.setFooterVisibility(false);
    this.srsDetail = this.signUpService.getSrsDetails();
    this.getSrsBankOperator();
    this.buildForm();
    this.addorRemoveAccNoValidator();

    this.authService.get2faAuthEvent
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((token) => {
        if (!token) {
          this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
        }
      });

    this.manageInvestmentsService.getProfileSrsAccountDetails()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        if (data) {
          this.srsDetail = data;
          this.addUpdateSrsFrom.patchValue({
            srsOperator: { name: data.srsOperator },
            srsAccount: data.srsAccountNumber.conformedValue
          });
        }
      });

    this.translate.get('ERROR').subscribe((results) => {
      this.authService.get2faErrorEvent
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data) => {
          if (data) {
            this.authService.openErrorModal(
              results.SESSION_2FA_EXPIRED.TITLE,
              results.SESSION_2FA_EXPIRED.SUB_TITLE,
              results.SESSION_2FA_EXPIRED.BUTTON
            );
          }
        });
    });
  }

  ngOnDestroy() {
    this.signUpService.clearRedirectUrl();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  subscribeBackEvent() {
    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE])
      }
    });
  }

  buildForm() {
    this.addUpdateSrsFrom = this.formBuilder.group({
      srsOperator: [this.srsDetail && this.srsDetail.srsOperatorBank, [Validators.required]],
      srsAccount: [this.srsDetail && this.srsDetail.srsAccountNumber, [Validators.required]]
    });
  }

  getSrsBankOperator() {
    this.investmentAccountService.getSpecificDropList('srsAgentBank').subscribe((data) => {
      this.srsAgentBankList = data.objectList.srsAgentBank;
    }, () => {
      this.investmentAccountService.showGenericErrorModal();
    });
  }

  selectSrsOperator(key, value) {
    this.addUpdateSrsFrom.controls[key].setValue(value);
    this.addUpdateSrsFrom.controls['srsAccount'].setValue(null);
    this.addorRemoveAccNoValidator();
  }

  maskConfig() {
    const config = {
      mask: RegexConstants.operatorMask.DBS
    };
    if (this.addUpdateSrsFrom.get('srsOperator').value) {
      const operator = this.addUpdateSrsFrom.get('srsOperator').value.name;
      if (operator) {
        switch (operator.toUpperCase()) {
          case SIGN_UP_CONFIG.BANK_KEYS.DBS:
            config.mask = RegexConstants.operatorMask.DBS;
            break;
          case SIGN_UP_CONFIG.BANK_KEYS.OCBC:
            config.mask = RegexConstants.operatorMask.OCBC;
            break;
          case SIGN_UP_CONFIG.BANK_KEYS.UOB:
            config.mask = RegexConstants.operatorMask.UOB;
            break;
        }
      }
    }
    return config;
  }

  getAccNoLength() {
    if (this.addUpdateSrsFrom.get('srsOperator').value) {
      const accNo = this.addUpdateSrsFrom.get('srsAccount').value;
      if (accNo) {
        return accNo.match(/\d/g).join('').length;
      } else {
        return 0;
      }
    }
  }

  getAccNoMaxLength() {
    let accNoMaxLength;
    switch (this.addUpdateSrsFrom.get('srsOperator').value.name) {
      case SIGN_UP_CONFIG.BANK_KEYS.DBS:
        accNoMaxLength = 14;
        break;
      case SIGN_UP_CONFIG.BANK_KEYS.OCBC:
        accNoMaxLength = 12;
        break;
      case SIGN_UP_CONFIG.BANK_KEYS.UOB:
        accNoMaxLength = 9;
        break;
    }
    return accNoMaxLength;
  }

  getInlineErrorStatus(control) {
    return !control.pristine && !control.valid;
  }

  addorRemoveAccNoValidator() {
    const accNoControl = this.addUpdateSrsFrom.get('srsAccount');
    const selectedBank = this.addUpdateSrsFrom.get('srsOperator').value;
    if (selectedBank) {
      switch (selectedBank.name.toUpperCase()) {
        case SIGN_UP_CONFIG.BANK_KEYS.DBS:
          accNoControl.setValidators(
            [Validators.required, Validators.pattern(RegexConstants.operatorMaskForValidation.DBS)]);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.OCBC:
          accNoControl.setValidators(
            [Validators.required, Validators.pattern(RegexConstants.operatorMaskForValidation.OCBC)]);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.UOB:
          accNoControl.setValidators(
            [Validators.required, Validators.pattern(RegexConstants.operatorMaskForValidation.UOB)]);
          break;
      }
      this.addUpdateSrsFrom.updateValueAndValidity();
    }
  }

  onKeyPressEvent(event: any, content: any) {
    this.investmentAccountService.onKeyPressEvent(event, content);
  }

  @HostListener('input', ['$event'])
  onChange(event) {
    const id = event.target.id;
    if (id !== '') {
      const content = event.target.innerText;
      if (content.length >= SIGN_UP_CONFIG.ACCOUNT_NUM_MAX_LIMIT) {
        const contentList = content.substring(0, SIGN_UP_CONFIG.ACCOUNT_NUM_MAX_LIMIT);
        const el = document.querySelector('#' + id);
        this.investmentAccountService.setCaratTo(el, SIGN_UP_CONFIG.ACCOUNT_NUM_MAX_LIMIT, contentList);
      }
    }
  }

  updateSrsSaveCall(form: any) {
    if (!form.valid) {
      return false;
    } else if(this.isEdit) {
      this.isEdit = false;
      const formValue = form.getRawValue();
      const reqParams = {};
      const opertorId = this.getOperatorIdByName(formValue.srsOperator.name, this.srsAgentBankList);
      reqParams['srsDetails'] = {
        accountNumber: formValue.srsAccount ? formValue.srsAccount.replace(/[-]/g, '') : null,
        operatorId: opertorId ? opertorId : null
      };
      this.investmentCommonService.saveProfileSrsAccountDetails(reqParams, this.srsDetail.customerId).subscribe(() => {
        this.isEdit = true;
        this.manageInvestmentsService.setSrsAccountDetails(null);
        this.manageInvestmentsService.setSrsSuccessFlag(true);
        this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
      }, () => {
        this.isEdit = true;
        this.investmentAccountService.showGenericErrorModal();
      });
    }
  }

  getOperatorIdByName(operatorName, OperatorOptions) {
    if (operatorName && OperatorOptions) {
      const operatorBank = OperatorOptions.filter(
        (prop) => prop.name === operatorName
      );
      return operatorBank[0].id;
    } else {
      return '';
    }
  }

}
