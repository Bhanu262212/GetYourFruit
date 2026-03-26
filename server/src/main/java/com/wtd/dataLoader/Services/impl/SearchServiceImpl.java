package com.wtd.dataLoader.Services.impl;

import com.wtd.dataLoader.Dto.ProductRepository;
import com.wtd.dataLoader.Entity.Product;
import com.wtd.dataLoader.Services.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchServiceImpl implements SearchService {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public List<Product> searchProduct(String input)
    {
        if (input == null || input.trim().isEmpty()) {
            return new ArrayList<>();
        }

        // Primary: search by productName (case-insensitive contains)
        List<Product> byName = productRepository.findByProductNameContainingIgnoreCase(input.trim());
        return byName;
    }
}
