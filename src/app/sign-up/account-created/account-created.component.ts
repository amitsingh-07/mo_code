import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WillWritingApiService } from 'src/app/will-writing/will-writing.api.service';
import { WillWritingService } from 'src/app/will-writing/will-writing.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { APP_JWT_TOKEN_KEY } from '../../shared/http/auth/authentication.service';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { SignUpService } from '../sign-up.service';
import { ConfigService, IConfig } from './../../config/config.service';
import { GoogleAnalyticsService } from './../../shared/ga/google-analytics.service';
import { SIGN_UP_ROUTE_PATHS } from './../sign-up.routes.constants';

@Component({
  selector: 'app-account-created',
  templateUrl: './account-created.component.html',
  styleUrls: ['./account-created.component.scss']
})
export class AccountCreatedComponent implements OnInit {

  willWritingEnabled = false;
  duplicateError: string;

  constructor(
    private translate: TranslateService,
    private modal: NgbModal,
    private googleAnalyticsService: GoogleAnalyticsService,
    private willWritingApiService: WillWritingApiService,
    private willWritingService: WillWritingService,
    private signUpService: SignUpService, private configService: ConfigService,
    private router: Router) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
    this.duplicateError = this.translate.instant('COMMON.DUPLICATE_ERROR');
    });
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.willWritingEnabled = config.willWritingEnabled;
    });
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.googleAnalyticsService.emitEvent('Sign-Up', 'Sign-Up', 'Success');
    if (this.willWritingEnabled && this.willWritingService.getWillWritingFormData().enquiryId
      && !this.willWritingService.getIsWillCreated()) {
      this.willWritingApiService.createWill(this.signUpService.getCustomerRef()).subscribe((data) => {
        if (data.responseMessage && data.responseMessage.responseCode >= 6000) {
          this.willWritingService.setIsWillCreated(true);
        } else if (data.responseMessage && data.responseMessage.responseCode === 5006) {
          const ref = this.modal.open(ErrorModalComponent, { centered: true });
          ref.componentInstance.errorTitle = '';
          ref.componentInstance.errorMessage = this.duplicateError;
        }
      });
      sessionStorage.removeItem(APP_JWT_TOKEN_KEY);
      this.signUpService.clearData();
    }
  }

  /**
   * redirect to login page.
   */
  redirectToLogin() {
    this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
  }

}
