import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForcedUpdateComponent } from './forced-update.component';

describe('ForcedUpdateComponent', () => {
  let component: ForcedUpdateComponent;
  let fixture: ComponentFixture<ForcedUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForcedUpdateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForcedUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
