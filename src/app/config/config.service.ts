import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { IProductCategory } from '../direct/product-info/product-category/product-category';
import { HospitalPlan } from '../guide-me/hospital-plan/hospital-plan';
import { environment } from './../../environments/environment';

export interface IConfig {
  language: string;
  useMyInfo: boolean;
  maintenanceEnabled: boolean;
  marqueeEnabled: boolean;
  promotionEnabled: boolean;
  articleEnabled: boolean;
  willWritingEnabled: boolean;
  investmentEnabled: boolean;
  investmentEngagementEnabled: boolean;
  investmentMyInfoEnabled: boolean;
  comprehensiveEnabled: boolean;
  srsEnabled: boolean;
  resetPasswordUrl: string;
  resetPasswordCorpUrl?: string;
  verifyEmailUrl: string;
  corpEmailVerifyUrl: string;
  corpBizEmailVerifyUrl: string;
  hospitalPlanData: HospitalPlan[];
  productCategory: IProductCategory[];
  distribution: any;
  comprehensiveLiveEnabled: boolean;
  showAnnualizedReturns: boolean;
  paymentEnabled: boolean;
  iFastMaintenance: boolean;
  maintenanceStartTime: string;
  maintenanceEndTime: string;
  showPortfolioInfo: boolean;
  investment: any;
  account: any;
}

const CACHE_SIZE = 1;

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private cache$: Observable<IConfig> = null;
  private configUrl = 'assets/config.json';
  private s3ConfigUrl = environment.configJsonUrl;
  private mobileAppBuildInfoUrl = 'https://mo-static-assets-nonprod.s3.ap-southeast-1.amazonaws.com/promo/dev/appConfig.json';

  constructor(private http: HttpClient) { }

  getConfig() {
    if (!this.cache$) {
      this.cache$ = this.readConfig().pipe(
        shareReplay(CACHE_SIZE)
      );
    }
    return this.cache$;
  }

  fetchConfig() {
    return new Observable<IConfig>((observer) => {
      fetch(this.s3ConfigUrl)
        .then(response => response.json())
        .then(data => {
          observer.next(data);
          observer.complete();
          shareReplay(CACHE_SIZE);
        })
        .catch(err => {
          this.handleError;
        });
    });
  }

  private readConfig() {
    return this.http.get<IConfig>(this.configUrl).pipe(
      map((response) => {
        this.fetchConfig().subscribe((res) => {
          if (res) {
            response['iFastMaintenance'] = res['iFastMaintenance'];
            response['maintenanceStartTime'] = res['maintenanceStartTime'];
            response['maintenanceEndTime'] = res['maintenanceEndTime'];
          }
        });
        return response;
      }),
      catchError(this.handleError) // then handle the error
    );
  }

  getMobileAppInfoConfig() {
    return this.http.get<any>(this.mobileAppBuildInfoUrl).toPromise();
  }

  private handleError(error: HttpErrorResponse) {
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
  }

  // Method to check iFast downtime on May 9
  checkIFastStatus(startTime, endTime) {
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (Date.now() >= startDateTime.valueOf() && Date.now() <= endDateTime.valueOf()) {
      return true;
    } else {
      return false;
    }
  }
}