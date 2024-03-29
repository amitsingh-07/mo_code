import { filter } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { ANIMATION_DATA } from '../../../../assets/animation/animationData';
declare var require: any;
const bodymovin = require("../../../../assets/scripts/lottie_svg.min.js");

@Component({
  selector: 'app-model-with-button',
  templateUrl: './model-with-button.component.html',
  styleUrls: ['./model-with-button.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ModelWithButtonComponent implements OnInit {
  @Input() imgType = 1;
  @Input() errorTitle: any;
  @Input() errorMessage: any;
  @Input() errorMessageHTML: any;
  @Input() disclaimerMessage: any;
  @Input() primaryActionLabel: any;
  @Input() secondaryActionLabel: any;
  @Input() yesOrNoButton: any;
  @Input() warningIcon: any;
  @Input() lockIcon: any;
  @Input() portfolioExist: boolean;
  @Input() secondaryActionDim: boolean;
  @Input() isInlineButton: boolean;
  @Input() closeBtn = true;
  @Input() investmentPeriodImg: any;
  @Input() spinner: any;
  @Input() myInfo: any;
  @Input() checkBoxMessage: any;
  @Input() disablePrimaryBtn = false;
  @Output() primaryAction = new EventEmitter<any>();
  @Output() secondaryAction = new EventEmitter<any>();
  @Output() yesClickAction = new EventEmitter<any>();
  @Output() noClickAction = new EventEmitter<any>();
  @Output() closeAction = new EventEmitter<any>();
 
  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    public readonly translate: TranslateService,
    private zone: NgZone) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
    });
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(({ urlAfterRedirects }: NavigationEnd) => {
        // dismiss all bootstrap modal dialog
        this.activeModal.dismiss();
      });
    this.zone.run(()=>{
      this.createAnimation();
    });
  }

  primaryActionSelected() {
    this.primaryAction.emit();
    this.activeModal.close();
  }

  secondaryActionSelected() {
    this.secondaryAction.emit();
    this.activeModal.close();
  }

  yesButtonClick() {
    this.yesClickAction.emit();
    this.activeModal.close();
  }

  noButtonClick() {
    this.noClickAction.emit();
    this.activeModal.close();
  }

  closeIconAction() {
    this.closeAction.emit();
    this.activeModal.dismiss('Cross click');    
  }

  createAnimation() {
    const animationData = ANIMATION_DATA.MO_SPINNER;
    bodymovin.loadAnimation({
      container: document.getElementById('mo_spinner'), // Required
      path: '/app/assets/animation/mo_spinner.json', // Required
      renderer: 'canvas', // Required
      loop: true, // Optional
      autoplay: true, // Optional
      animationData: animationData
    })
  }
  enableCheckBox(){
    this.disablePrimaryBtn = !this.disablePrimaryBtn
  }
}
