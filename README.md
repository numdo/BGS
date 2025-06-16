# BGS (불타는 근육 성장)

## ✅ 프로젝트 진행 기간
2025.01.06 ~ 2024.02.21(7주)

## ✅ 프로젝트 소개

**🚩 서비스 한줄 소개**
```bash
쉽고 즐겁게 운동을 기록하며, 함께 성장하는 운동 커뮤니티
```

**🚩 기획 배경**

저희는 헬스인들을 위한 운동 기록, 커뮤니티 서비스를 만들기로 했습니다. 

그 이유는 먼저 다음과 같은 이유로 본인이 한 운동 내용을 기록해 둘 필요가 있습니다.

*  점진적 운동 부하 증가 시 효율적인 근성장이 가능힙니다.

*  기록 없이 체계적인 점진적 운동 수행 어렵습니다.

또한 운동할 때 다음과 같은 어려운 점들이 있습니다.

* 나 홀로 운동하는 기분입니다

* 동기가 부족합니다.

* 성장이 티 나지 않습니다.

**🚩 프로젝트 설명 및 목표**

이러한 배경을 바탕으로 저희는 

* 어떻게 사용자에게 운동 동기를 부여할 수 있을까? 

* 어떻게 사용자가 더 편리하게 운동 내용을 기록할 수 있을까?

* 어떻게 사용자의 운동 수행 능력을 인증할 수 있을까? 

를 고민하면서 

불끈성 서비스를 만들었습니다. 


## ✅ 기능 소개

불끈성의 기능들을 다음과 같이 소개합니다.

* 본인의 위치를 기반으로 헬스장에서 출석체크가 가능합니다.

* 운동 종류, 세트, 횟수, 시간 등을 편리하게 기록할 수 있습니다.

* STT 기능을 활용하여 운동 내용을 더 편리하게 기록할 수 있습니다.

* 피드에 사진과 영상을 포함한 본인의 운동 일지를 올릴 수 있고, 댓글과 좋아요를 달 수 있습니다.

* 작성한 운동 내용들을 요약해 운동 통계를 제공합니다.

* 본인만의 헬스장 '마이짐'을 꾸미고 다른 사용자와 공유할 수 있습니다.
  
* 평가 게시물을 작성해 다른 사용자들로부터 본인의 운동 중량을 인증 받을 수 있습니다.

## ✅ 산출물

### ERD

![image](https://github.com/user-attachments/assets/5fca9b3d-f18f-4e00-98af-b43a243de893)

### 시스템 아키텍처

![bgs-architectare-ver2 0 (1)](https://github.com/user-attachments/assets/d1206d5a-a1ab-452f-82b5-e5b99f6376f7)

## ✅ 기술 스택 세부 명세

## ✅ 프로젝트 후기

### 김도현
생각보다 빠른 개발 속도에 놀랐지만 아무래도 설계나 기획단계에서 놓고가는 부분이 너무 많아서 개발을 하면서 설계와 기획을 같이 하는 느낌이 들었다.
또한 다들 피드백을 많이 해주고 긍정적인 피드백을 해줘서 발전이 많은 프로젝트였습니다. 또한 인프라에서 많은 부분을 배우면서 진행한거 같아서 좋았습니다.

### 손재민

### 이국건

우리 팀은 누구 한명도 빠지지 않고 각자 1인분 이상을 거뜬히 해내는 팀이었고, 빠꾸없는 드립에 많이 웃었습니다.

### 이두호

### 이명성

### 허상운

## ✅ 프로젝트 구조
### back-end
```
├─main
│  ├─java
│  │  └─com
│  │      └─ssafy
│  │          └─bgs
│  │              │  BgsApplication.java
│  │              │
│  │              ├─ai
│  │              │  ├─config
│  │              │  │      GPTConfig.java
│  │              │  │      STTConfig.java
│  │              │  │
│  │              │  ├─controller
│  │              │  │      AiDiaryController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      AudioDiaryRequestDto.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          AiDiaryResponseDto.java
│  │              │  │
│  │              │  ├─service
│  │              │  │      AiDiaryService.java
│  │              │  │      GPTService.java
│  │              │  │      SpeechToTextService.java
│  │              │  │      WorkoutMatchingService.java
│  │              │  │
│  │              │  └─util
│  │              │          GPTUtil.java
│  │              │          SpeechToTextUtil.java
│  │              │
│  │              ├─attendance
│  │              │  ├─controller
│  │              │  │      AttendanceController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      AttendanceCheckRequestDto.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          AttendanceCheckResponseDto.java
│  │              │  │
│  │              │  ├─entity
│  │              │  │      Attendance.java
│  │              │  │
│  │              │  ├─exception
│  │              │  │      AttendanceAlreadyCheckedException.java
│  │              │  │      GymNotFoundException.java
│  │              │  │      OutOfRangeException.java
│  │              │  │
│  │              │  ├─repository
│  │              │  │      AttendanceRepository.java
│  │              │  │
│  │              │  └─service
│  │              │          AttendanceService.java
│  │              │
│  │              ├─auth
│  │              │  ├─config
│  │              │  │      KakaoProperties.java
│  │              │  │      SecurityConfig.java
│  │              │  │
│  │              │  ├─controller
│  │              │  │      AuthController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      LoginRequestDto.java
│  │              │  │  │      SignupRequestDto.java
│  │              │  │  │      SocialSignupRequestDto.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          LoginResponseDto.java
│  │              │  │          SocialLoginResponseDto.java
│  │              │  │
│  │              │  ├─jwt
│  │              │  │      JwtAuthenticationFilter.java
│  │              │  │      JwtTokenProvider.java
│  │              │  │
│  │              │  └─service
│  │              │          AuthService.java
│  │              │          SocialUserResponseDto.java
│  │              │          VerificationService.java
│  │              │
│  │              ├─common
│  │              │      DuplicatedException.java
│  │              │      GlobalExceptionHandler.java
│  │              │      NotFoundException.java
│  │              │      UnauthorizedAccessException.java
│  │              │
│  │              ├─diary
│  │              │  ├─controller
│  │              │  │      DiaryController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      CommentRequestDto.java
│  │              │  │  │      DiaryRequestDto.java
│  │              │  │  │      DiaryWorkoutRequestDto.java
│  │              │  │  │      WorkoutSetRequestDto.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          CommentResponseDto.java
│  │              │  │          DiaryFeedResponseDto.java
│  │              │  │          DiaryResponseDto.java
│  │              │  │          DiaryWorkoutResponseDto.java
│  │              │  │          PreviousWorkoutResponseDto.java
│  │              │  │          RecentWorkoutResponseDto.java
│  │              │  │          WorkoutSetResponseDto.java
│  │              │  │
│  │              │  ├─entity
│  │              │  │      Comment.java
│  │              │  │      Diary.java
│  │              │  │      DiaryLiked.java
│  │              │  │      DiaryLikedId.java
│  │              │  │      DiaryWorkout.java
│  │              │  │      Hashtag.java
│  │              │  │      HashtagId.java
│  │              │  │      Workout.java
│  │              │  │      WorkoutSet.java
│  │              │  │
│  │              │  ├─exception
│  │              │  │      CommentNotFoundException.java
│  │              │  │      DiaryNotFoundException.java
│  │              │  │      DiaryWorkoutNotFoundException.java
│  │              │  │      WorkoutSetNotFoundException.java
│  │              │  │
│  │              │  ├─repository
│  │              │  │      CommentRepository.java
│  │              │  │      DiaryLikedRepository.java
│  │              │  │      DiaryRepository.java
│  │              │  │      DiaryWorkoutRepository.java
│  │              │  │      HashtagRepository.java
│  │              │  │      WorkoutRepository.java
│  │              │  │      WorkoutSetRepository.java
│  │              │  │
│  │              │  └─service
│  │              │          DiaryService.java
│  │              │
│  │              ├─evaluation
│  │              │  ├─controller
│  │              │  │      EvaluationController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      EvaluationRequestDto.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          EvaluationFeedResponseDto.java
│  │              │  │          EvaluationResponseDto.java
│  │              │  │
│  │              │  ├─entity
│  │              │  │      Evaluation.java
│  │              │  │      EvaluationComment.java
│  │              │  │      Vote.java
│  │              │  │      VoteId.java
│  │              │  │      WorkoutRecord.java
│  │              │  │
│  │              │  ├─exception
│  │              │  │      EvaluationNotFoundException.java
│  │              │  │      VoteNotFoundException.java
│  │              │  │
│  │              │  ├─repository
│  │              │  │      EvaluationCommentRepository.java
│  │              │  │      EvaluationRepository.java
│  │              │  │      VoteRepository.java
│  │              │  │      WorkoutRecordRepository.java
│  │              │  │
│  │              │  └─service
│  │              │          EvaluationService.java
│  │              │
│  │              ├─gym
│  │              │  ├─controller
│  │              │  │      GymController.java
│  │              │  │      MachineController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      GymRequestDto.java
│  │              │  │  │      MachineRequestDto.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          GymLocationResponseDto.java
│  │              │  │          GymResponseDto.java
│  │              │  │          MachineResponseDto.java
│  │              │  │
│  │              │  ├─entity
│  │              │  │      Gym.java
│  │              │  │      GymMachine.java
│  │              │  │      GymMachineKey.java
│  │              │  │      Machine.java
│  │              │  │
│  │              │  ├─exception
│  │              │  │      GymNotFoundException.java
│  │              │  │      MachineNotFound.java
│  │              │  │
│  │              │  ├─repository
│  │              │  │      GymMachineRepository.java
│  │              │  │      GymRepository.java
│  │              │  │      MachineRepository.java
│  │              │  │
│  │              │  └─service
│  │              │          GymService.java
│  │              │
│  │              ├─image
│  │              │  ├─config
│  │              │  │      AwsS3Config.java
│  │              │  │
│  │              │  ├─controller
│  │              │  │      ImageController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      ImageRequest.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          ImageResponseDto.java
│  │              │  │
│  │              │  ├─entity
│  │              │  │      Image.java
│  │              │  │
│  │              │  ├─exception
│  │              │  │      ImageNotFoundException.java
│  │              │  │      ImageUploadException.java
│  │              │  │
│  │              │  ├─repository
│  │              │  │      ImageRepository.java
│  │              │  │
│  │              │  └─service
│  │              │          ImageService.java
│  │              │          S3Uploader.java
│  │              │
│  │              ├─mygym
│  │              │  ├─controller
│  │              │  │      AdminItemController.java
│  │              │  │      ItemController.java
│  │              │  │      MygymController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      GuestbookRequestDto.java
│  │              │  │  │      ItemUpdateRequestDto.java
│  │              │  │  │      MygymRequestDto.java
│  │              │  │  │      PlaceRequestDto.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          CoinHistoryResponseDto.java
│  │              │  │          GuestbookResponseDto.java
│  │              │  │          ItemResponseDto.java
│  │              │  │          MygymResponseDto.java
│  │              │  │          PlaceResponseDto.java
│  │              │  │
│  │              │  ├─entity
│  │              │  │      CoinHistory.java
│  │              │  │      Guestbook.java
│  │              │  │      Item.java
│  │              │  │      MygymColor.java
│  │              │  │      Place.java
│  │              │  │      UserItem.java
│  │              │  │      UserItemId.java
│  │              │  │
│  │              │  ├─exception
│  │              │  │      GuestbookNotFoundException.java
│  │              │  │      ItemNotFoundException.java
│  │              │  │      PlaceNotFoundException.java
│  │              │  │
│  │              │  ├─repository
│  │              │  │      CoinHistoryRepository.java
│  │              │  │      GuestbookRepository.java
│  │              │  │      ItemRepository.java
│  │              │  │      MygymColorRepository.java
│  │              │  │      PlaceRepository.java
│  │              │  │      UserItemRepository.java
│  │              │  │
│  │              │  └─service
│  │              │          AdminItemService.java
│  │              │          ItemService.java
│  │              │          MygymService.java
│  │              │
│  │              ├─redis
│  │              │  ├─config
│  │              │  │      JacksonConfig.java
│  │              │  │      RedisConfig.java
│  │              │  │
│  │              │  └─service
│  │              │          RedisService.java
│  │              │
│  │              ├─stat
│  │              │  ├─controller
│  │              │  │      StatController.java
│  │              │  │
│  │              │  ├─dto
│  │              │  │  ├─request
│  │              │  │  │      WeightRequestDto.java
│  │              │  │  │
│  │              │  │  └─response
│  │              │  │          PartVolumeResponseDto.java
│  │              │  │          WorkoutBalanceResponseDto.java
│  │              │  │          WorkoutRecordResponseDto.java
│  │              │  │
│  │              │  ├─entity
│  │              │  │      WeightHistory.java
│  │              │  │      WorkoutPart.java
│  │              │  │
│  │              │  ├─repository
│  │              │  │      WeightHistoryRepository.java
│  │              │  │
│  │              │  └─service
│  │              │          StatService.java
│  │              │
│  │              └─user
│  │                  ├─config
│  │                  │      MailConfig.java
│  │                  │
│  │                  ├─controller
│  │                  │      AdminUserController.java
│  │                  │      UserController.java
│  │                  │
│  │                  ├─dto
│  │                  │  ├─request
│  │                  │  │      AdminResetPasswordRequestDto.java
│  │                  │  │      AdminUpdateUserRequestDto.java
│  │                  │  │      PasswordChangeRequestDto.java
│  │                  │  │      PasswordResetRequestDto.java
│  │                  │  │      UserUpdateRequestDto.java
│  │                  │  │
│  │                  │  └─response
│  │                  │          AdminUserResponseDto.java
│  │                  │          InfoResponseDto.java
│  │                  │          PasswordResetResponseDto.java
│  │                  │          UserResponseDto.java
│  │                  │
│  │                  ├─entity
│  │                  │      AccountType.java
│  │                  │      Following.java
│  │                  │      FollowingId.java
│  │                  │      User.java
│  │                  │
│  │                  ├─exception
│  │                  │      EmailNotFoundException.java
│  │                  │      FollowingNotFoundException.java
│  │                  │      UserNotFoundException.java
│  │                  │
│  │                  ├─repository
│  │                  │      FollowingRepository.java
│  │                  │      UserRepository.java
│  │                  │
│  │                  └─service
│  │                          AdminUserService.java
│  │                          EmailService.java
│  │                          UserService.java
│  │
│  └─resources
│      └─static
│          └─db
│                  BGS.sql
│
└─test
    └─java
        └─com
            └─ssafy
                └─bgs
                        BgsApplicationTests.java
```
### front-end
```
│  App.jsx
│  index.css
│  main.jsx
│  style.css
│
├─api
│      Admin.jsx
│      Attendance.jsx
│      Auth.jsx
│      Diary.jsx
│      Evaluation.jsx
│      Feed.jsx
│      Follow.jsx
│      Gym.jsx
│      Image.jsx
│      Item.jsx
│      Mygym.jsx
│      Stat.jsx
│      User.jsx
│
├─assets
│  ├─icons
│  │      add.svg
│  │      apps.svg
│  │      apps_colored.svg
│  │      ...
│  │
│  ├─images
│  │      backimg.png
│  │      backimg1.jpg
│  │      backimg2.jpg
│  │      ...
│  │
│  └─items
│          benchpress.png
│          cycle.png
│          deadlift.png
│          dumbbell.png
│          Latpulldown.png
│          men.png
│          pullup.png
│          runningmachine.png
│          women.png
│
├─components
│  ├─admin
│  │      AdminItemCreateModal.jsx
│  │      AdminItemManagement.jsx
│  │      AdminSidebar.jsx
│  │      AdminTopBar.jsx
│  │      AdminUserList.jsx
│  │      AdminUserManagement.jsx
│  │
│  ├─attendance
│  │      AttendanceGrid.jsx
│  │
│  ├─auth
│  │      EmailVerification.jsx
│  │      ProtectedLayout.jsx
│  │      ProtectedRoute.jsx
│  │      SignupForm.jsx
│  │      SocialSignupForm.jsx
│  │
│  ├─bar
│  │      BottomBar.jsx
│  │      TopBar.jsx
│  │
│  ├─common
│  │      AlertModal.jsx
│  │      ConfirmModal.jsx
│  │      DeleteConfirmAlert.jsx
│  │      LayoutWrapper.jsx
│  │      LoadingSpinner.jsx
│  │      LogoSection.jsx
│  │      SaveConfirmAlert.jsx
│  │      SuccessConfirmAlert.jsx
│  │
│  ├─evaluation
│  │      EvaluationGuide.jsx
│  │
│  ├─feed
│  │      CommentInput.jsx
│  │      CommentList.jsx
│  │      DiaryFeedContainer.jsx
│  │      DiaryFeedList.jsx
│  │      EvaluationFeedContainer.jsx
│  │      EvaluationFeedList.jsx
│  │      FeedItem.jsx
│  │      ImageCarousel.jsx
│  │      ReviewItem.jsx
│  │
│  ├─follow
│  │      UserItem.jsx
│  │      UserList.jsx
│  │
│  ├─home
│  │      Shortcut.jsx
│  │
│  ├─mygym
│  │      CommentInput.jsx
│  │      CommentList.jsx
│  │      MyGymItem.jsx
│  │      MyGymRoomBgColor.jsx
│  │      MyGymRoomEdit.jsx
│  │      MyGymRoomView.jsx
│  │      MyGymViewVisitorMemo.jsx
│  │      SelectBackImg.jsx
│  │      SelectColor.jsx
│  │      VisitorComment.jsx
│  │      VisitorMemo.jsx
│  │      VisitorMemoModal.jsx
│  │
│  ├─myinfo
│  │      MyGymTab.jsx
│  │      PostsTab.jsx
│  │      StatsTab.jsx
│  │
│  ├─stat
│  │      PartVolumeBarChart.jsx
│  │      PredictedOneRMCard.jsx
│  │      WeightHistoryChart.jsx
│  │      WeightRecordCard.jsx
│  │      WorkoutBalanceRadarChart.jsx
│  │      WorkoutRecordChart.jsx
│  │
│  └─workout
│          SttWorkoutGuide.jsx
│          WorkoutCalendar.jsx
│
├─hooks
│      useInfiniteScroll.jsx
│      useProfileGuard.jsx
│
├─pages
│  ├─admin
│  │      AdminItemPage.jsx
│  │      AdminMainPage.jsx
│  │      AtomicPage.jsx
│  │
│  ├─auth
│  │      BgsLoginPage.jsx
│  │      ChangePasswordPage.jsx
│  │      ForgotPasswordPage.jsx
│  │      KakaoRedirectPage.jsx
│  │      LoginPage.jsx
│  │      SignupPage.jsx
│  │      SocialSignupPage.jsx
│  │      UserDetailsPage.jsx
│  │
│  ├─error
│  │      ForbiddenPage.jsx
│  │      NotFoundPage.jsx
│  │
│  ├─evaluation
│  │      EvaluationCreatePage.jsx
│  │      EvaluationUpdatePage.jsx
│  │
│  ├─feed
│  │      DiaryDetailPage.jsx
│  │      EvaluationDetailPage.jsx
│  │      FeedPage.jsx
│  │
│  ├─home
│  │      MainPage.jsx
│  │
│  ├─info
│  │      FollowerFollowingListPage.jsx
│  │      MyInfoEditPage.jsx
│  │      MyInfoPage.jsx
│  │      MyInfoViewPage.jsx
│  │      UserInfoPage.jsx
│  │
│  ├─mygym
│  │      ItemShopPage.jsx
│  │      MyGymPage.jsx
│  │
│  └─workout
│          WorkoutCreatePage.jsx
│          WorkoutDiaryPage.jsx
│          WorkoutPage.jsx
│          WorkoutRealtimePage.jsx
│          WorkoutUpdatePage.jsx
│
├─recoil
│      profileState.js
│
├─stores
│      useDiaryStore.jsx
│      useFeedTypeStore.jsx
│      useMyGymStore.jsx
│      useStatsStore.jsx
│      useUserStore.jsx
│      useWeightHistoryStore.jsx
│      useWorkoutRecordStore.jsx
│      useWorkoutStore.jsx
│
└─utils
        axiosInstance.jsx
        emitter.js
        streakUtil.jsx
        timeSince.js
        toastrAlert.jsx
```

