import { Injectable } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { DOCUMENT_REFERENCE_MAX_FILE_SIZE } from '@core/config/fhir.constants';
import { FHIR_DOCUMENT_REFERENCE_FILE_PATH } from '../config/firebase.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { formatBytes } from '../utils/number-functions';

@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  constructor(
    private notifications: NotificationsService,
    private storage: Storage,
  ) {}

  // ref: https://firebase.google.com/docs/storage/web/upload-files
  // for progress monitoring use uploadBytesResumable() to build observer
  // new Observable(subscriber => {
  //      subscriber.next(1);
  //      subscriber.next(2);
  //      subscriber.next(3);
  //  uploadBytesResumable(storageRef, file).on(
  //     'state_changed',
  //     (snapshot) => {
  //       const progress =
  //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //     },
  //     (error) => {
  //       // Handle unsuccessful uploads
  //     },
  //     () => {
  //       // Handle successful uploads on complete
  //     }
  //   );
  // }

  public async uploadFile(file: File, fileName: string): Promise<boolean> {
    const path = `${FHIR_DOCUMENT_REFERENCE_FILE_PATH}${fileName}`;
    const storageRef = ref(this.storage, path);
    if (file.size > DOCUMENT_REFERENCE_MAX_FILE_SIZE) {
      const error = `File cannot exceed ${formatBytes(
        DOCUMENT_REFERENCE_MAX_FILE_SIZE,
        0,
      )}`;
      this.notifications.showError(error);

      return false;
    }

    try {
      await uploadBytes(storageRef, file);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async deleteFile(fileName: string): Promise<boolean> {
    if (!fileName) {
      return true;
    }
    const path = `${FHIR_DOCUMENT_REFERENCE_FILE_PATH}${fileName}`;
    const storageRef = ref(this.storage, path);
    try {
      await deleteObject(storageRef);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async getFileUrl(fileName: string): Promise<string> {
    const path = `${FHIR_DOCUMENT_REFERENCE_FILE_PATH}${fileName}`;
    const storageRef = ref(this.storage, path);
    try {
      return await getDownloadURL(storageRef);
    } catch (e) {
      throw new Error('Unable to get file URL.');
    }
  }
}
