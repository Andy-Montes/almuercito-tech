# Almuercito Tech — Setup backend

## 1. GitHub Pages ✅
- Repo: https://github.com/Andy-Montes/almuercito-tech
- URL: https://andy-montes.github.io/almuercito-tech/

## 2. Crear Sheet + Apps Script (2 minutos)

1. Abre https://script.google.com → **New project**
2. Renombra el proyecto a `Almuercito Tech`
3. Borra el contenido del archivo `Code.gs` y pega TODO el contenido de `Code.gs` de esta carpeta
4. Guarda (Ctrl+S)
5. En el dropdown de funciones (arriba) selecciona `setup` → click **Run**
   - Te pedirá autorizar permisos (Sheets) → acepta
   - Cuando termine, abre **View → Logs** (o Ctrl+Enter): verás `SHEET_ID = ...`
   - Copia ese ID
6. Vuelve al archivo `Code.gs` y pega el ID en la línea `var SHEET_ID = '';` → guarda

## 3. Deploy como Web App

1. Click en **Deploy → New deployment**
2. Icono ⚙️ → **Web app**
3. Configuración:
   - Description: `v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. **Deploy** → autoriza → copia la **Web app URL** (termina en `/exec`)

## Resultado final (pásale esto a tu otro Claude)

```
GITHUB_PAGES_URL = https://andy-montes.github.io/almuercito-tech/
APPS_SCRIPT_URL  = <la URL /exec que copiaste>
SHEET_ID         = <el ID del Sheet>
```

## API de referencia

**GET** `APPS_SCRIPT_URL` → devuelve:
```json
{ "ok": true, "students": [...], "weeks": [...], "projects": [...], "achievements": [...], "reactions": [...] }
```

**POST** `APPS_SCRIPT_URL` con `Content-Type: text/plain` (evita preflight CORS) y body JSON:

```js
// guardar/editar meta de la semana
{ action:"saveGoal", student_id:"andy", pin:"1111", week_key:"2026-W22", goal_title:"..." }

// marcar/desmarcar meta
{ action:"toggleGoal", student_id:"andy", pin:"1111", week_key:"2026-W22" }

// review semanal
{ action:"saveReview", student_id:"andy", pin:"1111", week_key:"2026-W22", review:"..." }

// proyecto nuevo / editar (con index 0-based del proyecto del student)
{ action:"saveProj", student_id:"andy", pin:"1111", name:"...", desc:"...", status:"En curso" }
{ action:"saveProj", student_id:"andy", pin:"1111", index:0, name:"...", desc:"...", status:"Hecho" }

// logro
{ action:"saveAch", student_id:"andy", pin:"1111", title:"...", desc:"...", date:"2026-05-25" }

// reacción de otro a un logro
{ action:"addReaction", student_id:"andy", achievement_idx:0, reactor_id:"claire", pin:"5555", emoji:"🔥" }

// borrar item (table: weeks|projects|achievements, index 0-based del student)
{ action:"deleteItem", student_id:"andy", pin:"1111", table:"projects", index:0 }
```
