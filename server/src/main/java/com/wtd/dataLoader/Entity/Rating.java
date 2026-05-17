package com.wtd.dataLoader.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Generated;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Rating {

    @Id
    @Generated
    private String id;
    private String userId;
    private String username;
    private String feedbackMessage;
    private String productId;
    private double userRating;
    private Instant createdAt;
}
