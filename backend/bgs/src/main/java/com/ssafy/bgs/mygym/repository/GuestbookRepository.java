package com.ssafy.bgs.mygym.repository;

import com.ssafy.bgs.mygym.dto.response.GuestbookResponseDto;
import com.ssafy.bgs.mygym.entity.Guestbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestbookRepository extends JpaRepository<Guestbook, Integer> {

    Page<GuestbookResponseDto> findByOwnerId(Integer userId, Pageable pageable);
}
