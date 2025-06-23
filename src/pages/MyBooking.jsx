import React, { useState } from "react";
import styles from "../assets/styles/MyBooking.module.css";
import logo from "../assets/img/logo.png";

const FlightLeg = ({
  date,
  fromCode,
  fromTime,
  toCode,
  toTime,
  duration,
  passengers,
  price,
}) => (
  <div className={styles.flightLeg}>
    <div className={styles.flightDate}>{date}</div>
    <div className={styles.flightFrom}>
      <div className={styles.airportCode}>{fromCode}</div>
      <div className={styles.time}>{fromTime}</div>
    </div>
    <div className={styles.flightDuration}>
      <div>{duration}</div>
      <div className={styles.arrow}>→</div>
      <div className={styles.detail}>Bay thẳng | Chi tiết ▼</div>
    </div>
    <div className={styles.flightTo}>
      <div className={styles.airportCode}>{toCode}</div>
      <div className={styles.time}>{toTime}</div>
    </div>
    <div className={styles.verticalLine}></div>
    <div className={styles.flightPrice}>
      <img src={logo} className={styles.logoImg} alt="Logo" />
      <div className={styles.textPassenger}>{passengers} hành khách</div>
      <div className={styles.price}>{price} VND</div>
    </div>
  </div>
);

const SectionToggle = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.sectionToggle}>
      <button className={styles.toggleBtn} onClick={() => setOpen(!open)}>
        {title} {open ? "▲" : "▼"}
      </button>
      {open && <div className={styles.toggleContent}>{children}</div>}
    </div>
  );
};

const CustomerInfo = ({ tickets }) => {
  const grouped = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.full_name]) acc[ticket.full_name] = [];
    acc[ticket.full_name].push(ticket);
    return acc;
  }, {});

  return (
    <div className={styles.customerInfo}>
      <div className={styles.passengerSummaries}>
        {Object.entries(grouped).map(([name, groupedTickets], index) => {
          const passengerType =
            groupedTickets[0].passenger_type === "Adult"
              ? "Người lớn"
              : groupedTickets[0].passenger_type === "Child"
                ? "Trẻ em"
                : "Em bé";

          return (
            <div key={index} className={styles.summary}>
              <h4>
                {passengerType}: {name}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {groupedTickets.map((ticket, idx) => {
                  const isReturn = ticket.flight_direction === "return";
                  const direction = isReturn ? "HAN → SGN" : "SGN → HAN";
                  return (
                    <div key={idx}>
                      <b>{direction}</b> <br />
                      Hành lý ký gửi: {ticket.baggage_allowance} <br />
                      Chỗ ngồi: {ticket.seat_number || "Chưa gán"} <br />
                      Special change: {ticket.special_change || "None"}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PriceDetails = ({ bookingDetails }) => (
  <div className={styles.priceDetails}>
    <SectionToggle title="Chi tiết giá vé" defaultOpen>
      <div className={styles.priceSummaries}>
        <div className={styles.summary}>
          <h4 className={styles.priceTitle}>Chiều đi SGN → HAN</h4>
          {bookingDetails.tickets.map((ticket, index) => (
            <div key={index}>
              Giá vé {ticket.full_name}:{" "}
              {(
                bookingDetails.total_price /
                (2 * bookingDetails.tickets.length)
              ).toLocaleString("vi-VN")}{" "}
              VND
            </div>
          ))}
        </div>
        {bookingDetails.return_flight && (
          <div className={styles.summary}>
            <h4 className={styles.priceTitle}>Chiều về HAN → SGN</h4>
            {bookingDetails.tickets.map((ticket, index) => (
              <div key={index}>
                Giá vé {ticket.full_name}:{" "}
                {(
                  bookingDetails.total_price /
                  (2 * bookingDetails.tickets.length)
                ).toLocaleString("vi-VN")}{" "}
                VND
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionToggle>
  </div>
);

const MyBooking = () => {
  const [bookingCode, setBookingCode] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!bookingCode.trim()) {
      setError("Vui lòng nhập mã đặt vé");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingCode}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không tìm thấy đặt vé");
      }
      const data = await response.json();
      setBookingDetails(data.bookingDetails);
      console.log(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tìm kiếm đặt vé");
      setBookingDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Tra cứu đặt vé</h2>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={bookingCode}
          onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
          placeholder="Nhập mã đặt vé (VD: BKXXXXXX)"
          className={styles.input}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={styles.button}
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {bookingDetails && (
        <div>
          <section className={styles.legs}>
            <div className={styles.directionLabel}>✈️ Chiều đi</div>
            <FlightLeg
              date={new Date(
                bookingDetails.departure_flight.departure_date
              ).toLocaleDateString("vi-VN", {
                weekday: "short",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              fromCode={bookingDetails.departure_flight.departure_airport.code}
              fromTime={bookingDetails.departure_flight.departure_time}
              toCode={bookingDetails.departure_flight.arrival_airport.code}
              toTime={bookingDetails.departure_flight.arrival_time}
              duration="2 giờ 10 phút"
              passengers={bookingDetails.tickets.length}
              price={(bookingDetails.total_price / 2).toLocaleString("vi-VN")}
            />
            {bookingDetails.return_flight && (
              <>
                <div className={styles.directionLabel}>🔁 Chiều về</div>
                <FlightLeg
                  date={new Date(
                    bookingDetails.return_flight.departure_date
                  ).toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  fromCode={bookingDetails.return_flight.departure_airport.code}
                  fromTime={bookingDetails.return_flight.departure_time}
                  toCode={bookingDetails.return_flight.arrival_airport.code}
                  toTime={bookingDetails.return_flight.arrival_time}
                  duration="2 giờ 10 phút"
                  passengers={bookingDetails.tickets.length}
                  price={(bookingDetails.total_price / 2).toLocaleString(
                    "vi-VN"
                  )}
                />
              </>
            )}
          </section>

          <SectionToggle title="Thông tin hành khách" defaultOpen>
            <CustomerInfo tickets={bookingDetails.tickets} />
          </SectionToggle>

          <PriceDetails bookingDetails={bookingDetails} />
        </div>
      )}
    </div>
  );
};

export default MyBooking;
