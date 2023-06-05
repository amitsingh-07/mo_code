import { Injectable } from '@angular/core';

import { ApiService } from '../shared/http/api.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';
import { environment } from '../../environments/environment';
import { SIGN_UP_ROUTES } from '../sign-up/sign-up.routes.constants';
import { appConstants } from '../app.constants';
import { CapacitorUtils } from '../shared/utils/capacitor.util';
import { CapacitorPluginService } from '../shared/Services/capacitor-plugin.service';
import { Util } from '../shared/utils/util';

@Injectable({
  providedIn: 'root'
})
export class SingpassService {
  private stateNonce: any;

  constructor(
    private apiService: ApiService,
    private authService: AuthenticationService,
    private capPluginService: CapacitorPluginService
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
  loginSingpass(code, state, enquiryId, journeyType, enrolmentId, isMobileApp) {
    const payload = {
      enquiryId: enquiryId,
      journeyType: journeyType,
      code: code,
      state: state,
      enrolmentId: enrolmentId,
      isMobileApp: isMobileApp
    };
    return this.apiService.loginSingpass(payload);
  }

  // Open Singpass redirect link in window
  openSingpassUrl() {
    const redirectUrl = (CapacitorUtils.isApp ? appConstants.MOBILE_APP_SCHEME : environment.singpassBaseUrl) + appConstants.BASE_HREF + SIGN_UP_ROUTES.ACCOUNTS_LOGIN;
    let loginUrl = environment.singpassLoginUrl +
      '?client_id=' + environment.singpassClientId +
      '&redirect_uri=' + redirectUrl +
      '&scope=openid' +
      '&response_type=code' +
      '&state=' + this.stateNonce.state +
      '&nonce=' + this.stateNonce.nonce;
    if (CapacitorUtils.isApp) {
      if (!CapacitorUtils.isAndroidDevice) {
        loginUrl = loginUrl + '&app_launch_url=' + redirectUrl;
      }
      this.capPluginService.checkCameraPhotoPermission('camera').then((status) => {
        if (status) {
          Util.openExternalUrl(encodeURI(loginUrl));
        }
      });
    } else {
      window.open(loginUrl, '_self');
    }
  }

}
