import { NouisliderModule } from 'ng2-nouislider';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../../shared/shared.module';
import { SignUpService } from '../../sign-up/sign-up.service';
import {
    AccountCreationErrorModalComponent
} from './confirm-portfolio/account-creation-error-modal/account-creation-error-modal.component';
import {
    AccountStatusComponent
} from './account-status/account-status.component';
import { AcknowledgementComponent } from './acknowledgement/acknowledgement.component';
import {
    AdditionalDeclarationInfoComponent
} from './additional-declaration-info/additional-declaration-info.component';
import {
    AdditionalDeclaration2Component
} from './additional-declaration2/additional-declaration2.component';
import {
    AdditionalDeclaration1Component
} from './additional-declaration1/additional-declaration1.component';
import { ConfirmPortfolioComponent } from './confirm-portfolio/confirm-portfolio.component';
import { EmploymentDetailsComponent } from './employment-details/employment-details.component';
import { FinancialDetailsComponent } from './financial-details/financial-details.component';
import { FundingIntroComponent } from './funding-intro/funding-intro.component';
import { AccountCreationRoutingModule } from './account-creation-routing.module';
import {
    PersonalDeclarationComponent
} from './personal-declaration/personal-declaration.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { StartComponent } from './start/start.component';
import { ResidentialAddressComponent } from './residential-address/residential-address.component';
import { NationalityComponent } from './nationality/nationality.component';
import { SingPassComponent } from './sing-pass/sing-pass.component';
import { TaxInfoComponent } from './tax-info/tax-info.component';
import { UploadDocumentBOComponent } from './upload-document-bo/upload-document-bo.component';
import { UploadDocumentsComponent } from './upload-documents/upload-documents.component';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/app/', suffix: '.json' },
    { prefix: './assets/i18n/investment-account/', suffix: '.json' }
  ]);
}

@NgModule({
  imports: [
    CommonModule,
    AccountCreationRoutingModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    NouisliderModule,
    SharedModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    SharedModule,
    RouterModule
  ],
  declarations: [
    SingPassComponent,
    StartComponent,
    PersonalInfoComponent,
    ResidentialAddressComponent,
    NationalityComponent,
    EmploymentDetailsComponent,
    TaxInfoComponent,
    FinancialDetailsComponent,
    UploadDocumentsComponent,
    PersonalDeclarationComponent,
    AdditionalDeclaration2Component,
    ConfirmPortfolioComponent,
    AcknowledgementComponent,
    AdditionalDeclarationInfoComponent,
    AdditionalDeclaration1Component,
    AccountStatusComponent,
    UploadDocumentBOComponent,
    AccountCreationErrorModalComponent,
    FundingIntroComponent
  ],
  entryComponents: [AccountCreationErrorModalComponent],
  providers: [CurrencyPipe]
})
export class AccountCreationModule {

  constructor() {
  }
}
