import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import {
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { PersonResourceType } from '@models/person-resource-type.model';
import { PersonListEntry } from '@models/person-list.model';
import { Reference } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/reference';
import { SearchPersonModalStateService } from './services/search-person-modal-state.service';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { Observable, map } from 'rxjs';
import { NamePipe } from '@pipes/name/name.pipe';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ScrollToTopComponent } from '../../../scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-search-person-modal',
  templateUrl: './search-person-modal.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchPersonModalStateService],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollToTopComponent,
    NgIf,
    NgFor,
    AsyncPipe,
    NamePipe,
  ],
})
export class SearchPersonModalPage
  extends AbstractResourceListDirective<SearchPersonModalStateService>
  implements OnInit
{
  @Input() resourceType: PersonResourceType = 'Patient';
  @Input({ required: true }) referenceFormGroup!: UntypedFormGroup;
  @Input() excludeIds: string[] = [];

  // UI output streams
  personList$: Observable<PersonListEntry[]>;

  constructor(
    private searchPersonModalState: SearchPersonModalStateService,
    public modalController: ModalController,
    protected override injector: Injector,
  ) {
    super(searchPersonModalState, injector);

    this.personList$ = this.searchPersonModalState.personList$.pipe(
      // exclude list items with ids that match one id in excludeIds array
      map((personList) =>
        personList.filter(
          (entry) =>
            !this.excludeIds.some((id) => id === entry.rootPersonResourceId),
        ),
      ),
    );
  }

  override ngOnInit(): void {
    this.initTemplate();
    this.searchPersonModalState.initList(this.resourceType).subscribe();
  }

  dismiss(resource: Reference = {}): void {
    this.modalController.dismiss({
      resource,
      referenceFormGroup: this.referenceFormGroup,
    });
  }

  public trackById(
    index: number,
    entry: PersonListEntry,
  ): PersonListEntry['rootPersonResourceId'] {
    return entry.rootPersonResourceId ? entry.rootPersonResourceId : undefined;
  }
}
