import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ObservationListComponent } from './observation-list.component';

describe('ObservationListComponent', () => {
  let component: ObservationListComponent;
  let fixture: ComponentFixture<ObservationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ObservationListComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ObservationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
