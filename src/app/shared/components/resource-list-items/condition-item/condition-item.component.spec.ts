import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConditionItemComponent } from './condition-item.component';

describe('ConditionItemComponent', () => {
  let component: ConditionItemComponent;
  let fixture: ComponentFixture<ConditionItemComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ConditionItemComponent]
}).compileComponents();

      fixture = TestBed.createComponent(ConditionItemComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
