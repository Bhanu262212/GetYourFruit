package com.wtd.dataLoader.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Generated;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document
@Builder
@AllArgsConstructor
public class Cart {

    @Id
    @Generated
    private String id;
    private String productId;
    private int quantity;
    private String userId;

}
