package com.ssafy.bgs.image.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "images")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    // S3 업로드 후의 key(또는 full url) 저장
    private String url;
    private String thumbnailUrl;

    private String extension;

    private LocalDateTime createdAt;

    private boolean deleted;

    private String usageType;
    private Long usageId;
}
