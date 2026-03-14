package com.wtd.dataLoader.Dto;

import com.wtd.dataLoader.Entity.Product;
import com.wtd.dataLoader.Entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

    boolean validateUser(String username, String password);
    void saveUserDetails(User user);
    User getUserByUsername(String username);
    User getUserByEmail(String email);
    User getUserByPhoneNumber(Integer phoneNumber);
    User getUserById(String id);
    String getUserIdByUsername(String username);
}
