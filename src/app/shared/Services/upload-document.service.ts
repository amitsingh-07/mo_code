import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { ErrorModalComponent } from '../modal/error-modal/error-modal.component';
import { INVESTMENT_ACCOUNT_CONSTANTS } from '../../investment/investment-account/investment-account.constant';
import { EmitInfo } from '../interfaces/upload-document.interface';
import { FileUtil } from '../utils/file.util';

@Injectable({
  providedIn: 'root'
})

export class UploadDocumentService {
  private streamResponse = new Subject();
  streamResponseObserv = this.streamResponse.asObservable();

  emitObject: EmitInfo;

  constructor(
    public readonly translate: TranslateService,
    private modal: NgbModal, private fileUtil: FileUtil
  ) {
  }

  setStreamResponse(response) {
    this.streamResponse.next(response);
  }

  getDocumentName(docType) {
    let docName;
    switch (docType) {
      case 'CKA_CERTIFICATE': {
        docName = this.translate.instant('UPLOAD_DOCUMENTS.CKA_CERTIFICATE');
        break;
      }
    }
    return docName;
  }

  getPayloadKey(controlname) {
    let payloadKey;
    switch (controlname) {
      case 'NRIC_FRONT': {
        payloadKey = 'nricFront';
        break;
      }
      case 'NRIC_BACK': {
        payloadKey = 'nricBack';
        break;
      }
      case 'MAILING_ADDRESS': {
        payloadKey = 'mailingAddressProof';
        break;
      }
      case 'RESIDENTIAL_ADDRESS': {
        payloadKey = 'residentialAddressProof';
        break;
      }
      case 'PASSPORT': {
        payloadKey = 'passport';
        break;
      }
      case 'PASSPORT_BO': {
        payloadKey = 'supportingDocument';
        break;
      }
      case 'BIRTH_CERTIFICATE': {
        payloadKey = 'supportingDocument';
        break;
      }
      case 'CKA_CERTIFICATE': {
        payloadKey = 'ckaCert';
        break;
      }
    }
    return payloadKey;
  }

  setThumbnail(thumbElem, file, isBlob?) {
    // Set Thumbnail
    const defaultThumb = INVESTMENT_ACCOUNT_CONSTANTS.upload_documents.default_thumb;
    let reader: FileReader = new FileReader();
    reader.onloadend = () => {
      this.setSRC(isBlob, thumbElem, reader.result);
    };

    if (file) {
      if (file instanceof Blob) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsDataURL(file.name[0]);
      }
    } else {
      const thumbPath = window.location.origin + '/assets/images/' + defaultThumb;
      this.setSRC(isBlob, thumbElem, thumbPath);
    }
  }

  private setSRC(isBlob: any, thumbElem: any, thumbPath: string | ArrayBuffer) {
    if (isBlob) {
      thumbElem.nativeElement.src = thumbPath;
    } else {
      thumbElem.src = thumbPath;
    }
  }

  getFileName(fileElem) {
    let fileName = '';
    if (fileElem.files.length) {
      fileName = fileElem.files[0].name;
    }
    return fileName;
  }

  selectedFile(formData, controlname, file, isBlob, fileElem?, thumbElem?) {
    const selectedFile: File = file;
    const fileSize: number = selectedFile.size / 1024 / 1024; // in MB
    let fileType;
    if (selectedFile["localURL"]) {
      fileType = selectedFile["localURL"].split('.')[selectedFile["localURL"].split('.').length - 1].toUpperCase();
    } else {
      fileType = selectedFile.name.split('.')[selectedFile.name.split('.').length - 1].toUpperCase();
    }
    const isValidFileSize =
      fileSize <= INVESTMENT_ACCOUNT_CONSTANTS.upload_documents.max_file_size;
    const isValidFileType = INVESTMENT_ACCOUNT_CONSTANTS.upload_documents.file_types.indexOf(
      fileType
    ) >= 0;
    if (isValidFileSize && isValidFileType) {
      const payloadKey = this.getPayloadKey(controlname);
      formData.append(payloadKey, selectedFile);
      if (fileType !== 'PDF') {
        this.setThumbnail(thumbElem, selectedFile, isBlob);
      }
    } else {
      if (fileElem && fileElem.currentTarget) {
        fileElem.currentTarget.value = '';
      }
    }
    return {
      validFileSize: isValidFileSize,
      validFileType: isValidFileType
    };
  }

  fileSelect(formData, control, controlname, file, isBlob, fileElem?, thumbElem?) {
    const response = this.selectedFile(formData, controlname, file, isBlob, fileElem, thumbElem);

    if (!response.validFileSize) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      const errorTitle = this.translate.instant(
        'UPLOAD_DOCUMENTS.MODAL.FILE_SIZE_EXCEEDED.TITLE'
      );
      const errorDesc = this.translate.instant(
        'UPLOAD_DOCUMENTS.MODAL.FILE_SIZE_EXCEEDED.MESSAGE'
      );
      ref.componentInstance.errorTitle = errorTitle;
      ref.componentInstance.errorDescription = errorDesc;
      control.setValue('');
    } else if (!response.validFileType) {
      const ref = this.modal.open(ErrorModalComponent, { centered: true });
      const errorTitle = this.translate.instant(
        'UPLOAD_DOCUMENTS.MODAL.FILE_TYPE_MISMATCH.TITLE'
      );
      const errorDesc = this.translate.instant(
        'UPLOAD_DOCUMENTS.MODAL.FILE_TYPE_MISMATCH.MESSAGE'
      );
      ref.componentInstance.errorTitle = errorTitle;
      ref.componentInstance.errorDescription = errorDesc;
      control.setValue('');
    } else {
      control.setValue(file ? file.name : '');
    }
  }

  blobToThumbNail(streamResponse, control, documentInfo, thumbElem) {
    let file = this.blobToFile(streamResponse);
    this.fileSelect(documentInfo.formData, control, documentInfo.documentType, file, true, null, thumbElem);
  }

  blobToFile(streamResponse: any) {
    let extension: string;
    let blob: Blob;
    if (streamResponse["content"] && streamResponse["filename"]) {
      extension = streamResponse['filename'].split('.')[1].toLowerCase();
      blob = this.fileUtil.convertBase64toBlob(streamResponse['content'], streamResponse['filename']);
      return new File([blob], streamResponse['filename'], { type: this.createFileType(extension) });
    } else {
      extension = streamResponse.headers.get('FILE_TYPE').split('.')[1].toLowerCase();
      blob = new Blob([streamResponse.body], { type: this.createFileType(extension) });
      return new File([blob], streamResponse.headers.get('FILE_TYPE'), { type: this.createFileType(extension) });
    }
  }

  createFileType(e): string {
    let fileType: string = "";
    if (e == 'pdf') {
      fileType = `application/${e}`;
    }
    else if (e == 'jpeg' || e == 'jpg' || e == 'png' || e == 'gif' || e == 'bmp') {
      fileType = `image/${e}`;
    }

    return fileType;
  }

  clearFileSelection(control, event, defaultThumb, thumbElem?, fileElem?) {
    event.stopPropagation();
    control.setValue('');
    fileElem.value = '';
    if (thumbElem) {
      thumbElem.src = 'assets/images/' + defaultThumb;
    }
  }

  setEmitObject(emitObj) {
    this.emitObject = { clearBtn: false, fileSelected: false };
    switch (emitObj) {
      case "CLEAR": {
        this.emitObject.clearBtn = true;
        return this.emitObject;
      }

      case "FILE_SELECTED": {
        this.emitObject.fileSelected = true;
        return this.emitObject;
      }

      default: {
        return this.emitObject;
      }
    }
  }
}
