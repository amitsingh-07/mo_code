import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ConfigService, IConfig } from '../../config/config.service';
import { CustomErrorHandlerService } from './custom-error-handler.service';
import { HelperService } from './helper.service';
import { HttpService } from './http.service';
import { IError } from './interfaces/error.interface';
import { IServerResponse } from './interfaces/server-response.interface';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  config$: Observable<IConfig>;

  constructor(
    public http: HttpService,
    public httpClient: HttpClient,
    public errorHandler: CustomErrorHandlerService,
    public helperService: HelperService,
    public configService: ConfigService
  ) {
    this.config$ = this.configService.getConfig();
  }

  get(url) {
    this.helperService.showLoader();
    return this.httpClient
      .get<IServerResponse>(`${environment.apiBaseUrl}/${url}`)
      .finally(() => {
        this.helperService.hideLoader();
      })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  getMock(url) {
    return this.httpClient
      .get<IServerResponse>(url)
      .finally(() => {
        this.helperService.hideLoader();
      })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  getArticle(url) {
    return this.httpClient
      .get(url, { responseType: 'text' })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
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
      .post<IServerResponse>(`${environment.apiBaseUrl}/${url}${param}`, postBody)
      .finally(() => {
        this.helperService.hideLoader();
      });
  }

  delete(url, postBody: any) {
    this.helperService.showLoader();
    return this.http
      .delete(url)
      .map((res: Response) => {
        return this.handleResponse(res);
      })
      .catch((error: Response) => Observable.throw(error))
      .finally(() => {
        this.helperService.hideLoader();
      });
  }

  put(url, putData) {
    this.helperService.showLoader();
    return this.http
      .put(url, putData)
      .map((res: Response) => {
        return this.handleResponse(res);
      })
      .catch((error: Response) => Observable.throw(error))
      .finally(() => {
        this.helperService.hideLoader();
      });
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

  handleResponse(res): IServerResponse {
    // My API sends a new jwt access token with each request,
    // so store it in the local storage, replacing the old one.
    const data = res;
    if (data.responseMessage.responseCode < 6000) {
      const error: IError = {
        error: data.responseMessage.responseCode,
        message: data.responseMessage.responseDescription
      };
      throw new Error(this.errorHandler.parseCustomServerErrorToString(error));
    } else {
      return data;
    }
  }

}
