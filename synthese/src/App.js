import { BrowserRouter, Routes, Route } from "react-router-dom";
import FactureGuichet from "./components/FactureGuichet";
import Login from "./components/Login";
import Register from "./components/Register";
import AgentMaritim from "./components/AgentMaritim";
import DetailsManifeste from "./components/DetailsManifeste";
import UploadPage from "./components/UploadPage";
import VisualisationPage from "./components/VisualisationPage";
import Facturation from "./components/Facturation";
import APropos from "./components/APropos";
import TableauDeBord from "./components/TableauDeBord";
import ConsultationFactures from "./components/ConsultationFactures";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FactureGuichet />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/agent-maritime" element={<AgentMaritim />} />
        <Route path="/details-manifeste" element={<DetailsManifeste />} />
         <Route path="/uplod" element={<UploadPage />} />
        <Route path="/visualisation" element={<VisualisationPage />} />
        <Route path="/facturation" element={<Facturation />} />
        <Route path="/apropos" element={<APropos/>}/>
<Route path="/tableau-de-bord" element={<TableauDeBord />} />
<Route path="/consultation-factures" element={<ConsultationFactures />} />
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;
