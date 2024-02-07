import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientEncounterFormGroupComponent } from './patient-encounter-form-group.component';

describe('EncounterFormGroupComponent', () => {
  let component: PatientEncounterFormGroupComponent;
  let fixture: ComponentFixture<PatientEncounterFormGroupComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientEncounterFormGroupComponent]
}).compileComponents();

      fixture = TestBed.createComponent(PatientEncounterFormGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
