package com.wtd.dataLoader.Resource;

import com.wtd.dataLoader.Entity.Product;
import com.wtd.dataLoader.Services.SearchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Slf4j
public class SearchResource {

    @Autowired
    SearchService searchService;


    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam(name = "q", required = false) String q) {
        log.info("Searching products for query: {}", q);
        return searchService.searchProduct(q);
    }
}
