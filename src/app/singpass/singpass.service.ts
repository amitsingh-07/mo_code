import { Injectable } from '@angular/core';
import { InAppBrowser } from 'capgo-inappbrowser-intent-fix';

import { ApiService } from '../shared/http/api.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';
import { environment } from '../../environments/environment';
import { SIGN_UP_ROUTES } from '../sign-up/sign-up.routes.constants';
import { CapacitorUtils } from '../shared/utils/capacitor.util';
import { appConstants } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class SingpassService {
  private stateNonce: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthenticationService
  ) {
  }

  // Get state & nonce using session id
  async getStateNonce(): Promise<any> {
    if (this.authService.isAuthenticated()) {
      const payload = { sessionId: this.authService.getSessionId() };
      await this.apiService.getStateNonce(payload).subscribe((data) => {
        this.setStateNonceObj(data['objectList'][0]);
      });
    }
  }

  setStateNonceObj(statenonce) {
    this.stateNonce = statenonce;
  }

  // Singpass redirecting back to MO
  loginSingpass(code, state, enquiryId, journeyType) {
    const payload = {
      enquiryId: enquiryId,
      journeyType: journeyType,
      code: code,
      state: state
    };
    return this.apiService.loginSingpass(payload);
  }

  // Open Singpass redirect link in window
  openSingpassUrl() {
    const redirectUrl =   environment.singpassBaseUrl + appConstants.BASE_HREF + SIGN_UP_ROUTES.ACCOUNTS_LOGIN;
    let loginUrl = environment.singpassLoginUrl +
      '?client_id=' + environment.singpassClientId +
      '&redirect_uri=' + redirectUrl +
      '&scope=openid' +
      '&response_type=code' +
      '&state=' + this.stateNonce.state +
      '&nonce=' + this.stateNonce.nonce;
  if (CapacitorUtils.isApp) {
      InAppBrowser.openWebView({url: encodeURI(loginUrl), title: ""});
    } else {
      window.open(loginUrl, '_self');
    }
  }

}
