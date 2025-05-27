// src/pages/Forbidden.jsx
import React from "react";

export default function Forbidden() {
  return (
    <>
      {/* 템플릿 수정: <html className="h-full"><body className="h-full"> */}
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-black">403</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-black sm:text-7xl">
            접근 권한 없음
          </h1>
          <p className="mt-6 text-lg font-medium text-gray-500 sm:text-xl">
            죄송합니다. 이 페이지에 접근할 권한이 없습니다.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/"
              className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
