import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-recommended-card-modal',
  templateUrl: './recommended-card-modal.component.html',
  styleUrls: ['./recommended-card-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RecommendedCardModalComponent implements OnInit {

  @Input() cardContent: JSON;
  @Output() closeAction = new EventEmitter<any>();
  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
  }

  dismissCard(isDismiss) {
    if (isDismiss) {
      this.closeAction.emit();
    }
    this.activeModal.dismiss();
  }

  nextStep() {
  }
    
  closeIconAction() {
    this.closeAction.emit();
    this.activeModal.dismiss('Cross click');    
  }
}
