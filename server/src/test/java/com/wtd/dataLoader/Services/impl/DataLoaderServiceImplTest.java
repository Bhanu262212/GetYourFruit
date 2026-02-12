package com.wtd.dataLoader.Services.impl;

import com.wtd.dataLoader.Dto.ProductRepository;
import com.wtd.dataLoader.Entity.Product;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("DataLoaderServiceImpl Unit Tests")
class DataLoaderServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private DataLoaderServiceImpl dataLoaderService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testProduct = new Product("1", "Test Product", 99.99, "http://example.com/image.jpg");
    }

    @Test
    @DisplayName("Should save product successfully")
    void testSaveProductDetails_Success() {
        // Arrange
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // Act
        assertDoesNotThrow(() -> dataLoaderService.saveProductDetails(testProduct));

        // Assert
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    @DisplayName("Should throw RuntimeException when save fails")
    void testSaveProductDetails_ThrowsException() {
        // Arrange
        doThrow(new RuntimeException("Save failed")).when(productRepository).save(any(Product.class));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> dataLoaderService.saveProductDetails(testProduct));
        verify(productRepository, times(1)).save(testProduct);
    }

    @Test
    @DisplayName("Should return list of all products")
    void testGetAll_ReturnsProductList() {
        // Arrange
        Product product1 = new Product("1", "Product 1", 50.0, "http://example.com/1.jpg");
        Product product2 = new Product("2", "Product 2", 75.0, "http://example.com/2.jpg");
        List<Product> expectedProducts = Arrays.asList(product1, product2);

        when(productRepository.findAll()).thenReturn(expectedProducts);

        // Act
        List<Product> actualProducts = dataLoaderService.getAll();

        // Assert
        assertNotNull(actualProducts);
        assertEquals(2, actualProducts.size());
        assertEquals("Product 1", actualProducts.get(0).getProductName());
        assertEquals("Product 2", actualProducts.get(1).getProductName());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no products exist")
    void testGetAll_ReturnsEmptyList() {
        // Arrange
        when(productRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<Product> actualProducts = dataLoaderService.getAll();

        // Assert
        assertNotNull(actualProducts);
        assertTrue(actualProducts.isEmpty());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should delete product by ID")
    void testDelete_Success() {
        // Arrange
        String productId = "1";
        doNothing().when(productRepository).deleteById(productId);

        // Act
        assertDoesNotThrow(() -> dataLoaderService.delete(productId));

        // Assert
        verify(productRepository, times(1)).deleteById(productId);
    }

    @Test
    @DisplayName("Should handle delete with different product IDs")
    void testDelete_MultipleIds() {
        // Arrange
        doNothing().when(productRepository).deleteById(anyString());

        // Act
        dataLoaderService.delete("product-1");
        dataLoaderService.delete("product-2");
        dataLoaderService.delete("product-3");

        // Assert
        verify(productRepository, times(3)).deleteById(anyString());
    }

    @Test
    @DisplayName("Should save product with all fields populated")
    void testSaveProductDetails_WithAllFields() {
        // Arrange
        Product productWithAllFields = new Product(
            "complete-1",
            "Complete Product",
            199.99,
            "http://example.com/complete.jpg"
        );
        when(productRepository.save(any(Product.class))).thenReturn(productWithAllFields);

        // Act
        assertDoesNotThrow(() -> dataLoaderService.saveProductDetails(productWithAllFields));

        // Assert
        verify(productRepository, times(1)).save(productWithAllFields);
    }

    @Test
    @DisplayName("Should retrieve single product from list")
    void testGetAll_VerifyProductData() {
        // Arrange
        Product product = new Product("single-1", "Single Product", 29.99, "http://example.com/single.jpg");
        when(productRepository.findAll()).thenReturn(Arrays.asList(product));

        // Act
        List<Product> products = dataLoaderService.getAll();

        // Assert
        assertEquals(1, products.size());
        assertEquals("single-1", products.get(0).getId());
        assertEquals("Single Product", products.get(0).getProductName());
        assertEquals(29.99, products.get(0).getPrice());
    }
}

