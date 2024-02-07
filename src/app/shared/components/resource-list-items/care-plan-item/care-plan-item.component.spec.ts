import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CarePlanItemComponent } from './care-plan-item.component';

describe('CarePlanItemComponent', () => {
  let component: CarePlanItemComponent;
  let fixture: ComponentFixture<CarePlanItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), CarePlanItemComponent]
}).compileComponents();

    fixture = TestBed.createComponent(CarePlanItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
