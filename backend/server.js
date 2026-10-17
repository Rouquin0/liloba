// server.js - V2 Sécurisée - Prêt pour Render
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || "BibleApp";

// === SECURITE GLOBALE ===
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Anti-bruteforce pour l'auth
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  message: { error: "Trop de tentatives, réessayez dans 1 heure" }
});
app.use('/api/auth/', authLimiter);

// === BASE TEMPORAIRE (remplace par MongoDB/Supabase après) ===
let users = [];

// === 1. INSCRIPTION ===
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email ||!password) return res.status(400).json({ error: "Email et mot de passe requis" });

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "Compte déjà existant" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    users.push({
      email,
      password: hashedPassword,
      verificationCode: hashedCode,
      verified: false,
      questionsToday: 0,
      lastReset: new Date().toDateString()
    });

    // POUR TEST - En prod on enverra par email
    console.log(`[${APP_NAME}] Code pour ${email}: ${verificationCode}`);

    res.json({ message: `Code envoyé. Vérifiez vos emails (${APP_NAME})` });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// === 2. VERIFICATION CODE ===
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    const isValid = await bcrypt.compare(code, user.verificationCode);
    if (!isValid) return res.status(400).json({ error: "Code invalide ou expiré" });

    user.verified = true;
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: "Compte vérifié", token, app: APP_NAME });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// === 3. MIDDLEWARE VERIFICATION TOKEN + LIMIT 3/JOUR ===
function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Non connecté" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = users.find(u => u.email === decoded.email);

    // Reset compteur à minuit
    if (req.user.lastReset!== new Date().toDateString()) {
      req.user.questionsToday = 0;
      req.user.lastReset = new Date().toDateString();
    }

    if (req.user.questionsToday >= 3) {
      return res.status(403).json({ error: "Limite de 3 questions atteinte aujourd'hui" });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: "Token invalide" });
  }
}

// Route test pour le chat IA
app.post('/api/chat', authMiddleware, (req, res) => {
  req.user.questionsToday++;
  res.json({ answer: `Réponse de ${APP_NAME} - Il vous reste ${3 - req.user.questionsToday} questions` });
});

app.listen(PORT, () => console.log(`${APP_NAME} sécurisé sur port ${PORT}`));
