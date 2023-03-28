import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, ControlContainer } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

import { UploadDocumentService } from '../../../shared/Services/upload-document.service';

import { INVESTMENT_ACCOUNT_CONSTANTS } from '../../../investment/investment-account/investment-account.constant';
import { EmitInfo } from '../../interfaces/upload-document.interface';
import { InvestmentAccountService } from '../../../investment/investment-account/investment-account-service';


export interface DocumentInfo {
  documentType: String;
  defaultThumb: String;
  formData: FormData;
  streamResponse?: any;
}

@Component({
  selector: 'app-upload-doc',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class UploadDocComponent implements OnInit {
  defaultThumb: any;
  documentName: String;
  fileType: String;
  fileName: string;
  uploadForm: FormGroup;
  emitObject: EmitInfo = { clearBtn: false, fileSelected: false };

  @Input('documentInfo') documentInfo: DocumentInfo;
  @Output('eventTrigger') eventTrigger: EventEmitter<Object> = new EventEmitter();
  @ViewChild('documentThumb') documentThumb;

  constructor(public readonly translate: TranslateService,
    public modal: NgbModal,
    private uploadDocService: UploadDocumentService,
    private controlContainer: ControlContainer,
    private investmentAccountService: InvestmentAccountService) {
  }

  ngOnInit(): void {
    this.uploadForm = this.controlContainer.control as FormGroup;
    this.uploadDocService.streamResponseObserv.subscribe((response) => {
      if (response) {
        this.getBlob(response);
      }
    });
  }

  ngOnChanges() {
    this.documentName = this.documentInfo && this.documentInfo.documentType ? this.uploadDocService.getDocumentName(this.documentInfo.documentType) : '';
    this.defaultThumb = this.documentInfo && this.documentInfo.defaultThumb ? this.documentInfo.defaultThumb : INVESTMENT_ACCOUNT_CONSTANTS.upload_documents.default_thumb;
  }

  getBlob(streamResponse) {
    this.uploadDocService.blobToThumbNail(streamResponse, this.uploadForm.controls.document, this.documentInfo, this.documentThumb);
    let file = this.uploadDocService.blobToFile(streamResponse);
    if (file["localURL"]) {
      this.fileName = file["localURL"];
    } else {
      this.fileName = file.name;
    }
    this.fileType = this.getFileType(file);
  }

  openFileDialog(elem) {
    if (!elem.files.length && this.uploadForm.controls.document.value == "") {
      this.investmentAccountService.uploadFileOption(elem);
    }
  }

  setFileName(fileElem) {
    this.fileName = this.uploadDocService.getFileName(fileElem);
  }

  getFileType(fileElem: any): String {
    if (fileElem["localURL"]) {
      return fileElem && fileElem["localURL"] ? fileElem["localURL"].split('.')[1].toLowerCase() : '';
    } else {
      return fileElem && fileElem.name ? fileElem.name.split('.')[1].toLowerCase() : '';
    }
  }

  fileSelect(control, controlname, fileElem, thumbElem?) {
    this.fileType = this.getFileType(fileElem.target.files[0]);
    this.uploadDocService.fileSelect(this.documentInfo.formData, control, controlname, fileElem.target.files[0], false, fileElem, thumbElem);
    this.setFileName(fileElem.target);

    this.eventTrigger.emit(this.uploadDocService.setEmitObject("FILE_SELECTED"));
  }

  clearFileSelection(control, controlName, event, thumbElem?, fileElem?) {
    this.uploadDocService.clearFileSelection(control, event, this.defaultThumb, thumbElem, fileElem);

    const payloadKey = this.uploadDocService.getPayloadKey(controlName);
    this.documentInfo.formData.delete(payloadKey);

    this.eventTrigger.emit(this.uploadDocService.setEmitObject("CLEAR"));
  }
}
