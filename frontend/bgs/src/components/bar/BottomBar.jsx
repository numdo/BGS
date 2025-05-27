import { useNavigate, useLocation } from "react-router-dom";

export default function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 각 버튼에 대한 정보 배열 생성
  const buttons = [
    {
      name: "홈",
      path: "/",
      activeCondition: location.pathname === "/",
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.99778 19.3279V14.3279H13.9978V19.3279C13.9978 19.8779 14.4478 20.3279 14.9978 20.3279H17.9978C18.5478 20.3279 18.9978 19.8779 18.9978 19.3279V12.3279H20.6978C21.1578 12.3279 21.3778 11.7579 21.0278 11.4579L12.6678 3.92785C12.2878 3.58785 11.7078 3.58785 11.3278 3.92785L2.96778 11.4579C2.62778 11.7579 2.83778 12.3279 3.29778 12.3279H4.99778V19.3279C4.99778 19.8779 5.44778 20.3279 5.99778 20.3279H8.99778C9.54778 20.3279 9.99778 19.8779 9.99778 19.3279Z"
            fill="#5968eb"
          />
        </svg>
      ),
      inactiveIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.99778 19.3279V14.3279H13.9978V19.3279C13.9978 19.8779 14.4478 20.3279 14.9978 20.3279H17.9978C18.5478 20.3279 18.9978 19.8779 18.9978 19.3279V12.3279H20.6978C21.1578 12.3279 21.3778 11.7579 21.0278 11.4579L12.6678 3.92785C12.2878 3.58785 11.7078 3.58785 11.3278 3.92785L2.96778 11.4579C2.62778 11.7579 2.83778 12.3279 3.29778 12.3279H4.99778V19.3279C4.99778 19.8779 5.44778 20.3279 5.99778 20.3279H8.99778C9.54778 20.3279 9.99778 19.8779 9.99778 19.3279Z"
            fill="#808080"
          />
        </svg>
      ),
    },
    {
      name: "운동일지",
      path: "/workout",
      activeCondition: location.pathname.startsWith("/workout"),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.57 14.8605L21.29 14.1405C21.68 13.7505 21.68 13.1205 21.29 12.7305L21.27 12.7105C20.88 12.3205 20.25 12.3205 19.86 12.7105L17 15.5705L8.42998 7.00047L11.29 4.14047C11.68 3.75047 11.68 3.12047 11.29 2.73047L11.27 2.71047C10.88 2.32047 10.25 2.32047 9.85998 2.71047L9.13998 3.43047L8.41998 2.71047C8.02998 2.32047 7.38998 2.32047 6.99998 2.71047L5.56998 4.14047L4.84998 3.42047C4.45998 3.03047 3.80998 3.03047 3.41998 3.42047C3.02998 3.81047 3.02998 4.46047 3.41998 4.85047L4.13998 5.57047L2.70998 7.00047C2.31998 7.39047 2.31998 8.02047 2.70998 8.41047L3.42998 9.13047L2.70998 9.86047C2.31998 10.2505 2.31998 10.8805 2.70998 11.2705L2.72998 11.2905C3.11998 11.6805 3.74998 11.6805 4.13998 11.2905L6.99998 8.43047L15.57 17.0005L12.71 19.8605C12.32 20.2505 12.32 20.8805 12.71 21.2705L12.73 21.2905C13.12 21.6805 13.75 21.6805 14.14 21.2905L14.86 20.5705L15.58 21.2905C15.97 21.6805 16.6 21.6805 16.99 21.2905L18.42 19.8605L19.14 20.5805C19.53 20.9705 20.18 20.9705 20.57 20.5805C20.96 20.1905 20.96 19.5405 20.57 19.1505L19.85 18.4305L21.29 17.0005C21.68 16.6105 21.68 15.9805 21.29 15.5905L20.57 14.8605Z"
            fill="#5968eb"
          />
        </svg>
      ),
      inactiveIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.57 14.8605L21.29 14.1405C21.68 13.7505 21.68 13.1205 21.29 12.7305L21.27 12.7105C20.88 12.3205 20.25 12.3205 19.86 12.7105L17 15.5705L8.42998 7.00047L11.29 4.14047C11.68 3.75047 11.68 3.12047 11.29 2.73047L11.27 2.71047C10.88 2.32047 10.25 2.32047 9.85998 2.71047L9.13998 3.43047L8.41998 2.71047C8.02998 2.32047 7.38998 2.32047 6.99998 2.71047L5.56998 4.14047L4.84998 3.42047C4.45998 3.03047 3.80998 3.03047 3.41998 3.42047C3.02998 3.81047 3.02998 4.46047 3.41998 4.85047L4.13998 5.57047L2.70998 7.00047C2.31998 7.39047 2.31998 8.02047 2.70998 8.41047L3.42998 9.13047L2.70998 9.86047C2.31998 10.2505 2.31998 10.8805 2.70998 11.2705L2.72998 11.2905C3.11998 11.6805 3.74998 11.6805 4.13998 11.2905L6.99998 8.43047L15.57 17.0005L12.71 19.8605C12.32 20.2505 12.32 20.8805 12.71 21.2705L12.73 21.2905C13.12 21.6805 13.75 21.6805 14.14 21.2905L14.86 20.5705L15.58 21.2905C15.97 21.6805 16.6 21.6805 16.99 21.2905L18.42 19.8605L19.14 20.5805C19.53 20.9705 20.18 20.9705 20.57 20.5805C20.96 20.1905 20.96 19.5405 20.57 19.1505L19.85 18.4305L21.29 17.0005C21.68 16.6105 21.68 15.9805 21.29 15.5905L20.57 14.8605Z"
            fill="#808080"
          />
        </svg>
      ),
    },
    {
      name: "마이짐",
      path: "/mygym",
      activeCondition: location.pathname.startsWith("/mygym"),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="3 3 27 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_2403_5490)">
            <path
              d="M26.0033 11.8059L16.9967 6.60586L7.99334 11.8001L7.99667 22.1943L17.0033 27.3943L26.0067 22.2001L26.0033 11.8059Z"
              fill="#5968eb"
            />
          </g>
          <defs>
            <clipPath id="clip0_2403_5490">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="translate(12.6077 0.607422) rotate(30)"
              />
            </clipPath>
          </defs>
        </svg>
      ),
      inactiveIcon: (
        <svg
          width="24"
          height="24"
          viewBox="3 3 27 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_2403_5490)">
            <path
              d="M26.0033 11.8059L16.9967 6.60586L7.99334 11.8001L7.99667 22.1943L17.0033 27.3943L26.0067 22.2001L26.0033 11.8059Z"
              fill="#808080"
            />
          </g>
          <defs>
            <clipPath id="clip0_2403_5490">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="translate(12.6077 0.607422) rotate(30)"
              />
            </clipPath>
          </defs>
        </svg>
      ),
    },
    {
      name: "피드",
      path: "/feeds",
      activeCondition: location.pathname.startsWith("/feed"),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z"
            fill="#5968eb"
          />
        </svg>
      ),
      inactiveIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 8H8V4H4V8ZM10 20H14V16H10V20ZM4 20H8V16H4V20ZM4 14H8V10H4V14ZM10 14H14V10H10V14ZM16 4V8H20V4H16ZM10 8H14V4H10V8ZM16 14H20V10H16V14ZM16 20H20V16H16V20Z"
            fill="#808080"
          />
        </svg>
      ),
    },
    {
      name: "내정보",
      path: "/myinfo",
      activeCondition: location.pathname.startsWith("/myinfo"),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill="#5968eb"
          />
        </svg>
      ),
      inactiveIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill="#808080"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-white border-t border-l border-r border-gray-200 shadow-lg z-[100] w-full max-w-[600px]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-evenly items-center py-2">
        {buttons.map((btn) => (
          <button
            key={btn.name}
            onClick={() => navigate(btn.path)}
            className="flex flex-col items-center w-12 h-12 text-gray-800 active:bg-gray-100"
          >
            {btn.activeCondition ? btn.activeIcon : btn.inactiveIcon}
            <span
              className={`text-sm font-bold ${
                btn.activeCondition ? "text-primary" : ""
              }`}
            >
              {btn.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
