import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={{ background: "#0d1b2e", color: "#e2e8f0", fontFamily: "sans-serif", padding: "3.5rem 3rem 0" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.8fr 1fr 1fr 1fr",
        gap: "3rem",
        maxWidth: "1100px",
        margin: "0 auto",
        paddingBottom: "2.5rem",
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
      }}>

        {/* Brand */}
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: "14px",
            marginBottom: "2.3rem", paddingBottom: "1.7rem",
            borderBottom: "0.5px solid rgba(255,255,255,0.08)",
          }}>
            <img
              src="/assets/logoANP.png"
              alt="ANP Logo"
              style={{ height: "52px", width: "auto", background: "white", borderRadius: "8px", padding: "6px 10px" }}
            />
            <div>
              <div style={{ fontSize: "17px", fontWeight: "500", color: "#f1f5f9" }}>e-Facture</div>
              <div style={{ fontSize: "10px", color: "#4db8ff", textTransform: "uppercase", letterSpacing: "2.5px", marginTop: "2px" }}>
                Agence Nationale des Ports
              </div>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#7f93aa", lineHeight: "1.75", marginBottom: "1.4rem" }}>
            Plateforme de gestion des factures maritimes. Simplifiez votre workflow de facturation avec une solution sécurisée et centralisée.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            {["contact@anp.org.ma", "+212 522 23 33 44", "www.anp.org.ma"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "12.5px", color: "#7f93aa" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#378ADD", flexShrink: 0, display: "inline-block" }} />
                {item}
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", marginTop: "1.6rem",
            border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "8px", overflow: "hidden",
          }}>
            {[{ num: "3", label: "Ports couverts" }, { num: "99.9%", label: "Disponibilité" }, { num: "SSL", label: "Sécurisé" }].map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: "center", padding: "10px 0",
                borderRight: i < 2 ? "0.5px solid rgba(255,255,255,0.08)" : "none",
              }}>
                <div style={{ fontSize: "18px", fontWeight: "500", color: "#4db8ff" }}>{s.num}</div>
                <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div style={colTitle}>Navigation</div>
          <Link to="/" style={linkStyle}>Accueil</Link>
          <Link to="/login" style={linkStyle}>Connexion</Link>
          <Link to="/register" style={linkStyle}>Inscription</Link>
          <Link to="/apropos" style={linkStyle}>À propos</Link>
        </div>

        {/* Services */}
        <div>
          <div style={colTitle}>Services</div>
          <a href="#" style={linkStyle}>
            Facturation <span style={badge}>Nouveau</span>
          </a>
          <a href="#" style={linkStyle}>Suivi des paiements</a>
          <a href="#" style={linkStyle}>Rapports</a>
          <a href="#" style={linkStyle}>Tableau de bord</a>
        </div>

        {/* Légal */}
        <div>
          <div style={colTitle}>Légal</div>
          <a href="#" style={linkStyle}>Politique de confidentialité</a>
          <a href="#" style={linkStyle}>Conditions d'utilisation</a>
          <a href="#" style={linkStyle}>Mentions légales</a>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: "1100px", margin: "0 auto", padding: "1.2rem 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: "12px", color: "#3d5166",
      }}>
        <span>© 2026 E-Facture ANP — Tous droits réservés</span>
        <span>Développé par <strong style={{ color: "#4db8ff", fontWeight: "500" }}>Malak Tamrani</strong></span>
      </div>
    </footer>
  );
}

const colTitle = {
  fontSize: "10.5px", fontWeight: "500", color: "#4db8ff",
  textTransform: "uppercase", letterSpacing: "2.5px",
  marginBottom: "1.1rem", paddingBottom: "0.6rem",
  borderBottom: "0.5px solid rgba(77,184,255,0.2)",
};

const linkStyle = {
  display: "flex", alignItems: "center", gap: "6px",
  fontSize: "13px", color: "#7f93aa", textDecoration: "none", padding: "5px 0",
};

const badge = {
  fontSize: "9px", background: "rgba(68, 55, 211, 0.2)",
  color: "#4db8ff", padding: "2px 6px", borderRadius: "4px",
};

export default Footer;
