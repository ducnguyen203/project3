import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/Login.module.css";
import login from "../assets/img/login.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    const rememberMe = localStorage.getItem("rememberMe") == "true";
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setRememberMe(true);

      if (savedPassword) {
        setPassword(atob(savedPassword));
      }
    }
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email không hợp lệ!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Email hoặc mật khẩu không đúng!");
        return;
      }

      // ✅ Lưu token nếu là admin
      localStorage.setItem("Token", data.accessToken);

      if (rememberMe) {
        localStorage.setItem("email", email);
        localStorage.setItem("password", btoa(password));
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        localStorage.removeItem("rememberMe");
      }

      setMessage("Đăng nhập thành công!");
      setTimeout(() => {
        navigate("/airplanes"); // 🔁 chuyển đến dashboard admin
      }, 1000);
    } catch (error) {
      console.log("Lỗi fetch:", error);
      setError("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <div className={styles.container}>
          <div className={styles.inputGroup}>
            <a href="/" className={styles.authLink}>
              <FontAwesomeIcon icon={faChevronLeft} />
              Back To Home
            </a>
            <h2>Log in</h2>
            <div className={styles.input_block}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className={styles.input_block}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className={styles.checkbox_block}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label>Ghi nhớ đăng nhập</label>
            </div>
            {message && <p className={styles.message}>{message}</p>}
            {error && <p className={styles.error}>{error}</p>}
            <div>
              <button className={styles.inputbtn}>Login</button>
            </div>
            <div>
              <label>Not a member ?</label>
              <a href="/Register" className={styles.authLink}>
                Register
              </a>
            </div>
          </div>
        </div>
        <div className={styles.imgcontainer}>
          <img src={login} alt="" />
        </div>
      </form>
    </>
  );
};

export default Login;
