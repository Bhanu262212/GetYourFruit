package com.wtd.dataLoader;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SecurityConfig.class)
@DisplayName("SecurityConfig Unit Tests")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Should allow GET request without authentication")
    void testSecurityConfig_AllowGetRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/")
                .contentType("application/json"))
                .andExpect(status().isNotFound()); // 404 expected since no controller mapped
    }

    @Test
    @DisplayName("Should allow POST request without authentication")
    void testSecurityConfig_AllowPostRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/save")
                .contentType("application/json")
                .content("{}"))
                .andExpect(status().isNotFound()); // 404 expected since no controller mapped
    }

    @Test
    @DisplayName("Should allow DELETE request without authentication")
    void testSecurityConfig_AllowDeleteRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/1")
                .contentType("application/json"))
                .andExpect(status().isNotFound()); // 404 expected since no controller mapped
    }

    @Test
    @DisplayName("Should disable CSRF protection")
    void testSecurityConfig_CSRFDisabled() throws Exception {
        // Act & Assert - CSRF token not required
        mockMvc.perform(post("/save")
                .contentType("application/json")
                .content("{}"))
                .andExpect(status().isNotFound()); // 404 expected, not 403 for CSRF
    }

    @Test
    @WithMockUser(username = "user")
    @DisplayName("Should allow authenticated user requests")
    void testSecurityConfig_AuthenticatedUser() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/")
                .contentType("application/json"))
                .andExpect(status().isNotFound());
    }
}

