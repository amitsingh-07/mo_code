import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

export const FILE_TYPE = 'application/pdf';
export const IOS_DEVICE = 'ios';
export const ANDROID_DEVICE = 'android';

@Injectable()

export class CapacitorUtils {
  static readonly isApp = Capacitor.isNativePlatform();
  static readonly isIOSDevice = Capacitor.getPlatform() === IOS_DEVICE;
  static readonly isAndroidDevice = Capacitor.getPlatform() === ANDROID_DEVICE;
  static readonly isIosWeb = !Capacitor.isNativePlatform() && /iPad|iPhone|iPod/.test(navigator.userAgent);

  //Get file from cache & open using fileopener​
  static openPdfFile(filename) {
    Filesystem.getUri({
      directory: Directory.Cache,
      path: filename,
    }).then(
      (getUriResult) => {
        const path = getUriResult.uri;
        FileOpener.open({ filePath: path, contentType: FILE_TYPE });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  static async openNativePDF(base64data, filename) {
    Filesystem.writeFile({
      path: filename,
      data: base64data,
      directory: Directory.Cache,
    })
      .then((writeFileResult) => {
        this.openPdfFile(filename);
      })
      .catch((e) => {
        console.error(e);
      });
  }

}