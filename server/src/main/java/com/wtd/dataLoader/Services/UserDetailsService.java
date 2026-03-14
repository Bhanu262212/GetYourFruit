package com.wtd.dataLoader.Services;


import com.wtd.dataLoader.Entity.User;

public interface UserDetailsService {

    public boolean validateUser(String username, String password);
    public void saveUserDetails(User user);
    public User getUserByUsername(String username);
    public User getUserById(String id);
    public String getUserIdByUsername(String username);


}
