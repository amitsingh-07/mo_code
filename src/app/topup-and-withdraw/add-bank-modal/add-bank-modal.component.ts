import { Component, EventEmitter,HostListener, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SignUpService } from 'src/app/sign-up/sign-up.service';
import { RegexConstants } from '../../shared/utils/api.regex.constants';
import { TopupAndWithDrawService } from '../topup-and-withdraw.service';

@Component({
  selector: 'app-add-bank-modal',
  templateUrl: './add-bank-modal.component.html',
  styleUrls: ['./add-bank-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddBankModalComponent implements OnInit {
  @Input() banks;
  @Input() fullName;
  @Output() saved: EventEmitter<any> = new EventEmitter();
  addBankForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private topupAndWithDrawService: TopupAndWithDrawService,
    private signUpService: SignUpService
  ) {}

  ngOnInit() {
    this.addBankForm = new FormGroup({
      accountHolderName: new FormControl(this.fullName, [
        Validators.required,
        Validators.pattern(RegexConstants.NameWithSymbol)
      ]),
      bank: new FormControl('', Validators.required),
      accountNo: new FormControl('', [
        Validators.required,
        this.signUpService.validateBankAccNo
      ])
    });
  }

  setDropDownValue(key, value) {
    this.addBankForm.controls[key].setValue(value);
    this.addBankForm.get('accountNo').updateValueAndValidity();
  }

  markAllFieldsDirty(form) {
    Object.keys(form.controls).forEach((key) => {
      if (form.get(key).controls) {
        Object.keys(form.get(key).controls).forEach((nestedKey) => {
          form.get(key).controls[nestedKey].markAsDirty();
        });
      } else {
        form.get(key).markAsDirty();
      }
    });
  }

  getInlineErrorStatus(control) {
    return !control.pristine && !control.valid;
  }

  save(form) {
    if (!form.valid) {
      // INVALID FORM
      this.markAllFieldsDirty(form);
    } else {
      this.saved.emit(this.addBankForm.getRawValue());
    }
  }
  setAccountHolderName(accountHolderName: any, i: number) {
    if (accountHolderName !== undefined) {
      accountHolderName = accountHolderName.replace(/\n/g, '');
      this.addBankForm.controls.accountHolderName.setValue(accountHolderName);
     // this.addInfoForm.controls.markAsDirty();
      return accountHolderName;
    }
  }

  onKeyPressEvent(event: any, dependentName: any) {
    //return (event.which !== 13 && dependentName.length < 100);
    return (event.which !== 13);
  }

  
 @HostListener('input', ['$event'])
  onChange(event) {
    const id = event.target.id;
    if (id !== "") {
      const arr = id.split('-');
      const dependentName = event.target.innerText;
      if (dependentName.length > 100) {
        const dependentNameList = dependentName.substring(0, 100);
        //event.target.innerText = dependentNameList;
      this.addBankForm.controls.accountHolderName.setValue(dependentNameList);
      // this.invPersonalInfoForm.controls.markAsDirty();
        const el = document.querySelector("#" + id);//document.getElementById(id);
        this.setCaratTo(el, 100, dependentNameList);
      } else if (dependentName.length > 0) {
        const el = document.querySelector("#" + id);//document.getElementById(id);
        this.setCaratTo(el, dependentName.length, dependentName);
      }
    }
  }
  setCaratTo(contentEditableElement, position, dependentName) {
    contentEditableElement.innerText = dependentName;
    if (document.createRange) {
      const range = document.createRange();
      range.selectNodeContents(contentEditableElement);

      range.setStart(contentEditableElement.firstChild, position);
      range.setEnd(contentEditableElement.firstChild, position);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}
