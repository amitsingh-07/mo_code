import {
  Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation, ChangeDetectorRef
} from '@angular/core';
import { UpperCasePipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import {
  FormControl, FormGroupDirective
} from '@angular/forms';

@Component({
  selector: 'app-dropdown-with-search',
  templateUrl: './dropdown-with-search.component.html',
  styleUrls: ['./dropdown-with-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DropdownWithSearchComponent implements OnInit {
  randomNo: number;
  searchControlName: string;
  @Input('optionList') optionList;
  @Input('controlName') controlName;
  @Input('nestedControlName') nestedControlName;
  @Input('displayKey') displayKey;
  @Input('disabled') disabled;
  @Input('placement') placement;
  @Input('placeholderText') placeholderText;
  @Input('form') form;
  @Input('textCase') textCase;
  @Output() itemSelected = new EventEmitter<boolean>();
  isDropdownOpen = false;
  selectedValue;
  @ViewChild('searchInputElement', { static: true }) searchInputElement: ElementRef;

  constructor(private parent: FormGroupDirective, private cd: ChangeDetectorRef, private upperCasePipe: UpperCasePipe,
  private lowerCasePipe: LowerCasePipe, private titleCasePipe: TitleCasePipe ) {
  }

  ngOnInit() {
    this.form = this.form ? this.form : this.parent.form;
    this.randomNo = this.getRandomNo();
    this.searchControlName = 'searchQuery' + this.randomNo;
    this.form.addControl(this.searchControlName, new FormControl(''));

    if (!this.nestedControlName) {
      this.form.get(this.controlName).valueChanges.subscribe((value) => {
        if (value) {
          this.selectedValue = value[this.displayKey];
        }
      });
      this.form.get(this.controlName).updateValueAndValidity();
    } else { // Nested Control
      this.form.get(this.nestedControlName).get(this.controlName).valueChanges.subscribe((value) => {
        if (value) {
          this.selectedValue = value[this.displayKey];
        }
      });
      this.form.get(this.nestedControlName).get(this.controlName).updateValueAndValidity();
    }
  }

  emitSelected(option) {
    this.form.controls[this.searchControlName].setValue('');
    this.itemSelected.emit(option);
  }

  preventPropogation(event) {
    event.stopPropagation();
  }

  getRandomNo() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  toggleDropdown(event) {
    this.isDropdownOpen = event;
    this.cd.detectChanges();
    if (event) {
      setTimeout(() => {
        this.searchInputElement.nativeElement.focus();
      });
    }
  }

  getTransformedValue(selectedValue: any) {
    if(this.textCase && this.textCase === 'uppercase') {      
      return this.upperCasePipe.transform(selectedValue);
    } else if(this.textCase && this.textCase === 'lowercase') { 
      return this.lowerCasePipe.transform(selectedValue);
    } else {
      return this.titleCasePipe.transform(selectedValue);
    }
  } 
}
