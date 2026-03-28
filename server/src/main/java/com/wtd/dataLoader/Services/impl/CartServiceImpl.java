package com.wtd.dataLoader.Services.impl;

import com.wtd.dataLoader.Dto.CartRepository;
import com.wtd.dataLoader.Entity.Cart;
import com.wtd.dataLoader.Services.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.smartcardio.Card;

@Service
@Slf4j
public class CartServiceImpl implements CartService {

    @Autowired
    CartRepository cartRepository;

    @Override
    public java.util.List<Cart> getCartByUserId(String userId) {
        return cartRepository.getCartByUserId(userId);
    }

    @Override
    public void addProductToCart(Cart cart) {
        Cart existingCart = cartRepository.findByProductIdAndUserId(cart.getProductId(), cart.getUserId());
        if (existingCart == null) {
            log.debug("Product Doesn't exist in cart, adding new product to cart");
            Cart newCart = Cart.builder()
                    .productId(cart.getProductId())
                    .quantity(cart.getQuantity())
                    .userId(cart.getUserId())
                    .build();
            cartRepository.save(newCart);
        } else {
            log.debug("Product exists in cart, updating quantity");
            existingCart.setQuantity(cart.getQuantity());
            cartRepository.save(existingCart);
        }
    }
}
