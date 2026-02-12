package com.wtd.dataLoader.Services;

import com.wtd.dataLoader.Entity.Product;
import org.springframework.stereotype.Service;

import java.util.List;

public interface DataLoaderService {

    void saveProductDetails (Product product);

     List<Product> getAll() ;

     void delete(String id);
}
