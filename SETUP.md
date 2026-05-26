# Almuercito Tech — Setup backend

## Estado actual

- Repo: https://github.com/Andy-Montes/almuercito-tech
- URL: https://andy-montes.github.io/almuercito-tech/
- Apps Script Web App: `https://script.google.com/macros/s/AKfycbxE6hENKeKgyHIC-s48IQi2zvZEjdfhUh_eGiudFBGbDqmFbDg39Cmh8W5s5gjwYqZM/exec`
- Sheet ID: `1PSjeQNzz_Vz_eYmz1XHpvsGm44mYwozQnPDOdJdmb38`

## Importante: actualizar el Sheet (1 vez, despues del cambio de schema)

Cambio el schema de la hoja `weeks` para soportar multiples compromisos por semana
(antes: `goal_title, goal_done`; ahora: `goals_json` con un array JSON).

**Que hacer:**

1. Abre Apps Script y pega el nuevo `Code.gs` de esta carpeta (sobreescribe el anterior).
2. Guarda (Ctrl+S).
3. Corre `setup` de nuevo desde el dropdown → **Run**.
   - Esto **borra todo** y deja las 5 hojas con headers nuevos + los 5 estudiantes seed.
   - Si ya habia datos reales, corre `migrate` en vez de `setup` (solo arregla headers, no borra filas).
4. **No necesitas redeploy** si ya tienes la URL `/exec` funcionando: Apps Script actualiza la version automaticamente al guardar (siempre que en el deploy hayas dejado "Who has access: Anyone").
   - Si por alguna razon dejo de responder: Deploy → Manage deployments → editar version → "New version" → Deploy.

## API actualizada

**GET** `APPS_SCRIPT_URL` → devuelve:
```json
{
  "ok": true,
  "students":     [{id, name, niche, color, bio}],
  "weeks":        [{student_id, week_key, goals_json, review}],
  "projects":     [{student_id, name, desc, status}],
  "achievements": [{student_id, title, desc, date, created}],
  "reactions":    [{student_id, achievement_idx, reactor_id, emoji}]
}
```

**POST** `APPS_SCRIPT_URL` con `Content-Type: text/plain` (evita preflight CORS) y body JSON.

Acciones disponibles:

```js
// verificar PIN (login)
{ action:"verifyPin", student_id:"andy", pin:"1111" }

// guardar metas de la semana (array completo, sobreescribe)
{ action:"saveWeekGoals", student_id:"andy", pin:"1111", week_key:"2026-05-25",
  goals_json: "[{\"title\":\"Publicar post\",\"done\":false}]" }

// guardar review semanal
{ action:"saveReview", student_id:"andy", pin:"1111", week_key:"2026-05-25", review:"..." }

// proyecto nuevo o editar (con index 0-based)
{ action:"saveProj", student_id:"andy", pin:"1111", name:"...", desc:"...", status:"activo" }
{ action:"saveProj", student_id:"andy", pin:"1111", index:0, name:"...", desc:"...", status:"listo" }

// logro
{ action:"saveAch", student_id:"andy", pin:"1111", title:"...", desc:"...", date:"25 may 2026" }

// reaccion (toggle: add o remove)
{ action:"addReaction", student_id:"andy", achievement_idx:0, reactor_id:"claire", pin:"5555", emoji:"🔥" }
{ action:"removeReaction", student_id:"andy", achievement_idx:0, reactor_id:"claire", pin:"5555", emoji:"🔥" }

// borrar item
{ action:"deleteItem", student_id:"andy", pin:"1111", table:"projects", index:0 }
{ action:"deleteItem", student_id:"andy", pin:"1111", table:"achievements", index:0 } // tambien limpia reacciones

// cambiar PIN
{ action:"changePin", student_id:"andy", pin:"1111", new_pin:"9999" }

// actualizar perfil
{ action:"updateProfile", student_id:"andy", pin:"1111", name:"...", niche:"...", color:"#FF0000", bio:"..." }
```

## Notas de diseno

- **Multiples metas por semana:** se guardan como JSON en una celda (`goals_json`). Es legible si lo abres pero no editable como columnas.
- **Reacciones:** el `achievement_idx` es el indice del logro dentro de la lista del estudiante, ordenado por `created` ASC. Al borrar un logro, el backend desplaza los indices superiores en la tabla `reactions` automaticamente.
- **PIN en frontend:** despues del login se guarda en memoria (variable `myPin`), nunca en localStorage. Se pierde al refrescar y se pide de nuevo.
- **Cache local:** el frontend guarda en localStorage como cache para mostrar UI rapido al cargar, pero siempre sincroniza con el servidor al iniciar.
