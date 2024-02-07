import { Injectable, NgZone } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { SingletonGuardService } from '../services/singleton-guard.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService extends SingletonGuardService {
  constructor(
    private zone: NgZone,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController,
  ) {
    super(NotificationsService);
  }

  public showSuccess(message: string): void {
    this.zone.run(() => {
      this.presentMessageToast(message);
    });
  }

  public showError(message: string): void {
    this.zone.run(() => {
      this.presentErrorToast(message);
    });
  }

  public async presentLoader() {
    const loading = await this.loadingController.create();
    await loading.present();
  }

  public async dismissLoader() {
    await this.loadingController.dismiss();
  }

  public async presentAlertDelete(): Promise<boolean> {
    const alert = await this.alertController.create({
      translucent: true,
      cssClass: 'alert-class',
      header: 'Wait!',
      message: 'Are you sure you want to delete this item?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          role: 'confirm',
        },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss<boolean>();
    return role === 'confirm' ? true : false;
  }

  public async presentAlertValidationError(
    config: { callback?: () => void; header?: string; message?: string } = {},
  ): Promise<void> {
    const {
      callback = undefined,
      header = 'Validation error!',
      message = undefined,
    } = config;
    const alert = await this.alertController.create({
      translucent: true,
      cssClass: 'alert-class',
      header,
      message,
      buttons: [
        {
          text: 'Ok',
          handler: callback,
        },
      ],
    });

    await alert.present();
  }

  public async presentAlertCancelAndCloseModal(
    callbackFunction?: () => any,
  ): Promise<void> {
    const alert = await this.alertController.create({
      translucent: true,
      cssClass: 'alert-class',
      header: 'Wait!',
      message: 'Are you sure you want to cancel?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            // console.log('Continue editing...');
          },
        },
        {
          text: 'Yes',
          handler: () => {
            if (callbackFunction) {
              callbackFunction();
            }
            if (!callbackFunction) {
              this.modalController.dismiss();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  public async presentAlert(config?: {
    header?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }): Promise<'cancelled' | 'confirmed'> {
    const {
      header,
      message,
      confirmLabel = 'Ok',
      cancelLabel = 'cancel',
    } = config || {};

    const alert = await this.alertController.create({
      translucent: true,
      cssClass: 'alert-class',
      header,
      message,
      buttons: [
        {
          text: cancelLabel,
          role: 'cancelled',
        },
        {
          text: confirmLabel,
          role: 'confirmed',
        },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();

    return role as 'cancelled' | 'confirmed';
  }

  // Private methods
  private async presentErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      header: 'Ooooops. A problem occurred.',
      message,
      icon: 'alert-circle-outline',
      translucent: false,
      color: 'secondary',
      buttons: [
        {
          side: 'end',
          text: 'OK',
          role: 'cancel',
        },
      ],
    });
    toast.present();
    toast.addEventListener('click', toast.dismiss, false);
  }
  private async presentMessageToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      icon: 'checkmark-circle-outline',
      translucent: false,
      duration: 2000,
      color: 'secondary',
    });
    toast.present();
    toast.addEventListener('click', toast.dismiss, false);
  }
}
