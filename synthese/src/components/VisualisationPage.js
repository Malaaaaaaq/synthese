import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./VisualisationPage.css";
import LogoutButton from "./Logoutbutton";

export default function VisualisationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const excelData = location.state?.excelData || [];

  if (excelData.length === 0) {
    return (
      <div className="visualisation-container">
        <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}>
          <LogoutButton />
        </div>
        <div className="error-card">
          <h2>Aucune donnée à afficher</h2>
          <p>Veuillez d'abord importer un fichier Excel</p>
          <button className="action-button" onClick={() => navigate("/uplod")}>
            Aller à l'upload
          </button>
          <button className="back-button" onClick={() => navigate("/agent-maritime")}>
            Retour à Agent Maritime
          </button>
        </div>
      </div>
    );
  }

  const headers = excelData[0] || [];
  const rows = excelData.slice(1);

  return (
    <div className="visualisation-container">
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}>
        <LogoutButton />
      </div>
      <div className="visualisation-card">
        <div className="header-section">
          <h1>Visualisation des données Excel</h1>
          <div className="button-group">
            <button className="action-button" onClick={() => navigate("/uplod")}>
              Importer un autre fichier
            </button>
            <button className="back-button" onClick={() => navigate("/agent-maritime")}>
              Retour à Agent Maritime
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="excel-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>
                    {header || `Colonne ${index + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, colIndex) => (
                    <td key={colIndex}>
                      {row[colIndex] !== undefined && row[colIndex] !== null 
                        ? row[colIndex] 
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-info">
          <p>📊 Total des lignes: <strong>{rows.length}</strong></p>
          <p>📋 Total des colonnes: <strong>{headers.length}</strong></p>
        </div>
      </div>
    </div>
  );
}