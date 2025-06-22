import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import style from "../assets/styles/Booking.module.css";

const Booking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    passengers = { adults: 1, children: 0, infants: 0 },
    tripType,
    departure,
    destination,
    selectedDepartureTicket,
    selectedReturnTicket,
    totalPrice,
  } = state || {};

  const [sections, setSections] = useState(() => {
    const initialSections = {};
    for (let i = 0; i < passengers.adults; i++)
      initialSections[`adult_${i}`] = true;
    for (let i = 0; i < passengers.children; i++)
      initialSections[`child_${i}`] = true;
    for (let i = 0; i < passengers.infants; i++)
      initialSections[`infant_${i}`] = true;
    return initialSections;
  });

  const [passengerData, setPassengerData] = useState(() => {
    const initialData = {};
    for (let i = 0; i < passengers.adults; i++) {
      initialData[`adult_${i}`] = {
        passenger_type: "Adult",
        gender: "",
        full_name: "",
        email: "",
        phone: "",
        cccd: "",
        date_of_birth: "",
        price_id_departure: selectedDepartureTicket?.price_id,
        price_id_return: selectedReturnTicket?.price_id || null,
      };
    }
    for (let i = 0; i < passengers.children; i++) {
      initialData[`child_${i}`] = {
        passenger_type: "Child",
        gender: "",
        full_name: "",
        date_of_birth: "",
        price_id_departure: selectedDepartureTicket?.price_id,
        price_id_return: selectedReturnTicket?.price_id || null,
      };
    }
    for (let i = 0; i < passengers.infants; i++) {
      initialData[`infant_${i}`] = {
        passenger_type: "Infant",
        gender: "",
        full_name: "",
        date_of_birth: "",
        price_id_departure: selectedDepartureTicket?.price_id,
        price_id_return: selectedReturnTicket?.price_id || null,
      };
    }
    return initialData;
  });

  const [errors, setErrors] = useState({});

  const toggleSection = (section) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (section, field, value) => {
    setPassengerData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    setErrors((prev) => ({ ...prev, [`${section}_${field}`]: "" }));
  };

  const today = new Date();
  const maxAdultDate = new Date(
    today.getFullYear() - 12,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];
  const maxChildDate = new Date(
    today.getFullYear() - 2,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];
  const minChildDate = new Date(
    today.getFullYear() - 12,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];
  const maxInfantDate = today.toISOString().split("T")[0];
  const minInfantDate = new Date(
    today.getFullYear() - 2,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    const passengersArray = Object.entries(passengerData);

    for (const [section, passenger] of passengersArray) {
      if (!passenger.full_name.trim()) {
        newErrors[`${section}_full_name`] = "Họ và tên không được để trống";
        isValid = false;
      } else if (!/^[A-Za-zÀ-ỹ\s]+$/.test(passenger.full_name)) {
        newErrors[`${section}_full_name`] =
          "Họ và tên chỉ chứa chữ cái và khoảng trắng";
        isValid = false;
      }

      if (!passenger.gender) {
        newErrors[`${section}_gender`] = "Vui lòng chọn giới tính";
        isValid = false;
      }

      if (!passenger.date_of_birth) {
        newErrors[`${section}_date_of_birth`] = "Ngày sinh không được để trống";
        isValid = false;
      }

      if (passenger.passenger_type === "Adult") {
        if (!passenger.email.trim()) {
          newErrors[`${section}_email`] = "Email không được để trống";
          isValid = false;
        } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(passenger.email)) {
          newErrors[`${section}_email`] = "Email phải có định dạng @gmail.com";
          isValid = false;
        }

        if (!passenger.phone.trim()) {
          newErrors[`${section}_phone`] = "Số điện thoại không được để trống";
          isValid = false;
        } else if (!/^\+?[0-9]{10,15}$/.test(passenger.phone)) {
          newErrors[`${section}_phone`] =
            "Số điện thoại phải chứa 10-15 chữ số";
          isValid = false;
        }

        if (!passenger.cccd.trim()) {
          newErrors[`${section}_cccd`] = "CCCD không được để trống";
          isValid = false;
        } else if (!/^\d{12}$/.test(passenger.cccd)) {
          newErrors[`${section}_cccd`] = "CCCD phải chứa 12 chữ số";
          isValid = false;
        }
      }

      if (
        !passenger.price_id_departure ||
        (tripType === "round-trip" && !passenger.price_id_return)
      ) {
        newErrors[`${section}_price_id`] = "Price ID thiếu";
        isValid = false;
      }
    }

    const hasChildrenOrInfants = passengersArray.some(
      ([_, p]) => p.passenger_type === "Child" || p.passenger_type === "Infant"
    );
    const hasAdults = passengersArray.some(
      ([_, p]) => p.passenger_type === "Adult"
    );
    if (hasChildrenOrInfants && !hasAdults) {
      newErrors.global =
        "Trẻ em hoặc em bé phải có ít nhất một người lớn đi cùng";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleBooking = () => {
    if (!validateForm()) {
      return;
    }

    try {
      const enrichedPassengerData = Object.fromEntries(
        Object.entries(passengerData).map(([key, value]) => [
          key,
          {
            ...value,
            ticket_type_departure:
              selectedDepartureTicket?.ticket_type || "Economy",
            ticket_type_return:
              tripType === "round-trip"
                ? selectedReturnTicket?.ticket_type || "Economy"
                : null,
          },
        ])
      );

      navigate("/PassengerService", {
        state: {
          passengers,
          tripType,
          departure,
          destination,
          selectedDepartureTicket,
          selectedReturnTicket,
          totalPrice,
          passengerData: enrichedPassengerData,
        },
      });
    } catch (error) {
      console.error("Lỗi khi điều hướng:", error);
      setErrors((prev) => ({ ...prev, global: error.message }));
    }
  };

  const renderAdultForm = (index) => (
    <div className={style.passenger_section} key={`adult_${index}`}>
      <div
        className={style.passenger_type}
        onClick={() => toggleSection(`adult_${index}`)}
      >
        Người lớn {index + 1} (Trên 12 tuổi)
        <span className={style.toggle_icon}>
          {sections[`adult_${index}`] ? "−" : "+"}
        </span>
      </div>
      <div
        className={`${style.section_content} ${sections[`adult_${index}`] ? style.open : ""}`}
      >
        <div className={style.form_group}>
          <div className={style.gender}>
            <label className={style.label}>Giới tính*</label>
            <select
              className={`${style.input} ${errors[`adult_${index}_gender`] ? style.error : ""}`}
              value={passengerData[`adult_${index}`].gender}
              onChange={(e) =>
                handleInputChange(`adult_${index}`, "gender", e.target.value)
              }
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
            {errors[`adult_${index}_gender`] && (
              <span className={style.error_message}>
                {errors[`adult_${index}_gender`]}
              </span>
            )}
          </div>
          <div className={style.full_name}>
            <label className={style.label}>Họ và tên*</label>
            <input
              type="text"
              className={`${style.input} ${errors[`adult_${index}_full_name`] ? style.error : ""}`}
              placeholder="Nhập họ và tên"
              value={passengerData[`adult_${index}`].full_name}
              onChange={(e) =>
                handleInputChange(`adult_${index}`, "full_name", e.target.value)
              }
            />
            {errors[`adult_${index}_full_name`] && (
              <span className={style.error_message}>
                {errors[`adult_${index}_full_name`]}
              </span>
            )}
          </div>
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Ngày sinh*</label>
          <input
            type="date"
            className={`${style.input} ${errors[`adult_${index}_date_of_birth`] ? style.error : ""}`}
            max={maxAdultDate}
            value={passengerData[`adult_${index}`].date_of_birth}
            onChange={(e) =>
              handleInputChange(
                `adult_${index}`,
                "date_of_birth",
                e.target.value
              )
            }
          />
          {errors[`adult_${index}_date_of_birth`] && (
            <span className={style.error_message}>
              {errors[`adult_${index}_date_of_birth`]}
            </span>
          )}
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Email*</label>
          <input
            type="email"
            className={`${style.input} ${errors[`adult_${index}_email`] ? style.error : ""}`}
            placeholder="Nhập email"
            value={passengerData[`adult_${index}`].email}
            onChange={(e) =>
              handleInputChange(`adult_${index}`, "email", e.target.value)
            }
          />
          {errors[`adult_${index}_email`] && (
            <span className={style.error_message}>
              {errors[`adult_${index}_email`]}
            </span>
          )}
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Số điện thoại*</label>
          <input
            type="tel"
            className={`${style.input} ${errors[`adult_${index}_phone`] ? style.error : ""}`}
            placeholder="Nhập số điện thoại"
            value={passengerData[`adult_${index}`].phone}
            onChange={(e) =>
              handleInputChange(`adult_${index}`, "phone", e.target.value)
            }
          />
          {errors[`adult_${index}_phone`] && (
            <span className={style.error_message}>
              {errors[`adult_${index}_phone`]}
            </span>
          )}
        </div>
        <div className={style.form_group}>
          <label className={style.label}>CCCD*</label>
          <input
            type="text"
            className={`${style.input} ${errors[`adult_${index}_cccd`] ? style.error : ""}`}
            placeholder="Nhập số CCCD"
            value={passengerData[`adult_${index}`].cccd}
            onChange={(e) =>
              handleInputChange(`adult_${index}`, "cccd", e.target.value)
            }
          />
          {errors[`adult_${index}_cccd`] && (
            <span className={style.error_message}>
              {errors[`adult_${index}_cccd`]}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderChildrenForm = (index) => (
    <div className={style.passenger_section} key={`child_${index}`}>
      <div
        className={style.passenger_type}
        onClick={() => toggleSection(`child_${index}`)}
      >
        Trẻ em {index + 1} (2-12 tuổi)
        <span className={style.toggle_icon}>
          {sections[`child_${index}`] ? "−" : "+"}
        </span>
      </div>
      <div
        className={`${style.section_content} ${sections[`child_${index}`] ? style.open : ""}`}
      >
        <div className={style.form_group}>
          <div className={style.gender}>
            <label className={style.label}>Giới tính*</label>
            <select
              className={`${style.input} ${errors[`child_${index}_gender`] ? style.error : ""}`}
              value={passengerData[`child_${index}`].gender}
              onChange={(e) =>
                handleInputChange(`child_${index}`, "gender", e.target.value)
              }
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
            {errors[`child_${index}_gender`] && (
              <span className={style.error_message}>
                {errors[`child_${index}_gender`]}
              </span>
            )}
          </div>
          <div className={style.full_name}>
            <label className={style.label}>Họ và tên*</label>
            <input
              type="text"
              className={`${style.input} ${errors[`child_${index}_full_name`] ? style.error : ""}`}
              placeholder="Nhập họ và tên"
              value={passengerData[`child_${index}`].full_name}
              onChange={(e) =>
                handleInputChange(`child_${index}`, "full_name", e.target.value)
              }
            />
            {errors[`child_${index}_full_name`] && (
              <span className={style.error_message}>
                {errors[`child_${index}_full_name`]}
              </span>
            )}
          </div>
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Ngày sinh*</label>
          <input
            type="date"
            className={`${style.input} ${errors[`child_${index}_date_of_birth`] ? style.error : ""}`}
            min={minChildDate}
            max={maxChildDate}
            value={passengerData[`child_${index}`].date_of_birth}
            onChange={(e) =>
              handleInputChange(
                `child_${index}`,
                "date_of_birth",
                e.target.value
              )
            }
          />
          {errors[`child_${index}_date_of_birth`] && (
            <span className={style.error_message}>
              {errors[`child_${index}_date_of_birth`]}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderInfantForm = (index) => (
    <div className={style.passenger_section} key={`infant_${index}`}>
      <div
        className={style.passenger_type}
        onClick={() => toggleSection(`infant_${index}`)}
      >
        Em bé {index + 1} (0-2 tuổi)
        <span className={style.toggle_icon}>
          {sections[`infant_${index}`] ? "−" : "+"}
        </span>
      </div>
      <div
        className={`${style.section_content} ${sections[`infant_${index}`] ? style.open : ""}`}
      >
        <div className={style.form_group}>
          <div className={style.gender}>
            <label className={style.label}>Giới tính*</label>
            <select
              className={`${style.input} ${errors[`infant_${index}_gender`] ? style.error : ""}`}
              value={passengerData[`infant_${index}`].gender}
              onChange={(e) =>
                handleInputChange(`infant_${index}`, "gender", e.target.value)
              }
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
            {errors[`infant_${index}_gender`] && (
              <span className={style.error_message}>
                {errors[`infant_${index}_gender`]}
              </span>
            )}
          </div>
          <div className={style.full_name}>
            <label className={style.label}>Họ và tên*</label>
            <input
              type="text"
              className={`${style.input} ${errors[`infant_${index}_full_name`] ? style.error : ""}`}
              placeholder="Nhập họ và tên"
              value={passengerData[`infant_${index}`].full_name}
              onChange={(e) =>
                handleInputChange(
                  `infant_${index}`,
                  "full_name",
                  e.target.value
                )
              }
            />
            {errors[`infant_${index}_full_name`] && (
              <span className={style.error_message}>
                {errors[`infant_${index}_full_name`]}
              </span>
            )}
          </div>
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Ngày sinh*</label>
          <input
            type="date"
            className={`${style.input} ${errors[`infant_${index}_date_of_birth`] ? style.error : ""}`}
            min={minInfantDate}
            max={maxInfantDate}
            value={passengerData[`infant_${index}`].date_of_birth}
            onChange={(e) =>
              handleInputChange(
                `infant_${index}`,
                "date_of_birth",
                e.target.value
              )
            }
          />
          {errors[`infant_${index}_date_of_birth`] && (
            <span className={style.error_message}>
              {errors[`infant_${index}_date_of_birth`]}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <h2 className={style.text_center}>Welcome Flights Booking</h2>
      <div className={style.stepper}>
        <div className={style.step}>
          <div className={`${style.circle} ${style.active}`}></div>
          <div className={style.stepTitle}>Chọn chuyến bay</div>
          <div className={style.stepDesc}>Vui lòng chọn chuyến bay</div>
        </div>
        <div className={style.step}>
          <div className={`${style.circle} ${style.active}`}></div>
          <div className={style.stepTitle}>Đặt chỗ</div>
          <div className={style.stepDesc}>Điền thông tin để đặt chỗ</div>
        </div>
        <div className={style.step}>
          <div className={style.circle}></div>
          <div className={style.stepTitle}>Thanh toán</div>
          <div className={style.stepDesc}>Thanh toán để nhận vé máy bay</div>
        </div>
      </div>
      {errors.global && (
        <div className={style.global_error}>{errors.global}</div>
      )}
      <div className={style.block_main}>
        <div className={style.booking_information}>
          {Array.from({ length: passengers.adults }, (_, i) =>
            renderAdultForm(i)
          )}
          {Array.from({ length: passengers.children }, (_, i) =>
            renderChildrenForm(i)
          )}
          {Array.from({ length: passengers.infants }, (_, i) =>
            renderInfantForm(i)
          )}
        </div>
        {selectedDepartureTicket &&
          (tripType !== "round-trip" || selectedReturnTicket) && (
            <div className={style.FlightSidebar_filter}>
              <div className={style.bookingInfo}>
                <div className={style.title}>
                  <h3>Thông tin đặt chỗ</h3>
                </div>
                <div className={style.routeInfo}>
                  {selectedDepartureTicket && (
                    <p>
                      Chuyến đi: {departure} → {destination}
                    </p>
                  )}
                  {tripType === "round-trip" && selectedReturnTicket && (
                    <p>
                      Chuyến về: {destination} → {departure}
                    </p>
                  )}
                </div>
                <div className={style.ticketInfo}>
                  <p>
                    Tổng vé:{" "}
                    {(passengers.adults +
                      passengers.children +
                      passengers.infants) *
                      (tripType === "round-trip" ? 2 : 1)}
                  </p>
                  {selectedDepartureTicket && (
                    <p>
                      Chiều đi: {selectedDepartureTicket.price.toLocaleString()}{" "}
                      VND
                    </p>
                  )}
                  {tripType === "round-trip" && selectedReturnTicket && (
                    <p>
                      Chiều về: {selectedReturnTicket.price.toLocaleString()}{" "}
                      VND
                    </p>
                  )}
                </div>
                <div className={style.totalAmount}>
                  <div className={style.totalAmount_price}>
                    <strong>
                      Tổng tiền: {totalPrice?.toLocaleString()} VND
                    </strong>
                  </div>
                  <div className={style.totalAmount_button}>
                    <button onClick={handleBooking}>Thanh toán</button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default Booking;
