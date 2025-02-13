package com.ssafy.bgs.stat.service;

import com.ssafy.bgs.stat.dto.request.WeightRequestDto;
import com.ssafy.bgs.stat.entity.WeightHistory;
import com.ssafy.bgs.stat.repository.WeightHistoryRepository;
import com.ssafy.bgs.user.entity.User;
import com.ssafy.bgs.user.exception.UserNotFoundException;
import com.ssafy.bgs.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatService {


    private final WeightHistoryRepository weightHistoryRepository;
    private final UserRepository userRepository;

    public StatService(WeightHistoryRepository weightHistoryRepository, UserRepository userRepository) {
        this.weightHistoryRepository = weightHistoryRepository;
        this.userRepository = userRepository;
    }

    public List<WeightHistory> getWeightHistories(Integer userId) {
        return weightHistoryRepository.findByUserId(userId);
    }

    public void addWeightHistory(WeightRequestDto weightRequestDto) {
        WeightHistory weightHistory = new WeightHistory();
        weightHistory.setUserId(weightRequestDto.getUserId());
        weightHistory.setWeight(weightHistory.getWeight());
        weightHistoryRepository.save(weightHistory);

        User user = userRepository.findById(weightRequestDto.getUserId()).orElseThrow(() -> new UserNotFoundException(weightHistory.getUserId()));
        user.setWeight(weightRequestDto.getWeight());
        userRepository.save(user);
    }
}
