import { Injectable } from '@angular/core';
import { ApiService } from '../shared/http/api.service';
import { PAYMENT_REQUEST } from './payment.constants';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private apiService: ApiService
  ) { }

  getRequestSignature(enquiryId: number, amt: string) {
    const payload = {
      enquiryId,
      transactionAmount: amt,
      transactionType: PAYMENT_REQUEST.transactionType
    };
    return this.apiService.getRequestSignature(payload);
  }
}
