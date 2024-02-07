import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Injector,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';
import { PersonList, PersonListEntry } from '@models/person-list.model';
import { DirectoryPatientStateService } from '@core/state/directory-patient-state.service';
import { DirectoryRelatedPersonStateService } from '@core/state/directory-related-person-state.service';
import { DirectoryPractitionerStateService } from '@core/state/directory-practitioner-state.service';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { directoryStateFactoryService } from './services/directory-state-factory.service';
import { NotificationsService } from '@core/notifications/notifications.service';
import { PersonRoles } from '@models/person-bundle.model';
import { Observable } from 'rxjs';
import { GenderIconPipe } from '@pipes/gender-icon/gender-icon.pipe';
import { NamePipe } from '@pipes/name/name.pipe';
import { AgePipe } from '@pipes/age/age.pipe';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { SkeletonListComponent } from '@components/skeleton-list/skeleton-list.component';
import { ScrollToTopComponent } from '@components/scroll-to-top/scroll-to-top.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PersonInputDirective } from '@directives/modal-handlers/person-input/person-input.directive';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PatientDirectoryFilters } from '@models/directory.model';

type DirectoryState =
  | DirectoryPatientStateService
  | DirectoryPractitionerStateService
  | DirectoryRelatedPersonStateService;

@Component({
  selector: 'app-directory',
  templateUrl: 'directory.page.html',
  providers: [
    {
      provide: 'DirectoryState',
      useFactory: directoryStateFactoryService(),
      deps: [
        ActivatedRoute,
        DirectoryPatientStateService,
        DirectoryRelatedPersonStateService,
        DirectoryPractitionerStateService,
      ],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    NgIf,
    PersonInputDirective,
    RouterLinkActive,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    ScrollToTopComponent,
    SkeletonListComponent,
    AvatarComponent,
    NgFor,
    AsyncPipe,
    AgePipe,
    NamePipe,
    GenderIconPipe,
  ],
})
export class DirectoryPage
  extends AbstractResourceListDirective<DirectoryState>
  implements OnInit
{
  // UI output streams
  public personList$: Observable<PersonList>;
  public filtersActive$: Observable<PatientDirectoryFilters>;

  public initialPersonRoles: PersonRoles;

  constructor(
    @Inject('DirectoryState')
    private directoryState: DirectoryState,
    private notifications: NotificationsService,
    protected override injector: Injector,
  ) {
    super(directoryState, injector);

    this.personList$ = this.directoryState.personList$;
    this.filtersActive$ = this.directoryState.filtersActive$;

    this.initialPersonRoles = {
      patient: this.directoryState.resourceType === 'Patient',
      relatedPerson: this.directoryState.resourceType === 'RelatedPerson',
      practitioner: this.directoryState.resourceType === 'Practitioner',
    };
  }

  override ngOnInit(): void {
    this.searchInput.setValue(this.directoryState.searchInput);

    this.initTemplate();
    this.directoryState.initList(this.directoryState.resourceType).subscribe();
  }

  public trackById(
    index: number,
    entry: PersonListEntry,
  ): PersonListEntry['rootPersonResourceId'] {
    return entry.rootPersonResourceId ? entry.rootPersonResourceId : undefined;
  }

  public onToggleRecentOnly(recentOnly: boolean): void {
    this.directoryState.toggleRecentOnly().subscribe();
    const message = recentOnly
      ? 'Showing all patients'
      : 'Showing patients active within the last month';
    this.notifications.showSuccess(message);
  }
}
