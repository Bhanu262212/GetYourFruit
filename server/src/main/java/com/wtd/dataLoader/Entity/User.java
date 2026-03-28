package com.wtd.dataLoader.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Generated;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document
@Builder
@AllArgsConstructor
public class User {

    @Id
    @Generated
    private String id;
    private String username;
    private String email;
    private String password;
    private Integer phoneNumber;
    private String defaultShippingAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;

}
