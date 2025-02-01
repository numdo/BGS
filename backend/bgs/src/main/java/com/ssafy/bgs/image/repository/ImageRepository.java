package com.ssafy.bgs.image.repository;

import com.ssafy.bgs.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, Long> {
    @Modifying
    @Query("UPDATE Image i SET i.deleted = true WHERE i.usageType = 'PROFILE' AND i.usageId = :userId AND i.deleted = false")
    void markAllProfileImagesAsDeleted(@Param("userId") long userId);

    @Query("SELECT i FROM Image i " +
            "WHERE i.usageType = 'PROFILE' " +
            "  AND i.usageId = :userId " +
            "  AND i.deleted = false " +
            "ORDER BY i.createdAt DESC")
    List<Image> findProfileImages(@Param("userId") long userId);

    List<Image> findByUsageTypeAndUsageId(String usageType, Long usageId);
}
