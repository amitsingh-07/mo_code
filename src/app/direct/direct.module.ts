import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NouisliderModule } from 'ng2-nouislider';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import { LoggedUserService } from '../sign-up/auth-guard.service';
import { ProductDetailComponent } from './../shared/components/product-detail/product-detail.component';
import { HeaderService } from './../shared/header/header.service';
import { NavbarService } from './../shared/navbar/navbar.service';
import { SharedModule } from './../shared/shared.module';
import { ComparePlansComponent } from './compare-plans/compare-plans.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { DirectAccessGuard } from './direct-access-guard';
import { DirectResultsComponent } from './direct-results/direct-results.component';
import { DirectRoutingModule } from './direct-routing.module';
import { DirectComponent } from './direct.component';
import { EditProductInfoComponent } from './edit-product-info/edit-product-info.component';
import { CriticalIllnessFormComponent } from './product-info/critical-illness-form/critical-illness-form.component';
import { EducationFormComponent } from './product-info/education-form/education-form.component';
import { HospitalPlanFormComponent } from './product-info/hospital-plan-form/hospital-plan-form.component';
import { LifeProtectionFormComponent } from './product-info/life-protection-form/life-protection-form.component';
import { LongTermCareFormComponent } from './product-info/long-term-care-form/long-term-care-form.component';
import { OcpDisabilityFormComponent } from './product-info/ocp-disability-form/ocp-disability-form.component';
import { ProductCategoryComponent } from './product-info/product-category/product-category.component';
import { ProductInfoComponent } from './product-info/product-info.component';
import { RetirementIncomeFormComponent } from './product-info/retirement-income-form/retirement-income-form.component';
import { SrsApprovedPlansFormComponent } from './product-info/srs-approved-plans-form/srs-approved-plans-form.component';

export function createTranslateLoader(http: HttpClient) {
  return new MultiTranslateHttpLoader(
    http,
    [
      { prefix: './assets/i18n/app/', suffix: '.json' },
      { prefix: './assets/i18n/direct/', suffix: '.json' }
    ]);
}

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NouisliderModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    DirectRoutingModule,
    NgbModule,
    SharedModule
  ],
  declarations: [
    DirectResultsComponent, DirectComponent,
    ProductInfoComponent, ProductCategoryComponent,
    LifeProtectionFormComponent, CriticalIllnessFormComponent,
    EducationFormComponent, LongTermCareFormComponent,
    HospitalPlanFormComponent, RetirementIncomeFormComponent,
    OcpDisabilityFormComponent, EditProductInfoComponent,
    ComparePlansComponent,
    SrsApprovedPlansFormComponent,
    ContactFormComponent
  ],
  providers: [CurrencyPipe, TitleCasePipe, LoggedUserService, DirectAccessGuard],
  entryComponents: [ProductDetailComponent, DirectResultsComponent, ContactFormComponent]
})
export class DirectModule {
  constructor(public navbarService: NavbarService, public headerService: HeaderService) {
  }
}