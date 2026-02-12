package com.wtd.dataLoader.Resource;

import com.wtd.dataLoader.Entity.Product;
import com.wtd.dataLoader.Services.DataLoaderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
public class DataLoaderResource {

    @Autowired
    DataLoaderService dataLoaderService;

    @PostMapping(path = "/save", consumes = "application/json")
    public ResponseEntity<Void> saveProductDetails(@RequestBody Product product)
    {
         dataLoaderService.saveProductDetails(product);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @GetMapping("/products")
    public List<Product> getAll() {
       log.info("Going to get data");
        return dataLoaderService.getAll();
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable("id") String id)
    {
         dataLoaderService.delete(id);
         return "Product with Id "+ id + " Deleted Successfully";
    }
}
