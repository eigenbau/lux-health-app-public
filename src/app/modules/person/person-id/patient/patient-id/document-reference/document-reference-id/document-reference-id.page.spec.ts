import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocumentReferenceIdPage } from './document-reference-id.page';

describe('DocumentReferenceIdPage', () => {
  let component: DocumentReferenceIdPage;
  let fixture: ComponentFixture<DocumentReferenceIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), DocumentReferenceIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(DocumentReferenceIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
