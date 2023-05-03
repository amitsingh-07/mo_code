import { Subject, BehaviorSubject } from 'rxjs';

import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TranslateService } from '@ngx-translate/core';
import { ConfigService, IConfig } from '../config/config.service';
import { ApiService } from '../shared/http/api.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';
import {
  UnsupportedDeviceModalComponent
} from '../shared/modal/unsupported-device-modal/unsupported-device-modal.component';
import { RegexConstants } from '../shared/utils/api.regex.constants';
import { CryptoService } from '../shared/utils/crypto';
import { CreateAccountFormError } from './create-account/create-account-form-error';
import { Child, CorpBizUserMyInfoData, CPFWithdrawal, SignUpFormData } from './sign-up-form-data';
import { SIGN_UP_CONFIG } from './sign-up.constant';
import { InvestmentAccountService } from '../investment/investment-account/investment-account-service';
import { appConstants } from '../app.constants';
import { Util } from '../shared/utils/util';
import { environment } from './../../environments/environment';

const SIGNUP_SESSION_STORAGE_KEY = 'app_signup_session_storage_key';
const CUSTOMER_REF_SESSION_STORAGE_KEY = 'app_customer_ref_session_storage_key';
const RESET_CODE_SESSION_STORAGE_KEY = 'app_reset_code_session_storage_key';
const REDIRECT_URL_KEY = 'app_redirect_url';
const IS_CAPTCHA_SHOWN = 'is_captcha';
const CAPTCHA_SESSION_ID = 'captcha_session_id';

const USER_MOBILE = 'user_mobile';
const FROM_LOGIN_PAGE = 'from_login_page';
const CAPTACHA_COUNT = 'captcha_count';
const EMAIL = 'email';
const FINLITENABLED = 'finlitenabled';
const USER_MOBILE_COUNTRY_CODE = 'user_mobile_country_code';
const NEW_UPDATES_MODAL_SHOWN = 'new_updates_modal_shown';
const CORP_BIZ_USER_MYINFO_SESSION_STORAGE_KEY = 'app_corpbiz_myinfo_storage_key';

@Injectable({
  providedIn: 'root'
})

export class SignUpService {
  disableAttributes = [];
  private userSubject = new Subject();
  userObservable$ = this.userSubject.asObservable();
  private signUpFormData: SignUpFormData = new SignUpFormData();
  private corpBizUserMyInfoData: CorpBizUserMyInfoData = new CorpBizUserMyInfoData();
  private createAccountFormError: any = new CreateAccountFormError();
  private resetPasswordUrl: string;
  private resetPasswordCorpUrl: string;
  private mobileOptimized = new BehaviorSubject(false);
  mobileOptimizedObservable$ = this.mobileOptimized.asObservable();
  myInfoAttributes = SIGN_UP_CONFIG.MY_INFO_ATTRIBUTES;
  corpBizMyInfoAttributes = SIGN_UP_CONFIG.CORP_BIZ_MY_INFO_ATTRIBUTES; // Corp Biz attributes
  organisationName: string = '';
  constructor(
    private apiService: ApiService,
    public authService: AuthenticationService,
    public configService: ConfigService,
    public cryptoService: CryptoService,
    private datePipe: DatePipe,
    public modal: NgbModal,
    private translate: TranslateService,
    private investmentAccountService: InvestmentAccountService
  ) {
    this.getAccountInfo();
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.resetPasswordUrl = config.resetPasswordUrl;
      this.resetPasswordCorpUrl = config.resetPasswordCorpUrl;
    });
  }

  /**
   * save data in session storage.
   */
  commit() {
    if (window.sessionStorage) {
      sessionStorage.setItem(SIGNUP_SESSION_STORAGE_KEY, JSON.stringify(this.signUpFormData));
    }
  }

  /**
   * save corpbiz user MyInfo data in session storage.
   */
  commitCorpBizUserInfo() {
    if (window.sessionStorage) {
      sessionStorage.setItem(CORP_BIZ_USER_MYINFO_SESSION_STORAGE_KEY, JSON.stringify(this.corpBizUserMyInfoData));
    }
  }

  getCorpBizUserMyInfoData(): CorpBizUserMyInfoData {
    if (window.sessionStorage && sessionStorage.getItem(CORP_BIZ_USER_MYINFO_SESSION_STORAGE_KEY)) {
      this.corpBizUserMyInfoData = JSON.parse(sessionStorage.getItem(CORP_BIZ_USER_MYINFO_SESSION_STORAGE_KEY));
    }
    return this.corpBizUserMyInfoData;
  }

  /**
   * save data for the given KEY in session storage.
   */
  save(key: string, value: any) {
    if (window.sessionStorage) {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }

  /**
   * clear session storage data.
   */
  clearData() {
    this.signUpFormData = new SignUpFormData();
    if (window.sessionStorage) {
      sessionStorage.removeItem(SIGNUP_SESSION_STORAGE_KEY);
      sessionStorage.removeItem(CUSTOMER_REF_SESSION_STORAGE_KEY);
      sessionStorage.removeItem(RESET_CODE_SESSION_STORAGE_KEY);
    }
  }

  /**
   * set customer reference code.
   */
  setCustomerRef(customerRef) {
    if (window.sessionStorage) {
      sessionStorage.setItem(CUSTOMER_REF_SESSION_STORAGE_KEY, JSON.stringify(customerRef));
    }
  }

  /**
   * get customer reference code.
   * @returns reference code.
   */
  getCustomerRef() {
    if (window.sessionStorage && sessionStorage.getItem(CUSTOMER_REF_SESSION_STORAGE_KEY)) {
      return JSON.parse(sessionStorage.getItem(CUSTOMER_REF_SESSION_STORAGE_KEY));
    }
  }

  /**
   * set reset code.
   */
  setResetCode(code) {
    if (window.sessionStorage) {
      sessionStorage.setItem(RESET_CODE_SESSION_STORAGE_KEY, JSON.stringify(code));
    }
  }

  /**
   * get reset code.
   * @returns reset code.
   */
  getResetCode() {
    if (window.sessionStorage && sessionStorage.getItem(RESET_CODE_SESSION_STORAGE_KEY)) {
      return JSON.parse(sessionStorage.getItem(RESET_CODE_SESSION_STORAGE_KEY));
    }
  }

  /**
   * set user account details.
   * @param data - user account details.
   */
  setAccountInfo(data: SignUpFormData) {
    this.signUpFormData = data;
    this.commit();
  }

  /**
   * get user account details.
   * @returns user account details.
   */
  getAccountInfo(): SignUpFormData {
    if (window.sessionStorage && sessionStorage.getItem(SIGNUP_SESSION_STORAGE_KEY)) {
      this.signUpFormData = JSON.parse(sessionStorage.getItem(SIGNUP_SESSION_STORAGE_KEY));
    }
    return this.signUpFormData;
  }

  /**
   * get user mobile number.
   * @returns user mobile number with country code.
   */
  getMobileNumber() {
    return {
      number: this.signUpFormData.mobileNumber,
      code: this.signUpFormData.countryCode
    };
  }

  /**
   * get form errors.
   * @param form - form details.
   * @returns first error of the form.
   */
  currentFormError(form) {
    const controls = form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        return this.createAccountFormError.formFieldErrors[name][Object.keys(controls[name]['errors'])[0]];
      }
    }
  }

  /**
   * get form errors.
   * @param form - form details.
   * @returns first error of the form.
   */
  getSignupFormError(form) {
    const controls = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.createAccountFormError.formFieldErrors.errorTitle;

    for (const name in controls) {
      if (controls[name].invalid && Object.keys(controls[name]['errors']) &&
        this.createAccountFormError.formFieldErrors[name][Object.keys(controls[name]['errors'])[0]].errorMessage) {
        errors.errorMessages.push(this.createAccountFormError.formFieldErrors[name][Object.keys(controls[name]['errors'])[0]].errorMessage);
      }
    }

    if (Object.keys(errors.errorMessages).length <= 0) {
      console.log('Error Key:', Object.keys(form.errors)[0]);
      if (form.invalid && this.createAccountFormError.formErrors[Object.keys(form.errors)[0]]) {
        if (this.createAccountFormError.formErrors[Object.keys(form.errors)[0]].errorTitle) {
          errors.title = this.createAccountFormError.formErrors[Object.keys(form.errors)[0]].errorTitle;
        }
        errors.errorMessages.push(this.createAccountFormError.formErrors[Object.keys(form.errors)[0]].errorMessage);
      }
    }
    return errors;
  }

  /**
   * get user mobile number.
   * @returns user mobile number with country code.
   */
  getForgotPasswordInfo() {
    return {
      email: this.signUpFormData.forgotPassEmail
    };
  }

  /**
   * set user account details.
   * @param data - user account details.
   */
  setForgotPasswordInfo(email, captcha, profileType) {
    // API Call here
    const data = this.constructForgotPasswordInfo(email, captcha, profileType);
    return this.apiService.requestForgotPasswordLink(data);
  }

  /**
   * construct the json for forgot password.
   * @param data - email and redirect uri.
   */
  constructForgotPasswordInfo(data, captchaValue, profileType) {
    let resetUrl = (profileType == appConstants.USERTYPE.CORPORATE) ? this.resetPasswordCorpUrl : this.resetPasswordUrl;
    return {
      email: data,
      captcha: captchaValue,
      sessionId: this.authService.getSessionId(),
      profileType: profileType,
      redirectUrl: environment.apiBaseUrl + resetUrl + '?token='
    };
  }
  setRestEmailInfo(email, captcha, oldEmail) {
    // API Call here
    const data = this.constructResetEmailInfo(email, captcha, oldEmail);
    return this.apiService.resetEmail(data);
  }

  /**
   * construct the json for forgot password.
   * @param data - email and redirect uri.
   */
  constructResetEmailInfo(data, captchaValue, oldLoginEmail) {
    const verifyUrl = "/app/accounts/email-verification";
    return {
      oldEmail: (oldLoginEmail && this.authService.isUserNameEmail(oldLoginEmail)) ? oldLoginEmail : '',
      mobileNo: (oldLoginEmail && !this.authService.isUserNameEmail(oldLoginEmail)) ? oldLoginEmail : '',
      updatedEmail: data,
      captcha: captchaValue,
      sessionId: this.authService.getSessionId(),
      callbackUrl: environment.apiBaseUrl + verifyUrl
    };
  }

  /**
   * get login info.
   * @param data - user account details.
   */
  getLoginInfo() {
    return {
      loginUsername: this.signUpFormData.loginUsername,
      loginPassword: this.signUpFormData.loginPassword
    };
  }

  /**
   * set login info.
   * @param data - user account details.
   */
  setLoginInfo(data: SignUpFormData) {
    this.signUpFormData = data;
  }

  /**
   * construct the json for reset password.
   * @param data - email and redirect uri.
   */
  constructResetPasswordInfo(pass, key, profileType) {
    return {
      password: pass,
      token: key,
      sessionId: this.authService.getSessionId(),
      profileType: profileType
    };
  }

  getUserProfileInfo() {
    if (window.sessionStorage && sessionStorage.getItem(SIGNUP_SESSION_STORAGE_KEY)) {
      this.signUpFormData = JSON.parse(sessionStorage.getItem(SIGNUP_SESSION_STORAGE_KEY));
    }
    return this.signUpFormData.userProfileInfo;
  }

  setUserProfileInfo(userInfo) {
    this.userSubject.next(userInfo);
    this.signUpFormData.userProfileInfo = userInfo;
    this.commit();
  }

  logoutUser() {
    this.userSubject.next('LOGGED_OUT');
  }

  setRedirectUrl(url) {
    if (window.sessionStorage) {
      sessionStorage.setItem(REDIRECT_URL_KEY, url);
    }
  }
  setEmail(data) {
    if (window.sessionStorage) {
      sessionStorage.setItem(EMAIL, data);
    }
  }
  getUserType() {
    return sessionStorage.getItem(FINLITENABLED);
  }
  setUserType(data) {
    if (window.sessionStorage) {
      sessionStorage.setItem(FINLITENABLED, data);
    }
  }
  getEmail() {
    return sessionStorage.getItem(EMAIL);
  }
  getEmailandFinlit() {
    return {
      email: this.signUpFormData.email,
      userType: this.signUpFormData.userType
    };
  }

  getModalShownStatus() {
    return sessionStorage.getItem(NEW_UPDATES_MODAL_SHOWN);
  }
  setModalShownStatus(status) {
    if (window.sessionStorage) {
      sessionStorage.setItem(NEW_UPDATES_MODAL_SHOWN, status);
    }
  }

  setEditContact(editContact, mobileUpdate, emailUpdate) {
    this.signUpFormData.editContact = editContact;
    this.signUpFormData.updateMobile = mobileUpdate;
    this.signUpFormData.updateEmail = emailUpdate;
    this.commit();
  }

  clearRedirectUrl() {
    sessionStorage.removeItem(REDIRECT_URL_KEY);
  }

  getRedirectUrl() {
    return sessionStorage.getItem(REDIRECT_URL_KEY);
  }

  setCaptchaShown() {
    if (window.sessionStorage) {
      sessionStorage.setItem(IS_CAPTCHA_SHOWN, 'true');
    }
  }

  getCaptchaShown() {
    return sessionStorage.getItem(IS_CAPTCHA_SHOWN);
  }

  setCaptchaSessionId(sessionId) {
    if (window.sessionStorage) {
      sessionStorage.setItem(CAPTCHA_SESSION_ID, sessionId);
    }
  }

  getCaptchaSessionId() {
    return sessionStorage.getItem(CAPTCHA_SESSION_ID);
  }

  removeCaptchaSessionId() {
    sessionStorage.removeItem(CAPTCHA_SESSION_ID);
    sessionStorage.removeItem(IS_CAPTCHA_SHOWN);
    sessionStorage.removeItem(CAPTACHA_COUNT);
  }

  removeUserType() {
    sessionStorage.removeItem(FINLITENABLED);
  }

  getEditProfileInfo() {
    // API Call here
    return this.apiService.getEditProfileList();
  }

  constructEditPassword(oldpassword, newpassword) {
    return {
      oldPassword: oldpassword,
      newPassword: newpassword,
      sessionId: this.authService.getSessionId(),
    };
  }
  setEditPasswordInfo(oldPassword, newPassword) {
    // API Call here
    const data = this.constructEditPassword(this.cryptoService.encrypt(oldPassword), this.cryptoService.encrypt(newPassword));
    return this.apiService.requestEditPassword(data);
  }
  updateBankInfo(bank, fullName, accountNum, id) {
    // API Call here
    const data = this.constructUpdateBankPayload(bank, fullName, accountNum, id);
    return this.apiService.saveNewBank(data);
  }
  updateBankInfoProfile(bank, fullName, accountNum, id, customerPortfolioId, isJAAccount) {
    const data = this.constructUpdateBankPayload(bank, fullName, accountNum, id);
    // PASSING NULL VALUES IF EDIT BANK DETAILS IS CALLED FROM PROFILE TAB
    return this.apiService.saveNewBankProfile(data, customerPortfolioId, isJAAccount);
  }

  // tslint:disable-next-line:no-identical-functions
  constructUpdateBankPayload(bank, fullName, accountNum, id) {
    const request = {};
    request['id'] = id;
    request['bank'] = bank;
    request['accountName'] = fullName;
    request['accountNumber'] = accountNum;
    return request;
  }

  setContactDetails(countryCode, mobileNumber, email) {
    this.signUpFormData.countryCode = countryCode;
    this.signUpFormData.mobileNumber = mobileNumber;
    this.signUpFormData.email = email;
    this.commit();
  }

  setMobileDetails(countryCode, mobileNumber) {
    this.signUpFormData.countryCode = countryCode;
    this.signUpFormData.mobileNumber = mobileNumber;
    this.commit();
  }

  setEmailDetails(email) {
    this.signUpFormData.email = email;
    this.commit();
  }

  setOldContactDetails(countryCode, mobileNumber, email) {
    this.setContactDetails(countryCode, mobileNumber, email);
    this.signUpFormData.OldCountryCode = countryCode;
    this.signUpFormData.OldMobileNumber = mobileNumber;
    this.signUpFormData.OldEmail = email;
    this.commit();
  }

  getRecentNotifications() {
    return this.apiService.getRecentNotifications();
  }

  getAllNotifications() {
    return this.apiService.getAllNotifications();
  }

  updateNotifications(messages, type) {
    const payload = this.constructPayloadUpdateNotifications(messages, type);
    return this.apiService.updateNotifications(payload);
  }

  constructPayloadUpdateNotifications(messages, type) {
    const messageIdList = this.getMessageIdsFromMessages(messages);
    return {
      messageStatus: type,
      messageIds: messageIdList
    };
  }

  getMessageIdsFromMessages(messages) {
    if (messages === null) {
      return null;
    } else {
      return messages.map((message) => message.messageId);
    }
  }


  // setNotificationList(data) {
  //   this.signUpFormData.notificationList = data;
  //   this.commit();
  // }

  getNotificationList() {
    return this.signUpFormData.notificationList;
  }

  getAllMessagesByNotifications(notifications) {
    const messages = [];
    notifications.map((notification) => {
      notification.messages.map((message) => {
        let messageDate;
        let messageMonth = '';
        if (message.time) {
          message.time = parseInt(message.time, 10);
          messageDate = new Date(message.time);
          messageMonth = this.datePipe.transform(messageDate, 'MMMM yyyy');
        }
        message.date = messageDate;
        message.month = messageMonth;
        messages.push(message);
      });
    });
    return messages;
  }

  getDetailedCustomerInfo() {
    // API Call here
    return this.apiService.getDetailedCustomerInfo();
  }

  // tslint:disable-next-line:cognitive-complexity
  getFormErrorList(form) {
    const controls = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.createAccountFormError.formFieldErrors.errorTitle;
    for (const name in controls) {
      if (controls[name].invalid) {
        // HAS NESTED CONTROLS ?
        if (controls[name].controls) {
          const nestedControls = controls[name].controls;
          for (const nestedControlName in nestedControls) {
            if (nestedControls[nestedControlName].invalid) {
              // tslint:disable-next-line
              errors.errorMessages.push(
                this.createAccountFormError.formFieldErrors[nestedControlName][
                  Object.keys(nestedControls[nestedControlName]['errors'])[0]
                ].errorMessage
              );
            }
          }
        } else {
          // NO NESTED CONTROLS
          // tslint:disable-next-line
          errors.errorMessages.push(
            this.createAccountFormError.formFieldErrors[name][
              Object.keys(controls[name]['errors'])[0]
            ].errorMessage
          );
        }
      }
    }
    return errors;
  }

  validateBankAccNo(control: AbstractControl) {
    const value = control.value;
    let isValid;
    if (control.value && control.parent) {
      const bankKey = control.parent.controls['bank'].value.key;
      switch (bankKey) {
        case SIGN_UP_CONFIG.BANK_KEYS.BANK_OF_CHINA:
          isValid = new RegExp(RegexConstants.BankAccountNumber.BANK_OF_CHINA).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.STANDARD_CHARTED_BANK:
          isValid = new RegExp(RegexConstants.BankAccountNumber.STANDARD_CHARTED_BANK).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.DBS:
          isValid = new RegExp(RegexConstants.BankAccountNumber.DBS).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.CITIBANK:
          isValid = new RegExp(RegexConstants.BankAccountNumber.CITIBANK).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.MAYBANK:
          isValid = new RegExp(RegexConstants.BankAccountNumber.MAYBANK).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.OCBC:
          isValid = new RegExp(RegexConstants.BankAccountNumber.OCBC).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.RHB_BANK:
          isValid = new RegExp(RegexConstants.BankAccountNumber.RHB_BANK).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.UOB:
          isValid = new RegExp(RegexConstants.BankAccountNumber.UOB).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.ANZ_BANK:
          isValid = new RegExp(RegexConstants.BankAccountNumber.ANZ_BANK).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.CIMB:
          isValid = new RegExp(RegexConstants.BankAccountNumber.CIMB).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.HSBC:
          isValid = new RegExp(RegexConstants.BankAccountNumber.HSBC).test(value);
          break;
        case SIGN_UP_CONFIG.BANK_KEYS.POSB:
          isValid = new RegExp(RegexConstants.BankAccountNumber.POSB).test(value);
          break;
        default:
          isValid = true;
          break;
      }
    }

    if (!isValid) {
      return { validAccountNo: true }
    } else {
      return null;
    }
  }

  isMobileDevice() {
    if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
    ) {
      return true;
    } else {
      return false;
    }
  }

  showUnsupportedDeviceModal() {
    const ref = this.modal.open(UnsupportedDeviceModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('UNSUPPORTED_DEVICE_MODAL.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant('UNSUPPORTED_DEVICE_MODAL.DESC');
    return false;
  }

  setUnsupportedNoteShownFlag() {
    this.mobileOptimized.next(true);
    this.signUpFormData.isUnsupportedNoteShown = true;
    this.commit();
  }

  getUnsupportedNoteShownFlag() {
    return this.signUpFormData.isUnsupportedNoteShown;
  }

  setUserMobileNo(mobile) {
    if (window.sessionStorage) {
      sessionStorage.setItem(USER_MOBILE, mobile);
    }
  }

  getUserMobileNo() {
    return sessionStorage.getItem(USER_MOBILE);
  }

  setUserMobileCountryCode(code) {
    if (window.sessionStorage) {
      sessionStorage.setItem(USER_MOBILE_COUNTRY_CODE, code);
    }
  }

  getUserMobileCountryCode() {
    return sessionStorage.getItem(USER_MOBILE_COUNTRY_CODE);
  }

  setFromLoginPage() {
    if (window.sessionStorage) {
      sessionStorage.setItem(FROM_LOGIN_PAGE, 'true');
    }
  }

  getFromLoginPage() {
    return sessionStorage.getItem(FROM_LOGIN_PAGE);
  }

  removeFromLoginPage() {
    sessionStorage.removeItem(FROM_LOGIN_PAGE);
  }

  removeFromMobileNumber() {
    sessionStorage.removeItem(USER_MOBILE);
  }

  removeFromMobileCountryCode() {
    sessionStorage.removeItem(USER_MOBILE_COUNTRY_CODE);
  }
  getCaptchaCount() {
    let captchaCount;
    if (window.sessionStorage && sessionStorage.getItem(CAPTACHA_COUNT)) {
      captchaCount = JSON.parse(sessionStorage.getItem(CAPTACHA_COUNT));
    } else {
      captchaCount = 0;
    }
    return Number(captchaCount);
  }

  setCaptchaCount() {
    if (window.sessionStorage) {
      const captchaCount = this.getCaptchaCount() + 1;
      sessionStorage.setItem(CAPTACHA_COUNT, captchaCount.toString());
    }
  }

  updateMobileNumber(countryCode, mobileNumber) {
    this.signUpFormData.countryCode = countryCode;
    this.signUpFormData.mobileNumber = mobileNumber;
    if (window.sessionStorage && sessionStorage.getItem(USER_MOBILE)) {
      this.setUserMobileNo(mobileNumber);
    }
    this.commit();
  }

  setByRequestFlag(buyRequestFlag) {
    this.signUpFormData.buyRequestFlag = buyRequestFlag;
    this.commit();
  }

  getByRequestFlag() {
    return this.signUpFormData.buyRequestFlag;
  }

  clearByRequestFlag() {
    this.signUpFormData.buyRequestFlag = false;
    this.commit();
  }

  //srs details
  setEditProfileSrsDetails(accountNumber, srsBankOperator, customerId) {
    this.signUpFormData.srsAccountNumber = accountNumber;
    this.signUpFormData.srsOperatorBank = srsBankOperator;
    this.signUpFormData.customerId = customerId;
    this.commit();
  }

  getSrsDetails() {
    return {
      srsAccountNumber: this.signUpFormData.srsAccountNumber,
      srsOperatorBank: this.signUpFormData.srsOperatorBank,
      customerId: this.signUpFormData.customerId
    };
  }

  validateReferralCode(referralCode) {
    // API Call here
    const data = { "referralCode": referralCode };
    return this.apiService.validateReferralCode(data);
  }

  // create account my_info details
  setCreateAccountMyInfoFormData(data,email) {
    if (data.name && data.name.value) {
      this.signUpFormData.fullName = data.name.value;
      this.disableAttributes.push('fullName');
    }
    if (data.uin) {
      this.signUpFormData.nricNumber = data.uin;
      this.disableAttributes.push('nricNumber');
    }
      this.signUpFormData.email = email;
      this.signUpFormData.mobileNumber = data.mobileno?.nbr;
    if (data.dob.value) {
      this.signUpFormData.dob = this.investmentAccountService.dateFormat(data.dob.value);
      this.disableAttributes.push('dob');
    }
    if (data.sex.value === SIGN_UP_CONFIG.GENDER.MALE.VALUE) {
      this.signUpFormData.gender = SIGN_UP_CONFIG.GENDER.MALE.DESC;
      this.disableAttributes.push('gender');
    } else if (data.sex.value === SIGN_UP_CONFIG.GENDER.FEMALE.VALUE) {
      this.signUpFormData.gender = SIGN_UP_CONFIG.GENDER.FEMALE.DESC;
      this.disableAttributes.push('gender');
    }

    this.signUpFormData.isMyInfoEnabled = true;
    this.signUpFormData.disableAttributes = this.disableAttributes;
    this.commit();
  }

  isDisabled(fieldName): boolean {
    let disable: boolean;
    if (this.signUpFormData &&
      this.signUpFormData.isMyInfoEnabled && this.signUpFormData.disableAttributes &&
      this.signUpFormData.disableAttributes.indexOf(fieldName) >= 0
    ) {
      disable = true;
    } else {
      disable = false;
    }
    return disable;
  }

  loadCorpBizUserMyInfoData(data) {
    if (data.uin) {
      this.corpBizUserMyInfoData.uinfin = data.uin;
    }
    this.setCorpBizMyInfoData(data);
    this.setPropertyData(data?.hdbOwnerships);
    this.setVehicleData(data?.vehicles);
    this.setMaritalStatus(data);
    this.setOwnershipStatus(data?.ownerprivate);
    this.commitCorpBizUserInfo();
  }

  clearCorpbizSessionData() {
    if (window.sessionStorage) {
      this.corpBizUserMyInfoData = new CorpBizUserMyInfoData();
      sessionStorage.setItem(CORP_BIZ_USER_MYINFO_SESSION_STORAGE_KEY, null);
    }
  }

  setMaritalStatus(data) {
    if (data.marital) {
      if (data.marital.desc === SIGN_UP_CONFIG.MARITAL_STATUS.SINGLE.DESC.toUpperCase()) {
        this.corpBizUserMyInfoData.marital = SIGN_UP_CONFIG.MARITAL_STATUS.SINGLE.DESC
      } else if (data.marital.desc === SIGN_UP_CONFIG.MARITAL_STATUS.MARRIED.DESC.toUpperCase()) {
        this.corpBizUserMyInfoData.marital = SIGN_UP_CONFIG.MARITAL_STATUS.MARRIED.DESC
      } else if (data.marital.desc === SIGN_UP_CONFIG.MARITAL_STATUS.WIDOWED.DESC.toUpperCase()) {
        this.corpBizUserMyInfoData.marital = SIGN_UP_CONFIG.MARITAL_STATUS.WIDOWED.DESC
      } else if (data.marital.desc === SIGN_UP_CONFIG.MARITAL_STATUS.DIVORCED.DESC.toUpperCase()) {
        this.corpBizUserMyInfoData.marital = SIGN_UP_CONFIG.MARITAL_STATUS.DIVORCED.DESC
      } else {
        this.corpBizUserMyInfoData.marital = null;
      }
    }
  }

  setOwnershipStatus(data) {
    if (data && !Util.isEmptyOrNull(data.value)) {
      this.corpBizUserMyInfoData.ownershipStatus = data.value == 'true' ? SIGN_UP_CONFIG.OWNERSHIP_STATUS.YES.VALUE : SIGN_UP_CONFIG.OWNERSHIP_STATUS.NO.VALUE;
    }
  }

  setVehicleData(vehicles) {
    if (vehicles && vehicles.length > 0) {
      let vehicleData = [];
      vehicles.forEach(vehicle => {
        if (vehicle.status === SIGN_UP_CONFIG.VEHICLE_STATUS.LIVE.VALUE) {
          const expiryDate = vehicle.coeExpiryDate ? this.investmentAccountService.corpBizDateFormat(vehicle.coeExpiryDate) : null;
          const registerDate = vehicle.firstRegistrationDate ? this.investmentAccountService.corpBizDateFormat(vehicle.firstRegistrationDate) : null;
          vehicleData.push({
            coeExpiryDate: expiryDate ? `${expiryDate.day}/${expiryDate.month}/${expiryDate.year}` : null,
            registrationDate: registerDate ? `${registerDate.day}/${registerDate.month}/${registerDate.year}` : null,
            openMarketValue: vehicle.openMarketValue,
            status: SIGN_UP_CONFIG.VEHICLE_STATUS.LIVE.DESC
          });
        }
      });
      this.corpBizUserMyInfoData.vehicles = vehicleData;
    }
  }

  setResidentialStatus(residentialStatus) {
    if (residentialStatus.desc && residentialStatus.desc.toUpperCase() == SIGN_UP_CONFIG.RESIDENTIAL_STATUS.CITIZEN.VALUE) {
      return SIGN_UP_CONFIG.RESIDENTIAL_STATUS.CITIZEN.DESC;
    } else if (residentialStatus.desc && residentialStatus.desc.toUpperCase() == SIGN_UP_CONFIG.RESIDENTIAL_STATUS.PR.VALUE) {
      return SIGN_UP_CONFIG.RESIDENTIAL_STATUS.PR.DESC;
    } else if (residentialStatus.desc && residentialStatus.desc.toUpperCase() == SIGN_UP_CONFIG.RESIDENTIAL_STATUS.ALIEN.VALUE) {
      return SIGN_UP_CONFIG.RESIDENTIAL_STATUS.ALIEN.DESC;
    }
    return null;
  }

  setCorpBizMyInfoData(data) {
    if (data.dob && data.dob.value) {
      this.corpBizUserMyInfoData.dateOfBirth = this.investmentAccountService.corpBizDateFormat(data.dob.value);
    }

    if (data.birthcountry && data.birthcountry.countryDetails) {
      this.corpBizUserMyInfoData.birthCountry = this.investmentAccountService.getCountryObject(data.birthcountry.countryDetails);
    }

    if (data.residentialstatus) { // Set Residential Status
      this.corpBizUserMyInfoData.residentialstatus = this.setResidentialStatus(data?.residentialstatus);
    }
    // Set Income breakdown and Notice of Assessment Data
    if (data.noa) {
      this.corpBizUserMyInfoData.noa = {
        assessableIncome: data.noa.amount > 0 ? data.noa.amount : null,
        trade: data.noa.trade > 0 ? data.noa.trade : null,
        interest: data.noa.interest > 0 ? data.noa.interest : null,
        yearOfAssessment: data.noa.yearofassessment,
        employment: data.noa.employment > 0 ? data.noa.employment : null,
        rent: data.noa.rent > 0 ? data.noa.rent : null,
        taxClearance: data.noa.taxclearance,
        type: data.noa.category
      };
    }
    // Set CPF Housing Withdrawal Data
    if (data.cpfhousingwithdrawal && data.cpfhousingwithdrawal.withdrawaldetails && data.cpfhousingwithdrawal.withdrawaldetails.length > 0) {
      const withdrawalData = data.cpfhousingwithdrawal.withdrawaldetails;
      let cpfHousingData: CPFWithdrawal[] = [];
      withdrawalData.forEach(element => {
        cpfHousingData.push({
          withdrawalAmount: element.principalwithdrawalamt,
          installmentAmount: element.monthlyinstalmentamt,
          acruedInterest: element.accruedinterestamt,
          totalCPFAmount: element.totalamountofcpfallowedforproperty,
          withdrawalAddress: element.address?.formattedSingleLineAddress
        });
      });
      this.corpBizUserMyInfoData.cpfhousingwithdrawal = cpfHousingData;
    }
    // Set Children Birth Records
    if (data.childrenRecords && data.childrenRecords.length > 0) {
      this.corpBizUserMyInfoData.childrenRecords = this.setChildRecords(data.childrenRecords);
    }
    // Set Sponsored Children Birth Records
    if (data.sponsoredChildrenRecords && data.sponsoredChildrenRecords.length > 0) {
      this.corpBizUserMyInfoData.sponsoredChildrenRecords = this.setChildRecords(data.sponsoredChildrenRecords);
    }

    // Set CPF Account Balances data - RA, OA, MA, SA
    if (data.cpfbalances) {
      const cpfAccBal = data.cpfbalances;
      this.corpBizUserMyInfoData.cpfBalances = {
        ma: cpfAccBal?.ma,
        sa: cpfAccBal?.sa,
        oa: cpfAccBal?.oa,
        ra: cpfAccBal?.ra,
      };
    }

    // Set Residential Address
    this.corpBizUserMyInfoData.regadd = data?.regadd?.formattedSingleLineAddress;
    // Set Race
    this.corpBizUserMyInfoData.race = data?.race;
  }

  setChildRecords(children) {
    let childrenData: Child[] = [];
    children.forEach(child => {
      const childDOB = child.dob.value ? this.investmentAccountService.corpBizDateFormat(child.dob.value) : null;
      if (child.lifeStatus && child.lifeStatus.value !== SIGN_UP_CONFIG.LIFE_STATUS.DECEASED.VALUE && child.name && !Util.isEmptyOrNull(child.name.value)) {
        childrenData.push({
          name: child.name.value,
          gender: child.sex && child.sex.value ? (child.sex.value == SIGN_UP_CONFIG.GENDER.FEMALE.VALUE ? SIGN_UP_CONFIG.GENDER.FEMALE.DESC : SIGN_UP_CONFIG.GENDER.MALE.DESC) : null,
          lifeStatus: SIGN_UP_CONFIG.LIFE_STATUS.ALIVE.DESC,
          dob: childDOB ? `${childDOB.day}/${childDOB.month}/${childDOB.year}` : null,
          residentialStatus: child.residentialStatus ? this.setResidentialStatus(child.residentialStatus) : null
        })
      }
    });
    return childrenData;
  }

  setPropertyData(data) {
    let hdbOwnerships = [];
    if (data && data.length > 0) {
      data.forEach(house => {
        const purchaseDate = house.dateOfPurchase ? this.investmentAccountService.corpBizDateFormat(house.dateOfPurchase) : null;
        const leaseDate = house.leasecommencementdate ? this.investmentAccountService.corpBizDateFormat(house.leasecommencementdate) : null;
        hdbOwnerships.push({
          dateOfPurchase: purchaseDate ? `${purchaseDate.day}/${purchaseDate.month}/${purchaseDate.year}` : null,
          monthlyLoanInstalment: house.monthlyLoanInstalment,
          outstandingLoanBalance: house.outstandingLoanBalance,
          loanGranted: house.loanGranted,
          leaseCommenceDate: leaseDate ? `${leaseDate.day}/${leaseDate.month}/${leaseDate.year}` : null
        })
      });
    }
    this.corpBizUserMyInfoData.hdbProperty = hdbOwnerships;
  }

  setMyInfoStatus(status) {
    this.signUpFormData.isMyInfoEnabled = status;
    this.commit();
  }

  getReferralCodeData() {
    return this.apiService.getReferralCodeData();
  }
  getRefereeList() {
    // API Call here
    return this.apiService.getRefereeList();
  }

  emailDomainValidator(organisationEnabled = false): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const isEnteredEmailId = isNaN(parseInt(control.value));
      if (organisationEnabled && isEnteredEmailId && appConstants.ORGANISATION_ROLES.ALLOWED_DOMAIN_CORP.filter(ele => control.value?.includes(ele)).length === 0) {
        return { invalidDomain: true };
      } else if (!organisationEnabled && isEnteredEmailId && appConstants.RESTRICTED_DOMAIN_PUBLIC.filter(ele => control.value?.includes(ele)).length > 0) {
        return { invalidDomain: true };
      }
      return null;
    }
  }

  // cpf
  setEditProfileCpfDetails(accountNumber, cpfBankOperator, customerId) {
    this.signUpFormData.cpfAccountNumber = accountNumber;
    this.signUpFormData.cpfOperatorBank = cpfBankOperator;
    this.signUpFormData.customerId = customerId;
    this.commit();
  }

  getCpfDetails() {
    return {
      cpfAccountNumber: this.signUpFormData.cpfAccountNumber,
      cpfOperatorBank: this.signUpFormData.cpfOperatorBank,
      customerId: this.signUpFormData.customerId
    };
  }

  // Corp Biz changes
  setCorpBizMyInfoStatus(status) {
    this.corpBizUserMyInfoData.isCorpBizMyInfoEnabled = status;
    this.commitCorpBizUserInfo();
  }

  getCorpBizMyInfoStatus() {
    return this.corpBizUserMyInfoData.isCorpBizMyInfoEnabled;
  }
}
