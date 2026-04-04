package com.wtd.dataLoader.Resource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/promo")
public class PromoResource {

    @GetMapping("/{code}")
    public ResponseEntity<?> validatePromo(@PathVariable String code) {
        Map<String, Double> promos = new HashMap<>();
        promos.put("WELCOME20", 0.20);
        promos.put("SUMMER15", 0.15);
        promos.put("FLASH50", 0.50);

        if (promos.containsKey(code.toUpperCase())) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", code.toUpperCase());
            response.put("discountPercentage", promos.get(code.toUpperCase()));
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.badRequest().body("Invalid promo code");
    }
}
