import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FooterService } from '../../shared/footer/footer.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { CapacitorUtils } from '../../shared/utils/capacitor.util';
import { appConstants } from '../../app.constants';

@Component({
  selector: 'app-forced-update',
  templateUrl: './forced-update.component.html',
  styleUrls: ['./forced-update.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForcedUpdateComponent implements OnInit {
  subscription : Subscription;
  constructor(
    
    private footerService: FooterService,
    private navbarService: NavbarService,
    private readonly translate: TranslateService
  ) {
    this.translate.use('en');
   }

  ngOnInit(): void {
    this.navbarService.setNavbarMode(106);
    this.footerService.setFooterVisibility(false);
    // To prevent browser back button
    this.subscription = this.navbarService.preventBackButton().subscribe();
    // To remove navbar in mobile view for coprbiz upgrade screen
    this.navbarService.displayingWelcomeFlowContent$.next(true);
  }

  openLinkDirectOnStore() {
    let url = appConstants.PLAY_STORE_URL;
    if (CapacitorUtils.isIOSDevice) {
      url = appConstants.APP_STORE_URL;
    }
    window.open(url);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.navbarService.displayingWelcomeFlowContent$.next(false);
  }
}
