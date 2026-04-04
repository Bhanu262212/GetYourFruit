package com.wtd.dataLoader.Services;

import com.wtd.dataLoader.Entity.Cart;

import java.util.List;

public interface CartService {

    void addProductToCart(Cart cart);
    List<Cart> getCartByUserId(String userId);
    void deleteCartItem(String productId, String userId);
    void clearCart(String userId);
}
