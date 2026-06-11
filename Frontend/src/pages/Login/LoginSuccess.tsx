// File: src/pages/LoginSuccess.tsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      console.error("No token found in URL, redirecting to login.");
      window.location.href = "/login?error=true";
      return;
    }

    // ✅ Lưu token vào localStorage
    localStorage.setItem("authToken", token);

    // ✅ Gọi API để lấy thông tin người dùng
    fetch("http://localhost:3000/profile/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?._id) {
          localStorage.setItem("accountId", data._id);
        }
        const role = data.role || "user";
        localStorage.setItem("userRole", role);

        // ✅ Kiểm tra role
        if (role === "admin") {
          console.log("Admin detected, redirecting to admin dashboard");
          window.location.href = "/admin";
        } else {
          console.log("Normal user, redirecting to homepage");
          window.location.href = "/";
        }
      })
      .catch((err) => {
        console.error("Error fetching user profile:", err);
        window.location.href = "/login?error=true";
      });
  }, [searchParams]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "white" }}>
      <h1>Login Successful!</h1>
      <p>Please wait, we are redirecting you...</p>
    </div>
  );
};

export default LoginSuccess;
