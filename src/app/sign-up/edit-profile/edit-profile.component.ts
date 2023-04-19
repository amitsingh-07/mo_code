import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';
import { InvestmentCommonService } from './../../investment/investment-common/investment-common.service';

import { CustomErrorHandlerService } from './../../shared/http/custom-error-handler.service';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../../investment/investment-account/investment-account-routes.constants';
import { InvestmentAccountService } from '../../investment/investment-account/investment-account-service';
import { ManageInvestmentsService } from '../../investment/manage-investments/manage-investments.service';
import { HeaderService } from '../../shared/header/header.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SrsSuccessModalComponent } from '../add-update-srs/srs-success-modal/srs-success-modal.component';
import { SIGN_UP_CONFIG } from '../sign-up.constant';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { environment } from './../../../environments/environment';
import { ConfigService, IConfig } from './../../config/config.service';
import { LoaderService } from './../../shared/components/loader/loader.service';
import { FooterService } from './../../shared/footer/footer.service';
import { SessionsService } from './../../shared/Services/sessions/sessions.service';
import { appConstants } from './../../app.constants';


import { ActivateSingpassModalComponent } from './activate-singpass-modal/activate-singpass-modal.component';
import { MyInfoService } from '../../shared/Services/my-info.service';

import {
  ModelWithButtonComponent
} from '../../shared/modal/model-with-button/model-with-button.component';
import { CustomerJointAccountInfo } from '../signup-types';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS } from '../../investment/investment-engagement-journey/investment-engagement-journey-routes.constants';
import { INVESTMENT_COMMON_CONSTANTS } from '../../investment/investment-common/investment-common.constants';
import { CpfiaSuccessModalComponent } from '../add-update-cpfia/cpfia-success-modal/cpfia-success-modal.component';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditProfileComponent implements OnInit, OnDestroy {
  resetPasswordForm: FormGroup;
  formValues: any;
  personalData: any;
  fullName: string;
  compinedName: string;
  residentialAddress: any;
  empolymentDetails: any;
  bankDetails: any;
  cpfBankDetails: any;
  customerJointAccBankDetails: CustomerJointAccountInfo[] = [];
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
  investmentStatus: string;
  showBankInfo = false;
  dobFormat: any;
  private subscription: Subscription;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  srsDetails;
  formatedAccountNumber;
  is2faAuthorized: boolean;
  disableBankAcctEdit = false;
  linkCatagories;
  CKA_STATUS_CONSTANTS;
  // singpass
  modelTitle1: string;
  modelMessge1: string;
  modelBtnText1: string;
  myInfoSubscription: any;
  myinfoChangeListener: Subscription;
  secondTimer: any;
  loader2StartTime: any;
  loader2Modal: any;
  loadingModalRef: NgbModalRef;
  errorModalTitle: string;
  errorModalMessage: string;
  errorModalBtnText: string;
  myInfoStatus1: string;
  myInfoStatus2: string;
  isMyInfoEnabled = false;
  ckaInfo: any;
  displaySingpassLink: boolean;
  deviceBackPressSubscription : Subscription;

  constructor(
    private modal: NgbModal,
    private footerService: FooterService,
    public headerService: HeaderService,
    public navbarService: NavbarService,
    private investmentCommonService: InvestmentCommonService,
    private signUpService: SignUpService,
    private router: Router,
    public authService: AuthenticationService,
    public investmentAccountService: InvestmentAccountService,
    public manageInvestmentsService: ManageInvestmentsService,
    public readonly translate: TranslateService,
    private loaderService: LoaderService,
    private configService: ConfigService,
    private customErrorHandler: CustomErrorHandlerService,
    private sessionsService: SessionsService,
    // singpass
    private myInfoService: MyInfoService,
    public activeModal: NgbActiveModal,
    private titleCasePipe: TitleCasePipe
  ) { 
    this.translate.use('en');
    this.translate.get('COMMON').subscribe(() => {
      this.pageTitle = this.translate.instant('EDIT_PROFILE.MY_PROFILE');
      this.setPageTitle(this.pageTitle);
      this.showSRSSuccessModel();
      this.showCPFSuccessModel();
      // singpass
      this.modelTitle1 = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.MYINFO_CONFIRM.TITLE'
      );
      this.modelMessge1 = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.MYINFO_CONFIRM.DESCRIPTION'
      );
      this.modelBtnText1 = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.MYINFO_CONFIRM.BTN-TEXT'
      );
      this.loader2Modal = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.LOADER2'
      );
      this.errorModalTitle = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.ERROR_MODAL.TITLE'
      );
      this.errorModalMessage = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.ERROR_MODAL.MESSAGE'
      );
      this.errorModalBtnText = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.ERROR_MODAL.BTN-TEXT'
      );
      this.myInfoStatus1 = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.MYINFO_STATUS.SUCCESS'
      );
      this.myInfoStatus2 = this.translate.instant(
        'LINK_ACCOUNT_MYINFO.MYINFO_STATUS.CANCELLED'
      );
    });

    // Hidden Country list for future use
    // this.getNationalityCountryList();

    this.authService.get2faAuthEvent.subscribe((token) => {
      if (token) {
        this.is2faAuthorized = true;
      } else {
        this.is2faAuthorized = false;
      }
    });
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.loader2StartTime = config.account.loaderStartTime * 1000;
    });
  }

  ngOnInit() {
    // CKA STATUS CONSTANTS
    this.CKA_STATUS_CONSTANTS = INVESTMENT_COMMON_CONSTANTS.CKA;
    const initialMessage = this.investmentAccountService.getInitialMessageToShowDashboard();
    if (initialMessage && initialMessage.dashboardInitMessageShow) {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD], { replaceUrl: true });
    }
    if (environment.hideHomepage) {
      this.navbarService.setNavbarMode(104);
    } else {
      this.navbarService.setNavbarMode(102);
    }
    this.setPageTitle(this.pageTitle);
    this.footerService.setFooterVisibility(false);
    this.headerSubscription();
    this.investmentStatus = this.investmentCommonService.getInvestmentStatus();

    this.authService.get2faUpdateEvent.subscribe(() => {
      this.getEditProfileData();
      this.getSrsDetails();
      this.setCPFIABankDetails();
    });
    this.isMailingAddressSame = true;

    // Check if iFast is in maintenance
    this.configService.getConfig().subscribe((config) => {
      if (config.iFastMaintenance && this.configService.checkIFastStatus(config.maintenanceStartTime, config.maintenanceEndTime)) {
        this.disableBankAcctEdit = true;
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

    this.linkCatagories = SIGN_UP_CONFIG.SINGPASSLINKSTATUS;
    // singpass
    this.myinfoChangeListener = this.myInfoService.changeListener.subscribe((myinfoObj: any) => {
      if (myinfoObj && myinfoObj !== '' &&
        this.myInfoService.getMyInfoAttributes() === this.investmentAccountService.myInfoLinkAttributes.join()) {
        if (myinfoObj.status && myinfoObj.status === this.myInfoStatus1 && this.myInfoService.isMyInfoEnabled) {
          this.getMyInfoData();
        } else if (myinfoObj.status && myinfoObj.status === this.myInfoStatus2) {
          this.cancelMyInfo();
        } else {
          this.closeMyInfoPopup(false);
        }
      }
    });
    this.displaySingpassLink = this.signUpService.getUserType() === appConstants.USERTYPE.FINLIT ||
    this.signUpService.getUserType() === appConstants.USERTYPE.CORPORATE ? false : true;
    /** Redirects to Dashboard on click of Device Back*/
    this.deviceBackPressSubscription = this.navbarService
      .subscribeDeviceBackPress$
      .subscribe(() => {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      }); 
    }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.navbarService.unsubscribeBackPress();
    this.deviceBackPressSubscription.unsubscribe();
    // singpass
    if (this.myinfoChangeListener) {
      this.myinfoChangeListener.unsubscribe();
    }
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  showHide(el) {
    if (el.style.display === '' || el.style.display === 'block') {
      el.style.display = 'none';
    } else {
      el.style.display = 'block';
    }
  }

  // tslint:disable-next-line:cognitive-complexity
  getEditProfileData() {
    this.signUpService.getEditProfileInfo().subscribe((data) => {
      const responseMessage = data.responseMessage;
      if (responseMessage.responseCode === 6000) {
        this.entireUserData = data.objectList;
        if (data.objectList) {
          if (data.objectList.personalInformation) {
            this.personalData = data.objectList.personalInformation;
          }
          // Hidden Residential address
          // if (data.objectList && data.objectList.contactDetails && data.objectList.contactDetails.homeAddress) {
          //   this.residentialAddress = data.objectList.contactDetails.homeAddress;
          // }
          // Hidden the Employment details
          // this.empolymentDetails = data.objectList.employmentDetails;
          this.empolymentDetails = null;

          if (data.objectList.customerBankDetail) {
            this.bankDetails = data.objectList.customerBankDetail[0];
          }
          if (data.objectList.customerJointAccountBankDetails) {
            this.customerJointAccBankDetails = data.objectList.customerJointAccountBankDetails;
          }
          this.showBankInfo = data.objectList.cashPortfolioAvailable ? data.objectList.cashPortfolioAvailable : false;
          // Hidden the mailing address for future use
          // if ((data.objectList.contactDetails && data.objectList.contactDetails.mailingAddress)) {
          //   this.mailingAddress = data.objectList.contactDetails.mailingAddress;
          //   this.isMailingAddressSame = false;
          // }

          if (data.objectList.contactDetails) {
            this.contactDetails = data.objectList.contactDetails;
          }
          if (this.personalData) {
            this.fullName = this.personalData.fullName ?
              this.personalData.fullName : this.personalData.firstName + ' ' + this.personalData.lastName;
            this.compinedName = this.setTwoLetterProfileName(this.personalData.firstName, this.personalData.lastName);
            // Hidden passport details for future use
            // this.compinednricNum = this.setNric(this.personalData.nricNumber);
            // Hidden the passport details
            // if (this.personalData.passportNumber) {
            //   this.compinedPassport = 'Passport: ' + this.personalData.passportNumber;
            // }
            // if (this.personalData && this.personalData.isSingaporeResident) {
            //   this.isSingaporeResident = this.personalData.isSingaporeResident;
            // }
            this.constructDate(this.personalData.dateOfBirth);
          }
          //CKA Status
          if (data.objectList.ckaInformation) {
            this.ckaInfo = data.objectList.ckaInformation;
            this.investmentCommonService.setCKAInformation(this.ckaInfo);
            if (this.ckaInfo && this.ckaInfo.cKAStatusMessage && this.ckaInfo.cKAStatusMessage === INVESTMENT_COMMON_CONSTANTS.CKA.CKA_PASSED_STATUS) {
              this.investmentCommonService.setCKAStatus(INVESTMENT_COMMON_CONSTANTS.CKA.CKA_PASSED_STATUS);
            } else if (this.ckaInfo.cKAStatusMessage && this.ckaInfo.cKAStatusMessage === INVESTMENT_COMMON_CONSTANTS.CKA.CKA_BE_CERTIFICATE_UPLOADED) {
              this.investmentCommonService.setCKAStatus(INVESTMENT_COMMON_CONSTANTS.CKA.CKA_BE_CERTIFICATE_UPLOADED);
            } else if (this.ckaInfo.cKAStatusMessage && this.ckaInfo.cKAStatusMessage === INVESTMENT_COMMON_CONSTANTS.CKA.CKA_REJECTED_STATUS) {
              this.investmentCommonService.setCKAStatus(INVESTMENT_COMMON_CONSTANTS.CKA.CKA_REJECTED_STATUS);
            } else if (this.ckaInfo.cKAStatusMessage && this.ckaInfo.cKAStatusMessage === INVESTMENT_COMMON_CONSTANTS.CKA.CKA_EXPIRED_STATUS) {
              this.investmentCommonService.setCKAStatus(INVESTMENT_COMMON_CONSTANTS.CKA.CKA_EXPIRED_STATUS);
            }
          }
        }
        // Hidden employer address for future use
        // // tslint:disable-next-line:max-line-length
        // if (this.empolymentDetails && this.empolymentDetails.employerDetails && this.empolymentDetails.employerDetails.detailedemployerAddress) {
        //   this.employerAddress = this.empolymentDetails.employerDetails.detailedemployerAddress;
        // }
        // if (this.residentialAddress && this.residentialAddress.country && this.residentialAddress.country.nationalityCode) {
        //   this.resNationality = this.residentialAddress.country.nationalityCode;
        // }
        // if (this.mailingAddress && this.mailingAddress.country && this.mailingAddress.country.nationalityCode) {
        //   this.mailNationality = this.mailingAddress.country.nationalityCode;
        // }
        // // tslint:disable-next-line:max-line-length
        // if (this.empolymentDetails && this.empolymentDetails.employerDetails && this.empolymentDetails.employerDetails.detailedemployerAddress && this.empolymentDetails.employerDetails.detailedemployerAddress.employerAddress && this.empolymentDetails.employerDetails.detailedemployerAddress.employerAddress.country && this.empolymentDetails.employerDetails.detailedemployerAddress.employerAddress.country.nationalityCode) {
        //   this.employerNationality = this.empolymentDetails.employerDetails.detailedemployerAddress.employerAddress.country.nationalityCode;
        // }
      } else { // catch exceptions
        if (responseMessage.responseCode === 5015) {
          this.sessionsService.destroyInstance();
          this.authService.clearSession();
          this.sessionsService.createNewActiveInstance();
          this.navbarService.logoutUser();
          this.customErrorHandler.handleAuthError();
        }
      }
    });
  }

  editEmployeDetails() {
    // tslint:disable-next-line:max-line-length
    this.investmentAccountService.setEditProfileEmployeInfo(this.entireUserData, this.nationalityList, this.countryList, this.isSingaporeResident);
    // tslint:disable-next-line:max-line-length
    this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.EMPLOYMENT_DETAILS], { queryParams: { enableEditProfile: true }, fragment: 'loading' });
  }

  editPassword() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PASSWORD]);
  }

  manageProfile() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.MANAGE_PROFILE]);
  }
  getNationalityCountryList() {
    this.investmentAccountService.getNationalityCountryList().subscribe((data) => {
      this.nationalityList = data.objectList;
      this.countryList = this.investmentAccountService.getCountryList(data.objectList);
    });
  }

  editContactDetails() {
    let uploadedDocuments = [];
    let mailingUrl;
    let ResUrl;
    if (this.entireUserData.documentDetails) {
      uploadedDocuments = this.entireUserData.documentDetails;
    }
    let i;
    for (i = 0; i < uploadedDocuments.length; i++) {
      if (uploadedDocuments[i].docType === 'MAILING_ADDRESS_PROOF') {
        mailingUrl = uploadedDocuments[i].fileName;
      }
      if (uploadedDocuments[i].docType === 'RESIDENTIAL_ADDRESS_PROOF') {
        ResUrl = uploadedDocuments[i].fileName;
      }
    }
    // tslint:disable-next-line:max-line-length
    this.investmentAccountService.setEditProfileContactInfo(this.entireUserData, this.nationalityList, this.countryList, this.isMailingAddressSame, this.isSingaporeResident, mailingUrl, ResUrl);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.EDIT_RESIDENTIAL]);
  }

  isCountrySIngapore(nationalityCode) {
    return nationalityCode === 'SG';
  }

  editBankDetails() {
    let AccountHolderName;
    if (this.bankDetails && this.bankDetails.accountName) {
      AccountHolderName = this.bankDetails.accountName;
    } else {
      AccountHolderName = this.fullName;
    }
    this.signUpService.setOldContactDetails(this.personalData.countryCode, this.personalData.mobileNumber, this.personalData.email);
    // tslint:disable-next-line:max-line-length accountName
    this.investmentAccountService.setEditProfileBankDetail(AccountHolderName, this.bankDetails.bank, this.bankDetails.accountNumber, this.bankDetails.id, false);
    this.authService.set2faVerifyAllowed(true);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.UPDATE_BANK], { queryParams: { addBank: false }, fragment: 'bank' });
  }

  addBankDetails() {
    let accountHolderName;
    if (this.bankDetails && this.bankDetails.accountName) {
      accountHolderName = this.bankDetails.accountName;
    } else {
      accountHolderName = this.fullName;
    }
    this.signUpService.setOldContactDetails(this.personalData.countryCode, this.personalData.mobileNumber, this.personalData.email);
    this.investmentAccountService.setEditProfileBankDetail(accountHolderName, null, null, null, true);
    this.authService.set2faVerifyAllowed(true);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.UPDATE_BANK], { queryParams: { addBank: true }, fragment: 'bank' });
  }

  headerSubscription() {
    this.subscription = this.navbarService.subscribeBackPress().subscribe((event) => {
      if (event && event !== '') {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      }
    });
  }

  constructDate(dob) {
    this.dobFormat = dob;
    if (dob) {
      const dateArr = dob.split('/');
      if (dateArr.length === 3) {
        this.dobFormat = dateArr[1] + '/' + dateArr[0] + '/' + dateArr[2];
      }
    }
  }
  getSrsDetails() {
    this.manageInvestmentsService.getProfileSrsAccountDetails()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        if (data) {
          this.srsDetails = data;
        }
      },
        () => {
          this.investmentAccountService.showGenericErrorModal();
        });
  }

  getInvestmentOverview() {
    this.translate.get('COMMON').subscribe(() => {
      this.loaderService.showLoader({
        title: this.translate.instant('COMMON.LOADING_TITLE'),
        desc: this.translate.instant('COMMON.LOADING_DESC'),
        autoHide: false
      });
    });
    this.manageInvestmentsService.getInvestmentOverview()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data) => {
        this.loaderService.hideLoaderForced();
        if (data.responseMessage.responseCode >= 6000 && data && data.objectList) {
          this.manageInvestmentsService.setUserPortfolioList(data.objectList.portfolios);
          this.router.navigate([SIGN_UP_ROUTE_PATHS.TOPUP]);
        }
      }, () => {
        this.loaderService.hideLoaderForced();
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  showSRSSuccessModel() {
    if (this.manageInvestmentsService.getSrsSuccessFlag()) {
      const ref = this.modal.open(SrsSuccessModalComponent, { centered: true });
      ref.componentInstance.topUp.subscribe(() => {
        this.getInvestmentOverview();
      });
      this.manageInvestmentsService.setSrsSuccessFlag(false);
    }
  }

  showCPFSuccessModel() {
    if (this.manageInvestmentsService.getCPFSuccessFlag()) {
      const ref = this.modal.open(CpfiaSuccessModalComponent, { centered: true });
      ref.componentInstance.topUp.subscribe(() => {
        this.getInvestmentOverview();
      });
      this.manageInvestmentsService.setCPFSuccessFlag(false);
    }
  }
  setTwoLetterProfileName(firstName, LastName) {
    const first = firstName.charAt(0);
    const second = LastName.charAt(0);
    return first.toUpperCase() + second.toUpperCase();
  }

  linkSingpass() {
    const ref = this.modal.open(ActivateSingpassModalComponent, { centered: true, windowClass: 'activate-singpass-modal' });
    ref.componentInstance.errorMessage = this.translate.instant(
      'ACTIVATE_SINGPASS_MODAL.MESSAGE'
    );
    ref.componentInstance.primaryAction.subscribe(() => {
      this.openModal();
    });
  }
  // singpass
  cancelMyInfo() {
    this.myInfoService.isMyInfoEnabled = false;
    this.closeMyInfoPopup(false);
    if (this.myInfoSubscription) {
      this.myInfoSubscription.unsubscribe();
    }
  }
  openModal() {
    this.activeModal.close();
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    ref.componentInstance.errorTitle = this.modelTitle1;
    ref.componentInstance.errorMessageHTML = this.modelMessge1;
    ref.componentInstance.primaryActionLabel = this.modelBtnText1;
    ref.componentInstance.myInfo = true;
    ref.result
      .then(() => {
        this.getMyInfo();
      })
      .catch((e) => { });
  }
  getMyInfoData() {
    this.showFetchPopUp();
    this.myInfoSubscription = this.myInfoService.getSingpassAccountData().subscribe((data) => {
      if (data.responseMessage.responseCode === 6000 && data && data.objectList[0]) {
        this.closeMyInfoPopup(false);
        this.getEditProfileData();
        const ref = this.modal.open(ActivateSingpassModalComponent, { centered: true, windowClass: 'linked-singpass-modal' });
        ref.componentInstance.errorMessage = this.translate.instant(
          'SUCCESS_SINGPASS_MODAL.MESSAGE',
          { name: this.titleCasePipe.transform(data.objectList[0].name.value), nric: data.objectList[0].uin.toUpperCase() }
        );
        ref.componentInstance.secondaryActionLabel = this.translate.instant(
          'SUCCESS_SINGPASS_MODAL.BTN_TXT'
        );
        ref.componentInstance.isLinked = true;
      }
      else if (data.responseMessage.responseCode === 6014) {
        this.closeMyInfoPopup(false);
        const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
        ref.componentInstance.errorTitle = this.translate.instant(
          'LINK_ACCOUNT_MYINFO.ALREADY_EXISTING.TITLE'
        );
        ref.componentInstance.errorMessage = this.translate.instant(
          'LINK_ACCOUNT_MYINFO.ALREADY_EXISTING.DESC'
        );
        ref.componentInstance.primaryActionLabel = this.translate.instant(
          'LINK_ACCOUNT_MYINFO.ALREADY_EXISTING.BTN-TEXT'
        );
      }
      else if (data.responseMessage.responseCode === 6015) {
        this.closeMyInfoPopup(false);
        const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
        ref.componentInstance.errorTitle = this.translate.instant(
          'LINK_ACCOUNT_MYINFO.DIFFERENT_USER.TITLE'
        );
        ref.componentInstance.errorMessage = this.translate.instant(
          'LINK_ACCOUNT_MYINFO.DIFFERENT_USER.DESC'
        );
        ref.componentInstance.primaryActionLabel = this.translate.instant(
          'LINK_ACCOUNT_MYINFO.DIFFERENT_USER.BTN-TEXT'
        );
      }
      else {
        this.closeMyInfoPopup(true);
      }
    }, (error) => {
      this.closeMyInfoPopup(true);
    });
  }

  showFetchPopUp() {
    this.secondTimer = setTimeout(() => {
      if (this.myInfoService.loadingModalRef) {
        this.openSecondPopup();
      }
    }, this.loader2StartTime);
  }

  closeMyInfoPopup(error: boolean) {
    this.isMyInfoEnabled = false;
    this.myInfoService.closeMyInfoPopup(false);
    clearTimeout(this.secondTimer);
    if (error) {
      const ngbModalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        centered: true,
      };
      this.loadingModalRef = this.modal.open(ModelWithButtonComponent, ngbModalOptions);
      this.loadingModalRef.componentInstance.closeBtn = false;
      this.loadingModalRef.componentInstance.errorTitle = this.errorModalTitle;
      this.loadingModalRef.componentInstance.errorMessage = this.errorModalMessage;
      this.loadingModalRef.componentInstance.primaryActionLabel = this.errorModalBtnText;
      this.loadingModalRef.componentInstance.primaryAction.subscribe(() => {
        this.modal.dismissAll();
      });
    }
  }

  getMyInfo() {
    this.myInfoService.setMyInfoAttributes(
      this.investmentAccountService.myInfoLinkAttributes
    );
    this.myInfoService.setMyInfoAppId(appConstants.MYINFO_LINK_SINGPASS);
    this.myInfoService.goToMyInfo(true);
  }

  // ******** SECOND POP UP ********//
  openSecondPopup() {
    this.myInfoService.loadingModalRef.componentInstance.errorMessage = this.loader2Modal.message;
    this.myInfoService.loadingModalRef.componentInstance.primaryActionLabel = this.loader2Modal.primaryActionLabel;
    this.myInfoService.loadingModalRef.componentInstance.primaryAction.subscribe(() => {
      this.closeMyInfoPopup(false);
    });
  }

  showJointAccountDetailsCard: () => boolean = (): boolean => {
    return this.customerJointAccBankDetails && this.customerJointAccBankDetails.length > 0 && this.authService.accessCorporateUserFeature('CREATE_JOINT_ACCOUNT');
  }

  editJABankDetails(portfolioBankDetails) {
    let accountHolderName;
    if (portfolioBankDetails && portfolioBankDetails.accountHolderName) {
      accountHolderName = portfolioBankDetails.accountHolderName;
    } else {
      accountHolderName = this.fullName;
    }
    this.signUpService.setOldContactDetails(this.personalData.countryCode, this.personalData.mobileNumber, this.personalData.email);
    // tslint:disable-next-line:max-line-length accountName
    this.investmentAccountService.setJAPortfolioBankDetail(accountHolderName, portfolioBankDetails.bank, portfolioBankDetails.bankAccountNumber, portfolioBankDetails.customerPortfolioId, portfolioBankDetails.id);
    this.authService.set2faVerifyAllowed(true);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.UPDATE_BANK], { queryParams: { addBank: false }, fragment: 'bank' });
  }

  openSecodaryUserLockModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('EDIT_PROFILE.SECONDARY_USER_LOCK_MODAL.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant('EDIT_PROFILE.SECONDARY_USER_LOCK_MODAL.DESC');
  }

  openSRSLockModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('EDIT_PROFILE.LOCK_MODAL.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant('EDIT_PROFILE.LOCK_MODAL.SRS_DESC');
  }

  openCPFLockModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('EDIT_PROFILE.LOCK_MODAL.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant('EDIT_PROFILE.LOCK_MODAL.CPF_DESC');
  }

  isEditable(jaBankDetail) {
    return jaBankDetail.jaStatus === SIGN_UP_CONFIG.CUSTOMER_PORTFOLIOS.JOINT_ACCOUNT.SATUS && jaBankDetail.primaryCustomer;
  }

  isSecondaryHolder(jaBankDetail) {
    return jaBankDetail.jaStatus === SIGN_UP_CONFIG.CUSTOMER_PORTFOLIOS.JOINT_ACCOUNT.SATUS && !jaBankDetail.primaryCustomer;
  }

  openCKAModal() {
    this.investmentCommonService.setCKARedirectFromLocation(INVESTMENT_COMMON_CONSTANTS.CKA_REDIRECT_CONSTS.PROFILE);
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true, windowClass: 'custom-cka-modal' });
    ref.componentInstance.errorTitle = this.translate.instant(
      'OPEN_CKA.TITLE'
    );
    if (this.ckaInfo && this.ckaInfo.ckaretake !== null && this.ckaInfo.ckaretake) {
      ref.componentInstance.errorMessage = this.translate.instant(
        'OPEN_CKA.EXPIRED_DESC'
      );
    } else {
      ref.componentInstance.errorMessage = this.translate.instant(
        'OPEN_CKA.DESC'
      );
    }
    ref.componentInstance.primaryActionLabel = this.translate.instant(
      'OPEN_CKA.BTN-TEXT'
    );
    ref.componentInstance.primaryAction.subscribe(() => {
      const routerURL =
        INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.CKA_ASSESSMENT
      this.router.navigate([routerURL]);
    });
    ref.componentInstance.closeBtn = false;
  }

  showUploadDoc() {
    if (this.ckaInfo && this.ckaInfo.ckaretake !== null && !this.ckaInfo.ckaretake) {
      this.investmentCommonService.setCKARedirectFromLocation(INVESTMENT_COMMON_CONSTANTS.CKA_REDIRECT_CONSTS.PROFILE);
      this.router.navigate([INVESTMENT_ENGAGEMENT_JOURNEY_ROUTE_PATHS.CKA_UPLOAD_DOCUMENT]);
    }
  }

  setCPFIABankDetails() {
    this.manageInvestmentsService.getProfileCPFIAccountDetails(true)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        if (data) {
          this.cpfBankDetails = data;
        }
      },
        () => {
          this.investmentAccountService.showGenericErrorModal();
        }
      );
  }
}
