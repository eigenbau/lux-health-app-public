import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TemplateCodeAndValueFormGroupComponent } from './template-code-and-value-form-group.component';

describe('TemplateCodeAndValueFormGroupComponent', () => {
  let component: TemplateCodeAndValueFormGroupComponent;
  let fixture: ComponentFixture<TemplateCodeAndValueFormGroupComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TemplateCodeAndValueFormGroupComponent]
}).compileComponents();

      fixture = TestBed.createComponent(TemplateCodeAndValueFormGroupComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
