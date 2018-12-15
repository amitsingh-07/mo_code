import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { InvestmentAccountService } from '../investment-account/investment-account-service';
import { MyInfoService } from '../shared/Services/my-info.service';

import { GuideMeService } from '../guide-me/guide-me.service';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../investment-account/investment-account-routes.constants';

@Component({
  selector: 'app-call-back',
  templateUrl: './call-back.component.html',
  styleUrls: ['./call-back.component.scss']
})
export class CallBackComponent implements OnInit {

  data: any;
  constructor(
    private router: Router, private route: ActivatedRoute, private modal: NgbModal,
    private myInfoService: MyInfoService,
    private investmentAccountService: InvestmentAccountService,
    private guideMeService: GuideMeService) { }

  ngOnInit() {
    // Robo2 changes
    // if (window.sessionStorage.currentUrl && this.route.queryParams['value'] && this.route.queryParams['value']['code']) {
    if (this.route.queryParams['value'] && this.route.queryParams['value']['code']) {
      if (this.myInfoService.myInfoValue) {
        this.myInfoService.isMyInfoEnabled = false;
      } else {
        this.myInfoService.openFetchPopup();
        this.myInfoService.isMyInfoEnabled = true;
        this.data = this.route.queryParams['value'];
        this.myInfoService.setMyInfoValue(this.data.code);

        // Investment account
        if (this.investmentAccountService.getCallBackInvestmentAccount()) {
          this.myInfoService.getMyInfoData().subscribe((data) => {
            this.investmentAccountService.setMyInfoFormData(data.objectList[0]);
            this.myInfoService.isMyInfoEnabled = false;
            this.myInfoService.closeMyInfoPopup(false);
            this.router.navigate([INVESTMENT_ACCOUNT_ROUTE_PATHS.SELECT_NATIONALITY]);
          }, (error) => {
            this.myInfoService.closeMyInfoPopup(true);
            this.router.navigate([window.sessionStorage.getItem('currentUrl').substring(2)]);
          });
        } else {
          this.router.navigate([window.sessionStorage.getItem('currentUrl').substring(2)]);
        }
      }
    } else {
      this.router.navigate(['home']);
    }
  }
}
