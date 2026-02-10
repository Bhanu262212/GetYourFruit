package com.wtd.dataLoader.Services.impl;

import com.wtd.dataLoader.Dto.ProductRepository;
import com.wtd.dataLoader.Entity.Product;
import com.wtd.dataLoader.Services.DataLoaderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class DataLoaderServiceImpl implements DataLoaderService {

    @Autowired
    ProductRepository productRepository;

    public void saveProductDetails (Product product){
        try{
            log.debug("Going to save product details");
            productRepository.save(product);
            log.debug("Product Details Saved SuccessFully");
        } catch (Exception e)
        {
            throw new RuntimeException(e.getMessage());
        }
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public void delete(String id)
    {
        productRepository.deleteById(id);
    }
}
