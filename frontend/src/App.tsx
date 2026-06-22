import "./App.css";
import Map from "./components/map";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Map />
    </div>
  );
}

export default App;
