package com.ssafy.bgs.image.service;

import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.entity.Image;
import com.ssafy.bgs.image.exception.ImageNotFoundException;
import com.ssafy.bgs.image.exception.ImageUploadException;
import com.ssafy.bgs.image.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    public List<Image> uploadImages(List<MultipartFile> files, String usageType, Long usageId) {
        List<Image> savedImages = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
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
            } catch (Exception e) {
                throw new ImageUploadException();
            }
        }

        return savedImages;
    }

    @Transactional
    public Image uploadImage(MultipartFile file, String usageType, Long usageId) {
        try {
            // 1) S3 업로드 -> key 반환
            String s3Key = s3Uploader.upload(file, "images/" + usageType + "/" + usageId);

            // 2) 파일 확장자 추출
            String ext = getFileExtension(file.getOriginalFilename());

            // 3) DB에 이미지 저장
            Image image = Image.builder()
                    .url(s3Key)
                    .extension(ext)
                    .createdAt(LocalDateTime.now())
                    .deleted(false)
                    .usageType(usageType)
                    .usageId(usageId)
                    .build();
            return imageRepository.save(image);
        } catch (Exception e) {
            throw new ImageUploadException();
        }
    }

    @Transactional
    public Image uploadImageWithThumbnail(MultipartFile file, String usageType, Long usageId) {
        try {
            // 1) 원본 이미지 S3 업로드 -> key 반환
            String s3Key = s3Uploader.upload(file, "images/" + usageType + "/" + usageId);

            // 2) 썸네일 생성 및 S3 업로드 -> key 반환
            String thumbnailKey = s3Uploader.uploadThumbnail(file, "thumbnails/" + usageType + "/" + usageId);

            // 3) 파일 확장자 추출
            String ext = getFileExtension(file.getOriginalFilename());

            // 4) DB에 이미지 저장
            Image image = Image.builder()
                    .url(s3Key)  // 원본 이미지 URL
                    .thumbnailUrl(thumbnailKey)
                    .extension(ext)
                    .createdAt(LocalDateTime.now())
                    .deleted(false)
                    .usageType(usageType)
                    .usageId(usageId)
                    .build();
            return imageRepository.save(image);
        } catch (Exception e) {
            throw new ImageUploadException();
        }
    }


    public Image getImage(Long imageId) {
        return imageRepository.findById(imageId)
                .orElseThrow(() -> new ImageNotFoundException(imageId));
    }

    /** 단일 이미지 조회 **/
    public ImageResponseDto getImage(String usageType, Integer usageId) {
        ImageResponseDto imageResponseDto = new ImageResponseDto();

        List<Image> images = imageRepository.findByUsageTypeAndUsageIdAndDeletedFalse(usageType, Long.valueOf(usageId));
        if (images.isEmpty()) {
            return null;
        }

        imageResponseDto.setImageId(images.get(0).getImageId());
        imageResponseDto.setUrl(images.get(0).getUrl());
        imageResponseDto.setThumbnailUrl(images.get(0).getThumbnailUrl());
        imageResponseDto.setExtension(images.get(0).getExtension());

        return imageResponseDto;
    }

    public List<Image> getImages(String usageType, Integer usageId) {
        return imageRepository.findByUsageTypeAndUsageIdAndDeletedFalse(usageType, Long.valueOf(usageId));
    }

    @Transactional
    public void deleteImage(Long imageId) {
        Image image = getImage(imageId);
        if (!image.isDeleted()) {
            image.setDeleted(true);
            // DB & S3 삭제
            imageRepository.save(image);
            s3Uploader.delete(image.getUrl());
            if (image.getThumbnailUrl() != null)
                s3Uploader.delete(image.getThumbnailUrl());
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
