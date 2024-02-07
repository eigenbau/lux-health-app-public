import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-overlay',
    template: `
    <div class="grid-item">
      <ng-content></ng-content>
    </div>
  `,
    styleUrls: ['./overlay.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class OverlayComponent {}
