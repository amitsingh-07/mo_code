import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Util } from '../shared/utils/util';
import { ErrorModalComponent } from '../shared/modal/error-modal/error-modal.component';
import { ToolTipModalComponent } from '../shared/modal/tooltip-modal/tooltip-modal.component';
import { SignUpService } from './../sign-up/sign-up.service';
import { WillWritingFormData } from './will-writing-form-data';
import { WillWritingFormError } from './will-writing-form-error';
import { IAboutMe, IBeneficiary, IChild, IEligibility, IExecTrustee, IGuardian, IPromoCode, ISpouse } from './will-writing-types';
import { WILL_WRITING_CONFIG } from './will-writing.constants';
import { Subject } from 'rxjs';

const SESSION_STORAGE_KEY = 'app_will_writing_session';
const FROM_CONFIRMATION_PAGE = 'from_confirmation_page';
const IS_WILL_CREATED = 'is_will_created';
const WILL_CREATED_PRELOGIN = 'will_created_prelogin';

@Injectable({
  providedIn: 'root'
})
export class WillWritingService {
  private willWritingFormData: WillWritingFormData = new WillWritingFormData();
  private willWritingFormError: any = new WillWritingFormError();
  fromConfirmationPage;
  isWillCreated;
  clearExecTrustee = false;

  private relationship: any = new Map([
    ['P', 'parent'],
    ['SBL', 'sibling'],
    ['PIL', 'parent-in-law'],
    ['F', 'friend'],
    ['R', 'relative'],
    ['S', 'spouse'],
    ['C', 'child'],
  ]);

  private maritalStatus: any = new Map([
    ['S', 'single'],
    ['M', 'married'],
    ['D', 'divorced'],
    ['W', 'widowed']
  ]);

  private gender: any = new Map([
    ['M', 'male'],
    ['F', 'female']
  ]);

  constructor(
    private modal: NgbModal,
    private signUpService: SignUpService,
  ) {
    // get data from session storage
    this.getWillWritingFormData();
    this.getFromConfirmPage();
    this.getIsWillCreated();
  }
  sub = new Subject();
  yesTrigger(val: String){
    this.sub.next(val);
  }

  /**
   * set will writing form data from session storage when reload happens.
   */
  getWillWritingFormData(): WillWritingFormData {
    if (window.sessionStorage && sessionStorage.getItem(SESSION_STORAGE_KEY)) {
      this.willWritingFormData = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY));
    }
    return this.willWritingFormData;
  }

  /**
   * save data in session storage.
   */
  commit() {
    if (window.sessionStorage) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.willWritingFormData));
    }
  }

  /**
   * clear session storage data.
   */
  clearData() {
    if (window.sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(FROM_CONFIRMATION_PAGE);
      sessionStorage.removeItem(IS_WILL_CREATED);
      sessionStorage.removeItem(WILL_CREATED_PRELOGIN);
    }
  }

  clearServiceData() {
    this.clearData();
    this.willWritingFormData = {} as WillWritingFormData;
    this.fromConfirmationPage = null;
    this.isWillCreated = null;
  }

  isUserLoggedIn(): boolean {
    const userInfo = this.signUpService.getUserProfileInfo();
    return userInfo && userInfo.firstName;
  }

  clearWillWritingData(isMaritalStatusChanged) {
    if (isMaritalStatusChanged) {
      this.willWritingFormData.spouse = [];
    }
    this.willWritingFormData.guardian = [];
    this.willWritingFormData.beneficiary = [];
    this.willWritingFormData.execTrustee = [];
  }

  updateSpouseInfo(data) {
    // update spouse in guardian
    if (this.getGuardianInfo().length > 0) {
      const spouseGuardian = this.getGuardianInfo();
      spouseGuardian[0].name = data.name;
      spouseGuardian[0].uin = data.uin;
      this.setGuardianInfo(spouseGuardian);
    }

    // update spouse in beneficiary
    if (this.getBeneficiaryInfo().length > 0) {
      const spouseBeneficiary = this.getBeneficiaryInfo();
      spouseBeneficiary[0].name = data.name;
      spouseBeneficiary[0].uin = data.uin;
      this.setBeneficiaryInfo(spouseBeneficiary);
    }

    // update spouse in executor and trustee
    if (this.getExecTrusteeInfo().length > 0) {
      const spouseExecTrustee = this.getExecTrusteeInfo();
      const index = spouseExecTrustee.findIndex((execTrustee) =>
        execTrustee.relationship === WILL_WRITING_CONFIG.SPOUSE);
      if (index > -1) {
        spouseExecTrustee[index].name = data.name;
        spouseExecTrustee[index].uin = data.uin;
        this.setExecTrusteeInfo(spouseExecTrustee);
      }
    }
  }

  updateChildrenInfo(data) {
    const childrenBeneficiary = this.getBeneficiaryInfo();
    const childrenList = this.getChildrenInfo();
    let i = this.getSpouseInfo().length > 0 ? 1 : 0;
    for (const children of data) {
      if (children.name !== childrenList[0].name || children.uin !== childrenList[0].uin || children.dob !== childrenList[0].dob) {
        childrenBeneficiary[i].name = children.name;
        childrenBeneficiary[i].uin = children.uin;
        childrenBeneficiary[i].dob = children.dob;
      }
      i++;
    }
    this.setBeneficiaryInfo(childrenBeneficiary);
  }

  updateExecTrusteeInfo(data) {
    const childrenList = this.getChildrenInfo();
    const execTrusteeList = this.getExecTrusteeInfo();
    childrenList.forEach((child, index) => {
      const execIndex = execTrusteeList.findIndex((exec) => (exec.uin).toLowerCase() === (child.uin).toLowerCase());
      if (execIndex > -1) {
        execTrusteeList[execIndex].name = data[index].name;
        execTrusteeList[execIndex].uin = data[index].uin;
      }
    });
    this.setExecTrusteeInfo(execTrusteeList);
  }

  /**
   * get form errors.
   * @param form - form details.
   * @returns first error of the form.
   */
  getFormError(form, formName) {
    const controls = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.willWritingFormError[formName].formFieldErrors.errorTitle;
    for (const name in controls) {
      if (controls[name].invalid) {
        errors.errorMessages.push(
          this.willWritingFormError[formName].formFieldErrors[name][Object.keys(controls[name]['errors'])[0]].errorMessage);
      }
    }
    return errors;
  }

  /**
   * get form errors.
   * @param form - form details.
   * @returns first error of the form.
   */
  getMultipleFormError(form, formName, formTitle) {
    const forms = form.controls;
    const errors: any = {};
    errors.errorMessages = [];
    errors.title = this.willWritingFormError[formName].formFieldErrors.errorTitle;
    let index = 0;

    // tslint:disable-next-line:forin
    for (const field in forms) {
      for (const control of forms[field].controls) {
        const formGroup = { formName: '', errors: [] };
        // tslint:disable-next-line:forin
        for (const name in control.controls) {
          formGroup.formName = formTitle[index];
          if (control.controls[name].invalid) {
            formGroup.errors.push(
              this.willWritingFormError[formName].formFieldErrors[field][name][Object.keys(control.controls[name]['errors'])
              [0]].errorMessage);
          }
        }
        if (formGroup.errors.length > 0) {
          errors.errorMessages.push(formGroup);
        }
        index++;
      }
    }
    return errors;
  }

  /**
   * get about me details.
   * @returns about me details.
   */
  getAboutMeInfo(): IAboutMe {
    if (!this.willWritingFormData.aboutMe) {
      this.willWritingFormData.aboutMe = {} as IAboutMe;
    }
    return this.willWritingFormData.aboutMe;
  }

  /**
   * set about me details.
   * @param data - about me details.
   */
  setAboutMeInfo(data: IAboutMe) {
    if (Object.keys(this.getAboutMeInfo()).length !== 0) {
      const isMaritalStatusChanged = this.getAboutMeInfo().maritalStatus !== data.maritalStatus &&
        (this.getAboutMeInfo().maritalStatus === WILL_WRITING_CONFIG.MARRIED || data.maritalStatus === WILL_WRITING_CONFIG.MARRIED);
      const isNoOfChildrenChanged = this.getAboutMeInfo().noOfChildren !== data.noOfChildren;
      if (isMaritalStatusChanged || isNoOfChildrenChanged) {
        if (this.getAboutMeInfo().noOfChildren > data.noOfChildren) {
          this.willWritingFormData.children = this.willWritingFormData.children.slice(0, data.noOfChildren);
        }
        this.clearWillWritingData(isMaritalStatusChanged);
      }
    }
    this.willWritingFormData.aboutMe = data;
    this.commit();
  }

  /**
   * get spouse details.
   * @returns spouse details.
   */
  getSpouseInfo(): ISpouse[] {
    if (!this.willWritingFormData.spouse) {
      this.willWritingFormData.spouse = [] as ISpouse[];
    }
    return this.willWritingFormData.spouse;
  }

  /**
   * set spouse details.
   * @param data - spouse details.
   */
  setSpouseInfo(data: ISpouse) {
    if (this.getSpouseInfo().length > 0 && (this.getSpouseInfo()[0].name !== data.name || this.getSpouseInfo()[0].uin !== data.uin)) {
      this.updateSpouseInfo(data);
    }
    this.willWritingFormData.spouse = [];
    data.relationship = WILL_WRITING_CONFIG.SPOUSE;
    this.willWritingFormData.spouse.push(data);
    this.commit();
  }

  /**
   * get children details.
   * @returns children details.
   */
  getChildrenInfo(): IChild[] {
    if (!this.willWritingFormData.children) {
      this.willWritingFormData.children = [] as IChild[];
    }
    return this.willWritingFormData.children;
  }

  /**
   * set children details.
   * @param data - children details.
   */
  setChildrenInfo(data: IChild[]) {
    if (this.getChildrenInfo().length > 0) {
      if (this.getBeneficiaryInfo().length > 0) {
        this.updateChildrenInfo(data);
      }
      if (this.getGuardianInfo().length > 0 && !this.checkChildrenAge(data)) {
        this.willWritingFormData.guardian = [];
      }
      if (this.getExecTrusteeInfo().filter((execData) => execData.relationship === WILL_WRITING_CONFIG.CHILD).length > 0) {
        this.updateExecTrusteeInfo(data);
      }
      if (this.clearExecTrustee) {
        this.willWritingFormData.execTrustee = [];
        this.clearExecTrustee = false;
      }
    }
    this.willWritingFormData.children = [];
    let i = 1;
    for (const children of data) {
      children.relationship = WILL_WRITING_CONFIG.CHILD;
      children.pos = i;
      const formattedValue = this.formatDob(children.dob);
      children.formatedDob = formattedValue;
      this.willWritingFormData.children.push(children);
      i++;
    }
    this.commit();
  }

  formatDob(value) {
    if (value) {
      const date = Util.padNumber(value['day'].toString());
      const month = Util.padNumber(value['month'].toString());
      const year = value['year'] + '';
      const returnValue = `${date}/${month}/${year}`;
      return returnValue;
    }
    return value;
  }

  /**
   * get guardian details.
   * @returns guardian details.
   */
  getGuardianInfo(): IGuardian[] {
    if (!this.willWritingFormData.guardian) {
      this.willWritingFormData.guardian = [] as IGuardian[];
    }
    return this.willWritingFormData.guardian;
  }

  /**
   * set guardian details.
   * @param data - guardian details.
   */
  setGuardianInfo(data: IGuardian[]) {
    this.willWritingFormData.guardian = data;
    this.commit();
  }

  /**
   * get eligibility details.
   * @returns eligibility details.
   */
  getEligibilityDetails(): IEligibility {
    if (!this.willWritingFormData.eligibility) {
      this.willWritingFormData.eligibility = {} as IEligibility;
    }
    return this.willWritingFormData.eligibility;
  }

  /**
   * set eligibility details.
   * @param data - eligibility details.
   */
  setEligibilityDetails(data: IEligibility) {
    this.willWritingFormData.eligibility = data;
    this.commit();
  }

  /**
   * get PromoCode details.
   * @returns PromoCode details.
   */
  getPromoCode(): IPromoCode {
    if (!this.willWritingFormData.promoCode) {
      this.willWritingFormData.promoCode = {} as IPromoCode;
    }
    return this.willWritingFormData.promoCode;
  }

  /**
   * get guardian details.
   * @returns guardian details.
   */
  getExecTrusteeInfo(): IExecTrustee[] {
    if (!this.willWritingFormData.execTrustee) {
      this.willWritingFormData.execTrustee = [] as IExecTrustee[];
    }
    return this.willWritingFormData.execTrustee;
  }

  /**
   * set guardian details.
   * @param data - guardian details.
   */
  setExecTrusteeInfo(data: IExecTrustee[]) {
    this.willWritingFormData.execTrustee = data;
    this.commit();
  }

  /**
   * set PromoCode details.
   * @param data - PromoCode details.
   */
  setPromoCode(data: IPromoCode) {
    this.willWritingFormData.promoCode = data;
    this.commit();
  }

  /**
   * get Beneficiary details.
   * @returns Beneficiary details.
   */
  getBeneficiaryInfo(): IBeneficiary[] {
    if (!this.willWritingFormData.beneficiary) {
      this.willWritingFormData.beneficiary = [] as IBeneficiary[];
    }
    return this.willWritingFormData.beneficiary;
  }

  /**
   * set Beneficiary details.
   * @param data - Beneficiary details.
   */
  setBeneficiaryInfo(data: IBeneficiary[]) {
    this.willWritingFormData.beneficiary = data;
    this.commit();
  }

  /**
   * get PromoCode details.
   * @returns PromoCode details.
   */
  getEnquiryId(): number {
    if (!this.willWritingFormData.enquiryId) {
      this.willWritingFormData.enquiryId = {} as number;
    }
    return this.willWritingFormData.enquiryId;
  }

  /**
   * set PromoCode details.
   * @param data - PromoCode details.
   */
  setEnquiryId(data: number) {
    this.willWritingFormData.enquiryId = data;
    this.commit();
  }

  checkBeneficiaryAge() {
    const beneficiaries = this.getBeneficiaryInfo().filter((beneficiary) =>
      beneficiary.relationship === 'child' && beneficiary.selected === true);
    return this.checkChildrenAge(beneficiaries);
  }

  checkChildrenAge(childrens): boolean {
    for (const children of childrens) {
      const dob = children.dob;
      const today = new Date();
      const birthDate = new Date(dob['year'] + '/' + dob['month'] + '/' + dob['day']);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < WILL_WRITING_CONFIG.CHILD_GUARDIAN_AGE) {
        return true;
      }
    }
    return false;
  }

  openToolTipModal(title: string, message: string) {
    const ref = this.modal.open(ToolTipModalComponent, { centered: true, windowClass: 'will-custom-modal' });
    ref.componentInstance.tooltipTitle = title;
    ref.componentInstance.tooltipMessage = message;
    return false;
  }

  openErrorModal(title: string, message: string, isMultipleForm: boolean, formName?: string) {
    const ref = this.modal.open(ErrorModalComponent, { centered: true, windowClass: 'will-custom-modal' });
    ref.componentInstance.errorTitle = title;
    if (!isMultipleForm) {
      ref.componentInstance.formName = formName;
      ref.componentInstance.errorMessageList = message;
    } else {
      ref.componentInstance.multipleFormErrors = message;
    }
    return false;
  }

  setFromConfirmPage(flag) {
    if (window.sessionStorage) {
      sessionStorage.setItem(FROM_CONFIRMATION_PAGE, flag);
    }
    this.fromConfirmationPage = flag;
  }

  getFromConfirmPage() {
    if (window.sessionStorage && sessionStorage.getItem(FROM_CONFIRMATION_PAGE)) {
      this.fromConfirmationPage = JSON.parse(sessionStorage.getItem(FROM_CONFIRMATION_PAGE));
    }
    return this.fromConfirmationPage;
  }

  setIsWillCreated(flag) {
    if (window.sessionStorage) {
      sessionStorage.setItem(IS_WILL_CREATED, flag);
    }
    this.isWillCreated = flag;
  }

  getIsWillCreated() {
    if (window.sessionStorage && sessionStorage.getItem(IS_WILL_CREATED)) {
      this.isWillCreated = JSON.parse(sessionStorage.getItem(IS_WILL_CREATED));
    }
    return this.isWillCreated;
  }

  checkBeneficiary(uin) {
    return this.getBeneficiaryInfo().filter((data) => data.uin === uin && data.selected === true);
  }

  checkExecTrustee(uin) {
    return this.getExecTrusteeInfo().filter((data) => (data.uin).toLowerCase() === uin.toLowerCase());
  }

  checkChildAgeExecTrustee(form) {
    const execTrusteeList = this.getExecTrusteeInfo().filter((data) => data.relationship === WILL_WRITING_CONFIG.CHILD);
    if (execTrusteeList.length > 0) {
      const children = this.getChildrenInfo();
      let i = 0;
      for (const item of children) {
        const oldChildrenData = execTrusteeList.filter((data) => (data.uin).toLowerCase() === (item.uin).toLowerCase());
        if (oldChildrenData.length > 0) {
          return this.checkChildrenAge([form.value.children[i]]);
        }
        i++;
      }
    }
    return false;
  }

  checkUinExecTrustee(form) {
    const execTrusteeList = this.getExecTrusteeInfo().filter((data) => data.relationship !== WILL_WRITING_CONFIG.CHILD
      && data.relationship !== WILL_WRITING_CONFIG.SPOUSE);
    if (execTrusteeList.length > 0) {
      let myFamily = [];
      if (this.getSpouseInfo().length > 0) {
        myFamily = [...form.value.spouse];
      }
      if (this.getChildrenInfo().length > 0) {
        myFamily = [...myFamily, ...form.value.children];
      }
      for (const item of myFamily) {
        const oldChildrenData = execTrusteeList.filter((data) => (data.uin).toLowerCase() === (item.uin).toLowerCase());
        if (oldChildrenData.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  checkDuplicateUin(members: any[]) {
    const groupUin: any = {};
    let isDuplicate = false;
    for (const member of members) {
      const uin = (member.uin).toLowerCase();
      if (uin in groupUin) {
        isDuplicate = true;
      } else {
        groupUin[uin] = [];
      }
      groupUin[uin].push(member);
    }

    if (!isDuplicate) {
      return true;
    }

    const errors: any = {};
    errors.errorMessages = [];
    const errorMsg = { formName: '', errors: [] };
    errorMsg.errors.push('The following profiles should not have the same Identification Number:');
    for (const uin in groupUin) {
      if (groupUin.hasOwnProperty(uin) && groupUin[uin].length > 1) {
        for (const val of groupUin[uin]) {
          errorMsg.errors.push(val['name'] + ' (' + val['uin'] + ')');
        }
      }
    }
    errors.errorMessages.push(errorMsg);
    return this.openErrorModal('Oops! Please take note of the following:', errors.errorMessages, true);
  }

  checkUinNameRelationship(source: any, target: any) {
    if ((source.uin).toLowerCase() !== (target.uin).toLowerCase()) {
      return false;
    }
    return (source.name).toLowerCase() !== (target.name).toLowerCase() ||
      (source.relationship).toLowerCase() !== (target.relationship).toLowerCase();
  }

  compareValues(sources: any, targets: any, section1: string, section2: string) {
    const errors = [];
    for (const source of sources) {
      for (const target of targets) {
        if (this.checkUinNameRelationship(source, target)) {
          errors.push(`The ${source.name}/${source.relationship} for ${source.uin} in ${section1} section
              does not match the ${target.name}/${target.relationship} defined for the same profile in ${section2} section.`);
        }
      }
    }
    return errors;
  }

  checkDuplicateUinAll() {
    const errors: any = {};
    errors.errorMessages = [];
    const errorMsg = { formName: '', errors: [] };
    let myFamily = [];
    let guardians = [];
    let beneficiaries = this.getBeneficiaryInfo().filter((data) => data.relationship !== WILL_WRITING_CONFIG.SPOUSE
      && data.relationship !== WILL_WRITING_CONFIG.CHILD);
    beneficiaries = [...beneficiaries];
    const executorTrustee = [...this.getExecTrusteeInfo()];
    if (this.getAboutMeInfo().maritalStatus === WILL_WRITING_CONFIG.MARRIED) {
      myFamily = [...this.getSpouseInfo()];
    }
    if (this.getAboutMeInfo().noOfChildren !== 0) {
      myFamily = [...myFamily, ...this.getChildrenInfo()];
      if (this.checkChildrenAge(this.getChildrenInfo())) {
        guardians = [...this.getGuardianInfo()];
      }
    }
    const compFamilyWithGuardian = this.compareValues(myFamily, guardians, 'About My Family', 'My Children\'s Guardian');
    const compFamilyWithExec = this.compareValues(myFamily, executorTrustee, 'About My Family', 'My Executor & Trustee');
    const compGuardianWithBene = this.compareValues(guardians, beneficiaries, 'My Children\'s Guardian', 'My Beneficiaries');
    const compGuardianWithExec = this.compareValues(guardians, executorTrustee, 'My Children\'s Guardian', 'My Executor & Trustee');
    const compBeneWithExec = this.compareValues(beneficiaries, executorTrustee, 'My Beneficiaries', 'My Executor & Trustee');
    errorMsg.errors = [...compFamilyWithGuardian, ...compFamilyWithExec,
    ...compGuardianWithBene, ...compGuardianWithExec, ...compBeneWithExec];
    if (errorMsg.errors.length === 0) {
      return true;
    }
    errorMsg.errors = errorMsg.errors.slice(0, 2);
    errors.errorMessages.push(errorMsg);
    return this.openErrorModal('Oops! Please take note of the following:', errors.errorMessages, true);
  }

  convertWillFormData(data) {
    const will: WillWritingFormData = new WillWritingFormData();
    will.aboutMe = {
      name: data.willProfile.name,
      uin: data.willProfile.uin,
      gender: this.gender.get(data.willProfile.genderCode),
      maritalStatus: this.maritalStatus.get(data.willProfile.maritalStatusCode),
      noOfChildren: data.willProfile.noOfChildren,
      isEngSpeaker: data.willProfile?.isEngSpeaker === 'Y' ? true : false
    };
    will.spouse = [];
    will.children = [];
    will.guardian = [];
    will.beneficiary = [];
    will.execTrustee = [];
    let pos = 0;
    for (const profileMembers of data.willProfileMembers) {
      const members: any = {
        name: profileMembers.name,
        relationship: this.relationship.get(profileMembers.relationshipCode),
        uin: profileMembers.uin
      };
      if (profileMembers.isFamily === 'Y') {
        if (profileMembers.relationshipCode === 'S') {
          will.spouse.push(JSON.parse(JSON.stringify(members)));
        } else if (profileMembers.relationshipCode === 'C') {
          members['dob'] = {
            year: Number(profileMembers.dob.substr(0, 4)),
            month: Number(profileMembers.dob.substr(4, 2)),
            day: Number(profileMembers.dob.substr(6, 2))
          };
          members['formatedDob'] = profileMembers.dob.substr(6, 2) + '/' +
            profileMembers.dob.substr(4, 2) + '/' +
            profileMembers.dob.substr(0, 4);
          members['pos'] = ++pos;
          will.children.push(JSON.parse(JSON.stringify(members)));
        }
      }
      if (profileMembers.isGuardian === 'Y' || profileMembers.isAltGuardian === 'Y') {
        members['isAlt'] = profileMembers.isAltGuardian === 'Y';
        will.guardian.push(JSON.parse(JSON.stringify(members)));
      }
      if (profileMembers.isTrusteee === 'Y' || profileMembers.isAltTrusteee === 'Y') {
        members['isAlt'] = profileMembers.isAltTrusteee === 'Y';
        will.execTrustee.push(JSON.parse(JSON.stringify(members)));
      }
      if (profileMembers.isBeneficiary === 'Y' || profileMembers.isFamily === 'Y') {
        if (members.hasOwnProperty('isAlt')) {
          delete members['isAlt'];
        }
        members['selected'] = profileMembers.isBeneficiary === 'Y';
        members['distPercentage'] = profileMembers.isBeneficiary === 'Y' ? profileMembers.distribution : 0;
        will.beneficiary.push(JSON.parse(JSON.stringify(members)));
      }
    }
    if (will.execTrustee[0].isAlt) {
      const [altExecutor, mainExecutor] = will.execTrustee;
      will.execTrustee[0] = mainExecutor;
      will.execTrustee[1] = altExecutor;
    }
    if (will.spouse.length > 0 && will.guardian.length === 1) {
      delete will.guardian;
    }
    this.willWritingFormData = will;
    this.commit();
  }

  setWillCreatedPrelogin() {
    if (window.sessionStorage) {
      sessionStorage.setItem(WILL_CREATED_PRELOGIN, 'true');
    }
  }

  getWillCreatedPrelogin() {
    return sessionStorage.getItem(WILL_CREATED_PRELOGIN);
  }

}
