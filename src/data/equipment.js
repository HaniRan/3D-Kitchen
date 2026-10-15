/**
 * BASIS DATA PERALATAN DAPUR
 * Sumber materi: Bahan Ajar Peralatan Dapur (Kitchen Equipment & Utensils, bahan pembuat,
 * pengoperasian, dan perawatan). Data dipisahkan dari kode rendering agar mudah ditambah.
 *
 * Struktur satu alat:
 * {
 *   id, name, nameId, category, type ('equipment' | 'utensil'), subcategory,
 *   material: ['logam','kayu','tanah-liat','kaca','plastik','batu','kain'], materialText,
 *   function, description, operation[], maintenance[], safety[],
 *   safetyLevel ('safe'|'warning'|'danger'), power ('listrik'|'gas'|null), hot, sharp,
 *   modelType, sim, useAnim
 * }
 */

export const CATEGORIES = {
  persiapan: { label: 'Alat Persiapan Memasak', short: 'Persiapan', icon: '🔪', desc: 'Digunakan untuk menyiapkan bahan makanan sehingga siap dimasak: memotong, mengupas, menghaluskan, menimbang, mencampur, dan lainnya.' },
  pengolahan: { label: 'Alat Pengolahan Makanan (Cooking Equipment)', short: 'Pengolahan', icon: '🔥', desc: 'Alat yang mengeluarkan panas atau digunakan dalam proses mengolah bahan mentah sehingga menjadi matang.' },
  holding: { label: 'Holding Equipment', short: 'Holding', icon: '🧊', desc: 'Menyimpan makanan sebelum disajikan dan menjaga suhunya: makanan panas tetap panas, makanan dingin tetap dingin.' },
  serving: { label: 'Serving Equipment', short: 'Serving', icon: '🍽️', desc: 'Alat penyajian makanan dan minuman: chinawares, silverwares, dan glasswares.' },
  linen: { label: 'Peralatan Berbahan Kain (Linen)', short: 'Linen', icon: '🧤', desc: 'Peralatan dari kain seperti apron, kitchen towel, dish towel, dan oven mitt.' },
};

export const TYPES = {
  equipment: { label: 'Kitchen Equipment', desc: 'Peralatan berukuran besar, sulit dipindahkan, dan biasanya beroperasi menggunakan mesin dengan tenaga listrik atau gas.' },
  utensil: { label: 'Kitchen Utensils', desc: 'Peralatan kecil, mudah dipindahkan, dan pada umumnya tidak menggunakan mesin untuk mengoperasikannya.' },
};

/* ---------- langkah perawatan baku (Bahan Ajar: Perawatan Peralatan Dapur) ---------- */
const CARE = {
  electric: [
    'Pastikan mesin mati dan steker sudah dicabut — tidak ada aliran listrik yang terhubung sebelum dibersihkan.',
    'Lepas bagian yang dapat dilepas, cuci dengan air hangat dan sabun; bagian motor cukup dilap kain lembap (jangan direndam).',
    'Segera keringkan semua bagian dengan lap bersih agar tidak muncul bercak putih atau karat.',
    'Periksa kabel, steker, dan bagian tajam; segera perbaiki kerusakan kecil atau ganti bila perlu.',
    'Pasang kembali dan simpan pada tempatnya dalam keadaan kering.',
  ],
  gas: [
    'Pastikan semua kenop dalam posisi OFF dan katup/regulator gas sudah ditutup sebelum dibersihkan.',
    'Tunggu sampai alat dingin, lalu angkat grate/burner dan bersihkan sisa makanan serta lemak.',
    'Keringkan semua bagian dan pastikan lubang api (port burner) tidak tersumbat.',
    'Periksa selang, regulator, dan kenop; laporkan kebocoran atau kerusakan untuk segera diperbaiki.',
    'Pasang kembali bagian-bagian pada posisinya.',
  ],
  holding: [
    'Matikan aliran listrik/cabut steker sebelum membersihkan bagian dalam.',
    'Keluarkan isi, bersihkan rak dan dinding dalam dengan air hangat dan sabun lembut — jangan mencungkil bunga es dengan benda tajam.',
    'Keringkan rak dan dinding dalam, lalu bersihkan karet pintu (gasket).',
    'Periksa suhu, karet pintu, dan lampu; perbaiki atau laporkan kerusakan.',
    'Kembalikan rak dan bahan makanan pada tempatnya; bersihkan secara berkala agar tidak menimbulkan aroma tidak sedap.',
  ],
  knife: [
    'Cuci pisau satu per satu dengan sabun dan air hangat; jangan merendam pisau di bak cuci.',
    'Keringkan segera dari arah punggung pisau, bukan dari arah mata pisau.',
    'Periksa ketajaman dan gagang; asah pisau yang tumpul dan perbaiki gagang yang longgar.',
    'Simpan pada rak/magnet pisau atau sarung pisau, terpisah dari alat lain.',
  ],
  steel: [
    'Cuci dengan air hangat dan sabun menggunakan spons lembut sesuai bahan alat.',
    'Bilas hingga bersih lalu segera keringkan agar tidak muncul bercak putih.',
    'Periksa kerusakan kecil (gagang longgar, penyok, berkarat) dan segera perbaiki atau ganti.',
    'Simpan pada tempatnya; jangan dicampur dengan alat jenis lain.',
  ],
  wood: [
    'Cuci dengan air dan sabun, jangan direndam terlalu lama.',
    'Langsung keringkan alat dari kayu setelah dicuci, lalu angin-anginkan.',
    'Periksa retakan atau jamur; ampelas atau ganti bila perlu.',
    'Simpan di tempat kering dan berventilasi.',
  ],
  ceramic: [
    'Cuci dengan sabun dan spons lembut, bilas bersih.',
    'Keringkan dengan dish towel putih yang bersih.',
    'Periksa retak atau gompal; alat yang gompal tidak boleh digunakan untuk menyajikan.',
    'Susun pada rak penyimpanan sesuai jenis dan ukuran.',
  ],
  glass: [
    'Cuci dengan hati-hati menggunakan sabun dan air hangat; hindari benturan.',
    'Keringkan dan poles dengan dish towel putih hingga bening tanpa noda.',
    'Periksa retak atau gompal; singkirkan gelas yang rusak karena dapat melukai.',
    'Simpan terbalik di rak gelas sesuai jenisnya.',
  ],
  silver: [
    'Cuci dengan sabun dan air hangat, hindari sabut kasar.',
    'Keringkan dan poles dengan dish towel putih agar tidak bernoda.',
    'Periksa bengkok atau gerigi rusak; pisahkan yang rusak.',
    'Simpan dalam wadah sesuai jenis (garpu, pisau, sendok).',
  ],
  fabric: [
    'Cuci kain secara terpisah sesuai penggunaannya (mis. lap meja tidak dicampur dengan lap peralatan).',
    'Jemur hingga benar-benar kering.',
    'Periksa sobekan atau bagian yang menipis; perbaiki atau ganti.',
    'Lipat dan simpan di tempat bersih dan kering.',
  ],
  stone: [
    'Bersihkan dengan air dan sikat, tanpa sabun berlebihan agar tidak meresap.',
    'Keringkan dengan diangin-anginkan.',
    'Periksa retakan atau gompal.',
    'Simpan di tempat kering karena alat batu berat.',
  ],
};

const SAFE_ELECTRIC = 'Pastikan tangan kering; jangan memegang steker atau mengoperasikan alat listrik dengan tangan basah.';
const SAFE_UNPLUG = 'Pastikan tidak ada aliran listrik yang terhubung sebelum membersihkan atau membongkar peralatan.';
const SAFE_HOT = 'Permukaan panas — gunakan oven mitt atau kain pelindung yang sesuai.';
const SAFE_GAS = 'Periksa kebocoran gas sebelum menyalakan; tutup katup gas setelah selesai.';
const SAFE_SHARP = 'Benda tajam — pegang pada gagang, arahkan mata pisau menjauhi tubuh, dan jangan meletakkan di bak cuci.';
const SAFE_GLASS = 'Mudah pecah — jika pecah dapat melukai tubuh. Tangani dengan hati-hati.';

function item(o) {
  return {
    material: [],
    operation: [],
    maintenance: [],
    safety: [],
    safetyLevel: 'safe',
    power: null,
    hot: false,
    sharp: false,
    sim: null,
    useAnim: null,
    classifyClear: true,
    ...o,
    modelType: o.modelType || o.id,
  };
}

/* =========================================================================
 * KATEGORI 1 — ALAT PERSIAPAN MEMASAK
 * ======================================================================= */
const persiapan = [
  item({
    id: 'meat-slicer', name: 'Meat Slicer', nameId: 'Pengiris Daging', category: 'persiapan', type: 'equipment', subcategory: 'Kitchen Equipment',
    material: ['logam', 'plastik'], materialText: 'Badan aluminium cor, pisau bundar baja tahan karat, tombol plastik',
    function: 'Mengiris daging dengan ketebalan sesuai kebutuhan.',
    description: 'Meat slicer merupakan alat yang digunakan untuk mengiris daging. Alat ini dapat mengiris daging dengan ketebalan sesuai kebutuhan. Pada umumnya meat slicer menggunakan tenaga listrik. Daging yang diiris menggunakan mesin ini harus agak beku sehingga mendapatkan hasil sempurna.',
    operation: ['Pastikan meat slicer bersih, stabil, dan kenop ketebalan di posisi nol.', 'Letakkan daging yang agak beku di atas kereta (carriage) lalu jepit dengan pendorong.', 'Atur ketebalan irisan dengan kenop pengatur ketebalan.', 'Hubungkan ke sumber listrik dan tekan tombol ON.', 'Dorong kereta maju-mundur secara perlahan dengan memegang gagang.', 'Tekan OFF, kembalikan ketebalan ke nol, lalu cabut steker.'],
    maintenance: CARE.electric, safety: ['Jangan menyentuh pisau bundar ketika mesin terhubung listrik.', 'Selalu gunakan pendorong daging, jangan mendorong dengan tangan langsung.', 'Kembalikan pengatur ketebalan ke nol setelah digunakan agar mata pisau tertutup.', SAFE_UNPLUG],
    safetyLevel: 'danger', power: 'listrik', sharp: true, sim: 'meat-slicer',
  }),
  item({
    id: 'blender', name: 'Blender', nameId: 'Blender', category: 'persiapan', type: 'equipment', subcategory: 'Kitchen Equipment',
    material: ['plastik', 'kaca', 'logam'], materialText: 'Tabung plastik/kaca, pisau & poros logam, badan motor plastik/logam',
    function: 'Menghaluskan dan mencampurkan bahan makanan.',
    description: 'Blender merupakan alat untuk menghaluskan dan mencampurkan bahan makanan. Bagian tabung blender yang berukuran besar efektif digunakan untuk menghaluskan bahan makanan cair atau semi cair. Bagian tabung blender kecil digunakan untuk menghaluskan bahan makanan kering atau bumbu yang berjumlah sedikit. Alat ini menggunakan tenaga listrik untuk beroperasi.',
    operation: ['Pastikan blender dalam kondisi aman dan bersih.', 'Masukkan bahan ke dalam tabung (jangan melebihi batas maksimal).', 'Tutup wadah blender dengan rapat.', 'Hubungkan sumber listrik.', 'Tekan tombol ON.', 'Atur kecepatan sesuai kebutuhan.', 'Matikan blender setelah selesai, lalu cabut steker.'],
    maintenance: CARE.electric, safety: ['Jangan menyentuh bagian pisau ketika mesin terhubung listrik.', 'Jangan membuka tutup saat pisau masih berputar.', SAFE_ELECTRIC, SAFE_UNPLUG],
    safetyLevel: 'warning', power: 'listrik', sharp: true, sim: 'blender',
  }),
  item({
    id: 'scale', name: 'Timbangan (Scales)', nameId: 'Timbangan Digital', category: 'persiapan', type: 'equipment', subcategory: 'Kitchen Equipment',
    material: ['plastik', 'logam'], materialText: 'Badan plastik, piringan timbang stainless steel, sensor elektronik',
    function: 'Mengukur berat bahan makanan yang akan diolah.',
    description: 'Timbangan digunakan untuk mengukur berat bahan makanan yang akan diolah. Pada umumnya timbangan yang digunakan di dapur terdiri atas dua jenis, yaitu timbangan manual dan timbangan digital. Timbangan memiliki kapasitas tertentu, misalnya 500 gram dan 1000 gram. Dalam menggunakan timbangan terutama timbangan digital, perhatikan satuannya (gram atau pound) karena kesalahan satuan berakibat fatal.',
    operation: ['Letakkan timbangan pada permukaan yang datar dan stabil.', 'Tekan tombol ON dan tunggu layar menunjukkan angka 0.', 'Periksa satuan (g atau lb) dengan tombol UNIT.', 'Letakkan wadah lalu tekan TARE agar berat wadah tidak terhitung.', 'Masukkan bahan sampai berat yang diinginkan.', 'Catat hasil, angkat bahan, lalu matikan timbangan.'],
    maintenance: ['Matikan timbangan sebelum dibersihkan.', 'Lap piringan dan badan dengan kain lembap, jangan disiram air.', 'Keringkan dengan lap bersih.', 'Periksa baterai dan ketepatan timbangan secara berkala.', 'Simpan tanpa beban di atasnya.'],
    safety: ['Jangan melebihi kapasitas maksimal timbangan.', 'Perhatikan satuan yang tertera; salah satuan dapat merusak resep.'],
    safetyLevel: 'safe', power: 'listrik', sim: 'scale',
  }),
  item({
    id: 'hand-mixer', name: 'Hand Mixer', nameId: 'Mixer Tangan', category: 'persiapan', type: 'equipment', subcategory: 'Kitchen Equipment',
    material: ['plastik', 'logam'], materialText: 'Badan plastik, pengocok (beater) baja tahan karat',
    function: 'Mencampur dan mengocok bahan (adonan cake, krim, telur) dalam jumlah kecil.',
    description: 'Hand mixer bentuknya kecil dan ringan, tidak memiliki penyangga sehingga dipegang dengan tangan ketika mengoperasikannya. Mixer merupakan kitchen equipment yang digunakan untuk mencampur berbagai jenis bahan makanan sehingga menjadi satu kesatuan.',
    operation: ['Pasang kedua pengocok (beater) hingga terkunci.', 'Masukkan bahan ke dalam mangkuk.', 'Hubungkan steker ke sumber listrik.', 'Celupkan pengocok ke dalam adonan, lalu nyalakan pada kecepatan rendah.', 'Naikkan kecepatan secara bertahap sesuai kebutuhan.', 'Matikan, angkat mixer, cabut steker, lalu lepas pengocok.'],
    maintenance: CARE.electric, safety: ['Jangan memasukkan tangan atau spatula ke mangkuk saat beater berputar.', 'Lepas beater hanya setelah steker dicabut.', SAFE_ELECTRIC],
    safetyLevel: 'warning', power: 'listrik', sim: 'hand-mixer',
  }),
  item({
    id: 'planetary-mixer', name: 'Planetary Mixer', nameId: 'Mixer Planetari', category: 'persiapan', type: 'equipment', subcategory: 'Kitchen Equipment',
    material: ['logam'], materialText: 'Badan besi/logam dicat, mangkuk & pengaduk stainless/aluminium',
    function: 'Mencampur adonan padat maupun cair (alat pencampur serbaguna).',
    description: 'Planetary mixer merupakan alat pencampur serbaguna yang digunakan untuk mencampur adonan, baik adonan padat maupun cair. Mixer ini diberi istilah planetary karena dalam penggunaannya pengaduk berputar di mangkuk adonan, seperti orbit planet.',
    operation: ['Turunkan mangkuk, pasang pengaduk yang sesuai (flat beater, whisk, atau dough hook).', 'Masukkan bahan ke dalam mangkuk.', 'Naikkan mangkuk ke posisi kerja dengan tuas pengangkat.', 'Hubungkan ke listrik dan pilih kecepatan rendah.', 'Tekan START, naikkan kecepatan secara bertahap.', 'Tekan STOP, turunkan mangkuk, lalu angkat adonan.'],
    maintenance: CARE.electric, safety: ['Ganti kecepatan hanya saat mesin berhenti.', 'Jangan memasukkan tangan ke mangkuk ketika mesin bekerja.', SAFE_UNPLUG],
    safetyLevel: 'warning', power: 'listrik', sim: 'planetary-mixer',
  }),
  item({
    id: 'spiral-mixer', name: 'Spiral Mixer', nameId: 'Mixer Spiral', category: 'persiapan', type: 'equipment', subcategory: 'Kitchen Equipment',
    material: ['logam'], materialText: 'Rangka baja dicat, mangkuk & pengait spiral stainless steel',
    function: 'Mengaduk adonan padat (misalnya adonan roti).',
    description: 'Spiral mixer yaitu mixer yang dibuat khusus untuk mengaduk adonan padat. Saat elemen pengaduknya berputar, mangkuk adonan pada spiral mixer ikut berputar.',
    operation: ['Buka penutup pengaman (guard).', 'Masukkan bahan adonan ke mangkuk sesuai kapasitas.', 'Tutup penutup pengaman.', 'Hubungkan listrik, pilih kecepatan 1 untuk mencampur.', 'Tekan START; pindah ke kecepatan 2 untuk mengembangkan gluten.', 'Tekan STOP, buka penutup, lalu angkat adonan.'],
    maintenance: CARE.electric, safety: ['Mesin hanya bekerja jika penutup pengaman tertutup — jangan memaksa membuka saat berputar.', 'Gunakan tombol darurat (emergency stop) bila terjadi masalah.', SAFE_UNPLUG],
    safetyLevel: 'warning', power: 'listrik', sim: 'spiral-mixer',
  }),
  item({
    id: 'peeler', name: 'Peeler', nameId: 'Pengupas Sayur', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Bilah baja tahan karat, gagang plastik/karet',
    function: 'Untuk mengupas sayur dan bawang.',
    description: 'Peeler atau pengupas sayur digunakan untuk mengupas kulit sayuran dan bawang secara tipis dan merata.',
    operation: ['Pegang sayuran dengan tangan kiri dan peeler dengan tangan kanan.', 'Tempelkan bilah pada kulit sayuran.', 'Tarik peeler menjauhi tubuh dengan tekanan ringan.', 'Putar sayuran dan ulangi hingga seluruh kulit terkupas.'],
    maintenance: CARE.steel, safety: ['Arahkan gerakan mengupas menjauhi tubuh dan jari.'], safetyLevel: 'warning', sharp: true, sim: 'utensil', useAnim: 'peel',
  }),
  item({
    id: 'vegetable-knife', name: 'Vegetable Knife', nameId: 'Pisau Kecil', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Bilah baja tahan karat, gagang plastik/POM dengan paku keling',
    function: 'Untuk mengupas sayuran.',
    description: 'Vegetable knife (pisau kecil) digunakan untuk mengupas dan memotong kecil sayuran. Seperti pisau lain, memiliki bagian ujung, mata pisau, punggung, bolster, gagang, dan paku keling.',
    operation: ['Pegang gagang dengan mantap.', 'Kupas atau potong sayuran di atas talenan dengan gerakan terkontrol.', 'Letakkan pisau di sisi talenan dengan mata pisau menghadap ke dalam.'],
    maintenance: CARE.knife, safety: [SAFE_SHARP], safetyLevel: 'warning', sharp: true, sim: 'utensil', useAnim: 'chop',
  }),
  item({
    id: 'chopping-knife', name: 'Chopping Knife', nameId: 'Pisau Cincang (Chef Knife)', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Bilah baja tahan karat, gagang plastik/kayu dengan paku keling',
    function: 'Pisau untuk mencincang sayur, bumbu, dan daging.',
    description: 'Chopping knife digunakan untuk mencincang sayur, bumbu, dan daging. Bagian-bagian pisau: ujung (tip), mata pisau (edge), punggung (spine), tumit (heel), bolster, gagang (handle), dan paku keling (rivet).',
    operation: ['Letakkan bahan di atas talenan yang stabil (beri lap basah di bawahnya).', 'Pegang gagang dan jepit bilah dekat bolster.', 'Tekuk jari tangan kiri (claw grip) untuk menahan bahan.', 'Cincang dengan gerakan mengayun dari ujung ke tumit pisau.'],
    maintenance: CARE.knife, safety: [SAFE_SHARP, 'Gunakan talenan, jangan memotong di atas permukaan logam/kaca.'], safetyLevel: 'warning', sharp: true, sim: 'utensil', useAnim: 'chop',
  }),
  item({
    id: 'filleting-knife', name: 'Filleting Knife', nameId: 'Pisau Fillet', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Bilah baja tipis & lentur, gagang plastik',
    function: 'Pisau untuk memotong daging, memisahkan daging dan tulang.',
    description: 'Filleting knife memiliki bilah tipis, sempit, dan lentur sehingga mudah mengikuti bentuk tulang saat memisahkan daging (misalnya fillet ikan).',
    operation: ['Letakkan ikan/daging di atas talenan.', 'Sayat mulai dari belakang kepala mengikuti tulang.', 'Gerakkan bilah lentur sejajar tulang untuk memisahkan daging.'],
    maintenance: CARE.knife, safety: [SAFE_SHARP], safetyLevel: 'warning', sharp: true, sim: 'utensil', useAnim: 'slice',
  }),
  item({
    id: 'boning-knife', name: 'Boning Knife', nameId: 'Pisau Pemisah Tulang', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Bilah baja sempit & kaku, gagang plastik',
    function: 'Pisau pemisah tulang daging.',
    description: 'Boning knife memiliki bilah sempit dengan ujung runcing untuk memisahkan daging dari tulang dengan sisa daging seminimal mungkin.',
    operation: ['Letakkan daging di atas talenan.', 'Tusukkan ujung pisau di sepanjang tulang.', 'Sayat pendek-pendek sambil menarik daging dari tulang.'],
    maintenance: CARE.knife, safety: [SAFE_SHARP], safetyLevel: 'warning', sharp: true, sim: 'utensil', useAnim: 'slice',
  }),
  item({
    id: 'bread-knife', name: 'Bread Knife / Slicing Knife', nameId: 'Pisau Roti', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Bilah baja bergerigi (serrated), gagang plastik',
    function: 'Pisau untuk memotong roti, sandwich, mengiris daging matang seperti roast dan ham.',
    description: 'Bread knife memiliki mata pisau bergerigi sehingga dapat memotong roti tanpa menekan/merusak teksturnya, juga untuk sandwich dan daging matang.',
    operation: ['Letakkan roti di atas talenan.', 'Tahan roti dengan tangan kiri, jari menjauhi jalur pisau.', 'Potong dengan gerakan menggergaji maju-mundur tanpa menekan.'],
    maintenance: CARE.knife, safety: [SAFE_SHARP], safetyLevel: 'warning', sharp: true, sim: 'utensil', useAnim: 'saw',
  }),
  item({
    id: 'cleaver', name: 'Cleaver', nameId: 'Pisau Besar (Golok Dapur)', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'kayu'], materialText: 'Bilah baja tebal, gagang kayu dengan paku keling',
    function: 'Untuk memotong tulang dan mencincang daging.',
    description: 'Cleaver adalah pisau besar dan berat dengan bilah persegi tebal, digunakan untuk memotong tulang dan mencincang daging.',
    operation: ['Letakkan daging/tulang di talenan kayu yang tebal.', 'Pegang gagang dengan kuat.', 'Ayunkan cleaver tegak lurus dengan tenaga dari pergelangan dan lengan.'],
    maintenance: CARE.knife, safety: [SAFE_SHARP, 'Pastikan area sekitar kosong sebelum mengayunkan cleaver.'], safetyLevel: 'danger', sharp: true, sim: 'utensil', useAnim: 'chop',
  }),
  item({
    id: 'sharpener', name: 'Sharpener', nameId: 'Pengasah Pisau', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Batang baja beralur (honing steel), gagang plastik',
    function: 'Alat untuk mengasah pisau.',
    description: 'Sharpener (honing steel) digunakan untuk meluruskan dan mengasah mata pisau agar tetap tajam.',
    operation: ['Pegang sharpener tegak dengan ujung di atas talenan.', 'Tempelkan tumit pisau pada pangkal batang dengan sudut ±20°.', 'Tarik pisau ke bawah sambil menggeser hingga ujung pisau, bergantian kiri-kanan.'],
    maintenance: CARE.steel, safety: ['Jaga jari di belakang pelindung (guard).', SAFE_SHARP], safetyLevel: 'warning', sim: 'utensil', useAnim: 'sharpen',
  }),
  item({
    id: 'carving-fork', name: 'Carving Fork', nameId: 'Garpu Daging', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Mata garpu baja tahan karat, gagang plastik',
    function: 'Alat untuk membalikkan daging pada waktu dipanggang, memegang daging panas yang sedang dipotong.',
    description: 'Carving fork adalah garpu bermata dua yang panjang untuk menahan dan membalik daging panas.',
    operation: ['Tusukkan garpu pada daging untuk menahannya.', 'Iris daging dengan pisau di sisi lain.', 'Gunakan untuk membalik daging saat dipanggang.'],
    maintenance: CARE.steel, safety: ['Ujung garpu runcing — arahkan menjauhi tubuh.'], safetyLevel: 'warning', sharp: true, sim: 'utensil', useAnim: 'fork',
  }),
  item({
    id: 'grater', name: 'Grater', nameId: 'Parutan', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Memotong',
    material: ['logam', 'plastik'], materialText: 'Pelat baja tahan karat berlubang, gagang plastik',
    function: 'Alat untuk memarut kelapa, sayuran, dan keju.',
    description: 'Grater (parutan) kotak memiliki empat sisi: lubang kasar, sedang, halus, dan celah pengiris.',
    operation: ['Letakkan parutan di atas talenan/wadah, pegang gagang atas.', 'Pilih sisi sesuai hasil yang diinginkan.', 'Gosokkan bahan dari atas ke bawah dengan tekanan sedang.', 'Hentikan sebelum bahan terlalu kecil agar jari tidak terluka.'],
    maintenance: CARE.steel, safety: ['Jangan memarut bahan sampai habis; jari bisa terluka.'], safetyLevel: 'warning', sharp: true, sim: 'utensil', useAnim: 'grate',
  }),
  item({
    id: 'cutting-board', name: 'Cutting Board', nameId: 'Talenan', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils',
    material: ['kayu'], materialText: 'Kayu keras (hardwood)',
    function: 'Alas untuk memotong/mengiris bahan makanan.',
    description: 'Talenan (cutting board) adalah alas mengiris yang umumnya dibuat dari kayu keras. Kitchen utensils seperti talenan, parutan, pisau, dan saringan mudah ditemukan di dapur.',
    operation: ['Letakkan talenan di permukaan datar; beri lap basah di bawahnya agar tidak bergeser.', 'Gunakan talenan terpisah untuk bahan mentah dan matang.', 'Potong bahan di atas talenan.'],
    maintenance: CARE.wood, safety: ['Gunakan talenan berbeda untuk mencegah kontaminasi silang.'], safetyLevel: 'safe', sim: 'utensil', useAnim: 'board',
  }),
  item({
    id: 'ladle', name: 'Ladle', nameId: 'Sendok Sayur Bertangkai Panjang', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Kecil',
    material: ['logam'], materialText: 'Baja tahan karat',
    function: 'Sendok bertangkai panjang untuk menyendok cairan seperti kaldu dan sup.',
    description: 'Ladle memiliki mangkuk sendok dalam dan tangkai panjang berkait sehingga dapat digantung.',
    operation: ['Celupkan ladle ke dalam panci.', 'Ambil cairan sesuai takaran.', 'Tuangkan perlahan ke mangkuk saji.'],
    maintenance: CARE.steel, safety: ['Hati-hati terhadap cipratan cairan panas.'], safetyLevel: 'safe', sim: 'utensil', useAnim: 'scoop',
  }),
  item({
    id: 'spider', name: 'Skimmer & Spider', nameId: 'Serok', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Kecil',
    material: ['logam', 'kayu'], materialText: 'Kawat baja anyaman, gagang bambu/kayu',
    function: 'Untuk mengambil makanan yang sedang direbus/digoreng, meniriskan makanan yang digoreng, membersihkan buih pada kaldu.',
    description: 'Skimmer dan spider (serok) berbentuk keranjang kawat atau piringan berlubang dengan gagang panjang.',
    operation: ['Masukkan serok ke dalam minyak/air rebusan.', 'Angkat makanan perlahan.', 'Tahan sebentar di atas wajan untuk meniriskan.'],
    maintenance: CARE.steel, safety: [SAFE_HOT], safetyLevel: 'warning', sim: 'utensil', useAnim: 'scoop',
  }),
  item({
    id: 'spatula', name: 'Frying Spatula', nameId: 'Sutil', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Kecil',
    material: ['logam', 'kayu'], materialText: 'Daun baja tahan karat, gagang kayu',
    function: 'Untuk membalik makanan yang sedang digoreng, direbus, dan dipanggang.',
    description: 'Frying spatula (sutil) memiliki daun pipih sedikit cekung dan gagang panjang tahan panas.',
    operation: ['Selipkan daun sutil di bawah makanan.', 'Angkat dan balik makanan dengan gerakan pergelangan.', 'Aduk/tumis bila diperlukan.'],
    maintenance: CARE.steel, safety: [SAFE_HOT], safetyLevel: 'safe', sim: 'utensil', useAnim: 'flip',
  }),
  item({
    id: 'conical-strainer', name: 'Conical Strainer', nameId: 'Saringan Kerucut', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Kecil',
    material: ['logam'], materialText: 'Pelat baja tahan karat berlubang',
    function: 'Untuk menyaring kaldu, sup, saus, minyak goreng, dan makanan yang direbus.',
    description: 'Conical strainer (chinois) berbentuk kerucut dengan lubang halus, memiliki gagang dan kait untuk bertumpu di bibir panci.',
    operation: ['Letakkan saringan di atas panci/wadah, kaitkan pada bibirnya.', 'Tuang kaldu/saus perlahan.', 'Tekan sisa dengan ladle agar cairan tersaring.'],
    maintenance: CARE.steel, safety: [SAFE_HOT], safetyLevel: 'safe', sim: 'utensil', useAnim: 'strain',
  }),
  item({
    id: 'strainer', name: 'Strainer', nameId: 'Saringan', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Kecil',
    material: ['logam', 'plastik'], materialText: 'Jaring kawat baja, gagang plastik',
    function: 'Untuk menyaring teh, sirup, dan lain-lain.',
    description: 'Strainer adalah saringan kecil berjaring kawat halus.',
    operation: ['Letakkan saringan di atas gelas/wadah.', 'Tuang cairan perlahan.', 'Buang ampas yang tertinggal.'],
    maintenance: CARE.steel, safety: [], safetyLevel: 'safe', sim: 'utensil', useAnim: 'strain',
  }),
  item({
    id: 'whisk', name: 'Balloon Whisk', nameId: 'Kocokan Telur', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Kecil',
    material: ['logam'], materialText: 'Kawat & gagang baja tahan karat',
    function: 'Untuk mengocok telur, mayonnaise, saus, mencampur adonan yang terbuat dari tepung dan air atau susu.',
    description: 'Balloon whisk memiliki kawat melengkung berbentuk balon untuk memasukkan udara ke dalam adonan.',
    operation: ['Masukkan bahan ke mangkuk.', 'Pegang mangkuk sedikit miring.', 'Kocok dengan gerakan memutar cepat dari pergelangan tangan.'],
    maintenance: CARE.steel, safety: [], safetyLevel: 'safe', sim: 'utensil', useAnim: 'whisk',
  }),
  item({
    id: 'ice-cream-scoop', name: 'Ice Cream Scoop', nameId: 'Sendok Es Krim', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils — Peralatan Kecil',
    material: ['logam'], materialText: 'Baja tahan karat & aluminium',
    function: 'Alat untuk mengambil ice cream.',
    description: 'Ice cream scoop berbentuk setengah bola dengan tuas pelepas sehingga es krim berbentuk bulat rapi.',
    operation: ['Celupkan scoop ke air hangat.', 'Keruk es krim dengan gerakan melengkung.', 'Tekan tuas untuk melepas es krim ke mangkuk saji.'],
    maintenance: CARE.steel, safety: [], safetyLevel: 'safe', sim: 'utensil', useAnim: 'scoop',
  }),
  item({
    id: 'measuring-cup', name: 'Measuring Cup', nameId: 'Gelas Ukur', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils',
    material: ['plastik'], materialText: 'Plastik bening tahan panas',
    function: 'Mengukur volume bahan cair.',
    description: 'Gelas ukur dari plastik termasuk peralatan dapur berbahan plastik yang ringan, awet, dan mudah dibersihkan.',
    operation: ['Letakkan gelas ukur di permukaan datar.', 'Tuang bahan cair.', 'Baca takaran sejajar mata.'],
    maintenance: CARE.steel.map((t) => t.replace('agar tidak muncul bercak putih', '')), safety: ['Plastik dapat meleleh jika terkena panas berlebih.'], safetyLevel: 'safe', sim: 'utensil', useAnim: 'pour',
  }),
  item({
    id: 'rolling-pin', name: 'Rolling Pin', nameId: 'Penggiling Adonan', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils',
    material: ['kayu'], materialText: 'Kayu keras',
    function: 'Menggiling/memipihkan adonan.',
    description: 'Rolling pin dari kayu keras termasuk peralatan dapur berbahan kayu.',
    operation: ['Taburi meja dan adonan dengan sedikit tepung.', 'Gilas dari tengah ke arah luar.', 'Putar adonan agar ketebalan merata.'],
    maintenance: CARE.wood, safety: [], safetyLevel: 'safe', sim: 'utensil', useAnim: 'roll',
  }),
  item({
    id: 'cobek', name: 'Cobek & Ulekan', nameId: 'Cobek dan Munthu', category: 'persiapan', type: 'utensil', subcategory: 'Kitchen Utensils (Batu)',
    material: ['batu'], materialText: 'Batu',
    function: 'Menghaluskan bahan makanan secara tradisional (misalnya sambal).',
    description: 'Peralatan dapur dari batu saat ini sangat jarang digunakan karena berat. Alat berbahan batu yang masih bertahan adalah cobek dan munthu, biasanya ada di dapur restoran yang menyediakan sambal untuk masakan Indonesia.',
    operation: ['Masukkan bahan sambal ke cobek.', 'Tekan dan gerus dengan ulekan memutar.', 'Ulangi hingga halus.'],
    maintenance: CARE.stone, safety: ['Alat berat — angkat dengan dua tangan.'], safetyLevel: 'safe', sim: 'utensil', useAnim: 'grind',
  }),
];

/* =========================================================================
 * KATEGORI 2 — COOKING EQUIPMENT (ALAT PENGOLAHAN)
 * ======================================================================= */
const ovenSafety = [SAFE_HOT, 'Buka pintu oven perlahan dan menjauh dari uap panas.', SAFE_UNPLUG];
const pengolahan = [
  item({
    id: 'gas-range', name: 'Kompor Gas / Gas Open Burner', nameId: 'Kompor Gas Industri', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment',
    material: ['logam'], materialText: 'Badan baja tahan karat, tatakan & burner besi cor',
    function: 'Alat utama memasak yang mengeluarkan api/panas untuk mematangkan makanan.',
    description: 'Kompor merupakan alat utama untuk memasak. Alat ini mengeluarkan api atau panas yang diteruskan pada bahan makanan sehingga matang. Di industri kuliner, jenis kompor yang paling banyak digunakan adalah gas open burner, berukuran besar dengan beberapa tungku api yang dapat digunakan bersamaan.',
    operation: ['Periksa selang dan regulator, pastikan tidak bocor.', 'Buka katup/regulator gas utama.', 'Tekan dan putar kenop tungku ke posisi menyala hingga api keluar.', 'Atur besar-kecil api sesuai kebutuhan.', 'Setelah selesai, putar kenop ke OFF lalu tutup katup gas.'],
    maintenance: CARE.gas, safety: [SAFE_GAS, SAFE_HOT, 'Jangan meninggalkan kompor menyala tanpa pengawasan.'],
    safetyLevel: 'danger', power: 'gas', hot: true, sim: 'gas-range',
  }),
  item({
    id: 'deck-oven', name: 'Conventional Oven', nameId: 'Oven Konvensional (Deck Oven)', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment — Oven',
    material: ['logam', 'kaca', 'batu'], materialText: 'Badan baja, pintu berkaca, dasar dek batu tahan panas',
    function: 'Memanggang makanan dengan dua elemen pemanas (atas dan bawah).',
    description: 'Conventional oven merupakan oven yang memiliki dua elemen pemanas di bagian bawah dan atas untuk memanaskan udara di dalam oven. Dapat diatur hanya pemanas bawah, hanya pemanas atas, atau keduanya menyala. Oven ini ada yang bertingkat sampai lima tingkatan yang disebut deck oven.',
    operation: ['Pastikan ruang oven bersih dan kosong.', 'Hubungkan listrik dan nyalakan oven.', 'Atur suhu pemanas atas dan bawah sesuai resep.', 'Tunggu hingga suhu tercapai (pemanasan awal).', 'Buka pintu, masukkan loyang menggunakan oven mitt, lalu tutup.', 'Setelah matang, keluarkan loyang lalu matikan oven.'],
    maintenance: CARE.electric, safety: ovenSafety, safetyLevel: 'danger', power: 'listrik', hot: true, sim: 'deck-oven',
  }),
  item({
    id: 'rack-oven', name: 'Revolving Rack Oven', nameId: 'Oven Rak Berputar', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment — Oven',
    material: ['logam', 'kaca'], materialText: 'Baja tahan karat, jendela kaca tahan panas',
    function: 'Memanggang dalam jumlah besar dengan rak yang berputar agar kematangan merata.',
    description: 'Revolving rack oven merupakan oven yang rak bagian dalamnya dapat berputar saat oven menyala. Dengan berputarnya rak tersebut, produk yang diolah akan mendapat kematangan merata. Pada umumnya oven ini berukuran besar.',
    operation: ['Nyalakan oven dan atur suhu serta waktu.', 'Tunggu pemanasan awal selesai.', 'Buka pintu dan dorong troli rak berisi loyang ke dalam.', 'Tutup pintu; rak akan berputar otomatis.', 'Setelah waktu habis, buka pintu dan keluarkan troli dengan sarung tangan tahan panas.'],
    maintenance: CARE.electric, safety: ovenSafety, safetyLevel: 'danger', power: 'listrik', hot: true, sim: 'rack-oven',
  }),
  item({
    id: 'convection-oven', name: 'Convection Oven', nameId: 'Oven Konveksi', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment — Oven',
    material: ['logam', 'kaca'], materialText: 'Baja tahan karat, pintu kaca',
    function: 'Memanggang dengan udara panas yang diratakan oleh kipas sehingga produk lebih renyah.',
    description: 'Convection oven memiliki satu elemen pemanas di bagian bawah dengan kipas yang berputar di belakang oven. Udara dalam oven akan merata dengan berputarnya kipas. Kipas juga berfungsi mengurangi kelembapan dalam oven sehingga produk menjadi lebih renyah.',
    operation: ['Hubungkan listrik, nyalakan oven.', 'Atur suhu dan timer.', 'Tunggu pemanasan awal; kipas berputar meratakan panas.', 'Masukkan loyang pada rak.', 'Matikan dan keluarkan produk setelah matang.'],
    maintenance: CARE.electric, safety: ovenSafety, safetyLevel: 'danger', power: 'listrik', hot: true, sim: 'convection-oven',
  }),
  item({
    id: 'combi-oven', name: 'Combi Oven', nameId: 'Oven Kombinasi', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment — Oven',
    material: ['logam', 'kaca'], materialText: 'Baja tahan karat, pintu kaca ganda, panel elektronik',
    function: 'Kombinasi oven dan steamer: memanggang dan mengukus.',
    description: 'Combi oven merupakan kombinasi antara oven dan steamer (pengukus). Oven ini dapat digunakan untuk memanggang dan mengukus adonan roti atau kue yang sudah disiapkan.',
    operation: ['Pastikan saluran air terhubung, lalu nyalakan oven.', 'Pilih mode: panas kering, uap (steam), atau kombinasi.', 'Atur suhu dan waktu.', 'Masukkan GN pan berisi bahan.', 'Setelah selesai, buka pintu perlahan karena uap panas.'],
    maintenance: CARE.electric, safety: [...ovenSafety, 'Uap panas dapat menyebabkan luka bakar — buka pintu bertahap.'], safetyLevel: 'danger', power: 'listrik', hot: true, sim: 'combi-oven',
  }),
  item({
    id: 'microwave', name: 'Microwave Oven', nameId: 'Oven Gelombang Mikro', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment — Oven',
    material: ['logam', 'kaca', 'plastik'], materialText: 'Badan logam, piringan kaca, panel plastik',
    function: 'Memanaskan/mematangkan makanan dengan gelombang mikro dan mencairkan makanan beku.',
    description: 'Microwave oven memanfaatkan gelombang mikro untuk memanaskan atau mematangkan makanan. Makanan hanya membutuhkan waktu sekitar satu menit untuk matang. Alat ini juga berfungsi mencairkan makanan beku; beberapa jenis memiliki fitur mengukus.',
    operation: ['Buka pintu dan letakkan makanan dalam wadah tahan microwave (bukan logam).', 'Tutup pintu.', 'Atur daya dan waktu.', 'Tekan START; piringan berputar.', 'Setelah bunyi, buka pintu dan ambil makanan dengan hati-hati.'],
    maintenance: CARE.electric, safety: ['Jangan memasukkan wadah logam/aluminium foil.', SAFE_HOT, SAFE_UNPLUG], safetyLevel: 'warning', power: 'listrik', hot: true, sim: 'microwave',
  }),
  item({
    id: 'salamander', name: 'Salamander', nameId: 'Salamander Broiler', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment — Oven',
    material: ['logam'], materialText: 'Baja tahan karat, elemen pemanas',
    function: 'Memberi warna cokelat dan menyempurnakan penampilan makanan (pemanas dari atas).',
    description: 'Salamander merupakan oven dengan elemen pemanas yang terletak di bagian atas. Pada umumnya alat ini digunakan untuk memberikan warna cokelat dan menyempurnakan penampilan makanan.',
    operation: ['Nyalakan salamander dan atur panas.', 'Tunggu elemen atas membara.', 'Letakkan hidangan di rak dan atur jaraknya ke pemanas.', 'Awasi hingga permukaan kecokelatan, lalu angkat dengan oven mitt.'],
    maintenance: CARE.electric, safety: [SAFE_HOT, 'Proses pencokelatan cepat — jangan ditinggal.'], safetyLevel: 'danger', power: 'listrik', hot: true, sim: 'salamander',
  }),
  item({
    id: 'griller', name: 'Griller', nameId: 'Pemanggang (Grill)', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment',
    material: ['logam'], materialText: 'Badan baja tahan karat, batang panggangan besi cor',
    function: 'Mengolah bahan makanan dengan teknik membakar (panas api langsung mengenai bahan).',
    description: 'Griller merupakan alat untuk mengolah bahan makanan dengan teknik membakar. Alat ini sangat beragam dari bentuk dan ukurannya. Ketika menggunakan griller, panas api langsung mengenai bahan makanan tanpa benda perantara.',
    operation: ['Pastikan penampung lemak terpasang dan kosong.', 'Buka gas dan nyalakan burner.', 'Panaskan grate hingga panas merata.', 'Letakkan daging di atas grate, balik dengan alat penjepit/sutil.', 'Matikan burner dan tutup gas setelah selesai.'],
    maintenance: CARE.gas, safety: [SAFE_GAS, SAFE_HOT, 'Waspadai api yang membesar karena tetesan lemak.'], safetyLevel: 'danger', power: 'gas', hot: true, sim: 'griller',
  }),
  item({
    id: 'deep-fryer', name: 'Deep Fryer', nameId: 'Penggoreng Rendam', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment',
    material: ['logam', 'plastik'], materialText: 'Baja tahan karat, keranjang kawat, gagang plastik',
    function: 'Menggoreng bahan makanan menggunakan banyak minyak.',
    description: 'Deep fryer merupakan alat yang khusus digunakan untuk menggoreng bahan makanan menggunakan banyak minyak. Alat ini sering digunakan di dapur industri yang menjual produk makanan yang digoreng.',
    operation: ['Isi bak dengan minyak sampai batas garis.', 'Hubungkan listrik dan nyalakan; atur termostat (±170–180°C).', 'Tunggu lampu pemanas padam (suhu tercapai).', 'Isi keranjang dengan bahan, lalu turunkan perlahan ke minyak.', 'Angkat keranjang, tiriskan, matikan alat.'],
    maintenance: [...CARE.electric.slice(0, 1), 'Tunggu minyak dingin, saring atau ganti minyak bekas melalui keran pembuangan.', ...CARE.electric.slice(1)],
    safety: ['Minyak sangat panas — jangan ada air masuk ke minyak.', 'Turunkan keranjang perlahan agar minyak tidak meluap.', SAFE_UNPLUG], safetyLevel: 'danger', power: 'listrik', hot: true, sim: 'deep-fryer',
  }),
  item({
    id: 'tilting-skillet', name: 'Tilting Skillet', nameId: 'Braising Pan', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment',
    material: ['logam'], materialText: 'Baja tahan karat',
    function: 'Memanggang, menumis, dan merebus bahan makanan dalam jumlah besar.',
    description: 'Tilting skillet dikenal juga sebagai braising pan. Alat ini digunakan untuk memanggang, menumis, dan merebus bahan makanan dalam jumlah besar. Wajan dapat dimiringkan untuk menuang hasil masakan.',
    operation: ['Buka tutup dan nyalakan pemanas.', 'Masukkan bahan saat wajan panas.', 'Masak sambil diaduk; tutup bila merebus.', 'Siapkan wadah di depan cerat, lalu putar roda pemiring untuk menuang.', 'Matikan pemanas dan kembalikan wajan ke posisi datar.'],
    maintenance: CARE.electric, safety: [SAFE_HOT, 'Miringkan perlahan dan pastikan wadah penampung sudah siap.'], safetyLevel: 'danger', power: 'listrik', hot: true, sim: 'tilting-skillet',
  }),
  item({
    id: 'steam-kettle', name: 'Steam Jacketed Kettle', nameId: 'Ketel Berdinding Uap', category: 'pengolahan', type: 'equipment', subcategory: 'Cooking Equipment',
    material: ['logam'], materialText: 'Baja tahan karat berdinding ganda',
    function: 'Merebus pelan dalam jumlah banyak, misalnya membuat sup atau saus.',
    description: 'Steam jacketed kettle berbentuk bulat dengan ukuran besar, digunakan di dapur industri dan berfungsi untuk merebus pelan dengan jumlah yang banyak. Biasanya alat ini digunakan saat membuat sup atau saus.',
    operation: ['Periksa pengukur tekanan dan isi bahan ke ketel.', 'Nyalakan pemanas uap.', 'Masak sambil diaduk; awasi tekanan.', 'Matikan, lalu miringkan ketel dengan roda untuk menuang ke wadah.'],
    maintenance: CARE.electric, safety: [SAFE_HOT, 'Perhatikan tekanan pada pengukur; jangan melebihi batas aman.'], safetyLevel: 'danger', power: 'listrik', hot: true, sim: 'steam-kettle',
  }),
  ...[
    ['stock-pot', 'Stock Pot', 'Panci Kaldu', 'Panci untuk membuat kaldu, merebus daging, sayuran, dan membuat sup.', 'Panci tinggi berukuran besar dengan dua pegangan, cocok untuk merebus dalam jumlah banyak.'],
    ['sauce-pot', 'Sauce Pot', 'Panci Saus', 'Panci untuk memasak saus, merebus daging, sayuran, dan sup.', 'Panci dua pegangan yang lebih pendek dan lebar daripada stock pot.'],
    ['sauce-pan', 'Sauce Pan', 'Panci Bertangkai', 'Panci bertangkai untuk membuat saus dan merebus sayuran.', 'Panci kecil bergagang panjang.'],
    ['saute-pan', 'Saute Pan', 'Wajan Tumis', 'Panci bertangkai untuk menumis, memasak saus, menggoreng daging dengan minyak sedikit.', 'Wajan bersisi lurus dengan gagang panjang dan pegangan bantu.'],
    ['roasting-pan', 'Braising / Roasting Pan', 'Loyang Panggang', 'Loyang untuk memanggang daging, unggas, dan lain sebagainya.', 'Loyang persegi berdinding dengan pegangan dan rak pemanggang.'],
    ['frying-pan', 'Frying Pan', 'Wajan Penggorengan', 'Alat untuk menggoreng dengan minyak sedikit.', 'Wajan bersisi landai, umumnya berlapis antilengket.'],
    ['steaming-pan', 'Steaming Pan', 'Panci Kukus', 'Alat untuk mengukus.', 'Panci bersusun dengan dasar berlubang; air di panci bawah menghasilkan uap.'],
  ].map(([id, name, nameId, fn, desc]) => item({
    id, name, nameId, category: 'pengolahan', type: 'utensil', subcategory: 'Kitchen Utensils — Panci (Pan)',
    material: id === 'frying-pan' ? ['logam'] : ['logam'],
    materialText: id === 'frying-pan' ? 'Aluminium dengan lapisan antilengket, gagang baja' : 'Baja tahan karat dengan dasar tebal (encapsulated base)',
    function: fn,
    description: `${desc} Panci digunakan sebagai wadah saat memproses bahan makanan; memiliki berbagai bentuk dan ukuran dengan fungsi berbeda-beda.`,
    operation: id === 'steaming-pan'
      ? ['Isi panci bawah dengan air secukupnya.', 'Didihkan air di atas kompor.', 'Tata bahan di susun pengukus, lalu pasang di atas panci.', 'Tutup dan kukus hingga matang; buka tutup menjauh dari wajah.']
      : id === 'roasting-pan'
        ? ['Tata rak dan bahan di dalam loyang.', 'Masukkan ke oven yang sudah dipanaskan.', 'Siram bahan dengan cairan pemanggangan secara berkala.', 'Keluarkan dengan oven mitt.']
        : ['Letakkan panci/wajan di atas tungku sesuai ukuran api.', 'Masukkan bahan dan atur besar api.', 'Aduk/balik bahan sesuai teknik memasak.', 'Angkat menggunakan pegangan dan kain pelindung bila panas.'],
    maintenance: CARE.steel, safety: [SAFE_HOT, 'Arahkan gagang panci ke dalam agar tidak tersenggol.'], safetyLevel: 'warning', hot: true,
    sim: id === 'steaming-pan' ? 'steaming-pan' : id === 'roasting-pan' ? 'roasting-pan' : (id === 'stock-pot' || id === 'sauce-pot' ? 'pot' : 'pan'),
  })),
];

/* =========================================================================
 * KATEGORI 3 — HOLDING EQUIPMENT
 * ======================================================================= */
const chillSafety = ['Jangan mencungkil bahan beku atau bunga es dengan benda tajam.', 'Tutup pintu rapat agar suhu stabil.', SAFE_UNPLUG];
const holding = [
  item({
    id: 'display-case', name: 'Display Case / Showcase', nameId: 'Lemari Pajang', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment',
    material: ['kaca', 'kayu', 'logam'], materialText: 'Kaca dengan rangka aluminium, alas kayu',
    function: 'Memajang makanan yang telah siap disajikan (tanpa pengaturan suhu).',
    description: 'Display case digunakan untuk memajang makanan yang telah siap disajikan. Alat ini biasanya terbuat dari kaca, tanpa pengaturan suhu sehingga suhu alat mengikuti suhu ruang. Display case dapat digunakan untuk kue, roti tawar, roti manis, manisan, serta makanan kemasan.',
    operation: ['Bersihkan kaca dan rak.', 'Tata produk dengan rapi dan menarik.', 'Tutup pintu geser belakang agar terhindar debu.'],
    maintenance: CARE.glass, safety: [SAFE_GLASS], safetyLevel: 'safe', sim: 'display-case', classifyClear: false,
  }),
  item({
    id: 'showcase-chiller', name: 'Showcase Chiller', nameId: 'Lemari Pendingin Pajang', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment — Chiller',
    material: ['logam', 'kaca', 'plastik'], materialText: 'Kabinet logam berinsulasi, pintu kaca',
    function: 'Mendinginkan sekaligus memajang makanan dan minuman (pintu kaca).',
    description: 'Showcase chiller merupakan alat pendingin yang pintunya terbuat dari kaca sehingga orang mengetahui makanan apa saja yang disimpan di dalamnya. Alat ini sering diletakkan di area yang terlihat oleh tamu dan digunakan untuk memajang sandwich, salad, buah, dan minuman. Chiller adalah alat untuk mendinginkan makanan.',
    operation: ['Pastikan suhu sudah dingin (±1–5°C).', 'Tata produk di rak, jangan menutupi aliran udara.', 'Buka-tutup pintu seperlunya.'],
    maintenance: CARE.holding, safety: chillSafety, safetyLevel: 'safe', power: 'listrik', sim: 'fridge',
  }),
  item({
    id: 'showcase-freezer', name: 'Showcase Freezer', nameId: 'Lemari Pembeku Pajang', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment — Freezer',
    material: ['logam', 'kaca', 'plastik'], materialText: 'Kabinet logam berinsulasi, tutup kaca geser',
    function: 'Membekukan sekaligus memajang makanan beku (misalnya es krim).',
    description: 'Showcase freezer berfungsi sama seperti showcase chiller, bedanya hanya pada pengaturan suhu. Showcase freezer memiliki suhu beku. Freezer adalah alat untuk membekukan makanan.',
    operation: ['Pastikan suhu beku tercapai (±-18°C).', 'Geser tutup kaca untuk mengambil produk.', 'Segera tutup kembali.'],
    maintenance: CARE.holding, safety: chillSafety, safetyLevel: 'safe', power: 'listrik', sim: 'fridge',
  }),
  item({
    id: 'upright-chiller', name: 'Upright Chiller', nameId: 'Lemari Pendingin', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment — Chiller',
    material: ['logam', 'plastik'], materialText: 'Baja tahan karat berinsulasi',
    function: 'Mendinginkan bahan/makanan dengan suhu yang dapat diatur.',
    description: 'Upright chiller (lemari pendingin) memiliki pengaturan dan penunjuk suhu sehingga suhu penyimpanan dapat ditentukan. Pada umumnya berkapasitas besar dengan rak yang dapat diatur ketinggiannya.',
    operation: ['Periksa penunjuk suhu (±1–5°C).', 'Simpan bahan dalam wadah tertutup dan berlabel.', 'Tata bahan matang di atas, bahan mentah di bawah.', 'Tutup pintu rapat.'],
    maintenance: CARE.holding, safety: chillSafety, safetyLevel: 'safe', power: 'listrik', sim: 'fridge',
  }),
  item({
    id: 'upright-freezer', name: 'Upright Freezer', nameId: 'Lemari Pembeku', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment — Freezer',
    material: ['logam', 'plastik'], materialText: 'Baja tahan karat berinsulasi',
    function: 'Membekukan bahan/makanan dengan suhu yang dapat diatur.',
    description: 'Upright freezer (lemari pembeku) memiliki pengaturan dan penunjuk suhu. Alat ini pada umumnya berkapasitas besar dan raknya dapat diatur ketinggiannya.',
    operation: ['Periksa penunjuk suhu (±-18°C).', 'Simpan bahan beku dalam kemasan rapat berlabel.', 'Tutup pintu rapat.'],
    maintenance: CARE.holding, safety: chillSafety, safetyLevel: 'safe', power: 'listrik', sim: 'fridge',
  }),
  item({
    id: 'walkin-chiller', name: 'Walk-in Chiller', nameId: 'Ruang Pendingin', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment — Chiller',
    material: ['logam', 'plastik'], materialText: 'Panel berinsulasi berlapis logam',
    function: 'Ruang pendingin berukuran besar yang dapat dimasuki.',
    description: 'Walk in chiller berbentuk ruangan yang berukuran lebih besar dibandingkan upright chiller. Oleh karena ukurannya besar, kita dapat berjalan masuk ke dalamnya.',
    operation: ['Periksa suhu pada panel di luar pintu.', 'Buka pintu, masuk, dan segera tutup kembali.', 'Simpan bahan pada rak sesuai label (FIFO).'],
    maintenance: CARE.holding, safety: [...chillSafety, 'Pastikan pintu dapat dibuka dari dalam.'], safetyLevel: 'safe', power: 'listrik', sim: 'fridge',
  }),
  item({
    id: 'walkin-freezer', name: 'Walk-in Freezer', nameId: 'Ruang Pembeku', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment — Freezer',
    material: ['logam', 'plastik'], materialText: 'Panel berinsulasi berlapis logam',
    function: 'Ruang pembeku berukuran besar yang dapat dimasuki.',
    description: 'Walk in freezer berbentuk ruangan yang berukuran lebih besar dibandingkan upright freezer sehingga kita dapat berjalan masuk ke dalamnya.',
    operation: ['Periksa suhu beku pada panel.', 'Gunakan pakaian pelindung dingin bila lama di dalam.', 'Masuk, simpan/ambil bahan, lalu segera keluar dan tutup pintu.'],
    maintenance: CARE.holding, safety: [...chillSafety, 'Pastikan pintu dapat dibuka dari dalam; jangan bekerja terlalu lama di suhu beku.'], safetyLevel: 'warning', power: 'listrik', sim: 'fridge',
  }),
  item({
    id: 'showcase-warmer', name: 'Showcase Warmer', nameId: 'Lemari Penghangat Pajang', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment — Warmer',
    material: ['kaca', 'logam'], materialText: 'Kaca, rangka logam, elemen penghangat',
    function: 'Menjaga makanan yang dipajang tetap hangat (sering untuk makanan yang digoreng).',
    description: 'Showcase warmer terbuat dari kaca berbentuk seperti lemari dengan ukuran beragam. Pada bagian bawah atau atasnya terdapat penghangat untuk menjaga makanan yang dipajang tetap hangat. Sering digunakan pada restoran yang menjual makanan yang digoreng.',
    operation: ['Nyalakan dan atur suhu penghangat.', 'Tata makanan matang di rak.', 'Jaga pintu tertutup.'],
    maintenance: CARE.holding, safety: [SAFE_HOT, SAFE_GLASS], safetyLevel: 'warning', power: 'listrik', hot: true, sim: 'warmer',
  }),
  item({
    id: 'warmer-cabinet', name: 'Warmer Cabinet', nameId: 'Lemari Penghangat', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment — Warmer',
    material: ['logam', 'kaca'], materialText: 'Baja tahan karat berpemanas',
    function: 'Menyimpan makanan matang agar tetap hangat sebelum disajikan.',
    description: 'Warmer cabinet adalah lemari berpemanas untuk menahan makanan panas sebelum disajikan sehingga makanan panas dapat disajikan dalam keadaan panas.',
    operation: ['Nyalakan dan atur suhu (±65–75°C).', 'Masukkan GN pan berisi makanan matang pada rel.', 'Tutup pintu.'],
    maintenance: CARE.holding, safety: [SAFE_HOT], safetyLevel: 'warning', power: 'listrik', hot: true, sim: 'warmer',
  }),
  item({
    id: 'steam-table', name: 'Steam Table', nameId: 'Meja Uap', category: 'holding', type: 'equipment', subcategory: 'Holding Equipment',
    material: ['logam', 'kaca'], materialText: 'Baja tahan karat, pelindung kaca',
    function: 'Menjaga makanan tetap hangat dengan uap air panas di bagian bawah.',
    description: 'Steam table merupakan meja yang bagian bawahnya terdapat tempat untuk meletakkan air panas. Air panas yang menguap menjaga makanan di atasnya tetap hangat. Steam table berukuran lebih besar daripada chafing dish dan dapat menyajikan beberapa jenis makanan sekaligus.',
    operation: ['Isi bak (well) dengan air.', 'Nyalakan pemanas tiap bak.', 'Letakkan food pan berisi makanan matang.', 'Jaga level air dan tutup food pan bila tidak melayani.'],
    maintenance: CARE.electric, safety: [SAFE_HOT, 'Jangan menyalakan pemanas ketika bak kosong.'], safetyLevel: 'warning', power: 'listrik', hot: true, sim: 'steam-table',
  }),
  item({
    id: 'chafing-dish', name: 'Chafing Dish', nameId: 'Wadah Saji Penghangat', category: 'holding', type: 'utensil', subcategory: 'Holding Equipment',
    material: ['logam'], materialText: 'Baja tahan karat',
    function: 'Menjaga makanan tetap hangat saat disajikan (prinsip pemanasan sama dengan steam table, ukurannya lebih kecil).',
    description: 'Chafing dish memiliki prinsip pemanasan makanan yang sama dengan steam table, perbedaannya pada ukuran: chafing dish berukuran lebih kecil.',
    operation: ['Isi water pan dengan air panas.', 'Pasang food pan berisi makanan.', 'Nyalakan bahan bakar di bawah water pan.', 'Tutup lid; buka saat melayani.', 'Padamkan bahan bakar dengan tutupnya setelah selesai.'],
    maintenance: CARE.steel, safety: [SAFE_HOT, 'Padamkan api bahan bakar dengan tutup, jangan ditiup.'], safetyLevel: 'warning', hot: true, sim: 'chafing-dish', classifyClear: false,
  }),
];

/* =========================================================================
 * KATEGORI 4 — SERVING EQUIPMENT
 * ======================================================================= */
const china = [
  ['dessert-plate', 'Dessert Plate', 'Piring Dessert', 'Piring kecil untuk menyajikan hidangan pembuka (appetizer) atau hidangan penutup (dessert).'],
  ['soup-cup', 'Soup Cup', 'Mangkuk Sup', 'Satu set mangkuk dan alasnya untuk menyajikan sup. Soup cup memiliki pegangan di kedua sisinya.'],
  ['saucer', 'Saucer', 'Piring Alas', 'Piring kecil sebagai alas soup cup, tea cup, dan coffee cup.'],
  ['bb-plate', 'Bread and Butter Plate', 'Piring Roti & Mentega', 'B&B plate berukuran lebih kecil daripada dessert plate, digunakan untuk menyajikan roti dan mentega.'],
  ['dinner-plate', 'Dinner Plate', 'Piring Makan Utama', 'Piring untuk menyajikan hidangan utama; berukuran lebih besar dibandingkan dessert plate.'],
  ['tea-cup', 'Tea Cup', 'Cangkir Teh', 'Cangkir untuk menyajikan teh panas, dilengkapi saucer sebagai alas.'],
  ['coffee-cup', 'Coffee Cup', 'Cangkir Kopi', 'Cangkir untuk menyajikan kopi panas, dilengkapi saucer sebagai alas.'],
].map(([id, name, nameId, fn]) => item({
  id, name, nameId, category: 'serving', type: 'utensil', subcategory: 'Chinawares',
  material: ['tanah-liat'], materialText: 'Keramik/porselen (dibuat dari tanah liat yang dibakar)',
  function: fn,
  description: `${fn} Chinawares merupakan istilah untuk peralatan dari keramik atau porselen.`,
  operation: ['Pastikan alat bersih, kering, dan tidak gompal.', 'Tata makanan/minuman dengan rapi.', 'Sajikan dengan memegang bagian tepi/pegangan, bukan permukaan makan.'],
  maintenance: CARE.ceramic, safety: ['Keramik dapat pecah — jangan ditumpuk terlalu tinggi.'], safetyLevel: 'safe', sim: 'serve', useAnim: 'serve',
}));
const silver = [
  ['dessert-fork', 'Dessert Fork', 'Garpu Dessert', 'Garpu untuk menyantap hidangan pembuka dan penutup (±20 cm).'],
  ['dessert-knife', 'Dessert Knife', 'Pisau Dessert', 'Pisau untuk menyantap hidangan pembuka dan penutup (±20 cm).'],
  ['dessert-spoon', 'Dessert Spoon', 'Sendok Dessert', 'Sendok untuk menyantap hidangan pembuka dan penutup (±20 cm).'],
  ['butter-spreader', 'Butter Spreader', 'Pisau Oles Mentega', 'Digunakan untuk mengoleskan mentega pada roti yang disajikan.'],
  ['soup-spoon', 'Soup Spoon', 'Sendok Sup', 'Digunakan untuk menyantap sup.'],
  ['dinner-fork', 'Dinner Fork', 'Garpu Makan', 'Garpu untuk menyantap hidangan utama (main course), panjang ±23 cm.'],
  ['dinner-knife', 'Dinner Knife', 'Pisau Makan', 'Pisau untuk menyantap hidangan utama (main course), panjang ±23 cm.'],
  ['dinner-spoon', 'Dinner Spoon', 'Sendok Makan', 'Sendok untuk menyantap hidangan utama (main course), panjang ±23 cm.'],
].map(([id, name, nameId, fn]) => item({
  id, name, nameId, category: 'serving', type: 'utensil', subcategory: 'Silverwares',
  material: ['logam'], materialText: 'Logam (baja tahan karat/perak)',
  function: fn,
  description: `${fn} Silverwares adalah alat menyantap makanan yang terbuat dari logam, melengkapi piring (plate) dan mangkuk (bowl).`,
  operation: ['Pastikan alat bersih dan mengilap.', 'Tata sesuai urutan hidangan (cover): garpu di kiri, pisau & sendok di kanan.', 'Pegang pada gagang saat menata.'],
  maintenance: CARE.silver, safety: [], safetyLevel: 'safe', sim: 'serve', useAnim: 'cutlery',
}));
const glass = [
  ['water-goblet', 'Goblet / Water Goblet', 'Gelas Goblet', 'Gelas berkaki untuk menyajikan air mineral. Kaki gelas ini relatif tebal dan pendek.'],
  ['wine-glass', 'Wine Glass', 'Gelas Anggur', 'Gelas berkaki untuk menyajikan anggur (wine); bentuk dan ukuran bermacam-macam tergantung jenis anggur.'],
  ['juice-glass', 'Juice Glass', 'Gelas Jus', 'Gelas tidak berkaki dan lurus dari atas ke bawah, untuk menghidangkan sari buah (juice).'],
  ['highball-glass', 'High Ball Glass', 'Gelas High Ball', 'Gelas tidak berkaki untuk menghidangkan berbagai minuman campuran.'],
  ['water-pitcher', 'Water Pitcher', 'Teko Air', 'Teko untuk meletakkan air mineral dalam jumlah banyak; kadang untuk infused water atau sari buah.'],
].map(([id, name, nameId, fn]) => item({
  id, name, nameId, category: 'serving', type: 'utensil', subcategory: 'Glasswares',
  material: ['kaca'], materialText: 'Kaca',
  function: fn,
  description: `${fn} Berdasarkan bentuknya ada stem glass (gelas berkaki) dan unstem glass (gelas tidak berkaki). Peralatan dari kaca aman untuk bahan bersifat asam karena tidak menimbulkan reaksi kimia.`,
  operation: ['Pegang gelas berkaki pada kakinya, gelas tanpa kaki pada bagian bawah.', 'Tuang minuman hingga ±3/4 gelas.', 'Sajikan dari sisi kanan tamu.'],
  maintenance: CARE.glass, safety: [SAFE_GLASS], safetyLevel: 'warning', sim: 'serve', useAnim: 'pour',
}));
const serving = [
  ...china, ...silver, ...glass,
  item({
    id: 'clay-pot', name: 'Gerabah (Periuk Tanah Liat)', nameId: 'Periuk Tanah Liat', category: 'serving', type: 'utensil', subcategory: 'Peralatan Tanah Liat',
    material: ['tanah-liat'], materialText: 'Tanah liat (gerabah)',
    function: 'Wadah penyajian untuk menimbulkan kesan tradisional.',
    description: 'Peralatan dapur dari tanah liat sudah dikenal sejak zaman praaksara dan lebih dikenal dengan istilah gerabah. Penggunaannya saat ini lebih bertujuan menimbulkan kesan tradisional pada makanan yang disajikan. Dalam pengolahan makanan sudah jarang digunakan karena berat dan mudah pecah.',
    operation: ['Rendam gerabah baru dalam air sebelum pemakaian pertama.', 'Isi dengan hidangan.', 'Sajikan dengan alas agar meja tidak tergores.'],
    maintenance: CARE.ceramic, safety: ['Berat dan mudah pecah — angkat dengan dua tangan.'], safetyLevel: 'safe', sim: 'serve', useAnim: 'serve',
  }),
];

/* =========================================================================
 * LINEN — PERALATAN BERBAHAN KAIN
 * ======================================================================= */
const linen = [
  item({
    id: 'apron', name: 'Apron', nameId: 'Celemek', category: 'linen', type: 'utensil', subcategory: 'Peralatan Kain (Linen)',
    material: ['kain'], materialText: 'Kain tebal yang menyerap cairan',
    function: 'Pelindung juru masak agar cipratan bahan makanan tidak langsung mengenai dirinya.',
    description: 'Apron (celemek) adalah kain yang dikenakan juru masak sebagai pelindung. Ada yang dikenakan melingkari pinggang, ada yang dari dada sampai ke bawah. Kainnya biasanya tebal, menyerap cairan, dan mudah dibersihkan.',
    operation: ['Kalungkan tali leher.', 'Ikat tali pinggang di belakang.', 'Ganti apron bila sudah kotor.'],
    maintenance: CARE.fabric, safety: [], safetyLevel: 'safe', sim: 'utensil', useAnim: 'wear',
  }),
  item({
    id: 'kitchen-towel', name: 'Kitchen Towel', nameId: 'Serbet Dapur', category: 'linen', type: 'utensil', subcategory: 'Peralatan Kain (Linen)',
    material: ['kain'], materialText: 'Kain katun',
    function: 'Mengeringkan tangan, membersihkan tumpahan di meja kerja, membantu memegang alat panas, dan mengeringkan bahan makanan basah.',
    description: 'Kitchen towel (serbet) memiliki berbagai ukuran dan ketebalan. Penggunaannya ditentukan secara khusus, misalnya serbet untuk mengelap meja tidak boleh dipakai untuk mengeringkan bahan makanan — untuk menjaga sanitasi, higiene, dan mencegah kontaminasi silang.',
    operation: ['Gunakan serbet sesuai peruntukannya.', 'Lipat dan gunakan sisi yang bersih.', 'Ganti bila basah atau kotor.'],
    maintenance: CARE.fabric, safety: ['Jangan memakai serbet basah untuk memegang alat panas (panas cepat merambat).'], safetyLevel: 'safe', sim: 'utensil', useAnim: 'wipe',
  }),
  item({
    id: 'dish-towel', name: 'Dish Towel', nameId: 'Lap Piring', category: 'linen', type: 'utensil', subcategory: 'Peralatan Kain (Linen)',
    material: ['kain'], materialText: 'Kain katun putih',
    function: 'Hanya untuk mengeringkan atau mengelap peralatan makan/peralatan menghidangkan makanan.',
    description: 'Dish towel mirip kitchen towel dan bisa dari bahan yang sama, tetapi hanya untuk mengelap peralatan makan. Pada umumnya berwarna putih.',
    operation: ['Pegang piring/gelas dengan dish towel.', 'Lap hingga kering dan mengilap.', 'Jangan gunakan untuk mengelap meja.'],
    maintenance: CARE.fabric, safety: [], safetyLevel: 'safe', sim: 'utensil', useAnim: 'wipe',
  }),
  item({
    id: 'oven-mitt', name: 'Oven Mitt', nameId: 'Sarung Tangan Oven', category: 'linen', type: 'utensil', subcategory: 'Peralatan Kain (Linen)',
    material: ['kain'], materialText: 'Kain tebal berlapis (quilted)',
    function: 'Sarung tangan tebal untuk mengambil loyang kue dari oven panas.',
    description: 'Oven mitts adalah sarung tangan tebal sehingga panas oven/loyang tidak merambat sampai ke tangan.',
    operation: ['Pastikan oven mitt kering dan tidak berlubang.', 'Kenakan pada kedua tangan.', 'Ambil loyang dengan mantap, letakkan di tempat tahan panas.'],
    maintenance: CARE.fabric, safety: ['Oven mitt basah menghantarkan panas — selalu gunakan dalam keadaan kering.'], safetyLevel: 'safe', sim: 'utensil', useAnim: 'wear',
  }),
];

export const equipmentData = [...persiapan, ...pengolahan, ...holding, ...serving, ...linen];

export const byId = Object.fromEntries(equipmentData.map((e) => [e.id, e]));

/** Label kategori singkat untuk antarmuka. */
export function categoryLabel(cat) {
  return CATEGORIES[cat]?.label || cat;
}
