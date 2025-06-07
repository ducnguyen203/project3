import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../assets/styles/PassengerService.module.css";
import bookingStyles from "../assets/styles/Booking.module.css";

const PassengerService = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    bookingId,
    maDatVe,
    passengers = { adults: 1, children: 0, infants: 0 },
    tripType,
    departure,
    destination,
    selectedDepartureTicket,
    selectedReturnTicket,
    totalPrice,
    passengerData,
  } = state || {};

  // Kiểm tra dữ liệu đầu vào
  // if (
  //   !bookingId ||
  //   !selectedDepartureTicket ||
  //   (tripType === "round-trip" && !selectedReturnTicket) ||
  //   !passengerData
  // ) {
  //   return (
  //     <div className={styles.error}>
  //       Lỗi: Thiếu thông tin đặt vé. Vui lòng quay lại và thử lại.
  //     </div>
  //   );
  // }

  // Kiểm tra ngày khởi hành
  const today = new Date();
  const departureDate = new Date(selectedDepartureTicket.departure_date);
  if (departureDate < today) {
    return (
      <div className={styles.error}>
        Lỗi: Chuyến bay chiều đi đã qua thời gian khởi hành.
      </div>
    );
  }
  if (tripType === "round-trip" && selectedReturnTicket) {
    const returnDate = new Date(selectedReturnTicket.departure_date);
    if (returnDate < today) {
      return (
        <div className={styles.error}>
          Lỗi: Chuyến bay chiều về đã qua thời gian khởi hành.
        </div>
      );
    }
    if (returnDate < departureDate) {
      return (
        <div className={styles.error}>
          Lỗi: Ngày khởi hành chiều về phải sau chiều đi.
        </div>
      );
    }
  }

  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState("departure");
  const [seatSelections, setSeatSelections] = useState({});
  const [seatMap, setSeatMap] = useState([]);
  const [passengerTicketTypes, setPassengerTicketTypes] = useState({});
  const [error, setError] = useState(null);

  // Lấy loại vé từ price_id
  useEffect(() => {
    const fetchTicketTypes = async () => {
      const types = {};
      const passengerIds = Object.keys(passengerData);
      for (const passengerId of passengerIds) {
        try {
          const priceId = passengerData[passengerId].price_id;
          const response = await fetch(
            `http://localhost:5000/api/flight-prices/ticket-type?price_id=${priceId}`
          );
          if (!response.ok) {
            throw new Error(`Không thể lấy loại vé cho ${passengerId}`);
          }
          const result = await response.json();
          types[passengerId] = result.ticket_type || "Economy";
        } catch (err) {
          console.error(`Lỗi khi lấy loại vé cho ${passengerId}:`, err);
          types[passengerId] = "Economy";
        }
      }
      setPassengerTicketTypes(types);
    };
    fetchTicketTypes();
  }, [passengerData]);

  // Lấy bản đồ ghế
  useEffect(() => {
    const fetchSeatMap = async () => {
      try {
        setError(null);
        const scheduleId =
          selectedFlight === "departure"
            ? selectedDepartureTicket.schedule_id
            : selectedReturnTicket.schedule_id;
        const response = await fetch(
          `http://localhost:5000/api/seats?schedule_id=${scheduleId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Không thể tải bản đồ ghế");
        }
        const { seatMap } = await response.json();
        setSeatMap(seatMap);
      } catch (err) {
        console.error("Lỗi khi lấy bản đồ ghế:", err);
        setError(`Không thể tải bản đồ ghế: ${err.message}`);
      }
    };

    if (isSeatModalOpen) fetchSeatMap();
  }, [
    isSeatModalOpen,
    selectedFlight,
    selectedDepartureTicket,
    selectedReturnTicket,
  ]);

  const handleOpenModal = (passengerId, flightDirection) => {
    setSelectedPassenger(passengerId);
    setSelectedFlight(flightDirection);
    setIsSeatModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSeatModalOpen(false);
    setSelectedPassenger(null);
    setError(null);
  };

  const handleSeatSelect = (seat) => {
    if (
      seat.available &&
      seat.seatType === passengerTicketTypes[selectedPassenger]
    ) {
      setSeatSelections((prev) => ({
        ...prev,
        [selectedPassenger]: {
          ...prev[selectedPassenger],
          [selectedFlight]: seat.seat,
        },
      }));
    }
  };

  const handleConfirmSeat = async () => {
    if (!seatSelections[selectedPassenger]?.[selectedFlight]) {
      setError("Vui lòng chọn một chỗ ngồi trước khi xác nhận.");
      return;
    }

    try {
      setError(null);
      const response = await fetch("http://localhost:5000/api/seats/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          passengerId: selectedPassenger,
          flightDirection: selectedFlight,
          seatNumber: seatSelections[selectedPassenger][selectedFlight],
          scheduleId:
            selectedFlight === "departure"
              ? selectedDepartureTicket.schedule_id
              : selectedReturnTicket.schedule_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể gán ghế");
      }
      alert(
        `Đã chọn chỗ ngồi: ${seatSelections[selectedPassenger][selectedFlight]} cho ${selectedPassenger}`
      );
      handleCloseModal();
    } catch (err) {
      console.error("Lỗi khi gán ghế:", err);
      setError(`Không thể gán ghế: ${err.message}`);
    }
  };

  const handleProceedToPayment = () => {
    const totalPassengers = passengers.adults + passengers.children;
    const requiredSeats =
      tripType === "round-trip" ? totalPassengers * 2 : totalPassengers;
    const assignedSeats = Object.values(seatSelections).reduce(
      (count, selection) => count + Object.keys(selection || {}).length,
      0
    );

    if (assignedSeats < requiredSeats) {
      alert(
        "Vui lòng chọn chỗ ngồi cho tất cả hành khách trước khi thanh toán."
      );
      return;
    }

    navigate("/Payment", {
      state: {
        bookingId,
        maDatVe,
        passengers,
        tripType,
        departure,
        destination,
        selectedDepartureTicket,
        selectedReturnTicket,
        totalPrice,
        seatSelections,
      },
    });
  };

  const renderPassenger = (type, index) => {
    const passengerId = `${type}_${index}`;
    const departureSeat = seatSelections[passengerId]?.departure || "Chưa chọn";
    const returnSeat = seatSelections[passengerId]?.return || "Chưa chọn";

    return (
      <div className={bookingStyles.passenger_section} key={passengerId}>
        <div
          className={bookingStyles.passenger_type}
          onClick={() => handleOpenModal(passengerId, "departure")}
        >
          {type === "adult"
            ? `Người lớn ${index + 1}`
            : type === "child"
              ? `Trẻ em ${index + 1}`
              : `Em bé ${index + 1}`}
        </div>
        <div className={bookingStyles.section_content}>
          <div>
            <p>Chỗ ngồi chiều đi: {departureSeat}</p>
            <button
              onClick={() => handleOpenModal(passengerId, "departure")}
              className={bookingStyles.input}
            >
              Chọn chỗ ngồi chiều đi
            </button>
          </div>
          {tripType === "round-trip" && (
            <div>
              <p>Chỗ ngồi chiều về: {returnSeat}</p>
              <button
                onClick={() => handleOpenModal(passengerId, "return")}
                className={bookingStyles.input}
              >
                Chọn chỗ ngồi chiều về
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className={bookingStyles.text_center}>Dịch vụ hành khách</h2>
      <div className={styles.block_main}>
        <div className={styles.booking_information}>
          {Array.from({ length: passengers.adults }, (_, i) =>
            renderPassenger("adult", i)
          )}
          {Array.from({ length: passengers.children }, (_, i) =>
            renderPassenger("child", i)
          )}
          {Array.from({ length: passengers.infants }, (_, i) =>
            renderPassenger("infant", i)
          )}
        </div>
        {selectedDepartureTicket &&
          (tripType !== "round-trip" || selectedReturnTicket) && (
            <div className={styles.FlightSidebar_filter}>
              <div className={styles.bookingInfo}>
                <div className={styles.title}>
                  <h3>Thông tin đặt chỗ</h3>
                </div>
                <div className={styles.routeInfo}>
                  <p>
                    Chuyến đi: {departure} → {destination}
                  </p>
                  {tripType === "round-trip" && selectedReturnTicket && (
                    <p>
                      Chuyến về: {destination} → {departure}
                    </p>
                  )}
                </div>
                <div className={styles.ticketInfo}>
                  <p>
                    Tổng vé:{" "}
                    {(passengers.adults +
                      passengers.children +
                      passengers.infants) *
                      (tripType === "round-trip" ? 2 : 1)}
                  </p>
                  <p>
                    Chiều đi: {selectedDepartureTicket.price.toLocaleString()}{" "}
                    VND
                  </p>
                  {tripType === "round-trip" && selectedReturnTicket && (
                    <p>
                      Chiều về: {selectedReturnTicket.price.toLocaleString()}{" "}
                      VND
                    </p>
                  )}
                </div>
                <div className={styles.totalAmount}>
                  <p>
                    <strong>
                      Tổng tiền: {totalPrice?.toLocaleString()} VND
                    </strong>
                    <button onClick={handleProceedToPayment}>Thanh toán</button>
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {isSeatModalOpen && (
        <div className={styles.seatModal}>
          <div className={styles.seatModalContent}>
            <div className={styles.modalHeader}>
              <h2>
                Chọn chỗ ngồi cho {selectedPassenger} (
                {selectedFlight === "departure" ? "Chiều đi" : "Chiều về"})
              </h2>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.seatMapContainer}>
              {seatMap.length > 0 && (
                <div className={styles.seatMapHeader}>
                  {seatMap[0].map((seat) => (
                    <div key={seat.seat} className={styles.seatColumnLabel}>
                      {seat.seat.charAt(seat.seat.length - 1)}
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.seatMap}>
                {seatMap.map((row, rowIndex) => (
                  <div key={rowIndex} className={styles.seatRow}>
                    {row.map((seat) => (
                      <button
                        key={seat.seat}
                        className={`${styles.seatButton} ${
                          seatSelections[selectedPassenger]?.[
                            selectedFlight
                          ] === seat.seat
                            ? styles.selectedSeat
                            : ""
                        } ${!seat.available ? styles.unavailableSeat : ""} ${
                          seat.seatType === "First Class"
                            ? styles.firstClassSeat
                            : seat.seatType === "Business"
                              ? styles.businessSeat
                              : styles.economySeat
                        }`}
                        onClick={() => handleSeatSelect(seat)}
                        disabled={!seat.available}
                      >
                        {seat.seat}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={handleConfirmSeat}
                className={styles.confirmButton}
              >
                Xác nhận
              </button>
              <button
                onClick={handleCloseModal}
                className={styles.cancelButton}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PassengerService;
