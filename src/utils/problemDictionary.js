/**
 * Problem lüğəti: istifadəçinin yazdığı sözlər -> uyğun ixtisaslar (birinci ən uyğun olandır).
 *
 * Yazılış qaydası: sözləri adi Azərbaycan dilində yazın — normallaşdırma özü edilir
 * (ə→e, ş→s, kiril→latın, böyük/kiçik hərf). Şəkilçilər avtomatik tanınır: "kran" → "kranım", "kranlar".
 * Uzun sözlərdə 1-2 hərf səhv yazılış da tanınır. Çoxsözlü ifadələr ardıcıl gəlməlidir ("su gəlmir").
 * "~" ilə başlayan açar ümumi əlamətdir ("~su axır"): mətndə cihaz adı da varsa ("kondisioner su axır"), cihaz qalib gəlir.
 * Yeni söz əlavə etmək üçün uyğun qrupun keys siyahısına yazmaq kifayətdir.
 */
const PROBLEM_RULES = [
  // ---------------- Su və santexnika ----------------
  {
    categories: ["Santexnik", "Kanalizasiya ustası"],
    keys: [
      "kran", "krant", "smesitel", "qarışdırıcı", "~su axır", "~su axıdır", "~su sızır", "~sızma", "~sızır", "~damır", "~damcılayır",
      "su gəlmir", "su yoxdur", "su zəif gəlir", "su təzyiqi", "təzyiq yoxdur", "boru", "truba", "boru partlayıb", "boru çatlayıb",
      "unitaz", "унитаз", "bəde", "çən", "rakovina", "раковина", "lavabo", "vanna", "ванна", "duş", "dush", "душ", "duşkabin",
      "su sayğacı", "sayğac", "şetçik", "счетчик", "su qızdırıcı", "boyler", "бойлер", "nasos", "насос", "hidrofor",
      "filtr", "su filtri", "qonşunu su basıb", "su basıb", "tavandan su", "silikon", "sifon", "шланг", "şlanq", "ventil", "кран",
      "santexnik", "santexnika", "сантехник", "плумбинг", "plumber",
    ],
  },
  {
    categories: ["Kanalizasiya ustası", "Santexnik"],
    keys: [
      "tıxanıb", "tıxanma", "tıxac", "su getmir", "su keçmir", "~su yığılır", "kanalizasiya", "канализация", "lağım",
      "~pis iy", "~iy gəlir", "~qoxu gəlir", "septik", "zasor", "засор", "unitaz tıxanıb", "rakovina tıxanıb",
    ],
  },

  // ---------------- Elektrik ----------------
  {
    categories: ["Elektrikçi", "İşıqlandırma ustası"],
    keys: [
      "işıq", "işığ", "işıqlar", "işıq yoxdur", "işıq yanmır", "işıq sönüb", "işıq gedib", "işıq getdi", "işıq sönür", "işıq yanıb sönür",
      "elektrik", "elektirik", "elektrikçi", "электрик", "свет", "svet", "tok", "cərəyan", "tok vurur", "elektrik vurur",
      "rozetka", "розетка", "vilka", "açar", "vıkluçatel", "выключатель", "şitok", "щиток", "avtomat atır", "avtomat düşür",
      "avtomat", "sigorta", "probka", "qısa qapanma", "zamıkaniye", "замыкание", "naqil", "kabel", "provod", "провод",
      "qığılcım", "~yanıq iyi", "elektrik sayğacı", "voltaj", "gərginlik", "stabilizator", "generator", "elektrik xətti",
      "zəng işləmir", "domofon", "домофон", "интерком",
    ],
  },
  {
    categories: ["İşıqlandırma ustası", "Elektrikçi"],
    keys: [
      "lampa", "lampoçka", "лампочка", "çilçıraq", "lüstr", "люстра", "spot", "spot işıq", "led", "lent işıq",
      "işıqlandırma", "torşer", "projektor", "küçə işığı", "həyət işığı",
    ],
  },

  // ---------------- İsitmə / soyutma ----------------
  {
    categories: ["Kondisioner ustası", "İsitmə və soyutma ustası"],
    keys: [
      "kondisioner", "kondisaner", "kondey", "kondi", "кондиционер", "split", "сплит", "soyutmur", "sərinləmir", "sərin vermir",
      "~isti vurur", "kondisioner su axıdır", "freon", "фреон", "kondisioner səs salır", "kondisioner yanmır", "pult işləmir",
      "kondisionerin təmizlənməsi", "kondisioner quraşdırma", "kondisioner sökmək",
    ],
  },
  {
    categories: ["Kombi ustası", "İsitmə və soyutma ustası", "Qaz ustası"],
    keys: [
      "kombi", "комби", "kotel", "котел", "котёл", "qazan", "isitmir", "isinmir", "~ev soyuqdur", "isti su yoxdur", "isti su gəlmir",
      "radiator", "радиатор", "batareya", "батарея", "isitmə", "otopleniye", "отопление", "kombi xəta verir", "kombi söndü",
      "kombi işə düşmür", "kombi təzyiq", "kombi səs salır", "alov yoxdur", "isti pol", "teplıy pol", "тёплый пол",
    ],
  },
  {
    categories: ["İsitmə və soyutma ustası", "Kondisioner ustası"],
    keys: [
      "soyuducu", "xolodilnik", "холодильник", "dondurucu", "морозильник", "soyuducu soyutmur", "ventilyasiya", "вентиляция",
      "ventilyator", "isti hava", "soyuq hava", "çiller", "kamin",
    ],
  },
  {
    categories: ["Qaz ustası", "Kombi ustası"],
    keys: [
      "qaz", "газ", "qaz iyi", "qaz gəlir", "qaz sızır", "qaz gəlmir", "plita", "plitə", "плита", "qaz plitəsi", "soba", "peç", "печь",
      "qaz sayğacı", "qaz borusu", "qaz kranı", "qaz xətti",
    ],
  },

  // ---------------- Mebel, ağac, qapı, pəncərə ----------------
  {
    categories: ["Mebel ustası", "Dülgər"],
    keys: [
      "mebel", "мебель", "şkaf", "шкаф", "dolab", "qarderob", "çarpayı", "krovat", "кровать", "divan", "диван", "kreslo",
      "stol", "стол", "stul", "стул", "komod", "tumba", "mətbəx mebeli", "kuxnya", "кухня", "mətbəx dolabı",
      "mebel yığmaq", "mebel sökmək", "mebel quraşdırma", "sborka", "сборка", "petlə", "петля", "rels", "çekməcə", "yaşik",
      "ikea", "mebel təmiri", "üzlük", "perebivka",
    ],
  },
  {
    categories: ["Dülgər", "Mebel ustası"],
    keys: ["dülgər", "ağac", "taxta", "плотник", "столяр", "rəf", "polka", "полка", "pilləkən", "eyvan taxtası", "çardaq"],
  },
  {
    categories: ["Qapı ustası", "Dülgər"],
    keys: [
      "qapı", "dver", "дверь", "qapı bağlanmır", "qapı açılmır", "qapı sürtünür", "qapı cırıldayır", "qapı quraşdırma",
      "dəmir qapı", "giriş qapısı", "otaq qapısı", "qapı kolu", "ruçka", "ручка", "mentəşə", "dovodçik", "доводчик",
    ],
  },
  {
    categories: ["Çilingər", "Qapı ustası"],
    keys: [
      "kilid", "замок", "zamok", "açar itib", "açarı itirdim", "açar qalıb", "qapı bağlı qaldı", "qapıda qaldım", "evə girə bilmirəm",
      "kilid sınıb", "kilid dəyişmək", "silindr", "личинка", "seyf", "сейф", "çilingər",
    ],
  },
  {
    categories: ["Pəncərə ustası", "Şüşə ustası"],
    keys: [
      "pəncərə", "okno", "окно", "plastik pəncərə", "plastik", "pvc", "стеклопакет", "steklopaket", "pəncərə bağlanmır",
      "pəncərə açılmır", "~hava keçir", "~soyuq keçir", "jalüz", "jalyuzi", "жалюзи", "rolet", "ролет", "setka", "москитная сетка",
      "ağcaqanad toru", "eyvan şüşələnməsi", "eyvan", "pəncərə uplotnitel",
    ],
  },
  {
    categories: ["Şüşə ustası", "Vitraj ustası"],
    keys: ["şüşə", "стекло", "steklo", "şüşə sınıb", "güzgü", "зеркало", "vitrin", "duş şüşəsi", "şüşə arakəsmə"],
  },

  // ---------------- Təmir və bəzək ----------------
  {
    categories: ["Malyar (Rəngsaz)", "Təmir-tikinti ustası"],
    keys: [
      "rəng", "rəngləmək", "boya", "boyamaq", "kraska", "краска", "malyar", "маляр", "divar rəngi", "divar boyamaq",
      "şpaklyovka", "шпаклевка", "şpatlyovka", "suvaq", "штукатурка", "ştukaturka", "divar çatlayıb", "nəm", "kif", "göbələk",
      "divar tökülür", "emulsiya",
    ],
  },
  { categories: ["Oboy ustası", "Malyar (Rəngsaz)"], keys: ["oboy", "обои", "divar kağızı", "oboy vurmaq", "oboy yapışdırmaq"] },
  {
    categories: ["Kafel ustası", "Fayans ustası", "Metlax ustası"],
    keys: ["kafel", "кафель", "fayans", "metlax", "plitka", "плитка", "keramika", "kafel qopub", "kafel düşüb", "zatirka", "затирка", "mozaika"],
  },
  {
    categories: ["Parket ustası", "Laminat ustası", "Pol ustası"],
    keys: [
      "parket", "паркет", "laminat", "ламинат", "döşəmə", "pol", "пол", "linoleum", "линолеум", "plintus", "плинтус",
      "döşəmə cırıldayır", "parket qabarıb", "parket silmək", "ciklə", "циклевка", "styajka", "стяжка",
    ],
  },
  {
    categories: ["Tavan ustası", "Alçıpan ustası"],
    keys: [
      "tavan", "потолок", "natyajnoy", "натяжной", "asma tavan", "gərmə tavan", "alçıpan", "gips", "гипсокартон",
      "qipsakarton", "kartonqips", "tavan çökür", "tavan tökülür", "arakəsmə",
    ],
  },
  {
    categories: ["Təmir-tikinti ustası", "Tikinti ustası"],
    keys: [
      "təmir", "remont", "ремонт", "ev təmiri", "mənzil təmiri", "kosmetik təmir", "əsaslı təmir", "evro təmir", "yevroremont",
      "tikinti", "стройка", "divar sökmək", "divar hörmək", "kərpic", "blok", "beton", "hörgü", "dam", "крыша", "dam axır",
      "izolyasiya", "izolyasiya etmək", "hidroizolyasiya", "usta lazımdır", "ümumi usta", "hər işi görən usta", "master na ças",
    ],
  },
  { categories: ["Fasad ustası", "Təmir-tikinti ustası"], keys: ["fasad", "фасад", "binanın divarı", "xarici divar", "travertin", "siding"] },
  {
    categories: ["Metal konstruksiya ustası", "Qapı ustası"],
    keys: ["metal", "dəmir", "qaynaq", "svarka", "сварка", "darvaza", "ворота", "barmaqlıq", "решетка", "reşotka", "məhəccər", "çəpər", "zabor", "навес", "naves", "ferma"],
  },

  // ---------------- Təmizlik ----------------
  {
    categories: ["Təmizlik ustası", "Xalça ustası"],
    keys: [
      "təmizlik", "уборка", "uborka", "yığışdırmaq", "evi yığışdırmaq", "ev təmizliyi", "təmirdən sonra təmizlik", "toz",
      "pəncərə silmək", "pəncərə yumaq", "yumaq", "dezinfeksiya", "dezinseksiya", "tarakan", "таракан", "siçan", "həşərat",
      "divan yumaq", "kimyəvi təmizləmə", "химчистка", "ofis təmizliyi",
    ],
  },
  { categories: ["Xalça ustası", "Təmizlik ustası"], keys: ["xalça", "ковер", "kovyor", "palaz", "kilim", "xalça yumaq", "xalça təmiri", "xalça toxumaq"] },

  // ---------------- Texnika, avtomobil, digər ----------------
  {
    categories: ["İT mütəxəssisi"],
    keys: [
      "kompüter", "компьютер", "komputer", "noutbuk", "ноутбук", "laptop", "internet", "интернет", "wifi", "vayfay", "modem",
      "router", "роутер", "printer", "принтер", "windows", "vindovs", "virus", "proqram", "sayt", "kamera", "videomüşahidə",
      "kamera quraşdırma", "smart tv", "televizor quraşdırma", "telefon", "planşet", "məlumat itib", "şəbəkə",
    ],
  },
  {
    categories: ["Avtomobil təmiri ustası", "Avtomobil elektrik ustası", "Vulkanizasiya ustası"],
    keys: [
      "maşın", "mashin", "машина", "avtomobil", "авто", "motor", "mühərrik", "двигатель", "maşın işə düşmür", "maşın xarab",
      "yağ dəyişmək", "maslo", "масло", "tormoz", "тормоз", "əyləc", "xodovoy", "ходовая", "karobka", "коробка", "sürət qutusu",
      "kuzov", "кузов", "rixtovka", "diaqnostika", "диагностика", "radiator qaynayır",
    ],
  },
  {
    categories: ["Avtomobil elektrik ustası", "Avtomobil təmiri ustası"],
    keys: ["akkumulyator", "акумулятор", "akumlyator", "aküm", "start vermir", "starter", "generator işləmir", "maşının işıqları", "avtoelektrik", "signalizasiya", "сигнализация"],
  },
  {
    categories: ["Vulkanizasiya ustası"],
    keys: ["təkər", "şin", "шина", "колесо", "koleso", "təkər partlayıb", "təkər yatıb", "deşilib", "vulkanizasiya", "шиномонтаж", "şinomontaj", "balans", "disk"],
  },
  { categories: ["Bərbər"], keys: ["saç", "saç qırxmaq", "saç kəsmək", "bərbər", "парикмахер", "стрижка", "üz qırxmaq", "saqqal", "борода"] },
  { categories: ["Hovuz ustası"], keys: ["hovuz", "бассейн", "basseyn", "hovuz təmizləmək", "hovuz nasosu"] },
  { categories: ["Yanğın təhlükəsizliyi ustası"], keys: ["yanğın", "пожар", "söndürücü", "огнетушитель", "yanğın siqnalizasiyası", "tüstü detektoru"] },
  { categories: ["Zinət əşyaları ustası"], keys: ["qızıl", "золото", "üzük", "кольцо", "sırğa", "zəncir", "zərgər", "ювелир", "bilərzik", "gümüş"] },
  { categories: ["Musiqi alətləri təmiri ustası"], keys: ["piano", "pianino", "пианино", "gitara", "гитара", "tar", "kamança", "saz", "skripka", "nağara", "sintezator"] },
  { categories: ["Toxuculuq ustası", "Xalça ustası"], keys: ["toxuculuq", "toxumaq", "hörmək", "trikotaj", "вязание", "tikiş", "dərzi", "paltar tikmək", "швея"] },
  { categories: ["Usta-memar", "Mühəndis"], keys: ["layihə", "proyekt", "проект", "memar", "архитектор", "dizayn", "interyer", "eskiz", "plan çəkmək"] },
  { categories: ["Mühəndis", "Usta-memar"], keys: ["mühəndis", "инженер", "hesablama", "smeta", "смета", "ekspertiza"] },
  { categories: ["Yüksəkmərtəbəli bina ustası", "Fasad ustası"], keys: ["alpinist", "альпинист", "yüksəklik", "hündür bina", "yüksək mərtəbə"] },
  { categories: ["Zolaq çəkmə ustası"], keys: ["zolaq", "разметка", "parkinq xətti", "yol xətti", "nişanlanma"] },
  { categories: ["Vitraj ustası", "Şüşə ustası"], keys: ["vitraj", "витраж", "rəngli şüşə"] },
];

export default PROBLEM_RULES;
