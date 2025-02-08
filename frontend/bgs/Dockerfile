# 1단계: 빌드 단계
FROM node:16-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: Nginx를 이용한 프로덕션 환경 구축
FROM nginx:stable-alpine
# 빌드된 파일을 Nginx의 기본 루트 디렉토리로 복사
COPY --from=builder /app/dist /usr/share/nginx/html
# 커스텀 Nginx 설정 복사 (아래 참고)
COPY nginx.conf /etc/nginx/conf.d/default.conf
