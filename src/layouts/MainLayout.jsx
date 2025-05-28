import Footer from "../components/Footer";
import Header from "../components/Header";

const MainLayout = ({ children }) => {
  return (
    <div>
      <header>
        <Header></Header>
      </header>
      <main>{children}</main>
      <footer>
        <Footer></Footer>
      </footer>
    </div>
  );
};

export default MainLayout;
