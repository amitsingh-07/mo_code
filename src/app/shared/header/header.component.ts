
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IPageComponent } from '../interfaces/page-component.interface';
import { NavbarService } from './../navbar/navbar.service';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements IPageComponent, OnInit, AfterViewInit {

  pageTitle: string;
  subTitle = '';
  helpIcon = false;
  // helpIcon: boolean;
  showOverallHeader = true;
  showHeader = true;
  showHeaderDropshadow = true;
  closeIcon = false;
  settingsIcon = false;
  dropDownIcon = false;

  constructor(public navbarService: NavbarService, public headerService: HeaderService,
    private router: Router) { }

  ngOnInit() {
    this.headerService.currentPageTitle.subscribe((title) => this.pageTitle = title);
    this.headerService.currentPageSubTitle.subscribe((subTitle) => this.subTitle = subTitle);
    this.headerService.currentPageHelpIcon.subscribe((helpIcon) => this.helpIcon = helpIcon);
    this.headerService.currentPageDropDownIcon.subscribe((dropDownIcon) => this.dropDownIcon = dropDownIcon);
    this.headerService.currentPageProdInfoIcon.subscribe((closeIcon) => this.closeIcon = closeIcon);
    this.headerService.currentPageSettingsIcon.subscribe((settingsIcon) => this.settingsIcon = settingsIcon);
  }

  ngAfterViewInit() {
    this.headerService.currentHeaderOverallVisibility.subscribe((showOverallHeader) => this.showOverallHeader = showOverallHeader);
    this.headerService.currentHeaderVisibility.subscribe((showHeader) => this.showHeader = showHeader);
    this.headerService.currentHeaderDropshadow.subscribe((showHeaderDropshadow) => {
      this.showHeaderDropshadow = showHeaderDropshadow;
    });
  }

  setPageTitle(title: string, subTitle?: string, helpIcon?: boolean, settingsIcon?: boolean, dropDownIcon?: boolean) {
    this.headerService.setPageTitle(title, this.subTitle, this.helpIcon, this.settingsIcon, this.dropDownIcon);
  }

  hideHeader() {
    this.headerService.setHeaderVisibility(false);
  }

  showMobilePopUp() {
    this.headerService.showMobilePopUp(this.pageTitle);
  }

  hideProdInfo() {
    this.headerService.setProdButtonVisibility(false);
  }

  goBack() {
    this.navbarService.goBack();
  }
}
