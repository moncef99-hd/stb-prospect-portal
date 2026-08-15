import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProspects } from './admin-prospects';

describe('AdminProspects', () => {
  let component: AdminProspects;
  let fixture: ComponentFixture<AdminProspects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProspects]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProspects);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
