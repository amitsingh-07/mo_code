import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MaintenancePageComponent implements OnInit {

  constructor(
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.translate.use('en');
  }

}
