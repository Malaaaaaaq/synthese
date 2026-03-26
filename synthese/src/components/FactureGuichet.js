import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin } from "@fortawesome/free-solid-svg-icons";
import "./FactureGuichet.css";

function FactureGuichet() {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ports")
      .then(res => res.json())
      .then(data => {
        const mappedPorts = data.map((p, i) => {
          let photo = `/assets/ports/${p.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, "")}.png`;
          if (p.nom === "Mohammedia") photo = "/assets/ports/port4.jpg";
          if (p.nom === "Essaouira") photo = "/assets/ports/port5.jpg";
          if (p.nom === "Al Hoceima") photo = "/assets/ports/houceima.png";

          return {
            nom: `Port de ${p.nom}`,
            code: p.code || p.nom.substring(0, 5).toUpperCase(),
            region: p.region || "Maroc",
            type: getPortType(p.nom),
            emoji: getPortEmoji(p.nom),
            photo: photo,
            color: getPortColor(p.nom),
            colorLight: getPortColorLight(p.nom),
            desc: getPortDesc(p.nom),
            kpi1: getPortKPI1(p.nom),
            kpi2: getPortKPI2(p.nom),
            featured: p.nom === "Tan-Tan",
            ribbon: p.nom === "Tan-Tan" ? "⚓ Pêche Sud" : (p.nom === "Dakhla" ? "🆕 En expansion" : null),
          };
        });
        setPorts(mappedPorts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur ports:", err);
        setLoading(false);
      });
  }, []);

  // Helper functions for dynamic mapping
  const getPortType = (name) => {
    if (name.includes("Safi")) return "Port Minéralier";
    if (name.includes("Dakhla") || name.includes("Tan-Tan")) return "Port de Pêche";
    if (name.includes("Kénitra")) return "Port Fluvial";
    if (name.includes("Nador")) return "Port Industriel";
    if (name.includes("Agadir")) return "Port Polyvalent";
    return "Port Commercial";
  };

  const getPortEmoji = (name) => {
    if (name.includes("Casablanca")) return "🏙️";
    if (name.includes("Safi")) return "⛏️";
    if (name.includes("Dakhla")) return "🐟";
    if (name.includes("Kénitra")) return "🏞️";
    if (name.includes("Nador")) return "⚙️";
    if (name.includes("Tan-Tan")) return "⚓";
    return "🌊";
  };

  const getPortColor = (name) => {
    const colors = {
      "Casablanca": "#1a56db",
      "Tan-Tan": "#0891b2",
      "Agadir": "#059669",
      "Nador": "#7c3aed",
      "Safi": "#b45309",
      "Kénitra": "#0d9488",
      "Dakhla": "#0369a1",
      "Laâyoune": "#d97706",
      "Al Hoceima": "#2563eb",
      "Mohammedia": "#1e40af",
      "Essaouira": "#0e7490",
    };
    return colors[name] || "#1e3a6e";
  };

  const getPortColorLight = (name) => {
    const colors = {
      "Casablanca": "#eff6ff",
      "Tan-Tan": "#ecfeff",
      "Agadir": "#f0fdf4",
      "Nador": "#f5f3ff",
      "Safi": "#fffbeb",
      "Kénitra": "#f0fdfa",
      "Dakhla": "#f0f9ff",
      "Laâyoune": "#fffbeb",
      "Al Hoceima": "#eff6ff",
      "Mohammedia": "#dbeafe",
      "Essaouira": "#e0f2fe",
    };
    return colors[name] || "#f8fafc";
  };

  const getPortDesc = (name) => {
    const descs = {
      "Casablanca": "Premier port du Maroc, hub économique de l'Atlantique africain traitant 60% du commerce extérieur national.",
      "Tan-Tan": "Port de pêche stratégique du Sud, moteur de développement régional et hub halieutique majeur.",
      "Agadir": "Carrefour du Sud marocain, spécialisé dans la pêche hauturière, l'agro-industrie et les vracs solides.",
      "Nador": "Port industriel stratégique du nord-est, spécialisé dans les produits sidérurgiques et les hydrocarbures.",
      "Safi": "Port dédié aux exportations de phosphates et produits chimiques, pilier de l'industrie minière nationale.",
      "Kénitra": "Port fluvial et maritime sur l'oued Sebou, dédié aux produits agro-alimentaires et au trafic régional.",
      "Dakhla": "Porte d'entrée du Sahara atlantique, en plein essor pour la pêche hauturière et les énergies renouvelables.",
      "Laâyoune": "Principal port du Sahara marocain, spécialisé dans l'exportation de phosphates et les produits de la pêche.",
      "Al Hoceima": "Perle de la Méditerranée, port touristique et de pêche artisanale renommé pour sa beauté et son dynamisme.",
      "Mohammedia": "Hub majeur pour les hydrocarbures et les produits pétroliers, essentiel à l'approvisionnement énergétique du pays.",
      "Essaouira": "Port historique alliant pêche traditionnelle et potentiel touristique, témoin d'un riche patrimoine maritime.",
    };
    return descs[name] || "Port stratégique participant au dynamisme économique et commercial du Royaume du Maroc.";
  };

  const getPortKPI1 = (name) => {
    if (name === "Casablanca") return { val: "60M T", label: "Trafic/an" };
    if (name === "Agadir") return { val: "12M T", label: "Trafic/an" };
    if (name === "Dakhla") return { val: "500K T", label: "Pêche/an" };
    return { val: "5M+ T", label: "Trafic/an" };
  };

  const getPortKPI2 = (name) => {
    if (name === "Casablanca") return { val: "180+", label: "Lignes maritimes" };
    if (name === "Safi") return { val: "OCP", label: "Partenaire clé" };
    return { val: "24/7", label: "Disponibilité" };
  };

  return (
    <div className="fg-page">

      {/* ── HEADER ── */}
      <header className="fg-header">
        <div className="fg-header-brand">
          <img src="/assets/logoANP.png" alt="ANP" className="fg-logo-anp" />
          <div className="fg-brand-divider" />
          <img src="/assets/efacture.png" alt="E-Facture" className="fg-logo-ef" />
        </div>

        <nav className="fg-header-nav">
          <Link to="/" className="fg-nav-link">Accueil</Link>
          <Link to="/apropos" className="fg-nav-link">À propos</Link>
        </nav>

        <div className="fg-header-cta">
          <Link to="/login" className="fg-btn-outline">Connexion</Link>
          <Link to="/register" className="fg-btn-solid">Inscription</Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="fg-hero">
        <div
          className="fg-hero-bg"
          style={{ backgroundImage: "url(/assets/image.png)" }}
        />
        <div className="fg-hero-overlay" />

        <div className="fg-hero-content">
          <span className="fg-hero-badge">Agence Nationale des Ports</span>
          <h1 className="fg-hero-title">
            La facturation portuaire,<br />
            <span className="fg-hero-accent">simplifiée et sécurisée</span>
          </h1>
          <p className="fg-hero-subtitle">
            Gérez vos factures maritimes en temps réel. Suivez vos paiements,
            générez vos rapports et accédez à votre tableau de bord depuis un
            seul espace centralisé.
          </p>
          <div className="fg-hero-actions">
            <Link to="/register" className="fg-btn-hero-primary">
              Accéder au guichet
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/apropos" className="fg-btn-hero-ghost">En savoir plus</Link>
          </div>

          <div className="fg-hero-stats">
            <div className="fg-stat">
              <span className="fg-stat-num">{ports.length || "9"}</span>
              <span className="fg-stat-label">Ports couverts</span>
            </div>
            <div className="fg-stat-sep" />
            <div className="fg-stat">
              <span className="fg-stat-num">99.9%</span>
              <span className="fg-stat-label">Disponibilité</span>
            </div>
            <div className="fg-stat-sep" />
            <div className="fg-stat">
              <span className="fg-stat-num">SSL</span>
              <span className="fg-stat-label">Connexion sécurisée</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION — NOS PORTS
      ══════════════════════════════════════════ */}
      <section className="fg-ports">

        {/* En-tête section */}
        <div className="fg-ports-header">
          <span className="fg-ports-badge">🌍 Notre Réseau</span>
          <h2 className="fg-ports-title">Ports couverts par la plateforme</h2>
          <p className="fg-ports-subtitle">
            E-Facture ANP est déployée sur les principaux ports du Royaume,
            garantissant une gestion unifiée et en temps réel de votre facturation maritime.
          </p>
        </div>

        {/* Cards des ports dynamic */}
        <div className="fg-ports-grid">
          {loading ? (
            <div style={{ color: "white", textAlign: "center", gridColumn: "1/-1", padding: "40px" }}>Chargement des ports...</div>
          ) : (
            ports.map((port, i) => (
              <div
                key={port.code}
                className={`fg-port-card${port.featured ? " fg-port-featured" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {port.ribbon && (
                  <div className="fg-featured-ribbon" style={{
                    background: port.featured
                      ? `linear-gradient(135deg, ${port.color}, #0e7490)`
                      : `linear-gradient(135deg, ${port.color}cc, ${port.color})`,
                  }}>
                    {port.ribbon}
                  </div>
                )}

                {/* ── Photo du port ── */}
                <div className="fg-port-photo-wrap">
                  <img
                    src={port.photo}
                    alt={port.nom}
                    className="fg-port-photo"
                    onError={e => { 
                      const fallbackIndex = (i % 3) + 1;
                      if (!e.target.src.includes(`port1.jpg`) && !e.target.src.includes(`port2.jpg`) && !e.target.src.includes(`port3.jpg`)) {
                        e.target.src = `/assets/ports/port${fallbackIndex}.jpg`;
                      } else {
                        e.target.style.display = "none"; 
                        e.target.nextSibling.style.display = "flex"; 
                      }
                    }}
                  />
                  {/* Fallback si pas de photo du tout */}
                  <div className="fg-port-photo-fallback" style={{ background: `linear-gradient(135deg, ${port.color}22, ${port.colorLight})`, display: "none" }}>
                    <span style={{ fontSize: 48 }}>{port.emoji}</span>
                  </div>
                  {/* Overlay dégradé sur la photo */}
                  <div className="fg-port-photo-overlay" style={{ background: `linear-gradient(to top, ${port.color}ee 0%, ${port.color}44 50%, transparent 100%)` }} />
                  {/* Badges sur la photo */}
                  <div className="fg-port-photo-badges">
                    <span className="fg-port-code-over">{port.code}</span>
                    <span className="fg-port-type-over">{port.type}</span>
                  </div>
                </div>

                {/* ── Corps ── */}
                <div className="fg-port-card-body">
                  <h3 className="fg-port-name">{port.nom}</h3>
                  <p className="fg-port-region">
                    <span className="fg-pin">
                      <FontAwesomeIcon icon={faMapPin} style={{ marginRight: '6px', color: port.color }} />
                    </span>
                    {port.region}
                  </p>
                  <p className="fg-port-desc">{port.desc}</p>
                  <div className="fg-port-stats-row">
                    <div className="fg-port-kpi" style={{ background: port.colorLight }}>
                      <span className="fg-kpi-val" style={{ color: port.color }}>{port.kpi1.val}</span>
                      <span className="fg-kpi-label">{port.kpi1.label}</span>
                    </div>
                    <div className="fg-port-kpi" style={{ background: port.colorLight }}>
                      <span className="fg-kpi-val" style={{ color: port.color }}>{port.kpi2.val}</span>
                      <span className="fg-kpi-label">{port.kpi2.label}</span>
                    </div>
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="fg-port-card-footer" style={{ color: port.color, background: port.colorLight, borderTop: `1px solid ${port.color}20` }}>
                  <span className="fg-port-dot" style={{ background: port.color, boxShadow: `0 0 6px ${port.color}` }} />
                  <span>Connecté à E-Facture</span>
                  <span className="fg-port-actif">● Actif</span>
                </div>
              </div>
            ))
          )}

        </div>

        {/* Bande du bas */}
        <div className="fg-ports-bottom-bar">
          <div className="fg-bottom-stat">
            <span className="fg-bottom-num">{ports.length || "12"}</span>
            <span className="fg-bottom-label">Ports intégrés</span>
          </div>
          <div className="fg-bottom-sep" />
          <div className="fg-bottom-stat">
            <span className="fg-bottom-num">100M+</span>
            <span className="fg-bottom-label">Tonnes traitées/an</span>
          </div>
          <div className="fg-bottom-sep" />
          <div className="fg-bottom-stat">
            <span className="fg-bottom-num">100%</span>
            <span className="fg-bottom-label">Dématérialisé</span>
          </div>
          <div className="fg-bottom-sep" />
          <div className="fg-bottom-stat">
            <span className="fg-bottom-num">24/7</span>
            <span className="fg-bottom-label">Disponibilité</span>
          </div>
        </div>

      </section>

      {/* ── FOOTER ── */}
      <footer className="fg-footer">
        <div className="fg-footer-inner">

          {/* Brand */}
          <div className="fg-footer-brand">
            <div className="fg-footer-logo-row">
              <img src="/assets/logoANP.png" alt="ANP" className="fg-footer-logo" />
              <div>
                <div className="fg-footer-brand-name">e-Facture</div>
                <div className="fg-footer-brand-sub">Agence Nationale des Ports</div>
              </div>
            </div>
            <p className="fg-footer-desc">
              Plateforme officielle de gestion des factures maritimes.
              Simplifiez votre workflow de facturation avec une solution
              sécurisée, rapide et centralisée.
            </p>
            <div className="fg-footer-contacts">
              {[
                { icon: "✉", text: "contact@anp.org.ma" },
                { icon: "☎", text: "+212 522 23 33 44" },
                { icon: "⊕", text: "www.anp.org.ma" },
              ].map(({ icon, text }) => (
                <div key={text} className="fg-contact-row">
                  <span className="fg-contact-icon">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="fg-footer-col">
            <h4 className="fg-footer-col-title">Navigation</h4>
            <Link to="/" className="fg-footer-link">Accueil</Link>
            <Link to="/login" className="fg-footer-link">Connexion</Link>
            <Link to="/register" className="fg-footer-link">Inscription</Link>
            <Link to="/apropos" className="fg-footer-link">À propos</Link>
          </div>

          {/* Services */}
          <div className="fg-footer-col">
            <h4 className="fg-footer-col-title">Services</h4>
            <span className="fg-footer-link">
              Facturation <span className="fg-new-badge">Nouveau</span>
            </span>
            <span className="fg-footer-link">Suivi des paiements</span>
            <span className="fg-footer-link">Rapports analytiques</span>
            <span className="fg-footer-link">Tableau de bord</span>
          </div>

          {/* Légal */}
          <div className="fg-footer-col">
            <h4 className="fg-footer-col-title">Légal</h4>
            <span className="fg-footer-link">Politique de confidentialité</span>
            <span className="fg-footer-link">Conditions d'utilisation</span>
            <span className="fg-footer-link">Mentions légales</span>
          </div>
        </div>

        <div className="fg-footer-bottom">
          <span>© 2026 E-Facture ANP — Tous droits réservés</span>
          <span>Développé par <strong>Malak Tamrani</strong></span>
        </div>
      </footer>

    </div>
  );
}

export default FactureGuichet;