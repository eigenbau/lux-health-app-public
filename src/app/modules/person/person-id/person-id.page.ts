import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  ViewChild,
} from '@angular/core';
import {
  ActionSheetButton,
  ActionSheetController,
  IonRefresher,
  NavController,
  IonicModule,
} from '@ionic/angular';
import { IPatient } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPatient';
import { IPractitioner } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPractitioner';
import { IRelatedPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IRelatedPerson';
import { PersonStateService } from '@core/state/person-state.service';
import {
  combineLatest,
  concatMap,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  skip,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  addressIcon,
  buildAddressMapLink,
  buildKeyContactLink,
  buildTelecomLink,
  formatAddress,
  telecomIcon,
} from '@core/utils/fhir/address-and-contact-functions';
import {
  PersonBundle,
  PersonBundleChildResource,
} from '@models/person-bundle.model';
import { NotificationsService } from '@core/notifications/notifications.service';
import { IPerson } from '@smile-cdr/fhirts/dist/FHIR-R4/interfaces/IPerson';
import { AgePipe } from '@pipes/age/age.pipe';
import { NamePipe } from '@pipes/name/name.pipe';
import { IdPipe } from '@pipes/id/id.pipe';
import { RouterLink } from '@angular/router';
import { ShowOnScrollDirective } from '@directives/show-on-scroll/show-on-scroll.directive';
import { PersonInputDirective } from '@directives/modal-handlers/person-input/person-input.directive';
import {
  NgIf,
  NgFor,
  AsyncPipe,
  TitleCasePipe,
  DatePipe,
} from '@angular/common';
import { StandardHeaderDirective } from '@directives/standard-header/standard-header.directive';
import { PersonList } from '@models/person-list.model';
import { RoutingService } from '@core/routing/routing.service';

@Component({
  selector: 'app-person-id',
  templateUrl: './person-id.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    IonicModule,
    StandardHeaderDirective,
    NgIf,
    PersonInputDirective,
    ShowOnScrollDirective,
    RouterLink,
    NgFor,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    IdPipe,
    NamePipe,
    AgePipe,
  ],
})
export class PersonIdPage implements AfterViewInit {
  @ViewChild(IonRefresher) refresher: IonRefresher | undefined;

  destroy$ = new Subject<null>();

  // UI output streams
  public personBundle$: Observable<PersonBundle | undefined>;
  public supporters$: Observable<PersonList>;
  public loading$: Observable<boolean>;

  public personRoles$: Observable<string>;
  protected routing: RoutingService;

  public buildKeyContactLink = buildKeyContactLink;
  public telecomIcon = telecomIcon;
  public buildTelecomLink = buildTelecomLink;
  public formatAddress = formatAddress;
  public buildAddressMapLink = buildAddressMapLink;
  public addressIcon = addressIcon;

  constructor(
    private personState: PersonStateService,
    private notifications: NotificationsService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    protected injector: Injector,
  ) {
    this.routing = injector.get(RoutingService);

    this.personBundle$ = this.personState.personBundle$;
    this.supporters$ = this.personState.supporters$;
    this.loading$ = this.personState.loading$;

    this.routing
      .goBack({
        resource: this.personBundle$,
        loading: this.loading$,
        route: ['app', 'main', 'person', 'directory'],
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    this.personRoles$ = this.personBundle$.pipe(
      map((personBundle) => {
        const roles = [];
        roles.push(!!personBundle?.patient ? 'Patient' : null);
        roles.push(!!personBundle?.relatedPerson ? 'Supporter' : null);
        roles.push(!!personBundle?.practitioner ? 'Practitioner' : null);
        return roles.filter(Boolean).join(' • ');
      }),
    );
  }

  ngAfterViewInit(): void {
    if (this.refresher) {
      this.refresher.pullMin = 100;
      this.refresher.ionRefresh
        .pipe(
          takeUntil(this.destroy$),
          switchMap(() => this.refresh()),
        )
        .subscribe();
      this.personState.loading$
        .pipe(
          takeUntil(this.destroy$),
          tap((l) => {
            if (!l && this.refresher) {
              this.refresher.complete();
            }
          }),
        )
        .subscribe();
    }
  }

  public refresh(): Observable<boolean> {
    return this.personState.getPerson();
  }

  public setTypeToRelatedPerson(
    resource: IPatient | IRelatedPerson | IPractitioner,
  ): IRelatedPerson {
    return resource as IRelatedPerson;
  }

  public async presentSelectDeleteActionSheet(
    personBundle: PersonBundle,
  ): Promise<void> {
    // If Person resource has only one linked child resource go straight to DeletePersonBundle
    // this prevents collecting childless Person parent records in the database
    // there is also a protection build-in the Cloud Function deleteFhirPersonBundleChildResource
    if (personBundle?.person?.link && personBundle.person.link.length < 2) {
      return await this.confirmDeletePersonBundle(personBundle.person.id);
    }

    const relatedPersonButtons: ActionSheetButton[] =
      personBundle.relatedPerson?.map((r) =>
        this.buildActionButton(r, `Supporter record - ${r.patient.display}`),
      ) || [];

    const buttons: ActionSheetButton[] = [
      this.buildActionButton(personBundle.person, 'Entire Person record'),
      this.buildActionButton(personBundle.patient, 'Patient record'),
      this.buildActionButton(personBundle.practitioner, 'Practitioner record'),
      ...relatedPersonButtons,
      {
        text: 'Cancel',
        role: 'cancel',
      },
    ].filter(Boolean);

    const actionSheet = await this.actionSheetController.create({
      header: 'Choose what to delete',
      buttons,
    });
    await actionSheet.present();

    const { data } = await actionSheet.onDidDismiss();
    if (data) {
      // delete
      if (data.resourceType === 'Person') {
        await this.confirmDeletePersonBundle(data.id);
      }
      if (data.resourceType !== 'Person') {
        await this.confirmDeletePersonBundleChildResource({
          ...data,
          person: personBundle.person,
        });
      }
    }
  }

  public async confirmDeletePersonBundleChildResource(
    data: PersonBundleChildResource,
  ): Promise<void> {
    const deleteItem = await this.notifications.presentAlertDelete();
    if (!deleteItem) {
      return;
    }
    // Delete Fhir resource
    this.deleteFhirPersonBundleChildResource(data).subscribe();
  }

  public async confirmDeletePersonBundle(
    id: string | undefined | null,
  ): Promise<void> {
    if (!id) {
      throw new Error('No id provided');
    }
    const deleteItem = await this.notifications.presentAlertDelete();
    if (!deleteItem) {
      return;
    }
    // Delete Fhir resource
    this.deleteFhirPersonBundle(id).subscribe();
  }

  // Private methods
  private deleteFhirPersonBundle(id: string): Observable<boolean> {
    this.notifications.presentLoader();
    return this.personState.deleteFhirPersonBundle(id).pipe(
      concatMap((success) => {
        this.notifications.dismissLoader();
        if (success) {
          // Navigate to patient directory
          this.navController.navigateRoot([
            'app',
            'main',
            'person',
            'directory',
          ]);

          this.notifications.showSuccess(
            'Person and related resources deleted!',
          );
          return of(true);
        }
        this.notifications.showError(
          `Sorry, I couldn't delete the Person.
          One or more resources are likely still linked to it.
          Delete these first and try again.`,
        );
        return of(false);
      }),
    );
  }
  private deleteFhirPersonBundleChildResource(
    data: PersonBundleChildResource,
  ): Observable<boolean> {
    this.notifications.presentLoader();
    return this.personState.deleteFhirPersonBundleChildResource(data).pipe(
      concatMap((success) => {
        this.notifications.dismissLoader();
        if (success) {
          this.notifications.showSuccess(
            `${data.resourceType} resource deleted!`,
          );
          return of(true);
        }
        this.notifications.showError(
          `Sorry, I couldn't delete the ${data.resourceType} resource.
          One or more resources are likely still linked to it.
          Delete these first and try again.`,
        );
        return of(false);
      }),
    );
  }

  private buildActionButton(
    resource:
      | IPerson
      | IPatient
      | IPractitioner
      | IRelatedPerson
      | undefined
      | null,
    text: string,
  ): ActionSheetButton {
    return resource
      ? {
          text,
          data: {
            resourceType: resource.resourceType,
            id: resource.id,
          },
        }
      : {};
  }
}
