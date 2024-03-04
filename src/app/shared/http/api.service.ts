import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IEnquiryUpdate, ISignUp, IVerifyRequestOTP } from '../../sign-up/signup-types';
import { LoaderService } from './../components/loader/loader.service';
import { IRecommendationRequest } from './../interfaces/recommendations.request';
import { apiConstants } from './api.constants';
import { AuthenticationService } from './auth/authentication.service';
import { BaseService } from './base.service';
import { IServerResponse } from './interfaces/server-response.interface';
import { investmentApiConstants } from '../../investment/investment.api.constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private errorMessage = new BehaviorSubject({});
  public newErrorMessage = this.errorMessage.asObservable();
  private handleErrorFlag = '?handleError=true';
  private errorTag = 'An error occurred:';
  private errorTryAgain = 'Something bad happened; please try again later.';

  constructor(
    private http: BaseService,
    public authService: AuthenticationService,
    private httpClient: HttpClient,
    private router: Router,
    private loaderService: LoaderService) { }

  private handleError(error: HttpErrorResponse) {
    this.loaderService.hideLoader();
    if (error) {
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error(this.errorTag, error.error.message);
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`);
        return throwError('API returned error response');
      }
    }
    // return an observable with a user-facing error message
    return throwError(
      this.errorTryAgain);
  }

  getProfileList() {
    return this.http.get(apiConstants.endpoint.getProfileList)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getLongTermCareList() {
    return this.http.get(apiConstants.endpoint.getLongTermCareList)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getHospitalPlanList(queryParam?: string) {
    let query = '';
    if (queryParam) {
      query = '?' + queryParam;
    }
    return this.http.get(apiConstants.endpoint.getHospitalPlanList + query)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  // -------------------------- ARTICLES MODULE ---------------------------------------
  getRecentArticles(quantity?: number) {
    const payload = { number: 0 };
    if (quantity) {
      payload.number = quantity;
    }
    return this.http.post(apiConstants.endpoint.article.getRecentArticles, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getArticleData(art_id) {
    const payload = { article_id: art_id };
    return this.http.post(apiConstants.endpoint.article.getArticle + '/' + art_id, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getRelatedArticle(in_tag_id: number) {
    const payload = { tag_id: in_tag_id };
    return this.http.post(apiConstants.endpoint.article.getRelatedArticle + '/' + in_tag_id, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getArticleCategory() {
    const payload = null;
    return this.http.post(apiConstants.endpoint.article.getArticleCategory, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getArticleCategoryList(category_id) {
    const urlAddOn = category_id;
    const payload = null;
    if (urlAddOn === -1) {
      return this.http.post(apiConstants.endpoint.article.getArticleCategoryAllList, payload)
        .pipe(
          catchError((error: HttpErrorResponse) => this.handleError(error))
        );
    } else {
      return this.http.post(apiConstants.endpoint.article.getArticleCategoryList + '/' + urlAddOn, payload)
        .pipe(
          catchError((error: HttpErrorResponse) => this.handleError(error))
        );
    }
  }

  // ---------------------------- ABOUT US MODULE ----------------------------
  getCustomerReviewList() {
    // tslint:disable-next-line:no-commented-code
    const payload = {};
    return this.http.post(apiConstants.endpoint.aboutus.getCustomerReviews, payload, true)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  sendContactUs(data) {
    const payload = {
      toEmail: data.email,
      subject: data.subject,
      body: data.message,
      custEmail: data.emailAddress,
      custContactNo: data.contactNumber.toString()
    };
    return this.http.post(apiConstants.endpoint.aboutus.sendContactUs, payload, true)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /* Subscribe Newsletter */
  subscribeNewsletter(data) {
    const payload = data;
    return this.http.post(apiConstants.endpoint.subscription.base + this.handleErrorFlag, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.throwSubscribeError(error))
      );
  }

  throwSubscribeError(error: HttpErrorResponse) {
    const templateError = {
      body: 'default',
      detail: 'default',
      status: 500
    };
    this.errorMessage.next(templateError);
    return throwError('');
  }

  /* MyInfo */
  getMyInfoData(data) {
    return this.http.post(apiConstants.endpoint.getMyInfoValues, data, true)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  // activate link new api
  getSingpassAccountData(data) {
    return this.http.post(apiConstants.endpoint.getSingpassAccount, data, true)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /* create account  */
  getCreateAccountMyInfoData(data) {
    return this.http.post(apiConstants.endpoint.getCreateAccountMyInfoValue, data, true)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getProtectionNeedsList(userInfoForm) {
    return this.http.post(apiConstants.endpoint.getProtectionTypesList, userInfoForm)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getRecommendations(payload: IRecommendationRequest) {
    return this.http.post(apiConstants.endpoint.getRecommendations, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getCustomerInsuranceDetails() {
    return this.http.get(apiConstants.endpoint.getCustomerInsuranceDetails)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  /* SignUp API */
  requestVerifyMobile(): string {
    return '000000';
  }

  getCountryCodeList() {
    const url = 'assets/country-data/phone.json';
    return this.httpClient.get(url);
  }

  reCaptchaVerify() {
    return this.http.post(apiConstants.endpoint.captchaVerify, null)
    .pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  createAccount(payload: ISignUp) {
    return this.http.post(apiConstants.endpoint.signUp + this.handleErrorFlag, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error(this.errorTag, error.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
              `Backend returned code ${error.status}, ` + `body was: ${error.error}`
            );
          }
          // return an observable with a user-facing error message
          return throwError(this.errorTryAgain);
        })
      );
  }

  updateAccount(payload) {
    return this.http.post(apiConstants.endpoint.updateUserId, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  requestNewOTP(payload: IVerifyRequestOTP) {
    const resendOTPEditOrSignUpFlow = payload.editProfile === true ?
      apiConstants.endpoint.resendOTP + '?isEditProfile=true' :
      apiConstants.endpoint.resendOTP;
    return this.http.post(resendOTPEditOrSignUpFlow, payload)
      .pipe(
        // tslint:disable-next-line:no-identical-functions
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error(this.errorTag, error.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
              `Backend returned code ${error.status}, ` + `body was: ${error.error}`
            );
          }
          // return an observable with a user-facing error message
          return throwError(this.errorTryAgain);
        })
      );
  }

  requestEmailOTP(payload) {
    return this.http.post(apiConstants.endpoint.sendOTPEmail, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            console.error(this.errorTag, error.error.message);
          } else {
            console.error(
              `Backend returned code ${error.status}, ` + `body was: ${error.error}`
            );
          }
          return throwError(this.errorTryAgain);
        })
      );
  }

  verifyOTP(payload: IVerifyRequestOTP) {
    return this.http.post(apiConstants.endpoint.verifyOTP + this.handleErrorFlag, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error(this.errorTag, error.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
              `Backend returned code ${error.status}, ` + `body was: ${error.error}`
            );
          }
          // return an observable with a user-facing error message
          return throwError(this.errorTryAgain);
        })
      );
  }

  emailValidityCheck(payload) {
    return this.http.post(apiConstants.endpoint.emailValidityCheck + this.handleErrorFlag, payload);
  }

  corporateEmailValidityCheck(payload) {
    return this.http.post(apiConstants.endpoint.corporateEmailValidityCheck + this.handleErrorFlag, payload);
  }

  verifyEmail(payload) {
    return this.http.post(apiConstants.endpoint.verifyEmail + '?handleError=true', payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  sendWelcomeEmail(payload: any) {
    return this.http.post(apiConstants.endpoint.sendWelcomeMail + '?handleError=true', payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  /** Post Login */
  updateInsuranceEnquiry(payload: IEnquiryUpdate) {
    return this.http.post(apiConstants.endpoint.updateProductEnquiry, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getProductCategory() {
    const payload = {
      profileId: '',
      birthDate: '00/00/0000',
      journeyType: 'direct',
      noOfDependents: 0
    };
    return this.http.post(apiConstants.endpoint.getProtectionTypesList, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getGeneratedFrom() {
    const url = '../assets/mock-data/generatedFrom.json';
    return this.http.get(url)
      .pipe( // tslint:disable-next-line
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error(this.errorTag, error.error.message);
          } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
              `Backend returned code ${error.status}, ` + `body was: ${error.error}`
            );
            return this.httpClient.get<IServerResponse>(url);
          }
          // return an observable with a user-facing error message
          return throwError(this.errorTryAgain);
        })
      );
  }

  requestForgotPasswordLink(data) {
    return this.http.post(apiConstants.endpoint.forgotPassword, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  resetEmail(data) {
    return this.http.post(apiConstants.endpoint.resetEmail, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  requestResetPassword(data) {
    return this.http.post(apiConstants.endpoint.resetPassword, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getDirectSearch(payload) {
    return this.http.post(apiConstants.endpoint.getRecommendations, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error);
        })
      );
  }

  directContactMeForm(payload) {
    return this.http.post(apiConstants.endpoint.directContactMeForm, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getInterestedInList() {
    return this.http.get(apiConstants.endpoint.getInterestedInList)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getUserProfileInfo() {
    return this.http.get(apiConstants.endpoint.userProfileInfo)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getTopupInvestmentList() {
    const url = '../../../assets/mock-data/topupInvestmentList.json';
    return this.http.getMock(url)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getEditProfileList() {
    return this.http.get(apiConstants.endpoint.editProfile)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  requestEditPassword(data) {
    return this.http.post(apiConstants.endpoint.editPassword, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  requestUpdateEmployerAddress(data) {
    return this.http.post(apiConstants.endpoint.editEmployerAddress, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  requestEditContact(data) {
    return this.http.post(apiConstants.endpoint.editContactDeatails, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getAllNotifications() {
    return this.http.get(apiConstants.endpoint.notification.getAllNotifications)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getRecentNotifications() {
    return this.http.get(apiConstants.endpoint.notification.getRecentNotifications)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  updateNotifications(data) {
    return this.http.post(apiConstants.endpoint.notification.updateNotifications, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // Verify PromoCode
  verifyPromoCode(promoCode) {
    return this.http.post(apiConstants.endpoint.willWriting.verifyPromoCode, promoCode)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // Get FB PromoCode
  getCustOrgPromoCode(promoCode) {
    return this.http.post(apiConstants.endpoint.getCustOrgPromoCode, promoCode)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  createWill(payload) {
    return this.http.post(apiConstants.endpoint.willWriting.createWill, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  updateWill(payload) {
    return this.http.post(apiConstants.endpoint.willWriting.updateWill, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getWill() {
    return this.http.get(apiConstants.endpoint.willWriting.getWill)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  downloadWill(): Observable<any> {
    return this.http.getBase64String(apiConstants.endpoint.willWriting.downloadWill)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getDetailedCustomerInfo() {
    return this.http.get(apiConstants.endpoint.detailCustomerSummary)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // Resend Email Verification Link
  resendEmailVerification(payload) {
    return this.http.post(apiConstants.endpoint.resendEmailVerification + this.handleErrorFlag, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  // Update Mobile Number
  editMobileNumber(payload) {
    return this.http.post(apiConstants.endpoint.editMobileNumber + this.handleErrorFlag, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  // send bundle enquiry
  sendBundleEnquiry(payload) {
    return this.http.post(apiConstants.endpoint.registerBundleEnquiry + this.handleErrorFlag, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  enquiryByEmail(payload) {
    return this.http.post(apiConstants.endpoint.enquiryByEmail + '?handleError=true', payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  saveNewBank(data) {
    return this.http.post(investmentApiConstants.endpoint.investment.addNewBank, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  saveNewBankProfile(data, customerPortfolioId, isJAAccount) {
    let url = investmentApiConstants.endpoint.investment.addProfileNewBank.replace('$CUSTOMER_PORTFOLIO_ID$', customerPortfolioId).replace('$IS_JOINT_ACCOUNT$', isJAAccount);
    return this.http.post(url, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  saveJAWithdrawalBank(data, customerPortfolioId, isJAAccount, isEngagementJourney) {
    let url = investmentApiConstants.endpoint.investment.addWithdrawalBank.replace('$CUSTOMER_PORTFOLIO_ID$', customerPortfolioId).replace('$IS_JOINT_ACCOUNT$', isJAAccount).replace('$IS_ENGAGEMENT_JOURNEY$', isEngagementJourney);
    return this.http.post(url, data)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // Get customer pop up status
  getPopupStatus(payload) {
    return this.http.post(apiConstants.endpoint.getPopupStatus, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // Set customer pop up status
  setPopupStatus(payload) {
    return this.http.post(apiConstants.endpoint.setPopupStatus, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // Set customer pop up status
  enquireRetirementPlan(payload) {
    return this.http.post(apiConstants.endpoint.enquireRetirementPlan, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // Payment
  getRequestSignature(payload) {
    return this.http.post(apiConstants.endpoint.payment.getRequestSignature, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  cancelPayment(payload) {
    return this.http.post(apiConstants.endpoint.payment.cancelPayment, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getLastSuccessfulSubmittedTs() {
    return this.http.get(apiConstants.endpoint.payment.getLastSuccessfulSubmittedTs)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getCustPromoCodeByCategory(payload) {
    return this.http.post(apiConstants.endpoint.payment.getCustPromoCodeByCategory, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  validateReferralCode(payload) {
    return this.http.post(apiConstants.endpoint.validateReferralCode, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getCustomerInvestmentPromoCode(payload) {
    return this.http.post(apiConstants.endpoint.promoCode.getCustomerInvestmentPromoCode, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  validateInvestPromoCode(payload) {
    return this.http.post(apiConstants.endpoint.promoCode.validateInvestPromoCode, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  saveCustomerPromoCode(payload) {
    return this.http.post(apiConstants.endpoint.promoCode.saveCustomerPromoCode, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  validateUin(payload) {
    return this.http.post(apiConstants.endpoint.customer.validateUIN, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // referral code api
  getReferralCodeData() {
    return this.http.get(apiConstants.endpoint.getReferralCode)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  // referral code api ends
  getRefereeList() {
    return this.http.get(apiConstants.endpoint.getRefereeList)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // fetch cfp checkout page details
  getPaymentCheckoutCfpDetails(payload) {
    return this.http.post(apiConstants.endpoint.payment.getPaymentCheckoutCfpDetails, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getCheckoutSpeakToAdvisor(payload) {
    return this.http.post(apiConstants.endpoint.payment.getCheckoutSpeakToAdvisor, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }
  checkNtucMember(payload) {
    return this.http.post(apiConstants.endpoint.promoCode.checkNtucMember, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  validateCpfPromoCode(payload) {
    return this.http.post(apiConstants.endpoint.promoCode.validatePromo + this.handleErrorFlag, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getOrganisationCode(organisationUUID) {
    return this.http.get(`${apiConstants.endpoint.organisation.getOrganisationCodeByUUID}?uuid=${organisationUUID}`)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  getStateNonce(payload) {
    return this.http.post(apiConstants.endpoint.singpass.getStateNonce, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  loginSingpass(payload) {
    return this.http.post(apiConstants.endpoint.singpass.loginSingpass, payload)
      .pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  // Recommended Card API Calls
  // getCardsByPageSizeAndNo(pageNo, size) {
  //   const URL = apiConstants.endpoint.recommendedCards.getDashboardCards.replace('$PAGE_NO$', pageNo).replace('$SIZE$', size);
  //   const URL1 = 'app/assets/mock-data/card.json';
  //   const URL2 = apiConstants.endpoint.recommendedCards.getDashboardCards1;
  //   return this.http.get(URL1)
  //     .pipe(
  //       catchError((error: HttpErrorResponse) => this.handleError(error))
  //     );
  // }
  getCardsByPageSizeAndNo(pageNo, size){
    return this.httpClient.get("assets/mock-data/card.json");
  }

  dismissCard(cardId) {
    const api = apiConstants.endpoint.recommendedCards.dismissCard.replace('$CARD_ID$', cardId);
    return this.http.put(api, null).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // getCardById(cardId) {
  //   return this.http.get(`${apiConstants.endpoint.recommendedCards.getCardById}${cardId}`)
  //     .pipe(
  //       catchError((error: HttpErrorResponse) => this.handleError(error))
  //     );
  // }
  getCardById(cardId) {
    return this.httpClient.get("assets/mock-data/dynamicCard.json");
  }
}
