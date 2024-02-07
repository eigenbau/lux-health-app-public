import {
  AfterViewChecked,
  Component,
  Injector,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IonSearchbar, ModalController, IonicModule } from '@ionic/angular';
import { Coding } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/coding';
import { ValueSetState } from '@core/state/abstract-services/value-set-state.service';
import { AbstractResourceListDirective } from 'src/app/shared/directives/pages/resource-list/abstract-resource-list.directive';
import { ValueSetConfig } from '@models/value-set.model';
import { ValueSetSearchStateService } from './services/value-set-search-state.service';
import { NgIf, NgFor, AsyncPipe, TitleCasePipe } from '@angular/common';
import { ScrollToTopComponent } from '../../../scroll-to-top/scroll-to-top.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ValueSetContains } from '@smile-cdr/fhirts/dist/FHIR-R4/classes/valueSetContains';

@Component({
  selector: 'app-value-set-search-modal',
  templateUrl: './value-set-search-modal.page.html',
  providers: [ValueSetSearchStateService],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollToTopComponent,
    NgIf,
    NgFor,
    AsyncPipe,
    TitleCasePipe,
  ],
})
export class ValueSetSearchModalPage
  extends AbstractResourceListDirective<
    ValueSetSearchStateService,
    ValueSetState
  >
  implements OnInit, AfterViewChecked
{
  @Input() config: ValueSetConfig = {};
  @Input() title = 'Codes';
  @ViewChild('searchbar') searchbar: IonSearchbar | undefined;

  // UI output streams
  public codeList$: Observable<ValueSetContains[]>;
  public valueSetCustomName$: Observable<string | undefined>;
  public customCodeList$: Observable<ValueSetContains[]>;

  constructor(
    private valueSetSearchModalState: ValueSetSearchStateService,
    public modalController: ModalController,
    protected override injector: Injector,
  ) {
    super(valueSetSearchModalState, injector);
    this.loading$.subscribe((loading) => {
      console.log('loading', loading);
    });
    this.codeList$ = this.valueSetSearchModalState.codeList$;
    this.valueSetCustomName$ =
      this.valueSetSearchModalState.valueSetCustomName$;
    this.customCodeList$ = this.valueSetSearchModalState.customCodeList$;
  }

  override ngOnInit(): void {
    this.initTemplate();
    this.valueSetSearchModalState.initList(this.config).subscribe();
  }

  // ionViewDidEnter() {
  //   this.searchbar.setFocus();
  // }

  ngAfterViewChecked(): void {
    if (this.searchbar) {
      this.searchbar.setFocus();
    }
  }

  dismiss(coding: Coding = {}): void {
    this.modalController.dismiss({ coding });
  }

  public trackByCode(index: number, entry: Coding): Coding['code'] {
    return entry.code ? entry.code : undefined;
  }

  public onAddToFavouritesClicked(c: ValueSetContains): void {
    this.valueSetSearchModalState.addCustomValue(c);
  }

  public onRemoveFromFavouritesClicked(c: ValueSetContains): void {
    this.valueSetSearchModalState.removeCustomValue(c);
  }
}
