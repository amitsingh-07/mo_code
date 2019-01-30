import { ConfigService } from './../../config/config.service';
import { SeoServiceService } from './../../shared/Services/seo-service.service';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IContactUs } from './contact-us.interface';

import { TranslateService } from '@ngx-translate/core';
import { FooterService } from './../../shared/footer/footer.service';
import { NavbarService } from './../../shared/navbar/navbar.service';

import { AuthenticationService } from 'src/app/shared/http/auth/authentication.service';
import { AboutUsApiService } from './../about-us.api.service';
import { AboutUsService } from './../about-us.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  public subject = 'Choose a Subject*';
  public email = 'enquiries@moneyowl.com.sg';

  contactUsForm: FormGroup;
  contactUsFormValues: IContactUs;
  contactUsFormSent: boolean;
  contactUsErrorMessage: string;
  subjectList: any;
  subjectPreset = 'Choose a Subject*';

  public subjectItems: any;
  public sendSuccess = false;

  constructor(
    public navbarService: NavbarService,
    public footerService: FooterService,
    public aboutUsService: AboutUsService,
    public aboutUsApiService: AboutUsApiService,
    public translate: TranslateService,
    public authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private configService: ConfigService,
    private seoService: SeoServiceService
    ) {
      this.authService.authenticate().subscribe((data) => {
      });
      this.contactUsFormSent  = false;
      this.configService.getConfig().subscribe((config) => {
        this.translate.setDefaultLang(config.language);
        this.translate.use(config.language);
      });

      this.translate.get('COMMON').subscribe((result: string) => {
        this.contactUsErrorMessage = this.translate.instant('ERROR.CONTACT_US.EMPTY_TEXT');
        // meta tag and title
        this.seoService.setTitle(this.translate.instant('CONTACT_US.TITLE'));
        this.seoService.setBaseSocialMetaTags(this.translate.instant('CONTACT_US.TITLE'),
                                              this.translate.instant('CONTACT_US.META.META_DESCRIPTION'),
                                              this.translate.instant('CONTACT_US.META.META_KEYWORDS')
                                              );
      });
      this.contactUsFormValues = this.aboutUsService.getContactUs();
      this.contactUsForm = new FormGroup({
        subject: new FormControl(this.contactUsFormValues.subject),
        email: new FormControl(this.contactUsFormValues.email),
        message: new FormControl(this.contactUsFormValues.message, [Validators.required])
      });
    }

  ngOnInit() {
    this.footerService.setFooterVisibility(true);
    this.aboutUsApiService.getSubjectList().subscribe((data) => {
      this.subjectItems = this.aboutUsService.getSubject(data);
    });
  }

  selectSubject(in_subject) {
    this.subject = in_subject.subject;
    this.email = in_subject.email;
  }

  save(form: any) {
    Object.keys(form.controls).forEach((key) => {
    form.get(key).markAsDirty();
    });
    form.value.subject = this.subject;
    form.value.email = this.email;
    this.contactUsFormSent = true;
    form.value.message = form.value.message.replace(/\n/g, '<br/>').replace(/"/g, '\\"');
    this.aboutUsApiService.setContactUs(form.value).subscribe((data) => {
      if (data.responseMessage.responseDescription === 'Successful response') {
        this.sendSuccess = true;
      } else {
        this.sendSuccess = false;
      }
      this.contactUsFormSent = false;
    });
  }
}
