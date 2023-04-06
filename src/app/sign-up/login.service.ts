import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs/internal/Subject';

import { ConfigService } from '../config/config.service';
import { ApiService } from '../shared/http/api.service';
import { AppService } from '../app.service';
import { AuthenticationService } from '../shared/http/auth/authentication.service';
import { appConstants } from '../app.constants';
import { COMPREHENSIVE_ROUTE_PATHS } from '../comprehensive/comprehensive-routes.constants';
import { ErrorModalComponent } from '../shared/modal/error-modal/error-modal.component';
import { Formatter } from '../shared/utils/formatter.util';
import { IEnquiryUpdate } from './signup-types';
import { InvestmentAccountService } from '../investment/investment-account/investment-account-service';
import { InvestmentCommonService } from '../investment/investment-common/investment-common.service';
import { INVESTMENT_ACCOUNT_ROUTE_PATHS } from '../investment/investment-account/investment-account-routes.constants';
import { INVESTMENT_COMMON_ROUTES } from '../investment/investment-common/investment-common-routes.constants';
import { LoaderService } from '../shared/components/loader/loader.service';
import { SelectedPlansService } from '../shared/Services/selected-plans.service';
import { SignUpApiService } from './sign-up.api.service';
import { SignUpService } from './sign-up.service';
import { SIGN_UP_ROUTE_PATHS } from './sign-up.routes.constants';
import { StateStoreService } from '../shared/Services/state-store.service';
import { WillWritingService } from '../will-writing/will-writing.service';
import { WILL_WRITING_ROUTE_PATHS } from '../will-writing/will-writing-routes.constants';
import { ModelWithButtonComponent } from '../shared/modal/model-with-button/model-with-button.component';
import { CORPBIZ_ROUTES_PATHS } from '../corpbiz-welcome-flow/corpbiz-welcome-flow.routes.constants';
import { NavbarService } from '../shared/navbar/navbar.service';
import { Util } from '../shared/utils/util';
import { SingpassModalComponent } from '../singpass/singpass-modal/singpass-modal.component';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  private toogleLoginType = new Subject<string>();
  toogleLoginType$ = this.toogleLoginType.asObservable();
  private modalText;
  redirectAfterLogin = '';
  progressModal: boolean;
  enqId = -1;
  journeyType = '';
  isShowUpgradeScreen: boolean;

  constructor(
    private apiService: ApiService,
    private appService: AppService,
    public authService: AuthenticationService,
    public configService: ConfigService,
    public modal: NgbModal,
    private translate: TranslateService,
    private investmentAccountService: InvestmentAccountService,
    private investmentCommonService: InvestmentCommonService,
    private router: Router,
    private loaderService: LoaderService,
    private selectedPlansService: SelectedPlansService,
    private signUpApiService: SignUpApiService,
    private signUpService: SignUpService,
    private stateStoreService: StateStoreService,
    private willWritingService: WillWritingService,
    private navbarService: NavbarService
  ) {
    this.translate.use('en');
    this.translate.get('LOGIN').subscribe((result) => {
      this.modalText = result;
    });
  }

  // non 2fa success login method
  onSuccessLogin(data) {
    this.investmentCommonService.clearAccountCreationActions();
    if (data.objectList[0] && data.objectList[0].customerId) {
      this.appService.setCustomerId(data.objectList[0].customerId);
    }
    this.signUpService.removeCaptchaSessionId();
    const insuranceEnquiry = this.selectedPlansService.getSelectedPlan();
    if (this.checkInsuranceEnquiry(insuranceEnquiry)) {
      this.updateInsuranceEnquiry(insuranceEnquiry, data, true);
    } else {
      this.goToNext();
    }
  }

  goToNext() {
    const investmentRoutes = [INVESTMENT_ACCOUNT_ROUTE_PATHS.ROOT, INVESTMENT_ACCOUNT_ROUTE_PATHS.START];
    const jointAccountRoutes = [INVESTMENT_COMMON_ROUTES.ACCEPT_JA_HOLDER];
    const redirect_url = this.signUpService.getRedirectUrl();
    const routeIndex = jointAccountRoutes.findIndex(x => (redirect_url && redirect_url.indexOf(x) >= 0));
    const journeyType = this.appService.getJourneyType();
    if (this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_COMPREHENSIVE) {
      this.getUserProfileAndNavigate(appConstants.JOURNEY_TYPE_COMPREHENSIVE);
    } else if (redirect_url && investmentRoutes.indexOf(redirect_url) >= 0) {
      this.signUpService.clearRedirectUrl();
      this.getUserProfileAndNavigate(appConstants.JOURNEY_TYPE_INVESTMENT);
    } else if (redirect_url && routeIndex >= 0) {
      this.getUserProfileAndNavigate(appConstants.JOURNEY_TYPE_INVESTMENT);
    } else if (journeyType === appConstants.JOURNEY_TYPE_WILL_WRITING && this.willWritingService.getWillCreatedPrelogin()) {
      this.getUserProfileAndNavigate(appConstants.JOURNEY_TYPE_WILL_WRITING);
    } else {
      if (this.authService.isShowWelcomeFlow) {
        this.redirectAfterLogin = CORPBIZ_ROUTES_PATHS.GET_STARTED;
        this.navbarService.displayingWelcomeFlowContent$.next(true);
      } else if(this.isShowUpgradeScreen) {
        this.redirectAfterLogin = SIGN_UP_ROUTE_PATHS.CORP_BIZ_UPGRADE_SCREEN;
      } else {
        this.redirectAfterLogin = SIGN_UP_ROUTE_PATHS.DASHBOARD;
      }
      this.progressModal = true;
      this.loaderService.hideLoader();
      this.router.navigate([this.redirectAfterLogin]);
    }
  }


  checkInsuranceEnquiry(insuranceEnquiry): boolean {
    return ((this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_DIRECT ||
      this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_GUIDED) &&
      ((insuranceEnquiry.plans && insuranceEnquiry.plans.length > 0)
        || (insuranceEnquiry.enquiryProtectionTypeData && insuranceEnquiry.enquiryProtectionTypeData.length > 0)));
  }

  updateInsuranceEnquiry(insuranceEnquiry, data, clearState = null) {
    const journeyType = (insuranceEnquiry.journeyType === appConstants.JOURNEY_TYPE_DIRECT) ?
      appConstants.INSURANCE_JOURNEY_TYPE.DIRECT : appConstants.INSURANCE_JOURNEY_TYPE.GUIDED;
    const payload: IEnquiryUpdate = {
      customerId: data.objectList[0].customerId || data.objectList[0].customerRef,
      enquiryId: Formatter.getIntValue(insuranceEnquiry.enquiryId),
      selectedProducts: insuranceEnquiry.plans,
      enquiryProtectionTypeData: insuranceEnquiry.enquiryProtectionTypeData,
      journeyType: journeyType
    };
    this.loaderService.hideLoader;
    this.apiService.updateInsuranceEnquiry(payload).subscribe(() => {
      if (clearState) {
        this.selectedPlansService.clearData();
        this.stateStoreService.clearAllStates();
        this.router.navigate(['email-enquiry/success']);
      }
    });
  }

  getUserProfileAndNavigate(journeyType) {
    this.signUpApiService.getUserProfileInfo().subscribe((userInfo) => {
      if (userInfo.responseMessage.responseCode < 6000) {
        if (
          userInfo.objectList &&
          userInfo.objectList.length &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors &&
          userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors.length
        ) {
          this.showCustomErrorModal(
            'Error!',
            userInfo.objectList[userInfo.objectList.length - 1].serverStatus.errors[0].msg
          );
        } else if (userInfo.responseMessage && userInfo.responseMessage.responseDescription) {
          const errorResponse = userInfo.responseMessage.responseDescription;
          this.showCustomErrorModal('Error!', errorResponse);
        } else {
          this.investmentAccountService.showGenericErrorModal();
        }
      } else {
        this.signUpService.setUserProfileInfo(userInfo.objectList);
        if (journeyType === appConstants.JOURNEY_TYPE_COMPREHENSIVE) {
          this.loaderService.showLoader({ title: 'Loading', autoHide: false });
          this.router.navigate([COMPREHENSIVE_ROUTE_PATHS.ROOT], { skipLocationChange: true });
        } else if (journeyType === appConstants.JOURNEY_TYPE_INVESTMENT) {
          this.investmentCommonService.redirectToInvestmentFromLogin(this.authService.getEnquiryId());
        } else if (journeyType === appConstants.JOURNEY_TYPE_WILL_WRITING) {
          this.router.navigate([WILL_WRITING_ROUTE_PATHS.VALIDATE_YOUR_WILL]);
        } else {
          this.router.navigate([SIGN_UP_ROUTE_PATHS.DASHBOARD]);
        }
      }
    },
      (err) => {
        this.investmentAccountService.showGenericErrorModal();
      });
  }

  showCustomErrorModal(title, desc) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true });
    ref.componentInstance.errorTitle = title;
    ref.componentInstance.errorMessage = desc;
  }

  displaySingpassLoginError(data) {
    if (data.responseMessage.responseCode === 5127) {  // Multiple NRIC
      this.displayErrorModal(this.modalText.SINGPASS_MULTIPLE_ACC_MODAL);
    } else if (data.responseMessage.responseCode === 5128) { // Investment Acc Pending
      this.displayErrorModal(this.modalText.SINGPASS_INVESTMENT_ACC_PENDING_MODAL);
    } else { // SingPass Login Unsuccessful
      const ref = this.modal.open(SingpassModalComponent, { centered: true });
      ref.componentInstance.title = this.translate.instant(this.modalText.SINGPASS_LOGIN_FAIL_MODAL.TITLE);
      ref.componentInstance.msgOne = this.translate.instant(this.modalText.SINGPASS_LOGIN_FAIL_MODAL.MESSAGE_1);
      ref.componentInstance.msgTwo = this.translate.instant(this.modalText.SINGPASS_LOGIN_FAIL_MODAL.MESSAGE_2);
      ref.componentInstance.primaryActionLabel = this.translate.instant(this.modalText.SINGPASS_LOGIN_FAIL_MODAL.BACK_BTN);
      ref.componentInstance.primaryAction.subscribe(() => {
        this.toogleLoginType.next('PASSWORD');
        this.modal.dismissAll();
      });
    }
  }

  displayErrorModal(modalMsg) {
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true });
    ref.componentInstance.errorTitle = this.translate.instant(modalMsg.TITLE);
    ref.componentInstance.errorMessageHTML = this.translate.instant(modalMsg.MESSAGE);
  }

  setEnquiryIdAndJourneyType() {
    this.journeyType = this.appService.getJourneyType();
    if (this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_WILL_WRITING &&
      this.willWritingService.getWillCreatedPrelogin()) {
      this.enqId = this.willWritingService.getEnquiryId();
    } else if (this.authService.getEnquiryId()) {
      this.enqId = Number(this.authService.getEnquiryId());
    } else if (this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_DIRECT ||
      this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_GUIDED) {
      const insuranceEnquiry = this.selectedPlansService.getSelectedPlan();
      if (insuranceEnquiry && ((insuranceEnquiry.plans && insuranceEnquiry.plans.length > 0) || (insuranceEnquiry.enquiryProtectionTypeData && insuranceEnquiry.enquiryProtectionTypeData.length > 0))) {
        this.journeyType = (this.appService.getJourneyType() === appConstants.JOURNEY_TYPE_DIRECT) ?
          appConstants.INSURANCE_JOURNEY_TYPE.DIRECT : appConstants.INSURANCE_JOURNEY_TYPE.GUIDED;
        this.enqId = insuranceEnquiry.enquiryId;
      }
    }
    // If the journeyType is not set, default it to 'direct'
    if (Util.isEmptyOrNull(this.journeyType)) {
      this.journeyType = appConstants.JOURNEY_TYPE_DIRECT;
    }
    this.journeyType = this.journeyType.toLowerCase();
  }
}
