package com.ddac.assignment.services.Impl;

import com.ddac.assignment.entity.*;
import com.ddac.assignment.services.LoginService;

import java.util.ArrayList;
import java.util.List;

public class LoginImpl implements LoginService {
    @Override
    public MessageDO login(LoginDO loginDO) {
        return null;
    }


    @Override
    public MessageDO register(RegisterDO registerDO) {
        String Password = registerDO.getPassword();
        String Password2 = registerDO.getPassword2();
        if (Password.equals(Password2)) {
            //后期用数据库比较以及写入
            MessageDO mes = new MessageDO();
            List<String> data = new ArrayList<>();
            data.add("Successfully registered");
            mes.setData(data);
            return mes;
        }else{
            // return to frontend
            MessageDO mes = new MessageDO();
            List<String> data = new ArrayList<>();
            data.add("Second Password is not same with First password!");
            mes.setData(data);
            return mes;
        }
    }
}
