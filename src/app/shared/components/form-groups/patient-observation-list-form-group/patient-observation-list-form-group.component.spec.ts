import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientObservationListFormGroupComponent } from './patient-observation-list-form-group.component';

describe('PatientObservationListFormGroupComponent', () => {
  let component: PatientObservationListFormGroupComponent;
  let fixture: ComponentFixture<PatientObservationListFormGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientObservationListFormGroupComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PatientObservationListFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
