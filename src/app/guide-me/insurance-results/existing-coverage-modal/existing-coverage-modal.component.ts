
import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfigService } from '../../../config/config.service';
import { Formatter } from '../../../shared/utils/formatter.util';
import { GuideMeService } from '../../guide-me.service';
import { IResultItem } from '../insurance-result/insurance-result';
import { IExistingCoverage } from './existing-coverage.interface';

@Component({
  selector: 'app-existing-coverage-modal',
  templateUrl: './existing-coverage-modal.component.html',
  styleUrls: ['./existing-coverage-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExistingCoverageModalComponent implements OnInit {

  existingCoverageValues: IExistingCoverage;
  @Input() data: any;
  @Output() dataOutput: EventEmitter<any> = new EventEmitter();
  existingCoverageForm: FormGroup;
  selectedHospitalPlan;
  hospitalPlanList;
  isLifeProtection = false;
  isCriticalIllness = false;
  isOccupationalDisability = false;
  isLongTermCare = false;
  isHospitalPlan = false;

  constructor(
    public activeModal: NgbActiveModal, private guideMeService: GuideMeService,
    private config: ConfigService) {
    this.existingCoverageValues = this.guideMeService.getExistingCoverageValues();
    if (!this.existingCoverageValues) {
      this.existingCoverageValues = this.guideMeService.getEmptyExistingCoverage();
    }
    this.selectedHospitalPlan = this.existingCoverageValues.selectedHospitalPlan;
  }

  ngOnInit() {

    this.config.getConfig().subscribe((configData) => {
      this.hospitalPlanList = configData.hospitalPlanData;
    });

    this.existingCoverageForm = new FormGroup({
      lifeProtectionCoverage: new FormControl(this.existingCoverageValues.lifeProtectionCoverage),
      criticalIllnessCoverage: new FormControl(this.existingCoverageValues.criticalIllnessCoverage),
      occupationalDisabilityCoveragePerMonth: new FormControl(this.existingCoverageValues.occupationalDisabilityCoveragePerMonth),
      longTermCareCoveragePerMonth: new FormControl(this.existingCoverageValues.longTermCareCoveragePerMonth),
      selectedHospitalPlan: new FormControl(this.existingCoverageValues.selectedHospitalPlan)
    });
    this.data.forEach((protectionNeed: IResultItem) => {
      switch (protectionNeed.id) {
        case 1:
          this.isLifeProtection = true;
          this.existingCoverageValues.lifeProtectionCoverage =
            protectionNeed.existingCoverage ? protectionNeed.existingCoverage.value : 0;
          break;
        case 2:
          this.isCriticalIllness = true;
          this.existingCoverageValues.criticalIllnessCoverage =
            protectionNeed.existingCoverage ? protectionNeed.existingCoverage.value : 0;
          break;
        case 3:
          this.isOccupationalDisability = true;
          this.existingCoverageValues.occupationalDisabilityCoveragePerMonth =
            protectionNeed.existingCoverage ? protectionNeed.existingCoverage.value : 0;
          break;
        case 4:
          this.isHospitalPlan = true;
          // Drop-down will be displayed for Hospitalization
          break;
        case 5:
          this.isLongTermCare = true;
          this.existingCoverageValues.longTermCareCoveragePerMonth =
            protectionNeed.existingCoverage ? protectionNeed.existingCoverage.value : 0;
          break;
      }
    });
  }

  /* Onchange Currency Addition */
  @HostListener('input', ['$event'])
  onChange() {
    this.setFormTotalValue();
  }

  setFormTotalValue() {
    return this.guideMeService.additionOfCurrency(this.existingCoverageForm.value);
  }
  save() {
    const formControlKeys = Object.keys(this.existingCoverageForm.controls);
    formControlKeys.forEach((key: string) => {
      const thisControl = this.existingCoverageForm.controls[key];
      if (!thisControl.value) {
        thisControl.setValue(0);
      } else {
        const intValue = Formatter.getIntValue(thisControl.value);
        thisControl.setValue(intValue);
      }
    });

    this.guideMeService.isExistingCoverAdded = true;
    this.existingCoverageForm.controls.selectedHospitalPlan.setValue(this.selectedHospitalPlan);
    this.existingCoverageForm.value.selectedHospitalPlanId = this.selectedHospitalPlan.id;
    this.guideMeService.setExistingCoverageValues(this.existingCoverageForm.value);
    this.dataOutput.emit(this.existingCoverageForm.value);
    this.activeModal.close();
  }
  selectHospitalPlan(currentPlan) {
    this.selectedHospitalPlan = currentPlan;
  }

}
