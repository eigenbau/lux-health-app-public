import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ValueSetSelectComponent } from './value-set-select.component';

describe('ValueSetSelectComponent', () => {
  let component: ValueSetSelectComponent;
  let fixture: ComponentFixture<ValueSetSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ValueSetSelectComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ValueSetSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
