/**
 * Sidebar / menu utama + ringkasan progress.
 */
import { icon, esc } from '../utils/dom.js';

export const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'list', label: 'Peralatan Dapur', icon: 'grid', params: {} },
  { id: 'list', label: 'Kitchen Equipment', icon: 'gear', params: { type: 'equipment' } },
  { id: 'list', label: 'Kitchen Utensils', icon: 'spoon', params: { type: 'utensil' } },
  { id: 'list', label: 'Alat Persiapan', icon: 'knife', params: { cat: 'persiapan' } },
  { id: 'list', label: 'Alat Pengolahan', icon: 'flame', params: { cat: 'pengolahan' } },
  { id: 'list', label: 'Holding Equipment', icon: 'snow', params: { cat: 'holding' } },
  { id: 'list', label: 'Serving Equipment', icon: 'plate', params: { cat: 'serving' } },
  { id: 'materials', label: 'Bahan Pembuat', icon: 'layers' },
  { id: 'simulation', label: 'Simulasi', icon: 'play' },
  { id: 'maintenance', label: 'Perawatan', icon: 'sponge' },
  { id: 'quiz', label: 'Quiz', icon: 'quiz' },
  { id: 'about', label: 'Tentang', icon: 'info' },
];

const sameParams = (a = {}, b = {}) => (a.type || '') === (b.type || '') && (a.cat || '') === (b.cat || '');

export function renderSidebar(app) {
  const nav = document.getElementById('menu');
  const d = app.progress.data;
  const total = app.data.equipment.length;
  nav.innerHTML = '';
  MENU.forEach((m, i) => {
    const active = app.view === m.id && (m.id !== 'list' || sameParams(m.params, app.params));
    const b = document.createElement('button');
    b.className = 'menu-item' + (active ? ' active' : '') + (i === 1 || i === 8 ? ' sep' : '');
    b.innerHTML = `${icon(m.icon)}<span>${esc(m.label)}</span>`;
    b.title = m.label;
    b.onclick = () => app.navigate(m.id, m.params ? { ...m.params, title: m.label } : {});
    nav.appendChild(b);
  });
  const pct = Math.round((d.learned.length / total) * 100);
  document.getElementById('sideProgress').innerHTML = `
    <div class="sp-row"><span>Peralatan dipelajari</span><b>${d.learned.length} / ${total}</b></div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="sp-row"><span>Simulasi selesai</span><b>${d.sims.length}</b></div>
    <div class="sp-row"><span>Quiz</span><b>${d.quizBest}%</b></div>`;
}
