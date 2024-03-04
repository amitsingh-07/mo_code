import { Location } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { ErrorModalComponent } from '../../shared/modal/error-modal/error-modal.component';
import { WillWritingService } from '../will-writing.service';
import { NavbarService } from '../../shared/navbar/navbar.service';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PageTitleComponent implements OnInit {
  @Input() pageTitle: any;
  @Input() step: any;
  @Input() tooltip: any;
  @Input() unsaved: boolean;
  @Output() yesTgr: EventEmitter<any> = new EventEmitter();
  unsavedMsg: string;

  constructor(
    private _location: Location,
    private modal: NgbModal,
    private translate: TranslateService,
    private router: Router,
    private willWritingService: WillWritingService,
    private navbarService: NavbarService
  ) {
    this.translate.get('COMMON').subscribe((result: string) => {
      this.unsavedMsg = this.translate.instant('WILL_WRITING.COMMON.UNSAVED');
    });
  }

  ngOnInit() {
  }

  goBack(url?: string) {
    if (this.unsaved) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      ref.componentInstance.errorTitle = this.unsavedMsg;
      ref.componentInstance.unSaved = true;
      ref.result.then((data) => {
        if (data === 'yes') {
          this.willWritingService.yesTrigger('yes');
          this.yesTrigger('yes');
          if (url) {
            console.log(url);
            this.router.navigate([url]);
          } else {
            console.log('On Navigation');
            this.navbarService.goBack();
          }
        }
      });
    } else {
      console.log("on Navigation 2");
      this.navbarService.goBack();
    }
    return false;
  }

  yesTrigger(yes: String){
    this.yesTgr.emit('yes');
  }

  openToolTipModal() {
    const title = this.tooltip['title'];
    const message = this.tooltip['message'];
    this.willWritingService.openToolTipModal(title, message);
  }
}
