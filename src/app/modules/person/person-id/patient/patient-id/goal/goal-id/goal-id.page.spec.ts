import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoalIdPage } from './goal-id.page';

describe('GoalIdPage', () => {
  let component: GoalIdPage;
  let fixture: ComponentFixture<GoalIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), GoalIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(GoalIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
