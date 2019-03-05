import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged } from 'rxjs/operators';

import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { HeaderService } from '../../shared/header/header.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { IfastErrorModalComponent } from '../../shared/modal/ifast-error-modal/ifast-error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { TopupAndWithDrawService } from '../../topup-and-withdraw/topup-and-withdraw.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { FooterService } from './../../shared/footer/footer.service';
import { SIGN_UP_CONFIG } from '../sign-up.constant';

@Component({
  selector: 'app-add-update-bank',
  templateUrl: './add-update-bank.component.html',
  styleUrls: ['./add-update-bank.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddUpdateBankComponent implements OnInit {
  pageTitle;
  formValues: any;
  banks: any;
  bankForm: FormGroup;
  addBank: any;
  queryParams: any;
  buttonTitle;
  updateId: any;
  isAccountEdited: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private footerService: FooterService,
    private route: ActivatedRoute,
    public headerService: HeaderService,
    public navbarService: NavbarService,
    private signUpService: SignUpService,
    private modal: NgbModal,
    public investmentAccountService: InvestmentAccountService,
    public topupAndWithDrawService: TopupAndWithDrawService,
    public readonly translate: TranslateService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe(() => {
    });
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(6);
    this.queryParams = this.route.snapshot.queryParams;
    this.addBank = this.queryParams.addBank;
    this.translate.get('COMMON').subscribe(() => {
      if (this.addBank === 'true') {
        this.pageTitle = this.translate.instant('ADD_BANK.ADD');
        this.buttonTitle = this.translate.instant('ADD_BANK.ADD_NOW');
      } else {
        this.pageTitle = this.translate.instant('ADD_BANK.EDIT');
        this.buttonTitle = this.translate.instant('ADD_BANK.APPLY');
      }
      this.setPageTitle(this.pageTitle);
    });
    this.footerService.setFooterVisibility(false);
    this.getLookupList();
    this.buildBankForm();

    this.bankForm.get('accountNo').valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
      this.bankForm.get('accountNo').setValidators([Validators.required, Validators.pattern(RegexConstants.NumericOnly), this.signUpService.validateAccNoMaxLength]);
      this.bankForm.get('accountNo').updateValueAndValidity();
      this.isAccountEdited = true;
    });
  }
  buildBankForm() {
    this.formValues = this.investmentAccountService.getBankInfo();
    if(this.formValues.bank) {
      this.formValues.bank.accountNoMaxLength = SIGN_UP_CONFIG.ACCOUNT_NUMBER_MAX_LENGTH_INFO[this.formValues.bank.key];
    }
    this.updateId = this.formValues.id;
    this.bankForm = this.formBuilder.group({
      accountHolderName: [this.formValues.fullName, [Validators.required, Validators.pattern(RegexConstants.SymbolAlphabets)]],
      bank: [this.formValues.bank, [Validators.required]],
      accountNo: [this.formValues.accountNumber, [Validators.required]]
    });
    this.bankForm.controls.accountHolderName.disable();
  }
  getInlineErrorStatus(control) {
    return (!control.pristine && !control.valid);
  }

  setDropDownValue(key, value) {
    this.bankForm.controls[key].setValue(value);
    this.bankForm.get('accountNo').updateValueAndValidity();
  }
  setNestedDropDownValue(key, value, nestedKey) {
    this.bankForm.controls[nestedKey]['controls'][key].setValue(value);
  }
  // tslint:disable-next-line:cognitive-complexity
  applyChanges(form: any) {
    if (!form.valid) {
      Object.keys(form.controls).forEach((key) => {
        form.get(key).markAsDirty();
      });
      const error = this.signUpService.getFormErrorList(form);
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = error.title;
      ref.componentInstance.errorMessageList = error.errorMessages;
      return false;
    } else {
      // tslint:disable-next-line:no-all-duplicated-branches
      if (this.addBank === 'true') {
        // Add Bank API Here
        this.topupAndWithDrawService.saveNewBank(form.getRawValue()).subscribe((response) => {
          if (response.responseMessage.responseCode < 6000) {
            // ERROR SCENARIO
            const errorResponse = response.objectList;
            const errorList = errorResponse.serverStatus.errors;
            this.showIfastErrorModal(errorList);
          } else {
            this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
          }
        });
      } else {
        // tslint:disable-next-line:max-line-length
        let accountNum = null;
        if (this.isAccountEdited) {
          accountNum = form.value.accountNo;
        }
        this.signUpService.updateBankInfo(form.value.bank,
          form.getRawValue().accountHolderName, accountNum, this.updateId).subscribe((data) => {
          // tslint:disable-next-line:triple-equals
          if (data.responseMessage.responseCode < 6000) {
            // ERROR SCENARIO
            const errorResponse = data.objectList;
            const errorList = errorResponse.serverStatus.errors;
            this.showIfastErrorModal(errorList);
          } else {
            this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
          }
        });
        // Edit Bank APi here
      }
    }
  }
  getLookupList() {
    this.topupAndWithDrawService.getAllDropDownList().subscribe((data) => {
      this.banks = data.objectList.bankList;
      this.banks = this.signUpService.addMaxLengthInfoForAccountNo(this.banks);
    });
  }

  showIfastErrorModal(errorList) {
    const errorTitle = this.translate.instant(
      'IFAST_ERROR_TITLE'
    );
    const ref = this.modal.open(IfastErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = errorTitle;
    ref.componentInstance.errorList = errorList;
  }
}
