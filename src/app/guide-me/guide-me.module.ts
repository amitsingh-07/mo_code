import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { GuideMeRoutingModule } from './/guide-me-routing.module';
import { GetStartedFormComponent } from './get-started/get-started-form/get-started-form.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  imports: [CommonModule, GuideMeRoutingModule, ReactiveFormsModule ],
  declarations: [ProfileComponent, GetStartedComponent, GetStartedFormComponent]
})
export class GuideMeModule {}
