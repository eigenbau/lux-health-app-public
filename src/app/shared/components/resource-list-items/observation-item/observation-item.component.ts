import { Component, Input } from '@angular/core';
import { IObservation } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IObservation';
import { ValueGroup } from '@models/value-x.model';
import { BodySitePipe } from '@pipes/body-site/body-site.pipe';
import { ValueXPipe } from '@pipes/value-x/value-x.pipe';
import { DistanceToNowPipe } from '@pipes/distance-to-now/distance-to-now.pipe';
import { LineChartThumbnailComponent } from '../../line-chart-thumbnail/line-chart-thumbnail.component';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-observation-item',
  templateUrl: './observation-item.component.html',
  standalone: true,
  imports: [
    IonicModule,
    ExpandableDirective,
    RouterLink,
    NgIf,
    LineChartThumbnailComponent,
    DistanceToNowPipe,
    ValueXPipe,
    BodySitePipe,
  ],
})
export class ObservationItemComponent {
  @Input({ required: true }) observation!: IObservation;
  @Input() chartSeries: ValueGroup[] | undefined = [];
  @Input() lines: 'none' | 'inset' | 'full' = 'inset';
  @Input({ required: true }) link!: string[];
  @Input() detail: boolean = false;
}
