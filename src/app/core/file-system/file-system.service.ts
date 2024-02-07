import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileSystemService {
  constructor(private http: HttpClient) {}

  public async loadLocalAssetToBase64(url: string): Promise<string> {
    const blob: Blob = await firstValueFrom(
      this.http.get(url, {
        responseType: 'blob',
      })
    );
    return await this.readFileAsync(blob);
  }

  // Private methods
  private async readFileAsync(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }
}
