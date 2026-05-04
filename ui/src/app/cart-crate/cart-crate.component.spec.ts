import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { CartCrateComponent } from './cart-crate.component';

describe('CartCrateComponent', () => {
  let component: CartCrateComponent;
  let fixture: ComponentFixture<CartCrateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartCrateComponent],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartCrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
