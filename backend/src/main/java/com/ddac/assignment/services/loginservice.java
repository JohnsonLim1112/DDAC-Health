package com.ddac.assignment.services;

import com.ddac.assignment.entity.*;

public interface LoginService {
    MessageDO login(LoginDO loginDO);
    MessageDO register(RegisterDO registerDO);
}
