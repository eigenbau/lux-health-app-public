import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SkeletonListComponent } from './skeleton-list.component';

describe('SkeletonListComponent', () => {
  let component: SkeletonListComponent;
  let fixture: ComponentFixture<SkeletonListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SkeletonListComponent]
}).compileComponents();

    fixture = TestBed.createComponent(SkeletonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
