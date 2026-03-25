import React, { useState, useEffect, useRef } from "react";
import "./TableauDeBord.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoiceDollar, faShip, faCheckCircle,
  faWeightHanging, faClock, faChartBar, faListAlt,
  faRotate, faAnchor, faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import LogoutButton from "./Logoutbutton";

const getToken  = () => localStorage.getItem("token");
function getNomAgent() {
  try { const u = JSON.parse(localStorage.getItem("user")||"{}"); return u.raisonSociale||u.email||"Agent"; } catch { return "Agent"; }
}
function getInitiales() {
  return "AF";
}
function formatDate(d) {
  if(!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"});
}
function fmt(n) {
  return Number(n).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
}

// ── Animation Canvas Maritime ──────────────────────────────────
function MaritimeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particules (bulles + étoiles)
    const particles = Array.from({ length: 60 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      alpha: Math.random() * 0.5 + 0.1,
      drift: (Math.random() - 0.5) * 0.3,
    }));

    // Navires (silhouettes simples)
    const ships = [
      { x: -200, y: 0.38, speed: 0.18, scale: 1.0, alpha: 0.22 },
      { x: -500, y: 0.55, speed: 0.10, scale: 0.65, alpha: 0.15 },
      { x: -900, y: 0.44, speed: 0.14, scale: 0.80, alpha: 0.18 },
    ];

    // Dessiner silhouette navire
    const drawShip = (x, y, scale, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = "#4db8ff";
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Coque
      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.lineTo(60, 0);
      ctx.lineTo(50, 18);
      ctx.lineTo(-50, 18);
      ctx.closePath();
      ctx.fill();

      // Superstructure
      ctx.fillRect(-20, -22, 40, 22);
      ctx.fillRect(-5, -38, 20, 16);

      // Cheminée
      ctx.fillRect(8, -50, 8, 14);

      // Mât
      ctx.strokeStyle = "#4db8ff";
      ctx.lineWidth   = 1.5;
      ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-30, -28);
      ctx.stroke();

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.012;

      // ── Vagues multiples ──────────────────────────────────
      const waveConfigs = [
        { y: 0.70, amp: 18, freq: 0.012, speed: 1.0, alpha: 0.12, color: "#1a56db" },
        { y: 0.75, amp: 14, freq: 0.018, speed: 1.4, alpha: 0.10, color: "#2a4f8f" },
        { y: 0.80, amp: 10, freq: 0.022, speed: 0.8, alpha: 0.14, color: "#1e3a6e" },
        { y: 0.85, amp:  7, freq: 0.030, speed: 1.6, alpha: 0.18, color: "#152c54" },
        { y: 0.90, amp:  5, freq: 0.038, speed: 1.2, alpha: 0.22, color: "#0f1f3d" },
      ];

      waveConfigs.forEach(w => {
        const baseY = canvas.height * w.y;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 3) {
          const y = baseY + Math.sin(x * w.freq + t * w.speed) * w.amp
                          + Math.sin(x * w.freq * 1.7 + t * w.speed * 0.6) * (w.amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.globalAlpha = w.alpha;
        ctx.fill();
      });

      // ── Reflets sur l'eau ──────────────────────────────────
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 8; i++) {
        const rx = (canvas.width * 0.1 * i + t * 15) % (canvas.width + 100);
        const ry = canvas.height * (0.72 + i * 0.02);
        ctx.fillStyle = "#7eb8f7";
        ctx.beginPath();
        ctx.ellipse(rx, ry, 40 + i * 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Navires qui traversent ─────────────────────────────
      ships.forEach(ship => {
        ship.x += ship.speed;
        if (ship.x > canvas.width + 300) ship.x = -300;
        const sy = canvas.height * ship.y + Math.sin(t * 0.8 + ship.x * 0.01) * 3;
        drawShip(ship.x, sy, ship.scale, ship.alpha);
      });

      // ── Particules flottantes ──────────────────────────────
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }

        ctx.globalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(t * 2 + p.x));
        ctx.fillStyle   = "#4db8ff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Lignes de grille subtiles ──────────────────────────
      ctx.globalAlpha = 0.03;
      ctx.strokeStyle = "#4db8ff";
      ctx.lineWidth   = 0.5;
      for (let x = 0; x < canvas.width; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height * 0.7; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="tdb-canvas" />;
}

// ── Composant principal ────────────────────────────────────────
export default function TableauDeBord() {
  const navigate   = useNavigate();
  const [manifestes, setManifestes] = useState([]);
  const [factures,   setFactures]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/manifeste/all", { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch("http://localhost:5000/api/factures",      { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      setManifestes(Array.isArray(await r1.json()) ? await r1.json() : []);
      setFactures(Array.isArray(await r2.json())   ? await r2.json() : []);
    } catch {
      setManifestes([]); setFactures([]);
    } finally { setLoading(false); }
  };

  // Recharger correctement
  const charger = async () => {
    setLoading(true);
    try {
      const res1 = await fetch("/api/manifeste/all", { headers: { Authorization: `Bearer ${getToken()}` } });
      const res2 = await fetch("http://localhost:5000/api/factures",      { headers: { Authorization: `Bearer ${getToken()}` } });
      const m = await res1.json(); const f = await res2.json();
      setManifestes(Array.isArray(m) ? m : []);
      setFactures(Array.isArray(f)   ? f : []);
    } catch { setManifestes([]); setFactures([]); }
    finally   { setLoading(false); }
  };

  useEffect(() => { charger(); }, []);

  const stats = {
    total:     manifestes.length,
    factures_n:manifestes.filter(m => m.statut === "facture").length,
    enAttente: manifestes.filter(m => m.statut !== "facture").length,
    tonnage:   manifestes.reduce((a,m) => a + (m.marchandises||[]).reduce((s,mc)=>s+(parseFloat(mc.tonnage)||0),0), 0),
    totalTTC:  factures.reduce((s,f)   => s + (f.total_ttc||0), 0),
  };

  const parPort = factures.reduce((acc, f) => {
    const p = f.port || "Inconnu";
    if (!acc[p]) acc[p] = { count: 0, total: 0 };
    acc[p].count++; acc[p].total += f.total_ttc || 0;
    return acc;
  }, {});
  const portsData = Object.entries(parPort).sort((a,b)=>b[1].total-a[1].total).slice(0,6);
  const maxTotal  = Math.max(...portsData.map(([,v])=>v.total), 1);

  const dernieresFactures = [...factures]
    .sort((a,b) => new Date(b.date_facturation) - new Date(a.date_facturation))
    .slice(0, 5);

  const COLORS = ["#1a56db","#0369a1","#0891b2","#2a4f8f","#1e3a6e","#3b82f6"];

  return (
    <div className="tdb-container">

      {/* ── ANIMATION DE FOND ── */}
      <MaritimeCanvas />

      {/* ── TOP BAR ── */}
      <div className="tdb-header">
        <div className="tdb-header-left">
          <div className="tdb-avatar">{getInitiales()}</div>
          <div>
            <div className="tdb-agent-name">{getNomAgent()}</div>
            <div className="tdb-agent-role">Agent de Facturation</div>
          </div>
        </div>
        <div className="tdb-header-right">
          <button className="tdb-btn-back" onClick={() => navigate("/facturation")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Retour
          </button>
          <button className="tdb-btn-refresh" onClick={charger}>
            <FontAwesomeIcon icon={faRotate} /> Actualiser
          </button>
          <LogoutButton />
          <div className="tdb-logo">
            <div className="tdb-logo-icon">EF</div>
            <div>
              <div className="tdb-logo-text">E-Facture</div>
              <div className="tdb-logo-sub">Agence Nationale des Ports</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TITRE PAGE ── */}
      <div className="tdb-page-title">
        <div className="tdb-title-icon"><FontAwesomeIcon icon={faChartBar} /></div>
        <div>
          <h1>Tableau de Bord</h1>
          <p>Vue d'ensemble de l'activité de facturation portuaire — données en temps réel</p>
        </div>
      </div>

      {loading ? (
        <div className="tdb-loading">
          <span className="tdb-spinner" />
          Chargement du tableau de bord...
        </div>
      ) : (
        <div className="tdb-content">

          {/* ── STATS ── */}
          <div className="tdb-stats-grid">
            {[
              { icon: faShip,             label: "Total Manifestes",   val: stats.total,     color:"#1a56db", bg:"rgba(26,86,219,0.12)" },
              { icon: faClock,            label: "Non Facturés",       val: stats.enAttente, color:"#f59e0b", bg:"rgba(245,158,11,0.12)" },
              { icon: faCheckCircle,      label: "Facturés",           val: stats.factures_n,color:"#10b981", bg:"rgba(16,185,129,0.12)" },
              { icon: faWeightHanging,    label: "Tonnage Total (T)",  val: stats.tonnage.toLocaleString("fr-FR",{maximumFractionDigits:0}), color:"#0891b2", bg:"rgba(8,145,178,0.12)" },
              { icon: faFileInvoiceDollar,label: "Chiffre d'Affaires", val: fmt(stats.totalTTC)+" DH", color:"#7c3aed", bg:"rgba(124,58,237,0.12)", wide:true },
            ].map((s,i) => (
              <div key={i} className={`tdb-stat-card ${s.wide?"tdb-stat-wide":""}`}
                style={{"--c":s.color,"--bg":s.bg, animationDelay:`${i*0.1}s`}}>
                <div className="tdb-stat-icon"><FontAwesomeIcon icon={s.icon} /></div>
                <div>
                  <div className="tdb-stat-val">{s.val}</div>
                  <div className="tdb-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── GRAPHIQUE + DERNIÈRES FACTURES ── */}
          <div className="tdb-main-grid">

            <div className="tdb-card">
              <div className="tdb-card-header">
                <h3><FontAwesomeIcon icon={faAnchor} /> Factures par Port</h3>
                <span className="tdb-card-badge">{portsData.length} ports</span>
              </div>
              {portsData.length === 0 ? (
                <div className="tdb-empty">Aucune facture générée</div>
              ) : (
                <div className="tdb-chart">
                  {portsData.map(([port, data], i) => (
                    <div key={port} className="tdb-bar-row">
                      <div className="tdb-bar-label">{port}</div>
                      <div className="tdb-bar-track">
                        <div className="tdb-bar-fill" style={{ width:`${(data.total/maxTotal)*100}%`, background:COLORS[i%COLORS.length], animationDelay:`${i*0.12}s` }} />
                      </div>
                      <div className="tdb-bar-info">
                        <span className="tdb-bar-count">{data.count} facture{data.count>1?"s":""}</span>
                        <span className="tdb-bar-total">{fmt(data.total)} DH</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="tdb-card">
              <div className="tdb-card-header">
                <h3><FontAwesomeIcon icon={faListAlt} /> Dernières Factures</h3>
                <span className="tdb-card-badge">{factures.length} au total</span>
              </div>
              {dernieresFactures.length === 0 ? (
                <div className="tdb-empty">Aucune facture générée</div>
              ) : (
                <div className="tdb-factures-list">
                  {dernieresFactures.map((f,i) => (
                    <div key={f._id} className="tdb-facture-row" style={{animationDelay:`${i*0.08}s`}}>
                      <div>
                        <div className="tdb-facture-num">{f.numero_facture || `FACT-${f.n_escale}-${new Date(f.date_facturation).getFullYear()}`}</div>
                        <div className="tdb-facture-meta">
                          <span>🚢 {f.navire||"—"}</span>
                          <span>📍 {f.port||"—"}</span>
                          <span>📅 {formatDate(f.date_facturation)}</span>
                        </div>
                      </div>
                      <div className="tdb-facture-right">
                        <div className="tdb-facture-ttc">{fmt(f.total_ttc||0)} DH</div>
                        <span className="tdb-facture-badge">✅ Émise</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RÉPARTITION ── */}
          <div className="tdb-card tdb-repartition-card">
            <div className="tdb-card-header">
              <h3><FontAwesomeIcon icon={faChartBar} /> Répartition des Manifestes</h3>
            </div>
            <div className="tdb-repartition">
              <div className="tdb-rep-item">
                <div className="tdb-rep-circle" style={{"--pct":`${stats.total?(stats.factures_n/stats.total)*100:0}%`,"--color":"#10b981"}}>
                  <span>{stats.total?Math.round((stats.factures_n/stats.total)*100):0}%</span>
                </div>
                <div className="tdb-rep-label">Facturés</div>
                <div className="tdb-rep-val" style={{color:"#10b981"}}>{stats.factures_n}</div>
              </div>
              <div className="tdb-rep-item">
                <div className="tdb-rep-circle" style={{"--pct":`${stats.total?(stats.enAttente/stats.total)*100:0}%`,"--color":"#f59e0b"}}>
                  <span>{stats.total?Math.round((stats.enAttente/stats.total)*100):0}%</span>
                </div>
                <div className="tdb-rep-label">Non Facturés</div>
                <div className="tdb-rep-val" style={{color:"#f59e0b"}}>{stats.enAttente}</div>
              </div>
              <div className="tdb-rep-bar-wrap">
                <div className="tdb-rep-bar-label">
                  <span style={{color:"#10b981"}}>■ Facturés ({stats.factures_n})</span>
                  <span style={{color:"#f59e0b"}}>■ Non facturés ({stats.enAttente})</span>
                </div>
                <div className="tdb-rep-bar">
                  <div className="tdb-rep-bar-green" style={{width:`${stats.total?(stats.factures_n/stats.total)*100:0}%`}} />
                  <div className="tdb-rep-bar-orange" style={{width:`${stats.total?(stats.enAttente/stats.total)*100:0}%`}} />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}