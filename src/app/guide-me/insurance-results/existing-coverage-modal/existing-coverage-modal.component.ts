import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IResultItem } from '../insurance-result/insurance-result';

import { GuideMeService } from './../../guide-me.service';
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
  ADD_EXISTING_COVERAGES = {
    TITLE: 'Add Existing Coverages',
    LIFE_PROTECTION: 'Life protection',
    CRITICAL_ILLNESS: 'Critical Illness',
    OCCUPATION_DISABILITY: 'Occupational Disability',
    LONG_TERM_CARE: 'Long-TermCare',
    HOSPITAL_PLAN: 'Hospital Plan'
  };
  selectedHospitalPlan = this.guideMeService.getHospitalPlan();
  hospitalPlanList = [{
    'id': 0,
    'hospitalClass': 'None',
    'hospitalClassDescription': ''
  }, {
    'id': 1,
    'hospitalClass': 'Private Hospital',
    'hospitalClassDescription': 'Choose any doctor, Stay in any hospital'
  }, {
    'id': 2,
    'hospitalClass': 'Government Hospital Ward A',
    'hospitalClassDescription': 'Choose any doctor, Stay in single ward'
  }, {
    'id': 3,
    'hospitalClass': 'Government Hospital Ward B1',
    'hospitalClassDescription': 'Choose any doctor, Up to 4-bedded ward'
  }, {
    'id': 4,
    'hospitalClass': 'Government Hospital Ward B2/C',
    'hospitalClassDescription': 'Assigned doctor, Up to 9-bedded ward'
  }, {
    'id': 5,
    'hospitalClass': 'Global Healthcare Coverage',
    'hospitalClassDescription': 'Option for maternity, Outpatient treatment'
  }];
  isLifeProtection = false;
  isCriticalIllness = false;
  isOccupationalDisability = false;
  isLongTermCare = false;
  isHospitalPlan = false;

  constructor(public activeModal: NgbActiveModal, private guideMeService: GuideMeService) { }

  ngOnInit() {
    this.existingCoverageValues = this.guideMeService.getExistingCoverageValues();
    this.selectedHospitalPlan = this.guideMeService.getHospitalPlan();
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
          this.existingCoverageValues.lifeProtectionCoverage = protectionNeed.existingCoverage.value;
          break;
        case 2:
          this.isCriticalIllness = true;
          this.existingCoverageValues.criticalIllnessCoverage = protectionNeed.existingCoverage.value;
          break;
        case 3:
          this.isOccupationalDisability = true;
          this.existingCoverageValues.occupationalDisabilityCoveragePerMonth = protectionNeed.existingCoverage.value;
          break;
        case 4:
          this.isHospitalPlan = true;
          // this.model.hospitalPlanCoverage = protectionNeed.existingCoverage.value;
          // Drop-down will be displayed for Hospitalization
          break;
        case 5:
          this.isLongTermCare = true;
          this.existingCoverageValues.longTermCareCoveragePerMonth = protectionNeed.existingCoverage.value;
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
      }
    });

    this.guideMeService.isExistingCoverAdded = true;
    this.existingCoverageForm.controls.selectedHospitalPlan.setValue(this.selectedHospitalPlan);
    this.guideMeService.setHospitalPlan(this.selectedHospitalPlan);
    this.guideMeService.setExistingCoverageValues(this.existingCoverageForm.value);
    this.dataOutput.emit(this.existingCoverageForm.value);
    this.activeModal.close();
  }
  selectHospitalPlan(currentPlan) {
    this.selectedHospitalPlan = currentPlan;
  }

}
