import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { EMPTY, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { RegexConstants } from '../../../shared/utils/api.regex.constants';
import { ErrorModalComponent } from '../../modal/error-modal/error-modal.component';
import { Util } from '../../utils/util';
import { apiConstants } from '../api.constants';
import { IServerResponse } from '../interfaces/server-response.interface';
import { appConstants } from './../../../app.constants';
import { BaseService } from './../base.service';
import { RequestCache } from './../http-cache.service';
import { environment } from './../../../../environments/environment';

const FROM_JOURNEY_HM = 'from_journey';
const EMAIL = 'email';
const CORPORATE_DETAILS = 'app_corporate_details';
const APP_WELCOME_FLOW = 'app_welcome_flow';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  apiBaseUrl = '';
  private get2faAuth = new BehaviorSubject('');
  get2faAuthEvent = this.get2faAuth.asObservable();
  private get2faError = new BehaviorSubject(false);
  get2faErrorEvent = this.get2faError.asObservable();
  public get2faSendError = new BehaviorSubject(false);
  get2faSendErrorEvent = this.get2faSendError.asObservable();
  private get2faUpdate = new BehaviorSubject('');
  get2faUpdateEvent = this.get2faUpdate.asObservable();
  private timer2fa: any;
  private is2faVerifyAllowed: boolean = false;
  isUserTypeCorporate = false;
  displayCorporateLogo$ = new BehaviorSubject<boolean>(false);
  isShowWelcomeFlow: boolean = false;
  isCorpBiz: boolean = false;

  constructor(
    private httpClient: HttpClient, public jwtHelper: JwtHelperService,
    private cache: RequestCache, private http: BaseService,
    private modal: NgbModal
  ) {

    this.apiBaseUrl = Util.getApiBaseUrl();
  }

  getAppSecretKey() {
    return 'kH5l7sn1UbauaC46hT8tsSsztsDS5b/575zHBrNgQAA=';
  }

  // tslint:disable-next-line: max-line-length
  login(userEmail: string, userPassword: string, captchaValue?: string, sessionId?: string, enqId?: number, journeyType?: string, finlitEnabled?: boolean, accessCode?: string, loginType?: string, organisationCode?: string) {
    const authenticateBody = {
      email: (userEmail && this.isUserNameEmail(userEmail)) ? userEmail : '',
      mobile: (userEmail && !this.isUserNameEmail(userEmail)) ? userEmail : '',
      password: userPassword ? userPassword : '',
      organisationCode: organisationCode
      //secretKey: this.getAppSecretKey()
    };
    if (sessionId) { authenticateBody['sessionId'] = sessionId; }
    if (captchaValue) { authenticateBody['captchaValue'] = captchaValue; }
    if (enqId && !finlitEnabled) { authenticateBody['enquiryId'] = enqId; }
    if (journeyType && !finlitEnabled) { authenticateBody['journeyType'] = journeyType; }
    if (finlitEnabled) { authenticateBody['accessCode'] = accessCode; }
    if (loginType && loginType !== '') { authenticateBody['loginType'] = loginType; }
    const handleError = '?handleError=true';
    return this.doAuthenticate(authenticateBody, handleError, finlitEnabled);
  }

  authenticate() {
    // Avoid duplicate authentication calls
    if (this.isAuthenticated()) {
      return EMPTY;
    }

    const authenticateBody = {
      email: '',
      mobile: '',
      password: '',
      //secretKey: this.getAppSecretKey()
    };
    return this.doAuthenticate(authenticateBody);
  }

  private doAuthenticate(authenticateBody: any, handleError?: string, finlitEnabled?: boolean) {
    const organisationEnabled = authenticateBody.organisationCode || null;
    if (!handleError) {
      handleError = '';
    }
    const authenticateUrl = (finlitEnabled ? apiConstants.endpoint.authenticateWorkshop : (organisationEnabled ? apiConstants.endpoint.authenticateCorporate : apiConstants.endpoint.authenticate));
    return this.httpClient.post<IServerResponse>(`${this.apiBaseUrl}/${authenticateUrl}${handleError}`, authenticateBody)
      .pipe(map((response) => {
        // login successful if there's a jwt token in the response
        if (response && response.objectList[0] && response.objectList[0].securityToken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.saveAuthDetails(response.objectList[0]);
        }
        this.checkAndSetFlag(response);
        return response;
      }));
  }

  checkAndSetFlag(response) {
    if (response && response.objectList[1] && typeof response.objectList[1]['showWelcomeFlow'] === 'boolean') {
      this.isShowWelcomeFlow = response.objectList[1].showWelcomeFlow;
      this.setWelcomeFlowFlag(this.isShowWelcomeFlow);
    }
    this.isCorpBiz = response?.objectList[1]?.isCorpBizUser;
  }

  saveAuthDetails(auth: any) {
    if (sessionStorage) {
      sessionStorage.setItem(appConstants.APP_JWT_TOKEN_KEY, auth.securityToken);
      sessionStorage.setItem(appConstants.APP_SESSION_ID_KEY, auth.sessionId);
    }
  }

  clearAuthDetails() {
    if (sessionStorage) {
      sessionStorage.removeItem(appConstants.APP_JWT_TOKEN_KEY);
      sessionStorage.removeItem(appConstants.APP_SESSION_ID_KEY);
      sessionStorage.removeItem(appConstants.APP_ENQUIRY_ID);
    }
  }

  isUserNameEmail(username: string) {
    const emailPattern = new RegExp(RegexConstants.Email);
    return emailPattern.test(username);
  }

  clearSession() {
    // remove user from local storage to log user out
    const corporateObj = sessionStorage.getItem(CORPORATE_DETAILS);
    this.cache.reset();
    sessionStorage.clear();
    if (sessionStorage) {
      sessionStorage.setItem(CORPORATE_DETAILS, (corporateObj))
    }
  }

  public getToken(): string {
    return sessionStorage.getItem(appConstants.APP_JWT_TOKEN_KEY);
  }

  public getSessionId(): string {
    return sessionStorage.getItem(appConstants.APP_SESSION_ID_KEY);
  }

  public isAuthenticated(): boolean {
    // get the token
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // return a boolean reflecting
    // whether or not the token is expired
    return !this.jwtHelper.isTokenExpired(token);
  }

  public isSignedUser() {
    // get the token
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const decodedInfo = this.jwtHelper.decodeToken(token);
    const isLoggedInToken = decodedInfo.roles.split(',').indexOf('ROLE_SIGNED_USER') >= 0;
    const isTokenExpired = this.jwtHelper.isTokenExpired(token);
    return !isTokenExpired && isLoggedInToken;
  }

  saveEnquiryId(id) {
    if (sessionStorage) {
      sessionStorage.setItem(appConstants.APP_ENQUIRY_ID, id);
    }
  }

  public getEnquiryId(): string {
    return sessionStorage.getItem(appConstants.APP_ENQUIRY_ID);
  }

  removeEnquiryId() {
    if (sessionStorage) {
      sessionStorage.removeItem(appConstants.APP_ENQUIRY_ID);
    }
  }

  public getCaptchaUrl(): string {
    const time = new Date().getMilliseconds();
    const apiBaseUrl = Util.getApiBaseUrl();
    return apiBaseUrl + '/' + apiConstants.endpoint.getCaptcha + '?code=' + this.getSessionId() + '&time=' + time;
  }

  public logout(browserClose?) {
    const logoutParam = (browserClose === appConstants.BROWSER_CLOSE) ? appConstants.BROWSER_CLOSE : appConstants.LOGOUT_BUTTON
    return this.http.get(apiConstants.endpoint.logout.replace('$LOGOUT_BUTTON$', logoutParam))
      .pipe(
        // tslint:disable-next-line:no-identical-functions
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
              `Backend returned code ${error.status}, ` + `body was: ${error.error}`
            );
          }
          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        })
      );
  }
  public isSignedUserWithRole(role: string) {
    // get the token
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const decodedInfo = this.jwtHelper.decodeToken(token);
    const isLoggedInToken = decodedInfo.roles.split(',').indexOf(role) >= 0;
    const isTokenExpired = this.jwtHelper.isTokenExpired(token);
    return !isTokenExpired && isLoggedInToken;
  }

  public accessCorporateUserFeature(access_feature): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const decodedInfo = this.jwtHelper.decodeToken(token);
    const isLoggedInToken = decodedInfo.roles.split(',');
    for (let org_role in appConstants.ORGANISATION_ROLES) {
      if (isLoggedInToken.includes(org_role)) {
        return appConstants.ORGANISATION_ROLES[org_role][access_feature];
      }
    }
    const isTokenExpired = this.jwtHelper.isTokenExpired(token);
    return !isTokenExpired && isLoggedInToken;
  }

  //2FA Implementation
  public send2faRequest(handleError?: any) {
    if (!handleError) {
      handleError = '';
    }
    const send2faOtpUrl = apiConstants.endpoint.send2faOTP;

    return this.httpClient.get<IServerResponse>(`${this.apiBaseUrl}/${send2faOtpUrl}${handleError}`)
      .pipe(map((response) => {
        // login successful if there's a jwt token in the response
        if (response && response.objectList[0] && response.objectList[0].securityToken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.saveAuthDetails(response.objectList[0]);
        }
        return response;
      }));
  }
  public doValidate2fa(otp: string, handleError?: string) {
    if (!handleError) {
      handleError = '?handleError=true';
    }
    const validate2faBody = {
      twoFactorOtpString: otp
    };

    const authenticateUrl = apiConstants.endpoint.authenticate2faOTP;
    return this.httpClient.post<IServerResponse>(`${this.apiBaseUrl}/${authenticateUrl}${handleError}`, validate2faBody)
      .pipe(map((response) => {
        return response;
      }));
  }
  private doVerify2fa() {
    const handleError = '?handleError=true';
    const verifyUrl = apiConstants.endpoint.verify2faOTP;
    return this.httpClient.get<IServerResponse>(`${this.apiBaseUrl}/${verifyUrl}${handleError}`)
      .pipe(
        map((response) => {
          return response;
        }));
  }

  public get2FAToken() {
    this.get2faAuth.next(sessionStorage.getItem(appConstants.APP_2FA_KEY));
  }

  public set2FAToken(token: any) {
    let expiryTime = 50;
    if (environment.expire2faTime) {
      expiryTime = environment.expire2faTime;
    }
    // console.log('expiry time:', expiryTime);
    sessionStorage.setItem(appConstants.APP_2FA_KEY, token);
    this.get2FAToken();
    this.timer2fa = window.setTimeout(() => {
      this.clear2FAToken();
    }, (1000 * expiryTime));
  }

  public clear2FAToken(tries?: number) {
    let interval = 2;
    let maxTry = 5;
    let currentTry = 0;
    if (environment.expire2faTime) {
      interval = environment.expire2faPollRate;
    }
    if (environment.expire2faMaxCheck) {
      maxTry = environment.expire2faMaxCheck;
    }
    if (tries != null) {
      currentTry = tries;
      currentTry++;
    }
    if (currentTry >= maxTry) {
      this.doClear2FASession({ errorPopup: true, updateData: true });
    } else {
      //Start BE Validation check to anticipate BE token check
      this.doVerify2fa().subscribe((data) => {
        if (data.responseMessage.responseCode === 6011 || currentTry < maxTry) {
          clearTimeout(this.timer2fa);
          this.timer2fa = window.setTimeout(() => {
            this.clear2FAToken(currentTry);
          }, (1000 * interval));
        } else {
          this.doClear2FASession({ errorPopup: true, updateData: true });
        }
      });
    }
  }
  public doClear2FASession(option?: any) {
    clearTimeout(this.timer2fa);
    sessionStorage.removeItem(appConstants.APP_2FA_KEY);
    if (option && option.errorPopup) {
      this.get2faError.next(true);
      this.get2faError.next(false);
    }
    if (option && option.updateData) {
      this.get2faUpdate.next(sessionStorage.getItem(appConstants.APP_2FA_KEY));
    }
    this.get2faAuth.next(''); // PROBLEM IS HERE
  }

  public is2FAVerified() {
    const token = sessionStorage.getItem(appConstants.APP_2FA_KEY);
    if (!token) {
      return false;
    }
    return true;
  }

  public set2faVerifyAllowed(allowed: boolean) {
    this.is2faVerifyAllowed = allowed;
  }
  public get2faVerifyAllowed() {
    return this.is2faVerifyAllowed;
  }

  public getFromJourney(key: string) {
    if (sessionStorage) {
      const fromJourneyHm = new Map(JSON.parse(window.sessionStorage.getItem(FROM_JOURNEY_HM)));
      return fromJourneyHm.get(key);
    }
    return null;
  }

  public setFromJourney(key: string, data: any) {
    if (sessionStorage) {
      const oldFromJourneyHm = new Map(JSON.parse(window.sessionStorage.getItem(FROM_JOURNEY_HM)));
      oldFromJourneyHm.set(key, data);
      sessionStorage.setItem(FROM_JOURNEY_HM, JSON.stringify(Array.from(oldFromJourneyHm)));
    }
  }

  /**
   * open invalid otp error modal.
   * @param title - title for error modal.
   * @param message - error description for error modal time password.
   * @param showErrorButton - show try again button or not.
   */
  openErrorModal(title, message, buttonLabel) {
    const error = {
      errorTitle: title,
      errorMessage: message,
      errorButtonLabel: buttonLabel
    };
    const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'otp-2fa-error-modal' });
    ref.componentInstance.errorTitle = error.errorTitle;
    ref.componentInstance.errorMessage = error.errorMessage;
    ref.componentInstance.buttonLabel = error.errorButtonLabel;
    ref.componentInstance.closeBtn = false;
  }

  //2FA Implementation for Login
  public send2faRequestLogin(handleError?: any) {
    if (!handleError) {
      handleError = '';
    }
    const send2faOtpUrl = apiConstants.endpoint.send2faOTPLogin;

    return this.httpClient.get<IServerResponse>(`${this.apiBaseUrl}/${send2faOtpUrl}${handleError}`)
      .pipe(map((response) => {
        // login successful if there's a jwt token in the response
        if (response && response.objectList[0] && response.objectList[0].securityToken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.saveAuthDetails(response.objectList[0]);
        }
        return response;
      }));
  }
  public doValidate2faLogin(otp: string, userEmail: any, journeyType: any, enquiryId: any, handleError?: string, isCorporateUserType = false, isUserFromCorpBizLink?, enrolmentId?) {
    if (!handleError) {
      handleError = '?handleError=true';
    }
    const validate2faBody = {
      twoFactorOtpString: otp,
      email: (userEmail && this.isUserNameEmail(userEmail)) ? userEmail : '',
      mobile: (userEmail && !this.isUserNameEmail(userEmail)) ? userEmail : '',
      enquiryId: enquiryId,
      journeyType: journeyType,
      canTransferAccessFromEnrolment: isUserFromCorpBizLink,
      enrolmentId
    };
    if (this.getAccessCode()) {
      validate2faBody['accessCode'] = this.getAccessCode();
    }
    if (isCorporateUserType) {
      validate2faBody['profileType'] = appConstants.USERTYPE.CORPORATE;
    } else {
      validate2faBody['profileType'] = appConstants.USERTYPE.PUBLIC;
    }
    const authenticateUrl = apiConstants.endpoint.authenticate2faOTPLogin;
    return this.httpClient.post<IServerResponse>(`${this.apiBaseUrl}/${authenticateUrl}${handleError}`, validate2faBody)
      .pipe(map((response) => {
        // login successful if there's a jwt token in the response
        if (response && response.objectList[0] && response.objectList[0].securityToken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.saveAuthDetails(response.objectList[0]);
        }
        return response;
      }));
  }

  clearTokenID() {
    if (sessionStorage) {
      sessionStorage.removeItem(appConstants.APP_JWT_TOKEN_KEY);
      sessionStorage.removeItem(appConstants.APP_SESSION_ID_KEY);
      sessionStorage.removeItem(appConstants.APP_CUSTOMER_ID);
      sessionStorage.removeItem(EMAIL);
      this.removeAccessCode();
    }
  }

  saveAccessCode(accessCode: any) {
    if (sessionStorage) {
      sessionStorage.setItem(appConstants.FINLIT_ACCESS_CODE, accessCode);
    }
  }

  getAccessCode() {
    return sessionStorage.getItem(appConstants.FINLIT_ACCESS_CODE);
  }

  removeAccessCode() {
    sessionStorage.removeItem(appConstants.FINLIT_ACCESS_CODE);
  }

  setWelcomeFlowFlag(welcomeFlowFlag) {
    if (window.sessionStorage) {
      sessionStorage.setItem(APP_WELCOME_FLOW, JSON.stringify(welcomeFlowFlag));
    }
  }

  clearWelcomeFlowFlag() {
    if (window.sessionStorage) {
      sessionStorage.removeItem(APP_WELCOME_FLOW);
    }
  }

  getWelcomeFlowFlag() {
    let welcomeFlowFlag = false;
    if (window.sessionStorage && sessionStorage.getItem(APP_WELCOME_FLOW)) {
      welcomeFlowFlag = JSON.parse(sessionStorage.getItem(APP_WELCOME_FLOW));
    }
    return welcomeFlowFlag;
  }
}
