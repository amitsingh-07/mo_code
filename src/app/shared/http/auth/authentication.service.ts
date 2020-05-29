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

export const APP_JWT_TOKEN_KEY = 'app-jwt-token';
const APP_SESSION_ID_KEY = 'app-session-id';
const APP_ENQUIRY_ID = 'app-enquiry-id';
const FROM_JOURNEY_HM = 'from_journey';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  apiBaseUrl = '';
  private get2faAuth = new BehaviorSubject('');
  get2faAuthEvent = this.get2faAuth.asObservable();
  private timer2fa: any;

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
  login(userEmail: string, userPassword: string, captchaValue?: string, sessionId?: string, enqId?: number, journeyType?: string, finlitEnabled?: boolean, accessCode?: string) {
    const authenticateBody = {
      email: (userEmail && this.isUserNameEmail(userEmail)) ? userEmail : '',
      mobile: (userEmail && !this.isUserNameEmail(userEmail)) ? userEmail : '',
      password: userPassword ? userPassword : '',
      //secretKey: this.getAppSecretKey()
    };
    if (sessionId) { authenticateBody['sessionId'] = sessionId; }
    if (captchaValue) { authenticateBody['captchaValue'] = captchaValue; }
    if (enqId && !finlitEnabled) { authenticateBody['enquiryId'] = enqId; }
    if (journeyType && !finlitEnabled) { authenticateBody['journeyType'] = journeyType; }
    if (finlitEnabled) { authenticateBody['accessCode'] = accessCode; }
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
    if (!handleError) {
      handleError = '';
    }
    const authenticateUrl = (finlitEnabled) ? apiConstants.endpoint.authenticateWorkshop : apiConstants.endpoint.authenticate;
    return this.httpClient.post<IServerResponse>(`${this.apiBaseUrl}/${authenticateUrl}${handleError}`, authenticateBody)
      .pipe(map((response) => {
        // login successful if there's a jwt token in the response
        if (response && response.objectList[0] && response.objectList[0].securityToken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.saveAuthDetails(response.objectList[0]);
        }
        return response;
      }));
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
    this.cache.reset();
    sessionStorage.clear();
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

  // public send2FARequest() {
  //   const payload = {
  //     customerRef: "",
  //     otp: "",
  //     editProfile: false
  //   }: IVerifyRequestOTP;

  //   return this.apiService.requestNewOTP(payload);
  // }


  saveEnquiryId(id) {
    if (sessionStorage) {
      sessionStorage.setItem(appConstants.APP_ENQUIRY_ID, id);
    }
  }

  public getEnquiryId(): string {
    return sessionStorage.getItem(appConstants.APP_ENQUIRY_ID);
  }

  public getCaptchaUrl(): string {
    const time = new Date().getMilliseconds();
    const apiBaseUrl = Util.getApiBaseUrl();
    return apiBaseUrl + '/' + apiConstants.endpoint.getCaptcha + '?code=' + this.getSessionId() + '&time=' + time;
  }

  public logout() {
    return this.http.get(apiConstants.endpoint.logout)
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

  //2FA Implementation
  public send2faRequest(handleError?: any) {
    if (!handleError) {
      handleError = '';
    }
    console.log('Sent 2fa Authentication Request');
    const send2faOtpUrl = apiConstants.endpoint.send2faOTP;

    return this.httpClient.get<IServerResponse>(`${this.apiBaseUrl}/${send2faOtpUrl}${handleError}`)
      .pipe(map((response) => {
        // login successful if there's a jwt token in the response
        if (response && response.objectList[0] && response.objectList[0].securityToken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          console.log('send2faRequest response', response);
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
      .pipe(map((response) => {
        return response;
      }));
  }

  public get2FAToken() {
    console.log('get2FAToken triggered');
    this.get2faAuth.next(sessionStorage.getItem(appConstants.APP_2FA_KEY));
  }

  public set2FAToken(token: any) {
    let expiryTime = 50;
    if (environment.expire2faTime) {
      expiryTime = environment.expire2faTime;
    }
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
    console.log('Try no.:', currentTry);
    if (currentTry === maxTry) {
      console.log('maxTry is hit', maxTry);
      this.doClear2FASession(true);
    } else {
      //Start BE Validation check to anticipate BE token check
      this.doVerify2fa().subscribe((data) => {
        if (data.responseMessage.responseCode === 6011 || currentTry == maxTry) {
          clearTimeout(this.timer2fa);
          this.timer2fa = window.setTimeout(() => {
            console.log('Validating in ' + interval + ' seconds at try no.' + currentTry);
            this.clear2FAToken(currentTry);
          }, (1000 * interval));
        } else {
          this.doClear2FASession(true);
        }
      });
    }
  }
  public doClear2FASession(errorPopup?: boolean) {
    console.log('session clearing');
    clearTimeout(this.timer2fa);
    console.log(this.timer2fa);
    sessionStorage.removeItem(appConstants.APP_2FA_KEY);
    if(errorPopup) {
      this.openErrorModal('Your session to edit profile has expired.', '', 'Okay');
    }
    this.get2faAuth.next(sessionStorage.getItem(appConstants.APP_2FA_KEY));
  }

  public is2FAVerified() {
    const token = sessionStorage.getItem(appConstants.APP_2FA_KEY);
    if (!token) {
      return false;
    }
    return true;
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
    const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'otp-error-modal' });
    ref.componentInstance.errorTitle = error.errorTitle;
    ref.componentInstance.errorMessage = error.errorMessage;
    ref.componentInstance.buttonLabel = error.errorButtonLabel;
  }

}
