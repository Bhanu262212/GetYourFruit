package com.wtd.dataLoader.Resource;

import com.wtd.dataLoader.Entity.Rating;
import com.wtd.dataLoader.Services.RatingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ratings")
@Slf4j
public class UserRatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<Rating> saveRating(@RequestBody Rating rating) {
        log.info("Saving rating for product {} by user {}", rating.getProductId(), rating.getUserId());
        return ResponseEntity.ok(ratingService.saveUserRating(rating));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Rating>> getRatingsForProduct(@PathVariable String productId) {
        log.debug("Fetching all ratings for product {}", productId);
        return ResponseEntity.ok(ratingService.getRatingsByProductId(productId));
    }

    @GetMapping("/product/{productId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable String productId) {
        return ResponseEntity.ok(ratingService.getAverageRating(productId));
    }
}
