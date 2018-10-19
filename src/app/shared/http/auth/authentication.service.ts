import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { RegexConstants } from '../../../shared/utils/api.regex.constants';
import { apiConstants } from '../api.constants';
import { IServerResponse } from '../interfaces/server-response.interface';
import { appConstants } from './../../../app.constants';
import { RequestCache } from './../http-cache.service';

export const APP_JWT_TOKEN_KEY = 'app-jwt-token';
const APP_SESSION_ID_KEY = 'app-session-id';
const APP_ENQUIRY_ID = 'app-enquiry-id';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(
    private http: HttpClient, public jwtHelper: JwtHelperService,
    private cache: RequestCache) { }

  private getAppSecretKey() {
    return 'kH5l7sn1UbauaC46hT8tsSsztsDS5b/575zHBrNgQAA=';
  }
  authenticate(userEmail?: string, userPassword?: string) {
    const authenticateUrl = apiConstants.endpoint.authenticate;
    const authenticateBody = {
      email: (userEmail && this.isUserNameEmail(userEmail)) ? userEmail : '',
      mobile: (userEmail && !this.isUserNameEmail(userEmail)) ? userEmail : '',
      password: userPassword ? userPassword : '',
      secretKey: this.getAppSecretKey()
    };
    const handleError = '?handleError=true';
    return this.http.post<IServerResponse>(`${environment.apiBaseUrl}/${authenticateUrl}${handleError}`, authenticateBody)
      .pipe(map((response) => {
        // login successful if there's a jwt token in the response
        if (response && response.objectList[0] && response.objectList[0].securityToken) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.saveAuthDetails(response.objectList[0]);
          return response.objectList[0].securityToken;
        }
        return response;
      }),
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
            const url = '../../../../assets/mock-data/authenticate.json';
            return this.http.get<IServerResponse>(url);
          }
          // return an observable with a user-facing error message
          return throwError('Something bad happened; please try again later.');
        }));
  }

  saveAuthDetails(auth: any) {
    if (sessionStorage) {
      sessionStorage.setItem(appConstants.APP_JWT_TOKEN_KEY, auth.securityToken);
      sessionStorage.setItem(appConstants.APP_SESSION_ID_KEY, auth.sessionId);
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
    return this.jwtHelper.isTokenExpired(token, 30 * 60);
  }

  saveEnquiryId(id) {
    if (sessionStorage) {
      sessionStorage.setItem(appConstants.APP_ENQUIRY_ID, id);
    }
  }

  public getEnquiryId(): string {
    return sessionStorage.getItem(appConstants.APP_ENQUIRY_ID);
  }

}
