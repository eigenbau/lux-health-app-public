import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientIdPage } from './patient-id.page';

describe('PatientIdPage', () => {
  let component: PatientIdPage;
  let fixture: ComponentFixture<PatientIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
