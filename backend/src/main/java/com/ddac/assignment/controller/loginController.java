package com.ddac.assignment.controller;

import com.ddac.assignment.entity.LoginDO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;

@RestController
@RequestMapping("/api/login")
public class LoginController {


    @GetMapping("/register")
    public ResponseEntity<String> login(@RequestBody LoginDO loginDO) {
        return ResponseEntity.ok().body("success");
    }

}
