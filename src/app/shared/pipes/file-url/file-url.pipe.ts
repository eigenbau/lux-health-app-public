import { Pipe, PipeTransform } from '@angular/core';
import { FileStorageService } from '@core/firebase/file-storage-service.service';
import { isNonEmptyString } from '@core/utils/string-functions';

@Pipe({
  name: 'fileUrl',
  standalone: true,
})
export class FileUrlPipe implements PipeTransform {
  constructor(private fileStorage: FileStorageService) {}

  transform(fileName: string | undefined | null): Promise<string> {
    return isNonEmptyString(fileName)
      ? this.fileStorage.getFileUrl(fileName)
      : Promise.resolve('');
  }
}
