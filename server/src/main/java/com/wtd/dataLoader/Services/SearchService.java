package com.wtd.dataLoader.Services;


import com.wtd.dataLoader.Entity.Product;

import java.util.List;

public interface SearchService {

    List<Product> searchProduct(String input);
}
