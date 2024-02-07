import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientEncounterInputModalPage } from './patient-encounter-input-modal.page';

describe('PatientEncounterInputModalPage', () => {
  let component: PatientEncounterInputModalPage;
  let fixture: ComponentFixture<PatientEncounterInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientEncounterInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientEncounterInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
