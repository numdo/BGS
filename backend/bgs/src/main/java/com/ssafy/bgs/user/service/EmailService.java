package com.ssafy.bgs.user.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Random;

public class EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress = "kjgd123@naver.com"; // 네이버 SMTP 인증 이메일 주소

    // 생성자를 통해 JavaMailSender 주입
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * 사용자 이메일로 인증 코드 전송
     * @param toEmail 대상 이메일 주소
     * @return 생성된 인증 코드
     */
    public String sendVerificationEmail(String toEmail) {
        // 인증 코드 생성
        String verificationCode = generateVerificationCode();

        // 이메일 제목과 내용 설정
        String subject = "🎉 불끈성 회원가입 인증 코드 안내";
        String content = "<div style='font-family: Arial, sans-serif; text-align: center;'>" +
                "<h2 style='color: #FF5733;'>안녕하세요! 💪</h2>" +
                "<p>불끈성에 오신 것을 환영합니다! 회원가입을 완료하시려면 아래의 인증 코드를 입력해주세요:</p>" +
                "<h1 style='background-color: #F0F0F0; display: inline-block; padding: 10px; border-radius: 5px;'>" +
                verificationCode + "</h1>" +
                "<p>이 코드는 10분 동안 유효합니다. 🕒</p>" +
                "<p>불끈성과 함께 나만의 헬스장을 꾸미고, 운동 기록을 자랑해보세요! 🏋️‍♂️🏆</p>" +
                "<p>감사합니다. 좋은 하루 되세요! 🌟</p>" +
                "</div>";

        // 이메일 전송
        sendEmail(toEmail, subject, content);

        // 인증 코드 저장 (추가 로직 필요)
        // 예: verificationService.storeVerificationCode(email, verificationCode);

        return verificationCode; // 인증 코드 반환
    }


    /**
     * 이메일 전송 메서드
     * @param toEmail 대상 이메일 주소
     * @param subject 이메일 제목
     * @param content 이메일 내용 (HTML 형식)
     */
    private void sendEmail(String toEmail, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress); // 발신자 주소 명시적으로 설정
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true); // HTML 형식으로 전송

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 랜덤 6자리 인증 코드 생성
     * @return 인증 코드
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6자리 랜덤 숫자
        return String.valueOf(code);
    }

    /**
     * 인증 코드 검증
     * @param email 사용자 이메일
     * @param code 입력된 인증 코드
     * @return 검증 성공 여부
     */
    public boolean verifyCode(String email, String code) {
        // 인증 코드 검증 로직 추가
        // 예: return verificationService.verifyCode(email, code);
        return false; // 예시
    }

    /**
     * 이메일 인증 여부 확인
     * @param email 사용자 이메일
     * @return 인증 여부
     */
    public boolean isEmailVerified(String email) {
        // 인증 여부 확인 로직 추가
        // 예: return verificationService.isEmailVerified(email);
        return false; // 예시
    }
    /**
     * 임시 비밀번호 전송
     */
    public void sendTemporaryPasswordEmail(String toEmail, String tempPassword) {
        String subject = "🔑 불끈성 비밀번호 재설정 안내";
        String content = "<div style='font-family: Arial, sans-serif; text-align: center;'>" +
                "<h2 style='color: #FF5733;'>안녕하세요, 불끈성 회원님! 💪</h2>" +
                "<p>비밀번호 재설정 요청을 받았습니다. 아래의 임시 비밀번호를 사용하여 로그인하신 후, 반드시 새로운 비밀번호로 변경해 주세요. 🔒</p>" +
                "<h3 style='background-color: #F0F0F0; display: inline-block; padding: 10px; border-radius: 5px;'>" +
                "임시 비밀번호: <b>" + tempPassword + "</b></h3>" +
                "<p>계정 보안을 위해 비밀번호 변경은 필수입니다. 🛡️</p>" +
                "<p>불끈성과 함께 나만의 헬스장을 꾸미고, 운동 기록을 자랑해보세요! 🏋️‍♂️🏆</p>" +
                "<p>감사합니다. 건강한 하루 되세요! 🌟</p>" +
                "</div>";

        sendEmail(toEmail, subject, content);
    }

}
