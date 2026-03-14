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
    public void addProductToCart(Cart cart) {
        Cart cartBuilder = Cart.builder()
                .productId(cart.getProductId())
                .quantity(cart.getQuantity())
                .userId(cart.getUserId())
                .id("123")
                .build();
        if (!cartRepository.existsByProductIdAndUserId(cart.getProductId(), cart.getUserId())){
           log.debug("Product Doesnt exist in cart, adding new product to cart");
            cartRepository.save(cartBuilder);
        } else {
            cartRepository.patchCart(cartBuilder);
        }

    }
}
