import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientConditionInputModalPage } from './patient-condition-input-modal.page';

describe('PatientConditionInputModalPage', () => {
  let component: PatientConditionInputModalPage;
  let fixture: ComponentFixture<PatientConditionInputModalPage>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientConditionInputModalPage]
}).compileComponents();

      fixture = TestBed.createComponent(PatientConditionInputModalPage);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
