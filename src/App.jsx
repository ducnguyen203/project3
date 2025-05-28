import AppRouter from "./router";
import useAuth from "./services/useAuth";
function App() {
  useAuth();
  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;
