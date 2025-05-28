import React, { useState, useEffect } from "react";
import style from "../assets/styles/Flight.module.css";

const FlightCalendar = ({ departureDate, onDateChange }) => {
  const defaultDate = departureDate ? new Date(departureDate) : new Date();
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [dates, setDates] = useState(getSurroundingDates(defaultDate));

  // ✅ Thêm useEffect này để cập nhật khi props departureDate thay đổi
  useEffect(() => {
    const updatedDate = departureDate ? new Date(departureDate) : new Date();
    setSelectedDate(updatedDate);
    setDates(getSurroundingDates(updatedDate));
  }, [departureDate]);
  // Hàm tạo danh sách 9 ngày (4 ngày trước, ngày hiện tại, 4 ngày sau)
  function getSurroundingDates(date) {
    if (!date) return [];
    const dates = [];
    for (let i = -4; i <= 4; i++) {
      const newDate = new Date(date.getTime());
      newDate.setDate(newDate.getDate() + i);
      dates.push(newDate);
    }
    return dates;
  }

  //Xử lý khi click vào một ngày
  const handleDateClick = (date, index) => {
    if (index === dates.length - 1) {
      const newStartDate = new Date(date.getTime());
      newStartDate.setDate(newStartDate.getDate() + 1);
      const newDates = getSurroundingDates(newStartDate);
      setDates(newDates);
      setSelectedDate(date);
      onDateChange(date);
      return;
    }

    if (index === 0) {
      const newStartDate = new Date(date.getTime());
      newStartDate.setDate(newStartDate.getDate() - 5);
      const newDates = getSurroundingDates(newStartDate);
      setDates(newDates);
      setSelectedDate(date);
      onDateChange(date);
      return;
    }

    setSelectedDate(date);
    onDateChange(date);
  };

  return (
    <div className={style.calendarContainer}>
      {dates.map((date, index) => (
        <div
          key={index}
          className={`${style.calendarItem} ${
            date.toDateString() === selectedDate.toDateString()
              ? style.selected
              : ""
          }`}
          onClick={() => handleDateClick(date, index)}
        >
          <div className={style.weekday}>
            {date
              .toLocaleDateString("vi-VN", { weekday: "short" })
              .replace(".", "")}
          </div>
          <div className={style.day}>
            <strong>{date.getDate().toString().padStart(2, "0")}</strong>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightCalendar;
