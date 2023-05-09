import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes, UrlSegment, UrlSegmentGroup } from '@angular/router';

import { APP_ROUTES } from './app-routes.constants';
import { CallBackComponent } from './call-back/call-back.component';
import { PendingChangesGuard } from './changes.guard';
import { ComprehensiveChildEnableGuard } from './comprehensive/comprehensive-child-enable-guard';
import { ComprehensiveEnableGuard } from './comprehensive/comprehensive-enable-guard';
import {
  EmailEnquirySuccessComponent
} from './email-enquiry-success/email-enquiry-success.component';
import { ExternalRouteGuard } from './external-route-guard';
import { InvestmentMaintenanceComponent } from './investment-maintenance/investment-maintenance.component';
import { InvestmentChildEnableGuard } from './investment/investment-engagement-journey/investment-child-enable-guard';
import { InvestmentEnableGuard } from './investment/investment-engagement-journey/investment-enable-guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { TestMyInfoComponent } from './test-my-info/test-my-info.component';
import { UrlRedirectComponent } from './url-redirect.component';
import { WillWritingChildEnableGuard } from './will-writing/will-writing-child-enable-guard';
import { WillWritingEnableGuard } from './will-writing/will-writing-enable-guard';
import { PaymentChildEnableGuard } from './payment/payment-child-enable-guard';
import { PaymentEnableGuard } from './payment/payment-enable-guard';
import { NotSupportedComponent } from './not-supported/not-supported.component';

const routes: Routes = [
  {
    path: '', canDeactivate: [PendingChangesGuard],
    children: [
      { component: UrlRedirectComponent, matcher: validateUrl },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '9462test-myinfo', component: TestMyInfoComponent },
      { path: 'direct', loadChildren: () => import('./direct/direct.module').then(m => m.DirectModule) },
      { path: 'welcome-journey', loadChildren: () => import('./corpbiz-welcome-flow/corpbiz-welcome-flow.module').then(m => m.CorpBizWelcomeFlowModule) },
      { path: 'guideme', loadChildren: () => import('./guide-me/guide-me.module').then(m => m.GuideMeModule) },
      { path: 'accounts', loadChildren: () => import('./sign-up/sign-up.module').then(m => m.SignUpModule) },
      { path: 'myinfo', component: CallBackComponent },
      { path: 'investment-maintenance', component: InvestmentMaintenanceComponent },
      {
        path: APP_ROUTES.COMPREHENSIVE, loadChildren: () => import('./comprehensive/comprehensive.module').then(m => m.ComprehensiveModule),
        canActivate: [ComprehensiveEnableGuard],
        canActivateChild: [ComprehensiveChildEnableGuard]
      },
      {
        path: 'investment/engagement',
        loadChildren: () => import('./investment/investment-engagement-journey/investment-engagement-journey.module').then(m => m.InvestmentEngagementJourneyModule),
        canActivate: [InvestmentEnableGuard],
        canActivateChild: [InvestmentChildEnableGuard]
      },
      {
        path: 'investment/account',
        loadChildren: () => import('./investment/investment-account/investment-account.module').then(m => m.InvestmentAccountModule),
        canActivate: [InvestmentEnableGuard],
        canActivateChild: [InvestmentChildEnableGuard]
      },
      {
        path: 'investment/manage',
        loadChildren: () => import('./investment/manage-investments/manage-investments.module').then(m => m.ManageInvestmentsModule),
        canActivate: [InvestmentEnableGuard],
        canActivateChild: [InvestmentChildEnableGuard]
      },
      {
        path: 'investment',
        loadChildren: () => import('./investment/investment-common/investment-common.module').then(m => m.InvestmentCommonModule),
        canActivate: [InvestmentEnableGuard],
        canActivateChild: [InvestmentChildEnableGuard]
      },
      {
        path: 'will-writing',
        loadChildren: () => import('./will-writing/will-writing.module').then(m => m.WillWritingModule),
        canActivate: [WillWritingEnableGuard],
        canActivateChild: [WillWritingChildEnableGuard]
      },
      {
        path: 'payment',
        loadChildren: () => import('./payment/payment.module').then(m => m.PaymentModule),
        canActivate: [PaymentEnableGuard],
        canActivateChild: [PaymentChildEnableGuard]
      },
      {
        path: 'promo-code',
        loadChildren: () => import('./promo-code/promo-code.module').then(m => m.PromoCodeModule),
        canActivate: [InvestmentEnableGuard],
        canActivateChild: [InvestmentChildEnableGuard]
      },
      // Legacy Routes
      { path: 'email-enquiry/success', component: EmailEnquirySuccessComponent },
      { path: 'page-not-found', component: NotFoundComponent },
      { path: 'browser-not-supported', component: NotSupportedComponent },
      { path: '**', component: NotFoundComponent, canActivate: [ExternalRouteGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false, onSameUrlNavigation: 'reload'})],
  declarations: []
})
export class AppRoutingModule { }

// MyInfo changes
export function validateUrl(url: UrlSegment[], group: UrlSegmentGroup, route: Route) {
  if (window.location.search === '?errorcode=eSingPass_00_00_01') {
    if (window.opener && window.opener.myinfo) {
      const token: string = window.opener.failed('CANCELLED');
      if (token === 'MY_INFO') {

      }
      // attempt to authenticate with the token...
    } else {
      return ({ consumed: url });
    }
  }
}
