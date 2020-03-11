import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { environment } from './../../environments/environment';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { CustomerReviewsComponent } from './customer-reviews/customer-reviews.component';
import { WhyMoneyOwlComponent } from './why-money-owl/why-money-owl.component';

let routes: Routes = [
  { path: '', component: AboutUsComponent},
  { path: 'customer-reviews', component: CustomerReviewsComponent},
  { path: 'contact-us', component: ContactUsComponent},
  { path: 'why-moneyowl', component: WhyMoneyOwlComponent},
  { path: '**', redirectTo: '/page-not-found' }
];

if (environment.hideHomepage) {
  routes = [
    { path: 'contact-us', component: ContactUsComponent},
    { path: '', redirectTo: '/page-not-found' },
    { path: '**', redirectTo: '/page-not-found' }
  ];
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AboutUsRoutingModule {}
