import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorpbizUpgradeScreenComponent } from './corpbiz-upgrade-screen.component';

describe('CorpbizUpgradeScreenComponent', () => {
  let component: CorpbizUpgradeScreenComponent;
  let fixture: ComponentFixture<CorpbizUpgradeScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorpbizUpgradeScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorpbizUpgradeScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
