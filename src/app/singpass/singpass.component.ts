import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/internal/Observable';

import { SingpassService } from './singpass.service';
import { SingpassModalComponent } from './singpass-modal/singpass-modal.component';
import { AppService } from '../app.service';

@Component({
  selector: 'app-singpass',
  templateUrl: './singpass.component.html',
  styleUrls: ['./singpass.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SingPassComponent implements OnInit {
  @Input() showSingpassLogin: boolean;
  loginUrl: Observable<any>;
  
  constructor(
    public translate: TranslateService,
    private modal: NgbModal,
    private singpassService: SingpassService,
    public appService: AppService) {
    this.translate.use('en');
  }

  ngOnInit() {
    this.singpassService.getStateNonce();
  }

  openSingpassModal(event) {
    const ref = this.modal.open(SingpassModalComponent, { centered: true,  windowClass: 'open-singpass-modal'});
    ref.componentInstance.title = this.translate.instant('LOGIN.SINGPASS_ACTIVATE_MODAL.TITLE');
    ref.componentInstance.msgOne = this.translate.instant('LOGIN.SINGPASS_ACTIVATE_MODAL.MESSAGE_1');
    ref.componentInstance.msgTwo = this.translate.instant('LOGIN.SINGPASS_ACTIVATE_MODAL.MESSAGE_2');
    ref.componentInstance.primaryActionLabel = this.translate.instant('LOGIN.SINGPASS_ACTIVATE_MODAL.BTN_TXT');
    event.stopPropagation();
    event.preventDefault();
  }

  openSingpassLogin(){
    if (this.singpassService.getStateNonce()) {
      this.singpassService.openSingpassUrl();
    }
  }

}
