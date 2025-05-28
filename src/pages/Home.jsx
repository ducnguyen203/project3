import { useState, useEffect, useRef } from "react";
import styles from "../assets/styles/Home.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import background from "../assets/img/background.png";
import {
  FaPlaneDeparture,
  FaPlaneArrival,
  FaUser,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";

const Home = () => {
  const [tripType, setTripType] = useState("round-trip");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  // const [passengers, setPassengers] = useState({
  //   adults: 1,
  //   children: 0,
  //   infants: 0,
  // });
  const [passengers, setPassengers] = useState(() => {
    const storedPassengers = localStorage.getItem("passengers");
    return storedPassengers
      ? JSON.parse(storedPassengers)
      : { adults: 1, children: 0, infants: 0 };
  });

  const [airports, setAirports] = useState([]);
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const inputRefDeparture = useRef(null);
  const inputRefDestination = useRef(null);

  const normalizeString = (str) => {
    return str
      .normalize("NFD") // Tách dấu khỏi ký tự
      .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
      .toLowerCase() // Chuyển thành chữ thường
      .replace(/\s+/g, ""); // Xóa khoảng trắng thừa
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

  const handleSearch = () => {
    // Kiểm tra các trường bắt buộc
    if (!departure || !destination || !departureDate) {
      alert("Vui lòng nhập đầy đủ thông tin điểm đi, điểm đến và ngày đi.");
      return;
    }

    // Nếu là chuyến khứ hồi, kiểm tra ngày về
    if (tripType === "round-trip" && !returnDate) {
      alert("Vui lòng chọn ngày về cho chuyến khứ hồi.");
      return;
    }
    const searchParams = {
      tripType,
      departure,
      destination,
      departureDate,
      returnDate: tripType === "round-trip" ? returnDate : null,
      passengers,
    };

    // Kiểm tra xem dữ liệu có đầy đủ không trước khi lưu
    if (!departure || !destination || !departureDate) {
      alert("Vui lòng nhập đầy đủ thông tin điểm đi, điểm đến và ngày đi.");
      return; // Ngừng nếu thiếu thông tin
    }

    localStorage.setItem("flightSearchParams", JSON.stringify(searchParams));
    localStorage.removeItem("passengers");

    window.location.href = "/flight"; // hoặc navigate("/flight") nếu vẫn dùng react-router
  };
  useEffect(() => {
    localStorage.setItem("passengers", JSON.stringify(passengers));
  }, [passengers]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.fullscreen_background}>
          <img src={background} />
        </div>
        <div className={[styles.FLightSerchBox, styles.Card].join(" ")}>
          <h4 className={styles.text_center}>Your Wings to the Sky Fly Now </h4>
          <p className={styles.text_center}>
            "Fly Now - Elevate Your Travels, Not Your Costs"
          </p>
          <div className={styles.tripType}>
            <label className={styles.radiobutton}>
              <input
                type="radio"
                value="round-trip"
                checked={tripType === "round-trip"}
                onChange={() => setTripType("round-trip")}
              />
              Khứ hồi
            </label>
            <label className={styles.radiobutton}>
              <input
                type="radio"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={() => setTripType("one-way")}
              />
              Một chiều
            </label>
          </div>

          <div className={styles.Block}>
            {/* Chọn điểm đi - đến */}
            {
              <div className={styles.inputGroup} ref={inputRefDeparture}>
                <FaPlaneDeparture />
                <input
                  type="text"
                  placeholder="Vui lòng nhập điểm đi"
                  value={departure}
                  onFocus={handleDepartureFocus}
                  onChange={handleDepartureChange}
                  ref={inputRefDeparture}
                />
                <label className={styles.sm}>Điểm đi</label>
                {activeInput === "departure" && filteredAirports.length > 0 && (
                  <div className={styles.dropdown}>
                    <ul className={styles.suggestionList}>
                      {filteredAirports.map((airport) => (
                        <li
                          key={airport.airport_id}
                          onClick={() => handleAirportSelect(airport)}
                          className={styles.suggestionItem}
                        >
                          {airport.airport_name} ({airport.airport_code}),{" "}
                          {airport.city}, {airport.country}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            }

            {
              <div className={styles.inputGroup} ref={inputRefDestination}>
                <FaPlaneArrival />
                <input
                  type="text"
                  placeholder="Vui lòng nhập điểm đến"
                  value={destination}
                  onFocus={handleDestinationFocus} // Sửa lại hàm gọi
                  onChange={handleDestinationChange}
                  ref={inputRefDestination}
                />
                <label className={styles.sm}>Điểm đến</label>
                {activeInput === "destination" &&
                  filteredAirports.length > 0 && (
                    <div className={styles.dropdown}>
                      <ul className={styles.suggestionList}>
                        {filteredAirports.map((airport) => (
                          <li
                            key={airport.airport_id}
                            onClick={() => handleAirportSelect(airport)}
                            className={styles.suggestionItem}
                          >
                            {airport.airport_name} ({airport.airport_code}),{" "}
                            {airport.city}, {airport.country}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            }
          </div>
          <div className={styles.Block}>
            {/* Chọn ngày đi */}
            <div className={styles.inputGroup}>
              <FaCalendarAlt className={styles.icondate} />
              <DatePicker
                selected={departureDate}
                onChange={(date) => setDepartureDate(date)}
                placeholderText="Chọn ngày đi"
                minDate={new Date()} // Ngày đi không thể là quá khứ
                dateFormat="dd/MM/yyyy"
                monthsShown={2}
                className={styles.dateInput}
              />
              <label className={styles.sm}>Ngày đi</label>
            </div>
            {/* Chọn ngày về chỉ hiển thị cho chuyến khứ hồi */}
            {tripType === "round-trip" && (
              <div className={styles.inputGroup}>
                <FaCalendarAlt className={styles.icondate} />
                <DatePicker
                  selected={returnDate}
                  onChange={setReturnDate}
                  placeholderText="Chọn ngày về"
                  minDate={departureDate} // Ngày về không thể trước ngày đi
                  dateFormat="dd/MM/yyyy"
                  monthsShown={2} // Hiển thị 2 tháng cạnh nhau
                  className={styles.dateInput}
                />
                <label className={styles.sm}>Ngày về</label>
              </div>
            )}
          </div>
          {/* Chọn hành khách */}

          <div className={styles.Input_input_group}>
            <div className={styles.Input_input_group}>
              <div className={styles.inputquanty}>
                <FaUser />
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
                <label className={styles.sm}>Người lớn</label>
              </div>

              <div className={styles.inputquanty}>
                <FaUser />
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
                <label className={styles.sm}>Trẻ em</label>
              </div>
            </div>
            <div className={styles.Input_input_group}>
              <div className={styles.inputquanty}>
                <FaUser />
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
                <label className={styles.sm}>Em bé</label>
              </div>

              {/* Nút tìm kiếm */}

              <button className={styles.searchButton} onClick={handleSearch}>
                <FaSearch className={styles.icondate} /> Tìm chuyến bay
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.FlightSell}></div>
    </>
  );
};

export default Home;
