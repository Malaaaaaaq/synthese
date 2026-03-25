import React, { useState, useEffect } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash, faEye } from "@fortawesome/free-solid-svg-icons";
import { register, saveToken, saveUser } from "../services/api";
import Lottie from "lottie-react";

function Register() {
  const navigate = useNavigate();
  const [animData, setAnimData] = useState(null);
  const [formData, setFormData] = useState({
    raisonSociale: "",
    ice: "",
    telephone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "agent_maritime"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    fetch("/login.json")
      .then(res => res.json())
      .then(data => setAnimData(data))
      .catch(err => console.error("Animation non trouvée:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        raisonSociale: formData.raisonSociale,
        ice: formData.ice,
        telephone: formData.telephone,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      const data = await register(userData);
      
      saveToken(data.token);
      saveUser(data);
      
      if (data.role === "agent_facturation") {
        navigate("/facturation");
      } else {
        navigate("/agent-maritime");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      
      {/* ── Logo ── */}
      <img src="/assets/efacture.png" alt="E-facture" className="efacture-logo" />

      {/* ── Panneau gauche bleu ── */}
      <div className="register-left">
        <div className="lottie-wrap">
          {animData && <Lottie animationData={animData} loop={true} />}
        </div>
      </div>

      {/* ── Séparateur diagonal ── */}
      <div className="diagonal-divider" />

      {/* ── Panneau droit gris clair ── */}
      <div className="register-right">
        {/* Cercles décoratifs */}
        <div className="circle circle-top" />
        <div className="circle circle-bottom" />

        {/* Carte flottante */}
        <div className="register-card">
          <h1 className="title">Créer un compte</h1>
          <p className="subtitle">
            Inscription au système de gestion de facturation maritime
          </p>

          {error && <div className="error-alert">⚠️ {error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Rôle</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  required
                >
                  <option value="agent_maritime">Agent Maritime</option>
                  <option value="agent_facturation">Agent Facturation</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div className="form-group">
                <label>ICE</label>
                <input
                  type="text"
                  name="ice"
                  placeholder="Votre ICE"
                  value={formData.ice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Raison Sociale</label>
            <input
              type="text"
              name="raisonSociale"
              placeholder="Votre raison sociale"
              value={formData.raisonSociale}
              onChange={handleChange}
              required
            />

            <div className="form-row">
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  placeholder="Votre numéro de téléphone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Votre email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mot de passe</label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="Créer un mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button 
                    type="button" 
                    className="toggle-pass" 
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <FontAwesomeIcon icon={faEye} />: <FontAwesomeIcon icon={faEyeSlash} /> }
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirmer</label>
                <div className="pass-wrap">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirmer"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    type="button" 
                    className="toggle-pass" 
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? <FontAwesomeIcon icon={faEye} />: <FontAwesomeIcon icon={faEyeSlash} /> }
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-register" disabled={loading}>
              {loading
                ? <span className="btn-loading"><span className="spinner" /> Inscription...</span>
                : "S'INSCRIRE"
              }
            </button>
          </form>

          <p className="login-text">
            Vous avez déjà un compte ?{" "}
            <Link to="/login" className="link-register">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
