package com.wtd.dataLoader.Dto;

import com.wtd.dataLoader.Entity.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CartRepository  extends MongoRepository<Cart, String> {

    void  (Cart cart);
    Boolean existsByProductIdAndUserId(String productId, String userId);
    Cart save(Cart cart);
    List<Cart> getCartByUserId(String userId);
     void deleteById(String id);
}
