import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ValueXFormGroupComponent } from './value-x-form-group.component';

describe('ValueXFormGroupComponent', () => {
  let component: ValueXFormGroupComponent;
  let fixture: ComponentFixture<ValueXFormGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ValueXFormGroupComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ValueXFormGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
