import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ObservationItemComponent } from './observation-item.component';

describe('ObservationItemComponent', () => {
  let component: ObservationItemComponent;
  let fixture: ComponentFixture<ObservationItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ObservationItemComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ObservationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
