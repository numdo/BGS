import toastr from "toastr";
import "toastr/build/toastr.min.css";

// 기본 toastr 설정
toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: "toast-bottom-center",
  preventDuplicates: true,
  timeOut: 0,
  extendedTimeOut: 0,
  closeOnHover: false,
};

export const showConfirmAlert = (message) => {
  return new Promise((resolve) => {
    const $toast = toastr.success(
      `<div id="toastrConfirmBtn" class="p-4">
            <div class="mb-4 text-gray-700">
                ${message}
            </div>
        </div>
        `,
      null,
      {
        allowHtml: true,
        showMethod: "show",
        hideMethod: "hide",
        onShown: function () {
          const confirmBtn = document.getElementById("toastrConfirmBtn");
          if (confirmBtn) {
            confirmBtn.addEventListener("click", () => {
              toastr.clear($toast);
              resolve(true);
            });
          }
        },
      }
    );
  });
};

export const showErrorAlert = (message) => {
  return new Promise((resolve) => {
    const $toast = toastr.error(
      `<div id="toastrErrorBtn" class="w-full max-w-sm rounded-lg p-4">
                ${message}
            </div>`,
      null,
      {
        allowHtml: true,
        showMethod: "show",
        hideMethod: "hide",
        onShown: function () {
          const errorBtn = document.getElementById("toastrErrorBtn");
          if (errorBtn) {
            errorBtn.addEventListener("click", () => {
              toastr.clear($toast);
              resolve(true);
            });
          }
        },
      }
    );
  });
};

// 성공 알림 (자동 닫힘)
export const showSuccessAlert = (message, duration = 3000) => {
  const $toast = toastr.success(
    `<div class="w-full max-w-sm rounded-lg p-4">
        <div class="flex items-center">
            <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
                ${message}
        </div>
        </div>`,
    null,
    {
      timeOut: duration,
      extendedTimeOut: duration / 2,
      closeButton: true,
      progressBar: true,
      allowHtml: true,
    }
  );

  return $toast;
};

export const showInformAlert = (message, duration = 2000) => {
  const $toast = toastr.info(
    `<div class="w-full max-w-sm rounded-lg p-4">
        <div class="flex items-center">
                ${message}
        </div>
        </div>`,
    null,
    {
      allowHtml: true,
      timeOut: duration, // 설정된 시간 후 자동으로 사라짐
      extendedTimeOut: 0,
      closeButton: false,
      tapToDismiss: true, // 클릭하면 사라지도록 설정
      showMethod: "show", // 애니메이션 제거 가능
      hideMethod: "hide",
      onHidden: function () {
        resolve(true); // 알림이 사라진 후 resolve
      },
    }
  );

  return $toast;
};
