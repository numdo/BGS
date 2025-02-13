// src/components/admin/ItemCreateModal.jsx
import React from "react";
import { InputText } from "primereact/inputtext";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function AdminItemCreateModal({
  newItemData,
  onNewItemChange,
  onNewImageChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 (클릭 시 모달 닫기) */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="relative bg-white p-6 rounded-md w-1/2 z-10">
        <h3 className="text-lg font-semibold mb-8">아이템 등록</h3>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            {/* 아이템 이름 */}
            <span className="p-float-label">
              <InputText
                id="itemName"
                name="itemName"
                value={newItemData.itemName}
                onChange={onNewItemChange}
                required
                className="w-80 h-10 m-2"
              />
              <label htmlFor="itemName">아이템 이름</label>
            </span>
            {/* 너비 */}
            <span className="p-float-label">
              <InputText
                id="width"
                name="width"
                type="number"
                value={newItemData.width}
                onChange={onNewItemChange}
                required
                className="w-80 h-10 m-2"
              />
              <label htmlFor="width">너비</label>
            </span>
            {/* 높이 */}
            <span className="p-float-label">
              <InputText
                id="height"
                name="height"
                type="number"
                value={newItemData.height}
                onChange={onNewItemChange}
                required
                className="w-80 h-10 m-2"
              />
              <label htmlFor="height">높이</label>
            </span>
            {/* 가격 */}
            <span className="p-float-label">
              <InputText
                id="price"
                name="price"
                type="number"
                value={newItemData.price}
                onChange={onNewItemChange}
                required
                className="w-80 h-10 m-2"
              />
              <label htmlFor="price">가격</label>
            </span>
            {/* 파일 업로드 - antd Upload 사용 */}
            <div className="m-2">
              <Upload
                maxCount={1} // 단일 파일 제한
                beforeUpload={(file) => {
                  // 파일 타입 체크: 이미지 파일만 허용
                  if (!file.type.startsWith("image/")) {
                    // 필요시 오류 메시지 표시 가능
                    return false;
                  }
                  onNewImageChange(file);
                  return false; // 자동 업로드 방지
                }}
                accept="image/*"
                showUploadList={true}
                // itemRender를 통해 파일 미리보기, 이름, 크기를 표시
                itemRender={(originNode, file, fileList, actions) => {
                  const fileObj = file.originFileObj || file; // originFileObj가 있으면 사용
                  return (
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <img
                        src={URL.createObjectURL(fileObj)}
                        alt={file.name}
                        className="w-12 h-12 object-cover"
                      />
                      <div>
                        <div>{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      {actions?.remove && (
                        <Button
                          onClick={() => actions.remove()}
                          size="small"
                          type="link"
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  );
                }}
              >
                <Button
                  icon={<UploadOutlined />}
                  className="bg-primary-light text-white"
                >
                  파일 선택
                </Button>
              </Upload>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-light text-white rounded"
            >
              등록 완료
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-primary-light text-white rounded"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
