import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConditionIdPage } from './condition-id.page';

describe('ConditionIdPage', () => {
  let component: ConditionIdPage;
  let fixture: ComponentFixture<ConditionIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ConditionIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(ConditionIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
