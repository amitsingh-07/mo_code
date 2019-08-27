import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { appConstants } from '../../app.constants';
import { ConfigService, IConfig } from '../../config/config.service';

@Injectable()
export class InvestmentChildEnableGuard implements CanActivateChild {
  isInvestmentEngagementEnabled = false;
  constructor(private configService: ConfigService, private router: Router) {
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.isInvestmentEngagementEnabled = config.investmentEngagementEnabled;
    });
  }
  canActivateChild(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.isInvestmentEngagementEnabled) {
      return true;
    } else {
      this.router.navigate([appConstants.homePageUrl]);
      return false;
    }
  }
}