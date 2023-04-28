import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { IProductCategory } from '../direct/product-info/product-category/product-category';
import { HospitalPlan } from '../guide-me/hospital-plan/hospital-plan';
import { ANDROID_DEVICE, CapacitorUtils, IOS_DEVICE } from '../shared/utils/capacitor.util';
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
  s3BucketCacheControl = Date.now();

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
    return fetch(`${this.s3ConfigUrl}?time=${this.s3BucketCacheControl}`).then(response => response.json());
  }

  async checkMobAppInMaintenance() {
    const configInfo = await this.getMobileAppInfoConfig();
    return configInfo.showMOMaintenancePage;
  }

  async checkMobAppVersionHigher() {
    const configInfo = await this.getMobileAppInfoConfig();
    const localMobileAppInfo = await App.getInfo();
    if (CapacitorUtils.isAndroidDevice && (localMobileAppInfo.version < configInfo[ANDROID_DEVICE].version || localMobileAppInfo.build < configInfo[ANDROID_DEVICE].build)) {
      return true;
    } else if (CapacitorUtils.isIOSDevice && localMobileAppInfo.version < configInfo[IOS_DEVICE].version || localMobileAppInfo.build < configInfo[IOS_DEVICE].build) {      
      return true;
    }
    return false;
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