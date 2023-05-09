import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FooterService } from 'src/app/shared/footer/footer.service';
import { NavbarService } from 'src/app/shared/navbar/navbar.service';

@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MaintenancePageComponent implements OnInit {
  subscription : Subscription;

  constructor(
    private footerService: FooterService,
    private navbarService: NavbarService,
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.translate.use('en');
    this.navbarService.setNavbarMode(106);
    this.footerService.setFooterVisibility(false);
    // To prevent browser back button
    this.subscription = this.navbarService.preventBackButton().subscribe();
    // To remove navbar in mobile view for coprbiz upgrade screen
    this.navbarService.displayingWelcomeFlowContent$.next(true);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.navbarService.displayingWelcomeFlowContent$.next(false);
  }
  
}
