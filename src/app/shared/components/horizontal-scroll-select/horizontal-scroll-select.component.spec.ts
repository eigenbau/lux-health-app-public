import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HorizontalScrollSelectComponent } from './horizontal-scroll-select.component';

describe('HorizontalScrollSelectComponent', () => {
  let component: HorizontalScrollSelectComponent;
  let fixture: ComponentFixture<HorizontalScrollSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), HorizontalScrollSelectComponent]
}).compileComponents();

    fixture = TestBed.createComponent(HorizontalScrollSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
