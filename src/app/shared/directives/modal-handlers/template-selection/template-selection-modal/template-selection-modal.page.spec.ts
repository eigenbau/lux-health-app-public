import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TemplateSelectionModalPage } from './template-selection-modal.page';

describe('TemplateSelectionModalPage', () => {
  let component: TemplateSelectionModalPage;
  let fixture: ComponentFixture<TemplateSelectionModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TemplateSelectionModalPage]
}).compileComponents();

    fixture = TestBed.createComponent(TemplateSelectionModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
