package com.ssafy.bgs.user.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationService {
    private final Map<String, String> verificationStorage = new ConcurrentHashMap<>();

    /**
     * 인증 코드 저장
     * @param email 사용자 이메일
     * @param code 인증 코드
     */
    public void storeVerificationCode(String email, String code) {
        verificationStorage.put(email, code);
    }

    /**
     * 인증 코드 검증
     * @param email 사용자 이메일
     * @param code 입력된 인증 코드
     * @return 검증 성공 여부
     */
    public boolean verifyCode(String email, String code) {
        // 인증 코드 일치 확인
        if (verificationStorage.containsKey(email) && verificationStorage.get(email).equals(code)) {
            // 인증 성공 시 VERIFIED로 상태 변경
            verificationStorage.put(email, "VERIFIED");
            return true;
        }
        return false;
    }

    /**
     * 이메일 인증 여부 확인
     * @param email 사용자 이메일
     * @return 인증 여부
     */
    public boolean isEmailVerified(String email) {
        return "VERIFIED".equals(verificationStorage.get(email));
    }

    /**
     * 인증 코드 제거 (회원가입 완료 후)
     * @param email 사용자 이메일
     */
    public void removeVerificationCode(String email) {
        verificationStorage.remove(email);
    }
}
