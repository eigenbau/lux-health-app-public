import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientCarePlanInputModalPage } from './patient-care-plan-input-modal.page';

describe('PatientCarePlanInputModalPage', () => {
  let component: PatientCarePlanInputModalPage;
  let fixture: ComponentFixture<PatientCarePlanInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientCarePlanInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientCarePlanInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
