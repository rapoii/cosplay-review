export type DemoReview = {
  id: string;
  instagram_username: string;
  costume_type: string;
  rating_quality: number;
  rating_service: number;
  rating_speed: number;
  comment: string;
  status: 'approved';
};

export const demoReviews: DemoReview[] = [
  {
    id: 'demo-aurel',
    instagram_username: '@aurel.cos',
    costume_type: 'Marin Kitagawa',
    rating_quality: 5,
    rating_service: 5,
    rating_speed: 4,
    comment: 'Kostumnya wangi dan detailnya gemes banget! Adminnya juga ramah serta fast response.',
    status: 'approved'
  },
  {
    id: 'demo-naya',
    instagram_username: '@naya.chii',
    costume_type: 'Sailor Moon',
    rating_quality: 4,
    rating_service: 5,
    rating_speed: 5,
    comment: 'Ukuran pas dan proses rentalnya gampang. Bakal rental lagi buat event berikutnya.',
    status: 'approved'
  },
  {
    id: 'demo-fira',
    instagram_username: '@fira.cosplay',
    costume_type: 'Nezuko Kamado',
    rating_quality: 5,
    rating_service: 4,
    rating_speed: 5,
    comment: 'Adminnya helpful banget waktu bantu pilih ukuran. Kostum datang rapi dan siap dipakai.',
    status: 'approved'
  },
  {
    id: 'demo-rani',
    instagram_username: '@rani.luv',
    costume_type: 'Gothic Lolita',
    rating_quality: 4,
    rating_service: 5,
    rating_speed: 4,
    comment: 'Warnanya cakep sesuai foto dan packing-nya aman. Suka banget sama hasilnya!',
    status: 'approved'
  },
  {
    id: 'demo-keisha',
    instagram_username: '@keisha.anya',
    costume_type: 'Anya Forger',
    rating_quality: 5,
    rating_service: 5,
    rating_speed: 5,
    comment: 'Lucu banget kostumnya, semua aksesori lengkap. Chat dibalas cepat dan jelas.',
    status: 'approved'
  },
  {
    id: 'demo-salsa',
    instagram_username: '@salsa.cos',
    costume_type: 'Kiki Delivery Service',
    rating_quality: 4,
    rating_service: 4,
    rating_speed: 5,
    comment: 'Pengalaman rental pertama yang menyenangkan. Terima kasih Lilycosrent!',
    status: 'approved'
  }
];
