package com.ssafy.bgs.auth.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.bgs.auth.jwt.JwtTokenProvider;
import com.ssafy.bgs.auth.oauth.SessionUser;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    // ObjectMapper를 이용해 SocialLoginResponseDto를 JSON으로 변환합니다.
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String frontRedirectUrl = "https://i12c209.p.ssafy.io/oauth2/login/success";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        HttpSession session = request.getSession();
        // 세션에 저장한 값(세션에 저장된 "user"와 "newUser" 값은 CustomOAuth2UserService에서 설정됨)
        SessionUser sessionUser = (SessionUser) session.getAttribute("user");
        Boolean newUser = (Boolean) session.getAttribute("newUser");

        if(sessionUser == null) {
            log.error("세션에 사용자 정보가 없습니다.");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "No session user found");
            return;
        }

        // 예시에서는 SessionUser에 사용자 ID가 있다고 가정합니다.
        // 만약 SessionUser에 id 필드가 없다면, email 등 다른 고유 값을 기준으로 JWT를 생성하도록 변경하세요.
        Integer userId = sessionUser.getUserId(); // SessionUser 클래스에 getId()가 구현되어 있다고 가정
        // JWT 토큰 생성 (각 토큰의 생성 로직은 JwtTokenProvider에 구현되어 있음)
        String accessToken = jwtTokenProvider.createAccessToken(userId);
        String refreshToken = jwtTokenProvider.createReFreshToken(userId);

        // 기존에 JSON 응답을 보내던 코드를 주석 처리하거나 제거하고,
        // 프론트엔드로 리다이렉트하며 토큰 정보를 URL fragment 혹은 쿼리 파라미터에 담습니다.
        String redirectUrl = frontRedirectUrl
                + "#accessToken=" + accessToken
                + "&refreshToken=" + refreshToken
                + "&newUser=" + (newUser != null ? newUser : false);

        response.sendRedirect(redirectUrl);
    }
}