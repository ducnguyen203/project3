import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../assets/styles/PassengerService.module.css";

const PassengerService = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.selectedDepartureTicket || !state.passengerData) {
    return (
      <div className={styles.error}>
        Lỗi: Thiếu thông tin chuyến bay hoặc dữ liệu hành khách. Vui lòng quay
        lại và chọn lại.
      </div>
    );
  }

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
  } = state;

  const today = new Date();
  const departureDate = new Date(selectedDepartureTicket?.departure_date);
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

  const [currentFlight, setCurrentFlight] = useState("departure");
  const [seatSelections, setSeatSelections] = useState({});
  const [seatMaps, setSeatMaps] = useState({ departure: [], return: [] });
  const [passengerTicketTypes, setPassengerTicketTypes] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showSeatMap, setShowSeatMap] = useState(() => {
    const initialState = {};
    Object.keys(passengerData).forEach((id) => {
      initialState[id] = false;
    });
    console.log(
      "Initialized showSeatMap:",
      JSON.stringify(initialState, null, 2)
    );
    return initialState;
  });

  useEffect(() => {
    const types = {};
    const passengerIds = Object.keys(passengerData || {});
    for (const passengerId of passengerIds) {
      types[passengerId] = {
        departure:
          passengerData[passengerId]?.ticket_type_departure || "Economy",
        return: passengerData[passengerId]?.ticket_type_return || "Economy",
      };
    }
    setPassengerTicketTypes(types);
    console.log("Passenger Ticket Types:", JSON.stringify(types, null, 2));
  }, [passengerData]);

  useEffect(() => {
    const fetchSeatMap = async (scheduleId, flightDirection) => {
      try {
        setLoading(true);
        console.log(
          `Fetching seat map for ${flightDirection} with scheduleId: ${scheduleId}`
        );
        const response = await fetch(
          `http://localhost:5000/api/seats?schedule_id=${scheduleId}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Không thể tải bản đồ ghế cho ${flightDirection}`
          );
        }
        const { seatMap } = await response.json();
        console.log(
          `Seat map for ${flightDirection}:`,
          JSON.stringify(seatMap, null, 2)
        );
        setSeatMaps((prev) => ({ ...prev, [flightDirection]: seatMap }));
      } catch (err) {
        console.error(`Lỗi khi lấy bản đồ ghế cho ${flightDirection}:`, err);
        setError(
          `Không thể tải bản đồ ghế cho ${flightDirection}: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    if (selectedDepartureTicket?.schedule_id) {
      fetchSeatMap(selectedDepartureTicket.schedule_id, "departure");
    } else {
      console.error("Missing schedule_id for departure");
      setError("Thiếu schedule_id cho chuyến đi");
    }
    if (tripType === "round-trip" && selectedReturnTicket?.schedule_id) {
      fetchSeatMap(selectedReturnTicket.schedule_id, "return");
    } else if (tripType === "round-trip") {
      console.error("Missing schedule_id for return");
      setError("Thiếu schedule_id cho chuyến về");
    }
  }, [selectedDepartureTicket, selectedReturnTicket, tripType]);

  useEffect(() => {
    if (currentFlight === "departure" && tripType === "round-trip") {
      const totalPassengers = passengers.adults + passengers.children;
      const assignedDepartureSeats = Object.values(seatSelections).filter(
        (selection) => selection.departure
      ).length;
      if (assignedDepartureSeats >= totalPassengers) {
        setCurrentFlight("return");
        setShowSeatMap((prev) => {
          const resetState = {};
          Object.keys(prev).forEach((id) => {
            resetState[id] = false;
          });
          return resetState;
        });
        console.log("Switching to return flight");
      }
    }
  }, [seatSelections, currentFlight, tripType, passengers]);

  const toggleSeatMap = (passengerId) => {
    setShowSeatMap((prev) => {
      const newState = { ...prev, [passengerId]: !prev[passengerId] };
      console.log("Toggled showSeatMap:", JSON.stringify(newState, null, 2));
      return newState;
    });
  };

  const handleSeatSelect = (passengerId, seat, flightDirection) => {
    const ticketType = passengerTicketTypes[passengerId][flightDirection];

    const isSeatTaken = Object.entries(seatSelections).some(
      ([otherPassengerId, selections]) =>
        otherPassengerId !== passengerId &&
        selections[flightDirection] === seat.seat
    );
    if (isSeatTaken) {
      setError(`Ghế ${seat.seat} đã được chọn bởi hành khách khác.`);
      return;
    }

    if (seat.seatType !== ticketType) {
      setError(`Ghế ${seat.seat} không phù hợp với loại vé ${ticketType}`);
      return;
    }

    if (seat.available) {
      setSeatSelections((prev) => ({
        ...prev,
        [passengerId]: {
          ...prev[passengerId],
          [flightDirection]: seat.seat,
        },
      }));
      setShowSeatMap((prev) => ({ ...prev, [passengerId]: false }));
      setError(null);
    } else {
      setError("Ghế này đã được chọn. Vui lòng chọn ghế khác.");
    }
  };

  const handleProceedToPayment = async () => {
    // Calculate total passengers (for validation)
    const totalPassengers =
      passengers.adults + passengers.children + passengers.infants;
    // Calculate number of passengers requiring seats (for numPassengers)
    const totalSeatPassengers = passengers.adults + passengers.children;
    const requiredSeats =
      tripType === "round-trip" ? totalSeatPassengers * 2 : totalSeatPassengers;

    // Validate seat selections
    const assignedSeats = Object.values(seatSelections).reduce(
      (count, selection) => count + Object.keys(selection || {}).length,
      0
    );
    if (assignedSeats < requiredSeats) {
      alert(
        "Vui lòng chọn chỗ ngồi cho tất cả hành khách (người lớn và trẻ em) trước khi thanh toán."
      );
      return;
    }

  
    if (
      !passengerData ||
      Object.keys(passengerData).length !== totalPassengers
    ) {
      setError(
        `Dữ liệu hành khách không hợp lệ: Thiếu ${totalPassengers - Object.keys(passengerData).length} hành khách`
      );
      return;
    }

    try {
      setLoading(true);

      // Log payload for debugging
      const bookingPayload = {
        userId: 1,
        departureScheduleId: selectedDepartureTicket.schedule_id,
        returnScheduleId: selectedReturnTicket?.schedule_id || null,
        numPassengers: totalSeatPassengers, 
        totalPrice,
        passengers: Object.values(passengerData),
        tripType,
      };
      console.log("Booking Payload:", JSON.stringify(bookingPayload, null, 2));

      const bookingResponse = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        }
      );

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        setError(errorData.message || "Lỗi khi tạo booking");
        return;
      }

      const bookingData = await bookingResponse.json();
      const newBookingId = bookingData.bookingId;

      await handleConfirmSeats("departure", newBookingId);
      if (tripType === "round-trip") {
        await handleConfirmSeats("return", newBookingId);
      }
      alert("Đặt vé thành công!");
      navigate("/Payment", {
        state: {
          bookingId: newBookingId,
          maDatVe: bookingData.maDatVe,
          passengers,
          tripType,
          departure,
          destination,
          selectedDepartureTicket,
          selectedReturnTicket,
          totalPrice,
          passengerData,
          seatSelections,
        },
      });
    } catch (err) {
      console.error("Lỗi khi tạo booking:", err);
      setError(err.message || "Lỗi không xác định khi tạo booking");
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmSeats = async (flightDirection, bookingIdOverride) => {
    const scheduleId =
      flightDirection === "departure"
        ? selectedDepartureTicket.schedule_id
        : selectedReturnTicket.schedule_id;

    for (const [passengerId, selections] of Object.entries(seatSelections)) {
      // Bỏ qua em bé
      if (passengerId.startsWith("infant")) continue;

      const seatNumber = selections[flightDirection];
      if (!seatNumber) continue;
      const fullName = passengerData[passengerId]?.full_name || "Unknown";

      const response = await fetch("http://localhost:5000/api/seats/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingIdOverride,
          passengerId,
          fullName,
          flightDirection,
          seatNumber,
          scheduleId,
          passengerTicketType:
            passengerTicketTypes[passengerId]?.[flightDirection],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể gán ghế");
      }
    }
  };

  const renderPassenger = (type, index) => {
    const passengerId = `${type}_${index}`;
    if (type === "infant") {
      return (
        <div className={styles.passenger_section} key={passengerId}>
          <div className={styles.passenger_type}>Em bé {index + 1}</div>
          <div className={styles.section_content}>
            <p>
              Trẻ sơ sinh không cần chọn ghế vì sẽ ngồi chung với người lớn.
            </p>
          </div>
        </div>
      );
    }

    const ticketType =
      passengerTicketTypes[passengerId]?.[currentFlight] || "Economy";
    const seatMap = seatMaps[currentFlight].filter((row) =>
      row.some((seat) => seat.seatType === ticketType)
    );
    const selectedSeat =
      seatSelections[passengerId]?.[currentFlight] || "Chưa chọn";
    const isSeatMapVisible = showSeatMap[passengerId] || false;
    console.log(
      `Rendering ${passengerId}, isSeatMapVisible: ${isSeatMapVisible}, seatMap:`,
      seatMap
    );

    const isSeatSelected = !!seatSelections[passengerId]?.[currentFlight];

    return (
      <div className={styles.passenger_section} key={passengerId}>
        <div className={styles.passenger_type}>
          {type === "adult" ? `Người lớn ${index + 1}` : `Trẻ em ${index + 1}`}
          <button
            onClick={() => toggleSeatMap(passengerId)}
            className={styles.input}
            disabled={isSeatSelected}
          >
            {isSeatMapVisible
              ? "Ẩn bản đồ ghế"
              : isSeatSelected
                ? "Đã chọn"
                : "Chọn ghế yêu thích"}
          </button>
        </div>
        <div
          className={`${styles.section_content} ${isSeatMapVisible ? styles.active : ""}`}
        >
          <p>
            Chỗ ngồi {currentFlight === "departure" ? "chuyến đi" : "chuyến về"}
            : {selectedSeat}
          </p>
          {isSeatMapVisible && (
            <>
              {loading ? (
                <div className={styles.loading}>Đang tải bản đồ ghế...</div>
              ) : seatMap.length > 0 ? (
                <div className={styles.seatMapContainer}>
                  <div className={styles.seatMapHeader}>
                    {seatMap[0]?.map((seat) => (
                      <div key={seat.seat} className={styles.seatColumnLabel}>
                        {seat.seat.charAt(seat.seat.length - 1)}
                      </div>
                    ))}
                  </div>
                  <div className={styles.seatMap}>
                    {seatMap.map((row, rowIndex) => (
                      <div key={rowIndex} className={styles.seatRow}>
                        <span className={styles.rowLabel}>{rowIndex + 1}</span>
                        {row.map((seat) => (
                          <button
                            key={seat.seat}
                            className={`${styles.seatButton} ${
                              seatSelections[passengerId]?.[currentFlight] ===
                              seat.seat
                                ? styles.selectedSeat
                                : ""
                            } ${
                              !seat.available
                                ? styles.unavailableSeat
                                : seat.seatType !== ticketType
                                  ? styles.invalidSeat
                                  : seat.seatType === "First Class"
                                    ? styles.firstClassSeat
                                    : seat.seatType === "Business"
                                      ? styles.businessSeat
                                      : styles.economySeat
                            }`}
                            onClick={() =>
                              handleSeatSelect(passengerId, seat, currentFlight)
                            }
                            disabled={
                              !seat.available ||
                              loading ||
                              seat.seatType !== ticketType ||
                              Object.entries(seatSelections).some(
                                ([otherPassengerId, selections]) =>
                                  otherPassengerId !== passengerId &&
                                  selections[currentFlight] === seat.seat
                              )
                            }
                            title={`${seat.seat} (${seat.seatType})`}
                          >
                            {seat.seat}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className={styles.seatLegend}>
                    <div className={styles.legendItem}>
                      <span
                        className={`${styles.seatButton} ${styles.economySeat}`}
                      />
                      <span>Economy</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={`${styles.seatButton} ${styles.businessSeat}`}
                      />
                      <span>Business</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={`${styles.seatButton} ${styles.firstClassSeat}`}
                      />
                      <span>First Class</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={`${styles.seatButton} ${styles.selectedSeat}`}
                      />
                      <span>Đã chọn</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span
                        className={`${styles.seatButton} ${styles.unavailableSeat}`}
                      />
                      <span>Không khả dụng</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.error}>
                  Không có ghế nào khả dụng cho loại vé {ticketType}
                </div>
              )}
              {error && <div className={styles.error}>{error}</div>}
            </>
          )}
        </div>
      </div>
    );
  };

  const getPassengerName = (passengerId) => {
    const [type, index] = passengerId.split("_");
    const number = parseInt(index) + 1;
    switch (type) {
      case "adult":
        return `Người lớn ${number}`;
      case "child":
        return `Trẻ em ${number}`;
      case "infant":
        return `Em bé ${number}`;
      default:
        return passengerId;
    }
  };

  return (
    <>
      <h2 className={styles.text_center}>Dịch vụ hành khách</h2>
      <div className={styles.block_main}>
        <div className={styles.booking_information}>
          <h3>
            Chọn ghế cho{" "}
            {currentFlight === "departure" ? "chuyến đi" : "chuyến về"}
          </h3>
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
                    <strong>Tóm tắt vé</strong>
                  </p>
                  {passengers.adults > 0 && (
                    <p>{passengers.adults} x Người lớn</p>
                  )}
                  {passengers.children > 0 && (
                    <p>{passengers.children} x Trẻ em</p>
                  )}
                  {passengers.infants > 0 && (
                    <p>{passengers.infants} x Em bé</p>
                  )}
                  {selectedDepartureTicket && (
                    <p>
                      Chiều đi:{" "}
                      {(
                        selectedDepartureTicket.price *
                          (passengers.adults + passengers.children) +
                        passengers.infants * 100000
                      ).toLocaleString("vi-VN")}{" "}
                      VND
                    </p>
                  )}
                  {tripType === "round-trip" && selectedReturnTicket && (
                    <p>
                      Chiều về:{" "}
                      {(
                        selectedReturnTicket.price *
                          (passengers.adults + passengers.children) +
                        passengers.infants * 100000
                      ).toLocaleString("vi-VN")}{" "}
                      VND
                    </p>
                  )}
                  <div className={styles.seatInfo}>
                    <p>Chỗ ngồi đã chọn:</p>
                    {Object.entries(seatSelections).length > 0 ? (
                      Object.entries(seatSelections).map(
                        ([passengerId, seats]) => (
                          <p key={passengerId}>
                            {getPassengerName(passengerId)}:{" "}
                            {seats.departure
                              ? `Chiều đi: ${seats.departure}`
                              : "Chưa chọn chiều đi"}
                            {tripType === "round-trip" &&
                              (seats.return
                                ? `, Chiều về: ${seats.return}`
                                : ", Chưa chọn chiều về")}
                          </p>
                        )
                      )
                    ) : (
                      <p>Chưa có chỗ ngồi nào được chọn.</p>
                    )}
                  </div>
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
    </>
  );
};

export default PassengerService;
