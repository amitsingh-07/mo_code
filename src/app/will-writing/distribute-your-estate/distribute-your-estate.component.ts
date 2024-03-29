import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FooterService } from '../../shared/footer/footer.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { WILL_WRITING_ROUTE_PATHS } from '../will-writing-routes.constants';

@Component({
  selector: 'app-distribute-your-estate',
  templateUrl: './distribute-your-estate.component.html',
  styleUrls: ['./distribute-your-estate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DistributeYourEstateComponent implements OnInit {

  constructor(private translate: TranslateService, private router: Router,
              public footerService: FooterService,
              public navbarService: NavbarService) {
    this.translate.use('en');
  }

  ngOnInit() {
    this.navbarService.setNavbarMode(4);
    this.footerService.setFooterVisibility(false);
  }
  goToNext() {
    this.router.navigate([WILL_WRITING_ROUTE_PATHS.MY_BENEFICIARIES]);
  }
  goBack() {
    this.navbarService.goBack();
  }
}
