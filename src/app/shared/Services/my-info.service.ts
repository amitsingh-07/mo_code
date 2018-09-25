import { Injectable } from '@angular/core';

import { environment } from './../../../environments/environment';
import { appConstants } from './../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class MyInfoService {
  authApiUrl = 'https://myinfosgstg.api.gov.sg/dev/v1/authorise';
  clientId = environment.myInfoClientId;
  attributes = 'name,sex,race,nationality,dob,email,mobileno,regadd,housingtype,hdbtype,marital,edulevel';
  purpose = 'demonstrating MyInfo APIs';
  redirectUrl = environment.myInfoCallbackBaseUrl + '/' + appConstants.MY_INFO_CALLBACK_URL;
  state = Math.floor(100 + Math.random() * 90);
  constructor() { }

  goToMyInfo() {
    window.sessionStorage.setItem('currentUrl', window.location.hash);
    const authoriseUrl = this.authApiUrl +
      '?client_id=' + this.clientId +
      '&attributes=' + this.attributes +
      '&purpose=' + this.purpose +
      '&state=' + this.state +
      '&redirect_uri=' + this.redirectUrl;
    window.location.href = authoriseUrl;
  }
}
