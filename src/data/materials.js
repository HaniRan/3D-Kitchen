/**
 * BAHAN PEMBUAT PERALATAN DAPUR (Bahan Ajar bagian B).
 * Berdasarkan bahan pembuatnya, peralatan dapur terbagi menjadi tujuh jenis:
 * logam, kayu, tanah liat, kaca, plastik, batu, dan kain.
 */
export const materialsData = [
  {
    id: 'logam', name: 'Logam', icon: '⚙️', swatch: 'steel', sample: ['stock-pot', 'frying-pan'],
    characteristics: 'Bahan yang umum digunakan untuk membuat peralatan dapur karena padat dan tahan panas. Jenisnya antara lain tembaga, besi, aluminium, dan baja tahan karat (stainless steel).',
    subtypes: [
      { name: 'Tembaga', note: 'Penghantar panas yang baik, tetapi harganya relatif mahal dan perlu perawatan khusus. Saat ini sudah jarang digunakan untuk memasak.', swatch: 'copper' },
      { name: 'Besi', note: 'Mendistribusikan panas dengan baik, tetapi mudah berkarat jika tidak dirawat dengan baik.', swatch: 'castIron' },
      { name: 'Aluminium', note: 'Berwarna keabu-abuan dan ringan; mudah bereaksi dengan makanan yang bersifat asam.', swatch: 'aluminium' },
      { name: 'Baja tahan karat (stainless steel)', note: 'Banyak digunakan di dapur industri. Tidak sebaik besi dalam menghantarkan panas; umum untuk memasak makanan bersuhu lebih rendah atau sebagai bahan holding equipment (Gisslen, 2011).', swatch: 'steel' },
    ],
    pros: ['Padat dan kuat', 'Tahan panas', 'Penghantar panas yang baik (tembaga, besi)', 'Stainless steel tahan karat dan higienis'],
    cons: ['Tembaga mahal & perlu perawatan khusus', 'Besi mudah berkarat', 'Aluminium bereaksi dengan makanan asam'],
    care: ['Cuci sesuai jenis logamnya', 'Segera keringkan agar tidak berkarat/bercak putih', 'Oles minyak tipis pada besi cor', 'Simpan di tempat kering'],
  },
  {
    id: 'kayu', name: 'Kayu', icon: '🪵', swatch: 'wood', sample: ['cutting-board', 'rolling-pin'],
    characteristics: 'Peralatan dari kayu telah lama digunakan, sebelum manusia menggunakan logam, tanah liat, kaca, dan plastik. Termasuk kategori ini: bambu, tempurung kelapa, lidi, dan batang tanaman lainnya. Kayu yang digunakan umumnya kayu keras.',
    pros: ['Tidak menggores peralatan lain', 'Tidak menghantarkan panas ke tangan', 'Alami dan tradisional'],
    cons: ['Menyerap air dan bau', 'Dapat berjamur jika lembap', 'Dapat retak'],
    examples: 'Alas mengiris (cutting board), cetakan kue, rolling pin, piring, mangkuk, dan sendok.',
    care: ['Jangan direndam terlalu lama', 'Langsung keringkan setelah dicuci', 'Simpan di tempat berventilasi'],
  },
  {
    id: 'tanah-liat', name: 'Tanah Liat', icon: '🏺', swatch: 'clay', sample: ['clay-pot', 'dinner-plate'],
    characteristics: 'Peralatan dari tanah liat sudah dikenal sejak zaman praaksara dan lebih dikenal dengan istilah gerabah. Penggunaannya saat ini lebih bertujuan menimbulkan kesan tradisional dari makanan yang disajikan. Keramik/porselen (chinawares) juga dibuat dari tanah liat yang dibakar.',
    pros: ['Memberi kesan tradisional', 'Menahan panas lebih lama', 'Keramik tampak bersih dan elegan untuk penyajian'],
    cons: ['Berat', 'Mudah pecah', 'Jarang digunakan untuk pengolahan'],
    examples: 'Gerabah (periuk, kendi), piring dan cangkir keramik/porselen.',
    care: ['Cuci dengan spons lembut', 'Keringkan sebelum disimpan', 'Hindari perubahan suhu mendadak', 'Pisahkan yang retak/gompal'],
  },
  {
    id: 'kaca', name: 'Kaca', icon: '🥂', swatch: 'glass', sample: ['wine-glass', 'water-pitcher'],
    characteristics: 'Peralatan dari kaca pada umumnya digunakan untuk menyajikan makanan, bukan untuk mengolah makanan. Aman untuk bahan makanan bersifat asam karena tidak menimbulkan reaksi kimia.',
    pros: ['Tidak bereaksi dengan makanan asam', 'Bening sehingga isi terlihat menarik', 'Mudah dibersihkan'],
    cons: ['Mudah pecah', 'Jika pecah dapat melukai tubuh'],
    examples: 'Glasswares (goblet, wine glass, juice glass, high ball glass, water pitcher), pintu oven, etalase.',
    care: ['Cuci dan tangani dengan hati-hati', 'Poles dengan dish towel putih', 'Simpan terbalik di rak gelas'],
  },
  {
    id: 'plastik', name: 'Plastik', icon: '🧴', swatch: 'plastic', sample: ['measuring-cup', 'blender'],
    characteristics: 'Saat ini plastik sangat luas digunakan sebagai peralatan dapur. Plastik relatif ringan, awet, dan mudah dibersihkan, tetapi akan meleleh jika terkena panas berlebih.',
    pros: ['Ringan', 'Awet', 'Mudah dibersihkan', 'Harga terjangkau'],
    cons: ['Meleleh jika terkena panas berlebih', 'Dapat tergores dan menyimpan noda'],
    examples: 'Sendok takar, gelas ukur, cetakan kue, piring, mangkuk, tabung blender.',
    care: ['Jauhkan dari api/panas berlebih', 'Cuci dengan spons lembut', 'Keringkan sebelum disimpan'],
  },
  {
    id: 'batu', name: 'Batu', icon: '🪨', swatch: 'stone', sample: ['cobek'],
    characteristics: 'Peralatan dari batu saat ini sangat jarang digunakan karena berat. Alat berbahan batu yang masih bertahan adalah cobek dan munthu, biasanya di restoran yang menyediakan sambal untuk masakan Indonesia. Digunakan secara tradisional untuk menghaluskan bahan makanan.',
    pros: ['Sangat kuat dan awet', 'Menghasilkan tekstur dan aroma bumbu khas'],
    cons: ['Sangat berat', 'Permukaan berpori sulit dibersihkan'],
    examples: 'Cobek dan munthu (ulekan).',
    care: ['Sikat dengan air tanpa sabun berlebihan', 'Angin-anginkan hingga kering', 'Simpan di tempat kering'],
  },
  {
    id: 'kain', name: 'Kain', icon: '🧤', swatch: 'fabric', sample: ['apron', 'oven-mitt'],
    characteristics: 'Kelompok peralatan yang tidak dapat diabaikan perannya. Beberapa jenis peralatan berbahan kain (linen) antara lain apron, kitchen towel, dish towel, dan oven mitt.',
    pros: ['Menyerap cairan', 'Melindungi dari cipratan dan panas', 'Dapat dicuci ulang'],
    cons: ['Dapat menjadi sumber kontaminasi silang jika tidak dipisahkan penggunaannya', 'Menghantarkan panas jika basah'],
    examples: 'Apron, kitchen towel, dish towel, oven mitt.',
    care: ['Cuci terpisah sesuai penggunaan', 'Jemur hingga kering', 'Ganti bila sobek/menipis'],
  },
];

/** Daftar contoh alat per bahan (dihitung dari basis data peralatan). */
export function examplesFor(materialId, equipment) {
  return equipment.filter((e) => e.material.includes(materialId));
}

/** Langkah perawatan umum (Bahan Ajar: Tindakan agar alat dapur terawat dengan baik). */
export const careSteps = [
  { id: 'clean', title: 'Bersihkan dengan Tepat', text: 'Perhatikan jenis alat dan bahan pembuatnya. Pastikan tidak ada aliran listrik atau gas yang terhubung dengan alat yang sedang dibersihkan.' },
  { id: 'dry', title: 'Segera Dikeringkan', text: 'Keringkan alat setelah dicuci agar siap digunakan kembali dan tidak muncul bercak-bercak putih.' },
  { id: 'inspect', title: 'Periksa & Perbaiki Kerusakan Kecil', text: 'Gagang patah, pisau tumpul, dan lainnya segera diperbaiki sebelum menimbulkan kecelakaan kerja atau rusak lebih parah. Ganti bila perlu.' },
  { id: 'store', title: 'Simpan Alat pada Tempatnya', text: 'Tata pada tempat yang telah disediakan; jangan berantakan dan tercampur jenisnya.' },
  { id: 'special', title: 'Perlakuan Khusus', text: 'Contoh: jangan mencungkil bahan beku di freezer dengan benda tajam, langsung keringkan alat dari kayu, bersihkan chiller & freezer secara berkala.' },
];

/** Jenis-jenis dapur (kitchen section) dari bahan ajar. */
export const kitchenSections = [
  ['Main Kitchen / Hot Kitchen', 'Dapur utama untuk mengolah sup, makanan utama, dan saus; area lebih panas karena banyak peralatan pemanas.'],
  ['Garde Manger', 'Dapur dingin untuk menyiapkan salad, saus dingin, dan makanan pembuka.'],
  ['Entremetier Section', 'Dapur pengolah makanan pendamping hidangan utama: kentang, pasta, sayuran.'],
  ['Butcher', 'Pengadaan dan pemotongan daging serta seafood sesuai kebutuhan.'],
  ['Pastry', 'Mengolah dan menyediakan berbagai jenis kue, kontinental maupun tradisional Indonesia.'],
  ['Bakery', 'Menyiapkan produk roti: roti tawar, roti manis, French bread.'],
  ['Banquet Section', 'Mengolah makanan dalam jumlah banyak untuk perjamuan.'],
  ['Roast Section', 'Mengolah makanan dipanggang (roasting) maupun dibakar (grilling).'],
];
