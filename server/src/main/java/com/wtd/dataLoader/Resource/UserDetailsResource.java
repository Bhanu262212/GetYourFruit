package com.wtd.dataLoader.Resource;

import com.wtd.dataLoader.Entity.User;
import com.wtd.dataLoader.Services.UserDetailsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class UserDetailsResource {

    @Autowired
    private UserDetailsService userDetailsService;

    @GetMapping("/validate")
    public boolean validateUser(String Username, String Password) {
        log.info("Validating user details");
        if( userDetailsService.validateUser(Username, Password))
        {
            log.debug("User validated successfully");
            return true;
        }
        log.debug("User validation failed.. ! Invalid username or password");
        return false;
    }

    @PostMapping("/saveUser")
    public User saveUserDetails(User user) {
        log.info("Saving user details for username: {}", user.getUsername());
       return userDetailsService.saveUserDetails(user);
    }

}
