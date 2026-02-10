package com.wtd.dataLoader.Resource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wtd.dataLoader.Entity.Product;
import com.wtd.dataLoader.Services.DataLoaderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("DataLoaderResource Controller Tests")
class DataLoaderResourceTest {

    @Mock
    private DataLoaderService dataLoaderService;

    @InjectMocks
    private DataLoaderResource dataLoaderResource;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(dataLoaderResource).build();
        objectMapper = new ObjectMapper();
        testProduct = new Product("1", "Test Product", 99.99, "http://example.com/image.jpg");
    }

    @Test
    @DisplayName("POST /save - Should save product and return OK status")
    void testSaveProductDetails_Success() throws Exception {
        // Arrange
        doNothing().when(dataLoaderService).saveProductDetails(any(Product.class));

        // Act & Assert
        mockMvc.perform(post("/save")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testProduct)))
                .andExpect(status().isOk());

        verify(dataLoaderService, times(1)).saveProductDetails(any(Product.class));
    }

    @Test
    @DisplayName("POST /save - Should save multiple products sequentially")
    void testSaveProductDetails_MultipleProducts() throws Exception {
        // Arrange
        Product product1 = new Product("1", "Product 1", 50.0, "http://example.com/1.jpg");
        Product product2 = new Product("2", "Product 2", 75.0, "http://example.com/2.jpg");
        doNothing().when(dataLoaderService).saveProductDetails(any(Product.class));

        // Act & Assert - Save first product
        mockMvc.perform(post("/save")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isOk());

        // Act & Assert - Save second product
        mockMvc.perform(post("/save")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product2)))
                .andExpect(status().isOk());

        verify(dataLoaderService, times(2)).saveProductDetails(any(Product.class));
    }

    @Test
    @DisplayName("GET / - Should retrieve list of products")
    void testGetAll_ReturnsProductList() throws Exception {
        // Arrange
        Product product1 = new Product("1", "Product 1", 50.0, "http://example.com/1.jpg");
        Product product2 = new Product("2", "Product 2", 75.0, "http://example.com/2.jpg");
        List<Product> expectedProducts = Arrays.asList(product1, product2);
        when(dataLoaderService.getAll()).thenReturn(expectedProducts);

        // Act & Assert
        mockMvc.perform(get("/")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].productName").value("Product 1"))
                .andExpect(jsonPath("$[1].productName").value("Product 2"));

        verify(dataLoaderService, times(1)).getAll();
    }

    @Test
    @DisplayName("GET / - Should return empty list when no products exist")
    void testGetAll_EmptyList() throws Exception {
        // Arrange
        when(dataLoaderService.getAll()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(dataLoaderService, times(1)).getAll();
    }

    @Test
    @DisplayName("DELETE /{id} - Should delete product and return success message")
    void testDeleteProduct_Success() throws Exception {
        // Arrange
        String productId = "1";
        doNothing().when(dataLoaderService).delete(productId);

        // Act & Assert
        mockMvc.perform(delete("/{id}", productId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Product with Id " + productId + " Deleted Successfully"));

        verify(dataLoaderService, times(1)).delete(productId);
    }

    @Test
    @DisplayName("DELETE /{id} - Should handle multiple delete operations")
    void testDeleteProduct_MultipleIds() throws Exception {
        // Arrange
        doNothing().when(dataLoaderService).delete(anyString());

        // Act & Assert - Delete product 1
        mockMvc.perform(delete("/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Product with Id 1 Deleted Successfully"));

        // Act & Assert - Delete product 2
        mockMvc.perform(delete("/2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Product with Id 2 Deleted Successfully"));

        verify(dataLoaderService, times(2)).delete(anyString());
    }

    @Test
    @DisplayName("POST /save - Should accept product with all fields")
    void testSaveProductDetails_CompleteProduct() throws Exception {
        // Arrange
        Product completeProduct = new Product(
            "complete-1",
            "Complete Product",
            199.99,
            "http://example.com/complete.jpg"
        );
        doNothing().when(dataLoaderService).saveProductDetails(any(Product.class));

        // Act & Assert
        mockMvc.perform(post("/save")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(completeProduct)))
                .andExpect(status().isOk());

        verify(dataLoaderService, times(1)).saveProductDetails(any(Product.class));
    }

    @Test
    @DisplayName("GET / - Should verify product details in list")
    void testGetAll_VerifyProductDetails() throws Exception {
        // Arrange
        Product product = new Product("test-1", "Test Product", 29.99, "http://example.com/test.jpg");
        when(dataLoaderService.getAll()).thenReturn(Arrays.asList(product));

        // Act & Assert
        mockMvc.perform(get("/")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("test-1"))
                .andExpect(jsonPath("$[0].productName").value("Test Product"))
                .andExpect(jsonPath("$[0].price").value(29.99))
                .andExpect(jsonPath("$[0].imageUrl").value("http://example.com/test.jpg"));

        verify(dataLoaderService, times(1)).getAll();
    }

    @Test
    @DisplayName("DELETE /{id} - Should return correct message format")
    void testDeleteProduct_MessageFormat() throws Exception {
        // Arrange
        String productId = "product-xyz-123";
        doNothing().when(dataLoaderService).delete(productId);

        // Act & Assert
        mockMvc.perform(delete("/{id}", productId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Product with Id " + productId + " Deleted Successfully"));

        verify(dataLoaderService, times(1)).delete(productId);
    }
}

