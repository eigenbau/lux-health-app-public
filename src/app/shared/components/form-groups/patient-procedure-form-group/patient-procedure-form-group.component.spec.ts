import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientProcedureFormGroupComponent } from './patient-procedure-form-group.component';

describe('PatientProcedureFormGroupComponent', () => {
  let component: PatientProcedureFormGroupComponent;
  let fixture: ComponentFixture<PatientProcedureFormGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientProcedureFormGroupComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PatientProcedureFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
