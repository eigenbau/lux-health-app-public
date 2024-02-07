import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientDocumentReferenceFormGroupComponent } from './patient-document-reference-form-group.component';

describe('PatientDocumentReferenceFormGroupComponent', () => {
  let component: PatientDocumentReferenceFormGroupComponent;
  let fixture: ComponentFixture<PatientDocumentReferenceFormGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientDocumentReferenceFormGroupComponent]
}).compileComponents();

    fixture = TestBed.createComponent(PatientDocumentReferenceFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
