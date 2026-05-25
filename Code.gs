var SHEET_ID = '1PSjeQNzz_Vz_eYmz1XHpvsGm44mYwozQnPDOdJdmb38';

var TABS = {
  students: ['id','name','niche','color','pin','bio'],
  weeks: ['student_id','week_key','goal_title','goal_done','review'],
  projects: ['student_id','name','desc','status'],
  achievements: ['student_id','title','desc','date','created'],
  reactions: ['student_id','achievement_idx','reactor_id','emoji']
};

var SEED_STUDENTS = [
  ['andy','Andy Montes','Estrategia de datos - IA','#FF1493','1111','Retail and Consumer Behavior Specialist'],
  ['claire','Claire','UX Estrategica - Flex','#00B8C4','5555','Completa tu perfil cuando entres'],
  ['erika','Erika','Educacion matematica','#FFD60A','3333','Completa tu perfil cuando entres'],
  ['carla','Carla','Psicologia adolescente','#BF00FF','2222','Completa tu perfil cuando entres'],
  ['antonio','Antonio','Facilitador - Estrategia','#A8FF00','4444','Completa tu perfil cuando entres']
];

function setup() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  Object.keys(TABS).forEach(function(name){
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clear();
    sh.getRange(1,1,1,TABS[name].length).setValues([TABS[name]]).setFontWeight('bold');
  });
  var students = ss.getSheetByName('students');
  students.getRange(2,1,SEED_STUDENTS.length,SEED_STUDENTS[0].length).setValues(SEED_STUDENTS);
  return 'ok';
}

function _ss() {
  return SpreadsheetApp.openById(SHEET_ID);
}

function _read(name) {
  var sh = _ss().getSheetByName(name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values.shift();
  return values.map(function(row){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = row[i]; });
    return obj;
  });
}

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function _checkPin(studentId, pin) {
  var rows = _read('students');
  var s = rows.filter(function(r){ return String(r.id) === String(studentId); })[0];
  if (!s) throw new Error('Estudiante no existe');
  if (String(s.pin) !== String(pin)) throw new Error('PIN invalido');
  return true;
}

function doGet(e) {
  try {
    return _json({
      ok: true,
      students: _read('students').map(function(s){ delete s.pin; return s; }),
      weeks: _read('weeks'),
      projects: _read('projects'),
      achievements: _read('achievements'),
      reactions: _read('reactions')
    });
  } catch (err) {
    return _json({ ok:false, error: err.message });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var pin = body.pin;
    var studentId = body.student_id;
    var pinOwner = (action === 'addReaction') ? body.reactor_id : studentId;
    _checkPin(pinOwner, pin);
    var handlers = {
      saveGoal: saveGoal,
      toggleGoal: toggleGoal,
      saveReview: saveReview,
      saveProj: saveProj,
      saveAch: saveAch,
      addReaction: addReaction,
      deleteItem: deleteItem
    };
    if (!handlers[action]) throw new Error('Accion invalida: ' + action);
    var result = handlers[action](body);
    return _json({ ok:true, result: result });
  } catch (err) {
    return _json({ ok:false, error: err.message });
  }
}

function _findRow(sheetName, predicate) {
  var sh = _ss().getSheetByName(sheetName);
  var values = sh.getDataRange().getValues();
  var headers = values[0];
  for (var i=1; i<values.length; i++) {
    var obj = {};
    headers.forEach(function(h,idx){ obj[h] = values[i][idx]; });
    if (predicate(obj)) return { row: i+1, headers: headers, data: obj, sh: sh };
  }
  return null;
}

function saveGoal(b) {
  var sh = _ss().getSheetByName('weeks');
  var found = _findRow('weeks', function(r){
    return r.student_id === b.student_id && r.week_key === b.week_key;
  });
  if (found) {
    sh.getRange(found.row, 3).setValue(b.goal_title);
  } else {
    sh.appendRow([b.student_id, b.week_key, b.goal_title, false, '']);
  }
  return true;
}

function toggleGoal(b) {
  var found = _findRow('weeks', function(r){
    return r.student_id === b.student_id && r.week_key === b.week_key;
  });
  if (!found) throw new Error('Semana no existe');
  var current = found.data.goal_done === true || String(found.data.goal_done).toLowerCase() === 'true';
  found.sh.getRange(found.row, 4).setValue(!current);
  return !current;
}

function saveReview(b) {
  var sh = _ss().getSheetByName('weeks');
  var found = _findRow('weeks', function(r){
    return r.student_id === b.student_id && r.week_key === b.week_key;
  });
  if (found) {
    sh.getRange(found.row, 5).setValue(b.review);
  } else {
    sh.appendRow([b.student_id, b.week_key, '', false, b.review]);
  }
  return true;
}

function saveProj(b) {
  var sh = _ss().getSheetByName('projects');
  if (b.index != null) {
    var all = _read('projects');
    var idx = -1, count = -1;
    for (var i=0; i<all.length; i++) {
      if (all[i].student_id === b.student_id) {
        count++;
        if (count === b.index) { idx = i; break; }
      }
    }
    if (idx === -1) throw new Error('Proyecto no existe');
    var row = idx + 2;
    sh.getRange(row, 2, 1, 3).setValues([[b.name, b.desc, b.status]]);
  } else {
    sh.appendRow([b.student_id, b.name, b.desc, b.status || 'En curso']);
  }
  return true;
}

function saveAch(b) {
  var sh = _ss().getSheetByName('achievements');
  sh.appendRow([b.student_id, b.title, b.desc, b.date || '', new Date().toISOString()]);
  return true;
}

function addReaction(b) {
  var sh = _ss().getSheetByName('reactions');
  var all = _read('reactions');
  var dup = all.some(function(r){
    return r.student_id === b.student_id
      && String(r.achievement_idx) === String(b.achievement_idx)
      && r.reactor_id === b.reactor_id
      && r.emoji === b.emoji;
  });
  if (dup) return false;
  sh.appendRow([b.student_id, b.achievement_idx, b.reactor_id, b.emoji]);
  return true;
}

function deleteItem(b) {
  var table = b.table;
  if (!TABS[table]) throw new Error('Tabla invalida');
  var sh = _ss().getSheetByName(table);
  var all = _read(table);
  var count = -1, target = -1;
  for (var i=0; i<all.length; i++) {
    if (all[i].student_id === b.student_id) {
      count++;
      if (count === b.index) { target = i; break; }
    }
  }
  if (target === -1) throw new Error('Item no existe');
  sh.deleteRow(target + 2);
  return true;
}
