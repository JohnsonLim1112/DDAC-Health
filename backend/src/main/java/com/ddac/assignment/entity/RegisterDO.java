package com.ddac.assignment.entity;

import lombok.Data;

@Data
public class RegisterDO {
    private String username;

    private String password;

    private String password2;

    private String role;
}
