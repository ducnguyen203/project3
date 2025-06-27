const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const airportRoutes = require("./routes/airportRoutes");
const flightRoutes = require("./routes/flightRoutes");
const ScheduleRouter = require("./routes/scheduleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const passengerServiceRoutes = require("./routes/PassengerServiceRoutes");
const airplaneRoutes = require("./routes/airplaneRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const userRoutes = require("./routes/userRoutes");
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use("/api/auth", authRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/schedules", ScheduleRouter);
app.use("/api/bookings", bookingRoutes);
app.use("/api", passengerServiceRoutes);
app.use("/api/airplanes", airplaneRoutes);
app.use("/api/airplanes", airplaneRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
