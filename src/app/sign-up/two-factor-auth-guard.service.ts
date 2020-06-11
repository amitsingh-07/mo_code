import { Injectable } from '@angular/core';
import { CanActivate, GuardsCheckEnd, Router } from '@angular/router';

import { filter } from 'rxjs/operators';

import { AppService } from '../app.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';
import { SIGN_UP_ROUTE_PATHS } from './sign-up.routes.constants';
import { SignUpService } from './sign-up.service';

@Injectable({
  providedIn: 'root'
})
export class TwoFactorAuthGuardService implements CanActivate {
  constructor(private route: Router,
              private appService: AppService,
              private authService: AuthenticationService,
              private signUpService: SignUpService,
  ) {
  }
  canActivate(): boolean {
    this.appService.setJourneyType('');
    let redirectUrl = null;
    this.route.events.pipe(
      filter(event => event instanceof GuardsCheckEnd)
    )
      .subscribe((e: GuardsCheckEnd) => {
        if (redirectUrl == null) {
          redirectUrl = e.url;
          this.signUpService.setRedirectUrl(e.url);
        }
      });
    this.signUpService.setRedirectUrl(redirectUrl);
    // Is Signed Users and is 2FA verified
    if (this.authService.isSignedUser() && this.authService.is2FAVerified()) {
      this.authService.setFromJourney(SIGN_UP_ROUTE_PATHS.EDIT_PROFILE, false);
      return true;
    } else if (!this.authService.isSignedUser()) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
      return false;
    } else {
      // Is anything else
      this.authService.send2faRequest().subscribe((response) => {
        // console.log('2fa created on BE:', response);
      });
      this.signUpService.setRedirectUrl(redirectUrl);
      this.authService.setFromJourney(SIGN_UP_ROUTE_PATHS.EDIT_PROFILE, true);
      this.route.navigate([SIGN_UP_ROUTE_PATHS.VERIFY_2FA]);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})

// tslint:disable-next-line:max-classes-per-file
export class TwoFactorScreenGuardService implements CanActivate {
  constructor(private route: Router,
              private authService: AuthenticationService
  ) {
  }
  canActivate(): boolean {
    if (!this.authService.getFromJourney(SIGN_UP_ROUTE_PATHS.EDIT_PROFILE)) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.EDIT_PROFILE]);
      return false;
    }
    return true;
  }
}