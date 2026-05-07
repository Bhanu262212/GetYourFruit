package com.wtd.dataLoader.Services;


import com.wtd.dataLoader.Entity.User;

import java.util.List;

public interface UserDetailsService {

    public boolean validateUser(String username, String password);
    public User saveUserDetails(User user);
    public User getUserByUsername(String username);
    public User getUserById(String id);
    public String getUserIdByUsername(String username);
    public java.util.List<User> getAllUsers();
    public User updateUser(User user);


}
