import { Injectable } from '@angular/core';

import { CapacitorUtils } from './capacitor.util';
import { Util } from './util';
import { environment } from '../../../environments/environment';

export const FILE_TYPE = 'application/pdf;base64';

@Injectable()
export class FileUtil {

  public downloadPDF(data: any, newWindow: any, fileName: string) {
    if (CapacitorUtils.isApp) {
      CapacitorUtils.openNativePDF(data, fileName);
    } else {
      const pdfUrl = window.URL.createObjectURL(this.convertBase64toBlob(data, FILE_TYPE));
      if (CapacitorUtils.isIosWeb) {
        if (newWindow.document.readyState === 'complete') {
          newWindow.location.assign(pdfUrl);
        } else {
          newWindow.onload = () => {
            newWindow.location.assign(pdfUrl);
          };
        }
      } else {
        const nav = (window.navigator as any);
        if (nav && nav.msSaveOrOpenBlob) {
          nav.msSaveOrOpenBlob(this.convertBase64toBlob(data, FILE_TYPE), fileName);
        } else {
          this.createDownloadUrl(fileName, pdfUrl);
        }
      }
    }
  }

  public createDownloadUrl(fileName: string, pdfUrl: string): void {
    if (CapacitorUtils.isApp || CapacitorUtils.isIosWeb) {
      Util.openExternalUrl(environment.apiBaseUrl + '/app/' + pdfUrl)
    } else {
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = pdfUrl;
      a.download = fileName;
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(pdfUrl);
      }, 1000);
    }
  }

  public convertBase64toBlob(base64Str: string, fileType: string) {
    const byteCharacters = window.atob(base64Str);
    const byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: fileType });
  }
}
