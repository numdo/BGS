package com.ssafy.bgs.image.service;

import com.ssafy.bgs.image.entity.Image;
import com.ssafy.bgs.image.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final S3Uploader s3Uploader;
    private final ImageRepository imageRepository;

    @Value("${aws.s3.base-url}")
    private String s3BaseUrl;
    /**
     * 다중 이미지 업로드
     */
    @Transactional
    public List<Image> uploadImages(List<MultipartFile> files, String usageType, Long usageId) throws IOException {

        List<Image> savedImages = new ArrayList<>();

        for (MultipartFile file : files) {
            // 1) S3 업로드 -> key 반환
            String s3Key = s3Uploader.upload(file, "images/" + usageType + "/" + usageId);

            // 2) 파일 확장자
            String ext = getFileExtension(file.getOriginalFilename());

            // 3) DB 저장
            Image image = Image.builder()
                    .url(s3Key)
                    .extension(ext)
                    .createdAt(LocalDateTime.now())
                    .deleted(false)
                    .usageType(usageType)
                    .usageId(usageId)
                    .build();
            savedImages.add(imageRepository.save(image));
        }

        return savedImages;
    }

    public Image getImage(Long imageId) {
        return imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("이미지 ID를 찾을 수 없음: " + imageId));
    }

    public List<Image> getImages(String usageType, Long usageId) {
        return imageRepository.findByUsageTypeAndUsageId(usageType, usageId);
    }

    @Transactional
    public void deleteImage(Long imageId) {
        Image image = getImage(imageId);
        if (!image.isDeleted()) {
            image.setDeleted(true);
            // DB & S3 삭제
            imageRepository.save(image);
            s3Uploader.delete(image.getUrl());
        }
    }


    /**
     * 해당 userId의 "가장 최신" 프로필 이미지를 가져오기
     */
    @Transactional(readOnly = true)
    public Optional<Image> findLatestProfileImage(int userId) {
        // usageType='PROFILE', usageId=userId, deleted=false 순으로 최신 순
        List<Image> profileImages = imageRepository.findProfileImages(userId);
        if (profileImages.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(profileImages.get(0)); // createdAt DESC 정렬의 첫 번째 = 최신
    }


    /**
     * 이미지 확장자 가져오기
     * @param fileName
     * @return
     */
    private String getFileExtension(String fileName) {
        if (fileName == null) return "";
        int idx = fileName.lastIndexOf('.');
        if (idx == -1) return "";
        return fileName.substring(idx + 1);
    }


    /**
     * S3 Key를 전체 URL로 변환
     */
    public String getS3Url(String key) {
        return s3BaseUrl + key;
    }

    // 필요한 경우 s3Uploader getter
    public S3Uploader getS3Uploader() {
        return s3Uploader;
    }

}
