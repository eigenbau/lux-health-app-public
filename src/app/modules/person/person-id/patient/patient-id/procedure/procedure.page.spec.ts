import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProcedurePage } from './procedure.page';

describe('ProcedurePage', () => {
  let component: ProcedurePage;
  let fixture: ComponentFixture<ProcedurePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ProcedurePage]
}).compileComponents();

    fixture = TestBed.createComponent(ProcedurePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
