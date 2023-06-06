import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { Observable } from 'rxjs/internal/Observable';

import { AuthenticationService } from '../shared/http/auth/authentication.service';
import { SIGN_UP_ROUTE_PATHS } from './sign-up.routes.constants';
import { SIGN_UP_CONFIG } from './sign-up.constant';
import { AppService } from '../app.service';
import { LoginService } from './login.service';
import { LoaderService } from '../shared/components/loader/loader.service';
import { SingpassService } from '../singpass/singpass.service';
import { NavbarService } from '../shared/navbar/navbar.service';
import { CapacitorUtils } from '../shared/utils/capacitor.util';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(private route: Router,
    private authService: AuthenticationService,
    private appService: AppService
  ) {
  }
  canActivate(): boolean {
    if (!this.authService.isSignedUser()) {
      if (this.appService.getCorporateDetails() && this.appService.getCorporateDetails().organisationEnabled) {
        this.route.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN], { queryParams: { orgID: this.appService.getCorporateDetails().uuid } });
      } else {
        this.route.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
      }
      return false;
    }
    return true;
  }
}
@Injectable({
  providedIn: 'root'
})
export class InvestmentAuthGuardService implements CanActivate {
  constructor(private route: Router,
    private authService: AuthenticationService,
    private appService: AppService
  ) {
  }
  canActivate(): boolean {
    if (!this.authService.isSignedUser()) {
      if (this.appService.getCorporateDetails() && this.appService.getCorporateDetails().organisationEnabled) {
        this.route.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN], { queryParams: { orgID: this.appService.getCorporateDetails().uuid } });
      } else {
        this.route.navigate([SIGN_UP_ROUTE_PATHS.CREATE_ACCOUNT_MY_INFO]);
      }
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})

// tslint:disable-next-line:max-classes-per-file
export class LoggedUserService implements CanActivate {
  constructor(private route: Router,
    private authService: AuthenticationService
  ) {
  }
  canActivate(): boolean {
    if (this.authService.isSignedUser()) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})

// tslint:disable-next-line:max-classes-per-file
export class FinlitLoggedUserService implements CanActivate {
  constructor(private route: Router,
    private authService: AuthenticationService
  ) {
  }
  canActivate(): boolean {
    if (!SIGN_UP_CONFIG.LOGIN.FINLIT_LOGIN) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
      return false;
    } else if (this.authService.isSignedUser()) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})

// tslint:disable-next-line:max-classes-per-file
export class FacebookLoggedUserService implements CanActivate {
  constructor(private route: Router,
    private authService: AuthenticationService,
    private appService: AppService
  ) {
  }
  canActivate(): boolean {
    if (!SIGN_UP_CONFIG.LOGIN.CORPORATE_LOGIN) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN], { queryParams: { orgID: this.appService.getCorporateDetails().uuid } });
      return false;
    }
    this.authService.isUserTypeCorporate = true;
    this.authService.displayCorporateLogo$.next(true);
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})

// tslint:disable-next-line:max-classes-per-file
export class SingpassLoginGuard implements CanActivate {
  constructor(private route: Router,
    private authService: AuthenticationService,
    private loginService: LoginService,
    private loaderService: LoaderService,
    private singpassService: SingpassService,
    private appService: AppService
  ) {
  }
  canActivate(activatedRoute: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const queryParams = activatedRoute.queryParams;
    this.loginService.setEnquiryIdAndJourneyType();
    if (queryParams['code'] && queryParams['state']) {
      this.loaderService.showLoader({ title: 'Logging in' });
       return this.singpassService.loginSingpass(queryParams['code'], queryParams['state'], this.loginService.enqId, this.loginService.journeyType, this.appService.getCorpBizData()?.enrollmentId).pipe(map((data) => {
        if (data.responseMessage.responseCode >= 6000 && data.objectList[0] && data.objectList[0].securityToken) {
          this.authService.saveAuthDetails(data.objectList[0]);
          this.authService.checkAndSetFlag(data);
          this.loginService.onSuccessLogin(data);
          return false;
        } else {
          this.loaderService.hideLoader;
          this.route.navigate([SIGN_UP_ROUTE_PATHS.LOGIN], { queryParams: { 'code': null, 'state': null, }, queryParamsHandling: 'merge' });
          this.loginService.displaySingpassLoginError(data);
          return false;
        }
      }, (err) => {
        this.loaderService.hideLoader;
        return true;
      }));
    } else {
      if (this.authService.isSignedUser()) {
        this.route.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
        return false;
      }
      return true;
    }
  }
}

@Injectable({
  providedIn: 'root'
})

// tslint:disable-next-line:max-classes-per-file
export class MobileAppUpgradeGuard implements CanActivate {
  constructor(private router: Router,
    private configService: ConfigService
  ) {   }
  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (CapacitorUtils.isApp) {
      if (await this.configService.checkMobAppInMaintenance()) {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.MAINTENANCE_PAGE]);
        return false;
      } else if (await this.configService.checkMobAppVersionHigher()) {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.FORCED_UPDATE]);
        return false;
      }
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})

// tslint:disable-next-line:max-classes-per-file
export class CorpbizAuthGuardService implements CanActivate {
  constructor(private route: Router,
    private authService: AuthenticationService,
    private appService: AppService
  ) {
  }
  canActivate(): boolean {
    if(!this.appService.getCorpBizData()) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.CORP_BIZ_ACTIVATIONLINK]);
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})

export class CorpbizWelcomeFlowAuthGuardService implements CanActivate {
  constructor(private route: Router,
    private authService: AuthenticationService,
    private appService: AppService,
    private navbarService: NavbarService,
    private router: Router
  ) {
  }
  canActivate(): boolean {
    if (!this.authService.isSignedUser()) {
      if (this.appService.getCorporateDetails() && this.appService.getCorporateDetails().organisationEnabled) {
        this.route.navigate([SIGN_UP_ROUTE_PATHS.CORPORATE_LOGIN], { queryParams: { orgID: this.appService.getCorporateDetails().uuid } });
      } else {
        this.route.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
      }
      return false;
    }
    if (this.navbarService.welcomeJourneyCompleted || this.navbarService.upgradeScreenShown) {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      return false;
    }
    return true;
  }
}