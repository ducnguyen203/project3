import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "../assets/styles/Header.module.css";
import logo from "../assets/img/logo.png";

const Header = () => {
  const [isLoginIn, setIsLoginIn] = useState(false);
  const Location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem("Token");
    setIsLoginIn(!!token);
  }, [Location]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        // Đường dẫn API cho logout
        method: "POST",
        credentials: "include", // Để gửi cookie
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("Token");
        setIsLoginIn(false);
      } else {
        console.error("Lỗi khi đăng xuất:", response.statusText);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };
  return (
    <nav className={styles.navbar}>
      <div className={styles.main_menu_left}>
        <div className={styles.logo}>
          <Link to="/">
            <img src={logo} className={styles.logoImg} alt="Logo" />
          </Link>
        </div>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <a href="/">Home</a>
          </li>
          <li className={styles.navItem}>
            <a href="/Flight">Flights</a>
          </li>
          <li className={styles.navItem}>
            <a href="/MyBooking"> My Bookings</a>
          </li>
          <li className={styles.navItem}>
            <a href="#">Abouts us</a>
          </li>
          <li className={styles.navItem}>
            <a href="#">News</a>
          </li>
        </ul>
      </div>
      <div className={styles.auth}>
        {isLoginIn ? (
          <div className={styles.profile}>
            <Link to="/Profile" className={styles.authLink}>
              Profile
            </Link>
            <span className={[styles.authLink, styles.space].join(" ")}>|</span>
            <button onClick={handleLogout} className={styles.authLink}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <a href="/Login" className={styles.authLink}>
              Login
            </a>
            <span className={[styles.authLink, styles.space].join(" ")}>/</span>
            <a href="/Register" className={styles.authLink}>
              Signup
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
