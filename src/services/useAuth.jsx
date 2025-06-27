import { useEffect } from "react";

const useAuth = () => {
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/auth/refresh-token",
          {
            credentials: "include", 
          }
        );
        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("accessToken", data.accessToken);
        } else {
          localStorage.removeItem("accessToken"); 
        }
      } catch (error) {
        console.log("Không thể làm mới Access Token, cần đăng nhập lại.");
      }
    };
  }, []);

  return null;
};

export default useAuth;
