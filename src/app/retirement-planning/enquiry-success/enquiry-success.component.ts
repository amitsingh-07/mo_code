import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { NavbarService } from './../../shared/navbar/navbar.service';

@Component({
  selector: 'app-enquiry-success',
  templateUrl: './enquiry-success.component.html',
  styleUrls: ['./enquiry-success.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EnquirySuccessComponent implements OnInit {

  constructor(
    public navbarService: NavbarService,
    private translate: TranslateService,
    private router: Router
  ) {
    this.translate.use('en');
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.redirectTo();
  }

  ngOnInit() {
    this.navbarService.setNavbarMode(8);
  }

  redirectTo() {
    window.open('/', '_self');
  }

}
