package com.ssafy.bgs.mygym.controller;

import com.ssafy.bgs.mygym.dto.response.ItemResponseDto;
import com.ssafy.bgs.mygym.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ResponseEntity<?> getItemList(
            @AuthenticationPrincipal Integer userId
    ) {
        List<ItemResponseDto> items = itemService.getItemList(userId);
        return new ResponseEntity<>(items, HttpStatus.OK);
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
