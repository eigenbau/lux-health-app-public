import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocumentReferenceItemComponent } from './document-reference-item.component';

describe('DocumentReferenceItemComponent', () => {
  let component: DocumentReferenceItemComponent;
  let fixture: ComponentFixture<DocumentReferenceItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), DocumentReferenceItemComponent]
}).compileComponents();

    fixture = TestBed.createComponent(DocumentReferenceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
