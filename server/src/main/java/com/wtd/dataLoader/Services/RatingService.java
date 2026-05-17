package com.wtd.dataLoader.Services;

import com.wtd.dataLoader.Entity.Rating;

import java.util.List;

public interface RatingService {
    Rating saveUserRating(Rating rating);
    double getAverageRating(String productId);
    List<Rating> getRatingsByProductId(String productId);
}
