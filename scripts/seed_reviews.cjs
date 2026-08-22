const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
require('dotenv').config();

const app = initializeApp({
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID
});

const db = getFirestore(app);

const costumes = [
  'Marin Kitagawa', 'Sailor Moon', 'Nezuko Kamado', 'Gothic Lolita',
  'Anya Forger', 'Kiki Delivery Service', 'Miku Hatsune', 'Rem Re:Zero',
  'Yor Forger', 'Zero Two', 'Asuna Yuuki', 'Mikasa Ackerman',
  'Hinata Hyuga', 'Sakura Haruno', 'Rukia Kuchiki', 'Nami One Piece',
  'Chun-Li Street Fighter', 'Tifa Lockhart', 'Princess Zelda', 'Peach Mario'
];

const comments = [
  'Kostumnya wangi dan detailnya gemes banget! Adminnya juga ramah serta fast response.',
  'Ukuran pas dan proses rentalnya gampang. Bakal rental lagi buat event berikutnya.',
  'Adminnya helpful banget waktu bantu pilih ukuran. Kostum datang rapi dan siap dipakai.',
  'Warnanya cakep sesuai foto dan packing-nya aman. Suka banget sama hasilnya!',
  'Lucu banget kostumnya, semua aksesori lengkap. Chat dibalas cepat dan jelas.',
  'Pengalaman rental pertama yang menyenangkan. Terima kasih Lilycosrent!',
  'Bahan adem dan jahitannya rapi. Worth it banget buat harga segini.',
  'Proses return mudah dan adminnya sabar jawab pertanyaan aku yang banyak.',
  'Kostum sampai sehari sebelum event, packaging super aman. Recommended!',
  'Detail wig-nya bagus, nggak kelihatan murahan. Pasti bakal repeat order.'
];

const usernames = [
  '@aurel.cos', '@naya.chii', '@fira.cosplay', '@rani.luv', '@keisha.anya',
  '@salsa.cos', '@miku.fan', '@rem.bestie', '@yor.mama', '@zero.two.love',
  '@asuna.sword', '@mikasa.titan', '@hinata.shy', '@sakura.medical', '@rukia.soul',
  '@nami.navigator', '@chunli.kick', '@tifa.ff7', '@zelda.princess', '@peach.mushroom'
];

async function seed() {
  console.log(`Seeding ${costumes.length} reviews...`);
  for (let i = 0; i < costumes.length; i++) {
    const ratingBase = Math.floor(Math.random() * 2) + 4; // 4 or 5
    await addDoc(collection(db, 'reviews'), {
      instagram_username: usernames[i],
      costume_type: costumes[i],
      rating_quality: ratingBase,
      rating_service: Math.floor(Math.random() * 2) + 4,
      rating_speed: Math.floor(Math.random() * 2) + 4,
      comment: comments[i % comments.length],
      status: 'pending',
      created_at: serverTimestamp()
    });
    console.log(`  ✓ ${usernames[i]} - ${costumes[i]}`);
  }
  console.log('Done! All 20 reviews seeded as pending. Moderate them before publishing.');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
