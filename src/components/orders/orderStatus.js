// Sifariş statusları: etiket, rəng və hansı rolun hansı addımı ata biləcəyi (backend ilə eyni qaydalar)
export const STATUS = {
  pending: { label: "Gözləyir", color: "warning", hint: "Usta sifarişi hələ qəbul etməyib" },
  accepted: { label: "Qəbul edildi", color: "info", hint: "Usta gəlməyə hazırlaşır" },
  in_progress: { label: "İcra olunur", color: "primary", hint: "Usta işi görür" },
  completed: { label: "Tamamlandı", color: "success", hint: "İş başa çatıb" },
  rejected: { label: "Rədd edildi", color: "default", hint: "Usta bu sifarişi götürə bilmədi" },
  cancelled: { label: "Ləğv edildi", color: "default", hint: "Sifariş ləğv olunub" },
};

export const ACTIVE_STATUSES = ["pending", "accepted", "in_progress"];

// Hər rol üçün mümkün növbəti addımlar (düymə mətni ilə)
export const ACTIONS = {
  master: {
    pending: [
      { to: "accepted", label: "Qəbul et", variant: "contained", askPrice: true },
      { to: "rejected", label: "Rədd et", variant: "outlined", color: "error", confirm: "Sifarişi rədd etmək istəyirsiniz?" },
    ],
    accepted: [
      { to: "in_progress", label: "İşə başla", variant: "contained" },
      { to: "cancelled", label: "Ləğv et", variant: "text", color: "error", confirm: "Qəbul etdiyiniz sifarişi ləğv etmək istəyirsiniz?" },
    ],
    in_progress: [{ to: "completed", label: "Tamamlandı", variant: "contained", color: "success" }],
  },
  customer: {
    pending: [{ to: "cancelled", label: "Ləğv et", variant: "outlined", color: "error", confirm: "Sifarişi ləğv etmək istəyirsiniz?" }],
    accepted: [{ to: "cancelled", label: "Ləğv et", variant: "outlined", color: "error", confirm: "Usta artıq qəbul edib. Yenə də ləğv edilsin?" }],
  },
};
