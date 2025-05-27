package com.ssafy.bgs.image.controller;

import com.ssafy.bgs.image.entity.Image;
import com.ssafy.bgs.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(required = false) String usageType,
            @RequestParam(required = false) Long usageId
    ) throws IOException {

        List<Image> saved = imageService.uploadImages(files, usageType, usageId);
        List<Long> ids = saved.stream().map(Image::getImageId).collect(Collectors.toList());

        return ResponseEntity.ok(ids);
    }

    @GetMapping("/{imageId}")
    public ResponseEntity<?> getImage(@PathVariable Long imageId) throws IOException {
        // DB 조회
        Image image = imageService.getImage(imageId);

        // S3에서 파일 스트림 가져오기
        var s3InputStream = imageService.getS3Uploader().getObject(image.getUrl());

        // 확장자에 따른 ContentType 간단 설정
        MediaType mediaType = MediaType.IMAGE_JPEG;
        String ext = image.getExtension().toLowerCase();
        switch (ext) {
            case "png": mediaType = MediaType.IMAGE_PNG; break;
            case "gif": mediaType = MediaType.IMAGE_GIF; break;
            case "jpg":
            case "jpeg":
            default:
                mediaType = MediaType.IMAGE_JPEG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(new InputStreamResource(s3InputStream));
    }
}
