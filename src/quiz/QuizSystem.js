/**
 * Sistem kuis: membangkitkan soal dari basis data peralatan agar konsisten dengan bahan ajar.
 * Jenis soal: pilihan ganda, mencocokkan alat–fungsi, mencocokkan alat–bahan,
 * identifikasi alat dari model 3D, dan klasifikasi kitchen equipment / kitchen utensils.
 */
import { TYPES } from '../data/equipment.js';

const shuffle = (a) => {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};
const sample = (a, n) => shuffle(a).slice(0, n);
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const stripDot = (s) => s.replace(/\.$/, '');

/** Soal konsep dari bahan ajar (pilihan ganda statis). */
const CONCEPTS = [
  {
    q: 'Peralatan dapur berukuran besar, sulit dipindahkan, dan biasanya beroperasi dengan mesin bertenaga listrik atau gas disebut…',
    options: ['Kitchen equipment', 'Kitchen utensils', 'Hand tools', 'Chinawares'], answer: 0,
    explain: TYPES.equipment.desc,
  },
  {
    q: 'Peralatan dari bahan apa yang aman untuk meletakkan bahan makanan bersifat asam karena tidak menimbulkan reaksi kimia?',
    options: ['Aluminium', 'Kaca', 'Besi', 'Tembaga'], answer: 1,
    explain: 'Peralatan dari kaca aman untuk bahan bersifat asam karena tidak menimbulkan reaksi kimia.',
  },
  {
    q: 'Holding equipment yang terbuat dari kaca dan TIDAK memiliki pengaturan suhu adalah…',
    options: ['Showcase chiller', 'Showcase warmer', 'Display case', 'Upright freezer'], answer: 2,
    explain: 'Display case biasanya terbuat dari kaca tanpa pengaturan suhu sehingga suhunya mengikuti suhu ruang.',
  },
  {
    q: 'Logam yang mudah bereaksi dengan makanan bersifat asam adalah…',
    options: ['Stainless steel', 'Aluminium', 'Kaca', 'Kayu'], answer: 1,
    explain: 'Aluminium berwarna keabu-abuan dan ringan, tetapi mudah bereaksi dengan makanan yang bersifat asam.',
  },
  {
    q: 'Sebelum membersihkan peralatan yang menggunakan listrik atau gas, langkah pertama yang harus dipastikan adalah…',
    options: ['Alat masih menyala agar mudah dibersihkan', 'Tidak ada aliran listrik atau gas yang terhubung', 'Alat direndam di air', 'Alat langsung disimpan'], answer: 1,
    explain: 'Cek dan pastikan tidak ada aliran listrik atau gas yang terhubung dengan alat yang sedang dibersihkan.',
  },
  {
    q: 'Mengapa peralatan harus segera dikeringkan setelah dicuci?',
    options: ['Agar lebih berat', 'Agar tidak muncul bercak-bercak putih dan siap digunakan kembali', 'Agar suhu naik', 'Agar mudah pecah'], answer: 1,
    explain: 'Peralatan yang dibiarkan mengering sendiri terkadang muncul bercak putih; segera keringkan agar siap digunakan kembali.',
  },
  {
    q: 'Perbedaan steam table dan chafing dish terletak pada…',
    options: ['Prinsip pemanasan', 'Ukurannya', 'Bahan bakarnya selalu listrik', 'Warnanya'], answer: 1,
    explain: 'Prinsip pemanasan sama; steam table berukuran lebih besar, chafing dish lebih kecil.',
  },
  {
    q: 'Oven yang memiliki satu elemen pemanas di bawah dan kipas di belakang sehingga udara panas merata adalah…',
    options: ['Salamander', 'Convection oven', 'Microwave oven', 'Combi oven'], answer: 1,
    explain: 'Convection oven memiliki satu elemen pemanas di bawah dengan kipas yang berputar di belakang oven.',
  },
  {
    q: 'Kitchen towel untuk mengelap meja tidak boleh dipakai untuk mengeringkan bahan makanan. Tujuannya adalah…',
    options: ['Menghemat kain', 'Menjaga sanitasi, higiene, dan mencegah kontaminasi silang', 'Agar kain cepat kering', 'Agar warna kain awet'], answer: 1,
    explain: 'Penggunaan kitchen towel ditentukan secara khusus untuk menjaga sanitasi, higiene, dan mencegah kontaminasi silang.',
  },
];

export class QuizSystem {
  constructor(equipment) {
    this.all = equipment;
  }

  pool() { return this.all.filter((e) => e.function); }

  mcqFunction() {
    const [target] = sample(this.pool(), 1);
    const others = sample(this.pool().filter((e) => e.id !== target.id && e.function !== target.function && e.category !== 'linen' || false), 3);
    const opts = shuffle([target, ...others]);
    return {
      type: 'mcq',
      title: 'Pilihan Ganda',
      q: `Alat yang digunakan untuk ${lc(stripDot(target.function))} adalah…`,
      options: opts.map((o) => o.name),
      answer: opts.indexOf(target),
      explainOk: `Jawaban benar. ${target.name} digunakan untuk ${lc(stripDot(target.function))}.`,
      explainNo: `Jawaban belum tepat. Pelajari kembali fungsi alat. Jawaban yang benar: ${target.name}.`,
      ref: target.id,
    };
  }

  mcqCategory() {
    const [target] = sample(this.pool().filter((e) => e.category !== 'linen'), 1);
    const cats = { persiapan: 'Alat persiapan memasak', pengolahan: 'Alat pengolahan makanan (cooking equipment)', holding: 'Holding equipment', serving: 'Serving equipment' };
    const keys = Object.keys(cats);
    return {
      type: 'mcq',
      title: 'Klasifikasi Fungsi',
      q: `Berdasarkan fungsinya, ${target.name} termasuk kelompok…`,
      options: keys.map((k) => cats[k]),
      answer: keys.indexOf(target.category),
      explainOk: `Jawaban benar. ${target.name} termasuk ${cats[target.category].toLowerCase()}.`,
      explainNo: `Jawaban belum tepat. ${target.name} termasuk ${cats[target.category].toLowerCase()}.`,
      ref: target.id,
    };
  }

  concept() {
    const c = sample(CONCEPTS, 1)[0];
    const order = shuffle(c.options.map((o, i) => i));
    return {
      type: 'mcq', title: 'Konsep Bahan Ajar', q: c.q,
      options: order.map((i) => c.options[i]), answer: order.indexOf(c.answer),
      explainOk: `Jawaban benar. ${c.explain}`, explainNo: `Jawaban belum tepat. ${c.explain}`,
    };
  }

  identify() {
    const candidates = this.pool();
    const [target] = sample(candidates, 1);
    // pengecoh dari kategori yang sama agar menantang
    const same = candidates.filter((e) => e.id !== target.id && e.category === target.category);
    const others = sample(same.length >= 3 ? same : candidates.filter((e) => e.id !== target.id), 3);
    const opts = shuffle([target, ...others]);
    return {
      type: 'identify', title: 'Identifikasi 3D', q: 'Alat apakah ini?',
      model: target.id, options: opts.map((o) => o.name), answer: opts.indexOf(target),
      explainOk: `Jawaban benar. Ini adalah ${target.name} — ${lc(stripDot(target.function))}.`,
      explainNo: `Jawaban belum tepat. Ini adalah ${target.name}. Pelajari kembali bentuk dan fungsinya.`,
      ref: target.id,
    };
  }

  matchFunction(n = 4) {
    const items = [];
    const used = new Set();
    for (const e of shuffle(this.pool())) {
      if (items.length >= n) break;
      if (used.has(e.function)) continue;
      used.add(e.function);
      items.push(e);
    }
    return {
      type: 'match', title: 'Cocokkan Alat & Fungsi', q: 'Pasangkan setiap alat dengan fungsinya.',
      left: items.map((e) => ({ id: e.id, text: e.name })),
      right: shuffle(items.map((e) => ({ id: e.id, text: stripDot(e.function) }))),
    };
  }

  matchMaterial(n = 4) {
    const items = [];
    const used = new Set();
    for (const e of shuffle(this.pool())) {
      if (items.length >= n) break;
      const key = e.material[0];
      if (used.has(key)) continue;
      used.add(key);
      items.push(e);
    }
    const names = { logam: 'Logam', kayu: 'Kayu', 'tanah-liat': 'Tanah liat (keramik/gerabah)', kaca: 'Kaca', plastik: 'Plastik', batu: 'Batu', kain: 'Kain' };
    return {
      type: 'match', title: 'Cocokkan Alat & Bahan', q: 'Pasangkan setiap alat dengan bahan pembuat utamanya.',
      left: items.map((e) => ({ id: e.id, text: e.name })),
      right: shuffle(items.map((e) => ({ id: e.id, text: names[e.material[0]] }))),
    };
  }

  classify(n = 8) {
    const eqs = sample(this.pool().filter((e) => e.classifyClear && e.type === 'equipment'), n / 2);
    const uts = sample(this.pool().filter((e) => e.classifyClear && e.type === 'utensil'), n / 2);
    return {
      type: 'classify', title: 'Klasifikasi', q: 'Seret setiap alat ke kelompok yang benar: KITCHEN EQUIPMENT atau KITCHEN UTENSILS.',
      items: shuffle([...eqs, ...uts]).map((e) => ({ id: e.id, text: e.name, answer: e.type })),
    };
  }

  /** Paket kuis lengkap (10 soal campuran). */
  fullQuiz() {
    return [
      this.mcqFunction(), this.identify(), this.concept(), this.matchFunction(), this.mcqFunction(),
      this.identify(), this.mcqCategory(), this.matchMaterial(), this.concept(), this.classify(),
    ];
  }

  identifyRound(n = 8) { return Array.from({ length: n }, () => this.identify()); }
}
