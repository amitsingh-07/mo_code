import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgressTrackerComponent } from './../shared/modal/progress-tracker/progress-tracker.component';

import { BadMoodFundComponent } from './bad-mood-fund/bad-mood-fund.component';
import { ComprehensiveEnableGuard } from './comprehensive-enable-guard';
import { ComprehensiveReviewComponent } from './comprehensive-review/comprehensive-review.component';
import { COMPREHENSIVE_ROUTES } from './comprehensive-routes.constants';
import { ComprehensiveStepsComponent } from './comprehensive-steps/comprehensive-steps.component';
import { ComprehensiveComponent } from './comprehensive/comprehensive.component';
import { DependantEducationListComponent } from './dependant-education-list/dependant-education-list.component';
import { DependantEducationSelectionComponent } from './dependant-education-selection/dependant-education-selection.component';
import { DependantSelectionComponent } from './dependant-selection/dependant-selection.component';
import { DependantsDetailsComponent } from './dependants-details/dependants-details.component';
import { EducationPreferenceComponent } from './education-preference/education-preference.component';
import { EnquiryComponent } from './enquiry/enquiry.component';
import { InsurancePlanComponent } from './insurance-plan/insurance-plan.component';
import { MyAssetsComponent } from './my-assets/my-assets.component';
import { MyEarningsComponent } from './my-earnings/my-earnings.component';
import { MyLiabilitiesComponent } from './my-liabilities/my-liabilities.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { MySpendingsComponent } from './my-spendings/my-spendings.component';
import { RegularSavingPlanComponent } from './regular-saving-plan/regular-saving-plan.component';
import { ResultComponent } from './result/result.component';
import { RetirementPlanComponent } from './retirement-plan/retirement-plan.component';
import { ValidateResultComponent } from './validate-result/validate-result.component';
import { RiskProfileComponent } from './risk-profile/risk-profile.component';

const routes: Routes = [
    {
        path: '', canActivate: [ComprehensiveEnableGuard],
        children: [
            { path: COMPREHENSIVE_ROUTES.ROOT, component: ComprehensiveComponent },
            { path: COMPREHENSIVE_ROUTES.GETTING_STARTED, component: MyProfileComponent },
            { path: COMPREHENSIVE_ROUTES.DEPENDANT_DETAILS, component: DependantsDetailsComponent },
            { path: COMPREHENSIVE_ROUTES.DEPENDANT_DETAILS_SUMMARY + '/:summary', component: DependantsDetailsComponent },
            { path: COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_LIST, component: DependantEducationListComponent },
            { path: COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_LIST_SUMMARY + '/:summary', component: DependantEducationListComponent },
            { path: COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_PREFERENCE, component: EducationPreferenceComponent },
            { path: COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_SELECTION, component: DependantEducationSelectionComponent },
            {
                path: COMPREHENSIVE_ROUTES.DEPENDANT_EDUCATION_SELECTION_SUMMARY + '/:summary',
                component: DependantEducationSelectionComponent
            },
            { path: COMPREHENSIVE_ROUTES.MY_EARNINGS, component: MyEarningsComponent },
            { path: COMPREHENSIVE_ROUTES.MY_SPENDINGS, component: MySpendingsComponent },
            { path: COMPREHENSIVE_ROUTES.REGULAR_SAVING_PLAN, component: RegularSavingPlanComponent },
            { path: COMPREHENSIVE_ROUTES.MY_ASSETS, component: MyAssetsComponent },
            { path: COMPREHENSIVE_ROUTES.MY_LIABILITIES, component: MyLiabilitiesComponent },
            { path: COMPREHENSIVE_ROUTES.MY_LIABILITIES_SUMMARY + '/:summary', component: MyLiabilitiesComponent },
            { path: COMPREHENSIVE_ROUTES.STEPS + '/:stepNo', component: ComprehensiveStepsComponent },
            { path: COMPREHENSIVE_ROUTES.BAD_MOOD_FUND, component: BadMoodFundComponent },
            { path: COMPREHENSIVE_ROUTES.PROGRESS_TRACKER, component: ProgressTrackerComponent },
            { path: COMPREHENSIVE_ROUTES.DEPENDANT_SELECTION, component: DependantSelectionComponent },
            { path: COMPREHENSIVE_ROUTES.DEPENDANT_SELECTION_SUMMARY + '/:summary', component: DependantSelectionComponent },
            { path: COMPREHENSIVE_ROUTES.RETIREMENT_PLAN, component: RetirementPlanComponent },
            { path: COMPREHENSIVE_ROUTES.RETIREMENT_PLAN_SUMMARY + '/:summary', component: RetirementPlanComponent },
            { path: COMPREHENSIVE_ROUTES.INSURANCE_PLAN, component: InsurancePlanComponent },
            { path: COMPREHENSIVE_ROUTES.INSURANCE_PLAN_SUMMARY + '/:summary', component: InsurancePlanComponent },
            { path: COMPREHENSIVE_ROUTES.RESULT, component: ResultComponent },
            { path: COMPREHENSIVE_ROUTES.ENQUIRY, component: EnquiryComponent },
            { path: COMPREHENSIVE_ROUTES.VALIDATE_RESULT, component: ValidateResultComponent },
            { path: COMPREHENSIVE_ROUTES.RISK_PROFILE, redirectTo: COMPREHENSIVE_ROUTES.RISK_PROFILE + '/1' },
            { path: COMPREHENSIVE_ROUTES.RISK_PROFILE + '/1', component: RiskProfileComponent, data: [{param: 1}] },
            { path: COMPREHENSIVE_ROUTES.RISK_PROFILE + '/2', component: RiskProfileComponent, data: [{param: 2}]  },
            { path: COMPREHENSIVE_ROUTES.RISK_PROFILE + '/3', component: RiskProfileComponent, data: [{param: 3}]  },
            { path: COMPREHENSIVE_ROUTES.RISK_PROFILE + '/4', component: RiskProfileComponent, data: [{param: 4}]  },
            { path: COMPREHENSIVE_ROUTES.REVIEW, component: ComprehensiveReviewComponent},
            { path: COMPREHENSIVE_ROUTES.SPEAK_TO_ADVISOR, component: ComprehensiveReviewComponent}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: []
})
export class ComprehensiveRoutingModule { }
