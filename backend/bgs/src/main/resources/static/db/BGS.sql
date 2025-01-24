DROP TABLE IF EXISTS `comments`;

CREATE TABLE `comments` (
	`comment_id`	INT	NOT NULL	COMMENT '댓글 ID',
	`user_id`	INT	NOT NULL	COMMENT '회원 ID',
	`diary_id`	INT	NOT NULL	COMMENT '일지ID',
	`content`	VARCHAR(255)	NULL	COMMENT '댓글 내용',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '댓글 작성일시',
	`modified_at`	TIMESTAMP	NULL	DEFAULT NULL	COMMENT '댓글 최근 수정일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '삭제여부'
);

DROP TABLE IF EXISTS `diary_liked`;

CREATE TABLE `diary_liked` (
	`diary_id`	INT	NOT NULL	COMMENT '일지ID',
	`user_id`	INT	NOT NULL	COMMENT '회원ID'	
);

DROP TABLE IF EXISTS `following`;

CREATE TABLE `following` (
	`follower_id`	INT	NOT NULL	COMMENT '팔로우 받은 사람 ID',
	`followee_id`	INT	NOT NULL	COMMENT '팔로우 하는 사람 ID'
);

DROP TABLE IF EXISTS `places`;

CREATE TABLE `places` (
	`place_id`	INT	NOT NULL	COMMENT '배치 ID',
	`item_id`	INT	NOT NULL	COMMENT '아이템ID',
	`user_id`	INT	NOT NULL	COMMENT '회원 ID',
	`x`	SMALLINT	NULL	COMMENT '아이템이 놓여진 x 위치',
	`y`	SMALLINT	NULL	COMMENT '아이템이 놓여진 y 위치',
	`rotated`	BOOLEAN	NULL	COMMENT '회전 여부',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '배치 생성일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '삭제여부'
);

DROP TABLE IF EXISTS `hashtags`;

CREATE TABLE `hashtags` (
	`diary_id`	INT	NOT NULL	COMMENT '일지ID',
	`tag`	VARCHAR(255)	NOT NULL	COMMENT '태그ID'
);

DROP TABLE IF EXISTS `images`;

CREATE TABLE `images` (
	`image_id`	INT	NOT NULL	COMMENT '미디어 아이디',
	`url`	VARCHAR(255)	NULL	COMMENT 'S3 주소',
	`extension`	CHAR(4)	NULL	COMMENT '이미지 확장자 jpg, png, ...',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '이미지 생성일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '삭제여부',
	`usage_type`	VARCHAR(255)	NULL	COMMENT '이미지 사용처 구분 ITEM, DIARY, WORKOUT, MACHINE, PROFILE, BACKGROUND, EVALUATION, GYM',
	`usage_id`	INT	NULL	COMMENT '미디어가 해당하는 테이블의 아이디'
);

DROP TABLE IF EXISTS `items`;

CREATE TABLE `items` (
	`item_id`	INT	NOT NULL	COMMENT '아이템ID',
	`item_name`	VARCHAR(255)	NULL	COMMENT '아이템 이름',
	`width`	INT	NULL	COMMENT '아이템 가로 길이',
	`height`	INT	NULL	COMMENT '아이템 세로 길이',
	`price`	INT	NULL	DEFAULT 0	COMMENT '아이템 가격',
	`usable`	BOOLEAN	NULL	DEFAULT TRUE	COMMENT '아이템 사용여부',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '아이템 생성일시'
);

DROP TABLE IF EXISTS `guestbooks`;

CREATE TABLE `guestbooks` (
	`guestbooks_id`	INT	NOT NULL	COMMENT '방명록 ID',
	`owner_id`	INT	NOT NULL	COMMENT '마이짐 주인 ID',
	`guest_id`	INT	NOT NULL	COMMENT '방문자 ID',
	`content`	VARCHAR(255)	NULL	COMMENT '방명록 내용',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '방명록 작성일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '방명록 삭제 여부'
);

DROP TABLE IF EXISTS `diaries`;

CREATE TABLE `diaries` (
	`diary_id`	INT	NOT NULL	COMMENT '일지ID',
	`user_id`	INT	NOT NULL	COMMENT '회원ID',
	`workout_date`	DATE	NULL	COMMENT '운동한 날자',
	`content`	TEXT	NULL	COMMENT '운동일지 본문',
	`allowed_scope`	CHAR(1)	NULL	COMMENT 'A, F, M',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '운동일지 생성 시간',
	`modified_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '운동일지 최근 수정 시간',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '운동일지 삭제 여부'
);

DROP TABLE IF EXISTS `workouts`;

CREATE TABLE `workouts` (
	`workout_id`	SMALLINT	NOT NULL	COMMENT '운동아이디',
	`workout_name`	VARCHAR(255)	NULL	COMMENT '운동이름(ex. 데드리프트)',
	`part`	VARCHAR(255)	NULL	COMMENT '가슴, 등, 하체, 어깨, 삼두, 이두, 코어, 전완근, 유산소, 스포츠',
	`tool`	VARCHAR(255)	NULL	COMMENT '바벨, 덤벨, 케틀벨, 밴드, 머신, 스미스머신, 케이블머신, 맨몸'
);

DROP TABLE IF EXISTS `attendance`;

CREATE TABLE `attendance` (
	`attendance_id`	INT	NOT NULL	COMMENT '출석ID',
	`user_id`	INT	NOT NULL	COMMENT '출석한 회원ID',
	`attendance_date`	DATE	NULL	COMMENT '출석일자',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '출석일시'
);

DROP TABLE IF EXISTS `evaluations`;

CREATE TABLE `evaluations` (
	`evaluation_id`	INT	NOT NULL	COMMENT '평가 ID',
	`user_id`	INT	NOT NULL	COMMENT '회원 ID',
	`content`	TEXT	NULL	COMMENT '본문 내용',
	`weight`	DECIMAL(4, 1)	NULL	COMMENT '인증받을 무게',
	`workout_type`	CHAR(5)	NULL	COMMENT '3대 운동 종류 DEAD, SQUAT, BENCH',
	`opened`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '투표시작여부',
	`closed`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '투표종료여부',
	`created_at`	TIMESTAMP	NULL	COMMENT '평가 생성일시',
	`modified_at`	TIMESTAMP	NULL	COMMENT '평가 최근 수정일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '평가 게시물 삭제 여부, 투표가 시작되면 삭제 불가'
);

DROP TABLE IF EXISTS `votes`;

CREATE TABLE `votes` (
	`evaluation_id`	INT	NOT NULL	COMMENT '평가ID',
	`user_id`	INT	NOT NULL	COMMENT '회원ID',
	`approval`	BOOLEAN	NULL	COMMENT '찬성여부'
);

DROP TABLE IF EXISTS `user_items`;

CREATE TABLE `user_items` (
	`item_id`	INT	NOT NULL	COMMENT '아이템ID',
	`user_id`	INT	NOT NULL	COMMENT '회원ID',
	`item_name`	VARCHAR(255)	NULL	COMMENT '아이템 이름',
	`item_price`	INT	NULL	DEFAULT 0	COMMENT '아이템 가격',
	`created_at`	DATETIME	NULL	DEFAULT NOW()	COMMENT '아이템 획득일시'
);

DROP TABLE IF EXISTS `gyms`;

create table gyms
(
    gym_id      int auto_increment comment '헬스장ID',
    gym_name    varchar(255)                         null comment '헬스장 이름',
    gym_address varchar(255)                         null comment '헬스장 주소',
    created_at  timestamp  default CURRENT_TIMESTAMP null comment '헬스장 생성일시',
    deleted     tinyint(1) default 0                 null comment '헬스장 삭제여부',
    latitude    double                               null comment '헬스장 위도',
    longitude   double                               null comment '헬스장 경도'
);


DROP TABLE IF EXISTS `workout_records`;

CREATE TABLE `workout_records` (
	`user_id`	INT	NOT NULL	COMMENT '회원ID',
	`squat_evaluation`	INT	NULL	COMMENT '스쿼트 최대 중량 근거 평가 게시물 ID',
	`benchpress_evaluation`	INT	NULL	COMMENT '벤치프레스 최대 중량 근거 평가 게시물 ID',
	`deadlift_evaluation`	INT	NULL	COMMENT '데드리프트 최대 중량 근거 평가 게시물 ID',
	`squat`	DECIMAL(4,1)	NULL	DEFAULT 0	COMMENT '사용자 스쿼트 최대 중량 기록',
	`benchpress`	DECIMAL(4,1)	NULL	DEFAULT 0	COMMENT '사용자 벤치프레스 최대 중량 기록',
	`deadlift`	DECIMAL(4,1)	NULL	DEFAULT 0	COMMENT '사용자 데드리프트 최대 중량 기록'
);

DROP TABLE IF EXISTS `diary_workouts`;

CREATE TABLE `diary_workouts` (
	`diary_workout_id`	INT	NOT NULL	COMMENT '운동내역ID',
	`diary_id`	INT	NOT NULL	COMMENT '일지ID',
	`workout_id`	SMALLINT	NOT NULL	COMMENT '운동아이디',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '운동내역 생성 시간',
	`modified_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '운동내역 수정일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '삭제여부'
);

DROP TABLE IF EXISTS `workout_sets`;

CREATE TABLE `workout_sets` (
	`workout_set_id`	INT	NOT NULL	COMMENT '운동세트ID',
	`diary_workout_id`	INT	NOT NULL	COMMENT '운동내역ID',
	`weight`	DECIMAL(5, 2)	NULL	COMMENT '세트별 무게',
	`repetition`	TINYINT	NULL	COMMENT '반복 횟수',
	`workout_time`	SMALLINT	NULL	COMMENT '운동한 시간(초)',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '운동세트 생성 시간',
	`modified_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '운동 세드 수정일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '삭제여부'
);

DROP TABLE IF EXISTS `admin`;

CREATE TABLE `admin` (
	`admin_id`	VARCHAR(255)	NOT NULL	COMMENT '관리자 아이디',
	`admin_password`	VARCHAR(255)	NULL	COMMENT '관리자 비밀번호'
);

DROP TABLE IF EXISTS `machines`;

CREATE TABLE `machines` (
	`machine_id`	TINYINT	NOT NULL	COMMENT '머신 ID',
	`machine_name`	VARCHAR(255)	NULL	COMMENT '머신 이름',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '머신 생성일시'
);

DROP TABLE IF EXISTS `mygym_colors`;

CREATE TABLE `mygym_colors` (
	`user_id`	INT	NOT NULL	COMMENT '회원ID',
	`background_color`	CHAR(6)	NULL	COMMENT '배경색',
	`wall_color`	CHAR(6)	NULL	COMMENT '벽지색'
);

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
	`user_id`	INT	NOT NULL	COMMENT '회원ID',
	`email`	VARCHAR(128)	NULL	COMMENT 'email을 아이디로 씀',
	`account_type`	TINYINT	NULL	COMMENT	'LOCAL(0),KAKAO(1),GOOGLE(2)',
	`kakao_id`	BIGINT	NULL	COMMENT	'카카오 로그인 ID',
	`password`	VARCHAR(255)	NULL	COMMENT '비밀번호',
	`name`	VARCHAR(10)	NULL	COMMENT '성+이름',
	`nickname`	VARCHAR(50)	NULL	COMMENT '회원닉네임',
	`birth_date`	DATE	NULL	COMMENT '생년월일',
	`sex`	CHAR(1)	NULL	COMMENT 'M, F, O',
	`height`	SMALLINT	NULL	COMMENT	'회원의 키',
	`weight`	SMALLINT	NULL	COMMENT	'회원의 몸무게',
	`degree`	DECIMAL(3,1)	NULL	DEFAULT 36.5	COMMENT '다이어리에 기록을 하거나  출석체크를 하면 오른다',
	`introduction`	VARCHAR(255)	NULL	COMMENT '한줄 자기소개',
	`total_weight`	DECIMAL(4,1)	NULL	DEFAULT 0	COMMENT '3대 무게 합',
	`strick_attendance`	SMALLINT	NULL	DEFAULT 0	COMMENT '현재 연속 출석 일수(3일차부터 비연속)',
	`last_attendance`	DATE	NULL	COMMENT '최근 출석일',
	`coin`	INT	NULL	DEFAULT 0	COMMENT '보유한 코인량',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '회원 생성일시',
	`modified_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '회원정보 최근 수정일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '탈퇴여부'
);

DROP TABLE IF EXISTS `gym_machines`;

CREATE TABLE `gym_machines` (
	`gym_id`	INT	NOT NULL	COMMENT '헬스장ID',
	`machine_id`	TINYINT	NOT NULL	COMMENT '머신 ID',
	`created_at`	TIMESTAMP	NULL	DEFAULT NOW()	COMMENT '헬스장 머신 보유 생성일시',
	`deleted`	BOOLEAN	NULL	DEFAULT FALSE	COMMENT '헬스장 머신 보유 삭제 여부'
);

ALTER TABLE `comments` ADD CONSTRAINT `PK_COMMENTS` PRIMARY KEY (
	`comment_id`
);

ALTER TABLE `diary_liked` ADD CONSTRAINT `PK_DIARY_LIKED` PRIMARY KEY (
	`diary_id`,
	`user_id`
);

ALTER TABLE `places` ADD CONSTRAINT `PK_PLACES` PRIMARY KEY (
	`place_id`
);

ALTER TABLE `hashtags` ADD CONSTRAINT `PK_HASHTAGS` PRIMARY KEY (
	`diary_id`,
	`tag`
);

ALTER TABLE `images` ADD CONSTRAINT `PK_IMAGES` PRIMARY KEY (
	`image_id`
);

ALTER TABLE `items` ADD CONSTRAINT `PK_ITEMS` PRIMARY KEY (
	`item_id`
);

ALTER TABLE `guestbooks` ADD CONSTRAINT `PK_GUESTBOOKS` PRIMARY KEY (
	`guestbooks_id`
);

ALTER TABLE `diaries` ADD CONSTRAINT `PK_DIARIES` PRIMARY KEY (
	`diary_id`
);

ALTER TABLE `workouts` ADD CONSTRAINT `PK_WORKOUTS` PRIMARY KEY (
	`workout_id`
);

ALTER TABLE `attendance` ADD CONSTRAINT `PK_ATTENDANCE` PRIMARY KEY (
	`attendance_id`
);

ALTER TABLE `evaluations` ADD CONSTRAINT `PK_EVALUATIONS` PRIMARY KEY (
	`evaluation_id`
);

ALTER TABLE `votes` ADD CONSTRAINT `PK_VOTES` PRIMARY KEY (
	`evaluation_id`,
	`user_id`
);

ALTER TABLE `user_items` ADD CONSTRAINT `PK_USER_ITEMS` PRIMARY KEY (
	`user_id`,
	`item_id`
);

ALTER TABLE `gyms` ADD CONSTRAINT `PK_GYMS` PRIMARY KEY (
	`gym_id`
);

ALTER TABLE `diary_workouts` ADD CONSTRAINT `PK_DIARY_WORKOUTS` PRIMARY KEY (
	`diary_workout_id`
);

ALTER TABLE `workout_sets` ADD CONSTRAINT `PK_WORKOUT_SETS` PRIMARY KEY (
	`workout_set_id`
);

ALTER TABLE `admin` ADD CONSTRAINT `PK_ADMIN` PRIMARY KEY (
	`admin_id`
);

ALTER TABLE `machines` ADD CONSTRAINT `PK_MACHINES` PRIMARY KEY (
	`machine_id`
);

ALTER TABLE `mygym_colors` ADD CONSTRAINT `PK_MYGYM_COLORS` PRIMARY KEY (
	`user_id`
);

ALTER TABLE `users` ADD CONSTRAINT `PK_USERS` PRIMARY KEY (
	`user_id`
);

ALTER TABLE `gym_machines` ADD CONSTRAINT `PK_GYM_MACHINES` PRIMARY KEY (
	`gym_id`,
	`machine_id`
);

ALTER TABLE `comments`
MODIFY `comment_id` INT NOT NULL AUTO_INCREMENT COMMENT '댓글 ID';

ALTER TABLE `places`
MODIFY `place_id` INT NOT NULL AUTO_INCREMENT COMMENT '배치 ID';

ALTER TABLE `images`
MODIFY `image_id` INT NOT NULL AUTO_INCREMENT COMMENT '미디어 아이디';

ALTER TABLE `items`
MODIFY `item_id` INT NOT NULL AUTO_INCREMENT COMMENT '아이템ID';

ALTER TABLE `guestbooks`
MODIFY `guestbooks_id` INT NOT NULL AUTO_INCREMENT COMMENT '방명록 ID';

ALTER TABLE `diaries`
MODIFY `diary_id` INT NOT NULL AUTO_INCREMENT COMMENT '일지ID';

ALTER TABLE `workouts`
MODIFY `workout_id` SMALLINT NOT NULL AUTO_INCREMENT COMMENT '운동아이디';

ALTER TABLE `attendance`
MODIFY `attendance_id` INT NOT NULL AUTO_INCREMENT COMMENT '출석ID';

ALTER TABLE `evaluations`
MODIFY `evaluation_id` INT NOT NULL AUTO_INCREMENT COMMENT '평가 ID';

ALTER TABLE `gyms`
MODIFY `gym_id` INT NOT NULL AUTO_INCREMENT COMMENT '헬스장ID';

ALTER TABLE `diary_workouts`
MODIFY `diary_workout_id` INT NOT NULL AUTO_INCREMENT COMMENT '운동내역ID';

ALTER TABLE `workout_sets`
MODIFY `workout_set_id` INT NOT NULL AUTO_INCREMENT COMMENT '운동세트ID';

ALTER TABLE `machines`
MODIFY `machine_id` TINYINT NOT NULL AUTO_INCREMENT COMMENT '머신 ID';

ALTER TABLE `users`
MODIFY `user_id` INT NOT NULL AUTO_INCREMENT COMMENT '회원ID';

AlTER TABLE `workouts`
MODIFY `workout_id` SMALLINT NOT NULL AUTO_INCREMENT COMMENT '운동ID';