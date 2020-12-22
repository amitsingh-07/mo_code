
import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { appConstants } from 'src/app/app.constants';

import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { ValidateRange } from '../create-account/range.validator';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_ROUTE_PATHS } from '../sign-up.routes.constants';
import { SignUpService } from '../sign-up.service';
import { FooterService } from './../../shared/footer/footer.service';

@Component({
  selector: 'app-success-message',
  templateUrl: './success-message.component.html',
  styleUrls: ['./success-message.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SuccessMessageComponent implements OnInit {
  buttonTitle;
  message;
  redirectTo;
  queryParams;

  constructor(
    // tslint:disable-next-line
    private formBuilder: FormBuilder,
    private modal: NgbModal,
    public navbarService: NavbarService,
    public footerService: FooterService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private translate: TranslateService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarDirectGuided(false);
    this.footerService.setFooterVisibility(false);
    this.queryParams = this.route.snapshot.queryParams;
  }
  redirectToLogin() {
    const userType = (this.signUpService.getEmailandFinlit().userType);
    if (userType === appConstants.USERTYPE.NORMAL) {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.LOGIN]);
    } else {
      this.router.navigate([SIGN_UP_ROUTE_PATHS.FINLIT_LOGIN]);
    }
  }
}
