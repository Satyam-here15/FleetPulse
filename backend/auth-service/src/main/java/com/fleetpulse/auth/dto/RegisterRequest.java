package com.fleetpulse.auth.dto;

import com.fleetpulse.auth.model.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private User.Role role;
}