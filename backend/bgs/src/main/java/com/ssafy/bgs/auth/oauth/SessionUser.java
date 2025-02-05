package com.ssafy.bgs.auth.oauth;

import com.ssafy.bgs.user.entity.User;
import java.io.Serializable;
import lombok.Getter;

@Getter
public class SessionUser implements Serializable {
    private static final long serialVersionUID = 1L; // 명시적으로 serialVersionUID 지정

    private Integer userId;
    private String name;
    private String email;

    public SessionUser(User user) {
        this.userId = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
    }
}
