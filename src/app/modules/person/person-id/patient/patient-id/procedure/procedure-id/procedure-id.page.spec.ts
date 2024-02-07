import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProcedureIdPage } from './procedure-id.page';

describe('ProcedureIdPage', () => {
  let component: ProcedureIdPage;
  let fixture: ComponentFixture<ProcedureIdPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ProcedureIdPage]
}).compileComponents();

    fixture = TestBed.createComponent(ProcedureIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
