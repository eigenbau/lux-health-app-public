import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { ViewContext } from '../observation-list/observation-list.component';
import { NgFor, NgTemplateOutlet, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-skeleton-list',
  templateUrl: './skeleton-list.component.html',
  styleUrls: ['./skeleton-list.component.scss'],
  standalone: true,
  imports: [IonicModule, NgFor, NgTemplateOutlet, NgIf],
})
export class SkeletonListComponent {
  @Input() lines: 'full' | 'inset' | 'none' = 'inset';
  @Input() inset = false;
  @Input() detail = false;
  @Input({ required: true }) set rows(rows: number) {
    this.rowsArray = [...Array(rows).keys()];
  }
  @ContentChild('listItem', { read: TemplateRef })
  listItem: TemplateRef<ViewContext> | undefined;

  public rowsArray: number[] = [...Array(2).keys()];

  constructor() {}
}
