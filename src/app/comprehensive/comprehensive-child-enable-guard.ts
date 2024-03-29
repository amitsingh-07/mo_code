import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { appConstants } from '../app.constants';
import { AppService } from '../app.service';
import { ConfigService, IConfig } from '../config/config.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';
import { ProgressTrackerUtil } from '../shared/modal/progress-tracker/progress-tracker-util';
import { SignUpService } from '../sign-up/sign-up.service';
import { LoaderService } from './../shared/components/loader/loader.service';
import { SIGN_UP_ROUTE_PATHS } from './../sign-up/sign-up.routes.constants';
import { ComprehensiveApiService } from './comprehensive-api.service';
import { COMPREHENSIVE_BASE_ROUTE } from './comprehensive-routes.constants';
import { ComprehensiveService } from './comprehensive.service';

@Injectable()
export class ComprehensiveChildEnableGuard implements CanActivateChild {
  constructor(
    private configService: ConfigService, private router: Router,
    private authService: AuthenticationService, private appService: AppService,
    private signUpService: SignUpService, private cmpService: ComprehensiveService,
    private loaderService: LoaderService, private cmpApiService: ComprehensiveApiService) { }
  // tslint:disable-next-line:cognitive-complexity
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.configService.getConfig().pipe(map((config: IConfig) => {
      if (config && !config.comprehensiveEnabled) {
        this.router.navigate([appConstants.homePageUrl]);
        return false;
      } else {
        if (ProgressTrackerUtil.compare(state.url, COMPREHENSIVE_BASE_ROUTE)) {
          this.signUpService.clearRedirectUrl();
          return true;
        } else if (!this.authService.isSignedUser()) {
          this.appService.setJourneyType(appConstants.JOURNEY_TYPE_COMPREHENSIVE);
          this.signUpService.setRedirectUrl(state.url);
          if (this.appService.getCorporateDetails() && this.appService.getCorporateDetails().organisationEnabled) {
            this.router.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN], { queryParams: {orgID: this.appService.getCorporateDetails().uuid}});
          } else {
            this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
          }
          return false;
        } else if (!this.cmpService.getComprehensiveSummary().comprehensiveEnquiry
          || !this.cmpService.getComprehensiveSummary().comprehensiveEnquiry.enquiryId) {
          this.appService.setJourneyType(appConstants.JOURNEY_TYPE_COMPREHENSIVE);
          this.loaderService.showLoader({ title: 'Loading' });
          this.cmpApiService.getComprehensiveSummary().pipe(map((data) => {
            this.cmpService.setComprehensiveSummary(data.objectList[0]);
            return this.canAccessUrl(state.url);
          }));
        } else {
          return this.canAccessUrl(state.url);
        }
      }
    }));
  }
  canAccessUrl(url: string): boolean {
    const accessibleUrl = this.cmpService.getAccessibleUrl(url);
    if (!ProgressTrackerUtil.compare(accessibleUrl, url)) {
      this.router.navigate([accessibleUrl]);
      return false;
    } else {
      return true;
    }
  }
}
