import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ComprehensiveApiService } from '../../comprehensive/comprehensive-api.service';
import { ComprehensiveService } from '../../comprehensive/comprehensive.service';
import { FileUtil } from '../../shared/utils/file.util';
import { COMPREHENSIVE_CONST } from '../../comprehensive/comprehensive-config.constants';
import { FooterService } from '../../shared/footer/footer.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { SIGN_UP_ROUTE_PATHS } from '../../sign-up/sign-up.routes.constants';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { ModelWithButtonComponent } from '../../shared/modal/model-with-button/model-with-button.component';
import { CapacitorUtils } from '../../shared/utils/capacitor.util';

@Component({
  selector: 'app-download-report',
  templateUrl: './download-report.component.html',
  styleUrls: ['./download-report.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DownloadReportComponent implements OnInit {
  getComprehensiveSummaryDashboardInfo: any;
  getCurrentVersionType = COMPREHENSIVE_CONST.VERSION_TYPE.FULL;
  showDownloadReport = true;
  subscription: Subscription;

  constructor(private readonly translate: TranslateService,
              private comprehensiveService: ComprehensiveService,
              private downloadfile: FileUtil,
              private comprehensiveApiService: ComprehensiveApiService,
              private footerService: FooterService,
              private navbarService: NavbarService,
              private router: Router,
              private loaderService: LoaderService,
              private modal: NgbModal
              ) {
                this.translate.use('en');
              }

  ngOnInit(): void {
    this.navbarService.setNavbarMode(106);
    this.footerService.setFooterVisibility(false);
    this.subscription = this.navbarService.preventBackButton().subscribe();
  }

  getComprehensiveSummaryDashboard() {
    this.comprehensiveApiService.getComprehensiveSummaryDashboard().subscribe((dashboardData: any) => {
      if (dashboardData && dashboardData.objectList[0]) {
        this.getComprehensiveSummaryDashboardInfo = this.comprehensiveService.filterDataByInput(dashboardData.objectList, 'type', this.getCurrentVersionType);
      }
    });
  }

  showLoader() {
    this.loaderService.showLoader({
      title: this.translate.instant('LOADER_MESSAGES.LOADING.TITLE'),
      desc: this.translate.instant('LOADER_MESSAGES.LOADING.MESSAGE'),
      autoHide: false
    });
  }

  downloadComprehensiveReport() {
    const payload = { 
      reportId: this.comprehensiveService.welcomeFlowMyInfoData.reportId, 
      enquiryId: this.comprehensiveService.welcomeFlowMyInfoData.enquiryId 
    };
    this.showLoader();
    let newWindow;
    if(CapacitorUtils.isIosWeb) {
      newWindow = window.open();
    }
    this.comprehensiveApiService.downloadComprehensiveReport(payload).subscribe((data: any) => {
      this.loaderService.hideLoaderForced();
      if (data && data["objectList"][0]) {
        this.downloadfile.downloadPDF(data["objectList"][0], newWindow, COMPREHENSIVE_CONST.REPORT_PDF_NAME);
      }
    }, (error) => {
      this.loaderService.hideLoaderForced();
    });
  }

  redirectToDashboard() {
    this.navbarService.welcomeJourneyCompleted = true;
    this.navbarService.displayingWelcomeFlowContent$.next(false);
    this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openAssumptionsModal(){
    const ref = this.modal.open(ModelWithButtonComponent, {
      centered: true,
      windowClass: "assumptions-modal",
    });
    ref.componentInstance.errorTitle = this.translate.instant(
      "DOWNLOAD_REPORT.ASSUMPTIONS_MODAL.TITLE"
    );
    ref.componentInstance.errorMessageHTML = this.translate.instant(
      "DOWNLOAD_REPORT.ASSUMPTIONS_MODAL.DESC"
    );
  }
}
