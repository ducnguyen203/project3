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

  // Kiểm tra dữ liệu đầu vào ngay đầu
  // if (
  //   !selectedDepartureTicket ||x
  //   (tripType === "round-trip" && !selectedReturnTicket)
  // ) {
  //   return (
  //     <div>
  //       Lỗi: Vui lòng chọn đầy đủ vé cho chuyến đi và chuyến về (nếu có).
  //     </div>
  //   )
  // }

  const [sections, setSections] = useState(() => {
    const initialSections = {};
    for (let i = 0; i < passengers.adults; i++) {
      initialSections[`adult_${i}`] = true;
    }
    for (let i = 0; i < passengers.children; i++) {
      initialSections[`children_${i}`] = true;
    }
    for (let i = 0; i < passengers.infants; i++) {
      initialSections[`infant_${i}`] = true;
    }
    return initialSections;
  });

  const [passengerData, setPassengerData] = useState(() => {
    const initialData = {};
    // Gán dữ liệu cho người lớn
    for (let i = 0; i < passengers.adults; i++) {
      initialData[`adult_${i}`] = {
        passenger_type: "Adult",
        gender: "",
        full_name: "",
        email: "",
        phone: "",
        cccd: "",
        date_of_birth: "",
        price_id: selectedDepartureTicket?.price_id,
      };
    }
    // Gán dữ liệu cho trẻ em
    for (let i = 0; i < passengers.children; i++) {
      initialData[`children_${i}`] = {
        passenger_type: "Child",
        gender: "",
        full_name: "",
        date_of_birth: "",
        price_id: selectedDepartureTicket?.price_id,
      };
    }
    // Gán dữ liệu cho em bé
    for (let i = 0; i < passengers.infants; i++) {
      initialData[`infant_${i}`] = {
        passenger_type: "Infant",
        gender: "",
        full_name: "",
        date_of_birth: "",
        price_id: selectedDepartureTicket?.price_id,
      };
    }
    return initialData;
  });

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (section, field, value) => {
    setPassengerData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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

  const handleBooking = async () => {
    try {
      // Kiểm tra price_id và các trường bắt buộc trước khi gửi
      const passengersArray = Object.values(passengerData);
      for (const passenger of passengersArray) {
        if (!passenger.price_id) {
          throw new Error(
            `Price ID thiếu cho hành khách: ${passenger.full_name || passenger.passenger_type}`
          );
        }
        if (
          !passenger.full_name ||
          !passenger.date_of_birth ||
          !passenger.gender
        ) {
          throw new Error(
            `Thiếu thông tin bắt buộc cho hành khách: ${passenger.full_name || passenger.passenger_type}`
          );
        }
        if (
          passenger.passenger_type === "Adult" &&
          (!passenger.email || !passenger.phone || !passenger.cccd)
        ) {
          throw new Error(
            `Hành khách người lớn cần email, số điện thoại và CCCD: ${passenger.full_name}`
          );
        }
      }

      // Kiểm tra có ít nhất một người lớn nếu có trẻ em hoặc em bé
      const hasChildrenOrInfants = passengersArray.some(
        (p) => p.passenger_type === "Child" || p.passenger_type === "Infant"
      );
      const hasAdults = passengersArray.some(
        (p) => p.passenger_type === "Adult"
      );
      if (hasChildrenOrInfants && !hasAdults) {
        throw new Error(
          "Trẻ em hoặc em bé phải có ít nhất một người lớn đi cùng"
        );
      }

      // Sắp xếp passengers để gửi Adult trước
      const sortedPassengersArray = [...passengersArray].sort((a, b) =>
        a.passenger_type === "Adult" ? -1 : 1
      );

      const bookingData = {
        userId: 1, // Thay bằng userId thực tế từ xác thực
        departureScheduleId: selectedDepartureTicket.schedule_id,
        returnScheduleId: selectedReturnTicket?.schedule_id || null,
        numPassengers:
          (passengers.adults + passengers.children + passengers.infants) *
          (tripType === "round-trip" ? 2 : 1),
        totalPrice,
        passengers: sortedPassengersArray,
        tripType,
        selectedReturnTicket, // Thêm để backend lấy price_id cho chiều về
      };

      console.log("Booking Data:", JSON.stringify(bookingData, null, 2));

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi tạo đặt vé");
      }

      const data = await response.json();
      alert(`Tạo đặt vé thành công! Mã đặt vé: ${data.maDatVe}`);
      navigate("/PassengerService", {
        state: {
          bookingId: data.bookingId,
          maDatVe: data.maDatVe,
          passengers,
          tripType,
          departure,
          destination,
          selectedDepartureTicket,
          selectedReturnTicket,
          totalPrice,
        },
      });
    } catch (error) {
      console.error("Lỗi khi tạo đặt vé:", error);
      alert(`Không thể tạo đặt vé: ${error.message}`);
    }
  };

  const renderAdultForm = (index) => (
    <div className={style.passenger_section} key={`adult_${index}`}>
      <div
        className={style.passenger_type}
        onClick={() => toggleSection(`adult_${index}`)}
      >
        Người lớn {index + 1}
        <span className={style.toggle_icon}>
          {sections[`adult_${index}`] ? "-" : "+"}
        </span>
      </div>
      <div
        className={`${style.section_content} ${sections[`adult_${index}`] ? style.open : ""}`}
      >
        <div className={style.form_group}>
          <div className={style.gender}>
            <label className={style.label}>Giới tính</label>
            <select
              className={style.input}
              value={passengerData[`adult_${index}`].gender}
              onChange={(e) =>
                handleInputChange(`adult_${index}`, "gender", e.target.value)
              }
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </div>
          <div className={style.full_name}>
            <label className={style.label}>Họ và tên</label>
            <input
              type="text"
              className={style.input}
              placeholder="Nhập họ và tên"
              value={passengerData[`adult_${index}`].full_name}
              onChange={(e) =>
                handleInputChange(`adult_${index}`, "full_name", e.target.value)
              }
              required
              pattern="[A-Za-zÀ-ỹ\s]+"
              title="Họ và tên chỉ chứa chữ cái và khoảng trắng"
            />
          </div>
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Ngày sinh</label>
          <input
            type="date"
            className={style.input}
            max={maxAdultDate}
            value={passengerData[`adult_${index}`].date_of_birth}
            onChange={(e) =>
              handleInputChange(
                `adult_${index}`,
                "date_of_birth",
                e.target.value
              )
            }
            required
          />
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Email</label>
          <input
            type="email"
            className={style.input}
            placeholder="Nhập email"
            value={passengerData[`adult_${index}`].email}
            onChange={(e) =>
              handleInputChange(`adult_${index}`, "email", e.target.value)
            }
            required
            pattern="[a-zA-Z0-9._%+-]+@gmail\.com"
            title="Email phải có định dạng @gmail.com"
          />
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Số điện thoại</label>
          <input
            type="tel"
            className={style.input}
            placeholder="Nhập số điện thoại"
            value={passengerData[`adult_${index}`].phone}
            onChange={(e) =>
              handleInputChange(`adult_${index}`, "phone", e.target.value)
            }
            required
            pattern="\+?[0-9]{10,15}"
            title="Số điện thoại phải chứa 10-15 chữ số"
          />
        </div>
        <div className={style.form_group}>
          <label className={style.label}>CCCD</label>
          <input
            type="text"
            className={style.input}
            placeholder="Nhập số CCCD"
            value={passengerData[`adult_${index}`].cccd}
            onChange={(e) =>
              handleInputChange(`adult_${index}`, "cccd", e.target.value)
            }
            required
            pattern="\d{12}"
            title="CCCD phải chứa 12 chữ số"
          />
        </div>
      </div>
    </div>
  );

  const renderChildrenForm = (index) => (
    <div className={style.passenger_section} key={`children_${index}`}>
      <div
        className={style.passenger_type}
        onClick={() => toggleSection(`children_${index}`)}
      >
        Trẻ em {index + 1}
        <span className={style.toggle_icon}>
          {sections[`children_${index}`] ? "−" : "+"}
        </span>
      </div>
      <div
        className={`${style.section_content} ${sections[`children_${index}`] ? style.open : ""}`}
      >
        <div className={style.form_group}>
          <div className={style.gender}>
            <label className={style.label}>Giới tính*</label>
            <select
              className={style.input}
              value={passengerData[`children_${index}`].gender}
              onChange={(e) =>
                handleInputChange(`children_${index}`, "gender", e.target.value)
              }
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </div>
          <div className={style.full_name}>
            <label className={style.label}>Họ và tên*</label>
            <input
              type="text"
              className={style.input}
              placeholder="Nhập họ và tên"
              value={passengerData[`children_${index}`].full_name}
              onChange={(e) =>
                handleInputChange(
                  `children_${index}`,
                  "full_name",
                  e.target.value
                )
              }
              required
              pattern="[A-Za-zÀ-ỹ\s]+"
              title="Họ và tên chỉ chứa chữ cái và khoảng trắng"
            />
          </div>
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Ngày sinh*</label>
          <input
            type="date"
            className={style.input}
            min={minChildDate}
            max={maxChildDate}
            value={passengerData[`children_${index}`].date_of_birth}
            onChange={(e) =>
              handleInputChange(
                `children_${index}`,
                "date_of_birth",
                e.target.value
              )
            }
            required
          />
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
        Em bé {index + 1}
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
              className={style.input}
              value={passengerData[`infant_${index}`].gender}
              onChange={(e) =>
                handleInputChange(`infant_${index}`, "gender", e.target.value)
              }
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
            </select>
          </div>
          <div className={style.full_name}>
            <label className={style.label}>Họ và tên*</label>
            <input
              type="text"
              className={style.input}
              placeholder="Nhập họ và tên"
              value={passengerData[`infant_${index}`].full_name}
              onChange={(e) =>
                handleInputChange(
                  `infant_${index}`,
                  "full_name",
                  e.target.value
                )
              }
              required
              pattern="[A-Za-zÀ-ỹ\s]+"
              title="Họ và tên chỉ chứa chữ cái và khoảng trắng"
            />
          </div>
        </div>
        <div className={style.form_group}>
          <label className={style.label}>Ngày sinh*</label>
          <input
            type="date"
            className={style.input}
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
            required
          />
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
        <div className={style.line}></div>
      </div>
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
                  <p>
                    <strong>
                      Tổng tiền: {totalPrice?.toLocaleString()} VND
                    </strong>
                    <button onClick={handleBooking}>Thanh toán</button>
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default Booking;
