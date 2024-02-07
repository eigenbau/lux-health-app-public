import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientGoalFormGroupComponent } from './patient-goal-form-group.component';

describe('PatientGoalFormGroupComponent', () => {
  let component: PatientGoalFormGroupComponent;
  let fixture: ComponentFixture<PatientGoalFormGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientGoalFormGroupComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PatientGoalFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
