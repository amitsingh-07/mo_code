import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FooterService } from '../../shared/footer/footer.service';
import { NavbarService } from '../../shared/navbar/navbar.service';

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
    this.navbarService.hideNavbar$.next(true);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.navbarService.hideNavbar$.next(false);
  }
}
