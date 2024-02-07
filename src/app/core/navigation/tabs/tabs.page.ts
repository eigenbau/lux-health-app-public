import { Location, NgStyle } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { IonTabs, IonicModule } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styles: [
    `
      div.spacer {
        display: block;
        max-width: 34px;
        width: 34px;
      }
      ion-tab-button:first-of-type {
        /* border-left: var(--border); */
      }
      ion-menu-button {
        --color: var(--ion-color-medium);
        font-size: 24px;
      }
    `,
  ],
  standalone: true,
  imports: [IonicModule, NgStyle],
})
export class TabsPage {
  @ViewChild(IonTabs) tabs: IonTabs | null = null;
  selectedTab = '';

  public isProduction = environment.production;

  constructor(private location: Location) {}

  setSelectedTab(): void {
    if (this.tabs) {
      this.selectedTab = this.tabs.getSelected() ?? '';
    }
  }
}
