package com.ssafy.bgs.mygym.service;

import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.mygym.dto.response.ItemResponseDto;
import com.ssafy.bgs.mygym.entity.CoinHistory;
import com.ssafy.bgs.mygym.entity.Item;
import com.ssafy.bgs.mygym.entity.UserItem;
import com.ssafy.bgs.mygym.entity.UserItemId;
import com.ssafy.bgs.mygym.exception.ItemNotFoundException;
import com.ssafy.bgs.mygym.repository.CoinHistoryRepository;
import com.ssafy.bgs.mygym.repository.ItemRepository;
import com.ssafy.bgs.mygym.repository.UserItemRepository;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.exception.UserNotFoundException;
import com.ssafy.bgs.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ItemService {
    private final ItemRepository itemRepository;
    private final ImageService imageService;
    private final UserRepository userRepository;
    private final CoinHistoryRepository coinHistoryRepository;
    private final UserItemRepository userItemRepository;

    public ItemService(ItemRepository itemRepository, ImageService imageService, UserRepository userRepository, CoinHistoryRepository coinHistoryRepository, UserItemRepository userItemRepository) {
        this.itemRepository = itemRepository;
        this.imageService = imageService;
        this.userRepository = userRepository;
        this.coinHistoryRepository = coinHistoryRepository;
        this.userItemRepository = userItemRepository;
    }

    public List<ItemResponseDto> getItemList(Integer userId) {
        List<ItemResponseDto> itemList = new ArrayList<>();

        // 유저 없음
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));

        itemRepository.findByUsableTrue().forEach(item -> {
            // 아이템 정보 조회
            ItemResponseDto itemResponseDto = new ItemResponseDto();
            itemResponseDto.setItemId(item.getItemId());
            itemResponseDto.setItemName(item.getItemName());
            itemResponseDto.setWidth(item.getWidth());
            itemResponseDto.setHeight(item.getHeight());
            itemResponseDto.setPrice(item.getPrice());
            itemResponseDto.setUsable(item.getUsable());

            // 아이템 보유 여부 조회
            itemResponseDto.setOwned(userItemRepository.existsById(new UserItemId(userId, item.getItemId())));

            // 사진 조회
            ImageResponseDto image = imageService.getImage("item", item.getItemId());
            itemResponseDto.setImageUrl(imageService.getS3Url(image.getUrl()));

            itemList.add(itemResponseDto);
        });

        return itemList;
    }

    public void buyItem(Integer userId, Integer itemId) {
        // 유저 또는 아이템 없음
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
        Item item = itemRepository.findById(itemId).orElseThrow(() -> new ItemNotFoundException(itemId));

        // 비활성화 된 아이템
        if (!item.getUsable()) throw new ItemNotFoundException(itemId);

        // 코인 부족
        if (item.getPrice() > user.getCoin()) throw new IllegalArgumentException("코인이 부족합니다.");

        // 코인 사용 내역 저장
        CoinHistory coinHistory = new CoinHistory();
        coinHistory.setUserId(userId);
        coinHistory.setAmount(-item.getPrice());
        coinHistory.setUsageType("item");
        coinHistory.setUsageId(itemId);
        coinHistoryRepository.save(coinHistory);

        // 코인 보유랑 감소
        user.setCoin(user.getCoin() - item.getPrice());
        userRepository.save(user);

        // 아이템 보유 저장
        UserItem userItem = new UserItem();
        userItem.setId(new UserItemId(userId, itemId));
        userItem.setItemName(item.getItemName());
        userItem.setItemPrice(item.getPrice());
        userItemRepository.save(userItem);
    }
}
