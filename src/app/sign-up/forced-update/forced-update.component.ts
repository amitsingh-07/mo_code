import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forced-update',
  templateUrl: './forced-update.component.html',
  styleUrls: ['./forced-update.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ForcedUpdateComponent implements OnInit {

  constructor(
    private readonly translate: TranslateService
  ) {
    this.translate.use('en');
   }

  ngOnInit(): void {
  }

}
