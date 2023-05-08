
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivateChild, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { appConstants } from '../../app.constants';
import { ConfigService, IConfig } from '../../config/config.service';
import { APP_ROUTES } from './../../app-routes.constants';

@Injectable()
export class InvestmentChildEnableGuard implements CanActivateChild {
  constructor(private configService: ConfigService, private router: Router) { }

  async canActivateChild(): Promise<boolean> {
    const config = await this.configService.getConfig().toPromise();
    if (await this.configService.checkIFastUnderMaintenance()) {
      this.router.navigate([APP_ROUTES.INVEST_MAINTENANCE]);
      return false;
    } else if (config.investmentEngagementEnabled) {
      return true;
    } else {
      this.router.navigate([appConstants.homePageUrl]);
      return false;
    }
  }
}
