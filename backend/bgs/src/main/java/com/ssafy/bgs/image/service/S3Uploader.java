package com.ssafy.bgs.image.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

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
