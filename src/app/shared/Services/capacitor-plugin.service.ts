import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Camera, CameraPermissionType, PermissionStatus } from '@capacitor/camera';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';

import { ModelWithButtonComponent } from '../modal/model-with-button/model-with-button.component';

@Injectable()

export class CapacitorPluginService {
  constructor(
    private modal: NgbModal,
    public translate: TranslateService
  ) {
  }

  async checkCameraPhotoPermission(permission: CameraPermissionType): Promise<PermissionStatus> {
    let permissions: PermissionStatus = await Camera.checkPermissions();
    if (permissions.camera === "granted") {
      return permissions;
    } else {
      permissions = await Camera.requestPermissions({ permissions: [permission] });
      if (permissions.camera === "granted") {
        return permissions;
      } else {
        this.displayCameraPermissionModal();
        return permissions;
      }
    }
  }

  displayCameraPermissionModal() {
    const ref = this.modal.open(ModelWithButtonComponent, { centered: true, windowClass: '' });
    ref.componentInstance.errorTitle = this.translate.instant("CAMERA_PERMISSION.TITLE");
    ref.componentInstance.errorMessageHTML = this.translate.instant("CAMERA_PERMISSION.DEVICE_SETTINGS_TXT");
    ref.componentInstance.primaryActionLabel = this.translate.instant("CAMERA_PERMISSION.MODAL_BTN");
    return ref.componentInstance.primaryAction.subscribe(() => {
      this.openNativeSetting();
    });
  }

  // Open native app settings
  openNativeSetting() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App
    });
  }

}