import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientObservationFormGroupComponent } from './patient-observation-form-group.component';

describe('PatientObservationFormGroupComponent', () => {
  let component: PatientObservationFormGroupComponent;
  let fixture: ComponentFixture<PatientObservationFormGroupComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientObservationFormGroupComponent]
}).compileComponents();

      fixture = TestBed.createComponent(PatientObservationFormGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
