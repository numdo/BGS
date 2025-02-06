package com.ssafy.bgs.mygym.controller;

import com.ssafy.bgs.mygym.dto.request.GuestbookRequestDto;
import com.ssafy.bgs.mygym.dto.request.MygymRequestDto;
import com.ssafy.bgs.mygym.dto.response.GuestbookResponseDto;
import com.ssafy.bgs.mygym.entity.Item;
import com.ssafy.bgs.mygym.service.MygymService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/mygyms")
public class MygymController {

    private final MygymService mygymService;

    public MygymController(MygymService mygymService) {
        this.mygymService = mygymService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getMygym(@PathVariable Integer userId) {
        return new ResponseEntity<>(mygymService.getMygym(userId), HttpStatus.OK);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateMygym(@AuthenticationPrincipal Integer userId, @RequestBody MygymRequestDto mygymRequestDto) {
        mygymService.updateMygym(userId, mygymRequestDto);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/{userId}/guestbooks")
    public ResponseEntity<?> getGuestbookList(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Page<GuestbookResponseDto> guestbookList = mygymService.getGuestbookList(userId, page, pageSize);
        return new ResponseEntity<>(guestbookList, HttpStatus.OK);
    }

    @PostMapping("/{userId}/guestbooks")
    public ResponseEntity<?> addGuestbook(
            @AuthenticationPrincipal Integer guestId,
            @PathVariable Integer userId,
            @RequestBody GuestbookRequestDto guestbookRequestDto
    ) {
        guestbookRequestDto.setGuestId(guestId);
        guestbookRequestDto.setOwnerId(userId);
        mygymService.addGuestbook(guestbookRequestDto);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("{userId}/guestbooks/{guestbookId}")
    public ResponseEntity<?> updateGuestbook(
            @AuthenticationPrincipal Integer guestId,
            @PathVariable Integer userId,
            @PathVariable Integer guestbookId,
            @RequestBody GuestbookRequestDto guestbookRequestDto
    ) {
        guestbookRequestDto.setGuestbookId(guestbookId);
        guestbookRequestDto.setGuestId(guestId);
        guestbookRequestDto.setOwnerId(userId);
        mygymService.updateGuestbook(guestbookRequestDto);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("{userId}/guestbooks/{guestbookId}")
    public ResponseEntity<?> deleteGuestbook(
            @AuthenticationPrincipal Integer guestId,
            @PathVariable Integer userId,
            @PathVariable Integer guestbookId
    ) {
        mygymService.deleteGuestbook(guestbookId, guestId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(
            @RequestPart(name = "item") Item item,
            @RequestPart(name = "file") MultipartFile file
    ) {
        mygymService.addItem(item, file);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/items")
    public ResponseEntity<?> updateItem(
            @RequestPart(name = "item") Item item,
            @RequestPart(required = false, name = "file") MultipartFile file
    ) {
        mygymService.updateItem(item, file);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
