import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientObservationListInputModalPage } from './patient-observation-list-input-modal.page';

describe('PatientObservationListInputModalPage', () => {
  let component: PatientObservationListInputModalPage;
  let fixture: ComponentFixture<PatientObservationListInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientObservationListInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientObservationListInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
