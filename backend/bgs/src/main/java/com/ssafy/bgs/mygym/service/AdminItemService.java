package com.ssafy.bgs.mygym.service;

import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.mygym.dto.request.ItemUpdateRequestDto;
import com.ssafy.bgs.mygym.dto.response.ItemResponseDto;
import com.ssafy.bgs.mygym.entity.Item;
import com.ssafy.bgs.mygym.exception.ItemNotFoundException;
import com.ssafy.bgs.mygym.repository.ItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AdminItemService {
    private final ItemRepository itemRepository;
    private final ImageService imageService;

    public Page<ItemResponseDto> getItemList(int page, int pageSize, String keyword) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        Page<Item> items;

        if (keyword != null && !keyword.trim().isEmpty()) {
            // 검색어가 있을 경우, itemName에서 검색
            items = itemRepository.findByItemNameContaining(keyword, pageable);
        } else {
            // 검색어가 없을 경우, 전체 목록 조회
            items = itemRepository.findAll(pageable);
        }

        // Page의 map 메서드를 사용하여 ItemResponseDto로 변환
        Page<ItemResponseDto> dtoPage = items.map(item -> {
            ItemResponseDto dto = new ItemResponseDto();
            dto.setItemId(item.getItemId());
            dto.setItemName(item.getItemName());
            dto.setWidth(item.getWidth());
            dto.setHeight(item.getHeight());
            dto.setPrice(item.getPrice());
            dto.setCopyrighter(item.getCopyrighter());
            dto.setUsable(item.getUsable());

            // 사진 조회 및 URL 변환
            ImageResponseDto image = imageService.getImage("item", item.getItemId());
            dto.setImageUrl(imageService.getS3Url(image.getUrl()));
            return dto;
        });

        return dtoPage;
    }

    public AdminItemService(ItemRepository itemRepository, ImageService imageService) {
        this.itemRepository = itemRepository;
        this.imageService = imageService;
    }

    public void addItem(Item item, MultipartFile file) {
        Item savedItem = itemRepository.save(item);
        imageService.uploadImage(file, "item", Long.valueOf(savedItem.getItemId()));
    }

    public void updateItem(ItemUpdateRequestDto itemDto, MultipartFile file) {
        // 기존 엔티티 조회 (존재하지 않으면 예외 발생)
        Item existingItem = itemRepository.findById(itemDto.getItemId())
                .orElseThrow(() -> new ItemNotFoundException(itemDto.getItemId()));

        // DTO의 값을 기존 엔티티에 반영 (필요한 필드만 업데이트)
        existingItem.setItemName(itemDto.getItemName());
        existingItem.setWidth(itemDto.getWidth());
        existingItem.setHeight(itemDto.getHeight());
        existingItem.setPrice(itemDto.getPrice());
        existingItem.setCopyrighter(itemDto.getCopyrighter());
        existingItem.setUsable(itemDto.getUsable());
        // 만약 imageUrl도 업데이트하려면 추가

        // 업데이트된 엔티티 저장
        Item savedItem = itemRepository.save(existingItem);

        // 파일이 존재하면 이미지 교체 처리
        if (file != null && !file.isEmpty()) {
            ImageResponseDto existingImage = imageService.getImage("item", savedItem.getItemId());
            if (existingImage != null) {
                imageService.deleteImage(existingImage.getImageId());
            }
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
