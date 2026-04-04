import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGalleryComponent } from '../product-gallery/product-gallery.component';
import { CartCrateComponent } from '../cart-crate/cart-crate.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-southern-groves-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductGalleryComponent, CartCrateComponent],
  templateUrl: './southern-groves-layout.component.html',
  styleUrls: ['./southern-groves-layout.component.css']
})
export class SouthernGrovesLayoutComponent {

}