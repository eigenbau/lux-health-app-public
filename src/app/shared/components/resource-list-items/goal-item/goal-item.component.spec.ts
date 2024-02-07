import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoalItemComponent } from './goal-item.component';

describe('GoalItemComponent', () => {
  let component: GoalItemComponent;
  let fixture: ComponentFixture<GoalItemComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), GoalItemComponent]
}).compileComponents();

      fixture = TestBed.createComponent(GoalItemComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
