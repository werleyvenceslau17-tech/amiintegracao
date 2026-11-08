'use strict';

/* ═════════ Helpers ═════════ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2));
const store = {
  get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const VERSES = [
  { t: 'Assim também nós, embora sejamos muitos, formamos um só corpo em Cristo, e cada um de nós está ligado a todos os outros.', r: 'Romanos 12:5' },
  { t: 'Porque onde estiverem dois ou três reunidos em meu nome, ali estou eu no meio deles.', r: 'Mateus 18:20' },
  { t: 'E tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens.', r: 'Colossenses 3:23' },
  { t: 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.', r: '1 Coríntios 13:4' },
  { t: 'Entrega o teu caminho ao Senhor; confia nele, e ele o fará.', r: 'Salmos 37:5' },
  { t: 'Posso tudo naquele que me fortalece.', r: 'Filipenses 4:13' },
  { t: 'Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.', r: 'Josué 1:9' },
  { t: 'Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.', r: '1 Pedro 5:7' },
  { t: 'O Senhor é o meu pastor; nada me faltará.', r: 'Salmos 23:1' },
  { t: 'Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas lhes serão acrescentadas.', r: 'Mateus 6:33' },
  { t: 'Deem graças em todas as circunstâncias, pois esta é a vontade de Deus para vocês em Cristo Jesus.', r: '1 Tessalonicenses 5:18' },
  { t: 'Porque eu bem sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.', r: 'Jeremias 29:11' },
  { t: 'Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.', r: 'Mateus 11:28' },
  { t: 'O Senhor mesmo irá adiante de vocês e estará com vocês; não os deixará nem os abandonará. Não tenham medo nem desanimem.', r: 'Deuteronômio 31:8' },
  { t: 'Alegrem-se sempre no Senhor. Novamente direi: alegrem-se!', r: 'Filipenses 4:4' },
  { t: 'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.', r: 'Filipenses 4:6' },
  { t: 'Ensina-nos a contar os nossos dias, para que o nosso coração seja sábio.', r: 'Salmos 90:12' },
  { t: 'Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.', r: 'Salmos 119:105' },
  { t: 'Portanto, vão e façam discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo.', r: 'Mateus 28:19' },
  { t: 'Sirvam uns aos outros com amor, cada um utilizando o dom que recebeu para administrar a graça de Deus em suas múltiplas formas.', r: '1 Pedro 4:10' },
  { t: 'E não nos cansemos de fazer o bem, pois no tempo próprio colheremos, se não desanimarmos.', r: 'Gálatas 6:9' },
  { t: 'O meu mandamento é este: amem-se uns aos outros como eu os amei.', r: 'João 15:12' },
  { t: 'Ninguém tem maior amor do que este: de dar alguém a sua vida pelos seus amigos.', r: 'João 15:13' },
  { t: 'Dele, por ele e para ele são todas as coisas. A ele seja a glória para sempre! Amém.', r: 'Romanos 11:36' },
  { t: 'Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.', r: 'João 3:16' },
  { t: 'Mas os que esperam no Senhor renovarão as suas forças. Subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.', r: 'Isaías 40:31' },
  { t: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.', r: 'Provérbios 3:5' },
  { t: 'Portanto, se alguém está em Cristo, é nova criação. As coisas antigas já passaram; eis que surgiram coisas novas!', r: '2 Coríntios 5:17' },
  { t: 'Aquietai-vos e sabei que eu sou Deus.', r: 'Salmos 46:10' },
  { t: 'Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.', r: 'João 14:6' },
  { t: 'Portanto, agora já não há condenação para os que estão em Cristo Jesus.', r: 'Romanos 8:1' }
];
function verseOfDay() {
  const day = Math.floor(today().getTime() / 86400000);
  return VERSES[((day % VERSES.length) + VERSES.length) % VERSES.length];
}
let verseKey = null;
function renderVerse(force) {
  const key = today().toDateString();
  if (!force && key === verseKey) return;
  verseKey = key;
  const v = verseOfDay();
  const put = (sel, txt) => { const el = $(sel); if (el) el.textContent = txt; };
  put('#verse-text', `“${v.t}”`);
  put('#verse-ref', v.r);
  put('#verse-bar-text', v.t);
  put('#verse-bar-ref', v.r);
  const bar = $('#verse-bar');
  if (bar) { bar.classList.remove('verse-swap'); void bar.offsetWidth; bar.classList.add('verse-swap'); }
}

const UNITS = {
  pacheco:    { label: 'AMI Pacheco',    color: 'var(--pacheco)' },
  amendoeira: { label: 'AMI Amendoeira', color: 'var(--amendoeira)' }
};
const STATUS = {
  ativo:      { label: 'Ativo',          cls: 'badge-ativo' },
  integracao: { label: 'Em integração',  cls: 'badge-integracao' },
  visitante:  { label: 'Visitante',      cls: 'badge-visitante' }
};
const MINISTRIES = {
  louvor:      { label: 'Louvor',       color: '#FF3B52' },
  midia:       { label: 'Mídia',        color: '#3D8BFD' },
  recepcao:    { label: 'Recepção',     color: '#FFB020' },
  infantil:    { label: 'Infantil',     color: '#2ECC71' },
  intercessao: { label: 'Intercessão',  color: '#9B6BFF' },
  diaconia:    { label: 'Diaconia',     color: '#2BD9E8' },
  jovens:      { label: 'Jovens',       color: '#F04BD8' },
  nenhum:      { label: 'Sem ministério', color: '#B79A9A' }
};
const AV_COLORS = [
  ['#E8112D','#7A0918'], ['#FF7A1A','#8F3A00'], ['#3D8BFD','#123C8F'],
  ['#2ECC71','#0E6B3A'], ['#9B6BFF','#4A2396'], ['#F04BD8','#7C1170'],
  ['#2BD9E8','#0A6B78'], ['#FFB020','#8F5C00']
];

function parseDate(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function fmtDate(s) {
  const d = parseDate(s);
  return d ? `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}` : '—';
}
function today() { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
function nextBirthdayDays(birth) {
  const b = parseDate(birth);
  if (!b) return Infinity;
  const t = today();
  let next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
  if (next < t) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
  return Math.round((next - t) / 86400000);
}
function turningAge(birth) {
  const b = parseDate(birth);
  if (!b) return null;
  const t = today();
  let age = t.getFullYear() - b.getFullYear();
  if (new Date(t.getFullYear(), b.getMonth(), b.getDate()) < t) age++;
  return age;
}
function currentAge(birth) {
  const b = parseDate(birth);
  if (!b) return null;
  const t = today();
  let age = t.getFullYear() - b.getFullYear();
  if (new Date(t.getFullYear(), b.getMonth(), b.getDate()) > t) age--;
  return age;
}
function initials(name) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length-1][0] : '')).toUpperCase();
}
function avStyle(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [a, b] = AV_COLORS[h % AV_COLORS.length];
  return `--av-a:${a};--av-b:${b}`;
}
function avatarHTML(name, cls = '') {
  return `<div class="avatar ${cls}" style="${avStyle(name)}">${esc(initials(name))}</div>`;
}
function unitLabel(u) { return u === 'all' ? 'Todas as unidades' : UNITS[u].label; }
function unitBadge(u) { return `<span class="badge-unit badge-${u}"><i class="dot dot-${u}"></i>${UNITS[u].label}</span>`; }
function statusBadge(s) { return `<span class="badge ${STATUS[s].cls}">${STATUS[s].label}</span>`; }
function minChip(m) { const mi = MINISTRIES[m] || MINISTRIES.nenhum; return `<span class="chip-min" style="--mc:${mi.color}">${mi.label}</span>`; }

/* ═════════ Dados ═════════ */
const SEED_KIDS = {
  'Ana Beatriz Lima': [['Miguel Lima', '2018-03-12', 'Alergia a picadas de insetos'], ['Sofia Lima', '2021-07-25', 'Intolerância à lactose']],
  'Rebeca Oliveira': [['Davi Oliveira', '2019-11-10']],
  'Priscila Santos': [['Ester Santos', '2015-06-21']],
  'Fernanda Ribeiro': [['Alice Ribeiro', '2017-05-04'], ['Bento Ribeiro', '2020-09-14', 'Alergia a amendoim e corantes artificiais'], ['Benício Ribeiro', '2024-12-03']],
  'Larissa Mendes': [['Cecília Mendes', '2022-02-08']],
  'Rafael Gomes': [['Lucas Gomes', '2016-11-22'], ['Helena Gomes', '2019-04-30', 'Alergia a penicilina']]
};
function seedMembers() {
  const rows = [
    ['Ana Beatriz Lima','pacheco','ativo','louvor','1992-11-08','(21) 98877-1204','ana.lima@gmail.com',1,'2021-03-14','Rua Coronel Moreira, 45 — Pacheco','Líder do vocal. Coordena o ensaio de quinta-feira.'],
    ['Daniel Souza','pacheco','ativo','diaconia','1985-02-17','(21) 99641-8830','daniel.souza@gmail.com',1,'2019-08-04','Av. Atlântica, 1200 — Pacheco','Diácono. Responsável pela equipe de integração.'],
    ['Carlos Eduardo Nunes','pacheco','ativo','midia','1998-06-23','(21) 98123-5577','carlos.nunes@gmail.com',1,'2022-01-16','Rua Projetada, 30 — Pacheco','Opera projeção e transmissão aos domingos.'],
    ['Mariana Castro','pacheco','integracao','recepcao','1995-11-19','(21) 99702-3341','mari.castro@gmail.com',0,'2026-10-11','Rua das Acácias, 88 — Pacheco','Chegou por convite da célula da praça. Fazer acompanhamento.'],
    ['João Pedro Alves','pacheco','ativo','jovens','2003-09-02','(21) 98455-9012','joaopedro.alves@gmail.com',0,'2023-05-21','Rua Nove, 15 — Pacheco',''],
    ['Rebeca Oliveira','pacheco','ativo','infantil','1990-11-27','(21) 99881-2460','rebeca.oliveira@gmail.com',1,'2020-02-09','Rua dos Lírios, 210 — Pacheco','Professora da turma Junior (4 a 6 anos).'],
    ['Lucas Martins','pacheco','visitante','nenhum','2000-04-12','(21) 98007-6675','',0,'2026-11-01','','Primeira visita no culto de domingo. Retornar contato esta semana.'],
    ['Priscila Santos','pacheco','ativo','intercessao','1988-07-30','(21) 99330-1148','pri.santos@gmail.com',1,'2018-06-17','Rua Bahia, 77 — Pacheco','Grupo de oração das terças, 6h.'],
    ['Tiago Ferreira','pacheco','integracao','nenhum','1997-11-05','(21) 98766-4023','tiago.ferreira@gmail.com',0,'2026-10-25','Rua Ceará, 51 — Pacheco','Veio pelo projeto social. Iniciar curso de integração.'],
    ['Camila Rocha','pacheco','ativo','louvor','1994-12-09','(21) 99512-7789','camila.rocha@gmail.com',1,'2021-09-12','Rua Minas Gerais, 302 — Pacheco',''],
    ['Marcos Vinícius Teixeira','pacheco','ativo','midia','1991-03-25','(21) 98290-5516','marcos.teixeira@gmail.com',1,'2022-08-07','Rua Piauí, 19 — Pacheco','Fotografia e redes sociais.'],
    ['Juliana Pereira','pacheco','visitante','nenhum','1999-01-14','(21) 99145-8867','',0,'2026-11-04','','Veio com a família no culto da noite. Convidar para o café.'],
    ['Rafael Gomes','amendoeira','ativo','diaconia','1983-11-12','(21) 99620-3308','rafael.gomes@gmail.com',1,'2017-04-02','Estrada das Amendoeiras, 900','Diácono e líder de células da unidade.'],
    ['Larissa Mendes','amendoeira','ativo','recepcao','1996-05-08','(21) 98533-7194','lari.mendes@gmail.com',1,'2021-11-14','Rua das Flores, 120 — Amendoeira','Coordena a escala da recepção.'],
    ['Pedro Henrique Dias','amendoeira','integracao','jovens','2004-10-21','(21) 99815-6642','pedro.dias@gmail.com',0,'2026-10-18','Rua Sete, 44 — Amendoeira','Convidado pelo encontro de jovens.'],
    ['Fernanda Ribeiro','amendoeira','ativo','infantil','1993-08-16','(21) 98477-2058','fe.ribeiro@gmail.com',1,'2020-07-19','Rua Oito, 230 — Amendoeira',''],
    ['Gabriel Barbosa','amendoeira','ativo','louvor','1999-11-30','(21) 99264-9931','gabriel.barbosa@gmail.com',0,'2023-02-26','Rua Dez, 61 — Amendoeira','Violão. Preparando para o batismo de dezembro.'],
    ['Isabela Moreira','amendoeira','ativo','intercessao','1987-04-03','(21) 98909-4470','isa.moreira@gmail.com',1,'2019-10-06','Av. Central, 555 — Amendoeira',''],
    ['André Luiz Cardoso','amendoeira','visitante','nenhum','1979-12-25','(21) 99771-0263','',0,'2026-11-02','','Indicado pelo Pr. Daniel. Convidar para o café de integração.'],
    ['Patrícia Freitas','amendoeira','ativo','midia','1992-02-11','(21) 98350-8816','pati.freitas@gmail.com',1,'2022-05-15','Rua Onze, 98 — Amendoeira','Edição de vídeos e artes dos cultos.'],
    ['Samuel Araújo','amendoeira','integracao','nenhum','2001-06-07','(21) 99482-5527','samuel.araujo@gmail.com',0,'2026-10-28','Rua Doze, 17 — Amendoeira','Segunda etapa do curso de integração pendente.'],
    ['Débora Pinto','amendoeira','ativo','jovens','2002-09-18','(21) 98618-3345','debora.pinto@gmail.com',1,'2023-09-10','Rua Treze, 202 — Amendoeira',''],
    ['Felipe Nascimento','amendoeira','ativo','diaconia','1986-01-29','(21) 99055-7768','felipe.nasc@gmail.com',1,'2018-12-02','Rua Quatorze, 83 — Amendoeira',''],
    ['Vitória Cunha','amendoeira','visitante','nenhum','2005-03-06','(21) 98741-2290','',0,'2026-11-06','','Visitou com a avó. Família mora no Jardim Catarina.']
  ];
  return rows.map((r, i) => ({
    id: uid(), name: r[0], unit: r[1], status: r[2], ministry: r[3], birth: r[4],
    phone: r[5], email: r[6], baptized: !!r[7], joined: r[8], address: r[9], notes: r[10],
    hasChildren: !!SEED_KIDS[r[0]],
    children: (SEED_KIDS[r[0]] || []).map(k => ({ id: uid(), name: k[0], birth: k[1], allergy: k[2] || '' })),
    createdAt: new Date(parseDate(r[8]).getTime() + i * 3600000).toISOString()
  }));
}

let members = store.get('ami.members', null);
if (!Array.isArray(members) || !members.length) { members = seedMembers(); store.set('ami.members', members); }
members.forEach(m => {
  if (!Array.isArray(m.children)) m.children = [];
  if (typeof m.hasChildren !== 'boolean') m.hasChildren = m.children.length > 0;
  m.children.forEach(k => { if (typeof k.allergy !== 'string') k.allergy = ''; });
});
const saveMembers = () => store.set('ami.members', members);

const GENERAL_ADMIN = { name: 'Werley Venceslau', email: 'werleyvenceslau17@gmail.com' };
let admins = store.get('ami.admins', []);
if (!Array.isArray(admins)) admins = [];
const saveAdmins = () => store.set('ami.admins', admins);
const normEmail = e => String(e || '').trim().toLowerCase();
function roleOf(email) {
  const e = normEmail(email);
  if (e === GENERAL_ADMIN.email) return 'geral';
  return admins.some(a => a.email === e) ? 'admin' : null;
}
const isAuthorized = email => !!roleOf(email);
const isGeneral = () => !!state.user && roleOf(state.user.email) === 'geral';

const state = {
  user: null,
  unit: 'all',
  view: 'dashboard',
  search: '', status: 'todos', ministry: 'todos', sort: 'name',
  bmonth: new Date().getMonth(),
  selected: new Set(),
  savedViews: store.get('ami.savedViews', [])
};

function unitMembers() { return state.unit === 'all' ? members : members.filter(m => m.unit === state.unit); }

function birthdayEntries() {
  const entries = [];
  unitMembers().forEach(m => {
    if (m.birth) entries.push({ kind: 'member', m, name: m.name, birth: m.birth });
    (m.children || []).forEach(k => {
      if (k.birth) entries.push({ kind: 'kid', m, kid: k, name: k.name, birth: k.birth });
    });
  });
  return entries;
}
function ageLabel(birth) {
  const a = currentAge(birth);
  if (a === null) return '';
  return a < 1 ? 'menos de 1 ano' : `${a} ${a === 1 ? 'ano' : 'anos'}`;
}
const KID_GROUPS = {
  bercario: { label: 'Berçário', range: '1 a 3 anos', color: '#F04BD8', cls: 'kg-bercario' },
  junior:   { label: 'Junior',   range: '4 a 6 anos', color: '#FFB020', cls: 'kg-junior' },
  bigger:   { label: 'Bigger',   range: '7 a 12 anos', color: '#2BD9E8', cls: 'kg-bigger' }
};
function kidGroup(birth) {
  const a = currentAge(birth);
  if (a === null) return null;
  if (a <= 3) return 'bercario';
  if (a <= 6) return 'junior';
  if (a <= 12) return 'bigger';
  return 'fora';
}
function groupChip(birth) {
  const g = kidGroup(birth);
  if (!g) return '';
  if (g === 'fora') return '<span class="kid-group kg-fora">13+ · fora das turmas</span>';
  const gr = KID_GROUPS[g];
  return `<span class="kid-group ${gr.cls}">${gr.label}</span>`;
}
function kidTagHTML(birth) {
  return kidGroup(birth) ? groupChip(birth) : '<span class="kid-tag">criança</span>';
}

function filteredMembers() {
  let list = unitMembers();
  const q = state.search.trim().toLowerCase();
  if (q) list = list.filter(m =>
    m.name.toLowerCase().includes(q) ||
    (m.email || '').toLowerCase().includes(q) ||
    (m.phone || '').toLowerCase().includes(q) ||
    (m.address || '').toLowerCase().includes(q) ||
    (m.children || []).some(k => k.name.toLowerCase().includes(q)) ||
    (m.children || []).some(k => { const g = kidGroup(k.birth); return g && g !== 'fora' && KID_GROUPS[g].label.toLowerCase().includes(q); })
  );
  if (state.status !== 'todos') list = list.filter(m => m.status === state.status);
  if (state.ministry !== 'todos') list = list.filter(m => m.ministry === state.ministry);
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
    recent: (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
    joined: (a, b) => (b.joined || '').localeCompare(a.joined || ''),
    birthday: (a, b) => nextBirthdayDays(a.birth) - nextBirthdayDays(b.birth)
  };
  return [...list].sort(sorters[state.sort] || sorters.name);
}

/* ═════════ Toasts ═════════ */
const ICONS = {
  success: '<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>',
  danger: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
};
function toast(msg, { type = 'success', undo = null } = {}) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.style.setProperty('--tc', type === 'danger' ? 'var(--danger)' : type === 'info' ? 'var(--info)' : 'var(--success)');
  el.innerHTML = `${ICONS[type] || ICONS.success}<span>${esc(msg)}</span>${undo ? '<button class="toast-undo" type="button">Desfazer</button>' : ''}<button class="toast-x" type="button" aria-label="Fechar">✕</button>`;
  $('#toasts').appendChild(el);
  let done = false;
  const dismiss = () => { if (done) return; done = true; el.classList.add('out'); setTimeout(() => el.remove(), 260); };
  const timer = setTimeout(dismiss, undo ? 7000 : 4200);
  el.querySelector('.toast-x').addEventListener('click', () => { clearTimeout(timer); dismiss(); });
  if (undo) el.querySelector('.toast-undo').addEventListener('click', () => { clearTimeout(timer); dismiss(); undo(); });
}

/* ═════════ Autenticação ═════════ */
function spawnEmbers() {
  const zone = $('.login-embers');
  for (let i = 0; i < 18; i++) {
    const e = document.createElement('span');
    e.className = 'ember';
    const size = 3 + Math.random() * 6;
    e.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;--sway:${(Math.random()*120-60).toFixed(0)}px;animation-duration:${(7+Math.random()*9).toFixed(1)}s;animation-delay:${(Math.random()*10).toFixed(1)}s`;
    zone.appendChild(e);
  }
}

function decodeJwt(token) {
  const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(part), c => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function initAuth() {
  spawnEmbers();
  const clientId = (window.AMI_CONFIG && window.AMI_CONFIG.GOOGLE_CLIENT_ID || '').trim();
  if (clientId) {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: resp => {
            const p = decodeJwt(resp.credential);
            signIn({ name: p.name || p.email, email: p.email });
          }
        });
        $('#google-btn-zone').innerHTML = '';
        google.accounts.id.renderButton($('#google-btn-zone'), { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', locale: 'pt-BR', width: 300 });
      } catch { useLocalPicker(); }
    };
    s.onerror = useLocalPicker;
    document.head.appendChild(s);
  } else {
    useLocalPicker();
  }
}

function useLocalPicker() {
  $('#btn-google').addEventListener('click', openPicker);
  $('#login-note').textContent = 'Modo local: seletor de conta Google simulado. Configure o GOOGLE_CLIENT_ID em config.js para o login real.';
}

const DEFAULT_ACCOUNTS = [{ name: GENERAL_ADMIN.name, email: GENERAL_ADMIN.email }];
function openPicker() {
  const recent = store.get('ami.accounts', DEFAULT_ACCOUNTS).filter(a => isAuthorized(a.email));
  const ga = recent.find(a => normEmail(a.email) === GENERAL_ADMIN.email) || { name: GENERAL_ADMIN.name, email: GENERAL_ADMIN.email };
  const accounts = [ga, ...recent.filter(a => normEmail(a.email) !== GENERAL_ADMIN.email)];
  $('#picker-accounts').innerHTML = accounts.map((a, i) => `
    <button class="picker-account" type="button" data-acc="${i}">
      ${avatarHTML(a.name)}
      <div><b>${esc(a.name)}</b><span>${esc(a.email)}</span></div>
    </button>`).join('');
  $$('#picker-accounts .picker-account').forEach(btn => btn.addEventListener('click', () => {
    const a = accounts[+btn.dataset.acc];
    closePicker();
    signIn(a);
  }));
  $('#picker-form').hidden = true;
  $('#picker-error').hidden = true;
  $('#account-picker').hidden = false;
}
function closePicker() { $('#account-picker').hidden = true; }

function showLoginError(msg) {
  const el = $('#login-error');
  el.textContent = msg;
  el.hidden = false;
}

function signIn(profile) {
  if (!isAuthorized(profile.email)) {
    closePicker();
    showLoginError(`A conta ${normEmail(profile.email)} não está autorizada. Solicite acesso ao administrador geral (${GENERAL_ADMIN.email}).`);
    return;
  }
  $('#login-error').hidden = true;
  state.user = { name: profile.name, email: profile.email };
  store.set('ami.session', state.user);
  const accounts = store.get('ami.accounts', DEFAULT_ACCOUNTS);
  if (!accounts.some(a => a.email === profile.email)) { accounts.unshift(profile); store.set('ami.accounts', accounts.slice(0, 5)); }
  showApp();
  toast(`A paz, ${profile.name.split(' ')[0]}! Bem-vindo(a) ao AMI Integração.`);
}

function showApp() {
  $('#login-screen').hidden = true;
  $('#app').hidden = false;
  $('#user-name').textContent = state.user.name;
  $('#user-email').textContent = state.user.email;
  const role = roleOf(state.user.email);
  const roleEl = $('#user-role');
  roleEl.textContent = role === 'geral' ? 'Administrador geral' : 'Administrador';
  roleEl.className = 'role-tag ' + (role === 'geral' ? 'role-geral' : 'role-admin');
  const av = $('#user-avatar');
  av.textContent = initials(state.user.name);
  av.setAttribute('style', avStyle(state.user.name));
  renderAll();
}
function signOut() {
  localStorage.removeItem('ami.session');
  state.user = null;
  state.selected.clear();
  closeDrawer(); closeForm();
  $('#login-error').hidden = true;
  $('#app').hidden = true;
  $('#login-screen').hidden = false;
}

/* ═════════ Render: geral ═════════ */
function renderAll() {
  const general = isGeneral();
  $('#nav-admins').hidden = !general;
  $('#nav-admin-count').textContent = admins.length + 1;
  if (state.view === 'admins' && !general) state.view = 'dashboard';
  $$('.side-link').forEach(b => b.classList.toggle('active', b.dataset.nav === state.view));
  $$('.unit-btn').forEach(b => b.classList.toggle('active', b.dataset.unit === state.unit));
  $('#nav-count').textContent = unitMembers().length;
  $('#view-dashboard').hidden = state.view !== 'dashboard';
  $('#view-members').hidden = state.view !== 'members';
  $('#view-birthdays').hidden = state.view !== 'birthdays';
  $('#view-admins').hidden = state.view !== 'admins';
  if (state.view === 'dashboard') renderDashboard();
  else if (state.view === 'members') renderMembers();
  else if (state.view === 'birthdays') renderBirthdays();
  else renderAdmins();
}

/* ═════════ Render: painel ═════════ */
function renderDashboard() {
  const list = unitMembers();
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const ativos = list.filter(m => m.status === 'ativo').length;
  const integracao = list.filter(m => m.status === 'integracao').length;
  const novos = list.filter(m => (m.joined || '').startsWith(ym)).length;
  const bdayMonth = birthdayEntries().filter(e => parseDate(e.birth).getMonth() === now.getMonth()).length;
  const kidsCount = list.reduce((n, m) => n + (m.children || []).length, 0);
  const allKids = list.flatMap(m => m.children || []);
  const groupCounts = { bercario: 0, junior: 0, bigger: 0, fora: 0 };
  allKids.forEach(k => { const g = kidGroup(k.birth); if (g) groupCounts[g]++; });
  const noBirthKids = allKids.length - Object.values(groupCounts).reduce((a, b) => a + b, 0);

  const minCounts = Object.keys(MINISTRIES)
    .map(k => ({ k, n: list.filter(m => m.ministry === k).length }))
    .filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  const maxMin = Math.max(1, ...minCounts.map(x => x.n));

  const upcoming = birthdayEntries().sort((a, b) => nextBirthdayDays(a.birth) - nextBirthdayDays(b.birth)).slice(0, 5);
  const recent = [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);

  const statCard = (label, value, color, icon, foot) => `
    <div class="stat" style="--sc:${color}">
      <div class="stat-label">${icon}${label}</div>
      <div class="stat-value" data-count="${value}">0</div>
      <div class="stat-foot">${foot}</div>
    </div>`;

  $('#view-dashboard').innerHTML = `
    <div class="hero">
      <div class="hero-inner">
        <div class="hero-hello">A paz, ${esc(state.user.name.split(' ')[0])}!</div>
        <div class="hero-title">JUNTOS POR UM SERVIR <span style="color:var(--red-hot)">AINDA MAIS FORTE</span></div>
        <div class="hero-sub">${esc(unitLabel(state.unit))} &nbsp•&nbsp; <b>${list.length}</b> membros cadastrados &nbsp•&nbsp; <b>${kidsCount}</b> crianças vinculadas &nbsp•&nbsp; <b>${bdayMonth}</b> aniversariantes em ${MONTHS[now.getMonth()]}</div>
      </div>
    </div>
    <div class="stats">
      ${statCard('Total de membros', list.length, 'var(--red-hot)', '<svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>', `em <b>${esc(unitLabel(state.unit).toLowerCase())}</b>`)}
      ${statCard('Membros ativos', ativos, 'var(--success)', '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>', 'servindo e congregando')}
      ${statCard('Em integração', integracao, 'var(--warning)', '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>', 'no curso de novos membros')}
      ${statCard('Novos em ' + MONTHS_SHORT[now.getMonth()], novos, 'var(--info)', '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>', 'chegaram este mês')}
    </div>
    <div class="panel groups-panel">
      <div class="panel-title">
        <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
        Turmas infantis
        <span class="groups-auto">classificação automática pela idade da criança</span>
      </div>
      <div class="group-cards">
        ${Object.entries(KID_GROUPS).map(([k, g]) => `
          <button class="group-card" style="--gc:${g.color}" data-group-search="${g.label}" type="button" title="Ver os responsáveis pelas crianças do ${g.label}">
            <span class="gc-head"><b>${g.label}</b><span class="gc-range">${g.range}</span></span>
            <span class="gc-num" data-count="${groupCounts[k]}">0</span>
            <span class="gc-foot">criança${groupCounts[k] === 1 ? '' : 's'} · ver responsáveis →</span>
          </button>`).join('')}
      </div>
      ${groupCounts.fora || noBirthKids ? `<p class="groups-note">${[
        groupCounts.fora ? `<b>${groupCounts.fora}</b> criança${groupCounts.fora > 1 ? 's' : ''} com 13+ anos (fora das turmas infantis)` : '',
        noBirthKids ? `<b>${noBirthKids}</b> sem data de nascimento — informe para classificar` : ''
      ].filter(Boolean).join(' · ')}</p>` : ''}
    </div>
    <div class="dash-grid">
      <div class="panel">
        <div class="panel-title">
          <svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3L2 9.4h7.6z"/></svg>
          Ministérios em movimento
        </div>
        ${minCounts.length ? minCounts.map(x => `
          <div class="min-bar-row">
            <span class="min-bar-label">${MINISTRIES[x.k].label}</span>
            <div class="min-bar-track"><div class="min-bar-fill" style="--mc:${MINISTRIES[x.k].color}" data-w="${(x.n / maxMin * 100).toFixed(1)}"></div></div>
            <span class="min-bar-num">${x.n}</span>
          </div>`).join('') : '<p class="empty-note">Nenhum membro nesta unidade ainda.</p>'}
        <div class="unit-split">
          ${Object.keys(UNITS).map(u => {
            const n = members.filter(m => m.unit === u).length;
            const a = members.filter(m => m.unit === u && m.status === 'ativo').length;
            return `<div class="unit-card" style="--uc:${UNITS[u].color}">
              <b><i class="dot dot-${u}"></i>${UNITS[u].label}</b>
              <div class="unit-num">${n}</div>
              <span>${a} ativos · ${n - a} em caminhada</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="panel">
          <div class="panel-title">
            <svg viewBox="0 0 24 24"><path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm6 3h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v9h18v-9c0-1.66-1.34-3-3-3z"/></svg>
            Próximos aniversários
            <button class="panel-link" data-goto="birthdays" type="button">ver todos →</button>
          </div>
          <div class="mini-list">
            ${upcoming.length ? upcoming.map(e => {
              const d = nextBirthdayDays(e.birth);
              const b = parseDate(e.birth);
              const sub = e.kind === 'kid'
                ? `filho(a) de ${esc(e.m.name)} · ${b.getDate()} de ${MONTHS[b.getMonth()]}`
                : `${UNITS[e.m.unit].label} · ${b.getDate()} de ${MONTHS[b.getMonth()]}`;
              return `<div class="mini-row" data-open="${e.m.id}">
                ${avatarHTML(e.name, 'avatar-sm')}
                <div class="mini-info"><b><span class="mi-name">${esc(e.name)}</span>${e.kind === 'kid' ? kidTagHTML(e.birth) : ''}</b><span>${sub}</span></div>
                <div class="mini-side">${d === 0 ? '<span class="bday-today">🎉 hoje!</span>' : d === 1 ? 'amanhã' : `em ${d} dias`}</div>
              </div>`;
            }).join('') : '<p class="empty-note">Cadastre datas de nascimento para acompanhar.</p>'}
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">
            <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
            Chegadas recentes
            <button class="panel-link" data-goto="members" type="button">ver membros →</button>
          </div>
          <div class="mini-list">
            ${recent.map(m => `<div class="mini-row" data-open="${m.id}">
              ${avatarHTML(m.name, 'avatar-sm')}
              <div class="mini-info"><b>${esc(m.name)}</b><span>${UNITS[m.unit].label} · entrou em ${fmtDate(m.joined)}</span></div>
              <div class="mini-side">${statusBadge(m.status)}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;

  $$('#view-dashboard .min-bar-fill').forEach(el => {
    const apply = () => { el.style.width = el.dataset.w + '%'; };
    requestAnimationFrame(apply);
    setTimeout(apply, 150);
  });
  $$('#view-dashboard .stat-value, #view-dashboard .gc-num').forEach(el => {
    const target = +el.dataset.count;
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / 650);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => { el.textContent = target; }, 800);
  });
}

/* ═════════ Render: membros ═════════ */
function renderMembers() {
  const minOptions = Object.entries(MINISTRIES).map(([k, v]) => `<option value="${k}" ${state.ministry === k ? 'selected' : ''}>${v.label}</option>`).join('');
  $('#view-members').innerHTML = `
    <div class="view-head">
      <h1 class="view-title">MEMBROS <span class="hl">· ${esc(unitLabel(state.unit).toUpperCase())}</span>
        <small>Cadastre, acompanhe e cuide de cada pessoa que Deus trouxe.</small>
      </h1>
      <button class="btn btn-ghost" data-action="export" type="button" title="Baixar planilha Excel formatada (.xlsx)">
        <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
        Exportar Excel
      </button>
    </div>
    <div class="toolbar">
      <div class="search-box ${state.search ? 'has-value' : ''}">
        <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input id="member-search" type="search" placeholder="Buscar nome, telefone, turma infantil…" value="${esc(state.search)}" autocomplete="off">
        <button class="search-clear" data-action="clear-search" type="button" aria-label="Limpar busca">✕</button>
      </div>
      <div class="select-wrap">
        <select id="filter-status" aria-label="Filtrar por status">
          <option value="todos" ${state.status === 'todos' ? 'selected' : ''}>Todos os status</option>
          ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${state.status === k ? 'selected' : ''}>${v.label}</option>`).join('')}
        </select>
      </div>
      <div class="select-wrap">
        <select id="filter-ministry" aria-label="Filtrar por ministério">
          <option value="todos" ${state.ministry === 'todos' ? 'selected' : ''}>Todos os ministérios</option>
          ${minOptions}
        </select>
      </div>
      <div class="select-wrap">
        <select id="sort-by" aria-label="Ordenar">
          <option value="name" ${state.sort === 'name' ? 'selected' : ''}>Nome (A–Z)</option>
          <option value="recent" ${state.sort === 'recent' ? 'selected' : ''}>Cadastro recente</option>
          <option value="joined" ${state.sort === 'joined' ? 'selected' : ''}>Entrada recente</option>
          <option value="birthday" ${state.sort === 'birthday' ? 'selected' : ''}>Próximo aniversário</option>
        </select>
      </div>
      <div class="toolbar-spacer"></div>
      <div class="savedviews-wrap">
        <button id="btn-savedviews" class="btn btn-ghost" type="button">
          <svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/></svg>
          Visões salvas${state.savedViews.length ? ` (${state.savedViews.length})` : ''}
        </button>
        <div id="savedviews-menu" class="savedviews-menu" hidden></div>
      </div>
      <button class="btn btn-primary" data-action="new-member" type="button">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        Novo membro
      </button>
    </div>
    <div id="bulkbar-zone"></div>
    <div id="result-meta" class="result-meta"></div>
    <div id="member-list-wrap"></div>`;
  updateMemberList();
}

function updateMemberList() {
  const list = filteredMembers();
  const total = unitMembers().length;
  const visibleIds = new Set(list.map(m => m.id));
  state.selected = new Set([...state.selected].filter(id => visibleIds.has(id)));

  $('#result-meta').innerHTML = `Exibindo <b>${list.length}</b> de <b>${total}</b> membros${state.search || state.status !== 'todos' || state.ministry !== 'todos' ? ' · filtros ativos' : ''}`;

  const sel = state.selected;
  $('#bulkbar-zone').innerHTML = sel.size ? `
    <div class="bulkbar">
      <b>${sel.size} selecionado${sel.size > 1 ? 's' : ''}</b>
      <div class="select-wrap">
        <select id="bulk-unit" aria-label="Mover para unidade">
          <option value="">Mover para…</option>
          <option value="pacheco">AMI Pacheco</option>
          <option value="amendoeira">AMI Amendoeira</option>
        </select>
      </div>
      <div class="select-wrap">
        <select id="bulk-status" aria-label="Alterar status">
          <option value="">Status…</option>
          ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-danger btn-sm" data-action="bulk-delete" type="button">
        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        Excluir
      </button>
      <button class="bulk-clear" data-action="bulk-clear" type="button">Limpar seleção</button>
    </div>` : '';

  if (!list.length) {
    $('#member-list-wrap').innerHTML = `
      <div class="empty-state">
        <div class="empty-heart"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
        <h3>${total ? 'Nenhum membro encontrado' : 'Nenhum membro nesta unidade ainda'}</h3>
        <p>${total ? 'Ajuste a busca ou os filtros para encontrar quem você procura.' : 'Que alegria começar! Cadastre o primeiro membro desta unidade.'}</p>
        ${total ? '<button class="btn btn-ghost" data-action="reset-filters" type="button">Limpar filtros</button>' : '<button class="btn btn-primary" data-action="new-member" type="button">Cadastrar primeiro membro</button>'}
      </div>`;
    return;
  }

  const allChecked = list.every(m => sel.has(m.id));
  $('#member-list-wrap').innerHTML = `
    <div class="table-scroll">
      <table class="member-table">
        <thead><tr>
          <th style="width:38px"><input type="checkbox" class="rowcheck" id="check-all" ${allChecked ? 'checked' : ''} aria-label="Selecionar todos"></th>
          <th>Membro</th><th>Unidade</th><th>Telefone</th><th>Ministério</th><th>Status</th><th style="text-align:right">Ações</th>
        </tr></thead>
        <tbody>
          ${list.map(m => `
            <tr data-open="${m.id}" class="${sel.has(m.id) ? 'selected' : ''}">
              <td><input type="checkbox" class="rowcheck" data-check="${m.id}" ${sel.has(m.id) ? 'checked' : ''} aria-label="Selecionar ${esc(m.name)}"></td>
              <td><div class="cell-name">${avatarHTML(m.name, 'avatar-sm')}<div><b>${esc(m.name)}</b><span>${esc(m.email || (m.birth ? 'Nasc. ' + fmtDate(m.birth) : 'Sem e-mail'))}${(m.children || []).length ? ` · <span class="kids-inline">${m.children.length} filho${m.children.length > 1 ? 's' : ''}</span>` : ''}</span></div></div></td>
              <td>${unitBadge(m.unit)}</td>
              <td class="cell-phone">${esc(m.phone || '—')}</td>
              <td>${minChip(m.ministry)}</td>
              <td>${statusBadge(m.status)}</td>
              <td><div class="row-actions">
                <button class="icon-btn" data-edit="${m.id}" type="button" title="Editar" aria-label="Editar ${esc(m.name)}"><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button>
                <button class="icon-btn del" data-del="${m.id}" type="button" title="Excluir" aria-label="Excluir ${esc(m.name)}"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
              </div></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  const ca = $('#check-all');
  if (ca && !allChecked && sel.size) ca.indeterminate = true;
}

/* ═════════ Render: aniversariantes ═════════ */
function renderBirthdays() {
  const entries = birthdayEntries();
  const t = today();
  const monthList = entries
    .filter(e => parseDate(e.birth).getMonth() === state.bmonth)
    .sort((a, b) => parseDate(a.birth).getDate() - parseDate(b.birth).getDate());

  $('#view-birthdays').innerHTML = `
    <div class="view-head">
      <h1 class="view-title">ANIVERSARIANTES <span class="hl">· ${MONTHS[state.bmonth].toUpperCase()}</span>
        <small>Membros e crianças vinculadas — ${esc(unitLabel(state.unit))}.</small>
      </h1>
    </div>
    <div class="month-strip">
      ${MONTHS.map((mn, i) => {
        const n = entries.filter(e => parseDate(e.birth).getMonth() === i).length;
        return `<button class="month-btn ${i === state.bmonth ? 'active' : ''}" data-month="${i}" type="button">${MONTHS_SHORT[i]}<span class="mb-count">${n}</span></button>`;
      }).join('')}
    </div>
    ${monthList.length ? `<div class="bday-grid">
      ${monthList.map(e => {
        const b = parseDate(e.birth);
        const isToday = state.bmonth === t.getMonth() && b.getDate() === t.getDate();
        const age = turningAge(e.birth);
        const isKid = e.kind === 'kid';
        return `<div class="bday-card ${isToday ? 'today' : ''} ${isKid ? 'kid' : ''}" data-open="${e.m.id}">
          <div class="bday-day"><b>${String(b.getDate()).padStart(2,'0')}</b><span>${MONTHS_SHORT[b.getMonth()]}</span></div>
          ${avatarHTML(e.name)}
          <div class="bday-info"><b><span class="mi-name">${esc(e.name)}</span>${isKid ? kidTagHTML(e.birth) : ''}</b><span>${UNITS[e.m.unit].label}</span>${isKid ? `<span class="kid-guard">filho(a) de ${esc(e.m.name)}</span>` : `<span>${esc(e.m.phone || '')}</span>`}</div>
          ${age !== null ? `<span class="bday-age">${age} anos</span>` : ''}
        </div>`;
      }).join('')}
    </div>` : `
    <div class="empty-state">
      <div class="empty-heart"><svg viewBox="0 0 24 24"><path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm6 3h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v9h18v-9c0-1.66-1.34-3-3-3z"/></svg></div>
      <h3>Nenhum aniversariante em ${MONTHS[state.bmonth]}</h3>
      <p>Cadastre as datas de nascimento dos membros e das crianças para celebrar junto com eles.</p>
      <button class="btn btn-primary" data-goto="members" type="button">Ir para membros</button>
    </div>`}`;
}

/* ═════════ Drawer de detalhes ═════════ */
let drawerId = null;
const SVG_PRINT = '<svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
const SVG_WARN = '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
function openDrawer(id) {
  const m = members.find(x => x.id === id);
  if (!m) return;
  drawerId = id;
  const wa = (m.phone || '').replace(/\D/g, '');
  $('#drawer').innerHTML = `
    <div class="drawer-hero">
      <button class="icon-btn drawer-close" data-action="close-drawer" type="button" aria-label="Fechar detalhes">✕</button>
      ${avatarHTML(m.name, 'avatar-lg')}
      <div class="drawer-name">${esc(m.name)}</div>
      <div class="drawer-badges">${unitBadge(m.unit)}${statusBadge(m.status)}${minChip(m.ministry)}${(m.children || []).length ? `<span class="chip-min" style="--mc:#2BD9E8">${m.children.length} filho${m.children.length > 1 ? 's' : ''}</span>` : ''}</div>
    </div>
    <div class="drawer-body">
      <dl class="detail-grid">
        <div class="detail-item"><dt>Telefone / WhatsApp</dt><dd>${m.phone ? (wa.length >= 10 ? `<a href="https://wa.me/55${wa}" target="_blank" rel="noopener">${esc(m.phone)}</a>` : esc(m.phone)) : '—'}</dd></div>
        <div class="detail-item"><dt>E-mail</dt><dd>${m.email ? `<a href="mailto:${esc(m.email)}">${esc(m.email)}</a>` : '—'}</dd></div>
        <div class="detail-item"><dt>Nascimento</dt><dd>${fmtDate(m.birth)}${m.birth && currentAge(m.birth) !== null ? ` · ${currentAge(m.birth)} anos` : ''}</dd></div>
        <div class="detail-item"><dt>Entrada na igreja</dt><dd>${fmtDate(m.joined)}</dd></div>
        <div class="detail-item"><dt>Batismo nas águas</dt><dd>${m.baptized ? '<span class="baptized-tag">✓ Batizado(a)</span>' : 'Ainda não'}</dd></div>
        <div class="detail-item"><dt>Próximo aniversário</dt><dd>${m.birth ? (nextBirthdayDays(m.birth) === 0 ? '🎉 Hoje!' : `em ${nextBirthdayDays(m.birth)} dias`) : '—'}</dd></div>
        <div class="detail-item full"><dt>Endereço / Bairro</dt><dd>${esc(m.address || '—')}</dd></div>
        <div class="detail-item full"><dt>Filhos / Crianças${(m.children || []).length ? ` · ${m.children.length}` : ''}</dt><dd>
          ${m.hasChildren && (m.children || []).length ? `<div class="kid-list">${m.children.map(k => `
            <div class="kid-card">
              <div class="kid-row">
                ${avatarHTML(k.name, 'avatar-sm')}
                <div class="kid-info"><b>${esc(k.name)}</b><span>${k.birth ? `${ageLabel(k.birth)} · nasc. ${fmtDate(k.birth)}` : 'Nascimento não informado'}</span></div>
                ${groupChip(k.birth)}
                <button class="icon-btn kid-print" data-kid-print="${m.id}|${k.id}" type="button" title="Imprimir etiqueta" aria-label="Imprimir etiqueta de ${esc(k.name)}">${SVG_PRINT}</button>
              </div>
              ${k.allergy ? `<div class="kid-allergy-note">${SVG_WARN}<span><b>Alergia:</b> ${esc(k.allergy)}</span></div>` : ''}
            </div>`).join('')}</div>` : (m.hasChildren ? 'Sim — nenhuma criança cadastrada ainda.' : 'Não')}
          <div class="kid-actions">
            <button class="btn btn-ghost btn-sm" data-kids-edit="${m.id}" type="button">Gerenciar filhos</button>
            ${m.hasChildren && (m.children || []).length ? `<button class="btn btn-ghost btn-sm" data-kids-print="${m.id}" type="button">${SVG_PRINT} Imprimir etiquetas</button>` : ''}
          </div>
        </dd></div>
      </dl>
      ${m.notes ? `<dt style="font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:6px">Observações</dt><div class="detail-notes">${esc(m.notes)}</div>` : ''}
      <div class="drawer-actions">
        <button class="btn btn-primary" data-edit="${m.id}" type="button">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          Editar
        </button>
        <button class="btn btn-danger" data-del="${m.id}" type="button">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          Excluir
        </button>
      </div>
    </div>`;
  $('#drawer').hidden = false;
  $('#drawer-overlay').hidden = false;
  syncBodyLock();
}
function closeDrawer() { drawerId = null; $('#drawer').hidden = true; $('#drawer-overlay').hidden = true; syncBodyLock(); }
function syncBodyLock() {
  document.body.classList.toggle('modal-open', !$('#form-overlay').hidden || !$('#drawer').hidden);
}

/* ═════════ Formulário ═════════ */
let editingId = null;
let formChildren = [];
let formHasChildren = false;

function setFormTab(tab) {
  $$('.ftab').forEach(b => b.classList.toggle('active', b.dataset.ftab === tab));
  $('#ftab-dados').hidden = tab !== 'dados';
  $('#ftab-filhos').hidden = tab !== 'filhos';
  $('#form-scroll').scrollTop = 0;
}
function syncChildrenUI() {
  $$('.yn-btn').forEach(b => b.classList.toggle('active', (b.dataset.yn === 'sim') === formHasChildren));
  $('#children-editor').hidden = !formHasChildren;
  $('#children-none-note').hidden = formHasChildren;
  const warn = $('#children-warning');
  warn.hidden = !( !formHasChildren && formChildren.length );
  if (!warn.hidden) warn.textContent = `Ao salvar com “Não”, ${formChildren.length} criança${formChildren.length > 1 ? 's' : ''} cadastrada${formChildren.length > 1 ? 's' : ''} será${formChildren.length > 1 ? 'ão' : ''} removida${formChildren.length > 1 ? 's' : ''} do cadastro.`;
  $('#ftab-kids-count').textContent = formChildren.length;
}
function renderChildrenRows() {
  $('#children-list').innerHTML = formChildren.map(c => `
    <div class="child-row">
      <label>Nome da criança *
        <input type="text" data-kid-name="${c.id}" value="${esc(c.name)}" maxlength="80" placeholder="Ex.: Miguel Lima" autocomplete="off">
        <em class="field-err" data-kerr="${c.id}"></em>
      </label>
      <label>Nascimento
        <input type="date" data-kid-birth="${c.id}" value="${c.birth || ''}">
      </label>
      <span class="kid-age-chip" data-kid-age="${c.id}" ${c.birth ? '' : 'hidden'}>${ageLabel(c.birth)}</span>
      <span class="kid-group-slot" data-kid-group="${c.id}">${groupChip(c.birth)}</span>
      <button class="icon-btn" data-kid-del="${c.id}" type="button" title="Remover criança" aria-label="Remover criança">${'<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>'}</button>
      <label class="child-allergy">Alergias / restrições de saúde (opcional)
        <input type="text" data-kid-allergy="${c.id}" value="${esc(c.allergy || '')}" maxlength="160" placeholder="Ex.: alergia a amendoim, lactose, medicamentos…" autocomplete="off">
      </label>
    </div>`).join('');
}

function openForm(id = null, tab = 'dados') {
  editingId = id;
  const form = $('#member-form');
  form.reset();
  $$('#member-form .field-err').forEach(e => e.classList.remove('show'));
  $$('#member-form input').forEach(i => i.classList.remove('invalid'));
  $('#form-ministry').innerHTML = Object.entries(MINISTRIES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  const m = id ? members.find(x => x.id === id) : null;
  $('#form-title').textContent = m ? 'Editar membro' : 'Novo membro';
  $('#form-submit').textContent = m ? 'Salvar alterações' : 'Cadastrar membro';
  if (m) {
    for (const k of ['name','unit','status','ministry','birth','phone','email','joined','address','notes']) form.elements[k].value = m[k] || '';
    form.elements.baptized.checked = !!m.baptized;
  } else {
    form.elements.unit.value = state.unit !== 'all' ? state.unit : 'pacheco';
    form.elements.ministry.value = 'nenhum';
    form.elements.joined.value = new Date().toISOString().slice(0, 10);
  }
  formChildren = m ? (m.children || []).map(k => ({ ...k })) : [];
  formHasChildren = m ? !!m.hasChildren : false;
  renderChildrenRows();
  syncChildrenUI();
  setFormTab(tab);
  $('#form-overlay').hidden = false;
  syncBodyLock();
  if (tab === 'dados') setTimeout(() => form.elements.name.focus(), 60);
}
function closeForm() { $('#form-overlay').hidden = true; editingId = null; syncBodyLock(); }

function submitForm(e) {
  e.preventDefault();
  const form = $('#member-form');
  const val = k => form.elements[k].value.trim();
  let ok = true;
  const nameErr = $('[data-err="name"]'), emailErr = $('[data-err="email"]');
  nameErr.classList.remove('show'); emailErr.classList.remove('show');
  form.elements.name.classList.remove('invalid'); form.elements.email.classList.remove('invalid');
  if (!val('name')) {
    nameErr.textContent = 'Informe o nome do membro.'; nameErr.classList.add('show');
    form.elements.name.classList.add('invalid'); ok = false;
  }
  if (val('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) {
    emailErr.textContent = 'E-mail inválido.'; emailErr.classList.add('show');
    form.elements.email.classList.add('invalid'); ok = false;
  }
  const mainOk = ok;
  $$('#children-list [data-kerr]').forEach(el => el.classList.remove('show'));
  $$('#children-list input').forEach(i => i.classList.remove('invalid'));
  $('#children-err').classList.remove('show');
  let kidsBad = false;
  if (formHasChildren) {
    if (!formChildren.length) {
      $('#children-err').textContent = 'Adicione pelo menos uma criança ou marque “Não”.';
      $('#children-err').classList.add('show');
      kidsBad = true;
    }
    formChildren.forEach(c => {
      if (!c.name.trim()) {
        const err = document.querySelector(`[data-kerr="${c.id}"]`);
        const inp = document.querySelector(`[data-kid-name="${c.id}"]`);
        if (err) { err.textContent = 'Informe o nome da criança.'; err.classList.add('show'); }
        if (inp) inp.classList.add('invalid');
        kidsBad = true;
      }
    });
  }
  if (!mainOk || kidsBad) { setFormTab(mainOk ? 'filhos' : 'dados'); return; }

  const data = {
    name: val('name'), unit: form.elements.unit.value, status: form.elements.status.value,
    ministry: form.elements.ministry.value, birth: form.elements.birth.value,
    phone: val('phone'), email: val('email'), joined: form.elements.joined.value,
    baptized: form.elements.baptized.checked, address: val('address'), notes: val('notes'),
    hasChildren: formHasChildren,
    children: formHasChildren ? formChildren.map(c => ({ id: c.id, name: c.name.trim(), birth: c.birth || '', allergy: (c.allergy || '').trim() })) : []
  };
  if (editingId) {
    const m = members.find(x => x.id === editingId);
    Object.assign(m, data);
    toast(`Dados de ${data.name.split(' ')[0]} atualizados.`);
  } else {
    members.push({ id: uid(), ...data, createdAt: new Date().toISOString() });
    toast(`${data.name.split(' ')[0]} cadastrado(a) em ${UNITS[data.unit].label}!`);
  }
  saveMembers();
  const keepDrawer = drawerId;
  closeForm();
  renderAll();
  if (keepDrawer) openDrawer(keepDrawer);
}

/* ═════════ Exclusão + desfazer ═════════ */
function deleteMembers(ids) {
  const removed = members.filter(m => ids.includes(m.id));
  if (!removed.length) return;
  members = members.filter(m => !ids.includes(m.id));
  saveMembers();
  state.selected.clear();
  if (drawerId && ids.includes(drawerId)) closeDrawer();
  renderAll();
  const msg = removed.length === 1 ? `${removed[0].name} foi excluído(a).` : `${removed.length} membros excluídos.`;
  toast(msg, {
    type: 'danger',
    undo: () => {
      members = members.concat(removed);
      saveMembers();
      renderAll();
      toast(removed.length === 1 ? `${removed[0].name.split(' ')[0]} restaurado(a).` : `${removed.length} membros restaurados.`);
    }
  });
}

/* ═════════ Exportação Excel (.xlsx) — formatada, com linhas separando ═════════ */
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const XLSX_CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function xlsxCrc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = XLSX_CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function xlsxCol(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function xlsxCell(ref, s, v) {
  return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(v ?? '')}</t></is></c>`;
}
/* ZIP writer (método STORE, sem dependências) */
function xlsxZip(files) {
  const enc = new TextEncoder();
  const d = new Date();
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name), data = f.data, crc = xlsxCrc32(data);
    const lh = new Uint8Array(30 + name.length), lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true); lv.setUint16(10, dosTime, true); lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true); lv.setUint16(28, 0, true); lh.set(name, 30);
    locals.push(lh, data);
    const ch = new Uint8Array(46 + name.length), cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true); cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
    ch.set(name, 46); centrals.push(ch);
    offset += lh.length + data.length;
  }
  const cdSize = centrals.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
  const out = new Uint8Array(offset + cdSize + 22);
  let pos = 0;
  for (const c of locals) { out.set(c, pos); pos += c.length; }
  for (const c of centrals) { out.set(c, pos); pos += c.length; }
  out.set(end, pos);
  return out;
}
function xlsxStyles() {
  const font = (b, sz, color, i) => `<font>${i ? '<i/>' : ''}${b ? '<b/>' : ''}<sz val="${sz}"/><color rgb="${color}"/><name val="Calibri"/><family val="2"/></font>`;
  const fill = rgb => `<fill><patternFill patternType="solid"><fgColor rgb="${rgb}"/><bgColor indexed="64"/></patternFill></fill>`;
  const bord = '<border><left style="thin"><color rgb="FFD9A7AC"/></left><right style="thin"><color rgb="FFD9A7AC"/></right><top style="thin"><color rgb="FFD9A7AC"/></top><bottom style="thin"><color rgb="FFD9A7AC"/></bottom><diagonal/></border>';
  const xf = (f, fl, b, align) => `<xf numFmtId="0" fontId="${f}" fillId="${fl}" borderId="${b}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment ${align}/></xf>`;
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<fonts count="6">${font(0,11,'FF1A1A1A')}${font(1,16,'FFFFFFFF')}${font(1,11,'FFFFFFFF')}${font(0,11,'FF262626')}${font(1,11,'FF9E0B1E')}${font(0,10,'FF8A5A5E',1)}</fonts>` +
    `<fills count="7"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${fill('FFE8112D')}${fill('FF9E0B1E')}${fill('FFFBE9EB')}${fill('FFFFFFFF')}${fill('FFFDECEE')}</fills>` +
    `<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${bord}</borders>` +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellStyleXfs>' +
    '<cellXfs count="9">' +
    xf(0,0,0,'vertical="center"') +
    xf(1,3,0,'horizontal="left" vertical="center" indent="1"') +
    xf(5,0,0,'horizontal="left" vertical="center" indent="1"') +
    xf(2,2,1,'horizontal="center" vertical="center" wrapText="1"') +
    xf(3,5,1,'horizontal="left" vertical="center" wrapText="1" indent="1"') +
    xf(3,4,1,'horizontal="left" vertical="center" wrapText="1" indent="1"') +
    xf(3,5,1,'horizontal="center" vertical="center" wrapText="1"') +
    xf(3,4,1,'horizontal="center" vertical="center" wrapText="1"') +
    xf(4,6,1,'horizontal="left" vertical="center" wrapText="1" indent="1"') +
    '</cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    '<dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>' +
    '</styleSheet>';
}
function xlsxSheet({ title, subtitle, cols, rows, centerCols = [], allergyCol = -1, emptyNote = '' }) {
  const n = cols.length, last = xlsxCol(n);
  const totalRows = 3 + Math.max(rows.length, emptyNote ? 1 : 0);
  let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>' +
    `<dimension ref="A1:${last}${totalRows}"/>` +
    '<sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="3" topLeftCell="A4" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A4" sqref="A4"/></sheetView></sheetViews>' +
    '<sheetFormatPr defaultRowHeight="18"/>' +
    '<cols>' + cols.map((c, i) => `<col min="${i+1}" max="${i+1}" width="${c.width}" customWidth="1"/>`).join('') + '</cols>' +
    '<sheetData>';
  x += '<row r="1" ht="32" customHeight="1">' + cols.map((c, i) => xlsxCell(xlsxCol(i+1)+'1', 1, i === 0 ? title : '')).join('') + '</row>';
  x += '<row r="2" ht="20" customHeight="1">' + cols.map((c, i) => xlsxCell(xlsxCol(i+1)+'2', 2, i === 0 ? subtitle : '')).join('') + '</row>';
  x += '<row r="3" ht="28" customHeight="1">' + cols.map((c, i) => xlsxCell(xlsxCol(i+1)+'3', 3, c.label)).join('') + '</row>';
  if (rows.length) {
    rows.forEach((r, ri) => {
      const rn = 4 + ri, zebra = ri % 2 === 1;
      x += `<row r="${rn}">` + r.map((val, ci) => {
        let s;
        if (ci === allergyCol && String(val ?? '').trim()) s = 8;
        else { const center = centerCols.includes(ci); s = center ? (zebra ? 7 : 6) : (zebra ? 5 : 4); }
        return xlsxCell(xlsxCol(ci+1)+rn, s, val);
      }).join('') + '</row>';
    });
  } else if (emptyNote) {
    x += '<row r="4" ht="24" customHeight="1">' + cols.map((c, i) => xlsxCell(xlsxCol(i+1)+'4', 4, i === 0 ? emptyNote : '')).join('') + '</row>';
  }
  x += '</sheetData>';
  if (rows.length) x += `<autoFilter ref="A3:${last}${3 + rows.length}"/>`;
  x += `<mergeCells count="2"><mergeCell ref="A1:${last}1"/><mergeCell ref="A2:${last}2"/></mergeCells>`;
  x += '<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/>';
  x += '<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>';
  x += '</worksheet>';
  return x;
}
function xlsxBuild(sheets) {
  const enc = new TextEncoder(), files = [], n = sheets.length;
  let ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
  for (let i = 1; i <= n; i++) ct += `<Override PartName="/xl/worksheets/sheet${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  ct += '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>';
  files.push({ name: '[Content_Types].xml', data: enc.encode(ct) });
  files.push({ name: '_rels/.rels', data: enc.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') });
  let wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>';
  sheets.forEach((s, i) => wb += `<sheet name="${esc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`);
  wb += '</sheets></workbook>';
  files.push({ name: 'xl/workbook.xml', data: enc.encode(wb) });
  let wr = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  for (let i = 1; i <= n; i++) wr += `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i}.xml"/>`;
  wr += `<Relationship Id="rId${n+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  files.push({ name: 'xl/_rels/workbook.xml.rels', data: enc.encode(wr) });
  files.push({ name: 'xl/styles.xml', data: enc.encode(xlsxStyles()) });
  sheets.forEach((s, i) => files.push({ name: `xl/worksheets/sheet${i+1}.xml`, data: enc.encode(xlsxSheet(s)) }));
  return xlsxZip(files);
}
function exportExcel() {
  const list = filteredMembers();
  if (!list.length) { toast('Nada para exportar com os filtros atuais.', { type: 'info' }); return; }
  const stamp = new Date().toISOString().slice(0, 10);
  const fparts = [];
  if (state.status !== 'todos') fparts.push('Status: ' + STATUS[state.status].label);
  if (state.ministry !== 'todos') fparts.push('Ministério: ' + (MINISTRIES[state.ministry] || MINISTRIES.nenhum).label);
  if (state.search.trim()) fparts.push('Busca: “' + state.search.trim() + '”');
  const ftxt = fparts.length ? ' · Filtros: ' + fparts.join(' | ') : '';
  const kidSummary = m => (m.children || []).map(k => {
    const g = kidGroup(k.birth);
    const gl = g && g !== 'fora' ? ` · ${KID_GROUPS[g].label}` : (g === 'fora' ? ' · 13+' : '');
    return `${k.name}${k.birth ? ` (${fmtDate(k.birth)}${gl})` : ''}${k.allergy ? ` · ALERGIA: ${k.allergy}` : ''}`;
  }).join('  |  ');
  const mCols = [
    { label: 'Nome', width: 34 }, { label: 'Unidade', width: 18 }, { label: 'Status', width: 16 },
    { label: 'Ministério', width: 18 }, { label: 'Nascimento', width: 14 }, { label: 'Telefone', width: 18 },
    { label: 'E-mail', width: 30 }, { label: 'Batizado', width: 12 }, { label: 'Entrada', width: 14 },
    { label: 'Endereço', width: 34 }, { label: 'Observações', width: 40 }, { label: 'Tem filhos', width: 12 },
    { label: 'Crianças vinculadas', width: 54 }
  ];
  const mRows = list.map(m => [
    m.name, UNITS[m.unit].label, STATUS[m.status].label, (MINISTRIES[m.ministry] || MINISTRIES.nenhum).label,
    fmtDate(m.birth) === '—' ? '' : fmtDate(m.birth), m.phone || '', m.email || '', m.baptized ? 'Sim' : 'Não',
    fmtDate(m.joined) === '—' ? '' : fmtDate(m.joined), m.address || '', m.notes || '', m.hasChildren ? 'Sim' : 'Não',
    kidSummary(m)
  ]);
  const kids = [];
  list.forEach(m => (m.children || []).forEach(k => {
    const g = kidGroup(k.birth);
    const turma = g && g !== 'fora' ? KID_GROUPS[g].label : (g === 'fora' ? '13+ anos' : '—');
    kids.push([k.name, k.birth ? fmtDate(k.birth) : '', ageLabel(k.birth) || '', turma, k.allergy || '', m.name, UNITS[m.unit].label, m.phone || '']);
  }));
  const kCols = [
    { label: 'Criança', width: 30 }, { label: 'Nascimento', width: 14 }, { label: 'Idade', width: 16 },
    { label: 'Turma', width: 16 }, { label: 'Alergias / restrições', width: 44 }, { label: 'Responsável', width: 30 },
    { label: 'Unidade', width: 18 }, { label: 'Telefone do responsável', width: 22 }
  ];
  const sheets = [
    { name: 'Membros', title: `AMI INTEGRAÇÃO · ${unitLabel(state.unit).toUpperCase()}`, subtitle: `Cadastro de membros · Exportado em ${fmtDate(stamp)} · ${list.length} registro(s)${ftxt}`, cols: mCols, rows: mRows, centerCols: [1, 2, 4, 5, 7, 8, 11] },
    { name: 'Crianças', title: 'AMI INTEGRAÇÃO · CRIANÇAS', subtitle: `Crianças vinculadas · ${kids.length} registro(s) · Turma identificada automaticamente pela idade`, cols: kCols, rows: kids, centerCols: [1, 2, 3, 6, 7], allergyCol: 4, emptyNote: 'Nenhuma criança vinculada aos membros exportados.' }
  ];
  const blob = new Blob([xlsxBuild(sheets)], { type: XLSX_MIME });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ami-membros-${state.unit}-${stamp}.xlsx`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`${list.length} membros exportados em Excel (.xlsx)${kids.length ? ` · ${kids.length} crianças` : ''}.`);
}

/* ═════════ Etiquetas das crianças ═════════ */
function labelHTML(m, k) {
  const g = kidGroup(k.birth);
  const turma = g && g !== 'fora' ? KID_GROUPS[g].label : (g === 'fora' ? '13+ anos' : 'Turma não definida');
  const meta = k.birth ? `${ageLabel(k.birth)} · nasc. ${fmtDate(k.birth)}` : 'Nascimento não informado';
  return `<div class="label">
    <div class="label-top">
      <span class="label-brand">AMI <em>Integração</em></span>
      <span class="label-unit">${esc(UNITS[m.unit].label)}</span>
    </div>
    <div class="label-name">${esc(k.name)}</div>
    <div class="label-meta"><span class="label-turma">${esc(turma)}</span><span class="label-age">${esc(meta)}</span></div>
    <div class="label-guard"><b>Responsável:</b> ${esc(m.name)}${m.phone ? ` &nbsp;·&nbsp; ${esc(m.phone)}` : ''}</div>
    ${k.allergy
      ? `<div class="label-allergy"><span class="label-allergy-tag">⚠ ALERGIA</span><span>${esc(k.allergy)}</span></div>`
      : '<div class="label-noallergy">Sem alergias informadas</div>'}
    <div class="label-foot">Uma igreja que AMA e se MOVIMENTA! · ${esc(UNITS[m.unit].label)}</div>
  </div>`;
}
function printLabels(pairs) {
  if (!pairs.length) { toast('Nenhuma criança para imprimir.', { type: 'info' }); return; }
  $('#print-zone').innerHTML = pairs.map(([m, k]) => labelHTML(m, k)).join('');
  document.body.classList.add('print-labels');
  const cleanup = () => { document.body.classList.remove('print-labels'); window.removeEventListener('afterprint', cleanup); };
  window.addEventListener('afterprint', cleanup);
  window.print();
  setTimeout(cleanup, 800);
}

/* ═════════ Visões salvas ═════════ */
function renderSavedViewsMenu() {
  const menu = $('#savedviews-menu');
  if (!menu) return;
  menu.innerHTML = `
    ${state.savedViews.length ? state.savedViews.map(v => `
      <div class="sv-item">
        <button class="sv-apply" data-sv-apply="${v.id}" type="button">${esc(v.name)}
          <span class="sv-meta">${esc(unitLabel(v.unit))}${v.status !== 'todos' ? ' · ' + STATUS[v.status].label : ''}${v.ministry !== 'todos' ? ' · ' + MINISTRIES[v.ministry].label : ''}${v.search ? ` · “${esc(v.search)}”` : ''}</span>
        </button>
        <button class="sv-del" data-sv-del="${v.id}" type="button" aria-label="Excluir visão">✕</button>
      </div>`).join('') : '<div class="sv-empty">Nenhuma visão salva ainda.<br>Salve a combinação atual de filtros.</div>'}
    <button class="sv-save-current" data-action="open-saveview" type="button">＋ Salvar filtros atuais como visão</button>`;
}
function openSaveViewPop() {
  const btn = $('#btn-savedviews');
  const r = btn.getBoundingClientRect();
  const pop = $('#saveview-pop');
  pop.hidden = false;
  const w = 270;
  pop.style.left = Math.max(10, Math.min(window.innerWidth - w - 10, r.right - w)) + 'px';
  pop.style.top = Math.min(window.innerHeight - 160, r.bottom + 8) + 'px';
  $('#saveview-name').value = '';
  setTimeout(() => $('#saveview-name').focus(), 50);
}
function confirmSaveView() {
  const name = $('#saveview-name').value.trim();
  if (!name) { $('#saveview-name').focus(); return; }
  state.savedViews.push({ id: uid(), name, unit: state.unit, search: state.search, status: state.status, ministry: state.ministry, sort: state.sort });
  store.set('ami.savedViews', state.savedViews);
  $('#saveview-pop').hidden = true;
  toast(`Visão “${name}” salva.`);
  renderMembers();
}

/* ═════════ Administradores ═════════ */
const SVG_CROWN = '<svg viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>';
const SVG_SHIELD = '<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>';
const SVG_LOCK = '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>';
const SVG_TRASH = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
const SVG_PLUS = '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';

function renderAdmins() {
  const gaName = normEmail(state.user.email) === GENERAL_ADMIN.email ? state.user.name : GENERAL_ADMIN.name;
  $('#view-admins').innerHTML = `
    <div class="view-head">
      <h1 class="view-title">ADMINISTRADORES <span class="hl">· ACESSO AO APP</span>
        <small>Somente contas Google cadastradas aqui conseguem entrar no AMI Integração.</small>
      </h1>
    </div>
    <div class="admin-grid">
      <div class="panel">
        <div class="panel-title">${SVG_SHIELD} Contas com acesso
          <span class="panel-link" style="cursor:default">${admins.length + 1} conta${admins.length ? 's' : ''}</span>
        </div>
        <div class="admin-list">
          <div class="admin-card geral">
            ${avatarHTML(gaName)}
            <div class="admin-info">
              <b>${esc(gaName)} ${normEmail(state.user.email) === GENERAL_ADMIN.email ? '<em class="you-tag">você</em>' : ''}</b>
              <span>${GENERAL_ADMIN.email}</span>
              <em class="admin-meta">Conta principal · acesso total · não removível</em>
            </div>
            <span class="badge-role role-geral">${SVG_CROWN}Administrador geral</span>
          </div>
          ${admins.map(a => `
            <div class="admin-card">
              ${avatarHTML(a.name)}
              <div class="admin-info">
                <b>${esc(a.name)} ${normEmail(state.user.email) === a.email ? '<em class="you-tag">você</em>' : ''}</b>
                <span>${esc(a.email)}</span>
                <em class="admin-meta">Desde ${fmtDate((a.addedAt || '').slice(0, 10))} · liberado por ${esc(a.addedBy || '—')}</em>
              </div>
              <span class="badge-role role-admin">${SVG_SHIELD}Administrador</span>
              <button class="icon-btn del" data-admin-del="${a.id}" type="button" title="Remover acesso" aria-label="Remover acesso de ${esc(a.name)}">${SVG_TRASH}</button>
            </div>`).join('')}
          ${!admins.length ? '<p class="empty-note">Nenhum outro administrador cadastrado.<br>Use o formulário ao lado para liberar o acesso de um irmão(ã) da equipe.</p>' : ''}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="panel">
          <div class="panel-title">${SVG_PLUS} Cadastrar administrador</div>
          <form id="admin-form" novalidate>
            <div class="form-grid admin-form-grid">
              <label class="span-2">Nome completo *
                <input id="admin-name" type="text" maxlength="80" placeholder="Ex.: Ana Beatriz Lima" autocomplete="off">
                <em class="field-err" data-aerr="name"></em>
              </label>
              <label class="span-2">E-mail da conta Google *
                <input id="admin-email" type="email" placeholder="pessoa@gmail.com" autocomplete="off">
                <em class="field-err" data-aerr="email"></em>
              </label>
            </div>
            <button class="btn btn-primary admin-submit" type="submit">${SVG_PLUS} Liberar acesso</button>
          </form>
          <p class="admin-hint">A pessoa entrará pelo botão “Entrar com Google” usando exatamente este e-mail. Contas não cadastradas têm o login bloqueado.</p>
        </div>
        <div class="panel">
          <div class="panel-title">${SVG_LOCK} Níveis de acesso</div>
          <div class="perm-row"><span class="perm-ico role-geral">${SVG_CROWN}</span><div><b>Administrador geral</b><span>${GENERAL_ADMIN.email} — gerencia membros e cadastra ou remove administradores.</span></div></div>
          <div class="perm-row"><span class="perm-ico role-admin">${SVG_SHIELD}</span><div><b>Administrador</b><span>Cadastra e edita membros, unidades, visões e exportações. Não gerencia administradores.</span></div></div>
          <div class="perm-row"><span class="perm-ico role-none">${SVG_LOCK}</span><div><b>Conta não cadastrada</b><span>Login bloqueado, com aviso para solicitar acesso ao administrador geral.</span></div></div>
        </div>
      </div>
    </div>`;
  $('#admin-form').addEventListener('submit', submitAdmin);
}

function submitAdmin(e) {
  e.preventDefault();
  const nameInput = $('#admin-name'), emailInput = $('#admin-email');
  const name = nameInput.value.trim();
  const email = normEmail(emailInput.value);
  const errN = $('[data-aerr="name"]'), errE = $('[data-aerr="email"]');
  errN.classList.remove('show'); errE.classList.remove('show');
  nameInput.classList.remove('invalid'); emailInput.classList.remove('invalid');
  let ok = true;
  if (!name) {
    errN.textContent = 'Informe o nome do administrador.'; errN.classList.add('show');
    nameInput.classList.add('invalid'); ok = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errE.textContent = 'E-mail inválido.'; errE.classList.add('show');
    emailInput.classList.add('invalid'); ok = false;
  } else if (email === GENERAL_ADMIN.email) {
    errE.textContent = 'Esta conta já é a administradora geral.'; errE.classList.add('show');
    emailInput.classList.add('invalid'); ok = false;
  } else if (admins.some(a => a.email === email)) {
    errE.textContent = 'Este e-mail já é administrador.'; errE.classList.add('show');
    emailInput.classList.add('invalid'); ok = false;
  }
  if (!ok) return;
  admins.push({ id: uid(), name, email, addedAt: new Date().toISOString(), addedBy: state.user.name });
  saveAdmins();
  renderAll();
  toast(`Acesso liberado para ${name.split(' ')[0]} (${email}).`);
}

function removeAdmin(id) {
  const a = admins.find(x => x.id === id);
  if (!a) return;
  admins = admins.filter(x => x.id !== id);
  saveAdmins();
  renderAll();
  toast(`Acesso de ${a.name.split(' ')[0]} removido.`, {
    type: 'danger',
    undo: () => {
      admins.push(a);
      saveAdmins();
      renderAll();
      toast(`Acesso de ${a.name.split(' ')[0]} restaurado.`);
    }
  });
}

/* ═════════ Eventos ═════════ */
document.addEventListener('click', e => {
  const t = e.target;

  const nav = t.closest('[data-nav]');
  if (nav) { state.view = nav.dataset.nav; state.selected.clear(); renderAll(); return; }

  const goto = t.closest('[data-goto]');
  if (goto) { state.view = goto.dataset.goto; state.selected.clear(); renderAll(); return; }

  const unitBtn = t.closest('.unit-btn');
  if (unitBtn) { state.unit = unitBtn.dataset.unit; state.selected.clear(); renderAll(); return; }

  const monthBtn = t.closest('[data-month]');
  if (monthBtn) { state.bmonth = +monthBtn.dataset.month; renderBirthdays(); return; }

  const groupSearch = t.closest('[data-group-search]');
  if (groupSearch) {
    state.view = 'members'; state.search = groupSearch.dataset.groupSearch;
    state.status = 'todos'; state.ministry = 'todos'; state.selected.clear();
    renderAll();
    toast(`Mostrando responsáveis por crianças do ${groupSearch.dataset.groupSearch}.`, { type: 'info' });
    return;
  }

  const editBtn = t.closest('[data-edit]');
  if (editBtn) { e.stopPropagation(); openForm(editBtn.dataset.edit); return; }

  const delBtn = t.closest('[data-del]');
  if (delBtn) { e.stopPropagation(); deleteMembers([delBtn.dataset.del]); return; }

  const adminDel = t.closest('[data-admin-del]');
  if (adminDel) { removeAdmin(adminDel.dataset.adminDel); return; }

  const ftab = t.closest('[data-ftab]');
  if (ftab) { setFormTab(ftab.dataset.ftab); return; }

  const yn = t.closest('[data-yn]');
  if (yn) { formHasChildren = yn.dataset.yn === 'sim'; syncChildrenUI(); return; }

  const kidDel = t.closest('[data-kid-del]');
  if (kidDel) {
    formChildren = formChildren.filter(c => c.id !== kidDel.dataset.kidDel);
    renderChildrenRows(); syncChildrenUI(); return;
  }

  const kidsEdit = t.closest('[data-kids-edit]');
  if (kidsEdit) { openForm(kidsEdit.dataset.kidsEdit, 'filhos'); return; }

  const kidPrint = t.closest('[data-kid-print]');
  if (kidPrint) {
    const [mid, kid] = kidPrint.dataset.kidPrint.split('|');
    const m = members.find(x => x.id === mid);
    const k = m && (m.children || []).find(x => x.id === kid);
    if (m && k) printLabels([[m, k]]);
    return;
  }
  const kidsPrint = t.closest('[data-kids-print]');
  if (kidsPrint) {
    const m = members.find(x => x.id === kidsPrint.dataset.kidsPrint);
    if (m) printLabels((m.children || []).map(k => [m, k]));
    return;
  }

  if (t.closest('[data-check]') || t.closest('#check-all')) return; // tratado no change

  const openRow = t.closest('[data-open]');
  if (openRow) { openDrawer(openRow.dataset.open); return; }

  const svApply = t.closest('[data-sv-apply]');
  if (svApply) {
    const v = state.savedViews.find(x => x.id === svApply.dataset.svApply);
    if (v) {
      Object.assign(state, { unit: v.unit, search: v.search, status: v.status, ministry: v.ministry, sort: v.sort });
      state.selected.clear();
      renderAll();
      toast(`Visão “${v.name}” aplicada.`, { type: 'info' });
    }
    return;
  }
  const svDel = t.closest('[data-sv-del]');
  if (svDel) {
    state.savedViews = state.savedViews.filter(x => x.id !== svDel.dataset.svDel);
    store.set('ami.savedViews', state.savedViews);
    renderSavedViewsMenu();
    return;
  }

  const action = t.closest('[data-action]')?.dataset.action;
  if (action === 'new-member') { openForm(); return; }
  if (action === 'add-child') {
    const c = { id: uid(), name: '', birth: '', allergy: '' };
    formChildren.push(c);
    renderChildrenRows(); syncChildrenUI();
    const inp = document.querySelector(`[data-kid-name="${c.id}"]`);
    if (inp) { inp.focus(); inp.closest('.child-row').scrollIntoView({ block: 'nearest' }); }
    return;
  }
  if (action === 'export') { exportExcel(); return; }
  if (action === 'close-drawer') { closeDrawer(); return; }
  if (action === 'bulk-delete') { deleteMembers([...state.selected]); return; }
  if (action === 'bulk-clear') { state.selected.clear(); updateMemberList(); return; }
  if (action === 'clear-search') {
    state.search = ''; $('#member-search').value = '';
    $('.search-box').classList.remove('has-value'); updateMemberList(); return;
  }
  if (action === 'reset-filters') {
    Object.assign(state, { search: '', status: 'todos', ministry: 'todos' });
    renderMembers(); return;
  }
  if (action === 'open-saveview') { $('#savedviews-menu').hidden = true; openSaveViewPop(); return; }

  if (t.closest('#btn-savedviews')) {
    const menu = $('#savedviews-menu');
    menu.hidden = !menu.hidden;
    if (!menu.hidden) renderSavedViewsMenu();
    return;
  }
  if (!t.closest('.savedviews-wrap') && $('#savedviews-menu')) $('#savedviews-menu').hidden = true;
  if (!t.closest('#saveview-pop') && !t.closest('[data-action="open-saveview"]')) $('#saveview-pop').hidden = true;
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'filter-status') { state.status = t.value; state.selected.clear(); updateMemberList(); }
  else if (t.id === 'filter-ministry') { state.ministry = t.value; state.selected.clear(); updateMemberList(); }
  else if (t.id === 'sort-by') { state.sort = t.value; updateMemberList(); }
  else if (t.id === 'check-all') {
    const list = filteredMembers();
    if (t.checked) list.forEach(m => state.selected.add(m.id));
    else state.selected.clear();
    updateMemberList();
  }
  else if (t.dataset.check) {
    if (t.checked) state.selected.add(t.dataset.check);
    else state.selected.delete(t.dataset.check);
    updateMemberList();
  }
  else if (t.id === 'bulk-unit' && t.value) {
    const ids = [...state.selected];
    const dest = t.value;
    members.forEach(m => { if (ids.includes(m.id)) m.unit = dest; });
    saveMembers(); state.selected.clear(); renderAll();
    toast(`${ids.length} membro${ids.length > 1 ? 's' : ''} movido${ids.length > 1 ? 's' : ''} para ${UNITS[dest].label}.`);
  }
  else if (t.id === 'bulk-status' && t.value) {
    const ids = [...state.selected];
    const st = t.value;
    members.forEach(m => { if (ids.includes(m.id)) m.status = st; });
    saveMembers(); state.selected.clear(); renderAll();
    toast(`Status de ${ids.length} membro${ids.length > 1 ? 's' : ''} alterado para “${STATUS[st].label}”.`);
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'member-search') {
    state.search = e.target.value;
    $('.search-box').classList.toggle('has-value', !!state.search);
    updateMemberList();
    return;
  }
  const kn = e.target.closest('[data-kid-name]');
  if (kn) {
    const c = formChildren.find(x => x.id === kn.dataset.kidName);
    if (c) c.name = kn.value;
    kn.classList.remove('invalid');
    const err = document.querySelector(`[data-kerr="${kn.dataset.kidName}"]`);
    if (err) err.classList.remove('show');
    return;
  }
  const kb = e.target.closest('[data-kid-birth]');
  if (kb) {
    const c = formChildren.find(x => x.id === kb.dataset.kidBirth);
    if (c) c.birth = kb.value;
    const chip = document.querySelector(`[data-kid-age="${kb.dataset.kidBirth}"]`);
    if (chip) { chip.textContent = ageLabel(kb.value); chip.hidden = !kb.value; }
    const slot = document.querySelector(`[data-kid-group="${kb.dataset.kidBirth}"]`);
    if (slot) slot.innerHTML = groupChip(kb.value);
    return;
  }
  const ka = e.target.closest('[data-kid-allergy]');
  if (ka) {
    const c = formChildren.find(x => x.id === ka.dataset.kidAllergy);
    if (c) c.allergy = ka.value;
  }
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#saveview-pop').hidden) { $('#saveview-pop').hidden = true; return; }
  if ($('#savedviews-menu') && !$('#savedviews-menu').hidden) { $('#savedviews-menu').hidden = true; return; }
  if (!$('#form-overlay').hidden) { closeForm(); return; }
  if (!$('#drawer').hidden) { closeDrawer(); return; }
  if (!$('#account-picker').hidden) { closePicker(); }
});

/* ligações fixas */
$('#btn-new-top').addEventListener('click', () => openForm());
$('#btn-logout').addEventListener('click', signOut);
$('#form-close').addEventListener('click', closeForm);
$('#form-cancel').addEventListener('click', closeForm);
$('#member-form').addEventListener('submit', submitForm);
$('#form-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeForm(); });
$('#drawer-overlay').addEventListener('click', closeDrawer);
$('#picker-close').addEventListener('click', closePicker);
$('#account-picker').addEventListener('click', e => { if (e.target === e.currentTarget) closePicker(); });
$('#picker-add').addEventListener('click', () => { $('#picker-form').hidden = false; $('#picker-name').focus(); });
$('#picker-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#picker-name').value.trim();
  const email = $('#picker-email').value.trim();
  if (!name || !email) return;
  if (!isAuthorized(email)) {
    const err = $('#picker-error');
    err.textContent = `A conta ${normEmail(email)} não está autorizada. Peça ao administrador geral (${GENERAL_ADMIN.email}) para cadastrá-la como administrador.`;
    err.hidden = false;
    return;
  }
  closePicker();
  signIn({ name, email });
});
$('#saveview-cancel').addEventListener('click', () => { $('#saveview-pop').hidden = true; });
$('#saveview-confirm').addEventListener('click', confirmSaveView);
$('#saveview-name').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); confirmSaveView(); } });

/* ═════════ Início ═════════ */
initAuth();
renderVerse(true);
setInterval(() => renderVerse(false), 60000);
window.addEventListener('focus', () => renderVerse(false));
document.addEventListener('visibilitychange', () => { if (!document.hidden) renderVerse(false); });
const session = store.get('ami.session', null);
if (session && session.email && isAuthorized(session.email)) {
  state.user = session;
  showApp();
} else if (session && session.email) {
  localStorage.removeItem('ami.session');
  showLoginError(`A conta ${normEmail(session.email)} não está mais na lista de administradores. Fale com o administrador geral.`);
}