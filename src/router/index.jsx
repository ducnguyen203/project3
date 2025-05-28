import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import MainLayout from "../layouts/MainLayout";
import Flight from "../pages/flight";
import Register from "../pages/Register";
import Booking from "../pages/Booking";
import PassengerService from "../pages/PassengerService";

const AppRouter = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Flight" element={<Flight />} />
          <Route path="/Booking" element={<Booking />} />
          <Route path="/PassengerService" element={<PassengerService />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
