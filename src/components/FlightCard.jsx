import React, { memo } from "react";
import style from "../assets/styles/Flight.module.css";

const FlightCard = ({
  flight,
  selectedTicket,
  onSelectTicket,
  isDeparture,
}) => {
  return (
    <div
      className={`${style.content_Flight} ${
        selectedTicket &&
        selectedTicket.flight_id === flight.id &&
        flight.prices.some(
          (price) => price.ticket_type === selectedTicket.ticket_type
        )
          ? style.selectedFlightCard
          : ""
      }`}
    >
      <div className={style.flightDetails}>
        <div className={style.schedule}>
          <div className={style.time}>{flight.departure_time}</div>
          <div className={style.airport}>{flight.departure_airport_code}</div>
        </div>
        <div className={style.flightIcon}>
          <div>✈</div>
          <div>Bay thẳng</div>
        </div>
        <div className={style.flightInfo}>
          <div className={style.time}>{flight.arrival_time}</div>
          <div className={style.airport}>{flight.arrival_airport_code}</div>
        </div>
        <div className={style.details}>
          <p>Thời gian bay: {flight.duration}</p>
          <p>Ngày Bay: {flight.departure_date}</p>
          <p>
            <a href="#details" className={style.detailsLink}>
              Chi tiết hành trình
            </a>
          </p>
        </div>
      </div>
      <div className={style.ticketPrices}>
        {(flight.prices || []).map((price) => (
          <div
            key={price.ticket_type_id}
            className={`${style.priceCard} ${
              selectedTicket &&
              selectedTicket.flight_id === flight.id &&
              selectedTicket.ticket_type === price.ticket_type
                ? style.selectedPriceCard
                : ""
            }`}
            onClick={() => {
              const isSameTicket =
                selectedTicket &&
                selectedTicket.flight_id === flight.id &&
                selectedTicket.ticket_type === price.ticket_type;

              onSelectTicket(
                isSameTicket
                  ? null
                  : {
                      ...price,
                      price_id: price.price_id,
                      schedule_id: flight.schedule_id,
                      flight_id: flight.id,
                      departure_time: flight.departure_time,
                      arrival_time: flight.arrival_time,
                      departure_date: flight.departure_date,
                    }
              );
            }}
          >
            <div className={style.priceType}>{price.ticket_type}</div>
            <div className={style.price}>Từ {price.price} VNĐ</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(FlightCard);
