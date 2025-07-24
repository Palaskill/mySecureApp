import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletedAccountsComponent } from './deleted-accounts.component';

describe('DeletedAccountsComponent', () => {
  let component: DeletedAccountsComponent;
  let fixture: ComponentFixture<DeletedAccountsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeletedAccountsComponent]
    });
    fixture = TestBed.createComponent(DeletedAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
