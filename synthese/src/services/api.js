const API_URL = '/api/auth';

// Fonction pour sauvegarder le token
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Fonction pour récupérer le token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Fonction pour supprimer le token
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Fonction pour sauvegarder les infos utilisateur
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Fonction pour récupérer les infos utilisateur
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Fonction pour supprimer les infos utilisateur
export const removeUser = () => {
  localStorage.removeItem('user');
};

// Headers avec authorization
const getHeaders = () => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Inscription
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Connexion
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Déconnexion
export const logout = () => {
  removeToken();
  removeUser();
};

// Obtenir le profil
export const getProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération du profil');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

