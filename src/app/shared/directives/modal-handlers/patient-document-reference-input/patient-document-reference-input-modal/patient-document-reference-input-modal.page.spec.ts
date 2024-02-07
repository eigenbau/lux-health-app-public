import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PatientDocumentReferenceInputModalPage } from './patient-document-reference-input-modal.page';

describe('PatientDocumentReferenceInputModalPage', () => {
  let component: PatientDocumentReferenceInputModalPage;
  let fixture: ComponentFixture<PatientDocumentReferenceInputModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PatientDocumentReferenceInputModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(PatientDocumentReferenceInputModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
