import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { FooterService } from '../../shared/footer/footer.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SIGN_UP_ROUTE_PATHS } from '../../sign-up/sign-up.routes.constants';
import { WillWritingApiService } from '../will-writing.api.service';
import { FileUtil } from '../../shared/utils/file.util';
import { CapacitorUtils } from '../../shared/utils/capacitor.util';

@Component({
  selector: 'app-validate-your-will',
  templateUrl: './validate-your-will.component.html',
  styleUrls: ['./validate-your-will.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ValidateYourWillComponent implements OnInit, OnDestroy {
  pageTitle: string;
  constructor(
    private translate: TranslateService,
    public footerService: FooterService,
    private router: Router,
    public navbarService: NavbarService,
    private willWritingApiService: WillWritingApiService,
    private fileUtil: FileUtil) {
    this.translate.use('en');
    this.pageTitle = this.translate.instant('WILL_WRITING.VALIDATE_YOUR_WILL.TITLE');
    this.setPageTitle(this.pageTitle);
  }

  ngOnInit() {
    this.navbarService.setNavbarDirectGuided(true);
    this.navbarService.setNavbarMode(4);
    this.footerService.setFooterVisibility(false);
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  editWill() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
  }

  ngOnDestroy() {
    this.navbarService.unsubscribeBackPress();
  }

  downloadWill() {
    let newWindow;
    if(CapacitorUtils.isIosWeb) {
      newWindow = window.open();
    }
    this.willWritingApiService.downloadWill().subscribe((data: any) => {
      this.fileUtil.downloadPDF(data, newWindow, this.translate.instant('WILL_WRITING.VALIDATE_YOUR_WILL.WILLS_PDF_NAME'));
    }, (error) => console.log(error));
  }
}
