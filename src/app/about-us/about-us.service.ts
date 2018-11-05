import { Injectable } from '@angular/core';

import { IContactUs } from './contact-us/contact-us.interface';
import { ICustomerReview } from './customer-reviews/customer-reviews.interface';

@Injectable({
  providedIn: 'root'
})
export class AboutUsService {

  constructor() { }

  getCustomerReviews(data): ICustomerReview[] {
    const customerReviewArray = [];
    data.forEach((review) => {
      customerReviewArray.push(this.createCustomerReview(review));
    });
    return customerReviewArray;
  }

  createCustomerReview(data): ICustomerReview {
    const thisReview = {
      reviewId: data.reviewId,
      name: data.name,
      job: data.job,
      message: data.message,
      rating: data.rating,
      date: data.date
    };
    return thisReview;
  }

  getSubject(data): any[] {
    const subjectArray = [];
    data['SUBJECTS'].forEach((subject) => {
      subjectArray.push(this.createSubject(subject));
    });
    return subjectArray;
  }
  createSubject(data): any {
    const subject = {
      subject: data.SUBJECT,
      email: data.EMAIL
    };
    return subject;
  }
  getContactUs(): IContactUs {
    const contactUs = {} as IContactUs;
    return contactUs;
  }
}
