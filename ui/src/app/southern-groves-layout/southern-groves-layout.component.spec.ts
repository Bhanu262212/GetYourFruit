import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { SouthernGrovesLayoutComponent } from './southern-groves-layout.component';

describe('SouthernGrovesLayoutComponent', () => {
  let component: SouthernGrovesLayoutComponent;
  let fixture: ComponentFixture<SouthernGrovesLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SouthernGrovesLayoutComponent],
      providers: [provideRouter([]), provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SouthernGrovesLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
