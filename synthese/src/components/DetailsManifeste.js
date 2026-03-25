import React from "react";
import "./DetailsManifeste.css";

function DetailsManifeste({ manifeste, onClose }) {
  // Garde : si pas de manifeste passé en props
  if (!manifeste) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Détails du Manifeste</h2>
          <p style={{ color: '#e74c3c' }}>Aucun manifeste sélectionné.</p>
          {onClose && <button onClick={onClose}>Fermer</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Détails du Manifeste</h2>

        <p><strong>N° Escale:</strong> {manifeste.n_escale || '—'}</p>
        <p><strong>Navire:</strong> {manifeste.navire || '—'}</p>
        <p><strong>Port:</strong> {manifeste.port || '—'}</p>
        <p><strong>Date d'arrivée:</strong> {manifeste.date_arrivee ? new Date(manifeste.date_arrivee).toLocaleDateString('fr-FR') : '—'}</p>
        <p><strong>Date départ:</strong> {manifeste.date_depart ? new Date(manifeste.date_depart).toLocaleDateString('fr-FR') : '—'}</p>
        <p><strong>Date dépôt:</strong> {manifeste.date_depot ? new Date(manifeste.date_depot).toLocaleDateString('fr-FR') : '—'}</p>
        <p><strong>Statut:</strong> {manifeste.statut === 'facture' ? '✅ Facturé' : '🔴 Non facturé'}</p>
        <p><strong>Marchandises:</strong> {(manifeste.marchandises || []).length} article(s)</p>

        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

export default DetailsManifeste;