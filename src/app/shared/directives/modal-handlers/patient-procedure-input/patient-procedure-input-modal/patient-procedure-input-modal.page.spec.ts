import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientProcedureInputModalPage } from './patient-procedure-input-modal.page';

describe('PatientProcedureInputModalPage', () => {
  let component: PatientProcedureInputModalPage;
  let fixture: ComponentFixture<PatientProcedureInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientProcedureInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientProcedureInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
