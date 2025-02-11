package com.ssafy.bgs.mygym.controller;

import com.ssafy.bgs.mygym.dto.response.ItemResponseDto;
import com.ssafy.bgs.mygym.entity.Item;
import com.ssafy.bgs.mygym.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ResponseEntity<?> getItemList() {
        List<ItemResponseDto> items = itemService.getItemList();

        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> addItem(
            @RequestPart(name = "item") Item item,
            @RequestPart(name = "file") MultipartFile file
    ) {
        itemService.addItem(item, file);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/{itemId}")
    public ResponseEntity<?> updateItem(
            @PathVariable Integer itemId,
            @RequestPart(name = "item") Item item,
            @RequestPart(required = false, name = "file") MultipartFile file
    ) {
        item.setItemId(itemId);
        itemService.updateItem(item, file);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PatchMapping("/{itemId}/enable")
    public ResponseEntity<?> enableItem(@PathVariable Integer itemId) {
        itemService.enableItem(itemId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PatchMapping("/{itemId}/disable")
    public ResponseEntity<?> disableItem(@PathVariable Integer itemId) {
        itemService.disableItem(itemId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/{itemId}/buy")
    public ResponseEntity<?> buyItem(
            @AuthenticationPrincipal Integer userId,
            @PathVariable Integer itemId
    ) {
        itemService.buyItem(userId, itemId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
