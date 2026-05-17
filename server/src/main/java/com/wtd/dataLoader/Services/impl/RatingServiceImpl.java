package com.wtd.dataLoader.Services.impl;

import com.wtd.dataLoader.Dto.ProductRepository;
import com.wtd.dataLoader.Dto.UserRatingRepository;
import com.wtd.dataLoader.Entity.Product;
import com.wtd.dataLoader.Entity.Rating;
import com.wtd.dataLoader.Services.RatingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class RatingServiceImpl implements RatingService {

    @Autowired
    private UserRatingRepository userRatingRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Rating saveUserRating(Rating rating) {
        log.debug("Saving rating details for product {}", rating.getProductId());
        if (rating.getCreatedAt() == null) {
            rating.setCreatedAt(Instant.now());
        }
        Rating saved = userRatingRepository.save(rating);
        // Keep the cached average on the product fresh.
        updateProductAverage(saved.getProductId());
        return saved;
    }

    @Override
    public double getAverageRating(String productId) {
        return computeAverage(userRatingRepository.findByProductId(productId));
    }

    @Override
    public List<Rating> getRatingsByProductId(String productId) {
        List<Rating> ratings = userRatingRepository.findByProductId(productId);
        // Newest first when timestamps are available.
        ratings.sort(Comparator.comparing(
                (Rating r) -> r.getCreatedAt() == null ? Instant.EPOCH : r.getCreatedAt()
        ).reversed());
        return ratings;
    }

    private double computeAverage(List<Rating> ratings) {
        return ratings.stream()
                .mapToDouble(Rating::getUserRating)
                .average()
                .orElse(0.0);
    }

    private void updateProductAverage(String productId) {
        if (productId == null) return;
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            log.warn("Cannot refresh average rating, product {} not found", productId);
            return;
        }
        double avg = computeAverage(userRatingRepository.findByProductId(productId));
        Product product = productOpt.get();
        product.setAvgUserRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        productRepository.save(product);
    }
}
