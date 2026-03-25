import React, { useState, useEffect, useRef } from 'react';
import './AgentMaritime.css';
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFileExcel, faSpinner, faShip } from "@fortawesome/free-solid-svg-icons";
import LogoutButton from "./Logoutbutton";

const AgentMaritime = () => {
  const navigate = useNavigate();
  const lottieRef = useRef(null);

  const [escales, setEscales]                     = useState([]);
  const [ports, setPorts]                         = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState("");
  const [showManifeste, setShowManifeste]         = useState(false);
  const [navireSelectionne, setNavireSelectionne] = useState(null);
  const [selectedPort, setSelectedPort]           = useState("Tous");

  // ── Charger Lottie dynamiquement ─────────────────────────────
  useEffect(() => {
    let anim;
    import("lottie-web").then((lottie) => {
      if (lottieRef.current) {
        anim = lottie.default.loadAnimation({
          container:    lottieRef.current,
          renderer:     "svg",
          loop:         true,
          autoplay:     true,
          path:         "/assets/animation.json", // ← fichier JSON dans public/assets/
        });
      }
    }).catch(() => {
      // Lottie non disponible — pas de problème, le fond reste beau
    });
    return () => { if (anim) anim.destroy(); };
  }, []);

  // ── Charger les escales et les ports ──────────────────────────
  useEffect(() => { 
    fetchEscales(); 
    fetchPorts();
  }, []);

  const fetchEscales = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/escales", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setEscales(await res.json());
    } catch (err) {
      setError("Impossible de charger les escales depuis la base de données.");
    } finally { setLoading(false); }
  };

  const fetchPorts = async () => {
    try {
      const res = await fetch("/api/ports");
      if (res.ok) setPorts(await res.json());
    } catch (err) {
      console.error("Erreur lors du chargement des ports:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' });
  };

  const handleDeposerManifeste = (escale) => {
    setNavireSelectionne({
      navire:      escale.navire,
      port:        escale.port,
      escale:      escale.numero,
      dateArrivee: escale.date_arrivee,
      dateDepart:  escale.date_depart,
    });
    setShowManifeste(true);
  };

  const handleCloseManifeste = () => {
    setShowManifeste(false);
    setNavireSelectionne(null);
  };

  return (
    <div className="am-page">

      {/* ── ANIMATION LOTTIE EN FOND ── */}
      <div className="am-lottie-bg" ref={lottieRef} />

      {/* ── OVERLAY DÉGRADÉ ── */}
      <div className="am-overlay" />

      {/* ── CONTENU ── */}
      <div className="am-content">

        {/* HEADER */}
        <div className="am-header">
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div className="am-header-icon">
              <FontAwesomeIcon icon={faShip} />
            </div>
            <div>
              <h1 className="am-title">Gestion Agent Maritime</h1>
              <p className="am-subtitle">Consultez les escales et déposez vos manifestes</p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* ERREUR */}
        {error && (
          <div className="am-error">⚠️ {error}</div>
        )}

        {/* ── FILTRES PAR PORT ── */}
        <div className="am-filter-bar">
          <button 
            className={`am-filter-btn ${selectedPort === "Tous" ? "active" : ""}`}
            onClick={() => setSelectedPort("Tous")}
          >
            Tous les Ports
          </button>
          {ports.map(p => (
            <button
              key={p._id}
              className={`am-filter-btn ${selectedPort === p.nom ? "active" : ""}`}
              onClick={() => setSelectedPort(p.nom)}
            >
              {p.nom}
            </button>
          ))}
        </div>

        {/* TABLEAU */}
        <div className="am-table-wrapper">
          {loading ? (
            <div className="am-loading">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p>Chargement des escales...</p>
            </div>
          ) : (
            <table className="am-table">
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Escale</th>
                  <th>Navire</th>
                  <th>Date d'Arrivée</th>
                  <th>Date de Départ</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {escales.filter(e => selectedPort === "Tous" || e.port === selectedPort).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="am-empty">Aucune escale disponible pour ce port</td>
                  </tr>
                ) : (
                  escales
                    .filter(e => selectedPort === "Tous" || e.port === selectedPort)
                    .map((escale) => (
                      <tr key={escale._id}>
                      <td><span className="am-port-badge">{escale.port}</span></td>
                      <td><strong>{escale.numero}</strong></td>
                      <td>{escale.navire}</td>
                      <td>{formatDate(escale.date_arrivee)}</td>
                      <td>{formatDate(escale.date_depart)}</td>
                      <td>
                        <button
                          className="am-btn-deposer"
                          onClick={() => handleDeposerManifeste(escale)}
                        >
                          <FontAwesomeIcon icon={faFile} /> Déposer Manifeste
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {showManifeste && navireSelectionne && (
        <div className="am-modal-overlay" onClick={handleCloseManifeste}>
          <div className="am-modal" onClick={e => e.stopPropagation()}>
            <div className="am-modal-header">
              <h2>📋 Déposer Manifeste</h2>
              <button className="am-modal-close" onClick={handleCloseManifeste}>&times;</button>
            </div>

            <div className="am-modal-body">
              {[
                { label: "Port",         val: navireSelectionne.port },
                { label: "Escale",       val: navireSelectionne.escale },
                { label: "Navire",       val: navireSelectionne.navire },
                { label: "Date Arrivée", val: formatDate(navireSelectionne.dateArrivee) },
                { label: "Date Départ",  val: formatDate(navireSelectionne.dateDepart) },
              ].map(f => (
                <div key={f.label} className="am-form-group">
                  <label>{f.label}</label>
                  <input type="text" value={f.val || "—"} readOnly />
                </div>
              ))}
            </div>

            <div className="am-modal-footer">
              <button className="am-btn-annuler" onClick={handleCloseManifeste}>Annuler</button>
              <button
                className="am-btn-upload"
                onClick={() => {
                  handleCloseManifeste();
                  navigate("/uplod", { state: { navireInfo: navireSelectionne } });
                }}
              >
                <FontAwesomeIcon icon={faFileExcel} /> Upload Manifeste Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentMaritime;