import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProcedureItemComponent } from './procedure-item.component';

describe('ProcedureItemComponent', () => {
  let component: ProcedureItemComponent;
  let fixture: ComponentFixture<ProcedureItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ProcedureItemComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ProcedureItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
