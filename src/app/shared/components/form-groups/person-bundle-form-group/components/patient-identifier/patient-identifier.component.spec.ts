import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientIdentifierComponent } from './patient-identifier.component';

describe('PatientIdentifierComponent', () => {
  let component: PatientIdentifierComponent;
  let fixture: ComponentFixture<PatientIdentifierComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientIdentifierComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PatientIdentifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
