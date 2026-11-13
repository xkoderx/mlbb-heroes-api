// MLBB Heroes API — API pública con los héroes de Mobile Legends: Bang Bang.
// Datos basados en p3hndrx/MLBB-API. El juego es © Moonton.
// Proyecto no oficial, sin afiliación con Moonton, solo con fines educativos
// y para la comunidad. En español, sin llave ni registro.

const express = require('express');
const cors = require('cors');
const path = require('node:path');
const heroes = require('./data/heroes.json');

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = '1.0.0';

app.use(cors());
app.use(express.json());

// Roles oficiales del juego (un héroe puede tener más de uno, p. ej. "Tank, Mage").
const ROLES = ['Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];

function normaliza(texto) {
  return String(texto || '').trim().toLowerCase();
}

// Roles de un héroe: divide "Tank, Mage" en ["Tank", "Mage"].
function rolesDe(heroe) {
  if (!heroe.class) return [];
  return heroe.class.split(',').map((r) => r.trim()).filter(Boolean);
}

// Líneas de un héroe: divide entradas como "exp lane, jungle" en líneas sueltas.
function lanesDe(heroe) {
  const lanes = [];
  for (const entrada of heroe.laning || []) {
    for (const lane of String(entrada).split(',')) {
      const l = lane.trim().toLowerCase();
      if (l) lanes.push(l);
    }
  }
  return [...new Set(lanes)];
}

// Coincidencia de línea: "gold" encuentra "gold lane", "mid" encuentra "mid lane", etc.
function coincideLane(lane, consulta) {
  const q = normaliza(consulta);
  const v = normaliza(lane);
  return v === q || v.includes(q) || q.includes(v);
}

// GET / — información de la API
app.get('/', (req, res) => {
  res.json({
    nombre: 'MLBB Heroes API',
    version: VERSION,
    descripcion:
      'API pública con los héroes de Mobile Legends: Bang Bang (Moonton). En español, sin llave ni registro.',
    endpoints: {
      heroes: 'GET /api/heroes?role=&lane=&search=&limit=&page=',
      heroe: 'GET /api/heroes/:id (por id, mlid o slug: h001, 1 o miya)',
      roles: 'GET /api/roles',
      lanes: 'GET /api/lanes',
      status: 'GET /api/status',
      docs: 'GET /docs',
    },
    fuente: 'p3hndrx/MLBB-API',
    nota: 'Proyecto no oficial. Datos del juego © Moonton.',
  });
});

// GET /api/status — estado de la API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    heroes: heroes.length,
    version: VERSION,
    fuente: 'p3hndrx/MLBB-API',
  });
});

// GET /api/heroes — lista con filtros y paginación
app.get('/api/heroes', (req, res) => {
  let resultado = [...heroes];
  const { role, lane, search } = req.query;

  if (role) {
    const r = normaliza(role);
    resultado = resultado.filter((h) =>
      rolesDe(h).some((x) => normaliza(x) === r),
    );
  }

  if (lane) {
    resultado = resultado.filter((h) =>
      lanesDe(h).some((l) => coincideLane(l, lane)),
    );
  }

  if (search) {
    const s = normaliza(search);
    resultado = resultado.filter((h) => normaliza(h.hero_name).includes(s));
  }

  let limit = parseInt(req.query.limit, 10);
  if (Number.isNaN(limit) || limit < 1) limit = 50;
  if (limit > 130) limit = 130;

  let page = parseInt(req.query.page, 10);
  if (Number.isNaN(page) || page < 1) page = 1;

  const total = resultado.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (page > totalPages) page = totalPages;

  const inicio = (page - 1) * limit;
  res.json({
    total,
    page,
    limit,
    totalPages,
    heroes: resultado.slice(inicio, inicio + limit),
  });
});

// GET /api/heroes/:id — un héroe por id (h001), mlid (1) o slug/uid (miya)
app.get('/api/heroes/:id', (req, res) => {
  const clave = normaliza(req.params.id);
  const heroe = heroes.find(
    (h) =>
      normaliza(h.id) === clave ||
      normaliza(h.mlid) === clave ||
      normaliza(h.uid) === clave ||
      normaliza(h.slug) === clave,
  );
  if (!heroe) return res.status(404).json({ error: 'Héroe no encontrado' });
  res.json(heroe);
});

// GET /api/roles — roles con la cantidad de héroes de cada uno
app.get('/api/roles', (req, res) => {
  const roles = ROLES.map((role) => ({
    role,
    heroes: heroes.filter((h) =>
      rolesDe(h).some((x) => normaliza(x) === normaliza(role)),
    ).length,
  })).filter((r) => r.heroes > 0);
  res.json({ total: roles.length, roles });
});

// GET /api/lanes — líneas con la cantidad de héroes de cada una
app.get('/api/lanes', (req, res) => {
  const conteo = {};
  for (const h of heroes) {
    for (const lane of lanesDe(h)) {
      conteo[lane] = (conteo[lane] || 0) + 1;
    }
  }
  const lanes = Object.entries(conteo)
    .map(([lane, cantidad]) => ({ lane, heroes: cantidad }))
    .sort((a, b) => b.heroes - a.heroes);
  res.json({ total: lanes.length, lanes });
});

// GET /docs — página de documentación (HTML estático)
app.use('/docs', express.static(path.join(__dirname, '..', 'public')));

// Cualquier ruta desconocida: 404 en español
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(
    `MLBB Heroes API corriendo en http://localhost:${PORT} (${heroes.length} héroes)`,
  );
});
