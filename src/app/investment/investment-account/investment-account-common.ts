import { INVESTMENT_ACCOUNT_CONSTANTS } from './investment-account.constant';

export class InvestmentAccountCommon {
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
    }
    return payloadKey;
  }

  setThumbnail(thumbElem, file) {
    // Set Thumbnail
    const defaultThumb = INVESTMENT_ACCOUNT_CONSTANTS.upload_documents.default_thumb;
    let reader: FileReader = new FileReader();
    reader.onloadend = () => {
      thumbElem.src = reader.result;
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      thumbElem.src = window.location.origin + '/assets/images/' + defaultThumb;
    }
  }

  getFileName(fileElem) {
    let fileName = '';
    if (fileElem.files.length) {
      fileName = fileElem.files[0].name;
    }
    return fileName;
  }

  fileSelected(formData, control, controlname, fileElem, thumbElem?) {
    const selectedFile: File = fileElem.target.files[0];
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
        this.setThumbnail(thumbElem, selectedFile);
      }
    } else {
      fileElem.currentTarget.value = '';
    }
    return {
      validFileSize: isValidFileSize,
      validFileType: isValidFileType
    };
  }

  clearFileSelection(control, event, thumbElem?, fileElem?) {
    const defaultThumb = INVESTMENT_ACCOUNT_CONSTANTS.upload_documents.default_thumb;
    event.stopPropagation();
    control.setValue('');
    fileElem.value = '';
    if (thumbElem) {
      thumbElem.src = 'assets/images/' + defaultThumb;
    }
  }

  isValidNric(str) {
    if (str.length !== 9) {
      return false;
    }
    str = str.toUpperCase();
    let i;
    const icArray = [];
    for (i = 0; i < 9; i++) {
      icArray[i] = str.charAt(i);
    }
    icArray[1] = parseInt(icArray[1], 10) * 2;
    icArray[2] = parseInt(icArray[2], 10) * 7;
    icArray[3] = parseInt(icArray[3], 10) * 6;
    icArray[4] = parseInt(icArray[4], 10) * 5;
    icArray[5] = parseInt(icArray[5], 10) * 4;
    icArray[6] = parseInt(icArray[6], 10) * 3;
    icArray[7] = parseInt(icArray[7], 10) * 2;
    let weight = 0;
    for (i = 1; i < 8; i++) {
      weight += icArray[i];
    }
    const offset = icArray[0] === 'T' || icArray[0] === 'G' ? 4 : icArray[0] === 'M' ? 3 : 0;
    const temp = (offset + weight) % 11;
    const st = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    const fg = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
    let theAlpha;
    if (icArray[0] === 'S' || icArray[0] === 'T') {
      theAlpha = st[temp];
    } else if (icArray[0] === 'F' || icArray[0] === 'G' || icArray[0] === 'M') {
      theAlpha = fg[temp];
    }
    return icArray[8] === theAlpha;
  }
}
