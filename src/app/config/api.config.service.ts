import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, share } from 'rxjs/operators';

import { HospitalPlan } from '../guide-me/hospital-plan/hospital-plan';
import { IApiConfig } from './api.config.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private configUrl = 'assets/api.config.json';

  constructor(private http: HttpClient) { }

  getConfig() {
    return this.http.get<IApiConfig>(this.configUrl).pipe(
      share(),
      catchError(this.handleError) // then handle the error
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}