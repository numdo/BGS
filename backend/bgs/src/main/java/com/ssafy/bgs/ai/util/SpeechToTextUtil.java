package com.ssafy.bgs.ai.util;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.speech.v1.*;
import com.google.protobuf.ByteString;
import com.ssafy.bgs.ai.config.STTConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SpeechToTextUtil {

    private final STTConfig sttConfig;

    /**
     * Google STT를 사용하여 음성을 텍스트로 변환 (운동 단어 추가 및 인식률 개선)
     */
    public String googleSpeechToText(MultipartFile audioFile) throws IOException {
        try (InputStream credentialsStream = getClass().getResourceAsStream("/google-credentials.json")) {
            if (credentialsStream == null) {
                throw new IOException("google-credentials.json 파일을 찾을 수 없습니다.");
            }
            SpeechSettings speechSettings = SpeechSettings.newBuilder()
                    .setCredentialsProvider(() -> GoogleCredentials.fromStream(credentialsStream))
                    .build();

            try (SpeechClient speechClient = SpeechClient.create(speechSettings)) {
                ByteString audioBytes = ByteString.readFrom(audioFile.getInputStream());

                // 운동 관련 용어를 포함하는 SpeechContext 구축 (boost 값 10.0f 적용)
                SpeechContext.Builder speechContext = SpeechContext.newBuilder()
                        .addAllPhrases(WORKOUT_NAMES)
                        .setBoost(15.0f);

                // RecognitionConfig 구성:
                // - WEBM_OPUS 형식, 48000Hz (Chrome MediaRecorder 기본값)
                // - 한국어("ko-KR")
                // - 최신 장문 인식 모델("latest_long") 사용하여 인식률 개선
                RecognitionConfig config = RecognitionConfig.newBuilder()
                        .setEncoding(RecognitionConfig.AudioEncoding.WEBM_OPUS)
                        .setSampleRateHertz(48000)
                        .setLanguageCode(sttConfig.getLanguage()) // 예: "ko-KR"
                        .setModel("latest_long")
                        .setUseEnhanced(true)
                        .addSpeechContexts(speechContext.build())
                        .build();

                RecognitionAudio audio = RecognitionAudio.newBuilder()
                        .setContent(audioBytes)
                        .build();

                RecognizeResponse response = speechClient.recognize(config, audio);
                StringBuilder sb = new StringBuilder();

                for (SpeechRecognitionResult result : response.getResultsList()) {
                    sb.append(result.getAlternativesList().get(0).getTranscript()).append(" ");
                }
                String transcript = sb.toString().trim();
                log.info("✅ STT 변환 결과: {}", transcript);
                return transcript;
            }
        }
    }

    // 운동 종류 700개 추가 (동의어 포함; 아래는 일부 예시이며, 실제 프로젝트에서는 CSV 파일 등으로 관리하는 것이 좋습니다.)
    private static final List<String> WORKOUT_NAMES = Arrays.asList(
            "벤치프레스", "벤치 프레스", "bench press",
            "데드리프트", "deadlift",
            "스쿼트", "squat",
            "레그프레스", "leg press",
            "랫풀다운", "랫 풀 다운", "lat pulldown",
            "풀업", "풀 업", "pull up",
            "친업", "chin up",
            "딥스", "dips",
            "힙쓰러스트", "hip thrust",
            "사이드레터럴레이즈", "side lateral raise",
            "트라이셉스익스텐션", "triceps extension",
            "프론트레이즈", "front raise",
            "바벨로우", "barbell row",
            "덤벨컬", "dumbbell curl",
            "케이블크런치", "cable crunch",
            "펙덱플라이"
            // ... 여기에 700개 단어(및 동의어)를 추가할 수 있음
    );
}
