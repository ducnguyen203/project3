import React from "react";
import styles from "../assets/styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBottom}>
        <p>Follow Us!</p>
        <div className={styles.socialIcons}>
          {/* Icons for social media */}
          <span>Instagram</span>
          <span>Facebook</span>
          <span>LinkedIn</span>
          <span>X</span>
        </div>
        <p>©2024 FlyNow All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
