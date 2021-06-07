import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MANAGE_INVESTMENTS_CONSTANTS } from '../../manage-investments.constants';

@Component({
  selector: 'app-confirm-withdrawal-modal',
  templateUrl: './confirm-withdrawal-modal.component.html',
  styleUrls: ['./confirm-withdrawal-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmWithdrawalModalComponent implements OnInit {
  minBalance;
  showWarningMessage = false;
  @Input() withdrawAmount: any;
  @Input() withdrawType: any;
  @Input() portfolio: any;
  @Input() bankAccountNo: any;
  @Input() userInfo: any;
  @Input() srsAccountInfo: any;
  @Output() confirmed: EventEmitter<any> = new EventEmitter();
  @Output() showLearnMore: EventEmitter<any> = new EventEmitter();
  WITHDRAW_CONSTANTS;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    this.WITHDRAW_CONSTANTS = MANAGE_INVESTMENTS_CONSTANTS.WITHDRAW;
  }

  confirmWithdrawal(event) {
    this.confirmed.emit();
    event.stopPropagation();
  }
  learnMore() {
    this.showLearnMore.emit();
  }
 
}
