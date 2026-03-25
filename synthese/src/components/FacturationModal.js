import React, { useState, useEffect } from "react";
import "./FacturationModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faTimes, faPrint, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

function fmt(n) {
  return Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function FacturationModal({ manifeste, onClose, onFactureGeneree }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [fraisPort, setFraisPort] = useState(null);
  const [tarifs, setTarifs] = useState([]);
  const [tauxTR, setTauxTR] = useState(0);   // ← taxe régionale du port
  const [loadingData, setLoadingData] = useState(true);

  const marchandises = manifeste.marchandises || [];

  // ── Charger ports et tarifs ───────────────────────────────────────
  useEffect(() => {
    const charger = async () => {
      try {
        const [resPorts, resTarifs] = await Promise.all([
fetch("/api/ports"),
fetch("/api/tarifs"),
        ]);
        const ports = await resPorts.json();
        const tarifsDB = await resTarifs.json();

        // Trouver port du manifeste
        const portLower = (manifeste.port || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const p = ports.find(p => {
          const nomNorm = (p.nom || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return nomNorm.includes(portLower) || portLower.includes(nomNorm);
        });

        setFraisPort(p ? p.frais_escale : 3500);
        setTauxTR(p ? (p.taxe_regionale || 0) : 0);
        setTarifs(tarifsDB);

      } catch (err) {
        console.error(err);
        setFraisPort(3500);
        setTauxTR(0);
      } finally {
        setLoadingData(false);
      }
    };
    charger();
  }, [manifeste.port]);

  const getCode = (m) => m["code marchandises"] || m["code_marchandises"] || m["code_marchandise"] || m["code"] || "—";
  const getLibelle = (m) => m["libelle"] || m["LIBELLE"] || m["libellé"] || m["designation"] || "—";
  const getTonnage = (m) => parseFloat(m["tonnage"] || m["TONNAGE"] || m["poids"] || 0) || 0;

  const getTarifDB = (libelle) => {
    if (!libelle || libelle === "—" || tarifs.length === 0) return 35;
    const lib = libelle.toLowerCase().trim();
    for (const t of tarifs) {
      if (!t.libelle) continue;
      const tarifLib = t.libelle.toLowerCase();
      const motsTarif = tarifLib.split(/[\s/-]+/).filter(m => m.length > 2);
      const motsLib = lib.split(/[\s/-]+/).filter(m => m.length > 2);
      const match = motsTarif.some(mot => lib.includes(mot)) || motsLib.some(mot => tarifLib.includes(mot));
      if (match) return t.tarif_par_tonne;
    }
    return 35;
  };

  // ── Calculs ───────────────────────────────────────────────────
  const lignes = marchandises.map((m) => {
    const libelle = getLibelle(m);
    const tonnage = getTonnage(m);
    const tarif = getTarifDB(libelle);
    const ht = tonnage * tarif;
    return { libelle, tonnage, tarif, ht, montant_ht: ht, code: getCode(m) };
  });

  const totalHT = lignes.reduce((s, l) => s + l.ht, 0);
  const frais = fraisPort || 3500;
  const sousTotal = totalHT + frais;
  const tr = sousTotal * (tauxTR / 100);        // Taxe Régionale (dynamique selon le port)
  const tva = sousTotal * 0.20;
  const totalTTC = sousTotal + tr + tva;
  const totalNet = totalTTC;

  const handlePrint = () => window.print();

  const handleValider = async () => {
    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      };

      const r1 = await fetch("/api/factures", {
        method: "POST",
        headers,
        body: JSON.stringify({
          manifeste_id: manifeste._id,
          navire: manifeste.navire,
          n_escale: manifeste.n_escale,
          port: manifeste.port,
          date_arrivee: manifeste.date_arrivee,
          date_depart: manifeste.date_depart,
          lignes,
          total_ht: totalHT,
          frais_port: frais,
          sous_total_ht: sousTotal,
          tr_2: tr,
          tva_20: tva,
          total_ttc: totalTTC,
          taux_regional: tauxTR,
          montant_taxe_reg: tr,
          total_net: totalNet,
          agent_facturation: JSON.parse(localStorage.getItem("user") || "{}")?.email || "agent",
        }),
      });
      if (!r1.ok) throw new Error("Erreur création facture");

      const r2 = await fetch(
        `/api/manifeste/facturer/${manifeste._id}`,
        { method: "PUT", headers, body: JSON.stringify({ total_ttc: totalNet }) }
      );
      if (!r2.ok) throw new Error("Erreur mise à jour manifeste");

      setDone(true);
      setTimeout(() => { onFactureGeneree(manifeste._id); onClose(); }, 1800);
    } catch (err) {
      alert("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return (
    <div className="fm-overlay">
      <div className="fm-modal" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <span className="fm-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ marginTop: 12 }}>Chargement des données...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fm-overlay">
      <div className="fm-modal">

        {/* ── En-tête ── */}
        <div className="fm-header">
          <div className="fm-header-left">
            <img src="/assets/logoANP.png" alt="ANP" className="fm-logo" />
            <div>
              <h2 className="fm-title">FACTURE</h2>
              <span className="fm-numero">FACT-{manifeste.n_escale || "000"}-{new Date().getFullYear()}</span>
            </div>
          </div>
          <button className="fm-close no-print" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* ── Infos Facturation (Agent + Navire) ── */}
        <div className="fm-infos-container" style={{ display: "flex", justifyContent: "space-between", gap: "20px", marginBottom: "20px" }}>

          {/* ── Infos Agent ── */}
          <div className="fm-infos" style={{ flex: 1 }}>
            <h3 style={{ fontSize: "14px", color: "#1e293b", marginBottom: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
              ÉMETTEUR (AGENT)
            </h3>
            {[
              { label: "RAISON SOCIALE", val: JSON.parse(localStorage.getItem("user") || "{}")?.raisonSociale || "Non renseigné" },
              { label: "EMAIL", val: JSON.parse(localStorage.getItem("user") || "{}")?.email || "Non renseigné" },
              { label: "RÔLE", val: "Agent de Facturation" },
            ].map((i) => (
              <div className="fm-info-block" key={i.label} style={{ marginBottom: "6px" }}>
                <span className="fm-info-label" style={{ display: "inline-block", width: "120px" }}>{i.label}</span>
                <span className="fm-info-val"><strong>{i.val}</strong></span>
              </div>
            ))}
          </div>

          {/* ── Infos navire ── */}
          <div className="fm-infos" style={{ flex: 1 }}>
            <h3 style={{ fontSize: "14px", color: "#1e293b", marginBottom: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
              CLIENT (NAVIRE)
            </h3>
            {[
              { label: "NAVIRE", val: manifeste.navire },
              { label: "N° ESCALE", val: manifeste.n_escale },
              { label: "PORT", val: manifeste.port },
              { label: "DATE DÉPÔT", val: manifeste.date_depot ? new Date(manifeste.date_depot).toLocaleDateString("fr-FR") : "—" },
              { label: "DATE FACTURE", val: new Date().toLocaleDateString("fr-FR") },
            ].map((i) => (
              <div className="fm-info-block" key={i.label} style={{ marginBottom: "6px" }}>
                <span className="fm-info-label" style={{ display: "inline-block", width: "100px" }}>{i.label}</span>
                <span className="fm-info-val">{i.val || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tableau marchandises ── */}
        <div className="fm-table-wrap">
          <table className="fm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Catégorie de marchandise</th>
                <th>Tonnage (T)</th>
                <th>Tarif (DH/T)</th>
                <th>Montant HT (DH)</th>
              </tr>
            </thead>
            <tbody>
              {lignes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
                    Aucune marchandise trouvée
                  </td>
                </tr>
              ) : (
                lignes.map((l, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <span style={{
                        background: "#fef3c7", color: "#92400e",
                        padding: "2px 8px", borderRadius: "4px",
                        fontFamily: "monospace", fontSize: "12px",
                        fontWeight: 700, border: "1px solid #fcd34d",
                      }}>
                        {l.code}
                      </span>
                    </td>
                    <td className="fm-libelle">{l.libelle}</td>
                    <td className="fm-num">{fmt(l.tonnage)}</td>
                    <td className="fm-num">{fmt(l.tarif)}</td>
                    <td className="fm-num fm-ht">{fmt(l.ht)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Récapitulatif avec taxes combinées ── */}
        <div className="fm-recap">
          <div className="fm-recap-table">
            <div className="fm-recap-row">
              <span>Total Marchandises (HT)</span>
              <span>{fmt(totalHT)} DH</span>
            </div>
            <div className="fm-recap-row">
              <span>Frais d'escale ({manifeste.port})</span>
              <span>{fmt(frais)} DH</span>
            </div>
            <div className="fm-recap-row" style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px", marginTop: "4px" }}>
              <span style={{ fontWeight: 700 }}>SOUS-TOTAL HT</span>
              <span style={{ fontWeight: 700 }}>{fmt(sousTotal)} DH</span>
            </div>
            <div className="fm-recap-row">
              <span>TR ({tauxTR}%)</span>
              <span>{fmt(tr)} DH</span>
            </div>
            <div className="fm-recap-row">
              <span>TVA (20%)</span>
              <span>{fmt(tva)} DH</span>
            </div>
            
            <div className="fm-recap-row fm-recap-total">
              <span>TOTAL TTC</span>
              <span>{fmt(totalTTC)} DH</span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        {!done ? (
          <div className="fm-actions no-print">
            <button className="fm-btn-print" onClick={handlePrint}>
              <FontAwesomeIcon icon={faPrint} /> Imprimer
            </button>
            <button className="fm-btn-valider" onClick={handleValider} disabled={loading}>
              {loading
                ? <><span className="fm-spinner" /> Génération...</>
                : <><FontAwesomeIcon icon={faFileInvoiceDollar} /> Valider la facture</>
              }
            </button>
          </div>
        ) : (
          <div className="fm-success no-print">
            <FontAwesomeIcon icon={faCheckCircle} /> Facture sauvegardée dans la base de données !
          </div>
        )}

      </div>
    </div>
  );
}