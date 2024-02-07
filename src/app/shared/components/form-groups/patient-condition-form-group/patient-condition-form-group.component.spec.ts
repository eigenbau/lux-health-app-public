import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientConditionFormGroupComponent } from './patient-condition-form-group.component';

describe('PatientConditionFormGroupComponent', () => {
  let component: PatientConditionFormGroupComponent;
  let fixture: ComponentFixture<PatientConditionFormGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientConditionFormGroupComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PatientConditionFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
