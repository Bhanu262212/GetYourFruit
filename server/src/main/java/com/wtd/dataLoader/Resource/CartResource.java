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
@org.springframework.web.bind.annotation.RequestMapping("/cart")
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

    @org.springframework.web.bind.annotation.PatchMapping
    public void updateCart(@RequestBody Cart cart) {
        log.info("Updating product with ID {} in cart for user {}", cart.getProductId(), cart.getUserId());
        cartService.addProductToCart(cart); // Service handles update vs save
    }

    @org.springframework.web.bind.annotation.GetMapping("/{userId}")
    public java.util.List<Cart> getCart(@org.springframework.web.bind.annotation.PathVariable String userId) {
        log.info("Fetching cart for user {}", userId);
        return cartService.getCartByUserId(userId);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{userId}/{productId}")
    public void deleteCartItem(@org.springframework.web.bind.annotation.PathVariable String userId, @org.springframework.web.bind.annotation.PathVariable String productId) {
        log.info("Deleting product {} from cart for user {}", productId, userId);
        cartService.deleteCartItem(productId, userId);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{userId}")
    public void clearCart(@org.springframework.web.bind.annotation.PathVariable String userId) {
        log.info("Clearing cart for user {}", userId);
        cartService.clearCart(userId);
    }
}
