import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faSearch, faFileInvoiceDollar,
  faCalendarAlt, faFilter, faTimes, faChartBar,
  faRotate, faAnchor, faShip, faCheckCircle, faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import "./ConsultationFactures.css";
import LogoutButton from "./Logoutbutton";

const getToken = () => localStorage.getItem("token");

function getNomAgent() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.raisonSociale || user.email || "Agent Facturation";
  } catch { return "Agent Facturation"; }
}
function getInitiales() { return "AF"; }

// ── Animation Canvas (identique à Facturation.jsx) ──────────────
function MaritimeCanvasLight() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId, t = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const ships = [
      { x: -200, y: 0.72, speed: 0.22, scale: 0.9, alpha: 0.07 },
      { x: -600, y: 0.80, speed: 0.13, scale: 0.55, alpha: 0.05 },
      { x: -1000, y: 0.76, speed: 0.17, scale: 0.70, alpha: 0.06 },
    ];
    const drawShip = (x, y, scale, alpha) => {
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = "#1e3a6e";
      ctx.translate(x, y); ctx.scale(scale, scale);
      ctx.beginPath(); ctx.moveTo(-55, 0); ctx.lineTo(55, 0);
      ctx.lineTo(45, 16); ctx.lineTo(-45, 16); ctx.closePath(); ctx.fill();
      ctx.fillRect(-18, -20, 36, 20); ctx.fillRect(-4, -34, 18, 14); ctx.fillRect(7, -46, 7, 14);
      ctx.strokeStyle = "#1e3a6e"; ctx.lineWidth = 1.2; ctx.globalAlpha = alpha * 0.7;
      ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-28, -26); ctx.stroke();
      ctx.restore();
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); t += 0.01;
      const waves = [
        { y: 0.74, amp: 14, freq: 0.013, speed: 0.9,  alpha: 0.04,  color: "#1a56db" },
        { y: 0.79, amp: 10, freq: 0.019, speed: 1.3,  alpha: 0.035, color: "#1e3a6e" },
        { y: 0.84, amp: 7,  freq: 0.025, speed: 0.7,  alpha: 0.045, color: "#152c54" },
        { y: 0.89, amp: 5,  freq: 0.032, speed: 1.5,  alpha: 0.055, color: "#0f1f3d" },
        { y: 0.94, amp: 3,  freq: 0.040, speed: 1.1,  alpha: 0.065, color: "#0a1628" },
      ];
      waves.forEach(w => {
        const baseY = canvas.height * w.y;
        ctx.beginPath(); ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = baseY + Math.sin(x * w.freq + t * w.speed) * w.amp
                         + Math.sin(x * w.freq * 1.8 + t * w.speed * 0.5) * (w.amp * 0.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height); ctx.closePath();
        ctx.fillStyle = w.color; ctx.globalAlpha = w.alpha; ctx.fill();
      });
      ships.forEach(ship => {
        ship.x += ship.speed;
        if (ship.x > canvas.width + 250) ship.x = -250;
        const sy = canvas.height * ship.y + Math.sin(t * 0.9 + ship.x * 0.008) * 2.5;
        drawShip(ship.x, sy, ship.scale, ship.alpha);
      });
      ctx.globalAlpha = 0.025; ctx.fillStyle = "#1a56db";
      for (let i = 0; i < 6; i++) {
        const rx = (canvas.width * 0.15 * i + t * 20) % (canvas.width + 80);
        const ry = canvas.height * (0.76 + i * 0.025);
        ctx.beginPath(); ctx.ellipse(rx, ry, 35 + i * 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="cf-canvas" />;
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function ConsultationFactures() {
  const navigate = useNavigate();

  const [factures, setFactures] = useState([]);
  const [filteredFactures, setFilteredFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateDu, setDateDu] = useState("");
  const [dateAu, setDateAu] = useState("");
  const [rechercheLancee, setRechercheLancee] = useState(false);

  useEffect(() => { fetchFactures(); }, []);

  const fetchFactures = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/factures", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFactures(data);
      setFilteredFactures(data);
    } catch {
      setError("Impossible de charger les factures.");
    } finally {
      setLoading(false);
    }
  };

  // ── Logique de filtrage exacte (votre code original) ──
  const handleValider = () => {
    setError("");
    if (!dateDu && !dateAu) {
      setFilteredFactures(factures);
      setRechercheLancee(false);
      return;
    }
    const filtered = factures.filter(f => {
      if (!f.date_facturation) return false;
      const dFact = new Date(f.date_facturation);
      dFact.setHours(0, 0, 0, 0);
      let pass = true;
      if (dateDu) {
        const [y, m, d] = dateDu.split("-");
        const du = new Date(y, parseInt(m) - 1, d);
        du.setHours(0, 0, 0, 0);
        if (dFact < du) pass = false;
      }
      if (dateAu) {
        const [y, m, d] = dateAu.split("-");
        const au = new Date(y, parseInt(m) - 1, d);
        au.setHours(0, 0, 0, 0);
        if (dFact > au) pass = false;
      }
      return pass;
    });
    setFilteredFactures(filtered);
    setRechercheLancee(true);
  };

  const handleReset = () => {
    setDateDu(""); setDateAu("");
    setFilteredFactures(factures);
    setRechercheLancee(false);
    setError("");
  };

  // ── Export Excel sans librairie externe ──
  const handleExportExcel = () => {
    if (filteredFactures.length === 0) return;

    // Construire le contenu XML Excel (format .xls compatible)
    const periode = rechercheLancee && dateDu && dateAu
      ? `Du ${formatDate(dateDu)} au ${formatDate(dateAu)}`
      : "Toutes les factures";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
      <Interior ss:Color="#152C54" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFFFFF"/>
      </Borders>
    </Style>
    <Style ss:ID="title">
      <Font ss:Bold="1" ss:Color="#152C54" ss:Size="13"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="sub">
      <Font ss:Color="#5A6A8A" ss:Size="10"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="num">
      <Alignment ss:Horizontal="Right"/>
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
    <Style ss:ID="total">
      <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
      <Interior ss:Color="#1E3A6E" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right"/>
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
    <Style ss:ID="totalLabel">
      <Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/>
      <Interior ss:Color="#1E3A6E" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Right"/>
    </Style>
    <Style ss:ID="even">
      <Interior ss:Color="#F5F8FF" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Factures">
    <Table>
      <Column ss:Width="140"/>
      <Column ss:Width="100"/>
      <Column ss:Width="160"/>
      <Column ss:Width="110"/>
      <Column ss:Width="130"/>
      <Column ss:Width="120"/>
      <Column ss:Width="120"/>
      <Row ss:Height="28">
        <Cell ss:MergeAcross="6" ss:StyleID="title">
          <Data ss:Type="String">Agence Nationale des Ports — Factures Émises</Data>
        </Cell>
      </Row>
      <Row ss:Height="20">
        <Cell ss:MergeAcross="6" ss:StyleID="sub">
          <Data ss:Type="String">${periode}</Data>
        </Cell>
      </Row>
      <Row ss:Height="6"/>
      <Row ss:Height="24">
        <Cell ss:StyleID="header"><Data ss:Type="String">N° Facture</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Date</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Client (Agent)</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Escale</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">Navire</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">HT (DH)</Data></Cell>
        <Cell ss:StyleID="header"><Data ss:Type="String">TR (DH)</Data></Cell>
      </Row>`;

    filteredFactures.forEach((f, i) => {
      const style = i % 2 === 1 ? ' ss:StyleID="even"' : '';
      const styleNum = i % 2 === 1 ? ' ss:StyleID="even"' : ' ss:StyleID="num"';
      const dateStr = f.date_facturation
        ? new Date(f.date_facturation).toLocaleDateString("fr-FR") : "—";
      const ht  = parseFloat(f.total_ht) || 0;
      const tr  = parseFloat(f.montant_taxe_reg || f.tr_2) || 0;
      xml += `
      <Row ss:Height="20">
        <Cell${style}><Data ss:Type="String">${f.numero_facture || "—"}</Data></Cell>
        <Cell${style}><Data ss:Type="String">${dateStr}</Data></Cell>
        <Cell${style}><Data ss:Type="String">${f.agent_facturation || "—"}</Data></Cell>
        <Cell${style}><Data ss:Type="String">${f.n_escale || "—"}</Data></Cell>
        <Cell${style}><Data ss:Type="String">${f.navire || "—"}</Data></Cell>
        <Cell${styleNum}><Data ss:Type="Number">${ht}</Data></Cell>
        <Cell${styleNum}><Data ss:Type="Number">${tr}</Data></Cell>
      </Row>`;
    });

    xml += `
      <Row ss:Height="6"/>
      <Row ss:Height="24">
        <Cell ss:MergeAcross="4" ss:StyleID="totalLabel"><Data ss:Type="String">TOTAL</Data></Cell>
        <Cell ss:StyleID="total"><Data ss:Type="Number">${totalHT}</Data></Cell>
        <Cell ss:StyleID="total"><Data ss:Type="Number">${totalTR}</Data></Cell>
      </Row>
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const nomFichier = rechercheLancee && dateDu && dateAu
      ? `Factures_${dateDu}_${dateAu}.xls`
      : `Factures_toutes.xls`;
    link.href = url;
    link.download = nomFichier;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Stats totaux
  const totalHT = filteredFactures.reduce((s, f) => s + (parseFloat(f.total_ht) || 0), 0);
  const totalTR = filteredFactures.reduce((s, f) => s + (parseFloat(f.montant_taxe_reg || f.tr_2) || 0), 0);

  return (
    <div className="cf-container">
      <MaritimeCanvasLight />

      {/* ══ TOP BAR ══ */}
      <div className="cf-header">
        <div className="cf-header-left">
          <div className="cf-avatar">{getInitiales()}</div>
          <div className="cf-agent-info">
            <div className="cf-agent-name">{getNomAgent()}</div>
            <div className="cf-agent-role">Agent de Facturation</div>
          </div>
        </div>
        <div className="cf-header-right">
          <button className="cf-btn-nav" onClick={() => navigate("/facturation")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Retour Facturation
          </button>
          <button className="cf-btn-nav" onClick={() => navigate("/tableau-de-bord")}>
            <FontAwesomeIcon icon={faChartBar} /> Tableau de Bord
          </button>
          <button className="cf-btn-refresh" onClick={fetchFactures} title="Actualiser">
            <FontAwesomeIcon icon={faRotate} />
          </button>
          <LogoutButton />
          <div className="cf-logo">
            <div className="cf-logo-icon">EF</div>
            <div className="cf-logo-text">
              E-Facture
              <span>Agence Nationale des Ports</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SOUS-HEADER ══ */}
      <div className="cf-subheader">
        <h1>
          <FontAwesomeIcon icon={faFileInvoiceDollar} />
          Consultation des Factures Émises
        </h1>
        <p className="cf-subtitle">Consultez et filtrez les factures générées par période</p>
      </div>

      {/* ══ CONTENU ══ */}
      <div className="cf-content">

        {/* ── FILTRE ── */}
        <div className="cf-filter-card">
          <div className="cf-filter-title">
            <FontAwesomeIcon icon={faFilter} /> Filtrer par période
          </div>

          <div className="cf-filter-row">
            <div className="cf-date-group">
              <div className="cf-date-label">
                <FontAwesomeIcon icon={faCalendarAlt} /> Du :
              </div>
              <input
                type="date"
                className="cf-date-input"
                value={dateDu}
                onChange={e => setDateDu(e.target.value)}
              />
            </div>

            <div className="cf-date-group">
              <div className="cf-date-label">
                <FontAwesomeIcon icon={faCalendarAlt} /> Au :
              </div>
              <input
                type="date"
                className="cf-date-input"
                value={dateAu}
                onChange={e => setDateAu(e.target.value)}
              />
            </div>

            <button className="cf-btn-valider" onClick={handleValider}>
              <FontAwesomeIcon icon={faSearch} /> Valider
            </button>

            {rechercheLancee && (
              <button className="cf-btn-reset" onClick={handleReset}>
                <FontAwesomeIcon icon={faTimes} /> Réinitialiser
              </button>
            )}
          </div>

          {error && <div className="cf-alert-error">⚠️ {error}</div>}

          {rechercheLancee && !error && (
            <div className="cf-periode-info">
              <div className="cf-badge-periode">
                <FontAwesomeIcon icon={faCalendarAlt} />
                {dateDu && dateAu
                  ? `${formatDate(dateDu)} → ${formatDate(dateAu)}`
                  : dateDu ? `À partir du ${formatDate(dateDu)}`
                  : `Jusqu'au ${formatDate(dateAu)}`}
              </div>
              <div className="cf-badge-result">
                <FontAwesomeIcon icon={faCheckCircle} />
                {filteredFactures.length} facture(s) trouvée(s)
              </div>
            </div>
          )}
        </div>

        {/* ── STATS MINI ── */}
        {filteredFactures.length > 0 && (
          <div className="cf-stats-row">
            <div className="cf-stat-card" style={{ borderTopColor: "#1e3a6e" }}>
              <div className="cf-stat-label">Nb Factures</div>
              <div className="cf-stat-num" style={{ color: "#1e3a6e" }}>{filteredFactures.length}</div>
            </div>
            <div className="cf-stat-card" style={{ borderTopColor: "#1a56db" }}>
              <div className="cf-stat-label">Total HT</div>
              <div className="cf-stat-num" style={{ color: "#152c54", fontSize: 20 }}>
                {totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
              </div>
            </div>
            <div className="cf-stat-card" style={{ borderTopColor: "#7c3aed" }}>
              <div className="cf-stat-label">Total TR</div>
              <div className="cf-stat-num" style={{ color: "#7c3aed", fontSize: 20 }}>
                {totalTR.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
              </div>
            </div>
          </div>
        )}

        {/* ── TABLEAU ── */}
        {loading ? (
          <div className="cf-loading"><span className="cf-spinner" /> Chargement des factures...</div>
        ) : filteredFactures.length === 0 ? (
          <div className="cf-empty">
            <span className="cf-empty-icon">🧾</span>
            <p>{rechercheLancee ? "Aucune facture trouvée pour cette période." : "Aucune facture émise."}</p>
            {rechercheLancee && <span>Essayez une autre plage de dates.</span>}
          </div>
        ) : (
          <div className="cf-table-wrapper">
            <div className="cf-table-title">
              <h3>
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                {rechercheLancee ? "Factures de la période sélectionnée" : "Toutes les factures émises"}
              </h3>
              <span className="cf-table-count">{filteredFactures.length} résultat(s)</span>
            </div>

            <div className="cf-table-scroll">
              <table className="cf-table">
                <thead>
                  <tr>
                    <th>Facture</th>
                    <th>Date</th>
                    <th>Client (Agent)</th>
                    <th>Escale</th>
                    <th>Navire</th>
                    <th className="th-right">HT (DH)</th>
                    <th className="th-right">TR (DH)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFactures.map((f, i) => {
                    const initiales = (f.agent_facturation || "AF").slice(0, 2).toUpperCase();
                    return (
                      <tr key={f._id || i}>
                        <td>
                          <span className="cf-badge-num">{f.numero_facture || "—"}</span>
                        </td>
                        <td className="cf-td-date">
                          {f.date_facturation
                            ? new Date(f.date_facturation).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td>
                          <div className="cf-client-cell">
                            <div className="cf-client-avatar">{initiales}</div>
                            <span>{f.agent_facturation || "—"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="cf-badge-escale">
                            <FontAwesomeIcon icon={faAnchor} />
                            {f.n_escale || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="cf-badge-navire">
                            <FontAwesomeIcon icon={faShip} />
                            {f.navire || "—"}
                          </span>
                        </td>
                        <td className="cf-td-num">
                          {(f.total_ht || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="cf-td-tr">
                          {(f.montant_taxe_reg || f.tr_2 || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="cf-tfoot-label">TOTAL</td>
                    <td className="cf-tfoot-val">
                      {totalHT.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
                    </td>
                    <td className="cf-tfoot-tr">
                      {totalTR.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} DH
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── BOUTON EXPORTER EXCEL ── */}
            <div className="cf-export-bar">
              <button className="cf-btn-excel" onClick={handleExportExcel}>
                <FontAwesomeIcon icon={faFileExcel} />
                Exporter Excel
                <span className="cf-excel-badge">{filteredFactures.length} ligne(s)</span>
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultationFactures;