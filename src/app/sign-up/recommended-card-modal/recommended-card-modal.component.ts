import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Util } from '../../shared/utils/util';

@Component({
  selector: 'app-recommended-card-modal',
  templateUrl: './recommended-card-modal.component.html',
  styleUrls: ['./recommended-card-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RecommendedCardModalComponent implements OnInit {

  @Input() cardContent: any;
  @Input() emailSent: boolean;
  @Output() closeAction = new EventEmitter<any>();
  @Output() resendEmail: EventEmitter<any> = new EventEmitter();
  constructor(
    //private readonly translate: TranslateService,
    private readonly translate: TranslateService,
    public activeModal: NgbActiveModal,
    private router: Router
  ) {
    this.translate.use('en');
  }

  ngOnInit(): void {
  }

  resendEmailVerification(isEmail){
    this.resendEmail.emit(isEmail);
  }

  dismissCard(isDismiss) {
    this.closeAction.emit(isDismiss);
    this.activeModal.dismiss();
  }

  nextStep() {
    const redirectURL = this.cardContent ? this.cardContent.interactionButtonLink : '';
    const domainBase = document.getElementsByTagName('base')[0].href;
    const domainContains = redirectURL.includes(domainBase);
    if (!Util.isEmptyOrNull(redirectURL) && domainContains) {
      const route = redirectURL.replace(domainBase, '/');
      this.router.navigate([route]);
      this.closeAction.emit(false);
      this.activeModal.dismiss();
    } else {
      Util.openExternalUrl(redirectURL, '_blank');
    }
  }
}
