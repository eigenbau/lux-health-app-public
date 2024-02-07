import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { map, Observable, of, startWith } from 'rxjs';
import { FormHelperService } from '@core/forms/form-helper.service';
import { SearchPersonModalPage } from './search-person-modal/search-person-modal.page';
import { preventSwipeToClose } from '@core/utils/ionic-functions';
import { RemoveHostDirective } from 'src/app/shared/directives/remove-host/remove-host.directive';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-person-select',
  templateUrl: './person-select.component.html',
  hostDirectives: [RemoveHostDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonicModule, AsyncPipe],
})
export class PersonSelectComponent implements OnInit {
  @Input({ required: true }) referenceFormControl!: UntypedFormControl;
  @Input() label: string = '';
  @Input() ariaLabel: string = '';
  @Input() labelPlacement:
    | 'end'
    | 'fixed'
    | 'floating'
    | 'stacked'
    | 'start'
    | '' = '';
  @Input() justify: 'end' | 'space-between' | 'start' | '' = '';
  @Input() ionSelectClass: string = '';
  @Input() ionSlot: 'start' | 'end' | 'label' | '' = '';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() excludeIds: string[] = [];

  public selectedText$: Observable<string> = of('');

  private modalOpen: boolean = false; // Prevents opening of multiple instances on fast clicks

  constructor(
    public fh: FormHelperService,
    public modalController: ModalController,
  ) {}

  ngOnInit(): void {
    this.selectedText$ = this.referenceFormControl.valueChanges.pipe(
      startWith(this.referenceFormControl.value),
      map((value) => value?.display),
    );
  }

  public async openModal(event: MouseEvent): Promise<void> {
    const excludeIds = this.excludeIds;
    event.stopImmediatePropagation();

    if (this.modalOpen || this.readonly) {
      return;
    }
    this.modalOpen = true;

    const modal = await this.modalController.create({
      component: SearchPersonModalPage,
      canDismiss: preventSwipeToClose,
      presentingElement: await this.modalController.getTop(),
      componentProps: { excludeIds },
    });

    modal.onDidDismiss().then((response) => {
      this.modalOpen = false;
      if (!response?.data?.resource) {
        return;
      }
      this.referenceFormControl.setValue(response.data.resource);
    });

    return await modal.present();
  }
}
