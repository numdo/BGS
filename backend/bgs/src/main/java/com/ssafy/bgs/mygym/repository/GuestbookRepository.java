package com.ssafy.bgs.mygym.repository;

import com.ssafy.bgs.mygym.dto.response.GuestbookResponseDto;
import com.ssafy.bgs.mygym.entity.Guestbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GuestbookRepository extends JpaRepository<Guestbook, Integer> {

    @Query("SELECT new com.ssafy.bgs.mygym.dto.response.GuestbookResponseDto(g.guestbookId, g.ownerId, g.guestId, g.content, g.createdAt, g.deleted) " +
            "FROM Guestbook g WHERE g.ownerId = :userId")
    Page<GuestbookResponseDto> findByOwnerId(@Param("userId") Integer userId, Pageable pageable);
}
