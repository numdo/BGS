package com.ssafy.bgs.mygym.service;

import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.mygym.dto.response.ItemResponseDto;
import com.ssafy.bgs.mygym.entity.Item;
import com.ssafy.bgs.mygym.exception.ItemNotFoundException;
import com.ssafy.bgs.mygym.repository.ItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminItemService {
    private final ItemRepository itemRepository;
    private final ImageService imageService;

    public List<ItemResponseDto> getItemList(int page, int pageSize,String keyword) {
        List<ItemResponseDto> itemList = new ArrayList<>();
        Pageable pageable = PageRequest.of(page, pageSize);

        Page<Item> items;
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 🔹 검색어가 있을 경우, itemName에서 검색
            items = itemRepository.findByItemNameContaining(keyword, pageable);
        } else {
            // 🔹 검색어가 없을 경우, 전체 목록 조회
            items = itemRepository.findAll(pageable);
        }
        itemRepository.findAll(pageable).forEach(item -> {
            // 아이템 정보 조회
            ItemResponseDto itemResponseDto = new ItemResponseDto();
            itemResponseDto.setItemId(item.getItemId());
            itemResponseDto.setItemName(item.getItemName());
            itemResponseDto.setWidth(item.getWidth());
            itemResponseDto.setHeight(item.getHeight());
            itemResponseDto.setPrice(item.getPrice());
            itemResponseDto.setUsable(item.getUsable());

            // 사진 조회
            ImageResponseDto image = imageService.getImage("item", item.getItemId());
            itemResponseDto.setImageUrl(imageService.getS3Url(image.getUrl()));

            itemList.add(itemResponseDto);
        });

        return itemList;
    }

    public AdminItemService(ItemRepository itemRepository, ImageService imageService) {
        this.itemRepository = itemRepository;
        this.imageService = imageService;
    }

    public void addItem(Item item, MultipartFile file) {
        Item savedItem = itemRepository.save(item);
        imageService.uploadImage(file, "item", Long.valueOf(savedItem.getItemId()));
    }

    public void updateItem(Item item, MultipartFile file) {
        Item savedItem = itemRepository.save(item);
        if (file != null) {
            imageService.deleteImage(imageService.getImage("item", savedItem.getItemId()).getImageId());
            imageService.uploadImage(file, "item", Long.valueOf(savedItem.getItemId()));
        }
    }

    public void enableItem(Integer itemId) {
        Item savedItem = itemRepository.findById(itemId).orElseThrow(() -> new ItemNotFoundException(itemId));
        savedItem.setUsable(true);
        itemRepository.save(savedItem);
    }

    public void disableItem(Integer itemId) {
        Item savedItem = itemRepository.findById(itemId).orElseThrow(() -> new ItemNotFoundException(itemId));
        savedItem.setUsable(false);
        itemRepository.save(savedItem);
    }
}
