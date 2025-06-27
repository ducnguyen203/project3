import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import styles from "../assets/styles/Register.module.css";
import login from "../assets/img/login.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [message, setMessage] = useState(""); 
  const [error, setError] = useState(""); 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Gửi cookie nếu cần
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("🎉 Đăng ký thành công!");
        setFormData({
          full_name: "",
          email: "",
          password: "",
          phone: "",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || " Đăng ký thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setError(" Lỗi khi kết nối đến server!");
    }
  };

  return (
    <>
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <div className={styles.container}>
          <div className={styles.inputGroup}>
            <a href="/" className={styles.authLink}>
              <FontAwesomeIcon icon={faChevronLeft} />
              Back To Home
            </a>
            <h2>Create an account</h2>
            <div>
              <div className={styles.input_block}>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.input_block}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <div className={styles.input_block}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.input_block}>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <button type="submit" className={styles.inputbtn}>
                Register
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
        <div className={styles.imgcontainer}>
          <img src={login} alt="" />
        </div>
      </form>
    </>
  );
};

export default Register;
