package com.ssafy.bgs.image.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.Files;
import java.util.UUID;

import static com.google.common.io.Files.getFileExtension;

@Component
@RequiredArgsConstructor
public class S3Uploader {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    /**
     * S3에 업로드 후 S3 key(또는 URL) 반환
     */
    public String upload(MultipartFile file, String dirName) throws IOException {
        // S3에 저장될 경로 (폴더명 + UUID + 원본 파일명)
        String originalName = file.getOriginalFilename();
        String key = dirName + "/" + UUID.randomUUID() + "_" + originalName;

        // 메타데이터 세팅
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        // S3에 업로드 (기본 ACL이 private)
        amazonS3.putObject(new PutObjectRequest(bucketName, key, file.getInputStream(), metadata));

        return key; // key를 DB에 저장하고, 실제 요청 시 key를 통해 다운로드
    }

    public String upload(File file, String dirName) throws IOException {
        // S3에 저장될 경로 (폴더명 + UUID + 원본 파일명)
        String originalName = file.getName();
        String key = dirName + "/" + UUID.randomUUID() + "_" + originalName;

        // 메타데이터 세팅
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.length());
        metadata.setContentType(Files.probeContentType(file.toPath()));  // Mime 타입 추출

        // S3에 업로드 (기본 ACL이 private)
        try (FileInputStream fileInputStream = new FileInputStream(file)) {
            amazonS3.putObject(new PutObjectRequest(bucketName, key, fileInputStream, metadata));
        }

        return key; // key를 DB에 저장하고, 실제 요청 시 key를 통해 다운로드
    }


    public String uploadThumbnail(MultipartFile file, String dirName) throws IOException {
        String originalName = file.getOriginalFilename();
        String ext = getFileExtension(originalName).toLowerCase();

        if (ext.equals("mp4")) {
            // 🎬 mp4 파일이면 첫 번째 프레임을 이미지로 추출
            return uploadVideoThumbnail(file, dirName);
        } else {
            // 🖼️ 일반 이미지 파일이면 기존 방식으로 처리
            return uploadImageThumbnail(file, dirName);
        }
    }

    public String uploadThumbnail(File file, String dirName) throws IOException {
        String originalName = file.getName();
        String ext = getFileExtension(originalName).toLowerCase();

        if (ext.equals("mp4")) {
            // 🎬 mp4 파일이면 첫 번째 프레임을 이미지로 추출
            return uploadVideoThumbnail(file, dirName);
        } else {
            // 🖼️ 일반 이미지 파일이면 기존 방식으로 처리
            return uploadImageThumbnail(file, dirName);
        }
    }


    public String uploadVideoThumbnail(MultipartFile file, String dirName) throws IOException {
        // 1️⃣ MultipartFile을 로컬 파일로 저장
        File tempFile = File.createTempFile("video", ".mp4");
        file.transferTo(tempFile);

        // 2️⃣ FFmpeg을 사용하여 처음 100프레임을 5초 길이의 숏폼 영상으로 추출
        File thumbnailVideo = new File(tempFile.getParent(), "thumbnail.mp4");

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", tempFile.getAbsolutePath(),
                "-vf", "select='lt(n,100)',scale=300:300:force_original_aspect_ratio=decrease,pad=300:300:(ow-iw)/2:(oh-ih)/2",
                "-vsync", "vfr", "-an", "-y", thumbnailVideo.getAbsolutePath()
        );

        pb.redirectErrorStream(true); // 표준 오류 출력을 표준 출력으로 병합
        Process process = pb.start();

        // ✅ FFmpeg 실행 로그 출력
        new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println(line);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();

        // ✅ 프로세스 실행 완료 대기
        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg execution failed with exit code " + exitCode);
            }
        } catch (InterruptedException e) {
            throw new RuntimeException("Video processing interrupted", e);
        }

        String originalName = file.getOriginalFilename();
        String key = dirName + "/" + UUID.randomUUID() + "_thumb_" + originalName;

        // 3️⃣ S3 업로드
        try (FileInputStream thumbnailInputStream = new FileInputStream(thumbnailVideo)) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(thumbnailVideo.length());
            metadata.setContentType("video/mp4");

            amazonS3.putObject(new PutObjectRequest(bucketName, key, thumbnailInputStream, metadata));
        }

        // 4️⃣ 로컬 파일 삭제 (임시 파일 정리)
        tempFile.delete();
        thumbnailVideo.delete();

        return key;
    }

    public String uploadVideoThumbnail(File file, String dirName) throws IOException {
        // 1️⃣ File을 로컬 파일로 저장할 필요 없음, 이미 File 객체로 있음
        // File file 그대로 사용

        // 2️⃣ FFmpeg을 사용하여 처음 100프레임을 5초 길이의 숏폼 영상으로 추출
        File thumbnailVideo = new File(file.getParent(), "thumbnail.mp4");

        ProcessBuilder pb = new ProcessBuilder(
                "ffmpeg", "-i", file.getAbsolutePath(),
                "-vf", "select='lt(n,100)',scale=300:300:force_original_aspect_ratio=decrease,pad=300:300:(ow-iw)/2:(oh-ih)/2",
                "-vsync", "vfr", "-an", "-y", thumbnailVideo.getAbsolutePath()
        );

        pb.redirectErrorStream(true); // 표준 오류 출력을 표준 출력으로 병합
        Process process = pb.start();

        // ✅ FFmpeg 실행 로그 출력
        new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println(line);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();

        // ✅ 프로세스 실행 완료 대기
        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg execution failed with exit code " + exitCode);
            }
        } catch (InterruptedException e) {
            throw new RuntimeException("Video processing interrupted", e);
        }

        String originalName = file.getName();
        String key = dirName + "/" + UUID.randomUUID() + "_thumb_" + originalName;

        // 3️⃣ S3 업로드
        try (FileInputStream thumbnailInputStream = new FileInputStream(thumbnailVideo)) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(thumbnailVideo.length());
            metadata.setContentType("video/mp4");

            amazonS3.putObject(new PutObjectRequest(bucketName, key, thumbnailInputStream, metadata));
        }

        // 4️⃣ 로컬 파일 삭제 (임시 파일 정리)
        thumbnailVideo.delete();

        return key;
    }




    private String uploadImageThumbnail(MultipartFile file, String dirName) throws IOException {
        // 1) 이미지 리사이징 (300x300 예제)
        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        BufferedImage resizedImage = resizeAndCropImage(originalImage, 300, 300);

        // 2) 썸네일을 ByteArray로 변환
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "jpg", baos);
        byte[] thumbnailBytes = baos.toByteArray();
        ByteArrayInputStream thumbnailInputStream = new ByteArrayInputStream(thumbnailBytes);

        // 3) S3에 저장될 경로 생성
        String originalName = file.getOriginalFilename();
        String key = dirName + "/" + UUID.randomUUID() + "_thumb_" + originalName;

        // 4) 메타데이터 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(thumbnailBytes.length);
        metadata.setContentType("image/jpeg");

        // 5) S3에 썸네일 업로드
        amazonS3.putObject(new PutObjectRequest(bucketName, key, thumbnailInputStream, metadata));

        return key; // 썸네일 S3 경로 반환
    }

    private String uploadImageThumbnail(File file, String dirName) throws IOException {
        // 1) 이미지 리사이징 (300x300 예제)
        BufferedImage originalImage = ImageIO.read(file);
        BufferedImage resizedImage = resizeAndCropImage(originalImage, 300, 300);

        // 2) 썸네일을 ByteArray로 변환
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "jpg", baos);
        byte[] thumbnailBytes = baos.toByteArray();
        ByteArrayInputStream thumbnailInputStream = new ByteArrayInputStream(thumbnailBytes);

        // 3) S3에 저장될 경로 생성
        String originalName = file.getName();
        String key = dirName + "/" + UUID.randomUUID() + "_thumb_" + originalName;

        // 4) 메타데이터 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(thumbnailBytes.length);
        metadata.setContentType("image/jpeg");

        // 5) S3에 썸네일 업로드
        amazonS3.putObject(new PutObjectRequest(bucketName, key, thumbnailInputStream, metadata));

        return key; // 썸네일 S3 경로 반환
    }


    private BufferedImage resizeAndCropImage(BufferedImage originalImage, int targetWidth, int targetHeight) {
        int originWidth = originalImage.getWidth();
        int originHeight = originalImage.getHeight();

        // 1️⃣ 원본 비율 유지하면서 리사이징할 크기 계산
        double ratio = Math.max((double) targetWidth / originWidth, (double) targetHeight / originHeight);
        int newWidth = (int) (originWidth * ratio);
        int newHeight = (int) (originHeight * ratio);

        // 2️⃣ 리사이징 진행
        Image tmp = originalImage.getScaledInstance(newWidth, newHeight, Image.SCALE_SMOOTH);
        BufferedImage resized = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.drawImage(tmp, 0, 0, null);
        g2d.dispose();

        // 3️⃣ 중앙 크롭 (리사이징한 이미지에서 300x300 크기만 잘라냄)
        int x = (newWidth - targetWidth) / 2;
        int y = (newHeight - targetHeight) / 2;
        return resized.getSubimage(x, y, targetWidth, targetHeight);
    }




    /**
     * S3 객체를 받아오기 (InputStream)
     */
    public S3ObjectInputStream getObject(String key) {
        S3Object s3Object = amazonS3.getObject(bucketName, key);
        return s3Object.getObjectContent();
    }

    /**
     * S3 객체 삭제
     */
    public void delete(String key) {
        amazonS3.deleteObject(bucketName, key);
    }
}
