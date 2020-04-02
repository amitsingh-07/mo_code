import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { InvestmentAccountService } from '../../investment/investment-account/investment-account-service';
import { InvestmentEngagementJourneyService } from '../../investment/investment-engagement-journey/investment-engagement-journey.service';
import { AuthenticationService } from '../../shared/http/auth/authentication.service';
import { NavbarService } from '../../shared/navbar/navbar.service';
import { GroupByPipe } from '../../shared/Pipes/group-by.pipe';
import { SIGN_UP_CONFIG } from '../sign-up.constant';
import { SignUpService } from '../sign-up.service';
import { environment } from './../../../environments/environment';

@Component({
  selector: 'app-view-all-notifications',
  templateUrl: './view-all-notifications.component.html',
  styleUrls: ['./view-all-notifications.component.scss']
})
export class ViewAllNotificationsComponent implements OnInit, AfterViewInit {
  pageTitle: string;
  ref;
  allMessages;
  private initLoad = true;

  constructor(
    public navbarService: NavbarService,
    public activeModal: NgbActiveModal,
    private router: Router,
    private formBuilder: FormBuilder,
    private signUpService: SignUpService,
    private modal: NgbModal,
    public authService: AuthenticationService,
    public investmentEngagementJourneyService: InvestmentEngagementJourneyService,
    public readonly translate: TranslateService,
    private investmentAccountService: InvestmentAccountService) {
    this.translate.use('en');
    this.translate.get('COMMON').subscribe((result: string) => {
      this.pageTitle = 'Notifications';
      this.setPageTitle(this.pageTitle);
    });
  }

  ngOnInit() {
    this.getAllNotifications();
    if (environment.hideHomepage) {
      this.navbarService.setNavbarMode(104);
    } else {
      this.navbarService.setNavbarMode(102);
    }
  }

  ngAfterViewInit() {
    this.navbarService.currentClearNotificationEvent.subscribe((clearAll) => {
      if (clearAll) {
        this.clearAllNotifications();
      }
    });
  }
  clearNotifications() {
    this.navbarService.clearNotification();
  }

  setPageTitle(title: string) {
    this.navbarService.setPageTitle(title);
  }

  getAllNotifications() {
    this.signUpService.getAllNotifications().subscribe((response) => {
      const notifications = response.objectList[0].notifications;
      this.allMessages = this.signUpService.getAllMessagesByNotifications(notifications);
      this.navbarService.setClearAllNotify(this.allMessages.length > 0 ? true : false);
      this.investmentEngagementJourneyService.sortByProperty(this.allMessages, 'time', 'desc');
      this.allMessages = new GroupByPipe().transform(this.allMessages, 'month');
      this.updateNotifications(null, SIGN_UP_CONFIG.NOTIFICATION.READ_PAYLOAD_KEY);
    },
    (err) => {
      this.investmentAccountService.showGenericErrorModal();
    });
  }

  updateNotifications(messages, type) {
    this.signUpService.updateNotifications(messages, type).subscribe((response) => {
    },
    (err) => {
      this.investmentAccountService.showGenericErrorModal();
    });
  }

  clearNotification(message, group) {
    this.updateNotifications([message], SIGN_UP_CONFIG.NOTIFICATION.DELETE_PAYLOAD_KEY);
    const updatedMessagesList = group.value.filter((notificationMessage) => message !== notificationMessage);
    if (updatedMessagesList.length) {
      group.value = updatedMessagesList;
    } else {
      const updatedNotificationList = this.allMessages.filter((currentNotification) => group !== currentNotification);
      this.allMessages = updatedNotificationList;
    }
  }

  clearAllNotifications() {
    this.updateNotifications(null, SIGN_UP_CONFIG.NOTIFICATION.DELETE_PAYLOAD_KEY);
    this.allMessages.splice(0);
  }

  constructDeleteNotificationRequest(messages) {
    return {
      messageList: messages
    };
  }

}
