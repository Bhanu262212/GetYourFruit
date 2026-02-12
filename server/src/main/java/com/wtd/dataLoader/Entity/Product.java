package com.wtd.dataLoader.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document
@AllArgsConstructor
public class Product {

    @Id
    private String id;
    private String productName;
    private double price;
    private String imageUrl;
}
