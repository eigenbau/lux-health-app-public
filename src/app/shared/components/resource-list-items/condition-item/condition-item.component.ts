import { Component, Input } from '@angular/core';
import { ICondition } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/ICondition';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExpandableDirective } from '@directives/expandable/expandable.directive';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-condition-item',
  templateUrl: './condition-item.component.html',
  standalone: true,
  imports: [IonicModule, ExpandableDirective, RouterLink, NgIf],
})
export class ConditionItemComponent {
  @Input({ required: true }) condition!: ICondition;
  @Input() lines: 'none' | 'inset' | 'full' = 'inset';
  @Input({ required: true }) link!: string[];
  @Input() detail: boolean = false;
  @Input() classes: string[] = [];

  public get classesString(): string {
    return this.classes?.filter(Boolean).join(' ');
  }
}
