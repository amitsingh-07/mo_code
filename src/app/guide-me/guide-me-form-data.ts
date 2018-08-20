import { FormArray, FormGroup } from '@angular/forms';
import { IMyExpenses } from './expenses/expenses.interface';
import { IMyIncome } from './income/income.interface';
import { IMyLiabilities } from './liabilities/liabilities.interface';
import { IDependent } from './life-protection/life-protection-form/dependent.interface';
import { ProtectionNeeds } from './protection-needs/protection-needs';

export class GuideMeFormData implements IMyIncome, IMyExpenses, IMyLiabilities {
    myProfile: number;
    email: string;
    gender: string;
    dob: string;
    customDob: string;
    smoker: string;
    dependent: number;
    protectionNeedData: ProtectionNeeds;
    lifeProtectionData: IDependent[];

    // My Income
    monthlySalary: number;
    annualBonus: number;
    otherIncome: number;

    // My Expenses
    monthlyInstallment: number;
    otherExpenses: number;

    // My Assets
    cash: number;
    cpf: number;
    homeProperty: number;
    investmentProperties: number;
    investments: number;
    otherAssets: number;

    // My Liabilities
    propertyLoan: number;
    carLoan: number;
    otherLiabilities: number;

    // Critical Illness Assessment
    ciCoverageAmt: number;
    annualSalary: number;
    ciMultiplier: number;
    untilRetirementAge: number;

    // Occupational Disability
    coverageAmount: number;
    retirementAge: number;
    selectedEmployee: string;
    sliderValue: number;

    // Long Term Care
    longTermCareData: string;

    // Hospital Plan
    hospitalPlanData: string;
}
