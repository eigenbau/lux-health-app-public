import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientGoalInputModalPage } from './patient-goal-input-modal.page';

describe('PatientGoalInputModalPage', () => {
  let component: PatientGoalInputModalPage;
  let fixture: ComponentFixture<PatientGoalInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientGoalInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientGoalInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
