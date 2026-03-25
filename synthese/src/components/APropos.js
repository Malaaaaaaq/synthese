import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Target,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  FileText,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import "./APropos.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

function Apropos() {
  const [startNow, setStartNow] = useState(false);
  const navigate = useNavigate();

  const handleStartNow = (e) => {
    e.preventDefault();
    if (!startNow) {
      alert("Veuillez cocher la case pour continuer.");
      return;
    }
    navigate("/register");
  };

  const stats = [
    { icon: <FileText size={18} />, label: "Gestion Intelligente" },
    { icon: <ShieldCheck size={18} />, label: "Haute Sécurité" },
    { icon: <LayoutDashboard size={18} />, label: "Tableaux de Bord" },
  ];

  return (
    <div className="apropos-container">

      {/* ── HEADER (même style que FactureGuichet) ── */}
      <header className="fg-header">
        <div className="fg-header-brand">
          <img src="/assets/logoANP.png" alt="ANP" className="fg-logo-anp" />
          <div className="fg-brand-divider" />
          <img src="/assets/efacture.png" alt="E-Facture" className="fg-logo-ef" />
        </div>

        <nav className="fg-header-nav">
          <Link to="/" className="fg-nav-link">Accueil</Link>
          <Link to="/apropos" className="fg-nav-link active-link">À propos</Link>
        </nav>

        <div className="fg-header-cta">
          <Link to="/login" className="fg-btn-outline">Connexion</Link>
          <Link to="/register" className="fg-btn-solid">Inscription</Link>
        </div>
      </header>

      {/* Background Decoration */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      {/* ── HEADER CONTENT ── */}
      <motion.header
        className="apropos-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="header-badge"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          À Propos
        </motion.div>
        <h1>
          Simplifiez votre <span>Gestion de Facturation</span>
        </h1>
        <p>
          Découvrez une solution révolutionnaire pour piloter vos factures
          fournisseurs, optimiser vos flux financiers et sécuriser vos
          opérations de bout en bout.
        </p>

        <div className="header-stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-item">
              <span className="stat-icon">{stat.icon}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.header>

      {/* ── FEATURE CARDS ── */}
      <motion.section
        className="apropos-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div className="feature-card" variants={itemVariants}>
          <div className="icon-wrapper mission">
            <Target size={28} />
          </div>
          <h2>Notre Mission</h2>
          <p>
            Nous transformons la complexité administrative en fluidité
            opérationnelle. Notre but est de redonner du temps aux équipes
            en automatisant les tâches à faible valeur ajoutée.
          </p>
        </motion.div>

        <motion.div className="feature-card" variants={itemVariants}>
          <div className="icon-wrapper features">
            <Zap size={28} />
          </div>
          <h2>Fonctionnalités Clés</h2>
          <ul className="feature-list">
            {[
              "Suivi en temps réel des factures",
              "Rapports analytiques détaillés",
              "Validation multi-niveaux sécurisée",
              "Compatibilité multi-plateforme",
            ].map((item) => (
              <li key={item}>
                <CheckCircle2 size={15} className="check-icon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="feature-card" variants={itemVariants}>
          <div className="icon-wrapper team">
            <Users size={28} />
          </div>
          <h2>L'Équipe</h2>
          <p>
            Propulsé par une vision d'excellence et d'innovation. Développé
            par <strong style={{ color: "#4db8ff" }}>Malak Tamrani</strong> dans
            le cadre d'un projet de synthèse ambitieux, visant à moderniser
            les outils de gestion d'entreprise.
          </p>
        </motion.div>
      </motion.section>

      {/* ── CTA ── */}
      <motion.section
        className="cta-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="cta-content">
          <div className="cta-top-bar" />
          <div className="cta-inner">
            <div className="cta-grid">

              {/* Colonne gauche — pitch */}
              <div className="cta-col-left">
                <div className="cta-eyebrow">Passez à l'action</div>
                <h2>
                  Transformez votre gestion<br />
                  <span>financière</span> dès aujourd'hui
                </h2>
                <p>
                  Des milliers de transactions portuaires gérées avec précision.
                  Rejoignez la plateforme de référence de l'ANP.
                </p>
                <ul className="cta-feat-list">
                  {[
                    "Accès immédiat après inscription",
                    "Données sécurisées & chiffrées SSL",
                    "Support dédié 24/7",
                    "Aucun engagement requis",
                  ].map((f) => (
                    <li key={f}>
                      <span className="cta-feat-dot" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="cta-trust">
                  {[
                    { num: "3", label: "Ports couverts" },
                    { num: "99.9%", label: "Disponibilité" },
                    { num: "SSL", label: "Connexion sécurisée" },
                  ].map((s, i) => (
                    <>
                      {i > 0 && <div key={`sep-${i}`} className="cta-trust-sep" />}
                      <div key={s.num} className="cta-trust-item">
                        <span className="cta-trust-num">{s.num}</span>
                        <span className="cta-trust-label">{s.label}</span>
                      </div>
                    </>
                  ))}
                </div>
              </div>

              <div className="cta-col-divider" />

              {/* Colonne droite — formulaire */}
              <div className="cta-col-right">
                <div className="cta-form-box">
                  <div className="cta-form-title">Créer votre compte</div>
                  <div className="cta-form-sub">Accédez au guichet E-Facture ANP</div>
                  <form onSubmit={handleStartNow} className="cta-form">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={startNow}
                        onChange={(e) => setStartNow(e.target.checked)}
                      />
                      <span className="checkmark" />
                      Je souhaite commencer maintenant
                    </label>
                    <motion.button
                      type="submit"
                      className={`cta-button ${startNow ? "active" : ""}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowRight size={16} />
                      COMMENCER MAINTENANT
                    </motion.button>
                  </form>
                  <Link to="/" className="cta-back-link">← Retour à l'accueil</Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer className="apropos-footer">
        <p>© 2026 E-Facture ANP — Tous droits réservés</p>
      </footer>

    </div>
  );
}

export default Apropos;