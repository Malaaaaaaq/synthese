import React, { useState, useEffect, useRef } from "react";
import "./Facturation.css";
import { useNavigate } from "react-router-dom";   // ← AJOUT
import DetailsManifeste from "./DetailsManifeste";
import FacturationModal from "./FacturationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoiceDollar, faEye, faCheckCircle,
  faClock, faShip, faBoxes, faWeightHanging,
  faMagnifyingGlass, faTimes, faRotate, faChartBar, // ← faChartBar ajouté
} from "@fortawesome/free-solid-svg-icons";
import LogoutButton from "./Logoutbutton";

const getToken = () => localStorage.getItem("token");

// ── Animation Canvas — fond blanc, vagues + bateau subtils ──────
function MaritimeCanvasLight() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId, t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Navires légers
    const ships = [
      { x: -200, y: 0.72, speed: 0.22, scale: 0.9, alpha: 0.07 },
      { x: -600, y: 0.80, speed: 0.13, scale: 0.55, alpha: 0.05 },
      { x: -1000, y: 0.76, speed: 0.17, scale: 0.70, alpha: 0.06 },
    ];

    const drawShip = (x, y, scale, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#1e3a6e";
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      // Coque
      ctx.beginPath();
      ctx.moveTo(-55, 0); ctx.lineTo(55, 0);
      ctx.lineTo(45, 16); ctx.lineTo(-45, 16);
      ctx.closePath(); ctx.fill();
      // Superstructure
      ctx.fillRect(-18, -20, 36, 20);
      ctx.fillRect(-4, -34, 18, 14);
      // Cheminée
      ctx.fillRect(7, -46, 7, 14);
      // Mât
      ctx.strokeStyle = "#1e3a6e";
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = alpha * 0.7;
      ctx.beginPath();
      ctx.moveTo(-28, 0); ctx.lineTo(-28, -26);
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;

      // Vagues très subtiles en bas
      const waves = [
        { y: 0.74, amp: 14, freq: 0.013, speed: 0.9, alpha: 0.04, color: "#1a56db" },
        { y: 0.79, amp: 10, freq: 0.019, speed: 1.3, alpha: 0.035, color: "#1e3a6e" },
        { y: 0.84, amp: 7, freq: 0.025, speed: 0.7, alpha: 0.045, color: "#152c54" },
        { y: 0.89, amp: 5, freq: 0.032, speed: 1.5, alpha: 0.055, color: "#0f1f3d" },
        { y: 0.94, amp: 3, freq: 0.040, speed: 1.1, alpha: 0.065, color: "#0a1628" },
      ];

      waves.forEach(w => {
        const baseY = canvas.height * w.y;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = baseY
            + Math.sin(x * w.freq + t * w.speed) * w.amp
            + Math.sin(x * w.freq * 1.8 + t * w.speed * 0.5) * (w.amp * 0.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.globalAlpha = w.alpha;
        ctx.fill();
      });

      // Navires
      ships.forEach(ship => {
        ship.x += ship.speed;
        if (ship.x > canvas.width + 250) ship.x = -250;
        const sy = canvas.height * ship.y + Math.sin(t * 0.9 + ship.x * 0.008) * 2.5;
        drawShip(ship.x, sy, ship.scale, ship.alpha);
      });

      // Reflets eau très discrets
      ctx.globalAlpha = 0.025;
      ctx.fillStyle = "#1a56db";
      for (let i = 0; i < 6; i++) {
        const rx = (canvas.width * 0.15 * i + t * 20) % (canvas.width + 80);
        const ry = canvas.height * (0.76 + i * 0.025);
        ctx.beginPath();
        ctx.ellipse(rx, ry, 35 + i * 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fact-canvas" />;
}

function getInitiales() {
  return "AF";
}

function getNomAgent() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.raisonSociale || user.email || "Agent Facturation";
  } catch { return "Agent Facturation"; }
}

function Facturation() {
  const navigate = useNavigate();   // ← AJOUT

  const [manifestes, setManifestes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("en_attente");
  const [manifesteDetails, setManifestDetails] = useState(null);
  const [manifesteAFacturer, setManifesteAFacturer] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [marchandisesPopup, setMarchandisesPopup] = useState(null);
  const [tarifs, setTarifs] = useState([]);

  useEffect(() => { fetchManifestes(); fetchTarifs(); }, []);

  const fetchManifestes = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/manifeste/all", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      setManifestes(await res.json());
    } catch { setError("Impossible de charger les manifestes."); }
    finally { setLoading(false); }
  };

  const fetchTarifs = async () => {
    try {
      const res = await fetch("/api/tarifs");
      if (!res.ok) throw new Error();
      setTarifs(await res.json());
    } catch { setTarifs([]); }
  };

  const getTarif = (libelle) => {
    if (!libelle || tarifs.length === 0) return 35;
    const lib = libelle.toLowerCase();
    const t = tarifs.find(t => t.libelle && lib.includes(t.libelle.toLowerCase().split(" ")[0]));
    return t ? t.tarif_par_tonne : 35;
  };

  const handleFactureGeneree = (id) => {
    setManifestes(prev => prev.map(m => m._id === id ? { ...m, statut: "facture" } : m));
    setSuccessMsg("✅ Facture générée et sauvegardée avec succès !");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const manifestesFiltres = manifestes.filter(m => {
    const matchSearch =
      (m.navire || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.n_escale || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.port || "").toLowerCase().includes(search.toLowerCase()) ||
      (m._id || "").toLowerCase().includes(search.toLowerCase());
    const matchStatut = filtreStatut === "tous" || m.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  const stats = {
    total: manifestes.length,
    enAttente: manifestes.filter(m => m.statut !== "facture").length,
    factures: manifestes.filter(m => m.statut === "facture").length,
    tonnage: manifestes.reduce((acc, m) =>
      acc + (m.marchandises || []).reduce((s, mc) => s + (parseFloat(mc.tonnage) || 0), 0), 0),
  };

  return (
    <div className="facturation-container">

      {/* ── ANIMATION DE FOND ── */}
      <MaritimeCanvasLight />

      {/* ══════════════════════════════════════════
          TOP BAR — Agent GAUCHE | Logo DROITE
      ══════════════════════════════════════════ */}
      <div className="fact-header">

        {/* ── GAUCHE : Avatar + Nom agent ── */}
        <div className="fact-header-left">
          <div className="agent-avatar">{getInitiales()}</div>
          <div className="header-agent-info">
            <div className="header-agent-name">{getNomAgent()}</div>
            <div className="header-agent-role">Agent de Facturation</div>
          </div>
        </div>

        {/* ── DROITE : Bouton TDB + Actualiser + Logo ── */}
        <div className="fact-header-right">

          {/* ← NOUVEAU : bouton Tableau de Bord */}
          <button className="btn-dashboard" onClick={() => navigate("/tableau-de-bord")}>
            <FontAwesomeIcon icon={faChartBar} /> Tableau de Bord
          </button>
          
<button className="btn-dashboard" onClick={() => navigate("/consultation-factures")} style={{ marginLeft: "10px" }}>            <FontAwesomeIcon icon={faFileInvoiceDollar} /> Consultation/Edition
          </button>

          <button className="btn-refresh" onClick={fetchManifestes}>
            <FontAwesomeIcon icon={faRotate} /> Actualiser
          </button>
          
          <LogoutButton />

          <div className="logo-efacture">
            <div className="logo-icon">EF</div>
            <div className="logo-text">
              E-Facture
              <span>Agence Nationale des Ports</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SOUS-HEADER
      ══════════════════════════════════════════ */}
      <div className="fact-subheader">
        <h1>
          <FontAwesomeIcon icon={faFileInvoiceDollar} />
          Tableau de Bord — Facturation
        </h1>
        <p className="fact-subtitle">
          Consultez les manifestes déposés et générez les factures
        </p>
      </div>

      {/* ══════════════════════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════════════════════ */}
      <div className="fact-content">

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card stat-total">
            <FontAwesomeIcon icon={faShip} className="stat-icon" />
            <div><span className="stat-num">{stats.total}</span><span className="stat-label">Total manifestes</span></div>
          </div>
          <div className="stat-card stat-attente">
            <FontAwesomeIcon icon={faClock} className="stat-icon" />
            <div><span className="stat-num">{stats.enAttente}</span><span className="stat-label">Non facturés</span></div>
          </div>
          <div className="stat-card stat-facture">
            <FontAwesomeIcon icon={faCheckCircle} className="stat-icon" />
            <div><span className="stat-num">{stats.factures}</span><span className="stat-label">Facturés</span></div>
          </div>
          <div className="stat-card stat-tonnage">
            <FontAwesomeIcon icon={faWeightHanging} className="stat-icon" />
            <div>
              <span className="stat-num">{stats.tonnage.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}</span>
              <span className="stat-label">Tonnage total (T)</span>
            </div>
          </div>
        </div>

        {successMsg && <div className="alert-success">{successMsg}</div>}
        {error && <div className="alert-error">⚠️ {error}</div>}

        {/* Filtres */}
        <div className="filters-bar">
          <div className="search-wrap">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par navire, escale, port, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-btns">
            {[
              { val: "tous", label: "Tous" },
              { val: "en_attente", label: "🔴 Non facturés" },
              { val: "facture", label: "✅ Facturés" },
            ].map(f => (
              <button key={f.val}
                className={`filter-btn ${filtreStatut === f.val ? "active" : ""}`}
                onClick={() => setFiltreStatut(f.val)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="loading-state"><span className="spinner" /> Chargement...</div>
        ) : manifestesFiltres.length === 0 ? (
          <div className="empty-state"><FontAwesomeIcon icon={faBoxes} size="3x" /><p>Aucun manifeste trouvé</p></div>
        ) : (
          <div className="table-wrapper">
            <div className="table-title">
              <h3><FontAwesomeIcon icon={faFileInvoiceDollar} /> Liste des Manifestes</h3>
              <span className="table-count">{manifestesFiltres.length} résultat(s)</span>
            </div>
            <table className="fact-table">
              <thead>
                <tr>
                  <th>ID</th><th>N° Escale</th><th>Navire</th><th>Port</th>
                  <th>Date Arrivée</th><th>Date Départ</th><th>Date Dépôt</th>
                  <th>Marchandises</th><th>Statut</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {manifestesFiltres.map(m => (
                  <tr key={m._id}>
                    <td><span className="badge-id" title={m._id}>{m._id.slice(-6).toUpperCase()}</span></td>
                    <td><strong>{m.n_escale || "—"}</strong></td>
                    <td>{m.navire || "—"}</td>
                    <td>{m.port || "—"}</td>
                    <td>{formatDate(m.date_arrivee)}</td>
                    <td>{formatDate(m.date_depart)}</td>
                    <td>{formatDate(m.date_depot)}</td>
                    <td>
                      <button className="badge-marchandises clickable"
                        onClick={() => setMarchandisesPopup(m)} title="Voir les marchandises">
                        <FontAwesomeIcon icon={faBoxes} />
                        {(m.marchandises || []).length} article{(m.marchandises || []).length > 1 ? "s" : ""}
                        <span className="badge-voir">👁</span>
                      </button>
                    </td>
                    <td>
                      <span className={`badge-statut ${m.statut === "facture" ? "facture" : "attente"}`}>
                        {m.statut === "facture" ? "✅ Facturé" : "🔴 Non facturé"}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-voir" onClick={() => setManifestDetails(m)}>
                          <FontAwesomeIcon icon={faEye} /> Détails
                        </button>
                        {m.statut !== "facture" && (
                          <button className="btn-facturer" onClick={() => setManifesteAFacturer(m)}>
                            <FontAwesomeIcon icon={faFileInvoiceDollar} /> Facturer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {manifesteDetails && (
        <DetailsManifeste manifeste={manifesteDetails} onClose={() => setManifestDetails(null)} />
      )}
      {manifesteAFacturer && (
        <FacturationModal
          manifeste={manifesteAFacturer}
          onClose={() => setManifesteAFacturer(null)}
          onFactureGeneree={handleFactureGeneree}
        />
      )}

      {/* Popup Marchandises */}
      {marchandisesPopup && (
        <div className="popup-overlay" onClick={() => setMarchandisesPopup(null)}>
          <div className="popup-marchandises" onClick={e => e.stopPropagation()}>
            <div className="popup-header">
              <div>
                <h3>📦 Détail des marchandises</h3>
                <p className="popup-subtitle">{marchandisesPopup.n_escale} — {marchandisesPopup.navire}</p>
              </div>
              <button className="popup-close" onClick={() => setMarchandisesPopup(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="popup-table-wrap">
              <table className="popup-table">
                <thead>
                  <tr><th>#</th><th>Code</th><th>Nom Marchandise</th><th>Tonnage (T)</th><th>Tarif (DH/T)</th><th>Prix HT (DH)</th></tr>
                </thead>
                <tbody>
                  {(marchandisesPopup.marchandises || []).length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "28px" }}>Aucune marchandise</td></tr>
                  ) : (
                    (marchandisesPopup.marchandises || []).map((mc, i) => {
                      const tarif = getTarif(mc.libelle);
                      const prix = parseFloat(mc.tonnage || 0) * tarif;
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td><span className="code-badge">{mc["code marchandises"] || mc.code_marchandises || mc.code_marchandise || "—"}</span></td>
                          <td className="libelle-cell">{mc.libelle || "—"}</td>
                          <td className="num-cell">{parseFloat(mc.tonnage || 0).toLocaleString("fr-FR")}</td>
                          <td className="num-cell">{tarif.toLocaleString("fr-FR")} DH</td>
                          <td className="num-cell prix-cell">{prix.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {(marchandisesPopup.marchandises || []).length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: "right" }}>TOTAL HT</td>
                      <td className="num-cell">{(marchandisesPopup.marchandises || []).reduce((s, mc) => s + parseFloat(mc.tonnage || 0), 0).toLocaleString("fr-FR")} T</td>
                      <td></td>
                      <td className="num-cell">{(marchandisesPopup.marchandises || []).reduce((s, mc) => s + parseFloat(mc.tonnage || 0) * getTarif(mc.libelle), 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default Facturation;