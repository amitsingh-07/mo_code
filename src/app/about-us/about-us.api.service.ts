import { Injectable } from '@angular/core';

import { ApiService } from './../shared/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class AboutUsApiService {

  constructor(private apiService: ApiService) {}

  getCustomerReviews() {
    return this.apiService.getCustomerReviewList();
  }
}