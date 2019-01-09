import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { SIGN_UP_ROUTE_PATHS } from './sign-up.routes.constants';
import { SignUpService } from './sign-up.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(private signUpService: SignUpService,
              private route: Router,
              private authService: AuthenticationService
  ) {
  }
  canActivate(): boolean {
    const userInfo = this.signUpService.getUserProfileInfo();
    if (!this.authService.isAuthenticated()) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
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
  constructor(private signUpService: SignUpService,
              private route: Router,
              private authService: AuthenticationService
  ) {
  }
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      this.route.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      return false;
    }
    return true;
  }
}
