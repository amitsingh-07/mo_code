import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ApiService } from '../shared/http/api.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';
import { InvestmentAccountFormData } from './investment-account-form-data';

@Injectable({
    providedIn: 'root'
})
export class InvestmentAccountService {

    private investmentAccountFormData: InvestmentAccountFormData = new InvestmentAccountFormData();

    constructor(private http: HttpClient, private apiService: ApiService, public authService: AuthenticationService) {
    }

    getInvestmentAccountFormData() {
        return this.investmentAccountFormData;
    }

    /* Residential Address */
    getCountriesFormData() {
        const countries = ['India', 'Singapore', 'Malaysia'];
        // const countries = this.investmentAccountFormData.countries;
        return countries;
    }
    isUserNationalitySingapore() {
        // return this.investmentAccountFormData.country === 'singapore';
        return true;
    }
    setResidentialAddressFormData(data) {
        this.investmentAccountFormData.country = data.country;
        this.investmentAccountFormData.address1 = data.address1;
        this.investmentAccountFormData.address2 = data.address2;
        this.investmentAccountFormData.city = data.city;
        this.investmentAccountFormData.state = data.state;
        this.investmentAccountFormData.zipCode = data.zipCode;
        this.investmentAccountFormData.isMailingAddressSame = data.isMailingAddressSame;
        this.investmentAccountFormData.mailCountry = data.mailCountry;
        this.investmentAccountFormData.mailAddress1 = data.mailAddress1;
        this.investmentAccountFormData.mailAddress2 = data.mailAddress2;
        this.investmentAccountFormData.mailCity = data.mailCity;
        this.investmentAccountFormData.mailState = data.mailState;
        this.investmentAccountFormData.mailZipCode = data.mailZipCode;
    }

}
