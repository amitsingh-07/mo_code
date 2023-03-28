import {  Observable } from 'rxjs';
import { finalize,  catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService, IConfig } from '../../config/config.service';
import { Util } from '../utils/util';
import { CustomErrorHandlerService } from './custom-error-handler.service';
import { HelperService } from './helper.service';
import { IServerResponse } from './interfaces/server-response.interface';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  config$: Observable<IConfig>;
  apiBaseUrl = '';

  constructor(
    public httpClient: HttpClient,
    public errorHandler: CustomErrorHandlerService,
    public helperService: HelperService,
    public configService: ConfigService
  ) {
    this.config$ = this.configService.getConfig();
    this.apiBaseUrl = Util.getApiBaseUrl();
  }

  get(url) {
    this.helperService.showLoader();
    return this.httpClient
      .get<IServerResponse>(`${this.apiBaseUrl}/${url}`).pipe(
      finalize(() => {
        this.helperService.hideLoader();
      }))
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  /**
   * 
   * @param url The api URL string
   * @param paramsData JSON object coded key value Query params e.g. param = {"qa": 123} to api/someMethod?qa=123
   * @returns Observable<IServerResponse>
   */
  getWithParams(url: string, paramsData: any): Observable<IServerResponse> {
    let params = new HttpParams();
    Object.keys(paramsData).forEach(key => {
      params = params.append(key, paramsData[key]);
    });
    this.helperService.showLoader();
    return this.httpClient
      .get<IServerResponse>(`${this.apiBaseUrl}/${url}`, {params: params}).pipe(
      finalize(() => {
        this.helperService.hideLoader();
      }))
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  getMock(url) {
    return this.httpClient
      .get<IServerResponse>(url).pipe(
      finalize(() => {
        this.helperService.hideLoader();
      }));
  }

  post(url, postBody: any, showLoader?: boolean, showError?: boolean) {
    if (showLoader) {
      this.helperService.showLoader();
    }
    let param = '';
    if (showError) {
      param = '?alert=' + showError;
    }

    return this.httpClient
      .post<IServerResponse>(`${this.apiBaseUrl}/${url}${param}`, postBody).pipe(
      finalize(() => {
        this.helperService.hideLoader();
      }));
  }

  getBase64String(url, showLoader?: boolean, showError?: boolean) {
    this.helperService.showLoader();
    return this.httpClient
      .get(`${this.apiBaseUrl}/${url}`, { responseType: 'text'}).pipe(
      finalize(() => {
        this.helperService.hideLoader();
      }))
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  patch(url, patchBody: any, showLoader?: boolean, showError?: boolean) {
    if (showLoader) {
      this.helperService.showLoader();
    }
    let param = '';
    if (showError) {
      param = '?alert=' + showError;
    }

    return this.httpClient
      .patch<IServerResponse>(`${this.apiBaseUrl}/${url}${param}`, patchBody).pipe(
      finalize(() => {
        this.helperService.hideLoader();
      }));
  }

  delete(url, postBody: any, showLoader?: boolean, showError?: boolean) {
    if (showLoader) {
      this.helperService.showLoader();
    }
    let param = '';
    if (showError) {
      param = '?alert=' + showError;
    }
    return this.httpClient
      .delete<IServerResponse>(`${this.apiBaseUrl}/${url}${param}`).pipe(
      finalize(() => {
        this.helperService.hideLoader();
      }));
  }

  put(url, putData: any, showLoader?: boolean, showError?: boolean) {
    if (showLoader) {
      this.helperService.showLoader();
    }
    let param = '';
    if (showError) {
      param = '?alert=' + showError;
    }

    return this.httpClient
      .put<IServerResponse>(`${this.apiBaseUrl}/${url}${param}`, putData).pipe(
      finalize(() => {
        this.helperService.hideLoader();
      }));
  }

  upload(url: string, file: File) {
    const formData: FormData = new FormData();
    if (file) {
      formData.append('files', file, file.name);
    }
    this.helperService.addContentTypeHeader = false;
    return this.post(url, formData);
  }

  formUrlParam(url, data) {
    let queryString = '';
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (!queryString) {
          queryString = `?${key}=${data[key]}`;
        } else {
          queryString += `&${key}=${data[key]}`;
        }
      }
    }
    return url + queryString;
  }
}
