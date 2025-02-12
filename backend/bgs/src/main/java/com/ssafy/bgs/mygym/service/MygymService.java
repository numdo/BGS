package com.ssafy.bgs.mygym.service;

import com.ssafy.bgs.image.dto.response.ImageResponseDto;
import com.ssafy.bgs.image.service.ImageService;
import com.ssafy.bgs.mygym.dto.request.GuestbookRequestDto;
import com.ssafy.bgs.mygym.dto.request.MygymRequestDto;
import com.ssafy.bgs.mygym.dto.request.PlaceRequestDto;
import com.ssafy.bgs.mygym.dto.response.*;
import com.ssafy.bgs.mygym.entity.*;
import com.ssafy.bgs.mygym.exception.GuestbookNotFoundException;
import com.ssafy.bgs.mygym.exception.ItemNotFoundException;
import com.ssafy.bgs.mygym.exception.PlaceNotFoundException;
import com.ssafy.bgs.mygym.repository.*;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.exception.UserNotFoundException;
import com.ssafy.bgs.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MygymService {
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final MygymColorRepository mygymColorRepository;
    private final PlaceRepository placeRepository;
    private final UserItemRepository userItemRepository;
    private final GuestbookRepository guestbookRepository;
    private final CoinHistoryRepository coinHistoryRepository;
    private final ImageService imageService;

    public MygymService(UserRepository userRepository, ItemRepository itemRepository, MygymColorRepository mygymColorRepository, PlaceRepository placeRepository, UserItemRepository userItemRepository, GuestbookRepository guestbookRepository, CoinHistoryRepository coinHistoryRepository, ImageService imageService) {
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.mygymColorRepository = mygymColorRepository;
        this.placeRepository = placeRepository;
        this.userItemRepository = userItemRepository;
        this.guestbookRepository = guestbookRepository;
        this.coinHistoryRepository = coinHistoryRepository;
        this.imageService = imageService;
    }

    /** Mygym 조회 **/
    public MygymResponseDto getMygym(Integer userId) {
        MygymResponseDto mygymResponseDto = new MygymResponseDto();

        // 마이짐 주인 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        mygymResponseDto.setUserId(userId);
        mygymResponseDto.setNickname(user.getNickname());

        // 마이짐 컬러 조회
        MygymColor mygymColor = mygymColorRepository.findById(userId).orElse(new MygymColor());
        mygymResponseDto.setBackgroundColor(mygymColor.getBackgroundColor());
        mygymResponseDto.setWallColor(mygymColor.getWallColor());

        // 마이짐 배치 조회
        List<Place> places = placeRepository.findByUserIdAndDeletedFalse(userId);
        for (Place place : places) {
            PlaceResponseDto placeResponseDto = new PlaceResponseDto();
            placeResponseDto.setPlaceId(place.getPlaceId());
            placeResponseDto.setItemId(place.getItemId());
            placeResponseDto.setX(place.getX());
            placeResponseDto.setY(place.getY());
            placeResponseDto.setRotated(place.getRotated());
            placeResponseDto.setDeleted(place.getDeleted());

            ImageResponseDto image = imageService.getImage("item", place.getItemId());
            if (image != null) {
                image.setUrl(imageService.getS3Url(image.getUrl()));
            }
            placeResponseDto.setImage(image);


            mygymResponseDto.getPlaces().add(placeResponseDto);
        }

        return mygymResponseDto;
    }

    /** Mygym 수정 **/
    public void updateMygym(Integer userId, MygymRequestDto mygymRequestDto) {
        // 마이짐 색상 update
        MygymColor mygymColor = new MygymColor();
        mygymColor.setUserId(userId);
        mygymColor.setBackgroundColor(mygymRequestDto.getBackgroundColor());
        mygymColor.setWallColor(mygymRequestDto.getWallColor());
        mygymColorRepository.save(mygymColor);

        // 마이짐 배치 update
        for (PlaceRequestDto placeRequestDto : mygymRequestDto.getPlaces()) {
            Place place;
            // 새로운 배치 추가
            if (placeRequestDto.getPlaceId() == null) {
                place = new Place();
                place.setUserId(userId);
            }
            // 기존 배치 수정
            else {
                place = placeRepository.findById(placeRequestDto.getPlaceId())
                        .orElseThrow(() -> new PlaceNotFoundException(placeRequestDto.getPlaceId()));
            }

            // Place column update
            place.setItemId(placeRequestDto.getItemId());
            place.setX(placeRequestDto.getX());
            place.setY(placeRequestDto.getY());
            place.setRotated(placeRequestDto.getRotated());
            place.setDeleted(placeRequestDto.getDeleted());
            placeRepository.save(place);
        }

    }

    /** Guestbook select **/
    public Page<GuestbookResponseDto> getGuestbookList(Integer userId, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return guestbookRepository.findByOwnerId(userId, pageable);
    }

    /** Guestbook insert **/
    public void addGuestbook(GuestbookRequestDto guestbookRequestDto) {
        Guestbook guestbook = new Guestbook();
        guestbook.setOwnerId(guestbookRequestDto.getOwnerId());
        guestbook.setGuestId(guestbookRequestDto.getGuestId());
        guestbook.setContent(guestbookRequestDto.getContent());
        guestbookRepository.save(guestbook);
    }

    public void updateGuestbook(GuestbookRequestDto guestbookRequestDto) {
        Guestbook guestbook;
        // 방명록 미존재
        guestbook = guestbookRepository.findById(guestbookRequestDto.getGuestbookId())
                .orElseThrow(() -> new GuestbookNotFoundException(guestbookRequestDto.getGuestbookId()));

        // 방명록 수정 권한 없음
        if (!guestbook.getGuestId().equals(guestbookRequestDto.getGuestId()))
            throw new AuthenticationException("방명록 수정 권한 없음") {};

        // 방명록 수정
        guestbook.setContent(guestbookRequestDto.getContent());
        guestbookRepository.save(guestbook);
    }

    public void deleteGuestbook(Integer guestbookId, Integer guestId) {
        Guestbook guestbook;
        // 방명록 미존재
        guestbook = guestbookRepository.findById(guestbookId)
                .orElseThrow(() -> new GuestbookNotFoundException(guestbookId));

        // 방명록 삭제 권한 없음
        if (!guestbook.getGuestId().equals(guestId))
            throw new AuthenticationException("방명록 삭제 권한 없음") {};

        // 방명록 soft delete
        guestbook.setDeleted(true);
        guestbookRepository.save(guestbook);
    }

    public List<ItemResponseDto> getItemList() {
        List<ItemResponseDto> itemList = new ArrayList<>();

        itemRepository.findAll().forEach(item -> {
            ItemResponseDto itemResponseDto = new ItemResponseDto();
            itemResponseDto.setItemId(item.getItemId());
            itemResponseDto.setItemName(item.getItemName());
            itemResponseDto.setWidth(item.getWidth());
            itemResponseDto.setHeight(item.getHeight());
            itemResponseDto.setPrice(item.getPrice());
            itemResponseDto.setUsable(item.getUsable());

            ImageResponseDto image = imageService.getImage("item", item.getItemId());
            itemResponseDto.setImageUrl(imageService.getS3Url(image.getUrl()));

            itemList.add(itemResponseDto);
        });

        return itemList;
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

    public List<CoinHistoryResponseDto> getCoinHistory(Integer userId) {
        List<CoinHistory> histories = coinHistoryRepository.findByUserId(userId);
        return histories.stream()
                .map(history -> new CoinHistoryResponseDto(
                        history.getCoinHistoryId(),
                        history.getUserId(),
                        history.getAmount(),
                        history.getUsageType(),
                        history.getCreatedAt()))
                .collect(Collectors.toList());
    }
}
