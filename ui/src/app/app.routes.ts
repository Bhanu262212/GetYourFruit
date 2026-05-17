import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { SouthernGrovesLayoutComponent } from './southern-groves-layout/southern-groves-layout.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { CartComponent } from './cart/cart.component';
import { ManageAdminComponent } from './manage-admin/manage-admin.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { animation: 'LoginPage' } },
  { path: 'signup', component: SignupComponent, data: { animation: 'SignupPage' } },
  { path: 'home', component: SouthernGrovesLayoutComponent, data: { animation: 'HomePage' } },
  { path: 'profile', component: UserProfileComponent, data: { animation: 'ProfilePage' } },
  { path: 'products', component: ProductListingComponent, data: { animation: 'ProductsPage' } },
  { path: 'products/:id', component: ProductDetailComponent, data: { animation: 'ProductDetailPage' } },
  { path: 'cart', component: CartComponent, data: { animation: 'CartPage' } },
  { path: 'my-account', component: MyAccountComponent, data: { animation: 'MyAccountPage' } },
  { path: 'manage-admin', component: ManageAdminComponent, data: { animation: 'ManageAdminPage' } },
  { path: '**', redirectTo: 'products' }
];
