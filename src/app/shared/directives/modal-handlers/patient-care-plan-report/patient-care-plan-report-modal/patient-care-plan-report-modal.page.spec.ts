import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientCarePlanReportModalPage } from './patient-care-plan-report-modal.page';

describe('PatientCarePlanReportModalPage', () => {
  let component: PatientCarePlanReportModalPage;
  let fixture: ComponentFixture<PatientCarePlanReportModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientCarePlanReportModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientCarePlanReportModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
