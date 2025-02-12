package com.ssafy.bgs.mygym.controller;

import com.ssafy.bgs.mygym.dto.response.ItemResponseDto;
import com.ssafy.bgs.mygym.entity.Item;
import com.ssafy.bgs.mygym.service.AdminItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/items")
public class AdminItemController {

    private final AdminItemService adminItemService;

    public AdminItemController(AdminItemService adminItemService) {
        this.adminItemService = adminItemService;
    }


    @GetMapping
    public ResponseEntity<?> getItemList(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int pageSize
    ) {
        List<ItemResponseDto> items = adminItemService.getItemList(page, pageSize);
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> addItem(
            @RequestPart(name = "item") Item item,
            @RequestPart(name = "file") MultipartFile file
    ) {
        adminItemService.addItem(item, file);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/{itemId}")
    public ResponseEntity<?> updateItem(
            @PathVariable Integer itemId,
            @RequestPart(name = "item") Item item,
            @RequestPart(required = false, name = "file") MultipartFile file
    ) {
        item.setItemId(itemId);
        adminItemService.updateItem(item, file);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PatchMapping("/{itemId}/enable")
    public ResponseEntity<?> enableItem(@PathVariable Integer itemId) {
        adminItemService.enableItem(itemId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PatchMapping("/{itemId}/disable")
    public ResponseEntity<?> disableItem(@PathVariable Integer itemId) {
        adminItemService.disableItem(itemId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
