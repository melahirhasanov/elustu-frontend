// Usta qeydiyyatı, axtarış və profil redaktəsi eyni siyahılardan istifadə edir
export const CATEGORIES = [
  "Alçıpan ustası", "Avtomobil elektrik ustası", "Avtomobil təmiri ustası", "Bərbər", "Çilingər",
  "Dülgər", "Elektrikçi", "Fasad ustası", "Fayans ustası", "Hovuz ustası",
  "İsitmə və soyutma ustası", "İşıqlandırma ustası", "İT mütəxəssisi", "Kafel ustası",
  "Kanalizasiya ustası", "Kombi ustası", "Kondisioner ustası", "Laminat ustası", "Loyiha ustası",
  "Malyar (Rəngsaz)", "Mebel ustası", "Metal konstruksiya ustası", "Metlax ustası", "Mühəndis",
  "Musiqi alətləri təmiri ustası", "Oboy ustası", "Parket ustası", "Pəncərə ustası", "Pol ustası",
  "Qapı ustası", "Qaz ustası", "Santexnik", "Şüşə ustası", "Tavan ustası", "Təmizlik ustası",
  "Tikinti ustası", "Toxuculuq ustası", "Təmir-tikinti ustası", "Usta-memar", "Vitraj ustası",
  "Vulkanizasiya ustası", "Xalça ustası", "Yanğın təhlükəsizliyi ustası",
  "Yüksəkmərtəbəli bina ustası", "Zinət əşyaları ustası", "Zolaq çəkmə ustası"
];

export const CITIES = [
  "Bakı", "Sumqayıt", "Gəncə", "Lənkəran", "Mingəçevir", "Naxçıvan", "Naftalan", "Şəki", "Yevlax", "Xankəndi",
  "Şirvan", "Ağcabədi", "Ağdam", "Ağdaş", "Ağstafa", "Ağsu", "Astara", "Babək", "Balakən", "Bərdə",
  "Beyləqan", "Biləsuvar", "Cəbrayıl", "Cəlilabad", "Daşkəsən", "Füzuli", "Göyçay", "Göygöl",
  "Goranboy", "Hacıqabul", "İmişli", "İsmayıllı", "Kəlbəcər", "Kürdəmir", "Laçın", "Lerik",
  "Masallı", "Neftçala", "Oğuz", "Ordubad", "Qax", "Qazax", "Qəbələ", "Qobustan", "Quba",
  "Qubadlı", "Qusar", "Saatlı", "Sabirabad", "Salyan", "Samux", "Sədərək", "Şabran", "Şahbuz",
  "Şamaxı", "Şəki", "Şəmkir", "Şərur", "Tərtər", "Tovuz", "Ucar", "Xaçmaz", "Xızı", "Xocalı",
  "Xocavənd", "Yardımlı", "Zaqatala", "Zəngilan", "Zərdab"
];

// Ana səhifədə göstərilən populyar kateqoriyalar (ikon adları components/CategoryIcon.jsx-dədir)
export const POPULAR_CATEGORIES = [
  "Santexnik", "Elektrikçi", "Kondisioner ustası", "Kombi ustası",
  "Mebel ustası", "Malyar (Rəngsaz)", "Təmizlik ustası", "Təmir-tikinti ustası",
];

// Yer seçimində sürətli seçim üçün Bakı rayonları və yaxın şəhərlər (təxmini mərkəz nöqtələri)
export const QUICK_AREAS = [
  { title: "Nəsimi", lat: 40.3925, lng: 49.8425 },
  { title: "Nərimanov", lat: 40.4045, lng: 49.8725 },
  { title: "Yasamal", lat: 40.3865, lng: 49.8095 },
  { title: "Səbail", lat: 40.3655, lng: 49.8355 },
  { title: "Xətai", lat: 40.3830, lng: 49.8950 },
  { title: "Nizami", lat: 40.3985, lng: 49.9455 },
  { title: "Binəqədi", lat: 40.4600, lng: 49.8300 },
  { title: "Sabunçu", lat: 40.4430, lng: 49.9480 },
  { title: "Suraxanı", lat: 40.4220, lng: 50.0050 },
  { title: "Xırdalan", lat: 40.4480, lng: 49.7550 },
  { title: "Sumqayıt", lat: 40.5897, lng: 49.6686 },
];

// Bakı mərkəzi — xəritənin standart görünüşü
export const DEFAULT_CENTER = [40.4093, 49.8671];
