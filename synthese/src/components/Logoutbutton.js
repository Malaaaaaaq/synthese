import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import "./Logoutbutton.css";

export default function LogoutButton({ variant = "default" }) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const handleLogout = () => {
    // Vider le localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Rediriger vers login
    navigate("/login");
  };

  if (confirm) {
    return (
      <div className={`logout-confirm ${variant}`}>
        <span>Déconnecter ?</span>
        <button className="logout-yes" onClick={handleLogout}>Oui</button>
        <button className="logout-no" onClick={() => setConfirm(false)}>Non</button>
      </div>
    );
  }

  return (
    <button
      className={`logout-btn ${variant}`}
      onClick={() => setConfirm(true)}
      title="Se déconnecter"
    >
      <FontAwesomeIcon icon={faRightFromBracket} />
      <span>Déconnexion</span>
    </button>
  );
}