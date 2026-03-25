import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ← ajout useLocation
import * as XLSX from "xlsx";
import "./UploadPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileCirclePlus } from "@fortawesome/free-solid-svg-icons";
import LogoutButton from "./Logoutbutton";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ← ajout pour récupérer navireInfo

  // ← Récupère les infos du navire envoyées depuis AgentMaritime.js
  // quand l'agent clique "Upload Manifeste Excel"
  const navireInfo = location.state?.navireInfo;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      if (fileExtension === "xlsx" || fileExtension === "xls") {
        setFile(selectedFile);
        setError("");
      } else {
        setError("Veuillez sélectionner un fichier Excel valide (.xlsx ou .xls)");
        setFile(null);
      }
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Filtrer les lignes vides
        const filteredData = parsedData.filter((row) =>
          row.some((cell) => cell !== null && cell !== "")
        );

        console.log("📊 Données Excel parsées:", filteredData.length, "lignes");
        console.log("🚢 NavireInfo envoyé:", navireInfo);

        const response = await fetch("/api/manifeste/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            excelData: filteredData,
            navireInfo: navireInfo,
          }),
        });

        const result = await response.json();
        console.log("📨 Réponse serveur:", response.status, result);

        if (!response.ok) {
          setError(`Erreur ${response.status}: ${result.message || "Erreur lors de l'insertion en base de données"}`);
          setLoading(false);
          return;
        }

        // Succès : afficher un message puis rediriger
        console.log("✅ Insertion réussie:", result.message);
        navigate("/visualisation", { state: { excelData: filteredData } });

      } catch (err) {
        console.error("❌ Erreur fetch:", err);
        setError(`Impossible de contacter le serveur (${err.message}). Vérifiez que le backend tourne sur le port 5000.`);
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Erreur lors de la lecture du fichier");
      setLoading(false);
    };
  };

  return (
    <div className="upload-container">
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}>
        <LogoutButton />
      </div>
      <div className="upload-card">
        <h1>Importation de fichier Excel</h1>

        {/* ← Affiche les infos du navire si disponibles */}
        {navireInfo && (
          <div className="navire-info-banner">
            🚢 <strong>{navireInfo.navire}</strong> — {navireInfo.port} — Escale : <strong>{navireInfo.escale}</strong>
          </div>
        )}

        <p className="subtitle">
          Sélectionnez votre fichier Excel pour visualiser les données
        </p>

        <div className="upload-area">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            id="file-input"
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <FontAwesomeIcon icon={faFileCirclePlus} />
            <span className="upload-text">
              {file ? file.name : "Cliquez pour sélectionner un fichier"}
            </span>
          </label>

          {error && <p className="error-message">{error}</p>}
        </div>

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? "⏳ Insertion en cours..." : "Upload et Visualiser"}
        </button>
      </div>
    </div>
  );
}