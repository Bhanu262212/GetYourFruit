import { Routes } from '@angular/router';
import { SplashComponent } from './splash/splash.component';
import { DropshippingComponent } from './dropshipping/dropshipping.component';
import { CartComponent } from './cart/cart.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { animation: 'LoginPage' } },
  { path: 'home', component: DropshippingComponent, data: { animation: 'HomePage' } },
  { path: 'cart', component: CartComponent, data: { animation: 'CartPage' } }
];
