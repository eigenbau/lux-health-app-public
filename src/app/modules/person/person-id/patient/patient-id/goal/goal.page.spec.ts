import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoalPage } from './goal.page';

describe('GoalPage', () => {
  let component: GoalPage;
  let fixture: ComponentFixture<GoalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), GoalPage]
}).compileComponents();

    fixture = TestBed.createComponent(GoalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
