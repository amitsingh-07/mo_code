import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FooterService } from '../shared/footer/footer.service';
import { NavbarService } from './../shared/navbar/navbar.service';

@Component({
  selector: 'app-investment-maintenance',
  templateUrl: './investment-maintenance.component.html',
  styleUrls: ['./investment-maintenance.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class InvestmentMaintenanceComponent implements OnInit {

  constructor(public navbarService: NavbarService, private footerService: FooterService) { }

  ngOnInit() {
    this.navbarService.setNavbarMode(11);
    this.navbarService.setNavbarMobileVisibility(false);
    this.footerService.setFooterVisibility(false);
  }
}
