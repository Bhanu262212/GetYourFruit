package com.wtd.dataLoader.Services.impl;

import com.wtd.dataLoader.Dto.UserRepository;
import com.wtd.dataLoader.Entity.User;
import com.wtd.dataLoader.Services.UserDetailsService;
import com.wtd.dataLoader.Utility.EncriptionUtility;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    public boolean validateUser(String username, String password) {

        log.debug("Validating user with username: {}", username);
        String encryptedPassword = EncriptionUtility.encrypt(password);
        return userRepository.validateUser(username, encryptedPassword);
    }

    public User getUserDetailsByUsername(String username) {
        log.debug("Fetching user details for username: {}", username);
        return userRepository.getUserByUsername(username);
    }

    public User getUserDetailsByID(String id) {
        log.debug("Fetching user details for email: {}", id);
        return userRepository.getUserById(id);
    }

    public String getUserIdByUsername(String username) {
        log.debug("Fetching user ID for username: {}", username);
        return userRepository.getUserIdByUsername(username);
    }

     public void saveUserDetails(User user) {
         log.debug("Saving user details for username: {}", user.getUsername());
         String encryptedPassword = EncriptionUtility.encrypt(user.getPassword());
         User userBuilder = User.builder()
                 .username(user.getUsername())
                 .email(user.getEmail())
                 .password(encryptedPassword)
                 .phoneNumber(user.getPhoneNumber())
                 .defaultShippingAddress(user.getDefaultShippingAddress())
                 .city(user.getCity())
                 .state(user.getState())
                 .zipCode(user.getZipCode())
                 .country(user.getCountry())
                 .build();
         userRepository.saveUserDetails(userBuilder);
     }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.getUserByUsername(username);
    }

    public User getUserById(String id){
        log.debug("Fetching user details for ID: {}", id);
        return userRepository.getUserById(id);
    }

}
