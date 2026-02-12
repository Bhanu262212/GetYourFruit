package com.wtd.dataLoader.Entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Product Entity Unit Tests")
class ProductTest {

    @Test
    @DisplayName("Should create Product with all constructor parameters")
    void testProductConstructor_AllParameters() {
        // Act
        Product product = new Product("1", "Test Product", 99.99, "http://example.com/image.jpg");

        // Assert
        assertEquals("1", product.getId());
        assertEquals("Test Product", product.getProductName());
        assertEquals(99.99, product.getPrice());
        assertEquals("http://example.com/image.jpg", product.getImageUrl());
    }

    @Test
    @DisplayName("Should update product name via setter")
    void testProductSetter_ProductName() {
        // Arrange
        Product product = new Product("1", "Original", 50.0, "http://example.com/original.jpg");

        // Act
        product.setProductName("Updated Product");

        // Assert
        assertEquals("Updated Product", product.getProductName());
    }

    @Test
    @DisplayName("Should update product price via setter")
    void testProductSetter_Price() {
        // Arrange
        Product product = new Product("1", "Product", 50.0, "http://example.com/image.jpg");

        // Act
        product.setPrice(150.0);

        // Assert
        assertEquals(150.0, product.getPrice());
    }

    @Test
    @DisplayName("Should update product image URL via setter")
    void testProductSetter_ImageUrl() {
        // Arrange
        Product product = new Product("1", "Product", 50.0, "http://example.com/original.jpg");

        // Act
        product.setImageUrl("http://example.com/updated.jpg");

        // Assert
        assertEquals("http://example.com/updated.jpg", product.getImageUrl());
    }

    @Test
    @DisplayName("Should update product ID via setter")
    void testProductSetter_Id() {
        // Arrange
        Product product = new Product("1", "Product", 50.0, "http://example.com/image.jpg");

        // Act
        product.setId("2");

        // Assert
        assertEquals("2", product.getId());
    }

    @Test
    @DisplayName("Should handle zero price")
    void testProductWithZeroPrice() {
        // Act
        Product product = new Product("1", "Free Product", 0.0, "http://example.com/free.jpg");

        // Assert
        assertEquals(0.0, product.getPrice());
    }

    @Test
    @DisplayName("Should handle negative price")
    void testProductWithNegativePrice() {
        // Act
        Product product = new Product("1", "Discount Product", -50.0, "http://example.com/neg.jpg");

        // Assert
        assertEquals(-50.0, product.getPrice());
    }

    @Test
    @DisplayName("Should handle large price value")
    void testProductWithLargePrice() {
        // Act
        Product product = new Product("1", "Expensive Product", 999999.99, "http://example.com/expensive.jpg");

        // Assert
        assertEquals(999999.99, product.getPrice());
    }

    @Test
    @DisplayName("Should verify product equality with same values")
    void testProductEquality_SameValues() {
        // Act
        Product product1 = new Product("1", "Test Product", 99.99, "http://example.com/image.jpg");
        Product product2 = new Product("1", "Test Product", 99.99, "http://example.com/image.jpg");

        // Assert
        assertEquals(product1, product2);
    }

    @Test
    @DisplayName("Should verify product inequality with different values")
    void testProductEquality_DifferentValues() {
        // Act
        Product product1 = new Product("1", "Product 1", 99.99, "http://example.com/1.jpg");
        Product product2 = new Product("2", "Product 2", 199.99, "http://example.com/2.jpg");

        // Assert
        assertNotEquals(product1, product2);
    }

    @Test
    @DisplayName("Should handle Product with null ID")
    void testProductWithNullId() {
        // Act
        Product product = new Product(null, "Product", 50.0, "http://example.com/image.jpg");

        // Assert
        assertNull(product.getId());
        assertNotNull(product.getProductName());
    }

    @Test
    @DisplayName("Should handle Product with null product name")
    void testProductWithNullProductName() {
        // Act
        Product product = new Product("1", null, 50.0, "http://example.com/image.jpg");

        // Assert
        assertNull(product.getProductName());
        assertNotNull(product.getId());
    }

    @Test
    @DisplayName("Should handle Product with null image URL")
    void testProductWithNullImageUrl() {
        // Act
        Product product = new Product("1", "Product", 50.0, null);

        // Assert
        assertNull(product.getImageUrl());
        assertNotNull(product.getId());
    }

    @Test
    @DisplayName("Should generate string representation")
    void testProductToString() {
        // Act
        Product product = new Product("1", "Test Product", 99.99, "http://example.com/image.jpg");

        // Assert
        assertNotNull(product.toString());
        assertTrue(product.toString().length() > 0);
    }

    @Test
    @DisplayName("Should verify product hash code")
    void testProductHashCode() {
        // Act
        Product product1 = new Product("1", "Test Product", 99.99, "http://example.com/image.jpg");
        Product product2 = new Product("1", "Test Product", 99.99, "http://example.com/image.jpg");

        // Assert
        assertEquals(product1.hashCode(), product2.hashCode());
    }

    @Test
    @DisplayName("Should update all fields sequentially")
    void testProductSettersSequential() {
        // Arrange
        Product product = new Product("1", "Original", 10.0, "http://example.com/original.jpg");

        // Act
        product.setId("2");
        product.setProductName("Updated");
        product.setPrice(20.0);
        product.setImageUrl("http://example.com/updated.jpg");

        // Assert
        assertEquals("2", product.getId());
        assertEquals("Updated", product.getProductName());
        assertEquals(20.0, product.getPrice());
        assertEquals("http://example.com/updated.jpg", product.getImageUrl());
    }

    @Test
    @DisplayName("Should handle empty strings")
    void testProductWithEmptyStrings() {
        // Act
        Product product = new Product("", "", 50.0, "");

        // Assert
        assertEquals("", product.getId());
        assertEquals("", product.getProductName());
        assertEquals("", product.getImageUrl());
    }
}

