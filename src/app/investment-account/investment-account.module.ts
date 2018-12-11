import { NouisliderModule } from 'ng2-nouislider';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { AccountCreationErrorModalComponent } from './account-creation-error-modal/account-creation-error-modal.component';
import {
    AccountSetupCompletedComponent
} from './account-setup-completed/account-setup-completed.component';
import { AcknowledgementComponent } from './acknowledgement/acknowledgement.component';
import {
    AdditionalDeclarationInfoComponent
} from './additional-declaration-info/additional-declaration-info.component';
import {
    AdditionalDeclarationScreen2Component
} from './additional-declaration-screen2/additional-declaration-screen2.component';
import {
    AdditionalDeclarationStep1Component
} from './additional-declaration-step1/additional-declaration-step1.component';
import {
    AdditionalDeclarationSubmitComponent
} from './additional-declaration-submit/additional-declaration-submit.component';
import { ConfirmPortfolioComponent } from './confirm-portfolio/confirm-portfolio.component';
import {
    EditInvestmentModalComponent
} from './confirm-portfolio/edit-investment-modal/edit-investment-modal.component';
import { FeesModalComponent } from './confirm-portfolio/fees-modal/fees-modal.component';
import { EmploymentDetailsComponent } from './employment-details/employment-details.component';
import { FinanicalDetailsComponent } from './finanical-details/finanical-details.component';
import { FundingIntroComponent } from './funding-intro/funding-intro.component';
import { InvestmentAccountRoutingModule } from './investment-account-routing.module';
import {
    PersonalDeclarationComponent
} from './personal-declaration/personal-declaration.component';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { PostLoginComponent } from './post-login/post-login.component';
import { ResidentialAddressComponent } from './residential-address/residential-address.component';
import { SelectNationalityComponent } from './select-nationality/select-nationality.component';
import { SingPassComponent } from './sing-pass/sing-pass.component';
import { TaxInfoComponent } from './tax-info/tax-info.component';
import { UploadDocumentBOComponent } from './upload-document-bo/upload-document-bo.component';
import {
    UploadDocumentsLaterComponent
} from './upload-documents-later/upload-documents-later.component';
import { UploadDocumentsComponent } from './upload-documents/upload-documents.component';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(
    http,
    [
        { prefix: './assets/i18n/app/', suffix: '.json' },
        { prefix: './assets/i18n/investment-account/', suffix: '.json' }
    ]);
}

@NgModule({
  imports: [
    CommonModule, InvestmentAccountRoutingModule, ReactiveFormsModule,
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
    SharedModule
  ],
  declarations: [
    SingPassComponent,
    PostLoginComponent,
    PersonalInfoComponent,
    ResidentialAddressComponent,
    SelectNationalityComponent,
    EmploymentDetailsComponent,
    TaxInfoComponent,
    FinanicalDetailsComponent,
    UploadDocumentsComponent,
    PersonalDeclarationComponent,
    UploadDocumentsLaterComponent,
    AdditionalDeclarationScreen2Component,
    ConfirmPortfolioComponent,
    EditInvestmentModalComponent,
    AcknowledgementComponent,
    AdditionalDeclarationInfoComponent,
    AdditionalDeclarationStep1Component,
    FeesModalComponent,
    AccountSetupCompletedComponent,
    AdditionalDeclarationSubmitComponent,
    UploadDocumentBOComponent,
    AccountCreationErrorModalComponent,
    FundingIntroComponent
  ],
  entryComponents: [
    EditInvestmentModalComponent,
    FeesModalComponent,
    AccountCreationErrorModalComponent
  ],
  providers: [CurrencyPipe]
})
export class InvestmentAccountModule { }
