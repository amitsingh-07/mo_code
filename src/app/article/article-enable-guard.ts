import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { appConstants } from '../app.constants';
import { ConfigService, IConfig } from '../config/config.service';

@Injectable()
export class ArticleEnableGuard implements CanActivate {
  isArticleEnabled = false;
  constructor(private configService: ConfigService, private router: Router) {
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.isArticleEnabled = config.articleEnabled;
    });
  }
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.isArticleEnabled) {
      return true;
    } else {
      this.router.navigate([appConstants.homePageUrl]);
      return false;
    }
  }
}
