import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSignupsComponent } from './pending-signups.component';

describe('PendingSignupsComponent', () => {
  let component: PendingSignupsComponent;
  let fixture: ComponentFixture<PendingSignupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingSignupsComponent]
    });
    fixture = TestBed.createComponent(PendingSignupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
