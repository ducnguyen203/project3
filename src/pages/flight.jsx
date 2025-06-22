import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCalendarAlt,
  FaUser,
  FaChevronDown,
} from "react-icons/fa";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import style from "../assets/styles/Flight.module.css";
import FlightCalendar from "../components/FlightCalendar";
import dayjs from "dayjs";

const Flight = () => {
  const [tripType, setTripType] = useState("round-trip");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(dayjs().toDate());
  const [returnDate, setReturnDate] = useState(null);
  const [passengers, setPassengers] = useState(() => {
    const storedPassengers = localStorage.getItem("passengers");
    return storedPassengers
      ? JSON.parse(storedPassengers)
      : { adults: 1, children: 0, infants: 0 };
  });
  const [airports, setAirports] = useState([]);
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRefDeparture = useRef(null);
  const inputRefDestination = useRef(null);
  const [flightResults, setFlightResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [shouldAutoSearch, setShouldAutoSearch] = useState(true);
  const [selectedDepartureTicket, setSelectedDepartureTicket] = useState(null);
  const [selectedReturnTicket, setSelectedReturnTicket] = useState(null);
  const [currentDeparturePage, setCurrentDeparturePage] = useState(1);
  const [currentReturnPage, setCurrentReturnPage] = useState(1);
  const flightsPerPage = 5;
  const isFlightPage = true;
  const navigate = useNavigate();

  const calculateTotalPrice = () => {
    const totalPassengers =
      passengers.adults + passengers.children + passengers.infants;
    let total = 0;
    if (selectedDepartureTicket) {
      total += selectedDepartureTicket.price * totalPassengers;
    }
    if (tripType === "round-trip" && selectedReturnTicket) {
      total += selectedReturnTicket.price * totalPassengers;
    }
    return total;
  };

  useEffect(() => {
    const storedParams = localStorage.getItem("flightSearchParams");
    if (storedParams) {
      const parsedParams = JSON.parse(storedParams);
      if (
        parsedParams.departure &&
        parsedParams.destination &&
        parsedParams.departureDate
      ) {
        setTripType(parsedParams.tripType);
        setDeparture(parsedParams.departure);
        setDestination(parsedParams.destination);
        setDepartureDate(new Date(parsedParams.departureDate));
        setReturnDate(
          parsedParams.returnDate ? new Date(parsedParams.returnDate) : null
        );
        setPassengers(parsedParams.passengers);
        setShouldAutoSearch(true);
      } else {
        alert("Vui lòng nhập đầy đủ thông tin.");
      }
    } else {
      alert("Không có thông tin tìm kiếm.");
    }
  }, []);

  useEffect(() => {
    if (
      shouldAutoSearch &&
      departure &&
      destination &&
      departureDate &&
      (tripType === "one-way" || (tripType === "round-trip" && returnDate))
    ) {
      handleSearchFlights();
      setShouldAutoSearch(false);
    }
  }, [
    shouldAutoSearch,
    tripType,
    departure,
    destination,
    departureDate,
    returnDate,
  ]);

  const handleSearchFlights = async () => {
    if (!departure || !destination || !departureDate) {
      alert("Vui lòng nhập đầy đủ thông tin điểm đi, điểm đến và ngày đi.");
      return;
    }
    if (tripType === "round-trip" && !returnDate) {
      alert("Vui lòng nhập ngày về.");
      return;
    }

    localStorage.setItem(
      "flightSearchParams",
      JSON.stringify({
        tripType,
        departure,
        destination,
        departureDate,
        returnDate,
        passengers,
      })
    );
    setFlightResults({});
    setIsSearched(false);
    setCurrentDeparturePage(1);
    setCurrentReturnPage(1);
    const departureCode = departure.split("(")[1]?.replace(")", "");
    const destinationCode = destination.split("(")[1]?.replace(")", "");
    const formattedDepartureDate = dayjs(departureDate).format("YYYY-MM-DD");
    const formattedReturnDate =
      returnDate && tripType === "round-trip"
        ? dayjs(returnDate).format("YYYY-MM-DD")
        : null;

    let url = `http://localhost:5000/api/flights/search?departure=${departureCode}&destination=${destinationCode}&departureDate=${formattedDepartureDate}`;
    if (tripType === "round-trip" && formattedReturnDate) {
      url += `&returnDate=${formattedReturnDate}&tripType=round-trip`;
    } else {
      url += `&tripType=one-way`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Không thể tìm kiếm chuyến bay.");
      }
      const data = await response.json();
      setFlightResults(data);
      setIsSearched(true);
      console.log("Gửi request tới:", url);
    } catch (error) {
      console.error("Lỗi khi tìm chuyến bay:", error);
      setIsSearched(true);
    }
  };

  const normalizeString = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "");
  };

  useEffect(() => {
    const fetchAirports = async () => {
      const response = await fetch("http://localhost:5000/api/airports");
      const data = await response.json();
      setAirports(data);
      setFilteredAirports(data);
    };
    fetchAirports();
  }, []);

  const handleDepartureFocus = () => {
    setFilteredAirports(
      airports.filter(
        (airport) =>
          airport.airport_code !== destination.split("(")[1]?.replace(")", "")
      )
    );
    setActiveInput("departure");
  };

  const handleDepartureChange = (e) => {
    const value = e.target.value;
    setDeparture(value);
    const normalizedValue = normalizeString(value);
    setFilteredAirports(
      airports
        .filter(
          (airport) =>
            airport.airport_code !== destination.split("(")[1]?.replace(")", "")
        )
        .filter((airport) => {
          const normalizedAirportName = normalizeString(airport.airport_name);
          const normalizeAirportCode = normalizeString(airport.airport_code);
          const normalizeAirportCity = normalizeString(airport.city);
          return (
            normalizedAirportName.includes(normalizedValue) ||
            normalizeAirportCode.includes(normalizedValue) ||
            normalizeAirportCity.includes(normalizedValue)
          );
        })
    );
  };

  const handleDestinationFocus = () => {
    setFilteredAirports(
      airports.filter(
        (airport) =>
          airport.airport_code !== departure.split("(")[1]?.replace(")", "")
      )
    );
    setActiveInput("destination");
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    const normalizedValue = normalizeString(value);
    setFilteredAirports(
      airports
        .filter(
          (airport) =>
            airport.airport_code !== departure.split("(")[1]?.replace(")", "")
        )
        .filter((airport) => {
          const normalizedAirportName = normalizeString(airport.airport_name);
          const normalizeAirportCode = normalizeString(airport.airport_code);
          const normalizeAirportCity = normalizeString(airport.city);
          return (
            normalizedAirportName.includes(normalizedValue) ||
            normalizeAirportCode.includes(normalizedValue) ||
            normalizeAirportCity.includes(normalizedValue)
          );
        })
    );
  };

  const handleAirportSelect = (airport) => {
    if (activeInput === "departure") {
      setDeparture(`${airport.city} (${airport.airport_code})`);
    } else {
      setDestination(`${airport.city} (${airport.airport_code})`);
    }
    setActiveInput(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRefDeparture.current &&
        !inputRefDeparture.current.contains(event.target) &&
        inputRefDestination.current &&
        !inputRefDestination.current.contains(event.target)
      ) {
        setActiveInput(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDepartureDateChange = (newDate) => {
    setDepartureDate(newDate);
    setShouldAutoSearch(true);
  };

  const handleReturnDateChange = (newDate) => {
    setReturnDate(newDate);
    setShouldAutoSearch(true);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("flightSearchParams");
      localStorage.removeItem("passengers");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Logic phân trang cho chuyến đi
  const indexOfLastDepartureFlight = currentDeparturePage * flightsPerPage;
  const indexOfFirstDepartureFlight =
    indexOfLastDepartureFlight - flightsPerPage;
  const currentDepartureFlights = flightResults?.departureFlights?.slice(
    indexOfFirstDepartureFlight,
    indexOfLastDepartureFlight
  );
  const totalDeparturePages = Math.ceil(
    (flightResults?.departureFlights?.length || 0) / flightsPerPage
  );

  // Logic phân trang cho chuyến về
  const indexOfLastReturnFlight = currentReturnPage * flightsPerPage;
  const indexOfFirstReturnFlight = indexOfLastReturnFlight - flightsPerPage;
  const currentReturnFlights = flightResults?.returnFlights?.slice(
    indexOfFirstReturnFlight,
    indexOfLastReturnFlight
  );
  const totalReturnPages = Math.ceil(
    (flightResults?.returnFlights?.length || 0) / flightsPerPage
  );

  const paginateDeparture = (pageNumber) => setCurrentDeparturePage(pageNumber);
  const paginateReturn = (pageNumber) => setCurrentReturnPage(pageNumber);

  // Hàm tạo danh sách nút phân trang
  const getPaginationButtons = (currentPage, totalPages, paginate) => {
    const maxButtons = 5;
    const buttons = [];
    const halfMaxButtons = Math.floor(maxButtons / 2);

    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        className={style.paginationButton}
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          className={`${style.paginationButton} ${
            currentPage === 1 ? style.active : ""
          }`}
          onClick={() => paginate(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className={style.ellipsis}>
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`${style.paginationButton} ${
            currentPage === i ? style.active : ""
          }`}
          onClick={() => paginate(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className={style.ellipsis}>
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          className={`${style.paginationButton} ${
            currentPage === totalPages ? style.active : ""
          }`}
          onClick={() => paginate(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        className={style.paginationButton}
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    );

    return buttons;
  };

  // Component SVG cho thông báo không có chuyến bay
  const NoFlightSVG = () => (
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      fill="none"
      className={style.noFlightImage}
    >
      <rect width="400" height="300" fill="#f8f9fa" />
      <path
        d="M120 180c-20 0-36-16-36-36s16-36 36-36c4 0 8 1 12 2 12-18 32-30 56-30 36 0 64 24 72 56 20 4 36 20 36 40s-16 36-36 36H120z"
        fill="#e9ecef"
      />
      <path
        d="M200 120l40 20-20 40h-40l20-40zm0 0l-40 20 20 40h40l-20-40z"
        fill="#6c757d"
      />
      <path
        d="M160 100l80 80m0-80l-80 80"
        stroke="#dc3545"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <text
        x="200"
        y="240"
        fontFamily="OpenSans-Regular, sans-serif"
        fontSize="24"
        fill="#343a40"
        textAnchor="middle"
      >
        Không Tìm Thấy Chuyến Bay
      </text>
    </svg>
  );
  const handleContinue = () => {
    if (
      !selectedDepartureTicket ||
      (tripType === "round-trip" && !selectedReturnTicket)
    ) {
      alert("Vui lòng chọn vé cho cả chiều đi và chiều về (nếu là khứ hồi).");
      return;
    }

    navigate("/booking", {
      state: {
        passengers,
        tripType,
        departure,
        destination,
        selectedDepartureTicket,
        selectedReturnTicket,
        totalPrice: calculateTotalPrice(),
      },
    });
  };

  return (
    <>
      <h2 className={style.text_center}>Welcome Flights Booking</h2>
      <div className={style.FlightSearch}>
        <div className={style.tripType}>
          <label className={style.radiobutton}>
            <input
              type="radio"
              value="round-trip"
              checked={tripType === "round-trip"}
              onChange={() => setTripType("round-trip")}
            />
            Khứ hồi
          </label>
          <label className={[style.radiobutton, style.radio2].join(" ")}>
            <input
              type="radio"
              value="one-way"
              checked={tripType === "one-way"}
              onChange={() => setTripType("one-way")}
            />
            Một chiều
          </label>
          <div className={style.passengers}>
            <button className={style.passengersTotal} onClick={toggleDropdown}>
              <FaUser />
              <div className={style.quantityPassenger}>
                {passengers.adults + passengers.children + passengers.infants}
              </div>
              <FaChevronDown />
            </button>
            <div
              className={`${style.dropdown} ${
                isDropdownOpen ? style.show : ""
              }`}
            >
              <div className={style.borderPassenger}>
                <div className={style.Input_input_group}>
                  <div className={style.inputquanty}>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={passengers.adults}
                      onChange={(e) =>
                        setPassengers({
                          ...passengers,
                          adults: parseInt(e.target.value) || 1,
                        })
                      }
                      placeholder="Người lớn"
                    />
                    <label className={style.sm}>Người lớn</label>
                  </div>
                  <div className={style.inputquanty}>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={passengers.children}
                      onChange={(e) =>
                        setPassengers({
                          ...passengers,
                          children: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Trẻ em"
                    />
                    <label className={style.sm}>Trẻ em</label>
                  </div>
                  <div className={style.inputquanty}>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={passengers.infants}
                      onChange={(e) =>
                        setPassengers({
                          ...passengers,
                          infants: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Em bé"
                    />
                    <label className={style.sm}>Em bé</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style.Maininput}>
          <div className={style.Block}>
            <div className={style.inputGroup} ref={inputRefDeparture}>
              <FaPlaneDeparture />
              <input
                type="text"
                placeholder="Vui lòng nhập điểm đi"
                value={departure}
                onFocus={handleDepartureFocus}
                onChange={handleDepartureChange}
                ref={inputRefDeparture}
              />
              <label className={style.sm}>Điểm đi</label>
              {activeInput === "departure" && filteredAirports.length > 0 && (
                <div className={style.dropdownAirport}>
                  <ul className={style.suggestionListAirport}>
                    {filteredAirports.map((airport) => (
                      <li
                        key={airport.airport_id}
                        onClick={() => handleAirportSelect(airport)}
                        className={style.suggestionItemAirport}
                      >
                        {airport.airport_name} ({airport.airport_code}),{" "}
                        {airport.city}, {airport.country}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className={style.inputGroup} ref={inputRefDestination}>
              <FaPlaneArrival />
              <input
                type="text"
                placeholder="Vui lòng nhập điểm đến"
                value={destination}
                onFocus={handleDestinationFocus}
                onChange={handleDestinationChange}
                ref={inputRefDestination}
              />
              <label className={style.sm}>Điểm đến</label>
              {activeInput === "destination" && filteredAirports.length > 0 && (
                <div className={style.dropdownAirport}>
                  <ul className={style.suggestionListAirport}>
                    {filteredAirports.map((airport) => (
                      <li
                        key={airport.airport_id}
                        onClick={() => handleAirportSelect(airport)}
                        className={style.suggestionItemAirport}
                      >
                        {airport.airport_name} ({airport.airport_code}),{" "}
                        {airport.city}, {airport.country}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className={style.Block}>
            <div className={style.inputGroup}>
              <FaCalendarAlt className={style.icondate} />
              <DatePicker
                selected={departureDate}
                onChange={(date) => setDepartureDate(date)}
                placeholderText="Chọn ngày đi"
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
              />
              <label className={style.sm}>Ngày đi</label>
            </div>
            {tripType === "round-trip" && (
              <div className={style.inputGroup}>
                <FaCalendarAlt className={style.icondate} />
                <DatePicker
                  selected={returnDate}
                  onChange={setReturnDate}
                  placeholderText="Chọn ngày về"
                  minDate={departureDate || new Date()}
                  dateFormat="dd/MM/yyyy"
                />
                <label className={style.sm}>Ngày về</label>
              </div>
            )}
          </div>
          <div className={style.inputGroup}>
            <button
              className={style.searchButton}
              onClick={handleSearchFlights}
            >
              Tìm Kiếm
            </button>
          </div>
        </div>
      </div>
      <div className={style.stepper}>
        <div className={style.step}>
          <div
            className={`${style.circle} ${style.active} ${isFlightPage ? style.hoverable : ""}`}
          ></div>
          <div className={style.stepTitle}>Chọn chuyến bay</div>
          <div className={style.stepDesc}>Vui lòng chọn chuyến bay</div>
        </div>
        <div className={style.step}>
          <div className={style.circle}></div>
          <div className={style.stepTitle}>Đặt chỗ</div>
          <div className={style.stepDesc}>Điền thông tin để đặt chỗ</div>
        </div>
        <div className={style.step}>
          <div className={style.circle}></div>
          <div className={style.stepTitle}>Thanh toán</div>
          <div className={style.stepDesc}>Thanh toán đề nhận vé máy bay</div>
        </div>
        <div className={style.line}></div>
      </div>
      <div className={style.FlightList}>
        <div className={style.mainBlockContent}>
          <div className={style.FlightSearch_flight_content}>
            <div className={style.flightSearchTitle}>
              <div className={style.logo}>
                <div>
                  <img src={logo} className={style.logoImg} alt="Logo" />
                </div>
              </div>
              <div className={style.blockInformation}>
                <div>
                  <label>{departure || "undefined"}</label>
                  <label>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </label>
                  <label>{destination || "undefined"}</label>
                </div>
                <p>
                  {departureDate &&
                    departureDate.toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                </p>
              </div>
            </div>
            <div className={style.flightDetails}>
              <FlightCalendar
                departureDate={departureDate}
                onDateChange={handleDepartureDateChange}
              />
            </div>
            {currentDepartureFlights?.length > 0 ? (
              <>
                {(selectedDepartureTicket
                  ? [
                      flightResults.departureFlights.find(
                        (flight) =>
                          flight.id === selectedDepartureTicket.flight_id
                      ),
                    ]
                  : currentDepartureFlights
                ).map((flights) => (
                  <div
                    key={flights.id}
                    className={`${style.content_Flight} ${
                      selectedDepartureTicket &&
                      selectedDepartureTicket.flight_id === flights.id &&
                      flights.prices.some(
                        (price) =>
                          price.ticket_type ===
                          selectedDepartureTicket.ticket_type
                      )
                        ? style.selectedFlightCard
                        : ""
                    }`}
                  >
                    <div className={style.flightDetails}>
                      <div className={style.schedule}>
                        <div className={style.time}>
                          {flights.departure_time}
                        </div>
                        <div className={style.airport}>
                          {flights.departure_airport_code}
                        </div>
                      </div>
                      <div className={style.flightIcon}>
                        <div>✈</div>
                        <div>Bay thẳng</div>
                      </div>
                      <div className={style.flightInfo}>
                        <div className={style.time}>{flights.arrival_time}</div>
                        <div className={style.airport}>
                          {flights.arrival_airport_code}
                        </div>
                      </div>
                      <div className={style.details}>
                        <p>Thời gian bay: {flights.duration}</p>
                        <p>Ngày Bay: {flights.departure_date}</p>
                        <p>
                          <a href="#details" className={style.detailsLink}>
                            Chi tiết hành trình
                          </a>
                        </p>
                      </div>
                    </div>
                    <div className={style.ticketPrices}>
                      {(flights.prices || []).map((prices) => (
                        <div
                          key={prices.ticket_type_id}
                          className={`${style.priceCard} ${
                            selectedDepartureTicket &&
                            selectedDepartureTicket.flight_id === flights.id &&
                            selectedDepartureTicket.ticket_type ===
                              prices.ticket_type
                              ? style.selectedPriceCard
                              : ""
                          }`}
                          onClick={() => {
                            const isSameTicket =
                              selectedDepartureTicket &&
                              selectedDepartureTicket.flight_id ===
                                flights.id &&
                              selectedDepartureTicket.ticket_type ===
                                prices.ticket_type;

                            setSelectedDepartureTicket(
                              isSameTicket
                                ? null
                                : {
                                    ...prices,
                                    price_id: prices.price_id,
                                    schedule_id: flights.schedule_id,
                                    flight_id: flights.id,
                                    departure_time: flights.departure_time,
                                    arrival_time: flights.arrival_time,
                                    departure_date: flights.departure_date,
                                  }
                            );
                            console.log("Selected Departure Ticket:", {
                              ...prices,
                              price_id: prices.price_id,
                              schedule_id: flights.schedule_id,
                              flight_id: flights.id,
                              departure_time: flights.departure_time,
                              arrival_time: flights.arrival_time,
                              departure_date: flights.departure_date,
                            });
                          }}
                        >
                          <div className={style.priceType}>
                            {prices.ticket_type}
                          </div>
                          <div className={style.price}>
                            Từ {prices.price} VNĐ
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!selectedDepartureTicket && (
                  <div className={style.pagination}>
                    {getPaginationButtons(
                      currentDeparturePage,
                      totalDeparturePages,
                      paginateDeparture
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className={style.noFlight}>
                <NoFlightSVG />
              </div>
            )}
          </div>

          {tripType === "round-trip" && returnDate && (
            <div className={style.FlightSearch_flight_content}>
              <div className={style.flightSearchTitle}>
                <div className={style.logo}>
                  <div>
                    <img src={logo} className={style.logoImg} alt="Logo" />
                  </div>
                </div>
                <div className={style.blockInformation}>
                  <div>
                    <label>{destination || "undefined"}</label>
                    <label>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </label>
                    <label>{departure || "undefined"}</label>
                  </div>
                  <p>
                    {returnDate &&
                      returnDate.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                  </p>
                </div>
              </div>
              <div className={style.flightDetails}>
                <FlightCalendar
                  departureDate={returnDate}
                  onDateChange={handleReturnDateChange}
                />
              </div>
              {currentReturnFlights?.length > 0 ? (
                <>
                  {(selectedReturnTicket
                    ? [
                        flightResults.returnFlights.find(
                          (flight) =>
                            flight.id === selectedReturnTicket.flight_id
                        ),
                      ]
                    : currentReturnFlights
                  ).map((flights) => (
                    <div
                      key={flights.id}
                      className={`${style.content_Flight} ${
                        selectedReturnTicket &&
                        selectedReturnTicket.flight_id === flights.id &&
                        flights.prices.some(
                          (price) =>
                            price.ticket_type ===
                            selectedReturnTicket.ticket_type
                        )
                          ? style.selectedFlightCard
                          : ""
                      }`}
                    >
                      <div className={style.flightDetails}>
                        <div className={style.schedule}>
                          <div className={style.time}>
                            {flights.departure_time}
                          </div>
                          <div className={style.airport}>
                            {flights.departure_airport_code}
                          </div>
                        </div>
                        <div className={style.flightIcon}>
                          <div>✈</div>
                          <div>Bay thẳng</div>
                        </div>
                        <div className={style.flightInfo}>
                          <div className={style.time}>
                            {flights.arrival_time}
                          </div>
                          <div className={style.airport}>
                            {flights.arrival_airport_code}
                          </div>
                        </div>
                        <div className={style.details}>
                          <p>Thời gian bay: {flights.duration}</p>
                          <p>Ngày Bay: {flights.departure_date}</p>
                          <p>
                            <a href="#details" className={style.detailsLink}>
                              Chi tiết hành trình
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className={style.ticketPrices}>
                        {(flights.prices || []).map((prices) => (
                          <div
                            key={prices.ticket_type_id}
                            className={`${style.priceCard} ${
                              selectedReturnTicket &&
                              selectedReturnTicket.flight_id === flights.id &&
                              selectedReturnTicket.ticket_type ===
                                prices.ticket_type
                                ? style.selectedPriceCard
                                : ""
                            }`}
                            onClick={() => {
                              const isSameTicket =
                                selectedReturnTicket &&
                                selectedReturnTicket.flight_id === flights.id &&
                                selectedReturnTicket.ticket_type ===
                                  prices.ticket_type;

                              setSelectedReturnTicket(
                                isSameTicket
                                  ? null
                                  : {
                                      ...prices,

                                      price_id: prices.price_id,
                                      schedule_id: flights.schedule_id,
                                      flight_id: flights.id,
                                      departure_time: flights.departure_time,
                                      arrival_time: flights.arrival_time,
                                      departure_date: flights.departure_date,
                                    }
                              );
                            }}
                          >
                            <div className={style.priceType}>
                              {prices.ticket_type}
                            </div>
                            <div className={style.price}>
                              Từ {prices.price} VNĐ
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!selectedReturnTicket && (
                    <div className={style.pagination}>
                      {getPaginationButtons(
                        currentReturnPage,
                        totalReturnPages,
                        paginateReturn
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className={style.noFlight}>
                  <NoFlightSVG />
                </div>
              )}
            </div>
          )}
        </div>
        {(selectedDepartureTicket || selectedReturnTicket) && (
          <div className={style.FlightSidebar_filter}>
            <div className={style.bookingInfo}>
              <div className={style.title}>
                <h3>Thông tin đặt chỗ</h3>
              </div>
              <div className={style.routeInfo}>
                {selectedDepartureTicket && (
                  <p>
                    {departure} → {destination}
                  </p>
                )}
                {tripType === "round-trip" && selectedReturnTicket && (
                  <p>
                    {destination} → {departure}
                  </p>
                )}
              </div>
              <div className={style.ticketInfo}>
                <p>
                  Tổng vé:{" "}
                  {passengers.adults + passengers.children + passengers.infants}
                </p>
                {selectedDepartureTicket && (
                  <p>
                    Chiều đi:{" "}
                    {(
                      selectedDepartureTicket.price *
                      (passengers.adults +
                        passengers.children +
                        passengers.infants)
                    ).toLocaleString()}{" "}
                    VND
                  </p>
                )}
                {tripType === "round-trip" && selectedReturnTicket && (
                  <p>
                    Chiều về:{" "}
                    {(
                      selectedReturnTicket.price *
                      (passengers.adults +
                        passengers.children +
                        passengers.infants)
                    ).toLocaleString()}{" "}
                    VND
                  </p>
                )}
              </div>
              <div className={style.totalAmount}>
                <p>
                  <strong>
                    Tổng tiền: {calculateTotalPrice().toLocaleString()} VND
                  </strong>
                  <button onClick={handleContinue}>Đi tiếp</button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Flight;
