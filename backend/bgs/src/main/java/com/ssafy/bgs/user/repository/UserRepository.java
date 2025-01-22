package com.ssafy.bgs.user.repository;

import com.ssafy.bgs.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByNickname(String nickname);

    Optional<User> findByKakaoId(Long kakaoId);

}
