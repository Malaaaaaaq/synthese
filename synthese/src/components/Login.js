import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, saveToken, saveUser } from "../services/api";
import Lottie from "lottie-react";
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEyeSlash,faEye } from "@fortawesome/free-solid-svg-icons";
function Login() {
  const navigate = useNavigate();

  const [animData, setAnimData] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "agent_maritime"
  });

  const [error, setError]      = useState("");
  const [success, setSuccess]  = useState("");
  const [loading, setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    fetch("/login-animation.json")
      .then(res => res.json())
      .then(data => setAnimData(data))
      .catch(err => console.error("Animation non trouvée:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await login({ email: formData.email, password: formData.password });
      saveToken(data.token);
      saveUser(data);
      setSuccess("Connexion réussie ! Redirection...");
      setTimeout(() => {
        navigate(formData.role === "agent_facturation" ? "/facturation" : "/agent-maritime");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
       
    <div className="login-page">
      
      {/* ── Logo ── */}
      <img src="/assets/efacture.png" alt="E-facture" className="efacture-logo" />

      {/* ── Panneau gauche bleu ── */}
      <div className="login-left">
        <div className="lottie-wrap">
          {animData && <Lottie animationData={animData} loop={true} />}
        </div>
      </div>

      {/* ── Séparateur diagonal ── */}
      <div className="diagonal-divider" />

      {/* ── Panneau droit gris clair ── */}
      <div className="login-right">

        {/* Cercles décoratifs */}
        <div className="circle circle-top" />
        <div className="circle circle-bottom" />

        {/* Carte flottante */}
        <div className="login-card">

          <h1 className="title">Welcome Back</h1>
          <p className="subtitle">Connectez-vous à votre espace maritime</p>

          {error   && <div className="error-alert">⚠️ {error}</div>}
          {success && <div className="success-alert">✅ {success}</div>}

          <form className="login-form" onSubmit={handleSubmit}>

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Entrer votre email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Mot de passe</label>
            <div className="pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Entrer votre mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
  type="button" 
  className="toggle-pass" 
  onClick={() => setShowPass(!showPass)}
>
  {showPass ? <FontAwesomeIcon icon={faEye} />: <FontAwesomeIcon icon={faEyeSlash} /> }
</button>
            </div>

            <label>Type d'agent</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="agent_maritime">Agent Maritime</option>
              <option value="agent_facturation">Agent Facturation</option>
            </select>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading
                ? <span className="btn-loading"><span className="spinner" /> Connexion...</span>
                : "SIGN IN"
              }
            </button>

          </form>

          <p className="register-text">
            Vous n'avez pas de compte ?{" "}
            <Link to="/register" className="link-register">Inscrivez-vous</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
