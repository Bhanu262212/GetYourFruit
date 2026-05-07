package com.wtd.dataLoader.Resource;

import com.wtd.dataLoader.Entity.User;
import com.wtd.dataLoader.Services.UserDetailsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
public class UserDetailsResource {

    @Autowired
    private UserDetailsService userDetailsService;

    @GetMapping("/validate")
    public ResponseEntity<?> validateUser(String Username, String Password) {
        log.info("Validating user details");
        if( userDetailsService.validateUser(Username, Password))
        {
            log.debug("User validated successfully");
            User user = userDetailsService.getUserByUsername(Username);
            return ResponseEntity.ok(user);
        }
        log.debug("User validation failed.. ! Invalid username or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
    }

    @PostMapping("/saveUser")
    public ResponseEntity<?> saveUserDetails(@RequestBody User user) {
        log.info("Saving user details for username: {}", user.getUsername());
        if (userDetailsService.getUserByUsername(user.getUsername()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }
        return ResponseEntity.ok(userDetailsService.saveUserDetails(user));
    }

    @GetMapping("/getUserDetails")
    public ResponseEntity<?> getUserDetails(String username) {
        log.info("Fetching user details for username: {}", username);
        User user = userDetailsService.getUserByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    @GetMapping("/getAllUsers")
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("Fetching all users");
        return ResponseEntity.ok(userDetailsService.getAllUsers());
    }

    @PutMapping("/updateUser")
    public ResponseEntity<?> updateUser(@RequestBody User user) {
        log.info("Updating user with ID: {}", user.getId());
        User existingUser = userDetailsService.getUserById(user.getId());
        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        existingUser.setRole(user.getRole());
        return ResponseEntity.ok(userDetailsService.updateUser(existingUser));
    }

}
