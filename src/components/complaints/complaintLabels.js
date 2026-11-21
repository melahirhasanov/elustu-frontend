// Şikayət səbəbləri və statusları (backend models/Complaint.js ilə eyni açarlar)
export const COMPLAINT_REASONS = {
  no_show: "Gəlmədi / vaxtında gəlmədi",
  quality: "İşin keyfiyyəti pis idi",
  price: "Razılaşdırılmış qiymətdən çox istədi",
  behavior: "Kobud və ya qeyri-etik davranış",
  fraud: "Fırıldaqçılıq şübhəsi",
  other: "Digər",
};

export const COMPLAINT_STATUS = {
  open: { label: "Gözləyir", color: "warning" },
  in_review: { label: "Baxılır", color: "info" },
  resolved: { label: "Həll edildi", color: "success" },
  rejected: { label: "Rədd edildi", color: "default" },
};
