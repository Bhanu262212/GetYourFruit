package com.wtd.dataLoader.Resource;

import com.wtd.dataLoader.Entity.Cart;
import com.wtd.dataLoader.Services.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class CartResource {

    @Autowired
    CartService cartService;

    @PostMapping
    public void addToCart(@RequestBody Cart cart) {
        log.info("Adding product with ID {} to cart for user {}", cart.getProductId(), cart.getUserId());
        cartService.addProductToCart(cart);
        log.debug("Product Added to cart successfully");
    }
}
