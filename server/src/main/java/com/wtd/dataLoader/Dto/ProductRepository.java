package com.wtd.dataLoader.Dto;

import com.wtd.dataLoader.Entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

}
