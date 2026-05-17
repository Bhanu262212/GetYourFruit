package com.wtd.dataLoader.Dto;

import com.wtd.dataLoader.Entity.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserRatingRepository extends MongoRepository<Rating, String> {

    List<Rating> findByProductId(String productId);

}
