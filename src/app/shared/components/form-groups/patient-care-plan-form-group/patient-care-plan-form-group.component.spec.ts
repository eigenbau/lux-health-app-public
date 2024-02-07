import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientCarePlanFormGroupComponent } from './patient-care-plan-form-group.component';

describe('PatientCarePlanFormGroupComponent', () => {
  let component: PatientCarePlanFormGroupComponent;
  let fixture: ComponentFixture<PatientCarePlanFormGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientCarePlanFormGroupComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PatientCarePlanFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
