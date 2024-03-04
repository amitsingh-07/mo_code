import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  constructor(
    private http: HttpClient
  ) { }

  getCardsByPageSizeAndNo(pageNo, pageSize){
    return this.http.get("assets/mock-data/card.json");
  }

}
