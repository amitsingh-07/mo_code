import { Location } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { IPageComponent } from '../../shared/interfaces/page-component.interface';
import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { MyInfoService } from '../../shared/Services/my-info.service';
import { GUIDE_ME_ROUTE_PATHS, GUIDE_ME_ROUTES } from '../guide-me-routes.constants';
import { GuideMeApiService } from '../guide-me.api.service';
import { GuideMeService } from '../guide-me.service';
import { APP_ROUTES } from './../../app-routes.constants';
import { ConfigService, IConfig } from './../../config/config.service';
import { IMyAssets } from './my-assets.interface';
import { SIGN_UP_ROUTE_PATHS } from './../../sign-up/sign-up.routes.constants';

@Component({
  selector: 'app-my-assets',
  templateUrl: './my-assets.component.html',
  styleUrls: ['./my-assets.component.scss']
})
export class MyAssetsComponent implements IPageComponent, OnInit, OnDestroy, AfterViewInit {
  myinfoChangeListener: Subscription;
  pageTitle: string;
  assetsForm: FormGroup;
  assetsFormValues: IMyAssets;
  assetsTotal: any;
  cpfValue: number;
  useMyInfo: boolean;
  cpfFromMyInfo = false;

  constructor(
    private router: Router, public navbarService: NavbarService,
    private modal: NgbModal, private location: Location,
    private myInfoService: MyInfoService,
    public guideMeApiService: GuideMeApiService, private configService: ConfigService,
    private guideMeService: GuideMeService, private translate: TranslateService,
    private route: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = this.translate.instant('MY_ASSETS.TITLE');
      this.setPageTitle(this.pageTitle);
    });

    this.configService.getConfig().subscribe((config: IConfig) => {
      this.useMyInfo = config.useMyInfo;
    });
  }

  ngOnInit() {
    this.navbarService.setNavbarDirectGuided(true);
    this.assetsFormValues = this.guideMeService.getMyAssets();
    this.cpfFromMyInfo = this.assetsFormValues.cpfFromMyInfo;
    this.assetsForm = new FormGroup({
      cash: new FormControl(this.assetsFormValues.cash),
      cpf: new FormControl(this.assetsFormValues.cpf),
      cpfFromMyInfo: new FormControl(this.cpfFromMyInfo),
      homeProperty: new FormControl(this.assetsFormValues.homeProperty),
      investmentProperties: new FormControl(this.assetsFormValues.investmentProperties),
      otherInvestments: new FormControl(this.assetsFormValues.otherInvestments),
      otherAssets: new FormControl(this.assetsFormValues.otherAssets)
    });
    this.myinfoChangeListener = this.myInfoService.changeListener.subscribe((myinfoObj: any) => {
      if (myinfoObj && myinfoObj !== '' && this.myInfoService.checkMyInfoSourcePage()) {
        if (myinfoObj.status && myinfoObj.status === 'SUCCESS' && this.myInfoService.isMyInfoEnabled) {
          this.myInfoService.getMyInfoData().subscribe((data) => {
            if (data && data['objectList']) {
              this.cpfValue = Math.floor(data['objectList'][0].cpfbalances.total);
              this.assetsForm.controls['cpf'].setValue(this.cpfValue);
              this.myInfoService.isMyInfoEnabled = false;
              this.cpfFromMyInfo = true;
              this.assetsForm.controls['cpfFromMyInfo'].setValue(this.cpfFromMyInfo);
              this.setFormTotalValue();
              this.closeMyInfoPopup();
            } else {
              this.closeMyInfoPopup();
            }
          }, (error) => {
            this.closeMyInfoPopup();
          });
        } else {
          this.myInfoService.isMyInfoEnabled = false;
          this.closeMyInfoPopup();
        }
      }
    });

    this.setFormTotalValue();
  }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.myinfoChangeListener) {
      this.myinfoChangeListener.unsubscribe();
    }
  }

  setFormTotalValue() {
    this.assetsTotal = this.guideMeService.additionOfCurrency(this.assetsForm.value);
  }

  closeMyInfoPopup() {
    this.myInfoService.closeFetchPopup();
    this.myInfoService.changeListener.next('');
    if (this.myInfoService.isMyInfoEnabled) {
      this.myInfoService.isMyInfoEnabled = false;
      const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'my-info' });
      ref.componentInstance.errorTitle = this.translate.instant('MYINFO.ERROR_MODAL_DATA.TITLE');
      ref.componentInstance.errorMessage = this.translate.instant('MYINFO.ERROR_MODAL_DATA.DESCRIPTION');
      ref.componentInstance.isMyinfoError = true;
      ref.componentInstance.closeBtn = false;
      ref.result.then(() => {
        this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
      }).catch((e) => {
      });
    }
  }

  /* Onchange Currency Addition */
  @HostListener('input', ['$event'])
  onChange() {
    this.setFormTotalValue();
  }

  save(form: any) {
    Object.keys(form.value).forEach((key) => {
      if (!form.value[key] || isNaN(form.value[key])) {
        form.value[key] = 0;
      }
    });
    this.guideMeService.setMyAssets(form.value);
    return true;
  }

  openModal() {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant('MYINFO.OPEN_MODAL_DATA.TITLE');
    ref.componentInstance.errorMessage = this.translate.instant('MYINFO.OPEN_MODAL_DATA.DESCRIPTION');
    ref.componentInstance.isButtonEnabled = true;
    ref.result.then(() => {
      this.myInfoService.setMyInfoAttributes('cpfbalances');
      this.myInfoService.goToMyInfo();
    }).catch((e) => {
    });

  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  goToNext(form) {
    if (this.save(form)) {
      this.router.navigate([GUIDE_ME_ROUTE_PATHS.LIABILITIES]);
    }
  }
}
