import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedAccountsComponent } from './rejected-accounts.component';

describe('RejectedAccountsComponent', () => {
  let component: RejectedAccountsComponent;
  let fixture: ComponentFixture<RejectedAccountsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RejectedAccountsComponent]
    });
    fixture = TestBed.createComponent(RejectedAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
