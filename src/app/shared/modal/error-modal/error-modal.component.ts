import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs/operators';
import { SIGN_UP_ROUTE_PATHS } from 'src/app/sign-up/sign-up.routes.constants';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ErrorModalComponent implements OnInit {

  @Input() errorTitle: any;
  @Input() errorMessage: any;
  @Input() errorMessageList: string[];
  @Input() multipleFormErrors: string[];
  @Input() showErrorButton: boolean;
  @Input() errorDescription: any;
  @Input() isButtonEnabled: boolean;
  @Input() isError: boolean;
  @Input() navToHome: boolean;
  @Input() unSaved: boolean;
  @Input() promoSuccess: boolean;
  @Input() hasImpact: any;
  @Input() formName: any;
  @Input() promoSuccessMsg: string;
  @Input() email: string;
  @Input() buttonLabel: string;
  @Input() enableResendEmail: boolean;
  @Output() selected: EventEmitter<any> = new EventEmitter();
  @Output() retry: EventEmitter<any> = new EventEmitter();
  @Output() resendEmail: EventEmitter<any> = new EventEmitter();
  @Output() resetEmailVerification: EventEmitter<any> = new EventEmitter();
  @Input() emailSent: boolean;
  @Input() closeBtn: boolean;
  @Input() tooltipButtonLabel: string;

  public closeBtnToggle = true;

  constructor(public activeModal: NgbActiveModal, private router: Router) { }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(({ urlAfterRedirects }: NavigationEnd) => {
        // dismiss all bootstrap modal dialog
        this.activeModal.dismiss();
      });

    if (this.closeBtn != null) {
      this.closeBtnToggle = this.closeBtn;
    }
  }

  goBack() {
    this.selected.emit();
    this.activeModal.close();
  }

  tryAgain() {
    this.retry.emit();
    this.activeModal.close();
  }

  goToHome() {
    this.activeModal.close();
  }
  gotoComprehensive() {
    this.activeModal.close();
  }

  resendEmailVerification() {
    this.resendEmail.emit();
  }
}
