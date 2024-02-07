import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReferenceSelectComponent } from './reference-select.component';

describe('ReferenceSelectComponent', () => {
  let component: ReferenceSelectComponent;
  let fixture: ComponentFixture<ReferenceSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ReferenceSelectComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ReferenceSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
