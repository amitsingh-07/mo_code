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

  private readConfig() {
    return this.http.get<IConfig>(this.configUrl).pipe(
      catchError(this.handleError) // handle the error
    );
  }

  /**
   * Gets mobile app(Android & IOS) released version and maintenance info 
   * Gets iFast maintenance info(Web & Mobile app)
   * from s3 appConfig file
   */
  getAppConfig() {
    this.s3BucketCacheControl = Date.now();
    return fetch(`${this.s3ConfigUrl}?time=${this.s3BucketCacheControl}`).then(response => response.json());
  }

  /** 
   * Web & Mob app - checking iFast is under maintenance
   */
  async checkIFastUnderMaintenance() {
    const config = await this.getAppConfig();
    const isIFastUnderMaintenance = config.iFast.showMaintenancePage && this.checkIFastStatus(config.iFast.maintenanceStartTime, config.iFast.maintenanceEndTime);
    return isIFastUnderMaintenance;
  }

  async checkMobAppInMaintenance() {
    const configInfo = await this.getAppConfig();
    return configInfo.showMOMaintenancePage;
  }

  async checkMobAppVersionHigher() {
    const configInfo = await this.getAppConfig();
    const localMobileAppInfo = await App.getInfo();
    const platform = CapacitorUtils.isApp && CapacitorUtils.isAndroidDevice ? ANDROID_DEVICE : IOS_DEVICE;
    var localAppVersion = localMobileAppInfo.version.split('.').map(ele => parseInt(ele));
    var configVersion = configInfo[platform].version.split('.').map(ele => parseInt(ele));
    if (localAppVersion.length === 2) {
      localAppVersion.push(0);
    }
    if (configVersion.length === 2) {
      configVersion.push(0);
    }
    const isHigherVersionAvailable = localAppVersion.some((ele, index) => {
      return localAppVersion[index] < configVersion[index];
    })
    const isHigherBuildAvailable = parseInt(localMobileAppInfo.build) < parseInt(configInfo[platform].build);
    return isHigherVersionAvailable || isHigherBuildAvailable;
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