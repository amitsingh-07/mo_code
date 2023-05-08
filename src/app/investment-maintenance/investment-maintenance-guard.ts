
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { ConfigService, IConfig } from '../config/config.service';
import { Util } from '../shared/utils/util';

@Injectable()
export class InvestmentMaintenanceGuard implements CanActivate {
  constructor(private configService: ConfigService, private router: Router) { }

  async canActivate():Promise<boolean> {
    // Check if iFast is in maintenance
    if (await this.configService.checkIFastUnderMaintenance()) {
      return true;
    } else {
      Util.openExternalUrl('/', '_self');
      return false;
    }
  }
}
