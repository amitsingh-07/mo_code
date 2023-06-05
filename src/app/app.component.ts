import { Location } from '@angular/common';
import { AfterViewInit, Component, HostListener, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { App} from '@capacitor/app';

import { IComponentCanDeactivate } from './changes.guard';
import { ConfigService, IConfig } from './config/config.service';
import { GoogleAnalyticsService } from './shared/analytics/google-analytics.service';
import { AuthenticationService } from './shared/http/auth/authentication.service';
import { TermsModalComponent } from './shared/modal/terms-modal/terms-modal.component';
import { INavbarConfig } from './shared/navbar/config/navbar.config.interface';
import { NavbarConfig } from './shared/navbar/config/presets';
import { NavbarService } from './shared/navbar/navbar.service';
import { RoutingService } from './shared/Services/routing.service';
import { SessionsService } from './shared/Services/sessions/sessions.service';
import { appConstants } from './app.constants';
import { UnsupportedDeviceModalComponent } from './shared/modal/unsupported-device-modal/unsupported-device-modal.component';
import { Util } from './shared/utils/util';
import { environment } from '../environments/environment';
import { CapacitorUtils } from './shared/utils/capacitor.util';
import { MyInfoService } from './shared/Services/my-info.service';
import { Platform } from '@ionic/angular';
import { Capacitor, Plugins } from '@capacitor/core';

declare global {
  interface Window {
      failed:any;
      success:any;
      myinfo:any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements IComponentCanDeactivate, OnInit, AfterViewInit {
  title = 'Money Owl';
  modalRef: NgbModalRef;
  initRoute = false;
  redirect = '';
  navbarMode = null;

  constructor(
    private translate: TranslateService, public navbarService: NavbarService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private modal: NgbModal, public route: Router, public routingService: RoutingService, private location: Location,
    private configService: ConfigService, private authService: AuthenticationService, private sessionsService: SessionsService,
    public activatedRoute: ActivatedRoute, private myInfoService: MyInfoService, private zone: NgZone, private http: HTTP, private platform: Platform) {
    this.translate.setDefaultLang('en');
    this.configService.getConfig().subscribe((config: IConfig) => {
      this.translate.setDefaultLang(config.language);
      this.translate.use(config.language);
      if (config.distribution) {
        if (config.distribution.notice) {
          if (config.distribution.notice.onLoad) {
            this.redirect = config.distribution.notice.fail;
            if (this.location.path().indexOf('/accounts/email-verification') === -1 ||
                this.location.path().indexOf('/accounts/reset-password')
              ) {
              this.openTermsOfConditions();
              }
            }
          }
        }
    });

    this.googleAnalyticsService.initGoogleAnalyticsService();

    // Check NavbarMode
    this.navbarService.currentNavbarMode.subscribe((navbarMode) => {
      this.navbarMode = navbarMode;
    });

    this.translate.get('COMMON').subscribe(() => {
      let ua = navigator.userAgent || navigator.vendor || window["opera"];
      if ((ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1)) {
        this.showFbWarning();
      }
    });
    if (CapacitorUtils.isApp) {
      this.initializeApp();
    }
  }

  ngOnInit() {
    window.myinfo = window.myinfo || {};
    window.myinfo.namespace = window.myinfo.namespace || {};
    window.failed = window.failed || {};
    window.failed.namespace = window.failed.namespace || {};
    window.success = window.success || {};
    window.success.namespace = window.success.namespace || {};
  }

  initializeApp() {
    // Native Android/iOS device specific methods
    // SSL Cert Pinning
    this.platform.ready().then(()=>{
      this.http.setServerTrustMode('pinned').then(() => {
        console.log('[SUCCESS] Cert Pinned !');
      })
      .catch(() => {
        console.log('[ERROR] SSL Pinning Fails!');
      });
    });
    // Capacitor Browser listerner
    App.addListener('appUrlOpen', (event: any) => {
      let listenurl = new URL(event.url);
      if (event.url.startsWith(appConstants.MOBILE_APP_SCHEME) && event.url.includes("error")) {
        Util.closeBrowser();
      } else if (event.url.startsWith(appConstants.MOBILE_APP_SCHEME) && event.url.includes("code") && event.url.includes("state") && event.url.includes("login")) {
        Util.closeBrowser();
        const slug = event.url.replace(appConstants.MOBILE_APP_SCHEME+ appConstants.BASE_HREF, "/");
        this.zone.run(()=>{
          if (slug) {
            this.route.navigateByUrl(slug);
          }
        });
      } else if (event.url.startsWith(appConstants.MOBILE_APP_SCHEME) && event.url.includes("code") && event.url.includes("state") && event.url.includes("myinfo")) {
        Util.closeBrowser();
        const url = new URL(event.url);
        const params = new URLSearchParams(url.search);
        this.myInfoService.mobileMyInfoCheck(params.get("code"));
      } 
    });

    //Android device back navigation restriction
    App.addListener('backButton', () => {
      CapacitorUtils.showToastMessage("Back button is disabled, please use the on-screen navigation.");
    });
  }

  ngAfterViewInit(): void {  
    document.body.addEventListener('click', evt => {
      const anchorEle = evt.target as HTMLAnchorElement;
      let url = anchorEle.getAttribute('href');
      let isRouterLink = anchorEle.getAttribute('ng-reflect-router-link');
      const isDownloadFile = anchorEle.getAttribute('download');
      if (anchorEle.tagName.toLowerCase() === 'a' && url && !isRouterLink && !isDownloadFile && appConstants.RESTRICTED_HYPERLINK_URL_CONTENTS.filter(ele => url.includes(ele)).length === 0) {
        evt.preventDefault();
        let _target = anchorEle.getAttribute('target');
        Util.openExternalUrl(url, _target);
      }
    })
  }

  onActivate(event) {
    (window as any).scroll({
      top: 0, 
      left: 0, 
      behavior: 'instant'
    });   
  }

  openTermsOfConditions() {
    if (localStorage.getItem('onInit') !== 'true') {
      const ref = this.modal.open(TermsModalComponent, { centered: true, windowClass: 'sign-up-terms-modal-dialog', backdrop: 'static'});
      ref.result.then((data) => {
      if (data !== 'proceed') {
        if (this.redirect === '' || this.redirect === undefined) {
          this.navbarService.goBack();
        } else {
          window.location.href = this.redirect;
          }
        } else {
        localStorage.setItem('onInit', 'true');
        }
      });
      }
    }

  checkExit() {
    const matrix = new NavbarConfig();
    let nc: INavbarConfig;
    if (this.navbarMode ? true : false && (this.navbarMode !== 'default')) {
      nc = matrix[this.navbarMode];
    } else {
      nc = matrix['default'] as INavbarConfig;
    }
    if (nc.showExitCheck) {
      return nc.showExitCheck;
    } else {
      return false;
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.checkExit()) {
      if (window.opener) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  doBeforeUnload() {
    // Alert the user window is closing
    // Not to show alert when on login page
    if (this.route.url == '/accounts/login' || CapacitorUtils.isApp) {
      return true;
    } else {
      return false;
    }
  }

  doUnload() {
    // Logged user out of the app
    if (this.authService.isSignedUser()) {
      const browserClose = appConstants.BROWSER_CLOSE;
      this.authService.logout(browserClose).subscribe((data) => {
      });
      this.navbarService.logoutUser();
    }
    this.sessionsService.destroyInstance();
  }

  @HostListener('window:focus', ['$event'])
   onFocus(event: FocusEvent): void {
    const instId = this.sessionsService.getInstance();
    this.sessionsService.setActiveInstance(instId);
   }

   showFbWarning() {
    const ref = this.modal.open(UnsupportedDeviceModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('FACEBOOK_IN_APP_BROWSER_WARNING.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant('FACEBOOK_IN_APP_BROWSER_WARNING.DESC');
  }
}
