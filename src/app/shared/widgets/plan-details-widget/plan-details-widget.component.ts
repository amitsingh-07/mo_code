import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TranslateService } from '../../../../../node_modules/@ngx-translate/core';
import { RecommendationsModalComponent } from './../../modal/recommendations-modal/recommendations-modal.component';
import { RoundPipe } from './../../Pipes/round.pipe';
import { SelectedPlansService } from '../../Services/selected-plans.service';
import { Util } from '../../utils/util';

@Component({
  selector: 'app-plan-details-widget',
  templateUrl: './plan-details-widget.component.html',
  styleUrls: ['./plan-details-widget.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlanDetailsWidgetComponent implements DoCheck, OnInit, AfterViewChecked {
  @Input() data;
  @Input() type;
  @Input() bestValue;
  @Input() isDirect;
  @Input() frequencyType;
  @Input() isSelected;
  @Input() isViewMode;

  icon;
  insurerLogo;
  premiumAmount;
  premiumAmountYearly;
  premiumFrequency = '';
  productName;
  promoDiscount;
  isPromoDiscountHidden;
  highlights = [];
  temp;
  canShowRanking = true;
  canShowRating = true;
  canShowDiscount = true;
  isRankContainerSet = false;
  coverageDuration;
  premiumDuration;
  @Output() view = new EventEmitter();
  @Output() select = new EventEmitter();

  perMonth = '';
  perYear = '';
  premiumAmountLength = 0;

  constructor(
    private currency: CurrencyPipe, private translate: TranslateService, public modal: NgbModal,
    private elRef: ElementRef, private renderer: Renderer2, private titleCasePipe: TitleCasePipe, private round: RoundPipe, private planService: SelectedPlansService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((data) => {
      this.perMonth = this.translate.instant('SUFFIX.PER_MONTH');
      this.perYear = this.translate.instant('SUFFIX.PER_YEAR');
    });
    this.highlights = [];
  }

  ngDoCheck() {
  }

  ngOnInit() {
    if (this.data) {
      this.icon = this.data.icon;
      this.insurerLogo = 'assets/images/' + this.data.insurer.logoName;
      this.premiumAmount = this.data.premium.premiumAmount;
      if (this.premiumAmount > 0) {
        const tempValue = this.premiumAmount.toFixed(2);
        this.premiumAmountLength = tempValue.toString().length;
      }
      if (this.data.promotion && this.data.promotion.promoDiscount) {
        this.promoDiscount = this.data.promotion.promoDiscount;
        this.isPromoDiscountHidden = this.data.promotion.expired === 'FALSE' ? false : true;
      }
      this.productName = this.data.productName;
      this.coverageDuration = this.data.premium.durationName;
      this.premiumDuration = this.data.premium.premiumTerm;
      this.premiumAmountYearly = this.data.premium.premiumAmountYearly;
      if (this.premiumAmountYearly > 0 && this.frequencyType == "yearly") {
        const tempValue = this.premiumAmountYearly.toFixed(2);
        this.premiumAmountLength = tempValue.toString().length;
      }

      this.temp = this.data;
      this.type = this.type.toLowerCase();

      // Coverage Duration field should not be displayed for all Retirement and SRS types
      if (this.type.indexOf('retirement') < 0 && this.type.indexOf('srs') < 0) {
        this.highlights.push(
          { title: 'Coverage Duration:', description: this.titleCasePipe.transform(this.coverageDuration) }
        );
      }
      // Premium Duration field is expected for all the types
      this.highlights.push({ title: 'Premium Duration:', description: this.premiumDuration });

      // For Whole Life
      if (this.data.premium.durationName.indexOf('Whole Life') > -1 && this.type !== 'hospital plan') {
        this.highlights.push({ title: 'Coverage:', description: this.currency.transform(this.data.premium.sumAssured, 'USD', 'symbol', '1.0-0') + ` + Variable Bonus.` });
      }

      // For Whole Life Multiplier
      if (this.data.premium.durationName.indexOf('Whole life w/Multiplier') > -1) {
        const age = this.data.insurer.insurerName.indexOf('Tokio Marine') > -1 ? 65 : 70;
        const multiplierRef = this.data.premium.multiplierRef || 3;
        const sumAssured = this.currency.transform(this.round.transform(this.data.premium.sumAssured / multiplierRef), 'USD', 'symbol', '1.0-0');
        this.highlights.push({ title: 'Coverage:', description: this.currency.transform(this.data.premium.sumAssured, 'USD', 'symbol', '1.0-0') + ` till age ${age}.` });
        this.highlights.push({ title: `(After age ${age}: ${sumAssured} + Variable Bonus.)`, description: '' });
      }

      if (this.type.indexOf('critical') > -1) {
        if (this.isDirect && this.data.premium.claimFeature) {
          this.highlights.push({ title: 'Claim Feature:', description: this.data.premium.claimFeature });
        }
      }
      if (this.type === 'long-term care') {
        this.canShowDiscount = false;
        if (this.isDirect) {
          this.highlights.push({ title: 'Payout years:', description: this.data.premium.payoutDuration });
          this.highlights.push({ title: 'Claim Criteria:', description: this.data.premium.claimCriteria });
        } else {
          this.highlights.push({ title: 'No. of ADLs:', description: this.data.premium.numberOfADL });
        }
      }
      if (this.type === 'hospital plan') {
        this.frequencyType = 'yearly';
        this.canShowDiscount = false;
        let riderName = '';
        let riderDesc = '';

        if (this.data.rider) {
          riderName = this.data.rider.riderName;
          if (riderName && riderName.toLowerCase() === 'full rider') {
            riderName += ':';
            riderDesc = 'Covers co-payment components';
          } else if (riderName && riderName.toLowerCase() === 'partial rider') {
            riderName += ':';
            riderDesc = 'Covers partial co-payment components';
          } else {
            riderName = 'Rider:';
            riderDesc = 'No Rider';
          }
        } else {
          riderName = 'Rider:';
          riderDesc = 'No Rider';
        }
        this.highlights.push({ title: riderName, description: riderDesc });
      }
      if (this.type === 'occupational disability') {
        this.canShowRanking = true;
        this.highlights.push({ title: 'Deferred Period:', description: this.data.premium.deferredPeriod + this.translate.instant('SUFFIX.MONTHS')});
        this.highlights.push({ title: 'Escalating Benefit:', description: this.data.premium.escalatingBenefit + this.translate.instant('SUFFIX.PERCENTAGE')});
      }
      if (this.type.indexOf('retirement') > -1) {
        this.highlights.push({ title: 'Payout Period:', description: this.data.premium.retirementPayPeriodDisplay });
        if (this.data.premium.retirementPayoutDuration
          && this.data.premium.retirementPayoutDuration.toLowerCase() === 'limited years') {
          this.highlights.push({
            title: 'Total Projected Payout:',
            description: this.currency.transform(this.data.premium.totalProjectedPayout475, 'USD', 'symbol', '1.0-0')
          });
        }
        this.highlights.push({ title: 'Payout Feature:', description: this.data.premium.retirementPayFeatureDisplay });
      }
      if (this.type.indexOf('education fund') > -1) {
        this.highlights.push({
          title: 'Monthly Premium:',
          description: this.currency.transform(this.data.premium.premiumAmount, 'USD', 'symbol', '1.0-0')
        });
        this.highlights.push({
          title: 'Yearly Premium:',
          description: this.currency.transform(this.data.premium.premiumAmountYearly, 'USD', 'symbol', '1.0-0')
        });
      }
      if (this.type.indexOf('srs') > -1) {
        this.premiumAmount = this.data.premium.premiumAmountYearly;
        this.highlights.push({
          title: 'Payout Period:',
          description: this.data.premium.retirementPayPeriodDisplay
        });
        this.highlights.push({
          title: 'Guaranteed Annual Payout:',
          description: this.currency.transform(this.data.premium.gaurenteedMonthlyIncome, 'USD', 'symbol', '1.0-0')
        });
        this.highlights.push({
          title: 'Total Projected Payout:',
          description: this.currency.transform(this.data.premium.totalProjectedPayout475, 'USD', 'symbol', '1.0-0')
        });
      }
      this.highlights.push({ title: 'Needs Medical Underwriting:', description: this.data.underWritting });
      if (this.type === 'long-term care' && this.data.premium.payoutType) {
        this.highlights.push({ title: 'Payout Type:', description: this.data.premium.payoutType });
      }
    }
  }

  ngAfterViewChecked() {
    if (!this.isRankContainerSet) {
      const rankContainer = this.elRef.nativeElement.querySelectorAll('.insurance-plan-widget__container__rank-box');
      if (rankContainer.length > 0) {
        rankContainer.forEach((el) => {
          if (rankContainer.length === 1) {
            this.renderer.addClass(el, 'one-plan-width');
          } else if (rankContainer.length === 2) {
            this.renderer.addClass(el, 'two-plan-width');
          } else {
            this.renderer.addClass(el, 'three-plan-width');
          }
        });
        this.isRankContainerSet = true;
      }
    }
  }

  viewDetails() {
    this.isSelected = !this.isSelected;
    this.view.emit({ plan: this.temp, selected: this.isSelected });
  }
  brochureDownload() {
    this.Brochure(this.temp.brochureLink, 'brochure.pdf');
  }
  // tslint:disable-next-line:member-ordering
  Brochure = (() => {
    const a = document.createElement('a');
    document.body.appendChild(a);
    return ((link, fileName) => {
      a.href = link;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(link);
    });
  })();

  selectPlan() {
    this.isSelected = !this.isSelected;
    this.select.emit({ plan: this.temp, selected: this.isSelected });
  }

  openCommissionModal() {
    const ref = this.modal.open(RecommendationsModalComponent, { centered: true });
    ref.componentInstance.title = this.translate.instant('PROD_INFO_TOOLTIP.COMMISSION.TITLE');
    ref.componentInstance.message = this.translate.instant('PROD_INFO_TOOLTIP.COMMISSION.MESSAGE');
    return false;
  }
  openRatingModal() {
    const ref = this.modal.open(RecommendationsModalComponent, { centered: true });
    ref.componentInstance.title = this.translate.instant('PROD_INFO_TOOLTIP.RATING.TITLE');
    ref.componentInstance.message = this.translate.instant('PROD_INFO_TOOLTIP.RATING.MESSAGE');
  }

  redirectToPromoPage(promo: any) {
    if (promo && promo.link) {
      Util.openExternalUrl(`https://www.moneyowl.com.sg${promo['link']}`, '_blank')
    }
    return;
  }
}
