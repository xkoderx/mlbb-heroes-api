# MLBB Heroes API

API pública REST con los héroes de **Mobile Legends: Bang Bang** (Moonton).
En español, simple, sin llave ni registro: cualquiera puede consumirla desde el
navegador o desde su propio proyecto.

> **Proyecto no oficial y sin afiliación con Moonton.** Los datos del juego son
> © Moonton. La base de datos se usa con fines educativos y para la comunidad,
> con crédito a [p3hndrx/MLBB-API](https://github.com/p3hndrx/MLBB-API).

## Qué es

- **133 héroes** con nombre, rol, líneas, retrato e icono y habilidades
  (nombre, tipo, enfriamiento, costo de maná y descripción).
- Endpoints para listar, filtrar, buscar y consultar el detalle de cada héroe.
- Los datos viven en el propio repo (`server/data/heroes.json`), sin base de datos.
- Documentación en vivo en `/docs` (con probador incluido).
- Hecha con **Node.js + Express** (JavaScript).

## Cómo correrla en local

Requisitos: Node.js 18 o superior.

```bash
git clone https://github.com/xkoderx/mlbb-heroes-api.git
cd mlbb-heroes-api
npm install        # instala las dependencias del servidor
npm start          # levanta la API en http://localhost:3000
```

Para desarrollo (reinicia solo al guardar cambios):

```bash
npm run dev
```

El puerto se puede cambiar con la variable de entorno `PORT`:

```bash
PORT=4000 npm start
```

## Endpoints

Base local: `http://localhost:3000`. Todas las respuestas son JSON y los
mensajes de error están en español. Una ruta desconocida responde
`404 { "error": "Ruta no encontrada" }`.

### GET /

Información de la API: nombre, versión y lista de endpoints.

```bash
curl http://localhost:3000/
```

```json
{
  "nombre": "MLBB Heroes API",
  "version": "1.0.0",
  "descripcion": "API pública con los héroes de Mobile Legends: Bang Bang (Moonton). En español, sin llave ni registro.",
  "endpoints": {
    "heroes": "GET /api/heroes?role=&lane=&search=&limit=&page=",
    "heroe": "GET /api/heroes/:id (por id, mlid o slug: h001, 1 o miya)",
    "roles": "GET /api/roles",
    "lanes": "GET /api/lanes",
    "status": "GET /api/status",
    "docs": "GET /docs"
  },
  "fuente": "p3hndrx/MLBB-API",
  "nota": "Proyecto no oficial. Datos del juego © Moonton."
}
```

### GET /api/heroes

Lista de héroes con filtros y paginación.

| Parámetro | Qué hace | Ejemplo |
| --- | --- | --- |
| `role` | Filtra por rol | `?role=Marksman` |
| `lane` | Filtra por línea | `?lane=gold lane` |
| `search` | Busca por nombre (sin distinguir mayúsculas) | `?search=miya` |
| `limit` | Resultados por página (por defecto 50, máximo 130) | `?limit=10` |
| `page` | Número de página (por defecto 1) | `?page=2` |

```bash
curl "http://localhost:3000/api/heroes?role=Marksman&limit=2"
```

```json
{
  "total": 23,
  "page": 1,
  "limit": 2,
  "totalPages": 12,
  "heroes": [
    {
      "id": "h001",
      "mlid": "1",
      "uid": "miya",
      "slug": "miya",
      "hero_name": "Miya",
      "class": "Marksman",
      "laning": ["gold lane"],
      "portrait": "https://akmweb.youngjoygame.com/...",
      "hero_icon": "miya.png",
      "release_year": null,
      "skills": [ ... ]
    }
  ]
}
```

### GET /api/heroes/:id

El detalle de un héroe por **id** (`h001`), por **mlid** (`1`) o por **slug**
(`miya`). Las tres formas devuelven el mismo héroe.

```bash
curl http://localhost:3000/api/heroes/miya
curl http://localhost:3000/api/heroes/h001
curl http://localhost:3000/api/heroes/1
```

```json
{
  "id": "h001",
  "mlid": "1",
  "uid": "miya",
  "slug": "miya",
  "hero_name": "Miya",
  "class": "Marksman",
  "laning": ["gold lane"],
  "portrait": "https://akmweb.youngjoygame.com/...",
  "hero_icon": "miya.png",
  "release_year": null,
  "skills": [
    {
      "skill_name": "Moon Blessing",
      "type": "passive",
      "cooldown": "null",
      "manacost": "null",
      "description": "Each time Miya's Basic Attack hits a target, she gains 5% Attack Speed for 4s (up to 5 stacks)...",
      "skill_icon": "https://akmweb.youngjoygame.com/..."
    }
  ]
}
```

Si el héroe no existe, responde 404:

```json
{ "error": "Héroe no encontrado" }
```

### GET /api/roles

Los roles del juego con la cantidad de héroes de cada uno.

```bash
curl http://localhost:3000/api/roles
```

```json
{
  "total": 6,
  "roles": [
    { "role": "Tank", "heroes": 25 },
    { "role": "Fighter", "heroes": 44 },
    { "role": "Assassin", "heroes": 29 },
    { "role": "Mage", "heroes": 32 },
    { "role": "Marksman", "heroes": 23 },
    { "role": "Support", "heroes": 15 }
  ]
}
```

> Algunos héroes tienen dos roles (por ejemplo `"Tank, Mage"`) y se cuentan en
> ambos, por eso la suma es mayor que 133.

### GET /api/lanes

Las líneas del juego con la cantidad de héroes de cada una.

```bash
curl http://localhost:3000/api/lanes
```

```json
{
  "total": 5,
  "lanes": [
    { "lane": "exp lane", "heroes": 40 },
    { "lane": "jungle", "heroes": 36 },
    { "lane": "roam", "heroes": 34 },
    { "lane": "mid lane", "heroes": 28 },
    { "lane": "gold lane", "heroes": 20 }
  ]
}
```

### GET /api/status

Estado de la API y cantidad de héroes en el dataset.

```bash
curl http://localhost:3000/api/status
```

```json
{ "status": "ok", "heroes": 133, "version": "1.0.0", "fuente": "p3hndrx/MLBB-API" }
```

### GET /docs

Página de documentación con todos los endpoints, ejemplos y un probador en vivo.

## Valores posibles

**Roles:** `Tank`, `Fighter`, `Assassin`, `Mage`, `Marksman`, `Support`.

**Líneas:** `gold lane`, `mid lane`, `exp lane`, `jungle`, `roam`. También
funcionan las formas cortas: `gold`, `mid`, `exp`.

## Fuente de los datos

Los datos vienen del conjunto abierto
[p3hndrx/MLBB-API](https://github.com/p3hndrx/MLBB-API), archivo
`v1/hero-meta-final.json` (unos 130 héroes, actualizado en 2025). Se guardó
limpio en `server/data/heroes.json`:

- Se eliminó la entrada basura del inicio (`hero_name: "None"` sin datos) y
  cualquier entrada sin nombre de héroe.
- A cada héroe se le añadió un campo `slug` (su `uid` en minúsculas) para
  consultarlo por nombre en la URL.
- Los valores de los datos se conservan tal como vienen (en inglés, como los
  publica la fuente); la API, sus mensajes y su documentación están en español.

Los retratos y los iconos de habilidades se sirven desde el CDN de Moonton
(las URLs vienen en los datos). Mobile Legends: Bang Bang y sus datos son
© Moonton. Este proyecto no es oficial ni está afiliado, patrocinado o
respaldado por Moonton.

## Estructura del proyecto

```
mlbb-heroes-api/
├── README.md
├── LICENSE
├── package.json          # scripts: npm start / npm run dev
├── public/
│   └── index.html        # documentación en /docs
└── server/
    ├── index.js          # la API (Express)
    ├── package.json      # dependencias: express, cors
    └── data/
        └── heroes.json   # 133 héroes
```

## Qué sigue

- **Despliegue gratis** en Render o Railway, para que la API esté pública y
  cualquiera la consuma sin correrla en local.
- **Endpoints de items y emblemas** (la fuente también tiene esos datos).
- **La página de fans de Mobile Legends**, que consumirá esta API para mostrar
  los héroes, sus habilidades y sus builds.
- Actualizar el dataset cuando salgan héroes nuevos (el juego lanza uno nuevo
  cada 3 o 4 meses aproximadamente).

## Licencia

MIT — Erick Michel Deloera.
