import React, { useState, useEffect, memo, useCallback } from "react";
import { debounce } from "lodash";
import style from "../assets/styles/Flight.module.css";

const FlightCalendar = ({ departureDate, onDateChange }) => {
  const [dates, setDates] = useState(getSurroundingDates(departureDate));

  useEffect(() => {
    setDates(getSurroundingDates(departureDate));
  }, [departureDate]);

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

  const debouncedDateChange = useCallback(
    debounce((date) => {
      onDateChange(date);
    }, 500),
    [onDateChange]
  );

  const handleDateClick = (date, index) => {
    if (index === dates.length - 1) {
      const newStartDate = new Date(date.getTime());
      newStartDate.setDate(newStartDate.getDate() + 1);
      setDates(getSurroundingDates(newStartDate));
      debouncedDateChange(date);
      return;
    }

    if (index === 0) {
      const newStartDate = new Date(date.getTime());
      newStartDate.setDate(newStartDate.getDate() - 5);
      setDates(getSurroundingDates(newStartDate));
      debouncedDateChange(date);
      return;
    }

    debouncedDateChange(date);
  };

  return (
    <div className={style.calendarContainer}>
      {dates.map((date, index) => (
        <div
          key={index}
          className={`${style.calendarItem} ${
            departureDate && date.getTime() === departureDate.getTime()
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

export default memo(FlightCalendar);
