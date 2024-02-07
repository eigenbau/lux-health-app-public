import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { objectProperty } from '@core/utils/object-functions';
import { NgClass, NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-horizontal-scroll-select',
  templateUrl: './horizontal-scroll-select.component.html',
  styleUrls: ['./horizontal-scroll-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, NgClass, NgFor],
})
export class HorizontalScrollSelectComponent<T> {
  // START - this allows us to set the options to null or undefined and have it default to an empty array
  @Input()
  set options(value: T[] | null | undefined) {
    this._options = value ?? this._defaultOptions;
  }
  get options(): T[] {
    return this._options || this._defaultOptions;
  }

  private _defaultOptions: T[] = [];
  private _options: T[] | undefined;
  // END - this allows us to set the options to null or undefined and have it default to an empty array

  @Input() selected: T[] = [];
  @Input({ required: true }) labelPath!: (string | number)[];
  @Output() selectionChanged = new EventEmitter<T[]>();

  @ViewChild('wrapper') wrapper: ElementRef<HTMLElement> | undefined;

  constructor() {}

  public onSelect(option: T): void {
    const index = this.selected.findIndex(
      (selectedItem) => JSON.stringify(selectedItem) === JSON.stringify(option),
    );
    if (index < 0) {
      this.selected.push(option);
    } else {
      this.selected.splice(index, 1);
    }
    this.selectionChanged.emit(this.selected);
  }

  public isSelected(option: T): boolean {
    if (!this.selected) {
      return false;
    }
    return !!(
      this.selected.findIndex(
        (selectedItem) =>
          JSON.stringify(selectedItem) === JSON.stringify(option),
      ) *
        -1 -
      1
    );
  }

  public noneSelected(): boolean {
    return !!!this.selected.length;
  }

  public onReset(): void {
    this.selected = [];
    this.selectionChanged.emit(this.selected);
    if (this.wrapper) {
      this.wrapper.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }

  public label(option: T): string {
    const value = objectProperty(this.labelPath, option);
    return typeof value === 'string' ? value : (value as any).toString();
  }
}
