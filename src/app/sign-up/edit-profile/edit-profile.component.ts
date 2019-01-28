import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../../investment-account/investment-account-routes.constants';
import { InvestmentAccountService } from '../../investment-account/investment-account-service';
import { INVESTMENT_ACCOUNT_CONFIG } from '../../investment-account/investment-account.constant';
import { HeaderService } from '../../shared/header/header.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  resetPasswordForm: FormGroup;
  formValues: any;
  personalData: any;
  fullName: string;
  compinedName: string;
  compinednricNum: string;
  compinedPassport: string;
  residentialAddress: any;
  compinedAddress: string;
  compinedMailingAddress: string;
  empolymentDetails: any;
  compinedEmployerAddress: any;
  bankDetails: any;
  mailingAddress: any;
  contactDetails: any;
  employerAddress: any;
  entireUserData: any;
  nationalityList: any;
  countryList: any;
  isMailingAddressSame: boolean;
  isSingaporeResident: boolean;
  hiddenAccountNum: any;
  resNationality: any;
  mailNationality: any;
  employerNationality: any;
  pageTitle: any;
  constructor(
    // tslint:disable-next-line
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    public headerService: HeaderService,
    public navbarService: NavbarService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthenticationService,
    public investmentAccountService: InvestmentAccountService,
    public readonly translate: TranslateService) {
      this.translate.use('en');
      this.translate.get('COMMON').subscribe(() => {
        this.pageTitle = this.translate.instant('EDIT_PROFILE.CONFIRMATION');
        this.setPageTitle(this.pageTitle);
      });
      this.getNationalityCountryList();
  }

  ngOnInit() {
    this.navbarService.setNavbarMobileVisibility(true);
    this.navbarService.setNavbarMode(2);
    this.setPageTitle(this.pageTitle);
    this.buildForgotPasswordForm();
    this.getEditProfileData();
    this.isMailingAddressSame = true;
  }
  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  showHidePassword(el) {
    if (el.type === 'password') {
      el.type = 'text';
    } else {
      el.type = 'password';
    }
  }
  showHide(el) {
    if (el.style.display === '' || el.style.display === 'block') {
      el.style.display = 'none';
    } else {
      el.style.display = 'block';
    }
  }
  buildForgotPasswordForm() {
    this.formValues = this.signUpService.getForgotPasswordInfo();
    this.resetPasswordForm = this.formBuilder.group({
      oldPassword: [this.formValues.oldPassword, [Validators.required, Validators.pattern(RegexConstants.Password.Full)]],
      newPassword: [this.formValues.oldPassword, [Validators.required, Validators.pattern(RegexConstants.Password.Full)]],
      confirmPassword: [this.formValues.oldPassword, [Validators.required, Validators.pattern(RegexConstants.Password.Full)]]
    });
  }
  getEditProfileData() {
    this.signUpService.getEditProfileInfo().subscribe((data) => {
      this.entireUserData = data.objectList;
      if (data.objectList) {
      if ( data.objectList.personalInformation ) {
      this.personalData = data.objectList.personalInformation;
      }
      if (data.objectList && data.objectList.contactDetails && data.objectList.contactDetails.homeAddress) {
        this.residentialAddress = data.objectList.contactDetails.homeAddress;
      }
      this.empolymentDetails = data.objectList.employmentDetails;
      if (data.objectList.customerBankDetail) {
        this.bankDetails = data.objectList.customerBankDetail[0];
      }
      if ((data.objectList.contactDetails && data.objectList.contactDetails.mailingAddress)) {
        this.mailingAddress = data.objectList.contactDetails.mailingAddress;
        this.isMailingAddressSame = false;
      }
      if (data.objectList.contactDetails) {
        this.contactDetails = data.objectList.contactDetails;
      }
      console.log(this.personalData);
      if (this.personalData) {
      this.setFullName(this.personalData.firstName, this.personalData.lastName);
      this.setTwoLetterProfileName(this.personalData.firstName, this.personalData.lastName);
      this.setNric(this.personalData.nricNumber);
      if ( this.personalData.passportNumber) {
      this.compinedPassport = 'Passport: ' + this.personalData.passportNumber;
      }
      if (this.personalData &&  this.personalData.isSingaporeResident) {
        this.isSingaporeResident = this.personalData.isSingaporeResident;
      }
    }
    }
      // tslint:disable-next-line:max-line-length
      if (this.empolymentDetails && this.empolymentDetails.employerDetails && this.empolymentDetails.employerDetails.detailedemployerAddress) {
        this.employerAddress = this.empolymentDetails.employerDetails.detailedemployerAddress;
      }
      if ( this.residentialAddress && this.residentialAddress.country &&  this.residentialAddress.country.nationalityCode ) {
      this.resNationality = this.residentialAddress.country.nationalityCode;
      }
      if ( this.mailingAddress && this.mailingAddress.country && this.mailingAddress.country.nationalityCode) {
      this.mailNationality = this.mailingAddress.country.nationalityCode;
      }
      // tslint:disable-next-line:max-line-length
      if ( this.empolymentDetails && this.empolymentDetails.employerDetails && this.empolymentDetails.employerDetails.detailedemployerAddress &&  this.empolymentDetails.employerDetails.detailedemployerAddress.employerAddress &&  this.empolymentDetails.employerDetails.detailedemployerAddress.employerAddress.country && this.empolymentDetails.employerDetails.detailedemployerAddress.employerAddress.country.nationalityCode ) {
      this.employerNationality = this.empolymentDetails.employerDetails.detailedemployerAddress.employerAddress.country.nationalityCode;
      }
    });
  }
  createMaskString(val) {
    let i;
    let maskedStr = '';
    for (i = 0; i < val; i++) {
      maskedStr = maskedStr + '*';
    }
    return maskedStr;
  }
  setFullName(firstName, LastName) {
    this.fullName = firstName + ' ' + LastName;
  }
  setTwoLetterProfileName(firstName, LastName) {
    const first = firstName.charAt(0);
    const second = LastName.charAt(0);
    this.compinedName = first.toUpperCase() + second.toUpperCase();
  }
  setNric(nric) {
    this.compinednricNum = 'NRIC Number: ' + nric;
  }
  setAddres(address1, address2) {
    this.compinedAddress = address1 + ' ' + address2;
  }
  setMailingAddres(address1, address2) {
    this.compinedMailingAddress = address1 + ' ' + address2;
  }
  setEmployerAddress(address1, address2) {
    this.compinedEmployerAddress = address1 + ' ' + address2;
  }
  editEmployeDetails() {
    // tslint:disable-next-line:max-line-length
    this.investmentAccountService.setEditProfileEmployeInfo(this.entireUserData, this.nationalityList, this.countryList, this.isSingaporeResident);
    // tslint:disable-next-line:max-line-length
    this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.EMPLOYMENT_DETAILS], { queryParams: { enableEditProfile: true }, fragment: 'loading' });
  }
  editUserDetails() {
    this.signUpService.setOldContactDetails(this.personalData.countryCode, this.personalData.mobileNumber, this.personalData.email);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.UPDATE_USER_ID]);
  }
  editPassword() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PASSWORD]);
  }
  getNationalityCountryList() {
    this.investmentAccountService.getNationalityCountryList().subscribe((data) => {
      this.nationalityList = data.objectList;
      this.countryList = this.getCountryList(data.objectList);
    });
  }

  getCountryList(data) {
    const countryList = [];
    data.forEach((nationality) => {
        if (!nationality.blocked) {
        nationality.countries.forEach((country) => {
            countryList.push(country);
        });
    }});
    return countryList;
 }
  editContactDetails() {
    let uploadedDocuments = [] ;
    let mailingUrl;
    let ResUrl ;
    if (this.entireUserData.documentDetails) {
    uploadedDocuments = this.entireUserData.documentDetails;
    }
    let i;
    for (i = 0; i < uploadedDocuments.length; i++) {
    if ( uploadedDocuments[i].docType === 'MAILING_ADDRESS_PROOF' ) {
      mailingUrl = uploadedDocuments[i].fileName;
    }
    if ( uploadedDocuments[i].docType === 'RESIDENTIAL_ADDRESS_PROOF' ) {
      ResUrl = uploadedDocuments[i].fileName;
    }
    }
    // tslint:disable-next-line:max-line-length
    this.investmentAccountService.setEditProfileContactInfo(this.entireUserData, this.nationalityList, this.countryList, this.isMailingAddressSame, this.isSingaporeResident , mailingUrl , ResUrl);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_RESIDENTIAL]);
  }
  isCountrySIngapore(nationalityCode) {
    if (nationalityCode === 'SG') {
    return true;
    } else {
      return false;
    }

  }
  editBankDetails() {
    let AccountHolderName;
    if (this.bankDetails && this.bankDetails.accountName) {
      AccountHolderName = this.bankDetails.accountName;
    } else {
      AccountHolderName = this.fullName;
    }
    // tslint:disable-next-line:max-line-length accountName
    this.investmentAccountService.setEditProfileBankDetail(AccountHolderName, this.bankDetails.bank, this.bankDetails.accountNumber, this.bankDetails.id, false);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.UPDATE_BANK], { queryParams: { addBank: false }, fragment: 'bank' });
  }
  addBankDetails() {
    this.investmentAccountService.setEditProfileBankDetail(null, null, null, null, true);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.UPDATE_BANK], { queryParams: { addBank: true }, fragment: 'bank' });
  }
}
