import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocumentReferencePage } from './document-reference.page';

describe('DocumentReferencePage', () => {
  let component: DocumentReferencePage;
  let fixture: ComponentFixture<DocumentReferencePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), DocumentReferencePage]
}).compileComponents();

    fixture = TestBed.createComponent(DocumentReferencePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
