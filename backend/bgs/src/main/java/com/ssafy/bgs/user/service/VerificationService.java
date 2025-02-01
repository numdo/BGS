package com.ssafy.bgs.user.service;

import com.ssafy.bgs.redis.service.RedisService;
import org.springframework.stereotype.Service;

@Service
public class VerificationService {
    private static final String VERIFICATION_KEY_PREFIX = "verification:";

    private final RedisService redisService;

    public VerificationService(RedisService redisService) {
        this.redisService = redisService;
    }

    /**
     * 인증 코드 저장 (예: 10분 동안 유효)
     * @param email 사용자 이메일
     * @param code 인증 코드
     */
    public void storeVerificationCode(String email, String code) {
        String key = VERIFICATION_KEY_PREFIX + email;
        // TTL: 10분 (단위: 분)
        redisService.setValue(key, code, 10);
    }

    /**
     * 인증 코드 검증
     * @param email 사용자 이메일
     * @param code 입력된 인증 코드
     * @return 검증 성공 여부
     */
    public boolean verifyCode(String email, String code) {
        String key = VERIFICATION_KEY_PREFIX + email;
        Object storedValue = redisService.getValue(key);
        if (storedValue != null && storedValue.equals(code)) {
            // 인증 성공 시 "VERIFIED" 상태로 업데이트 (TTL은 필요에 따라 조정)
            redisService.setValue(key, "VERIFIED", 10);
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
        String key = VERIFICATION_KEY_PREFIX + email;
        Object value = redisService.getValue(key);
        return "VERIFIED".equals(value);
    }

    /**
     * 인증 코드 제거 (회원가입 완료 후)
     * @param email 사용자 이메일
     */
    public void removeVerificationCode(String email) {
        String key = VERIFICATION_KEY_PREFIX + email;
        redisService.deleteValue(key);
    }
}
