import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientObservationInputModalPage } from './patient-observation-input-modal.page';

describe('PatientObservationInputModalPage', () => {
  let component: PatientObservationInputModalPage;
  let fixture: ComponentFixture<PatientObservationInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientObservationInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientObservationInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
