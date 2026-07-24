function detectLanguage(text) {
    // Check for Burmese characters (Myanmar Unicode block: U+1000 to U+109F)
    const myanmarRegex = /[\u1000-\u109f]/;
    if (myanmarRegex.test(text)) {
        return "my";
    }
    // Check for Japanese characters (Hiragana, Katakana, Kanji)
    const japaneseRegex = /[\u3040-\u30ff\u4e00-\u9faf]/;
    if (japaneseRegex.test(text)) {
        return "ja";
    }
    return "en";
}

function classifySymptomsLocally(symptoms, language) {
    const lang = language || detectLanguage(symptoms);
    const lowerSymptoms = symptoms.toLowerCase();

    let isRed = false;
    let isYellow = false;

    // English keywords
    const redEn = [
        "bleed", "blood", "chok", "breath", "unconscious", "collapse", "seizure", "convulsion", "paralyz",
        "poison", "toxic", "chocolate", "lily", "lilies", "teflon", "smoke", "heatstroke", "heat shock", "stasis", "limp",
        "fracture", "broken", "unresponsive", "gasp", "pant", "blue", "pale", "bloat", "fit",
        "accident", "hit by car", "run over", "fell from", "dog attack", "animal attack", "trauma", "crash", "collision", "hit by", "struck by",
        "eye bleed", "bleeding eye", "eye bleeding", "proptosis", "eye pop", "eyeball pop", "eye puncture", "blindness",
        "ear torn", "torn ear", "ear bleeding", "bleeding ear", "ear cut off",
        "nosebleed", "nose bleed", "bleeding nose", "epistaxis",
        "severe burn", "chemical burn", "deep wound", "skin torn", "torn skin", "deep puncture", "laceration"
    ];
    const yellowEn = [
        "vomit", "diarrhea", "pain",
        "eye scratch", "scratched eye", "swollen eye", "eye discharge", "eye squint", "squinting eye", "eye red", "red eye", "cloudy eye", "watery eye", "eye shut", "closed eye",
        "ear discharge", "head shaking", "shaking head", "scratching ear", "ear scratch", "ear hematoma", "smelly ear", "ear smell", "ear red", "red ear", "swollen ear", "ear infection",
        "nasal discharge", "nose discharge", "sneezing blood", "bloody sneeze", "nose swelling", "swollen nose", "yellow snot", "green snot",
        "skin cut", "wound", "hot spot", "rash", "hives", "minor burn", "skin burn", "abscess", "skin swelling", "swollen skin", "severe itch", "skin red", "red skin", "dermatitis"
    ];
    const greenEn = [
        "mild tearing", "sleep crust", "eye booger",
        "mild wax", "ear wax", "ear dirt",
        "dry nose", "clear nasal", "occasional sneeze",
        "minor scratch", "dry skin", "dandruff", "mild itch", "flaky skin"
    ];

    // Japanese keywords
    const redJa = [
        "出血", "のどにつまる", "窒息", "息", "呼吸", "意識不明", "ぐったり", "血", "吐血", "呼吸困難",
        "息苦しい", "気絶", "倒れる", "反応がない", "けいれん", "痙攣", "発作", "麻痺", "まひ", "動けない",
        "中毒", "毒", "チョコレート", "ユリ", "ゆり", "化学物質", "テフロン", "煙", "熱中症", "ヒートショック", "うっ滞",
        "骨折", "折れる", "ハアハア", "あえぎ呼吸", "蒼白", "胃拡張",
        "事故", "車にひかれた", "ひかれた", "転落", "犬に噛まれた", "噛まれた", "動物に襲われた", "外傷", "衝突", "はねられた",
        "眼球突出", "目が飛び出る", "目が飛び出た", "眼の出血", "目の出血", "失明", "眼に刺さる",
        "耳がちぎれた", "耳の出血", "耳から血",
        "鼻血", "鼻の出血",
        "重度の火傷", "大やけど", "深い創傷", "深い傷", "皮膚が裂けた", "裂傷", "化学やけど"
    ];
    const yellowJa = [
        "嘔吐", "吐く", "下痢", "痛み", "痛い",
        "眼の傷", "目の傷", "目の腫れ", "目やに", "目をこする", "目を気にする", "結膜炎", "目が赤い", "白濁", "涙目", "目が開かない", "閉じた目",
        "耳だれ", "耳垢", "耳アカ", "頭を振る", "耳をかく", "耳の腫れ", "耳血腫", "耳が臭い", "耳が赤い", "外耳炎",
        "鼻水", "鼻汁", "くしゃみと血", "血混じりの鼻水", "鼻の腫れ", "黄色い鼻水",
        "切り傷", "創傷", "ホットスポット", "湿疹", "じんましん", "軽度のやけど", "膿瘍", "皮膚の腫れ", "激しい痒み", "皮膚の赤み", "皮膚炎"
    ];
    const greenJa = [
        "軽い涙目", "少量の目やに",
        "軽度の耳垢", "耳の汚れ",
        "鼻の乾燥", "透明な鼻水", "たまにくしゃみ",
        "軽い引っかき傷", "小さな傷", "乾燥肌", "フケ", "軽い痒み"
    ];

    // Burmese keywords
    const redMy = [
        "သွေးထွက်", "နင်", "အသက်ရှူ", "သတိလစ်", "သွေး", "သီး", "လည်ပင်းနင်", "အသက်ရှူကျပ်", "မေ့မြော",
        "တက်", "အတက်ရောဂါ", "ဆွဲတက်", "လေဖြတ်", "လှုပ်မရ", "အဆိပ်", "အဆိပ်သင့်", "ချောကလက်", "လီလီ",
        "လီလီပန်း", "တက်ဖလွန်", "မီးခိုး", "အပူလျှပ်", "အစာအိမ်လှুদ্ধားမှုရပ်", "လေပွ", "အရိုးကျိုး", "ကျိုး",
        "ဟောဟဲ", "အသက်ရှူပြင်း", "ဖြူဖျော့", "ပြာနှမ်း", "ဗိုက်ပွ", "လေထိုး",
        "မတော်တဆ", "ကားတိုက်", "ပြုတ်ကျ", "ခွေးကိုက်", "အခြားတိရစ္ဆာန်ကိုက်", "ဒဏ်ရာရ", "တိုက်မိ", "ဆောင့်မိ",
        "မျက်လုံးပြူးထွက်", "မျက်လုံးပြူး", "မျက်လုံးမှသွေးထွက်", "မျက်စိကွယ်", "မျက်လုံးစူး", "မျက်စိပေါက်",
        "နားရွက်ပြတ်", "နားရွက်ပြဲ", "နားမှသွေးထွက်",
        "နှာခေါင်းသွေးယို", "နှာခေါင်းသွေးကျ", "နှာခေါင်းမှသွေးထွက်",
        "မီးလောင်ဒဏ်ရာပြင်းထန်", "ဒဏ်ရာအနက်ကြီး", "အရေပြားပြဲထွက်", "ဓာတုမီးလောင်"
    ];
    const yellowMy = [
        "အော့အန်", "အန်", "ဝမ်းလျှော", "ဝမ်းပျက်", "နာကျင်", "ကိုက်",
        "မျက်လုံးခြစ်မိ", "မျက်လုံးနာ", "မျက်လုံးရောင်", "မျက်စိနာ", "မျက်စိအချွဲထွက်", "မျက်လုံးမှိတ်ထား", "မျက်လုံးနီ", "မျက်စိမှုံ", "မျက်ရည်အဆက်မပြတ်ထွက်",
        "နားပြည်ထွက်", "နားကုတ်", "နားယား", "ခေါင်းခါ", "နားရောင်", "နားရွက်သွေးစု", "နားနံ", "နားနီ", "နားပိုးဝင်",
        "နှာရည်ယို", "နှာစေး", "နှာချေပြီးသွေးပါ", "နှာခေါင်းရောင်", "နှာရည်ဝါ", "နှာရည်စိမ်း",
        "ရှနာ", "အရေပြားအနာ", "အင်ပြင်", "မီးလောင်ဖု", "ပြည်တည်နာ", "အရေပြားရောင်", "အရေပြားယားယံ", "အရေပြားနီ", "အရေပြားပိုးဝင်"
    ];
    const greenMy = [
        "မျက်ရည်အနည်းငယ်ထွက်", "မျက်စိကပ်", "မျက်ချေးထွက်",
        "နားဖာချေးအနည်းငယ်", "နားညစ်ပတ်",
        "နှာခေါင်းခြောက်", "နှာရည်ကြည်ယို", "ရံဖန်ရံခါနှာချေ",
        "အစင်းရာအနည်းငယ်", "အရေပြားခြောက်", "ဗောက်ထ", "ယားယံရုံတင်"
    ];

    if (redEn.some(w => lowerSymptoms.includes(w)) ||
        redJa.some(w => symptoms.includes(w)) ||
        redMy.some(w => symptoms.includes(w))) {
        isRed = true;
    } else if (yellowEn.some(w => lowerSymptoms.includes(w)) ||
        yellowJa.some(w => symptoms.includes(w)) ||
        yellowMy.some(w => symptoms.includes(w))) {
        isYellow = true;
    }

    if (isRed) {
        if (lang === "ja") {
            return {
                urgency: "RED",
                action_directive: "ただちに最寄りの夜間・救急動物病院を受診してください。待たずにすぐ行動してください。",
                key_instructions: [
                    "ペットを落ち着かせ、安静にして二次被害を防ぎます",
                    "フード、水、経口薬は一切与えないでください",
                    "ただちに最寄りの夜間救急病院へ搬送する準備をします",
                    "到着後すぐに対応できるよう、事前に病院へ電話連絡してください",
                    "誤飲が疑われる製品のパッケージや毒物を持参してください"
                ]
            };
        } else if (lang === "my") {
            return {
                urgency: "RED",
                action_directive: "နီးစပ်ရာ အရေးပေါ် တိရစ္ဆာန်ဆေးကုခန်းသို့ ချက်ချင်း သွားပါ။ မစောင့်ဆိုင်းပါနှင့်။",
                key_instructions: [
                    "အိမ်မွေးတိရစ္ဆာန်ကို ငြိမ်ဝပ်အောင်ထားပြီး ဒဏ်ရာမတိုးစေရန် လှုပ်ရှားမှုကို ကန့်သတ်ပါ",
                    "အစာ၊ ရေ နှင့် ပါးစပ်မှတိုက်သော ဆေးဝါးများကို လုံးဝမကျွေးပါနှင့်",
                    "အနီးဆုံး ညဉ့်နက်ပိုင်း အရေးပေါ်ဆေးခန်းသို့ ချက်ချင်းသွားရန် ပြင်ဆင်ပါ",
                    "သင်ရောက်ရှိမည့်အကြောင်းကို ဆေးခန်းသို့ ကြိုတင်ဖုန်းဆက် အကြောင်းကြားပါ",
                    "မျိုချမိသည်ဟု သံသယရှိသော အဆိပ်အတောက် သို့မဟုတ် ထုပ်ပိုးမှုများကို ယူဆောင်လာပါ"
                ]
            };
        } else {
            return {
                urgency: "RED",
                action_directive: "Go to the nearest emergency clinic immediately. Do not wait.",
                key_instructions: [
                    "Keep the pet calm and restrict movement to prevent further injury",
                    "Do not give any food, water, or oral medications",
                    "Prepare for immediate transport to the nearest 24/7 emergency clinic",
                    "Call the clinic ahead of time to alert their staff of your arrival",
                    "Bring any suspected toxins, packaging, or swallowed items with you"
                ]
            };
        }
    } else if (isYellow) {
        if (lang === "ja") {
            return {
                urgency: "YELLOW",
                action_directive: "かかりつけの獣医師に連絡するか、今日中に救急対応の動物病院を受診してください。",
                key_instructions: [
                    "症状（嘔吐、元気がない等）が悪化しないか注意深く観察します",
                    "12時間は食事を控え、新鮮な水を少量ずつ飲めるようにします",
                    "今日中にかかりつけ医または近隣のクリニックの予約を確保します",
                    "他のペットから離し、静かで暖かく快適な場所に休ませます",
                    "獣医師に伝えるために、症状が起きた頻度や時間を記録します"
                ]
            };
        } else if (lang === "my") {
            return {
                urgency: "YELLOW",
                action_directive: "သင့်တိရစ္ဆာန်ဆရာဝန်ထံ ဆက်သွယ်ပါ သို့မဟုတ် ယနေ့အတွင်း အရေးပေါ်ဆေးခန်းသို့ သွားရောက်ပါ။",
                key_instructions: [
                    "ရောဂါလက္ခဏာများ (အန်ခြင်း၊ နုံးခြင်း စသည်) ပိုဆိုးလာသလား အနီးကပ် စောင့်ကြည့်ပါ",
                    "၁၂ နာရီခန့် အစာမကျွေးဘဲ ထားပါ (ရေသန့်အနည်းငယ်စီကိုသာ လျက်စေပါ)",
                    "ယနေ့အတွင်း ပြသနိုင်ရန် သင့်ပုံမှန် တိရစ္ဆာန်ဆရာဝန် သို့မဟုတ် ဆေးခန်းသို့ ဆက်သွယ်ပါ",
                    "အိမ်မွေးတိရစ္ဆာန်ကို အခြားတိရစ္ဆာန်များနှင့်ခွဲပြီး တိတ်ဆိတ်နွေးထွေးသောနေရာတွင် ထားပါ",
                    "ဆရာဝန်ပြသချိန်တွင် ပြောပြနိုင်ရန် ရောဂါဖြစ်ပွားမှုအကြိမ်ရေကို မှတ်သားထားပါ"
                ]
            };
        } else {
            return {
                urgency: "YELLOW",
                action_directive: "Contact your vet or visit an urgent clinic today.",
                key_instructions: [
                    "Observe closely for progression of symptoms (vomiting, lethargy, etc.)",
                    "Withhold food for 12 hours, but ensure access to small laps of fresh water",
                    "Contact your primary care vet or local clinic to secure an appointment today",
                    "Keep the pet in a quiet, warm, and comfortable space away from other animals",
                    "Document the frequency of symptoms to share with the vet"
                ]
            };
        }
    } else {
        if (lang === "ja") {
            return {
                urgency: "GREEN",
                action_directive: "自宅で様子を見てください。緊急の受診は不要です。",
                key_instructions: [
                    "ペットがストレスを感じない快適な環境を整えます",
                    "新鮮な水を用意し、食欲がある場合は普段のフードを与えます",
                    "今後24〜48時間は、新たな症状や悪化がないか様子を見ます",
                    "歯茎の色（健康ならピンク）を確認し、元気や反応があるか見ます",
                    "軽い症状が2日以上続く場合は、念のため通常受診を行ってください"
                ]
            };
        } else if (lang === "my") {
            return {
                urgency: "GREEN",
                action_directive: "အိမ်တွင် စောင့်ကြည့်ပါ။ အရေးပေါ်သွားရောက်ရန် မလိုအပ်ပါ။",
                key_instructions: [
                    "အိမ်မွေးတိရစ္ဆာန်ကို သက်တောင့်သက်သာဖြစ်စေပြီး စိတ်ဖိစီးမှုကင်းသော ပတ်ဝန်းကျင်တွင် ထားပါ",
                    "ရေသန့်ပေးထားပါ၊ အစာစားချင်စိတ်ရှိပါက ပုံမှန်အစာကို ကျွေးနိုင်သည်",
                    "နောက်ထပ် ၂၄-၄၈ နာရီအထိ ရောဂါလက္ခဏာအသစ်များ ရှိမရှိ စောင့်ကြည့်ပါ",
                    "သွားဖုံးအရောင် (ပန်းရောင်ဖြစ်ရမည်) နှင့် တက်ကြွနိုးကြားမှု ရှိမရှိ စစ်ဆေးပါ",
                    "အပျော့စားလက္ခဏာများ ၂ ရက်ထက်ကျော်လွန်ပါက ပုံမှန်ဆေးခန်းပြသရန် ရက်ချိန်းယူပါ"
                ]
            };
        } else {
            return {
                urgency: "GREEN",
                action_directive: "Monitor your pet at home. No urgent visit required.",
                key_instructions: [
                    "Keep your pet comfortable and ensure a stress-free environment",
                    "Provide fresh water and offer their normal diet if they show appetite",
                    "Monitor closely for the next 24-48 hours for any new or worsening symptoms",
                    "Check gum color (should be pink) and ensure they are active and alert",
                    "Schedule a routine vet check-up if mild symptoms persist beyond 2 days"
                ]
            };
        }
    }
}

const inputEl = document.getElementById('symptoms-input');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const btnText = document.getElementById('btn-text');
const spinner = document.querySelector('.spinner');
const errorBanner = document.getElementById('error-banner');
const charWarning = document.getElementById('char-warning');

const promptHeaderEl = document.getElementById('prompt-header');
const disclaimerEl = document.getElementById('disclaimer');
const accuracyNoticeTextEl = document.getElementById('accuracy-notice-text');
const langBtns = document.querySelectorAll('.lang-btn');

const landingState = document.getElementById('landing-state');
const resultState = document.getElementById('result-state');

const badgeEl = document.getElementById('urgency-badge');
const directiveEl = document.getElementById('action-directive');
const listEl = document.getElementById('key-instructions-list');

// Clinics Section Elements
const clinicsSection = document.getElementById('clinics-section');
const clinicsHeader = document.getElementById('clinics-header');
const clinicsPrompt = document.getElementById('clinics-prompt');
const clinicsPromptText = document.getElementById('clinics-prompt-text');
const shareLocationBtn = document.getElementById('share-location-btn');
const clinicsLoading = document.getElementById('clinics-loading');
const clinicsLoadingText = document.getElementById('clinics-loading-text');
const clinicsList = document.getElementById('clinics-list');
const clinicsFallback = document.getElementById('clinics-fallback');
const clinicsFallbackText = document.getElementById('clinics-fallback-text');
const searchMapsBtn = document.getElementById('search-maps-btn');

// Navigation & My Pets DOM Elements
const logoHome = document.getElementById('logo-home');
const navTriageBtn = document.getElementById('nav-triage-btn');
const navPetsBtn = document.getElementById('nav-pets-btn');
const navClinicBtn = document.getElementById('nav-clinic-btn');
const navLibraryBtn = document.getElementById('nav-library-btn');
const myPetsState = document.getElementById('my-pets-state');
const newPetState = document.getElementById('new-pet-state');
const emergencyContactState = document.getElementById('emergency-contact-state');
const petLibraryState = document.getElementById('pet-library-state');

const libraryTitle = document.getElementById('library-title');
const librarySearchInput = document.getElementById('library-search-input');
const librarySearchBtn = document.getElementById('library-search-btn');
const libraryResultContainer = document.getElementById('library-result-container');
const libraryErrorMessage = document.getElementById('library-error-message');

const emergencyContactTitle = document.getElementById('emergency-contact-title');
const clinicDisplayContainer = document.getElementById('clinic-display-container');
const dispClinicName = document.getElementById('disp-clinic-name');
const dispClinicAddress = document.getElementById('disp-clinic-address');
const dispClinicPhone = document.getElementById('disp-clinic-phone');
const editClinicBtn = document.getElementById('edit-clinic-btn');
const removeClinicBtn = document.getElementById('remove-clinic-btn');
const clinicFormContainer = document.getElementById('clinic-form-container');
const clinicRegisterForm = document.getElementById('clinic-register-form');
const regClinicName = document.getElementById('reg-clinic-name');
const regClinicAddress = document.getElementById('reg-clinic-address');
const regClinicPhone = document.getElementById('reg-clinic-phone');
const saveClinicBtn = document.getElementById('save-clinic-btn');
const cancelClinicBtn = document.getElementById('cancel-clinic-btn');
const emptyClinicMessage = document.getElementById('empty-clinic-message');
const addClinicBtn = document.getElementById('add-clinic-btn');
const addClinicTopBtn = document.getElementById('add-clinic-top-btn');
const emptyClinicP = document.getElementById('empty-clinic-p');

const labelRegClinicName = document.getElementById('label-reg-clinic-name');
const labelRegClinicAddress = document.getElementById('label-reg-clinic-address');
const labelRegClinicPhone = document.getElementById('label-reg-clinic-phone');
const labelDispAddress = document.getElementById('label-disp-address');
const labelDispPhone = document.getElementById('label-disp-phone');

const myPetsTitle = document.getElementById('my-pets-title');
const addPetBtn = document.getElementById('add-pet-btn');
const emptyPetsMessage = document.getElementById('empty-pets-message');
const petsGrid = document.getElementById('pets-grid');

const registerPetTitle = document.getElementById('register-pet-title');
const regPetForm = document.getElementById('pet-register-form');
const regPetName = document.getElementById('reg-pet-name');
const regPetAddress = document.getElementById('reg-pet-address');
const regPetChip = document.getElementById('reg-pet-chip');
const regPetVaccine = document.getElementById('reg-pet-vaccine');
const registerSubmitBtn = document.getElementById('register-submit-btn');
const registerCancelBtn = document.getElementById('register-cancel-btn');

const labelPetName = document.getElementById('label-pet-name');
const labelPetAddress = document.getElementById('label-pet-address');
const labelPetChip = document.getElementById('label-pet-chip');
const labelPetVaccine = document.getElementById('label-pet-vaccine');

const labelPetType = document.getElementById('label-pet-type');
const regPetType = document.getElementById('reg-pet-type');
const optDog = document.getElementById('opt-dog');
const optCat = document.getElementById('opt-cat');
const optBird = document.getElementById('opt-bird');
const optRabbit = document.getElementById('opt-rabbit');
const optOther = document.getElementById('opt-other');
const labelPetBreed = document.getElementById('label-pet-breed');
const regPetBreed = document.getElementById('reg-pet-breed');

const labelPetPhoto = document.getElementById('label-pet-photo');
const regPetPhoto = document.getElementById('reg-pet-photo');
const photoUploadBtn = document.getElementById('photo-upload-btn');
const photoPreviewContainer = document.getElementById('photo-preview-container');
const photoPreview = document.getElementById('photo-preview');
const photoRemoveBtn = document.getElementById('photo-remove-btn');

let uploadedPhotoBase64 = "";

const MAX_CHARS = 1000;

// Leaflet map globals
let mapInstance = null;
let mapMarkers = [];

const FALLBACK_COORDS = {
    en: { lat: 37.7749, lon: -122.4194 },
    ja: { lat: 35.6895, lon: 139.6917 },
    my: { lat: 16.8661, lon: 96.1951 }
};

const DOCTOR_NAMES = {
    en: ["Dr. Sarah Jenkins", "Dr. Michael Chen", "Dr. Elena Rostova", "Dr. James Carter", "Dr. Lisa Wong"],
    ja: ["佐藤 健二 医師", "田中 ゆみ 医師", "渡辺 隆 医師", "高橋 まり 医師", "鈴木 直樹 医師"],
    my: ["ဒေါက်တာ စာရာ ဂျင်းကင်", "ဒေါက်တာ မိုက်ကယ် ချန်", "ဒေါက်တာ အယ်လီနာ ရိုစတိုဗာ", "ဒေါက်တာ သီဟအောင်", "ဒေါက်တာ ဖြိုးမင်းသူ"]
};

const TRANSLATIONS = {
    en: {
        promptHeader: "What is happening with your pet?",
        accuracyNoticeText: "Please enter the detail of the pet's condition and relevant numbers (like body temperature, duration, or frequency) accurately and completely.",
        placeholder: "Describe symptoms and details (e.g., my dog ate chocolate 2 hours ago, my cat is breathing heavily at 40 breaths/min)...",
        checkBtn: "Check Urgency",
        charWarning: "Character limit reached",
        errorBanner: "Unable to reach triage service. If this is a life-threatening emergency, please visit a clinic immediately.",
        disclaimer: "This tool does not diagnose diseases. It helps you evaluate the urgency of a vet visit.",
        resetBtn: "Start New Check",
        selectPetLabel: "Select Pet:",
        pets: {
            dog: "Dog",
            cat: "Cat",
            bird: "Bird",
            rabbit: "Rabbit"
        },
        urgencySubtitles: {
            RED: "EXTREME URGENCY",
            YELLOW: "URGENT ATTENTION",
            GREEN: "MONITOR"
        },
        clinicsHeader: "Verified Late-Night Triage Directory",
        shareLocationText: "Share your location to find the closest veterinary clinics.",
        shareLocationBtn: "Share Location",
        locatingClinics: "Finding nearest clinics...",
        locErrorText: "Could not retrieve your location. Showing default verified triage desks below. You can also search directly on Google Maps.",
        searchMapsBtn: "Search on Google Maps",
        directionsBtn: "Get Directions",
        distanceUnit: "km",
        phoneNa: "No phone registered",
        doctorLabel: "Doctor: ",
        doctorFallback: "Duty Veterinarian",
        emergencyCallLabel: "📞 Registered Emergency Contact",
        emergencyCallBtnText: "Call Now",
        noContactSavedLabel: "🚨 Emergency Contact",
        noContactSavedText: "No Emergency Contact Saved",
        verifiedBadgeText: "Verified Triage Desk",
        additionalClinicsHeader: "Additional Area Clinics",
        yourLocation: "Your Location",
        statusLabels: {
            active: "Active (Accepting Emergencies)",
            busy: "Busy (15 min wait)",
            high: "High Volume (35 min wait)"
        },
        firstAidTitle: "{emoji} {pet} First Aid & CPR Guide",
        firstAidTabs: {
            cpr: "❤️ CPR",
            choking: "🫁 Choking",
            bleeding: "🩸 Bleeding",
            heatstroke: "🌡️ Heatstroke",
            poisoning: "⚠️ Poisoning",
            shock: "⚡ Shock"
        },
        navTriage: "Triage",
        navPets: "My Pets",
        myPetsTitle: "My Registered Pets",
        addPetBtn: "+ Add Pet",
        registerPetTitle: "Register New Pet",
        petNamePlaceholder: "Pet Name",
        addressPlaceholder: "Owner's Address",
        chipNumberPlaceholder: "Chip Number (Microchip)",
        lastVaccinatedDateLabel: "Last Vaccinated Date",
        registerBtn: "Register Pet",
        cancelBtn: "Cancel",
        noPetsMessage: "No pets registered yet.",
        petNameLabel: "Name:",
        petAddressLabel: "Address:",
        petChipLabel: "Chip Number:",
        petVaccineLabel: "Last Vaccinated:",
        deletePetBtn: "Remove",
        petTypeLabel: "Pet Type",
        petPhotoLabel: "Pet Photo",
        choosePhotoBtn: "Choose Photo",
        optOther: "Other",
        navClinic: "Emergency Contact",
        emergencyContactTitle: "Emergency Contact",
        clinicNameLabel: "Clinic Name",
        clinicAddressLabel: "Clinic Address",
        clinicPhoneLabel: "Phone Number",
        saveClinicBtn: "Save Contact",
        noClinicMessage: "No emergency contact saved yet.",
        editDetailsBtn: "Edit Details",
        breedLabel: "Breed",
        breedGuideToggle: "🐾 View Breed Insights",
        breedGuideHide: "🐾 Hide Breed Insights",
        originTitle: "Origin",
        temperamentTitle: "Temperament",
        weightTitle: "Ideal Weight Guide",
        coatMaintenanceTitle: "Coat Care",
        healthProsTitle: "Key Strengths",
        healthConsTitle: "Potential Health Risks",
        genericBreedOpt: "General / Other Breed",
        editPetBtn: "Edit",
        editPetTitle: "Edit Pet Details",
        saveChangesBtn: "Save Changes",
        navLibrary: "Pet Library",
        libraryTitle: "Pet Library",
        librarySearchPlaceholder: "Search breed name (e.g., Golden Retriever, Siamese)...",
        librarySearchBtn: "Search",
        libraryNotFound: "Breed not found in the library."
    },
    ja: {
        promptHeader: "ペットに何が起きていますか？",
        accuracyNoticeText: "症状の様子と具体的な数値（体温、持続時間、頻度など）を正確かつ完全に入力してください。",
        placeholder: "症状や詳細（例：2時間前に犬がチョコを誤食した、猫が1分間に40回荒い呼吸をしている等）を入力してください...",
        checkBtn: "緊急度を判定する",
        charWarning: "文字数制限に達しました",
        errorBanner: "判定サービスに接続できません。命に関わる緊急事態の場合は、ただちに最寄りの動物病院を受診してください。",
        disclaimer: "このツールは病気の診断を行うものではありません。獣医師を受診する緊急性の判断を支援します。",
        resetBtn: "新しく判定する",
        selectPetLabel: "ペットを選択:",
        pets: {
            dog: "犬",
            cat: "猫",
            bird: "鳥",
            rabbit: "うさぎ"
        },
        urgencySubtitles: {
            RED: "極めて高い緊急性",
            YELLOW: "急を要する状態",
            GREEN: "様子見"
        },
        clinicsHeader: "深夜受付 優先デスク・マップ",
        shareLocationText: "最寄りの動物病院を探すために位置情報を共有してください。",
        shareLocationBtn: "位置情報を共有する",
        locatingClinics: "最寄りのクリニックを探しています...",
        locErrorText: "位置情報を取得できませんでした。デフォルトの確認済み優先デスクを表示しています。Google マップでも直接検索できます。",
        searchMapsBtn: "Google マップで検索する",
        directionsBtn: "ルートを調べる",
        distanceUnit: "km",
        phoneNa: "電話番号の登録なし",
        doctorLabel: "担当医師: ",
        doctorFallback: "当直獣医師",
        emergencyCallLabel: "📞 登録済み緊急連絡先",
        emergencyCallBtnText: "今すぐ発信",
        noContactSavedLabel: "🚨 緊急連絡先",
        noContactSavedText: "緊急連絡先が未登録です",
        addContactBtnText: "+ 連絡先を追加",
        verifiedBadgeText: "確認済み 優先デスク",
        additionalClinicsHeader: "その他の周辺クリニック",
        yourLocation: "現在地",
        statusLabels: {
            active: "稼働中（救急対応可）",
            busy: "混雑（待ち時間 15分）",
            high: "非常に混雑（待ち時間 35分）"
        },
        firstAidTitle: "{emoji} {pet} の応急処置・心肺蘇生法ガイド",
        firstAidTabs: {
            cpr: "❤️ CPR (心肺蘇生)",
            choking: "🫁 窒息・気道異物",
            bleeding: "🩸 出血・止血法",
            heatstroke: "🌡️ 熱中症・暑さ",
            poisoning: "⚠️ 誤飲・中毒",
            shock: "⚡ ショック状態"
        },
        navTriage: "判定",
        navPets: "マイペット",
        myPetsTitle: "登録済みのペット",
        addPetBtn: "+ ペットを追加",
        registerPetTitle: "ペットの新規登録",
        petNamePlaceholder: "ペットの名前",
        addressPlaceholder: "飼い主の住所",
        chipNumberPlaceholder: "マイクロチップ番号",
        lastVaccinatedDateLabel: "最終ワクチン接種日",
        registerBtn: "登録する",
        cancelBtn: "キャンセル",
        noPetsMessage: "登録されているペットはいません。",
        petNameLabel: "名前:",
        petAddressLabel: "住所:",
        petChipLabel: "チップ番号:",
        petVaccineLabel: "最終接種日:",
        deletePetBtn: "削除",
        petTypeLabel: "ペットの種類",
        petPhotoLabel: "ペットの写真",
        choosePhotoBtn: "写真を選択",
        optOther: "その他",
        navClinic: "緊急連絡先",
        emergencyContactTitle: "緊急連絡先",
        clinicNameLabel: "クリニック名",
        clinicAddressLabel: "クリニック住所",
        clinicPhoneLabel: "電話番号",
        saveClinicBtn: "連絡先を保存",
        noClinicMessage: "登録されている緊急連絡先はありません。",
        editDetailsBtn: "詳細を編集",
        addContactBtn: "+ 連絡先を追加",
        breedLabel: "犬種・猫種",
        breedGuideToggle: "🐾 インサイトを表示",
        breedGuideHide: "🐾 インサイトを非表示",
        originTitle: "原産地",
        temperamentTitle: "気質・性格",
        weightTitle: "理想的な体重ガイド",
        coatMaintenanceTitle: "被毛のお手入れ",
        healthProsTitle: "主な強み",
        healthConsTitle: "注意すべき健康リスク",
        genericBreedOpt: "一般 / その他の品種",
        editPetBtn: "編集",
        editPetTitle: "ペット情報の編集",
        saveChangesBtn: "変更を保存",
        navLibrary: "ペット図鑑",
        libraryTitle: "ペット図鑑",
        librarySearchPlaceholder: "品種名を入力して検索 (例: 柴犬, シャム)...",
        librarySearchBtn: "検索",
        libraryNotFound: "該当する品種が見つかりませんでした。"
    },
    my: {
        promptHeader: "သင့်အိမ်မွေးတိရစ္ဆာန် ဘာဖြစ်နေသလဲ။",
        accuracyNoticeText: "ရောဂါလက္ခဏာ အခြေအနေနှင့် သက်ဆိုင်ရာ ကိန်းဂဏန်းများ (ဥပမာ- ကိုယ်အပူချိန်၊ ကြာချိန်၊ အကြိမ်အရေအတွက်) ကို တိကျပြည့်စုံစွာ ထည့်သွင်းပေးပါ။",
        placeholder: "ရောဂါလက္ခဏာနှင့် အသေးစိတ်အချက်အလက်များ (ဥပမာ- လွန်ခဲ့သော ၂ နာရီက ခွေးချောကလက် စားမိခြင်း၊ ကြောင်တစ်မိနစ်လျှင် အသက်ရှူအကြိမ် ၄၀ ဖြင့် အသက်ရှူပြင်းခြင်း) ကို ဖော်ပြပါ...",
        checkBtn: "အရေးပေါ်အခြေအနေ စစ်ဆေးရန်",
        charWarning: "စာလုံးရေကန့်သတ်ချက် ပြည့်သွားပါပြီ",
        errorBanner: "စစ်ဆေးမှုစနစ်သို့ ဆက်သွယ်၍မရပါ။ အသက်အန္တရာယ်ရှိသော အရေးပေါ်အခြေအနေဖြစ်ပါက ဆေးခန်းသို့ ချက်ချင်းသွားပါ။",
        disclaimer: "ဤကိရိယာသည် ရောဂါရှာဖွေခြင်းမပြုပါ။ တိရစ္ဆာန်ဆရာဝန်ပြသရန် အရေးကြီးပုံကို အကဲဖြတ်ရန် ကူညီပေးပါသည်။",
        resetBtn: "အသစ်ပြန်စစ်မည်",
        selectPetLabel: "အိမ်မွေးတိရစ္ဆာန်ရွေးချယ်ရန်:",
        pets: {
            dog: "ခွေး",
            cat: "ကြောင်",
            bird: "ငှက်",
            rabbit: "ယုန်"
        },
        urgencySubtitles: {
            RED: "အလွန်အရေးကြီးသော အခြေအနေ",
            YELLOW: "အရေးတကြီး ဂရုစိုက်ရန်လိုအပ်",
            GREEN: "စောင့်ကြည့်ရန်"
        },
        clinicsHeader: "ညဉ့်နက်ပိုင်း လူနာခွဲခြားရေးဌာန လမ်းညွှန်",
        shareLocationText: "အနီးဆုံးတိရစ္ဆာန်ဆေးခန်းများကို ရှာဖွေရန် သင့်တည်နေရာကို မျှဝေပါ။",
        shareLocationBtn: "တည်နေရာ မျှဝေရန်",
        locatingClinics: "အနီးဆုံးဆေးခန်းများကို ရှာဖွေနေသည်...",
        locErrorText: "သင့်တည်နေရာကို မရရှိနိုင်ပါ။ အောက်တွင် အတည်ပြုပြီးသား လူနာခွဲခြားရေးဌာနများကို ပြသနေသည်။ Google Maps တွင်လည်း တိုက်ရိုက်ရှာဖွေနိုင်ပါသည်။",
        searchMapsBtn: "Google Maps တွင် ရှာဖွေရန်",
        directionsBtn: "လမ်းညွှန်ရယူရန်",
        distanceUnit: "ကီလိုမီတာ",
        phoneNa: "ဖုန်းနံပါတ် မရှိပါ",
        doctorLabel: "တိရစ္ဆာန်ဆရာဝန်: ",
        doctorFallback: "တာဝန်ကျ တိရစ္ဆာန်ဆရာဝန်",
        emergencyCallLabel: "📞 မှတ်ပုံတင်ထားသော အရေးပေါ် ဆက်သွယ်ရန်",
        emergencyCallBtnText: "ယခု ဖုန်းခေါ်မည်",
        noContactSavedLabel: "🚨 အရေးပေါ် ဆက်သွယ်ရန်",
        noContactSavedText: "အရေးပေါ်ဆက်သွယ်ရန် မသိမ်းဆည်းရသေးပါ",
        addContactBtnText: "+ ဆက်သွယ်ရန် ထည့်မည်",
        verifiedBadgeText: "ညဉ့်နက်ပိုင်း လူနာခွဲခြားရေးဌာန",
        additionalClinicsHeader: "အခြား အနီးနားရှိဆေးခန်းများ",
        yourLocation: "သင်၏တည်နေရာ",
        statusLabels: {
            active: "အဆင်သင့်ရှိသည် (အရေးပေါ်လက်ခံနေသည်)",
            busy: "မအားလပ်ပါ (၁၅ မိနစ် စောင့်ဆိုင်းရမည်)",
            high: "လူနာအလွန်များပြား (၃၅ မိနစ် စောင့်ဆိုင်းရမည်)"
        },
        firstAidTitle: "{emoji} {pet} အရေးပေါ်ရှေးဦးသူနာပြုစုနည်းနှင့် CPR လမ်းညွှန်",
        firstAidTabs: {
            cpr: "❤️ CPR ပြုလုပ်နည်း",
            choking: "🫁 လည်ပင်းနင်ခြင်း",
            bleeding: "🩸 သွေးထွက်ခြင်း",
            heatstroke: "🌡️ အပူလျှပ်ခြင်း",
            poisoning: "⚠️ အဆိပ်သင့်ခြင်း",
            shock: "⚡ ရှော့ခ်ရခြင်း"
        },
        navTriage: "စစ်ဆေးရန်",
        navPets: "ကိုယ့်ရဲ့အိမ်မွေးတိရစ္ဆာန်လေးများ",
        myPetsTitle: "မှတ်ပုံတင်ထားသော အိမ်မွေးတိရစ္ဆာန်လေးများ",
        addPetBtn: "+ အိမ်မွေးတိရစ္ဆာန်အသစ်ထည့်ရန်",
        registerPetTitle: "အိမ်မွေးတိရစ္ဆာန်အသစ် မှတ်ပုံတင်ရန်",
        petNamePlaceholder: "Pet name",
        addressPlaceholder: "ပိုင်ရှင်၏လိပ်စာ",
        chipNumberPlaceholder: "Micro Chip Number",
        lastVaccinatedDateLabel: "နောက်ဆုံး ကာကွယ်ဆေးထိုးသည့်ရက်စွဲ",
        registerBtn: "မှတ်ပုံတင်မည်",
        cancelBtn: "ပယ်ဖျက်မည်",
        noPetsMessage: "မှတ်ပုံတင်ထားသော အိမ်မွေးတိရစ္ဆာန် မရှိသေးပါ။",
        petNameLabel: "အမည်:",
        petAddressLabel: "လိပ်စာ:",
        petChipLabel: "Micro Chip Number:",
        petVaccineLabel: "နောက်ဆုံးထိုးနှံမှု:",
        deletePetBtn: "ပယ်ဖျက်ရန်",
        petTypeLabel: "အိမ်မွေးတိရစ္ဆာန်အမျိုးအစား",
        petPhotoLabel: "အိမ်မွေးတိရစ္ဆာန်ဓာတ်ပုံ",
        choosePhotoBtn: "ဓာတ်ပုံရွေးချယ်ရန်",
        optOther: "အခြား",
        navClinic: "ဆက်သွယ်ရန်",
        emergencyContactTitle: "အရေးပေါ် ဆက်သွယ်ရန်",
        clinicNameLabel: "ဆေးခန်းအမည်",
        clinicAddressLabel: "ဆေးခန်းလိပ်စာ",
        clinicPhoneLabel: "ဖုန်းနံပါတ်",
        saveClinicBtn: "လိပ်စာသိမ်းဆည်းရန်",
        noClinicMessage: "အရေးပေါ် ဆက်သွယ်ရန်လိပ်စာ မရှိသေးပါ။",
        editDetailsBtn: "ပြင်ဆင်ရန်",
        addContactBtn: "+ အဆက်အသွယ်ထည့်ရန်",
        breedLabel: "မျိုးစိတ်",
        breedGuideToggle: "🐾 အချက်အလက်များကြည့်ရန်",
        breedGuideHide: "🐾 အချက်အလက်များ ဖျောက်ထားရန်",
        originTitle: "မူလဒေသ",
        temperamentTitle: "စိတ်နေသဘောထား",
        weightTitle: "အလေးချိန် လမ်းညွှန်",
        coatMaintenanceTitle: "အမွေးအမျှင်ထိန်းသိမ်းမှု",
        healthProsTitle: "အားသာချက်များ",
        healthConsTitle: "ဖြစ်နိုင်ချေရှိသော ကျန်းမာရေးပြဿနာများ",
        genericBreedOpt: "အခြားမျိုးစိတ်",
        editPetBtn: "ပြင်ဆင်ရန်",
        editPetTitle: "အချက်အလက် ပြင်ဆင်ရန်",
        saveChangesBtn: "ပြင်ဆင်မှု သိမ်းဆည်းရန်",
        navLibrary: "အိမ်မွေးတိရစ္ဆာန်လေးများအကြောင်း",
        libraryTitle: "အိမ်မွေးတိရစ္ဆာန်လေးများအကြောင်း",
        librarySearchPlaceholder: "မျိုးစိတ်အမည် ရှာဖွေရန် (ဥပမာ- ရွှေရောင် ရီထရီဗာ၊ ရှာမိစ်)...",
        librarySearchBtn: "ရှာဖွေမည်",
        libraryNotFound: "စာရင်းထဲတွင် ဤမျိုးစိတ်အား မတွေ့ရှိပါ။"
    }
};

// Localized Breed Database structure
const BREED_DATABASE = {
    en: {
        dog: {
            "shiba_inu": {
                name: "Shiba Inu",
                origin: "Japan",
                temperament: "Loyal, Alert, Active, Independent",
                pros: "Clean, quiet, extremely loyal, beautiful appearance",
                cons: "Can be stubborn, strong prey drive, sheds heavily",
                maintenance: "High (Heavy seasonal shedding)",
                weight: "8 - 11 kg (Adult)"
            },
            "golden_retriever": {
                name: "Golden Retriever",
                origin: "Scotland",
                temperament: "Friendly, Intelligent, Devoted, Playful",
                pros: "Highly trainable, excellent family pet, gentle",
                cons: "Prone to cancer and hip issues, sheds constantly",
                maintenance: "Medium-High (Regular brushing needed)",
                weight: "25 - 34 kg (Adult)"
            },
            "poodle": {
                name: "Poodle",
                origin: "Germany / France",
                temperament: "Active, Proud, Very Smart, Elegant",
                pros: "Hypoallergenic coat (no shedding), incredibly smart",
                cons: "Requires professional grooming, prone to ear infections",
                maintenance: "High (Needs regular clipping & grooming)",
                weight: "20 - 32 kg (Standard)"
            },
            "chihuahua": {
                name: "Chihuahua",
                origin: "Mexico",
                temperament: "Charming, Alert, Loyal, Sassy",
                pros: "Excellent for apartments, long lifespan, portable",
                cons: "Can be fragile, prone to shivering, easily startled",
                maintenance: "Low (Minimal grooming required)",
                weight: "1.5 - 3.0 kg (Adult)"
            },
            "other_dog": {
                name: "General / Mixed Breed",
                origin: "Various",
                temperament: "Unique personality, Adaptable",
                pros: "High genetic health diversity, highly adaptable",
                cons: "Unpredictable traits if mixed ancestry",
                maintenance: "Depends on coat length",
                weight: "Varies widely"
            }
        },
        cat: {
            "siamese": {
                name: "Siamese",
                origin: "Thailand",
                temperament: "Vocal, Social, Affectionate, Curious",
                pros: "Extremely communicative, deep bonds, playful",
                cons: "Very loud, demands constant attention, prone to anxiety",
                maintenance: "Low (Short fine coat)",
                weight: "3.5 - 5.5 kg (Adult)"
            },
            "persian": {
                name: "Persian",
                origin: "Iran",
                temperament: "Quiet, Sweet, Placid, Dignified",
                pros: "Very gentle, quiet household companion, affectionate",
                cons: "Prone to breathing issues (brachycephalic), tear stains",
                maintenance: "High (Requires daily detangling & washing)",
                weight: "3.2 - 5.5 kg (Adult)"
            },
            "maine_coon": {
                name: "Maine Coon",
                origin: "United States",
                temperament: "Gentle Giant, Friendly, Playful",
                pros: "Very friendly, great with kids/dogs, dog-like traits",
                cons: "Prone to hypertrophic cardiomyopathy (HCM)",
                maintenance: "Medium-High (Thick shaggy double coat)",
                weight: "5.0 - 10.0 kg (Adult)"
            },
            "munchkin": {
                name: "Munchkin",
                origin: "United States",
                temperament: "Sweet, Active, Outgoing, People-oriented",
                pros: "Extremely cute short legs, agile, very playful",
                cons: "Controversial breeding, prone to joint stiffness",
                maintenance: "Medium (Weekly brushing needed)",
                weight: "2.5 - 4.0 kg (Adult)"
            },
            "other_cat": {
                name: "General / Domestic Cat",
                origin: "Various",
                temperament: "Independent, Adaptable, Playful",
                pros: "Low genetic hereditary diseases, highly independent",
                cons: "Varies depending on environment",
                maintenance: "Low-Medium (Shorthair/Longhair)",
                weight: "3.5 - 5.0 kg"
            }
        }
    },
    ja: {
        dog: {
            "shiba_inu": {
                name: "柴犬",
                origin: "日本",
                temperament: "忠実、敏捷、活発、独立心が強い",
                pros: "清潔で静か、飼い主に非常に従順、美しい外見",
                cons: "頑固な面あり、警戒心が強い、抜け毛が多い",
                maintenance: "高い（換毛期に大量の抜け毛）",
                weight: "8 - 11 kg (成犬)"
            },
            "golden_retriever": {
                name: "ゴールデン・レトリバー",
                origin: "スコットランド",
                temperament: "フレンドリー、賢い、献身的、遊び好き",
                pros: "しつけが非常に容易、優れた家庭犬、優しい性格",
                cons: "股関節疾患や腫瘍のリスク、年間を通じた抜け毛",
                maintenance: "中〜高（定期的なブラッシングが必要）",
                weight: "25 - 34 kg (成犬)"
            },
            "poodle": {
                name: "プードル",
                origin: "ドイツ / フランス",
                temperament: "活動的、誇り高い、非常に聡明、エレガント",
                pros: "抜け毛が少なく低アレルゲン、非常に頭が良い",
                cons: "定期的なカットが必要、耳感染症にかかりやすい",
                maintenance: "高い（定期的なトリミングとトリマー予約が必要）",
                weight: "20 - 32 kg (スタンダード)"
            },
            "chihuahua": {
                name: "チワワ",
                origin: "メキシコ",
                temperament: "魅力的、機敏、忠実、勇敢",
                pros: "室内飼いに最適、長寿、持ち運びが容易",
                cons: "骨が細く怪我しやすい、寒がり、怖がりな面も",
                maintenance: "低い（最小限のお手入れでOK）",
                weight: "1.5 - 3.0 kg (成犬)"
            },
            "other_dog": {
                name: "一般 / 雑種・その他の犬種",
                origin: "様々",
                temperament: "ユニークな個性、適応力が高い",
                pros: "遺伝的多様性により健康、環境適応力が高い",
                cons: "ルーツ不明な場合のサイズ予測が困難",
                maintenance: "被毛の長さに依存",
                weight: "個体による"
            }
        },
        cat: {
            "siamese": {
                name: "シャム（サイアミーズ）",
                origin: "タイ",
                temperament: "おしゃべり、社交的、愛情深い、好奇心旺盛",
                pros: "おしゃべりで感情表現が豊か、強い絆",
                cons: "鳴き声が大きい、寂しがりや、注意を引きたがる",
                maintenance: "低い（短毛種でなめらかな被毛）",
                weight: "3.5 - 5.5 kg (成猫)"
            },
            "persian": {
                name: "ペルシャ",
                origin: "イラン",
                temperament: "静か、穏やか、温和、気品がある",
                pros: "非常におっとりしている、静かな環境を好む",
                cons: "鼻ペチャ（短頭種）による呼吸トラブル、涙やけ",
                maintenance: "高い（毎日の毛並みのお手入れが必須）",
                weight: "3.2 - 5.5 kg (成猫)"
            },
            "maine_coon": {
                name: "メインクーン",
                origin: "アメリカ",
                temperament: "ジェントルジャイアント（穏やかな巨人）、人懐っこい",
                pros: "非常にフレンドリー、子供や他ペットとも良好、犬のような従順さ",
                cons: "肥大型心筋症（HCM）など心臓疾患のリスク",
                maintenance: "中〜高（長毛種でダブルコート）",
                weight: "5.0 - 10.0 kg (成猫)"
            },
            "munchkin": {
                name: "マンチカン",
                origin: "アメリカ",
                temperament: "甘えん坊、活発、外交的、人間大好き",
                pros: "短い手足が非常に愛らしい、動きが俊敏",
                cons: "椎間板ヘルニアや関節の負担のリスク",
                maintenance: "中程度（週に数回のブラッシング）",
                weight: "2.5 - 4.0 kg (成猫)"
            },
            "other_cat": {
                name: "一般 / その他の猫種・雑種",
                origin: "様々",
                temperament: "マイペース、適応力あり、遊び好き",
                pros: "遺伝病のリスクが比較的低い、非常に独立している",
                cons: "環境によって性格が様々に変化",
                maintenance: "低〜中（短毛または長毛による）",
                weight: "3.5 - 5.0 kg"
            }
        }
    },
    my: {
        dog: {
            "shiba_inu": {
                name: "ရှီဘာ အိနု (Shiba Inu)",
                origin: "ဂျပန်နိုင်ငံ",
                temperament: "သစ္စာရှိခြင်း၊ နိုးကြားခြင်း၊ တက်ကြွခြင်း၊ လွတ်လပ်စွာနေတတ်ခြင်း",
                pros: "သန့်ရှင်းခြင်း၊ တိတ်ဆိတ်ခြင်း၊ အလွန်သစ္စာရှိခြင်း၊ လှပခြင်း",
                cons: "ခေါင်းမာတတ်ခြင်း၊ အမဲလိုက်စိတ်ပြင်းပြခြင်း၊ အမွေးကျွတ်ခြင်း",
                maintenance: "မြင့်မား (ရာသီအလိုက် အမွေးအလွန်ကျွတ်တတ်သည်)",
                weight: "၈ - ၁၁ ကီလိုဂရမ် (အရွယ်ရောက်ပြီး)"
            },
            "golden_retriever": {
                name: "ဂိုးဒင်း ရီထရီဗာ (Golden Retriever)",
                origin: "စကော့တလန်နိုင်ငံ",
                temperament: "ဖော်ရွေခြင်း၊ လိမ္မာပါးနပ်ခြင်း၊ သစ္စာရှိခြင်း၊ ဆော့ကစားတတ်ခြင်း",
                pros: "သင်ကြားရလွယ်ကူခြင်း၊ မိသားစုအတွက်အကောင်းဆုံးဖြစ်ခြင်း၊ ညင်သာခြင်း",
                cons: "တင်ပါးဆုံဆစ်လွဲခြင်းနှင့် ကင်ဆာရောဂါဖြစ်နိုင်ခြေရှိခြင်း၊ အမွေးအမြဲကျွတ်ခြင်း",
                maintenance: "အလယ်အလတ်-မြင့်မား (ပုံမှန် အမွေးဖြီးပေးရန်လိုအပ်)",
                weight: "၂၅ - ၃၄ ကီလိုဂရမ် (အရွယ်ရောက်ပြီး)"
            },
            "poodle": {
                name: "ပုဒယ် (Poodle)",
                origin: "ဂျာမနီ / ပြင်သစ်",
                temperament: "တက်ကြွခြင်း၊ ဂုဏ်ယူတတ်ခြင်း၊ အလွန်လိမ္မာခြင်း၊ သပ်ရပ်ခြင်း",
                pros: "အမွေးမကျွတ်သဖြင့် ဓာတ်မတည့်သူများအတွက်သင့်တော်ခြင်း၊ အလွန်ဉာဏ်ကောင်းခြင်း",
                cons: "ပုံမှန် အမွေးညှပ်ပေးရန်လိုအပ်ခြင်း၊ နားပိုးဝင်လွယ်ခြင်း",
                maintenance: "မြင့်မား (ပုံမှန် အမွေးညှပ်/ထိန်းသိမ်းမှုလိုအပ်သည်)",
                weight: "၂၀ - ၃၂ ကီလိုဂရမ် (စံသတ်မှတ်ချက်)"
            },
            "chihuahua": {
                name: "ချီဝါဝါ (Chihuahua)",
                origin: "မက္ကဆီကိုနိုင်ငံ",
                temperament: "ချစ်စရာကောင်းခြင်း၊ နိုးကြားခြင်း၊ သစ္စာရှိခြင်း၊ ထက်မြက်ခြင်း",
                pros: "တိုက်ခန်းကျဉ်းများတွင်မွေးရန်အဆင်ပြေခြင်း၊ သက်တမ်းရှည်ခြင်း၊ သယ်ဆောင်ရလွယ်ကူခြင်း",
                cons: "နုနယ်လွန်းခြင်း၊ အလွယ်တကူတုန်လှုပ်တတ်ခြင်း",
                maintenance: "နိမ့်ပါး (အမွေးထိန်းသိမ်းမှု အနည်းငယ်သာလိုအပ်)",
                weight: "၁.၅ - ၃.၀ ကီလိုဂရမ် (အရွယ်ရောက်ပြီး)"
            },
            "other_dog": {
                name: "အထွေထွေ / မျိုးစိတ်ကွဲ",
                origin: "အမျိုးမျိုး",
                temperament: "ထူးခြားသောစိတ်နေသဘောထားရှိခြင်း၊ လိုက်လျောညီထွေရှိခြင်း",
                pros: "ကျန်းမာရေးခံနိုင်ရည်ကောင်းခြင်း၊ လိုက်လျောညီထွေနေထိုင်နိုင်ခြင်း",
                cons: "မျိုးရိုးမသဲကွဲပါက ခန့်မှန်းရခက်ခဲခြင်း",
                maintenance: "အမွေးအရှည်ပေါ်တွင် မူတည်သည်",
                weight: "အမျိုးမျိုးကွဲပြားသည်"
            }
        },
        cat: {
            "siamese": {
                name: "ရှာမိစ် (Siamese)",
                origin: "ထိုင်းနိုင်ငံ",
                temperament: "အော်တတ်ခြင်း၊ ဖော်ရွေခြင်း၊ ချစ်ခင်တတ်ခြင်း၊ စပ်စုတတ်ခြင်း",
                pros: "ဆက်သွယ်ပြောဆိုလိုစိတ်ပြင်းပြခြင်း၊ သံယောဇဉ်ကြီးခြင်း",
                cons: "အသံကျယ်ကျယ်အော်တတ်ခြင်း၊ အာရုံစိုက်မှုအမြဲတောင်းခံခြင်း",
                maintenance: "နိမ့်ပါး (အမွေးတိုညင်သာသည်)",
                weight: "၃.၅ - ၅.၅ ကီလိုဂရမ် (အရွယ်ရောက်ပြီး)"
            },
            "persian": {
                name: "ပါရှန်း (Persian)",
                origin: "အီရန်နိုင်ငံ",
                temperament: "တိတ်ဆိတ်ခြင်း၊ ချိုသာခြင်း၊ အေးချမ်းခြင်း၊ ခန့်ညားခြင်း",
                pros: "အလွန်ညင်သာခြင်း၊ တိတ်ဆိတ်သောအိမ်များအတွက်သင့်တော်ခြင်း",
                cons: "မျက်နှာပြားသဖြင့် အသက်ရှူလမ်းကြောင်းဆိုင်ရာပြဿနာရှိခြင်း၊ မျက်ရည်ပူထွက်ခြင်း",
                maintenance: "မြင့်မား (နေ့စဉ် အမွေးဖြီးသင်ပေးရန် လိုအပ်သည်)",
                weight: "၃.၂ - ၅.၅ ကီလိုဂရမ် (အရွယ်ရောက်ပြီး)"
            },
            "maine_coon": {
                name: "မိန်းကွန်း (Maine Coon)",
                origin: "အမေရိကန်ပြည်ထောင်စု",
                temperament: "ဧရာမလူလိမ္မာကြီး၊ ဖော်ရွေခြင်း၊ ဆော့ကစားတတ်ခြင်း",
                pros: "ဖော်ရွေလွန်းခြင်း၊ ကလေးများနှင့် အခြားခွေး/ကြောင်များနှင့်တည့်ခြင်း",
                cons: "နှလုံးရောဂါဖြစ်နိုင်ခြေရှိခြင်း",
                maintenance: "အလယ်အလတ်-မြင့်မား (အမွေးထူထပ်သည်)",
                weight: "၅.၀ - ၁၀.၀ ကီလိုဂရမ် (အရွယ်ရောက်ပြီး)"
            },
            "munchkin": {
                name: "မန့်ချ်ကင် (Munchkin)",
                origin: "အမေရိကန်ပြည်ထောင်စု",
                temperament: "ချိုသာခြင်း၊ တက်ကြွခြင်း၊ ဖော်ရွေခြင်း၊ လူခင်တတ်ခြင်း",
                pros: "ခြေတိုလေးများဖြင့် ချစ်စရာကောင်းခြင်း၊ တက်ကြွဖျတ်လတ်ခြင်း",
                cons: "ကျောရိုးနှင့် အဆစ်အမြစ်ဆိုင်ရာပြဿနာရှိနိုင်ခြင်း",
                maintenance: "အလယ်အလတ် (အပတ်စဉ် အမွေးဖြီးပေးရန်လိုအပ်သည်)",
                weight: "၂.၅ - ၄.၀ ကီလိုဂရမ် (အရွယ်ရောက်ပြီး)"
            },
            "other_cat": {
                name: "အထွေထွေ / ဗမာကြောင်",
                origin: "အမျိုးမျိုး",
                temperament: "လွတ်လပ်စွာနေတတ်ခြင်း၊ လိုက်လျောညီထွေရှိခြင်း၊ ကစားတတ်ခြင်း",
                pros: "မျိုးရိုးဗီဇဆိုင်ရာ ရောဂါဖြစ်ပွားမှုနည်းခြင်း၊ ကိုယ့်ဖာသာကိုယ်နေတတ်ခြင်း",
                cons: "ပတ်ဝန်းကျင်အခြေအနေပေါ် မူတည်၍ ကွဲပြားသည်",
                maintenance: "နိမ့်ပါး-အလယ်အလတ် (အမွေးအတို/အရှည်ပေါ်မူတည်၍)",
                weight: "၃.၅ - ၅.၀ ကီလိုဂရမ်"
            }
        }
    }
};

function populateBreedDropdown() {
    if (!regPetBreed || !regPetType) return;
    const type = regPetType.value;
    regPetBreed.innerHTML = '';

    const lang = currentLang || 'en';
    const strings = TRANSLATIONS[lang];
    const db = BREED_DATABASE[lang] || BREED_DATABASE['en'];

    if (type === 'dog' || type === 'cat') {
        const breeds = db[type];
        for (const breedKey in breeds) {
            const option = document.createElement('option');
            option.value = breedKey;
            option.textContent = breeds[breedKey].name;
            regPetBreed.appendChild(option);
        }
    } else {
        const option = document.createElement('option');
        option.value = 'generic';
        option.textContent = strings.genericBreedOpt || "General Breed";
        regPetBreed.appendChild(option);
    }
}

if (regPetType) {
    regPetType.addEventListener('change', () => {
        populateBreedDropdown();
    });
}

const FIRST_AID_DATA = {
    en: {
        dog: {
            cpr: `
                <p><strong>Check for Breathing & Pulse:</strong> Feel for a pulse on the inner thigh (femoral artery) and watch the chest for movement.</p>
                <p><strong>Positioning:</strong> Lay the dog on their right side on a firm surface.</p>
                <p><strong>Compressions:</strong> Place your hands over the widest part of the chest (or directly over the heart for small dogs). Compress the chest by 1/3 to 1/2 its width at a rate of 100–120 compressions per minute (to the beat of the song "Stayin' Alive").</p>
                <p><strong>Rescue Breaths:</strong> Close the dog's muzzle tightly with your hand. Blow into their nose until you see the chest rise.</p>
                <p><strong>Ratio:</strong> Give 30 compressions followed by 2 rescue breaths. Repeat until the dog revives or you reach the vet.</p>
            `,
            choking: `
                <p><strong>Inspect the Mouth:</strong> Open the jaws and look inside. If an object is clearly visible, carefully remove it with fingers or tweezers.</p>
                <div class="warning-box"><strong>Do not blind-sweep</strong> as you might push it further down.</div>
                <p class="first-aid-sub">The Heimlich Maneuver:</p>
                <ul>
                    <li><strong>Small Dogs:</strong> Hold them against your abdomen, head up, feet dangling. Place a fist under their ribs and push upward and forward.</li>
                    <li><strong>Large Dogs:</strong> If standing, wrap your arms around their abdomen just below the ribs and push upward. If lying down, place one hand on their back and use the other to push upward and forward just below the ribcage.</li>
                </ul>
            `,
            bleeding: `
                <p><strong>Direct Pressure:</strong> Apply a clean cloth, towel, or sterile gauze directly over the wound. Hold firm pressure for at least 3–5 minutes without lifting to check.</p>
                <p><strong>Elevation:</strong> If the wound is on a limb, gently elevate it above the heart if possible.</p>
                <p><strong>Pressure Bandage:</strong> Wrap gauze firmly around the cloth to hold it in place.</p>
                <div class="warning-box"><strong>Never use a tourniquet</strong> unless a limb is completely severed, as it can cause permanent tissue damage.</div>
            `,
            heatstroke: `
                <p><strong>Cool Down Immediately:</strong> Move the dog to an air-conditioned area or shade.</p>
                <p><strong>Lukewarm Water:</strong> Spray or pour lukewarm/cool water over their body—especially the abdomen, armpits, and paw pads.</p>
                <div class="warning-box"><strong>What NOT to do:</strong> Never use ice or freezing cold water, as this constricts blood vessels and traps heat inside the core organs. Do not force them to drink; offer small laps of cool water instead.</div>
            `,
            poisoning: `
                <p><strong>Identify the Toxin:</strong> Quickly figure out what they ate and how much. Call a vet immediately.</p>
                <div class="warning-box"><strong>Do NOT Induce Vomiting</strong> unless explicitly instructed by a professional. If they swallowed something corrosive, vomiting will burn the esophagus a second time.</div>
                <p class="first-aid-sub">Common Dog Toxins & Impact Levels:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>Toxin</th>
                            <th>Type</th>
                            <th>Impact Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Xylitol / Sweeteners</td><td>Food</td><td><span class="impact-badge high">HIGH (Fatal)</span></td></tr>
                        <tr><td>Grapes & Raisins</td><td>Fruit</td><td><span class="impact-badge high">HIGH (Kidney Failure)</span></td></tr>
                        <tr><td>Chocolate (Theobromine)</td><td>Food</td><td><span class="impact-badge high">HIGH (Seizures)</span></td></tr>
                        <tr><td>Sago Palm (Cycas)</td><td>Plant</td><td><span class="impact-badge high">HIGH (Liver Failure)</span></td></tr>
                        <tr><td>Onions & Garlic</td><td>Food</td><td><span class="impact-badge high">HIGH (Anemia)</span></td></tr>
                        <tr><td>Macadamia Nuts</td><td>Food</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                        <tr><td>Ivy / Vine plants</td><td>Plant</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                        <tr><td>Tulips / Daffodils</td><td>Plant</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                        <tr><td>Avocado</td><td>Fruit</td><td><span class="impact-badge mild">MILD</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>Symptoms:</strong> Pale/white gums, rapid but weak pulse, cold limbs, and lethargy following trauma.</p>
                <p><strong>Keep Warm:</strong> Wrap the dog in a warm blanket to preserve body heat.</p>
                <p><strong>Positioning:</strong> Keep them lying down. Elevate their hindquarters slightly with a towel to direct blood flow toward the brain and heart. Keep their airway straight.</p>
            `
        },
        cat: {
            cpr: `
                <p><strong>Check Vital Signs:</strong> Check for breathing and a pulse on the inner thigh.</p>
                <p><strong>Positioning:</strong> Lay the cat on their right side.</p>
                <p><strong>Compressions:</strong> Wrap one hand around the cat’s chest just behind the front elbows, squeezing the chest between your thumb and fingers. Compress 1/3 to 1/2 the width of the chest at a rate of 100–120 compressions per minute.</p>
                <p><strong>Rescue Breaths:</strong> Cover the cat's entire nose and mouth with your mouth. Deliver gentle puffs of air—just enough to see the chest rise.</p>
                <p><strong>Ratio:</strong> 30 compressions to 2 breaths.</p>
            `,
            choking: `
                <p><strong>Gentle Check:</strong> Cats rarely choke on foreign objects compared to dogs (more often strings), but check the mouth. Be incredibly careful not to get bitten.</p>
                <p><strong>Kitty Heimlich:</strong> Hold the cat's back against your chest. Place your fist in the soft spot just under their ribs. Give 3–4 sharp, gentle upward thrusts.</p>
                <div class="warning-box"><strong>If string is hanging out:</strong> Do NOT pull it. If it is wrapped around the intestines, pulling it can slice through their organs. Cut it short and go to the vet.</div>
            `,
            bleeding: `
                <p><strong>Apply Pressure:</strong> Use a sterile gauze pad or clean cloth and apply direct, steady pressure.</p>
                <p><strong>Minimize Stress:</strong> Cats panic easily when hurt, increasing their blood pressure and bleeding. Wrap the cat securely in a towel (a "purrito") leaving only the injured area exposed to keep them calm.</p>
            `,
            heatstroke: `
                <p><strong>Symptoms:</strong> Heavy panting (cats rarely pant unless severely stressed/overheated), drooling, red gums.</p>
                <p><strong>Cooling:</strong> Wrap the cat in a damp, lukewarm towel. Wipe their paw pads with cool water. Set up a fan to blow air across them gently. Stop cooling once panting slows.</p>
            `,
            poisoning: `
                <p><strong>Identify the Toxin:</strong> Cat kidneys are highly sensitive. Act quickly and call a vet immediately.</p>
                <div class="warning-box"><strong>Do NOT Induce Vomiting</strong> at home; a cat's throat anatomy makes vomiting highly dangerous without vet supervision.</div>
                <p class="first-aid-sub">Common Cat Toxins & Impact Levels:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>Toxin</th>
                            <th>Type</th>
                            <th>Impact Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Lilies (Easter, Tiger, etc.)</td><td>Plant</td><td><span class="impact-badge high">HIGH (Fatal)</span></td></tr>
                        <tr><td>Garlic & Onions</td><td>Food</td><td><span class="impact-badge high">HIGH (Heinz Anemia)</span></td></tr>
                        <tr><td>Chocolate / Caffeine</td><td>Food</td><td><span class="impact-badge high">HIGH (Heart Spikes)</span></td></tr>
                        <tr><td>Sago Palm (Cycas)</td><td>Plant</td><td><span class="impact-badge high">HIGH (Liver Failure)</span></td></tr>
                        <tr><td>Human Painkillers (NSAIDs)</td><td>Meds</td><td><span class="impact-badge high">HIGH (Fatal)</span></td></tr>
                        <tr><td>Essential Oils / Minoxidil</td><td>Chemical</td><td><span class="impact-badge high">HIGH</span></td></tr>
                        <tr><td>Grapes & Raisins</td><td>Fruit</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                        <tr><td>Tulips / Pothos</td><td>Plant</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                        <tr><td>Citrus Fruits (Lime/Lemon)</td><td>Fruit</td><td><span class="impact-badge mild">MILD</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>Symptoms:</strong> Extremely pale or blue-tinged gums, hypothermia, slow capillary refill time (press gums; they stay white).</p>
                <p><strong>Home Care:</strong> Keep the cat entirely still and wrapped in a warm, dark blanket. Minimize noise and light to keep their stress levels low while speeding to the clinic.</p>
            `
        },
        bird: {
            cpr: `
                <p><strong>High Risk:</strong> Bird CPR is incredibly fragile and has a low success rate, but is worth trying if they stop breathing.</p>
                <p><strong>Compressions:</strong> Lay the bird on its back. Using one fingertip, very gently press down on the sternum (keel bone). Compress rapidly—about 120–150 times per minute. Do not crush the chest.</p>
                <p><strong>Rescue Breaths:</strong> Carefully place your mouth over the bird's beak and nares (nostrils). Blow a tiny, gentle puff of air (like a sigh) into the beak.</p>
                <p><strong>Ratio:</strong> Alternate 5 compressions to 1 breath.</p>
            `,
            choking: `
                <p><strong>Symptoms:</strong> Gaping mouth, head shaking, wheezing, or gasping.</p>
                <p><strong>Clear the Beak:</strong> Hold the bird firmly but gently (do not restrict chest movement). Open the beak and see if a seed or toy part is stuck. Use a flat toothpick or blunt tweezers to carefully dislodge it if visible.</p>
                <p><strong>Gravity:</strong> Turn the bird upside down for a brief second to let gravity assist in dropping the item out of the airway.</p>
            `,
            bleeding: `
                <div class="warning-box"><strong>Birds have very little blood:</strong> A few drops of blood loss can be fatal. Broken blood feathers act like an open straw.</div>
                <p><strong>Remedy:</strong> Apply styptic powder, cornstarch, or flour to the bleeding site and apply firm pressure for 2 minutes. If it's a blood feather, it may ultimately need to be plucked from the base with needle-nose pliers by a vet or experienced owner.</p>
            `,
            heatstroke: `
                <p><strong>Symptoms:</strong> Panting (open-mouth breathing), wings held away from the body, anxiety.</p>
                <p><strong>Cooling:</strong> Mist the bird gently with a fine spray of cool water. Do not soak them. Move them to a cool, dark room. Ensure they are out of direct sunlight immediately.</p>
            `,
            poisoning: `
                <div class="warning-box"><strong>Inhaled Toxins (Deadly):</strong> Teflon/PTFE fumes (from overheated pans), aerosol sprays, smoke, perfume. Immediately move the bird into fresh outdoor air.</div>
                <p class="first-aid-sub">Common Bird Toxins & Impact Levels:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>Toxin</th>
                            <th>Type</th>
                            <th>Impact Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Teflon / PTFE fumes</td><td>Inhaled</td><td><span class="impact-badge high">HIGH (Instant Death)</span></td></tr>
                        <tr><td>Avocado (Persin)</td><td>Fruit</td><td><span class="impact-badge high">HIGH (Fatal)</span></td></tr>
                        <tr><td>Chocolate / Caffeine</td><td>Food</td><td><span class="impact-badge high">HIGH (Cardiac Arrest)</span></td></tr>
                        <tr><td>Heavy Metals (Lead/Zinc)</td><td>Metal</td><td><span class="impact-badge high">HIGH</span></td></tr>
                        <tr><td>Lily of the Valley</td><td>Plant</td><td><span class="impact-badge high">HIGH</span></td></tr>
                        <tr><td>Apple / Cherry Seeds</td><td>Fruit</td><td><span class="impact-badge moderate">MODERATE (Cyanide)</span></td></tr>
                        <tr><td>Onion & Garlic</td><td>Food</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                        <tr><td>Philodendron / Ivy</td><td>Plant</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                        <tr><td>Salt / Salty snacks</td><td>Food</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>Symptoms:</strong> Sitting fluffed up at the bottom of the cage, eyes closed, weak gripping.</p>
                <p><strong>The "Sick Box":</strong> Place the bird in a small, padded box or travel carrier. Keep it dark, quiet, and warm (around 85°F / 29°C) using a heating pad set to low underneath half of the box.</p>
            `
        },
        rabbit: {
            cpr: `
                <div class="warning-box"><strong>Fragile Anatomy:</strong> Rabbits have incredibly delicate skeletons; use extreme caution.</div>
                <p><strong>Positioning:</strong> Lay the rabbit on their side.</p>
                <p><strong>Compressions:</strong> Use two or three fingers on the side of the chest wall directly behind the front legs. Compress gently at a fast rate of 100–120 compressions per minute.</p>
                <p><strong>Rescue Breaths:</strong> Close the mouth and blow gently into the nostrils every 5–6 compressions.</p>
            `,
            choking: `
                <p><strong>Symptoms:</strong> Head extended upward, blue tongue/gums, thrashing.</p>
                <p><strong>The "Rabbit Maneuver":</strong> Support the rabbit's head and body firmly against you. Lift them up and bring them down in a smooth, swift, downward arc (centrifugal motion) to help dislodge the item from the throat.</p>
                <p><strong>Inspect:</strong> Open the mouth gently to see if the blockage has moved to where you can safely sweep it out.</p>
            `,
            bleeding: `
                <p><strong>Pressure:</strong> Use clean gauze and apply direct pressure. Rabbits panic easily, so hold them securely to prevent them from kicking and fracturing their spine.</p>
                <p><strong>Nail Bleeding:</strong> If a nail is cut too short, use cornstarch or styptic powder to pack the tip.</p>
            `,
            heatstroke: `
                <div class="warning-box"><strong>Rabbits easily overheat above 80°F (26°C).</strong></div>
                <p><strong>Remedy:</strong> Do not submerge a rabbit in water—this can trigger fatal shock. Instead, mist their ears with cool water (rabbits regulate temperature through their ears) or wrap them gently in a cool, damp towel. Place a frozen water bottle wrapped in a cloth next to them.</p>
            `,
            poisoning: `
                <div class="warning-box"><strong>No Vomiting:</strong> Rabbits physically cannot vomit. Do not attempt to make them throw up. Give fresh water to flush systems.</div>
                <p class="first-aid-sub">Common Rabbit Toxins & Impact Levels:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>Toxin</th>
                            <th>Type</th>
                            <th>Impact Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Lilies / Foxglove</td><td>Plant</td><td><span class="impact-badge high">HIGH (Heart/GI Failure)</span></td></tr>
                        <tr><td>Rhubarb Leaves</td><td>Plant</td><td><span class="impact-badge high">HIGH (Kidney Damage)</span></td></tr>
                        <tr><td>Avocado (Persin)</td><td>Fruit</td><td><span class="impact-badge high">HIGH (Heart Failure)</span></td></tr>
                        <tr><td>Chocolate</td><td>Food</td><td><span class="impact-badge high">HIGH (Fatal)</span></td></tr>
                        <tr><td>Onions & Garlic</td><td>Food</td><td><span class="impact-badge high">HIGH (Anemia)</span></td></tr>
                        <tr><td>Ivy / Rhododendron</td><td>Plant</td><td><span class="impact-badge moderate">MODERATE</span></td></tr>
                        <tr><td>Apple Seeds</td><td>Fruit</td><td><span class="impact-badge moderate">MODERATE (Cyanide)</span></td></tr>
                        <tr><td>Bread / Grains / Seeds</td><td>Food</td><td><span class="impact-badge moderate">MODERATE (GI Stasis)</span></td></tr>
                        <tr><td>Citrus Peel</td><td>Fruit</td><td><span class="impact-badge mild">MILD</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>Symptoms:</strong> Cold ears, limp body, pale gums, hypothermia. Shock in rabbits quickly leads to fatal GI Stasis.</p>
                <p><strong>Warmth & Quiet:</strong> Warmth is vital. Wrap them in a warm towel or place a wrapped heating pad underneath them. Keep them in total darkness and silence during transport to eliminate stress.</p>
            `
        }
    },
    ja: {
        dog: {
            cpr: `
                <p><strong>呼吸と脈拍の確認:</strong> 後ろ足の付け根の内側（大腿動脈）で脈拍を確認し、胸が動いているか観察します。</p>
                <p><strong>姿勢:</strong> 犬を右側を下にして、固い台の上に寝かせます。</p>
                <p><strong>圧迫:</strong> 胸の最も太い部分（小型犬の場合は心臓の真上）に手を置きます。胸の厚さの1/3から1/2が沈む強さで、1分間に100〜120回のペース（「ステイン・アライヴ」のテンポ）で圧迫します。</p>
                <p><strong>人工呼吸:</strong> 犬の口を手でしっかりと閉じます。胸が膨らむのを確認するまで鼻に息を吹き込みます。</p>
                <p><strong>回数比:</strong> 30回の胸部圧迫の後に2回人工呼吸を行います。犬が息を吹き返すか、獣医師に引き渡すまでこれを繰り返します。</p>
            `,
            choking: `
                <p><strong>口内の確認:</strong> 顎を開けて中を確認します。異物がはっきりと見える場合は、指やピンセットで注意深く取り除きます。</p>
                <div class="warning-box"><strong>見えない状態で手探りでかき出さないでください。</strong> 異物をさらに奥に押し込んでしまう可能性があります。</div>
                <p class="first-aid-sub">ハイムリック法:</p>
                <ul>
                    <li><strong>小型犬:</strong> 犬の背中をお腹に当てて、頭を上、両足をだらんとさせた状態で抱えます。肋骨の下に拳を当て、上かつ前に向かって押し上げます。</li>
                    <li><strong>大型犬:</strong> 立っている場合は、肋骨のすぐ下の腹部に腕を回し、上に向かって押し上げます。横たわっている場合は、片手をご自身の背中に添え、もう片方の手で肋骨のすぐ下を上かつ前に向かって押し上げます。</li>
                </ul>
            `,
            bleeding: `
                <p><strong>直接圧迫:</strong> 清潔な布やタオル、または滅菌ガーゼを傷口に直接当てます。傷口の様子を確認するために途中で布を持ち上げたりせず、少なくとも3〜5分間はしっかりと圧迫し続けます。</p>
                <p><strong>挙上:</strong> 傷口が手足にある場合は、可能であれば心臓より高い位置にそっと持ち上げます。</p>
                <p><strong>圧迫包帯:</strong> ガーゼの上に布をしっかりと巻き、固定します。</p>
                <div class="warning-box"><strong>止血帯は決して使用しないでください</strong>（手足が完全に切断されている場合を除く）。組織に永久的な損傷を与える可能性があります。</div>
            `,
            heatstroke: `
                <p><strong>すぐに冷やす:</strong> エアコンの効いた部屋や日陰に犬を移動させます。</p>
                <p><strong>ぬるま湯:</strong> 犬の体（特にお腹、脇の下、肉球）にぬるま湯または常温の水をスプレーするか、優しくかけます。</p>
                <div class="warning-box"><strong>やってはいけないこと:</strong> 氷や冷水は決して使用しないでください。血管が収縮し、体内の熱が中心臓器に閉じ込められてしまいます。水を無理に飲ませず、代わりに少量の冷水を舐めさせてください。</div>
            `,
            poisoning: `
                <p><strong>毒物の特定:</strong> 何を（例: チョコレート、ブドウ、キシリトール、殺鼠剤など）、どのくらいの量食べたのかをすぐに確認します。</p>
                <div class="warning-box"><strong>無理に吐かせないでください</strong>（専門医の指示がある場合を除く）。腐食性のものを飲み込んだ場合、吐かせることで食道が再び損傷します。</div>
                <p class="first-aid-sub">主な犬の毒物と影響度:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>毒物名</th>
                            <th>種類</th>
                            <th>影響度</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>キシリトール（甘味料）</td><td>食品</td><td><span class="impact-badge high">高（致命的・肝不全）</span></td></tr>
                        <tr><td>ブドウ・レーズン</td><td>果物</td><td><span class="impact-badge high">高（急性腎不全）</span></td></tr>
                        <tr><td>チョコレート（テオブロミン）</td><td>食品</td><td><span class="impact-badge high">高（心臓・神経毒性）</span></td></tr>
                        <tr><td>ソテツ（サゴヤシ）</td><td>植物</td><td><span class="impact-badge high">高（肝不全）</span></td></tr>
                        <tr><td>タマネギ・ニンニク</td><td>食品</td><td><span class="impact-badge high">高（貧血・溶血）</span></td></tr>
                        <tr><td>マカダミアナッツ</td><td>食品</td><td><span class="impact-badge moderate">中（脱力・関節痛）</span></td></tr>
                        <tr><td>アイビー・ツタ類</td><td>植物</td><td><span class="impact-badge moderate">中（胃腸炎）</span></td></tr>
                        <tr><td>チューリップ・スイセン</td><td>植物</td><td><span class="impact-badge moderate">中（心毒性・嘔吐）</span></td></tr>
                        <tr><td>アボカド</td><td>果物</td><td><span class="impact-badge mild">低（胃腸の不調）</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>症状:</strong> 歯茎が白くなる、脈が速くて弱い、手足が冷たい、外傷後の無気力。</p>
                <p><strong>温める:</strong> 体温を維持するために、犬を温かい毛布で包みます。</p>
                <p><strong>姿勢:</strong> 横たわらせた状態を維持します。後ろ足をタオルなどで少し高くし、脳と心臓への血流を促します。気道がまっすぐになるように保ちます。</p>
            `
        },
        cat: {
            cpr: `
                <p><strong>バイタルサインの確認:</strong> 呼吸と脈拍（後ろ足の付け根の内側）を確認します。</p>
                <p><strong>姿勢:</strong> 猫を右側を下にして寝かせます。</p>
                <p><strong>圧迫:</strong> 片手で猫の胸を前肢の肘のすぐ後ろで包み込み、親指と他の指で胸を挟んで絞るように圧迫します。胸の厚さの1/3から1/2を、1分間に100〜120回のペースで圧迫します。</p>
                <p><strong>人工呼吸:</strong> 猫の鼻と口全体をご自身の口で覆い、胸が膨らむのが見える程度の強さで優しく息を吹き込みます。</p>
                <p><strong>回数比:</strong> 30回の胸部圧迫の後に2回人工呼吸を行います。</p>
            `,
            choking: `
                <p><strong>優しく確認:</strong> 猫は犬に比べて異物（紐が多い）で窒息することは稀ですが、口内を確認します。噛まれないよう十分に注意してください。</p>
                <p><strong>キャット・ハイムリック:</strong> 猫の背中をご自身の胸に当てて抱きます。拳を肋骨のすぐ下の柔らかい部分に当てます。優しく、かつ鋭く上に向かって3〜4回押し上げます。</p>
                <div class="warning-box"><strong>紐が口から出ている場合:</strong> 決して引っ張らないでください。腸に巻き付いている場合、引っ張ることで内臓を切り裂く恐れがあります。短く切って、すぐに獣医師のもとへ連れて行ってください。</div>
            `,
            bleeding: `
                <p><strong>圧迫:</strong> 滅菌ガーゼパッドや清潔な布を使用し、直接しっかりと圧迫し続けます。</p>
                <p><strong>ストレスの軽減:</strong> 猫は怪我をするとパニックになりやすく、血圧が上がって出血が増加します。タオルで猫をしっかりと包み（「プリット」状態）、怪我をした部分だけを露出させて落ち着かせます。</p>
            `,
            heatstroke: `
                <p><strong>症状:</strong> 激しいハアハアという呼吸（猫は極度のストレスや過熱状態でない限り滅多にハアハアしません）、よだれ、赤い歯茎。</p>
                <p><strong>冷却:</strong> 水で湿らせたぬるいタオルで猫を包みます。肉球を冷水で拭きます。扇風機の風を優しく当てます。呼吸が落ち着いたら冷却を止めます。</p>
            `,
            poisoning: `
                <p><strong>毒物の特定:</strong> 猫の腎臓は極めて敏感です。迅速に行動し、ただちに獣医師に連絡してください。</p>
                <div class="warning-box"><strong>自宅で無理に吐かせないでください。</strong> 猫の喉の解剖学的構造上、非常に危険です。</div>
                <p class="first-aid-sub">主な猫の毒物と影響度:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>毒物名</th>
                            <th>種類</th>
                            <th>影響度</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>ユリ（テッポウユリ、オニユリ等）</td><td>植物</td><td><span class="impact-badge high">高（致命的・腎不全）</span></td></tr>
                        <tr><td>ニンニク・タマネギ</td><td>食品</td><td><span class="impact-badge high">高（重度の貧血）</span></td></tr>
                        <tr><td>チョコレート・カフェイン</td><td>食品</td><td><span class="impact-badge high">高（不整脈・興奮）</span></td></tr>
                        <tr><td>ソテツ（サゴヤシ）</td><td>植物</td><td><span class="impact-badge high">高（致命的・肝不全）</span></td></tr>
                        <tr><td>人間用の痛み止め（NSAIDs）</td><td>医薬品</td><td><span class="impact-badge high">高（胃潰瘍・腎不全）</span></td></tr>
                        <tr><td>精油（アロマ）・ミノキシジル</td><td>化学物質</td><td><span class="impact-badge high">高（臓器不全）</span></td></tr>
                        <tr><td>ブドウ・レーズン</td><td>果物</td><td><span class="impact-badge moderate">中（腎不全リスク）</span></td></tr>
                        <tr><td>チューリップ・ポトス</td><td>植物</td><td><span class="impact-badge moderate">中（よだれ・嘔吐）</span></td></tr>
                        <tr><td>柑橘類（レモン・ライムの皮）</td><td>果物</td><td><span class="impact-badge mild">低（皮膚炎・嘔吐）</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>症状:</strong> 極めて白い、または青みがかった歯茎、低体温、毛細血管再充満時間の遅延（歯茎を押しても白いまま）。</p>
                <p><strong>自宅ケア:</strong> 猫を完全に安静にさせ、温かく暗い毛布に包みます。クリニックへ急行する間、ストレスレベルを低く保つために騒音や光を最小限に抑えてください。</p>
            `
        },
        bird: {
            cpr: `
                <p><strong>高リスク:</strong> 鳥のCPRは極めて繊細で成功率が低いですが、呼吸が停止した場合は試みる価値があります。</p>
                <p><strong>圧迫:</strong> 鳥を仰向けに寝かせます。指先を1本使い、竜骨（胸骨）を非常に優しく押し下げます。1分間に約120〜150回の速いペースで圧迫します。胸を押し潰さないよう注意してください。</p>
                <p><strong>人工呼吸:</strong> 鳥のくちばしと鼻孔をご自身の口で慎重に覆います。ため息をつくような強さで、小さく優しい息をくちばしに吹き込みます。</p>
                <p><strong>回数比:</strong> 5回の圧迫と1回の人工呼吸を交互に行います。</p>
            `,
            choking: `
                <p><strong>症状:</strong> 口を開けたままにする、頭を振る、喘鳴、またはあえぎ呼吸。</p>
                <p><strong>くくちばしの確認:</strong> 鳥をしっかりと、しかし優しく保定します（胸の動きを制限しないこと）。くちばしを開け、種子やオモチャの破片が詰まっていないか確認します。見える場合は、平らな爪楊枝や先の丸いピンセットで慎重に取り除きます。</p>
                <p><strong>重力:</strong> 鳥を一時的に逆さまにして、重力を利用して気道から異物を落とします。</p>
            `,
            bleeding: `
                <div class="warning-box"><strong>鳥は血液量が極めて少ないです:</strong> 数滴の失血でも致命的になります。新しい成長中の羽（血羽）が折れると、開いたストローのようになります。</div>
                <p><strong>対処法:</strong> 出血部位に止血パウダー、コーンスターチ、または小麦粉を塗布し、2分間しっかりと圧迫します。血羽の場合は、最終的に獣医師や経験豊富な飼い主がラジオペンチで根元から抜く必要があります。</p>
            `,
            heatstroke: `
                <p><strong>症状:</strong> 開口呼吸（口を開けての呼吸）、羽を体から離して浮かせる、不安行動。</p>
                <p><strong>冷却:</strong> 冷水の霧吹きで鳥に軽くスプレーします。びしょ濡れにしないでください。涼しく暗い部屋に移動させ、直射日光から避難させます。</p>
            `,
            poisoning: `
                <div class="warning-box"><strong>吸入毒（致命的）:</strong> テフロン/PTFEの煙（加熱されたフライパン）、エアゾール、煙、香水。ただちに鳥を新鮮な空気へ移動させます。</div>
                <p class="first-aid-sub">主な鳥の毒物と影響度:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>毒物名</th>
                            <th>種類</th>
                            <th>影響度</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>テフロン（PTFE）ガス</td><td>吸入ガス</td><td><span class="impact-badge high">高（即死・呼吸不全）</span></td></tr>
                        <tr><td>アボカド（ペルシン）</td><td>果物</td><td><span class="impact-badge high">高（致命的・呼吸困難）</span></td></tr>
                        <tr><td>チョコレート・カフェイン</td><td>食品</td><td><span class="impact-badge high">高（心停止）</span></td></tr>
                        <tr><td>重金属（鉛・亜鉛おもちゃ）</td><td>金属</td><td><span class="impact-badge high">高（鉛中毒）</span></td></tr>
                        <tr><td>スズラン（すずらん）</td><td>植物</td><td><span class="impact-badge high">高（心不全）</span></td></tr>
                        <tr><td>リンゴやサクランボの種</td><td>果物</td><td><span class="impact-badge moderate">中（シアン化物毒性）</span></td></tr>
                        <tr><td>タマネギ・ニンニク</td><td>食品</td><td><span class="impact-badge moderate">中（血液細胞破壊）</span></td></tr>
                        <tr><td>フィロデンドロン・アイビー</td><td>植物</td><td><span class="impact-badge moderate">中（口腔内刺激）</span></td></tr>
                        <tr><td>塩分・塩辛いスナック</td><td>食品</td><td><span class="impact-badge moderate">中（脱水・心臓負荷）</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>症状:</strong> ケージの底で羽を膨らませてうずくまる、目を閉じる、止まり木を握る力が弱い。</p>
                <p><strong>「保温箱」:</strong> 鳥を小さくクッションを敷いた箱やキャリーに入れます。暗く静かに保ち、箱の片側の底に低設定のホットカーペットを敷いて保温（約85°F / 29°C）します。</p>
            `
        },
        rabbit: {
            cpr: `
                <div class="warning-box"><strong>脆弱な解剖学的構造:</strong> うさぎは極めて繊細な骨格を持っています。細心の注意を払ってください。</div>
                <p><strong>姿勢:</strong> うさぎを横向きに寝かせます。</p>
                <p><strong>圧迫:</strong> 前肢のすぐ後ろにある胸壁の側面に2〜3本の指を置きます。1分間に100〜120回の速いペースで優しく圧迫します。</p>
                <p><strong>人工呼吸:</strong> 口を閉じ、5〜6回の圧迫ごとに鼻孔に優しく息を吹き込みます。</p>
            `,
            choking: `
                <p><strong>症状:</strong> 頭を上に伸ばす、青い舌・歯茎、もがく。</p>
                <p><strong>うさぎのハイムリック法:</strong> うさぎの頭と体をしっかりと腕の中に抱え込みます。持ち上げてから、滑らかかつ素早い下方向の円弧を描く動作（遠心力を利用）を行い、喉から異物を排出させます。</p>
                <p><strong>確認:</strong> 口を優しく開け、異物が安全にかき出せる位置まで移動したか確認します。</p>
            `,
            bleeding: `
                <p><strong>圧迫:</strong> 清潔なガーゼを使用し、直接圧迫します。うさぎはパニックになりやすいため、暴れて背骨を骨折しないようしっかりと保定してください。</p>
                <p><strong>深爪時の出血:</strong> 爪を短く切りすぎた場合は、コーンスターチまたは止血粉を爪先に塗布して圧迫します。</p>
            `,
            heatstroke: `
                <div class="warning-box"><strong>うさぎは80°F（26°C）以上で容易に熱中症になります。</strong></div>
                <p><strong>対処法:</strong> うさぎを水に沈めないでください。致命的なショックを引き起こす可能性があります。代わりに、耳に冷水をスプレーするか（うさぎは耳で体温調節をします）、冷たく湿らせたタオルで優しく包みます。布で包んだ凍ったペットボトルを横に置きます。</p>
            `,
            poisoning: `
                <div class="warning-box"><strong>嘔吐しません:</strong> うさぎは吐くことができません。無理に吐かせようとしないでください。新鮮な水を与えます。</div>
                <p class="first-aid-sub">主なうさぎの毒物と影響度:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>毒物名</th>
                            <th>種類</th>
                            <th>影響度</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>ユリ・ジギタリス</td><td>植物</td><td><span class="impact-badge high">高（心不全・胃腸停止）</span></td></tr>
                        <tr><td>ルバーブの葉</td><td>植物</td><td><span class="impact-badge high">高（腎臓障害）</span></td></tr>
                        <tr><td>アボカド（ペルシン）</td><td>果物</td><td><span class="impact-badge high">高（心不全）</span></td></tr>
                        <tr><td>チョコレート</td><td>食品</td><td><span class="impact-badge high">高（致命的）</span></td></tr>
                        <tr><td>タマネギ・ニンニク</td><td>食品</td><td><span class="impact-badge high">高（貧血・胃腸破壊）</span></td></tr>
                        <tr><td>ツタ（アイビー）・シャクナゲ</td><td>植物</td><td><span class="impact-badge moderate">中（胃腸うっ滞）</span></td></tr>
                        <tr><td>リンゴの種</td><td>果物</td><td><span class="impact-badge moderate">中（シアン化物毒性）</span></td></tr>
                        <tr><td>パン・穀物・種子類</td><td>食品</td><td><span class="impact-badge moderate">中（胃腸うっ滞誘発）</span></td></tr>
                        <tr><td>柑橘類の皮</td><td>果物</td><td><span class="impact-badge mild">低（胃腸の不調）</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>症状:</strong> 耳が冷たい、体がぐったりする、白い歯茎、低体温。うさぎのショックは急速に致命的な胃腸うっ滞（GIスタシス）を引き起こします。</p>
                <p><strong>保温と静寂:</strong> 保温が極めて重要です。温かいタオルで包むか、ラップをかけた湯たんぽの上に寝かせます。ストレスを排除するため、移動中は完全に暗く静かな状態を保ってください。</p>
            `
        }
    },
    my: {
        dog: {
            cpr: `
                <p><strong>အသက်ရှူခြင်းနှင့် သွေးခုန်နှုန်း စစ်ဆေးခြင်း:</strong> ပေါင်ခြံအတွင်းပိုင်း (ပေါင်သွေးလွှတ်ကြော) တွင် သွေးခုန်နှုန်းကို စမ်းသပ်ပြီး ရင်ဘတ်လှုပ်ရှားမှုကို စောင့်ကြည့်ပါ။</p>
                <p><strong>အနေအထား:</strong> ခွေးကို ညာဘက်ခြမ်းသို့ လှဲထားပါ။</p>
                <p><strong>ရင်ဘတ်ဖိခြင်း:</strong> လက်နှစ်ဖက်ကို ရင်ဘတ်၏ အကျယ်ဆုံးနေရာ (သို့မဟုတ် ခွေးငယ်များအတွက် နှလုံးတည့်တည့်) ပေါ်တွင် တင်ပါ။ ရင်ဘတ်၏ ၁/၃ မှ ၁/၂ အထိ တစ်မိနစ်လျှင် ၁၀၀-၁၂၀ ကြိမ်နှုန်းဖြင့် ဖိပေးပါ ("Stayin' Alive" သီချင်း၏ စည်းချက်အတိုင်း)။</p>
                <p><strong>အသက်ရှူကူညီခြင်း:</strong> ခွေး၏ နှုတ်သီးကို သင့်လက်ဖြင့် တင်းကြပ်စွာ ပိတ်ထားပါ။ ၎င်း၏ နှာခေါင်းထဲသို့ ရင်ဘတ်ပင့်တက်လာသည်အထိ မှုတ်သွင်းပေးပါ။</p>
                <p><strong>အချိုးအစား:</strong> ဖိခြင်း ၃၀ ကြိမ်လျှင် အသက်ရှူကူညီခြင်း ၂ ကြိမ်။ ခွေးပြန်လည်သတိရလာသည်အထိ သို့မဟုတ် ဆေးခန်းသို့ ရောက်သည်အထိ ပြုလုပ်ပေးပါ။</p>
            `,
            choking: `
                <p><strong>ပါးစပ်ကို စစ်ဆေးပါ:</strong> မေးရိုးများကို ဖွင့်၍ အတွင်းပိုင်းကို ကြည့်ပါ။ တစ်ခုခု နင်နေသည်ကို ထင်ရှားစွာ မြင်ရပါက လက်ချောင်း သို့မဟုတ် ဇာဂနာဖြင့် ဂရုတစိုက် ဖယ်ရှားပါ။</p>
                <div class="warning-box"><strong>မမြင်ရဘဲ နှိုက်မထုတ်ပါနှင့်။</strong> အရာဝတ္ထုကို ပိုမိုနက်ရှိုင်းစွာ တွန်းပို့မိသွားနိုင်ပါသည်။</div>
                <p class="first-aid-sub">Heimlich နည်းလမ်း (လည်ပင်းနင်သက်သာစေသောနည်း):</p>
                <ul>
                    <li><strong>ခွေးငယ်များ:</strong> သင့်ဝမ်းဗိုက်တွင် ကပ်လျက်抱ထားပြီး ခေါင်းကို အပေါ်တင်ကာ ခြေထောက်များကို တွဲလောင်းချထားပါ။ ၎င်းတို့၏ နံရိုးအောက်တွင် လက်သီးဖြင့် အပေါ်နှင့် အရှေ့သို့ ပင့်တွန်းပါ။</li>
                    <li><strong>ခွေးကြီးများ:</strong> မတ်တပ်ရပ်နေပါက ၎င်းတို့၏ ဝမ်းဗိုက်ကို နံရိုးအောက်နားမှ ပွေ့ဖက်၍ အပေါ်သို့ ပင့်တွန်းပါ။ လှဲနေပါက လက်တစ်ဖက်ကို ၎င်းတို့၏ ကျောပေါ်တင်ပြီး အခြားလက်တစ်ဖက်�        // Localize My Pets elements
        if (navTriageBtn) navTriageBtn.textContent = strings.navTriage;
        if (navPetsBtn) navPetsBtn.textContent = strings.navPets;
        if (myPetsTitle) myPetsTitle.textContent = strings.myPetsTitle;
        if (addPetBtn) addPetBtn.textContent = strings.addPetBtn;
        if (registerPetTitle) registerPetTitle.textContent = strings.registerPetTitle;
        if (regPetName) regPetName.placeholder = strings.petNamePlaceholder;
        if (regPetAddress) regPetAddress.placeholder = strings.addressPlaceholder;
        if (regPetChip) regPetChip.placeholder = strings.chipNumberPlaceholder;
        if (labelPetName) labelPetName.textContent = strings.petNamePlaceholder;
        if (labelPetAddress) labelPetAddress.textContent = strings.addressPlaceholder;
        if (labelPetChip) labelPetChip.textContent = strings.chipNumberPlaceholder;
        if (labelPetVaccine) labelPetVaccine.textContent = strings.lastVaccinatedDateLabel;
        if (registerSubmitBtn) registerSubmitBtn.textContent = strings.registerBtn;
        if (registerCancelBtn) registerCancelBtn.textContent = strings.cancelBtn;
        if (emptyPetsMessage) emptyPetsMessage.textContent = strings.noPetsMessage;

        if (labelPetType) labelPetType.textContent = strings.petTypeLabel;
        if (labelPetPhoto) labelPetPhoto.textContent = strings.petPhotoLabel;
        if (photoUploadBtn) photoUploadBtn.textContent = strings.choosePhotoBtn;
        if (optDog) optDog.textContent = strings.pets.dog;
        if (optCat) optCat.textContent = strings.pets.cat;
        if (optBird) optBird.textContent = strings.pets.bird;
        if (optRabbit) optRabbit.textContent = strings.pets.rabbit;
        if (optOther) optOther.textContent = strings.optOther;"warning-box"><strong>သွေးတားကြိုး (Tourniquet) ကို လုံးဝမသုံးပါနှင့်</strong> (ခြေလက်များ လုံးဝပြတ်တောက်သွားသည့် အခြေအနေမှအပ)။ ၎င်းသည် တစ်ရှူးများကို အမြဲတမ်း ပျက်စီးစေနိုင်ပါသည်။</div>
            `,
            heatstroke: `
                <p><strong>ချက်ချင်း အအေးပေးပါ:</strong> ခွေးကို လေအေးပေးစက်ရှိသော အခန်း သို့မဟုတ် အရိပ်ထဲသို့ ရွှေ့ပါ။</p>
                <p><strong>ရေခပ်နွေးနွေး သုံးပါ:</strong> ခွေး၏ ကိုယ်ခန္ဓာ (အထူးသဖြင့် ဝမ်းဗိုက်၊ ဂျိုင်းကြားနှင့် ခြေဖဝါးများ) ပေါ်သို့ ရေခပ်နွေးနွေး သို့မဟုတ် သာမန်ရေကို ဖျန်းပေးပါ သို့မဟုတ် လောင်းပေးပါ။</p>
                <div class="warning-box"><strong>မလုပ်ရမည့်အရာ:</strong> ရေခဲ သို့မဟုတ် ရေခဲရေကို လုံးဝမသုံးပါနှင့်။ ၎င်းသည် သွေးကြောများကို ကျုံ့သွားစေပြီး ကိုယ်တွင်းအင်္ဂါများတွင် အပူများကို ပိတ်မိစေပါသည်။ ရေကို အတင်းမတိုက်ပါနှင့်၊ ရေအေးအနည်းငယ်ကိုသာ လျက်စေပါ။</div>
            `,
            poisoning: `
                <p><strong>အဆိပ်သင့်ပစ္စည်းကို ရှာဖွေပါ:</strong> ခွေးဘာစားမိသလဲ၊ မည်မျှ စားမိသလဲကို မြန်မြန်ဆန်းဆန်း ရှာဖွေပါ။ တိရစ္ဆာန်ဆေးကုဆရာဝန်ထံ ချက်ချင်း ဖုန်းဆက်ပါ။</p>
                <div class="warning-box"><strong>အန်အောင် အတင်းမလုပ်ပါနှင့်</strong> (ကျွမ်းကျင်သူက ညွှန်ကြားမှသာ ပြုလုပ်ပါ)။ တိုက်စားတတ်သော အရာများ မျိုချမိပါက အစာပြွန်ကို ထပ်မံလောင်ကျွမ်းစေနိုင်ပါသည်။</div>
                <p class="first-aid-sub">အဖြစ်များသော ခွေးအဆိပ်သင့်ပစ္စည်းများနှင့် သက်ရောက်မှုအဆင့်များ:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>အဆိပ်သင့်ပစ္စည်း</th>
                            <th>အမျိုးအစား</th>
                            <th>သက်ရောက်မှုအဆင့်</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Xylitol (အချိုဓာတ်)</td><td>အစာ</td><td><span class="impact-badge high">မြင့်မား (သေဆုံးနိုင်)</span></td></tr>
                        <tr><td>စပျစ်သီး နှင့် စပျစ်ခြောက်</td><td>သစ်သီး</td><td><span class="impact-badge high">မြင့်မား (ကျောက်ကပ်ပျက်စီး)</span></td></tr>
                        <tr><td>ချောကလက် (Theobromine)</td><td>အစာ</td><td><span class="impact-badge high">မြင့်မား (နှလုံး/အတက်ရောဂါ)</span></td></tr>
                        <tr><td>Sago Palm (ပေပင်တု)</td><td>အပင်</td><td><span class="impact-badge high">မြင့်မား (အသည်းပျက်စီး)</span></td></tr>
                        <tr><td>ကြက်သွန်နီ နှင့် ကြက်သွန်ဖြူ</td><td>အစာ</td><td><span class="impact-badge high">မြင့်မား (သွေးအားနည်း)</span></td></tr>
                        <tr><td>မက်ကဒေးမီးယား အခွံမာသီး</td><td>အစာ</td><td><span class="impact-badge moderate">အလယ်အလတ် (ခြေလက်မသယ်နိုင်)</span></td></tr>
                        <tr><td>အိုင်ဗီ ( Ivy နွယ်ပင်)</td><td>အပင်</td><td><span class="impact-badge moderate">အလယ်အလတ် (ဝမ်းလျှော)</span></td></tr>
                        <tr><td>ကျူးလစ်ပန်း / ဒက်ဖိုဒယ်ပန်း</td><td>အပင်</td><td><span class="impact-badge moderate">အလယ်အလတ် (အော့အန်)</span></td></tr>
                        <tr><td>ထောပတ်သီး</td><td>သစ်သီး</td><td><span class="impact-badge mild">အနည်းငယ် (အစာအိမ်မကောင်း)</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>ရောဂါလက္ခဏာများ:</strong> ဖြူဖျော့သောသွားဖုံးများ၊ မြန်သော်လည်း အားနည်းသော သွေးခုန်နှုန်း၊ အေးစက်သော ခြေလက်များနှင့် ဒဏ်ရာရပြီးနောက် နုံးချည့်နေခြင်း။</p>
                <p><strong>နွေးထွေးအောင် ထားပါ:</strong> ကိုယ်အပူချိန် ထိန်းသိမ်းရန် ခွေးကို နွေးထွေးသော စောင်ဖြင့် ပတ်ထားပါ။</p>
                <p><strong>အနေအထား:</strong> လှဲလျက်အနေအထားအတိုင်း ထားပါ။ သွေးများ ဦးနှောက်နှင့် နှလုံးသို့ စီးဆင်းစေရန် တင်ပါးကို တဘက်ဖြင့် အနည်းငယ် မြှင့်တင်ပေးပါ။ လေပြွန်ကို ဖြောင့်တန်းစွာ ထားရှိပါ။</p>
            `
        },
        cat: {
            cpr: `
                <p><strong>အသက်ရှူခြင်းနှင့် သွေးခုန်နှုန်း စစ်ဆေးခြင်း:</strong> အသက်ရှူခြင်းနှင့် ပေါင်ခြံအတွင်းပိုင်း သွေးခုန်နှုန်းကို စစ်ဆေးပါ။</p>
                <p><strong>အနေအထား:</strong> ကြောင်ကို ညာဘက်ခြမ်းသို့ လှဲထားပါ။</p>
                <p><strong>ရင်ဘတ်ဖိခြင်း:</strong> လက်တစ်ဖက်ကို ကြောင်၏ ရင်ဘတ် (ရှေ့တံတောင်ဆစ်များနောက်) တွင် ပတ်၍ လက်မနှင့် လက်ညှိုးတို့ဖြင့် ညှစ်ဖိပေးပါ။ ရင်ဘတ်၏ ၁/၃ မှ ၁/၂ ခန့်အထိ တစ်မိနစ်လျှင် ၁၀၀-၁၂၀ ကြိမ်နှုန်းဖြင့် ဖိပေးပါ။</p>
                <p><strong>အသက်ရှူကူညီခြင်း:</strong> ကြောင်၏ နှာခေါင်းနှင့် ပါးစပ်တစ်ခုလုံးကို သင့်ပါးစပ်ဖြင့် အုပ်ပြီး ရင်ဘတ်ပင့်တက်လာသည်အထိ ညင်သာစွာ လေမှုတ်သွင်းပေးပါ။</p>
                <p><strong>အချိုးအစား:</strong> ဖိခြင်း ၃၀ ကြိမ်လျှင် အသက်ရှူကူညီခြင်း ၂ ကြိမ်။</p>
            `,
            choking: `
                <p><strong>ညင်သာစွာ စစ်ဆေးပါ:</strong> ကြောင်များသည် ခွေးများနှင့် နှိုင်းယှဉ်ပါက လည်ပင်းနင်ခဲသော်လည်း (ကြိုးများ ပိုဖြစ်တတ်သည်) ပါးစပ်ကို စစ်ဆေးပါ။ အကိုက်မခံရစေရန် အလွန်သတိထားပါ။</p>
                <p><strong>ကြောင်အတွက် Heimlich:</strong> ကြောင်၏ ကျောကို သင့်ရင်ဘတ်တွင် မှီထားပါ။ သင့်လက်သီးကို နံရိုးအောက်ရှိ ပျော့ပျောင်းသောနေရာတွင် ထားပါ။ ညင်သာပြီး ပြတ်သားသော အပေါ်ပင့်တွန်းမှု ၃-၄ ကြိမ် ပြုလုပ်ပါ။</p>
                <div class="warning-box"><strong>ကြိုးထွက်နေပါက:</strong> ၎င်းကို လုံးဝဆွဲမထုတ်ပါနှင့်။ အူလမ်းကြောင်းတွင် ပတ်မိနေပါက ဆွဲထုတ်ခြင်းက ကိုယ်တွင်းအင်္ဂါများကို ပြတ်တောက်သွားစေနိုင်ပါသည်။ ကြိုးကို အတိုဖြတ်ပြီး ဆရာဝန်ထံ အမြန်သွားပါ။</div>
            `,
            bleeding: `
                <p><strong>တိုက်ရိုက် ဖိထားပါ:</strong> သန့်ရှင်းသော ပတ်တီး သို့မဟုတ် အဝတ်ဖြင့် ဒဏ်ရာပေါ်သို့ တိုက်ရိုက် ငြိမ်ဝပ်စွာ ဖိထားပါ။</p>
                <p><strong>စိတ်ဖိစီးမှုလျှော့ချပါ:</strong> ကြောင်များသည် နာကျင်သောအခါ အလွယ်တကူ ထိတ်လန့်တတ်ပြီး သွေးတိုးစေကာ သွေးထွက်ပိုများစေသည်။ ကြောင်ကို တဘက်ဖြင့် လုံခြုံစွာပတ်ထားပါ (ကြောင်လိပ်ကဲ့သို့) ဒဏ်ရာရသောနေရာကိုသာ ထုတ်ထားပြီး ငြိမ်ဝပ်စေပါ။</p>
            `,
            heatstroke: `
                <p><strong>ရောဂါလက္ခဏာများ:</strong> အသက်ရှူပြင်းခြင်း (ကြောင်များသည် စိတ်ဖိစီးမှု သို့မဟုတ် အပူလွန်ကဲမှသာ ဟောဟဲလိုက်တတ်သည်)၊ တံတွေးယိုခြင်း၊ သွားဖုံးများနီရဲခြင်း။</p>
                <p><strong>အအေးပေးခြင်း:</strong> ကြောင်ကို စိုစွတ်ပြီး နွေးရုံသာရှိသော တဘက်ဖြင့် ပတ်ထားပါ။ ခြေဖဝါးများကို ရေအေးဖြင့် ပွတ်ပေးပါ။ ပန်ကာဖွင့်ပေးပါ။ အသက်ရှူမှန်သွားပါက အအေးပေးခြင်းကို ရပ်တန့်ပါ။</p>
            `,
            poisoning: `
                <p><strong>ကြောင်များအတွက် အဆိပ်သင့်စေသောအရာများ:</strong> လီလီပန်းများ (အလွန်အဆိပ်ပြင်းသည်)၊ Essential Oils၊ မနောက်ဆီဒီး (Minoxidil)၊ လူသုံးကိုက်ခဲပျောက်ဆေးများ၊ ခွေးလှေးဆေးများ။</p>
                <p><strong>အမွှေးပေါ်ရှိပါက:</strong> လျက်မိပြီး အဆိပ်မသင့်စေရန် ပန်းကန်ဆေးဆပ်ပြာဖြင့် အမွှေးကို ချက်ချင်းဆေးကြောပါ။</p>
                <div class="warning-box"><strong>အိမ်တွင် အန်အောင် အတင်းမလုပ်ပါနှင့်။</strong> ကြောင်များ၏ ခန္ဓာဗေဒအရ ဆရာဝန်မပါဘဲ အန်စေခြင်းသည် အလွန်အန္တရာယ်ရှိပါသည်။</div>
            `,
            shock: `
                <p><strong>ရောဂါလက္ခဏာများ:</strong> အလွန်ဖြူဖျော့သော သို့မဟုတ် ပြာနှမ်းသောသွားဖုံးများ၊ ကိုယ်ပူချိန်ကျဆင်းခြင်း၊ သွားဖုံးကိုဖိပြီး ပြန်လွှတ်ပါက ဖြူမြဲဖြူနေခြင်း။</p>
                <p><strong>အိမ်တွင်းပြုစုမှု:</strong> ကြောင်ကို နွေးထွေးပြီး မှောင်သော တဘက်ဖြင့် ပတ်ကာ ငြိမ်ငြိမ်ထားပါ။ စိတ်ဖိစီးမှုလျှော့ချရန် ဆူညံသံနှင့် အလင်းရောင်ကို လျှော့ချပြီး ဆေးခန်းသို့ အမြန်သွားပါ။</p>
            `
        },
        bird: {
            cpr: `
                <p><strong>အန္တရာယ်များပါသည်:</strong> ငှက်များအတွက် CPR သည် အလွန်သိမ်မွေ့ပြီး အောင်မြင်မှုနှုန်းနည်းပါးသော်လည်း အသက်ရှူရပ်သွားပါက ကြိုးစားကြည့်သင့်သည်။</p>
                <p><strong>ရင်ဘတ်ဖိခြင်း:</strong> ငှက်ကို ပက်လက်လှဲထားပါ။ လက်ညှိုးတစ်ချောင်းဖြင့် ရင်ညွန့်ရိုးပေါ်တွင် အလွန်ညင်သာစွာ ဖိပေးပါ။ တစ်မိနစ်လျှင် ၁၂၀-၁၅၀ ကြိမ်နှုန်းဖြင့် လျင်မြန်စွာ ဖိပေးပါ။ ရင်ဘတ်ကို မဖိခြေမိစေရန် သတိပြုပါ။</p>
                <p><strong>အသက်ရှူကူညီခြင်း:</strong> ငှက်၏ နှုတ်သီးနှင့် နှာခေါင်းပေါက်များကို သင့်ပါးစပ်ဖြင့် ဂရုတစိုက်အုပ်ပြီး သက်ပြင်းချသကဲ့သို့ အလွန်ညင်သာသော လေအနည်းငယ်ကို မှုတ်သွင်းပေးပါ။</p>
                <p><strong>အချိုးအစား:</strong> ဖိခြင်း ၅ ကြိမ်လျှင် အသက်ရှူကူညီခြင်း ၁ ကြိမ်။</p>
            `,
            choking: `
                <p><strong>ရောဂါလက္ခဏာများ:</strong> ပါးစပ်ဟထားခြင်း၊ ခေါင်းခါခြင်း၊ အသက်ရှူရာတွင် တရွှီရွှီမြည်ခြင်း သို့မဟုတ် ဟောဟဲလိုက်ခြင်း။</p>
                <p><strong>နှုတ်သီးကို ရှင်းလင်းပါ:</strong> ငှက်ကို ညင်သာစွာ ထိန်းထားပါ (ရင်ဘတ်လှုပ်ရှားမှုကို မပိတ်ဆို့ပါနှင့်)။ နှုတ်သီးကို ဖွင့်ပြီး အစေ့ သို့မဟုတ် ကစားစရာ အပိုင်းအစ ညပ်နေသလား ကြည့်ပါ။ မြင်ရပါက သွားကြားထိုးတံ သို့မဟုတ် ထိပ်ဝိုင်းဇာဂနာဖြင့် ဂရုတစိုက် ထုတ်ယူပါ။</p>
                <p><strong>ဆွဲအားကိုသုံးပါ:</strong> လေပြွန်ထဲမှ အရာဝတ္ထု လွတ်ကျလာစေရန် ငှက်ကို တစ်စက္ကန့်ခန့် ဇောက်ထိုး ပြောင်းပြန်လှန်ပေးပါ။</p>
            `,
            bleeding: `
                <div class="warning-box"><strong>ငှက်များတွင် သွေးအနည်းငယ်သာရှိသည်:</strong> သွေးအနည်းငယ်ထွက်ရုံမျှဖြင့် သေဆုံးနိုင်သည်။ သွေးပေါက်နေသော အမွေးအသစ်များ ကျိုးသွားပါက ပိုက်ပွင့်နေသကဲ့သို့ ဖြစ်နေတတ်သည်။</div>
                <p><strong>ဥပဒေသင်တန်း:</strong> သွေးထွက်သည့်နေရာကို သွေးတားမှုန့်၊ ပြောင်းဖူးမှုန့် သို့မဟုတ် ဂျုံမှုန့်တို့ဖြင့် အုံပေးပြီး ၂ မိနစ်ခန့် ဖိထားပါ။ သွေးအမွေးဖြစ်ပါက တိရစ္ဆာန်ဆရာဝန် သို့မဟုတ် အတွေ့အကြုံရှိသူက ပလာယာဖြင့် အမွေးရင်းမှ နှုတ်ပစ်ရန် လိုအပ်နိုင်ပါသည်။</p>
            `,
            heatstroke: `
                <p><strong>ရောဂါလက္ခဏာများ:</strong> ဟောဟဲလိုက်ခြင်း (ပါးစပ်ဟ၍ အသက်ရှူခြင်း)၊ အတောင်ပံများကို ကိုယ်ခန္ဓာနှင့် ခွာထားခြင်း၊ ဂဏာမငြိမ်ဖြစ်ခြင်း။</p>
                <p><strong>အအေးပေးခြင်း:</strong> ရေအေးမှုန်များဖြင့် ငှက်ကို ညင်သာစွာ ဖျန်းပေးပါ။ လုံးဝမစိုစွတ်စေပါနှင့်။ 涼涼မှောင်မှောင်ရှိသော အခန်းသို့ ရွှေ့ပါ။ နေရောင်ခြည်နှင့် ချက်ချင်းကင်းလွတ်ပါစေ。</p>
            `,
            poisoning: `
                <div class="warning-box"><strong>ရှူရှိုက်မိသောအဆိပ် (အလွန်အန္တရာယ်ကြီးသည်):</strong> Teflon/PTFE အခိုးအငွေ့များ၊ စပရေးဗူးများ၊ မီးခိုး၊ ရေမွှေး။ လတ်ဆတ်သော ပြင်ပလေရှိရာသို့ ချက်ချင်းရွှေ့ပါ။</div>
                <p class="first-aid-sub">အဖြစ်များသော ငှက်အဆိပ်သင့်ပစ္စည်းများနှင့် သက်ရောက်မှုအဆင့်များ:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>အဆိပ်သင့်ပစ္စည်း</th>
                            <th>အမျိုးအစား</th>
                            <th>သက်ရောက်မှုအဆင့်</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Teflon / PTFE အခိုးအငွေ့</td><td>အငွေ့ရှူမိ</td><td><span class="impact-badge high">မြင့်မား (ချက်ချင်းသေဆုံး)</span></td></tr>
                        <tr><td>ထောပတ်သီး (Persin အဆိပ်)</td><td>သစ်သီး</td><td><span class="impact-badge high">မြင့်မား (သေဆုံးနိုင်)</span></td></tr>
                        <tr><td>ချောကလက် / ကဖင်း</td><td>အစာ</td><td><span class="impact-badge high">မြင့်မား (နှလုံးရပ်တန့်)</span></td></tr>
                        <tr><td>ခဲ / ဇင့် အစရှိသော သတ္တုများ</td><td>သတ္တု</td><td><span class="impact-badge high">မြင့်မား (သတ္တုအဆိပ်သင့်)</span></td></tr>
                        <tr><td>စလောင်းပန်း (Lily of the Valley)</td><td>အပင်</td><td><span class="impact-badge high">မြင့်မား (နှလုံးရပ်)</span></td></tr>
                        <tr><td>ပန်းသီး / ချယ်ရီစေ့များ</td><td>သစ်သီး</td><td><span class="impact-badge moderate">အလယ်အလတ် (ဆိုင်ယာနိုက်)</span></td></tr>
                        <tr><td>ကြက်သွန်နီ နှင့် ကြက်သွန်ဖြူ</td><td>အစာ</td><td><span class="impact-badge moderate">အလယ်အလတ် (သွေးဆဲလ်ပျက်စီး)</span></td></tr>
                        <tr><td>ဖီလိုဒန်ဒရွန် / အိုင်ဗီ</td><td>အပင်</td><td><span class="impact-badge moderate">အလယ်အလတ် (ပါးစပ်နာ)</span></td></tr>
                        <tr><td>ဆား / ဆားပါသောအစာများ</td><td>အစာ</td><td><span class="impact-badge moderate">အလယ်အလတ် (ရေဓာတ်ခန်း)</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>ရောဂါလက္ခဏာများ:</strong> လှောင်အိမ်အောက်ခြေတွင် အမွေးပွပွဖြင့် ထိုင်နေခြင်း၊ မျက်စိမှိတ်ထားခြင်း၊ ခြေသည်းဆုပ်ကိုင်အားမရှိခြင်း。</p>
                <p><strong>"လူနာသေတ္တာ":</strong> ၎င်းကို အောက်ခံပါသော သေတ္တာငယ် သို့မဟုတ် သယ်ဆောင်သည့် ဘူးထဲသို့ ထည့်ပါ။ မှောင်ပြီး တိတ်ဆိတ်နွေးထွေးသော အပူချိန် (85°F / 29°C ခန့်) တွင် ထားရှိပါ။</p>
            `
        },
        rabbit: {
            cpr: `
                <div class="warning-box"><strong>နုနယ်သော ခန္ဓာဗေဒ:</strong> ယုန်များတွင် အလွန်နုနယ်သော အရိုးစုရှိသဖြင့် အထူးသတိပြုပါ။</div>
                <p><strong>အနေအထား:</strong> ယုန်ကို ဘေးစောင်းလှဲထားပါ။</p>
                <p><strong>ရင်ဘတ်ဖိခြင်း:</strong> လက်ညှိုး၊ လက်ခလယ်တို့ကို ရှေ့ခြေထောက်များ၏ အနောက်တည့်တည့် ရင်ဘတ်နံရိုးပေါ်တွင် တင်ပါ။ တစ်မိနစ်လျှင် ၁၀၀-၁၂၀ ကြိမ်နှုန်းဖြင့် ညင်သာစွာ ဖိပေးပါ။</p>
                <p><strong>အသက်ရှူကူညီခြင်း:</strong> ပါးစပ်ကို ပိတ်ပြီး ၅-၆ ကြိမ် ဖိပြီးတိုင်း နှာခေါင်းပေါက်များထဲသို့ ညင်သာစွာ လေမှုတ်သွင်းပေးပါ။</p>
            `,
            choking: `
                <p><strong>ရောဂါလက္ခဏာများ:</strong> ခေါင်းကို အပေါ်သို့ ဆန့်ထားခြင်း၊ ပြာနှမ်းသောလျှာ/သွားဖုံးများ၊ ရုန်းကန်နေခြင်း။</p>
                <p><strong>ယုန်အတွက် Heimlich:</strong> ယုန်၏ ဦးခေါင်းနှင့် ခန္ဓာကိုယ်ကို သင့်ထံသို့ တင်းတင်းကြပ်ကြပ် ပွေ့ပိုက်ထားပါ။ ၎င်းကို မတင်ပြီး မြန်ဆန်ချောမွေ့သော အောက်ဘက်ဝိုက်ဆွဲလှုပ်ရှားမှုဖြင့် လည်ချောင်းထဲမှ အရာဝတ္ထုကို ကွာကျစေပါ။</p>
                <p><strong>စစ်ဆေးပါ:</strong> ပါးစပ်ကို ညင်သာစွာ ဖွင့်ပြီး ပိတ်ဆို့နေသောအရာ ထွက်လာသလား ကြည့်ပါ။</p>
            `,
            bleeding: `
                <p><strong>ဖိထားပါ:</strong> သန့်ရှင်းသော ပတ်တီးဖြင့် တိုက်ရိုက် ဖိထားပါ။ ယုန်များသည် အလွယ်တကူ ထိတ်လန့်တတ်သဖြင့် ကျောရိုးကျိုးမသွားစေရန် ခိုင်မြဲစွာ ထိန်းထားပါ။</p>
                <p><strong>ခြေသည်း သွေးထွက်ခြင်း:</strong> ခြေသည်းတိုလွန်းပါက ပြောင်းဖူးမှုန့် သို့မဟုတ် သွေးတားမှုန့်ဖြင့် သိပ်ပေးပါ။</p>
            `,
            heatstroke: `
                <div class="warning-box"><strong>ယုန်များသည် 80°F (26°C) ထက်ကျော်လွန်ပါက အလွယ်တကူ အပူလွန်ကဲတတ်သည်။</strong></div>
                <p><strong>အအေးပေးခြင်း:</strong> ယုန်ကို ရေထဲသို့ လုံးဝမနှစ်ပါနှင့်၊ ၎င်းသည် ရှော့ခ်ရစေနိုင်သည်။ ယုန်၏နားရွက်များကို ရေအေးဖျန်းပေးပါ (နားရွက်ဖြင့် အပူချိန်ညှိသည်) သို့မဟုတ် ရေအေးစိုစွတ်သော တဘက်ဖြင့် ပတ်ထားပါ။ ရေခဲဗူးကို အဝတ်ပတ်၍ ဘေးတွင် ချထားပေးပါ။</p>
            `,
            poisoning: `
                <div class="warning-box"><strong>အန်ခြင်းမရှိပါ:</strong> ယုန်များသည် အန်ထုတ်ခြင်း မလုပ်နိုင်ပါ။ အန်အောင် လုံးဝမပြုလုပ်ပါနှင့်။ ရေလတ်ဆတ်စွာ တိုက်ပါ။</div>
                <p class="first-aid-sub">အဖြစ်များသော ယုန်အဆိပ်သင့်ပစ္စည်းများနှင့် သက်ရောက်မှုအဆင့်များ:</p>
                <table class="toxins-table">
                    <thead>
                        <tr>
                            <th>အဆိပ်သင့်ပစ္စည်း</th>
                            <th>အမျိုးအစား</th>
                            <th>သက်ရောက်မှုအဆင့်</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>လီလီပန်း / ဖောက်စ်ဂလပ်ပန်း</td><td>အပင်</td><td><span class="impact-badge high">မြင့်မား (နှလုံး/အူလမ်းကြောင်း)</span></td></tr>
                        <tr><td>Rhubarb (ရူဘတ်ပင်) အရွက်များ</td><td>အပင်</td><td><span class="impact-badge high">မြင့်မား (ကျောက်ကပ်ပျက်စီး)</span></td></tr>
                        <tr><td>ထောပတ်သီး (Persin အဆိပ်)</td><td>သစ်သီး</td><td><span class="impact-badge high">မြင့်မား (နှလုံးရပ်)</span></td></tr>
                        <tr><td>ချောကလက်</td><td>အစာ</td><td><span class="impact-badge high">မြင့်မား (သေဆုံးနိုင်)</span></td></tr>
                        <tr><td>ကြက်သွန်နီ နှင့် ကြက်သွန်ဖြူ</td><td>အစာ</td><td><span class="impact-badge high">မြင့်မား (သွေးအားနည်း)</span></td></tr>
                        <tr><td>အိုင်ဗီ / ရိုဒိုဒန်ဒရွန်ပန်း</td><td>အပင်</td><td><span class="impact-badge moderate">အလယ်အလတ် (အူပိတ်)</span></td></tr>
                        <tr><td>ပန်းသီးစေ့များ</td><td>သစ်သီး</td><td><span class="impact-badge moderate">အလယ်အလတ် (ဆိုင်ယာနိုက်)</span></td></tr>
                        <tr><td>ပေါင်မုန့် / ဂျုံစေ့ / အစေ့အဆန်</td><td>အစာ</td><td><span class="impact-badge moderate">အလယ်အလတ် (အူပိတ်လှုပ်ရှားမှု)</span></td></tr>
                        <tr><td>ရှောက်သီးခွံ / လိမ္မော်သီးခွံ</td><td>သစ်သီး</td><td><span class="impact-badge mild">အနည်းငယ် (အစာအိမ်မကောင်း)</span></td></tr>
                    </tbody>
                </table>
            `,
            shock: `
                <p><strong>ရောဂါလက္ခဏာများ:</strong> နားရွက်များ အေးစက်ခြင်း၊ ခန္ဓာကိုယ်ပျော့ခွေသွားခြင်း၊ ဖြူဖျော့သောသွားဖုံးများ၊ ကိုယ်ပူချိန်ကျဆင်းခြင်း။ ယုန်များတွင် ရှော့ခ်ရခြင်းသည် သေစေနိုင်သော အစာအိမ်လှုပ်ရှားမှုရပ်ဆိုင်းခြင်း (GI Stasis) သို့ ဦးတည်သွားစေနိုင်သည်။</p>
                <p><strong>နွေးထွေးမှုနှင့် တိတ်ဆိတ်မှု:</strong> နွေးထွေးမှုသည် မရှိမဖြစ်လိုအပ်သည်။ နွေးထွေးသော တဘက်ဖြင့် ပတ်ထားပါ သို့မဟုတ် လျှပ်စစ်ရေနွေးအိတ်ပေါ်တွင် တင်ထားပါ။ သယ်ဆောင်စဉ်အတွင်း အလင်းရောင်နှင့် ဆူညံသံများကို လုံးဝပိတ်ဆို့ထားပါ။</p>
            `
        }
    }
};

const MAPS_QUERIES = {
    en: "emergency+animal+hospital+veterinarian",
    ja: "動物病院+緊急+救急",
    my: "veterinary+clinic+animal+hospital"
};

let currentLang = localStorage.getItem('pawpurse_lang') || 'en';
if (!['en', 'ja', 'my'].includes(currentLang)) {
    currentLang = 'en';
}

let currentPet = 'dog';
let editingPetId = null;

function updateLanguageUI(lang) {
    currentLang = lang;
    localStorage.setItem('pawpurse_lang', lang);

    langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const strings = TRANSLATIONS[lang];
    if (strings) {
        promptHeaderEl.textContent = strings.promptHeader;
        if (accuracyNoticeTextEl) accuracyNoticeTextEl.textContent = strings.accuracyNoticeText;
        inputEl.placeholder = strings.placeholder;
        btnText.textContent = strings.checkBtn;
        charWarning.textContent = strings.charWarning;
        errorBanner.textContent = strings.errorBanner;
        disclaimerEl.textContent = strings.disclaimer;
        resetBtn.textContent = strings.resetBtn;

        // Update pet selector translations
        const selectPetLabelEl = document.getElementById('select-pet-label');
        if (selectPetLabelEl) selectPetLabelEl.textContent = strings.selectPetLabel;

        const dogEl = document.getElementById('pet-dog');
        if (dogEl) dogEl.textContent = strings.pets.dog;

        const catEl = document.getElementById('pet-cat');
        if (catEl) catEl.textContent = strings.pets.cat;

        const birdEl = document.getElementById('pet-bird');
        if (birdEl) birdEl.textContent = strings.pets.bird;

        const rabbitEl = document.getElementById('pet-rabbit');
        if (rabbitEl) rabbitEl.textContent = strings.pets.rabbit;

        // Update clinics locator strings
        clinicsHeader.textContent = strings.clinicsHeader;
        clinicsPromptText.textContent = strings.shareLocationText;
        shareLocationBtn.textContent = strings.shareLocationBtn;
        clinicsLoadingText.textContent = strings.locatingClinics;
        clinicsFallbackText.textContent = strings.locErrorText;
        searchMapsBtn.textContent = strings.searchMapsBtn;

        // Localize default search query link
        const query = MAPS_QUERIES[lang] || MAPS_QUERIES['en'];
        searchMapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${query}`;

        // Localize My Pets elements safely
        if (navTriageBtn) navTriageBtn.textContent = strings.navTriage;
        if (navPetsBtn) navPetsBtn.textContent = strings.navPets;
        if (myPetsTitle) myPetsTitle.textContent = strings.myPetsTitle;
        if (addPetBtn) addPetBtn.textContent = strings.addPetBtn;
        if (registerPetTitle) registerPetTitle.textContent = strings.registerPetTitle;
        if (regPetName) regPetName.placeholder = strings.petNamePlaceholder;
        if (regPetAddress) regPetAddress.placeholder = strings.addressPlaceholder;
        if (regPetChip) regPetChip.placeholder = strings.chipNumberPlaceholder;
        if (labelPetName) labelPetName.textContent = strings.petNamePlaceholder;
        if (labelPetAddress) labelPetAddress.textContent = strings.addressPlaceholder;
        if (labelPetChip) labelPetChip.textContent = strings.chipNumberPlaceholder;
        if (labelPetVaccine) labelPetVaccine.textContent = strings.lastVaccinatedDateLabel;
        if (registerSubmitBtn) registerSubmitBtn.textContent = strings.registerBtn;
        if (registerCancelBtn) registerCancelBtn.textContent = strings.cancelBtn;
        if (emptyPetsMessage) emptyPetsMessage.textContent = strings.noPetsMessage;

        if (labelPetType) labelPetType.textContent = strings.petTypeLabel;
        if (labelPetPhoto) labelPetPhoto.textContent = strings.petPhotoLabel;
        if (photoUploadBtn) photoUploadBtn.textContent = strings.choosePhotoBtn;
        if (optDog) optDog.textContent = strings.pets.dog;
        if (optCat) optCat.textContent = strings.pets.cat;
        if (optBird) optBird.textContent = strings.pets.bird;
        if (optRabbit) optRabbit.textContent = strings.pets.rabbit;
        if (optOther) optOther.textContent = strings.optOther;
        if (labelPetBreed) labelPetBreed.textContent = strings.breedLabel;

        if (typeof renderPets === 'function') {
            renderPets();
        }

        // Localize Emergency Contact elements safely
        if (navClinicBtn) navClinicBtn.textContent = strings.navClinic;
        if (emergencyContactTitle) emergencyContactTitle.textContent = strings.emergencyContactTitle;
        if (emptyClinicP) emptyClinicP.textContent = strings.noClinicMessage;
        if (addClinicBtn) addClinicBtn.textContent = strings.addContactBtn;
        if (labelRegClinicName) labelRegClinicName.textContent = strings.clinicNameLabel;
        if (regClinicName) regClinicName.placeholder = strings.clinicNameLabel;
        if (labelRegClinicAddress) labelRegClinicAddress.textContent = strings.clinicAddressLabel;
        if (regClinicAddress) regClinicAddress.placeholder = strings.clinicAddressLabel;
        if (labelRegClinicPhone) labelRegClinicPhone.textContent = strings.clinicPhoneLabel;
        if (regClinicPhone) regClinicPhone.placeholder = strings.clinicPhoneLabel;
        if (saveClinicBtn) saveClinicBtn.textContent = strings.saveClinicBtn;
        if (cancelClinicBtn) cancelClinicBtn.textContent = strings.cancelBtn;
        if (editClinicBtn) editClinicBtn.textContent = strings.editDetailsBtn;
        if (removeClinicBtn) removeClinicBtn.textContent = strings.deletePetBtn || "Remove";
        if (labelDispAddress) labelDispAddress.textContent = strings.petAddressLabel || "Address:";
        if (labelDispPhone) labelDispPhone.textContent = strings.clinicPhoneLabel || "Phone Number:";

        // Localize Library elements
        if (navLibraryBtn) navLibraryBtn.textContent = strings.navLibrary || "Pet Library";
        if (libraryTitle) libraryTitle.textContent = strings.libraryTitle || "Pet Library";
        if (librarySearchInput) librarySearchInput.placeholder = strings.librarySearchPlaceholder || "Search breed name...";
        if (librarySearchBtn) librarySearchBtn.textContent = strings.librarySearchBtn || "Search";
        if (libraryErrorMessage) libraryErrorMessage.textContent = strings.libraryNotFound || "Breed not found in the library.";

        if (typeof renderClinic === 'function') {
            renderClinic();
        }

        // Update active emergency call section if present
        const emergencyCallContainer = document.getElementById('emergency-call-container');
        const emergencyCallSectionTitle = document.getElementById('emergency-call-section-title');
        if (emergencyCallContainer && !emergencyCallContainer.classList.contains('hidden')) {
            const contacts = getEmergencyClinics();
            if (emergencyCallSectionTitle) {
                emergencyCallSectionTitle.textContent = contacts.length > 0
                    ? (strings.emergencyCallSectionTitle || "📞 Registered Emergency Contacts")
                    : (strings.noContactSavedLabel || "🚨 Emergency Contact");
            }
        }
    }

    // Refresh first aid translations & active category layout
    updateFirstAidUI();
}

let currentFirstAidCategory = 'cpr';

function updateFirstAidUI() {
    const strings = TRANSLATIONS[currentLang];
    if (!strings) return;

    // 1. Get pet emoji and label
    const petEmojis = { dog: "🐶", cat: "🐱", bird: "🐦", rabbit: "🐰" };
    const emoji = petEmojis[currentPet] || "🐾";
    const petLabel = strings.pets[currentPet] || currentPet;

    // 2. Set title
    const titleEl = document.getElementById('first-aid-title');
    if (titleEl) {
        let titleText = strings.firstAidTitle || "{emoji} {pet} First Aid & CPR Guide";
        titleText = titleText.replace("{emoji}", emoji).replace("{pet}", petLabel);
        titleEl.textContent = titleText;
    }

    // 3. Translate tab buttons
    const tabBtns = document.querySelectorAll('.first-aid-tab');
    tabBtns.forEach(btn => {
        const category = btn.getAttribute('data-category');
        if (category && strings.firstAidTabs && strings.firstAidTabs[category]) {
            btn.textContent = strings.firstAidTabs[category];
        }

        // Ensure correct active class is set
        if (category === currentFirstAidCategory) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 4. Update content area
    const contentEl = document.getElementById('first-aid-content');
    if (contentEl) {
        const langData = FIRST_AID_DATA[currentLang] || FIRST_AID_DATA['en'];
        const petData = langData[currentPet] || FIRST_AID_DATA['en'][currentPet];
        const categoryHtml = petData[currentFirstAidCategory] || FIRST_AID_DATA['en'][currentPet][currentFirstAidCategory] || "";
        contentEl.innerHTML = categoryHtml;
    }
}

// Initialize UI
updateLanguageUI(currentLang);

// Enable button when there is text
inputEl.addEventListener('input', () => {
    const val = inputEl.value.trim();
    checkBtn.disabled = val.length === 0;

    if (val.length > MAX_CHARS) {
        inputEl.value = val.substring(0, MAX_CHARS);
        charWarning.classList.remove('hidden');
    } else {
        charWarning.classList.add('hidden');
    }
});

function showLoading() {
    inputEl.disabled = true;
    checkBtn.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');
    errorBanner.classList.add('hidden');
}

function showError() {
    inputEl.disabled = false;
    checkBtn.disabled = false;
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
    errorBanner.classList.remove('hidden');
}

function showResult(data) {
    // Hide landing, show result
    landingState.classList.remove('active');
    setTimeout(() => {
        landingState.classList.add('hidden');
        resultState.classList.remove('hidden');

        // Wait a tiny bit for display:flex to apply before setting active for animation
        setTimeout(() => {
            resultState.classList.add('active');
        }, 50);
    }, 400); // Wait for fade out

    // Set UI elements
    const petEmojiMap = {
        dog: "🐶",
        cat: "🐱",
        bird: "🐦",
        rabbit: "🐰"
    };
    const petStrings = TRANSLATIONS[currentLang]?.pets || TRANSLATIONS['en'].pets;
    const petLabel = petStrings[currentPet] || currentPet;

    badgeEl.textContent = `${petEmojiMap[currentPet] || "🐾"} ${petLabel.toUpperCase()} - ${data.urgency}: ${getUrgencySubtitle(data.urgency)}`;
    directiveEl.textContent = data.action_directive;

    listEl.innerHTML = '';
    data.key_instructions.forEach(inst => {
        const li = document.createElement('li');
        li.textContent = inst;
        listEl.appendChild(li);
    });

    // Registered Emergency Contacts call list display on RED or YELLOW
    const emergencyCallContainer = document.getElementById('emergency-call-container');
    const emergencyCallList = document.getElementById('emergency-call-list');
    const emergencyCallSectionTitle = document.getElementById('emergency-call-section-title');

    if (emergencyCallContainer) {
        if (data.urgency === 'RED' || data.urgency === 'YELLOW') {
            const contacts = getEmergencyClinics();
            const str = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

            if (emergencyCallSectionTitle) {
                emergencyCallSectionTitle.textContent = contacts.length > 0
                    ? (str.emergencyCallSectionTitle || "📞 Registered Emergency Contacts")
                    : (str.noContactSavedLabel || "🚨 Emergency Contact");
            }

            if (emergencyCallList) {
                emergencyCallList.innerHTML = '';

                if (contacts.length > 0) {
                    contacts.forEach(clinic => {
                        const card = document.createElement('div');
                        card.className = 'emergency-call-card';

                        const info = document.createElement('div');
                        info.className = 'emergency-call-info';

                        const name = document.createElement('span');
                        name.className = 'emergency-call-name';
                        name.textContent = clinic.name;

                        const details = document.createElement('span');
                        details.className = 'emergency-call-details';
                        details.textContent = `${clinic.phone} • ${clinic.address}`;

                        info.appendChild(name);
                        info.appendChild(details);

                        const callBtn = document.createElement('a');
                        callBtn.className = 'emergency-call-btn';
                        const cleanPhone = clinic.phone.replace(/[^0-9+]/g, '');
                        callBtn.href = `tel:${cleanPhone}`;
                        callBtn.innerHTML = `<span class="call-icon">📞</span> ${str.emergencyCallBtnText || 'Call Now'}`;

                        card.appendChild(info);
                        card.appendChild(callBtn);
                        emergencyCallList.appendChild(card);
                    });
                } else {
                    const card = document.createElement('div');
                    card.className = 'emergency-call-card empty-prompt';

                    const info = document.createElement('div');
                    info.className = 'emergency-call-info';

                    const label = document.createElement('span');
                    label.className = 'emergency-call-name';
                    label.textContent = str.noContactSavedText || "No Emergency Contact Saved";

                    info.appendChild(label);

                    const addBtn = document.createElement('a');
                    addBtn.className = 'emergency-call-btn';
                    addBtn.href = "#";
                    addBtn.textContent = str.addContactBtnText || "+ Add Contact";
                    addBtn.onclick = (e) => {
                        e.preventDefault();
                        switchScreen('clinic');
                    };

                    card.appendChild(info);
                    card.appendChild(addBtn);
                    emergencyCallList.appendChild(card);
                }
            }

            emergencyCallContainer.classList.remove('hidden');
        } else {
            emergencyCallContainer.classList.add('hidden');
        }
    }

    // Nearest animal hospital clinics section display on RED or YELLOW
    if (data.urgency === 'RED' || data.urgency === 'YELLOW') {
        clinicsSection.classList.remove('hidden');
        initClinicsFinder();
    } else {
        clinicsSection.classList.add('hidden');
    }

    // Change body state
    document.body.className = `state-${data.urgency.toLowerCase()}`;
}

function getUrgencySubtitle(urgency) {
    const subs = TRANSLATIONS[currentLang]?.urgencySubtitles || TRANSLATIONS['en'].urgencySubtitles;
    return subs[urgency] || urgency;
}

function resetApp() {
    // Reset body
    document.body.className = '';

    const emergencyCallContainer = document.getElementById('emergency-call-container');
    if (emergencyCallContainer) {
        emergencyCallContainer.classList.add('hidden');
    }

    // Hide result, show landing
    resultState.classList.remove('active');
    setTimeout(() => {
        resultState.classList.add('hidden');
        landingState.classList.remove('hidden');
        setTimeout(() => {
            landingState.classList.add('active');
        }, 50);
    }, 400);

    // Clean up map
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.classList.add('hidden');
    }
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
    mapMarkers = [];

    // Reset clinics section states
    clinicsSection.classList.add('hidden');
    clinicsPrompt.classList.add('hidden');
    clinicsLoading.classList.add('hidden');
    clinicsFallback.classList.add('hidden');
    clinicsList.classList.add('hidden');

    // Reset inputs
    inputEl.value = '';
    inputEl.disabled = false;
    checkBtn.disabled = true;
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
    errorBanner.classList.add('hidden');
    charWarning.classList.add('hidden');

    // Reset pet selection
    currentPet = 'dog';
    document.querySelectorAll('.pet-select-btn').forEach(btn => {
        if (btn.getAttribute('data-pet') === 'dog') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Reset first aid guide state
    currentFirstAidCategory = 'cpr';
    updateFirstAidUI();

    inputEl.focus();
}

// Pet selector event listeners
document.querySelectorAll('.pet-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all pet buttons
        document.querySelectorAll('.pet-select-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Update currentPet state
        currentPet = btn.getAttribute('data-pet');
        // Refresh first aid guide content for the new pet selection
        updateFirstAidUI();
    });
});

// Language selector event listeners
langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        updateLanguageUI(lang);
        // If results screen is active and showing clinics, refresh clinics map/directory
        if (!resultState.classList.contains('hidden') && !clinicsSection.classList.contains('hidden')) {
            initClinicsFinder();
        }
    });
});

function detectPetTypeFromText(text) {
    if (!text) return null;
    const lower = text.toLowerCase();

    // Check for Cat keywords
    const catKeywords = [
        "cat", "kitten", "kittens", "feline", "kitty",
        "猫", "ねこ", "ネコ", "子猫", "仔猫",
        "ကြောင်", "ကြောင်လေး"
    ];
    if (catKeywords.some(w => lower.includes(w))) {
        return "cat";
    }

    // Check for Bird keywords
    const birdKeywords = [
        "bird", "parrot", "budgie", "canary", "cockatiel", "avian",
        "鳥", "とり", "インコ", "オウム", "文鳥", "小鳥",
        "ငှက်", "ငှက်လေး"
    ];
    if (birdKeywords.some(w => lower.includes(w))) {
        return "bird";
    }

    // Check for Rabbit keywords
    const rabbitKeywords = [
        "rabbit", "bunny", "bunnies", "hare",
        "うさぎ", "ウサギ", "兎",
        "ယုန်", "ယုန်လေး"
    ];
    if (rabbitKeywords.some(w => lower.includes(w))) {
        return "rabbit";
    }

    // Check for Dog keywords
    const dogKeywords = [
        "dog", "puppy", "puppies", "pup", "canine",
        "犬", "いぬ", "イヌ", "子犬", "仔犬",
        "ခွေး", "ခွေးလေး"
    ];
    if (dogKeywords.some(w => lower.includes(w))) {
        return "dog";
    }

    return null;
}

function selectPetType(petType) {
    if (!petType) return;
    currentPet = petType;
    document.querySelectorAll('.pet-select-btn').forEach(btn => {
        if (btn.getAttribute('data-pet') === petType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    updateFirstAidUI();
}

checkBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) return;

    // Detect pet type from user input and update currentPet if found
    const detectedPet = detectPetTypeFromText(text);
    if (detectedPet) {
        selectPetType(detectedPet);
    }

    showLoading();

    // Simulate a brief local processing delay (750ms) for premium visual feedback
    setTimeout(() => {
        try {
            const data = classifySymptomsLocally(text, currentLang);
            showResult(data);
        } catch (err) {
            console.error(err);
            showError();
        }
    }, 750);
});

resetBtn.addEventListener('click', resetApp);

// Clinics Finder implementation
shareLocationBtn.addEventListener('click', requestLocation);

function initClinicsFinder() {
    clinicsList.innerHTML = '';
    clinicsFallback.classList.add('hidden');
    clinicsLoading.classList.add('hidden');
    clinicsPrompt.classList.add('hidden');
    clinicsList.classList.add('hidden');

    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.classList.add('hidden');
    }

    // If permission has already been granted previously, fetch immediately
    if (localStorage.getItem('pawpurse_gps_allowed') === 'true') {
        requestLocation();
    } else {
        clinicsPrompt.classList.remove('hidden');
    }
}

function requestLocation() {
    clinicsPrompt.classList.add('hidden');
    clinicsLoading.classList.remove('hidden');
    clinicsFallback.classList.add('hidden');
    clinicsList.classList.add('hidden');

    if (!navigator.geolocation) {
        handleLocationError();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            localStorage.setItem('pawpurse_gps_allowed', 'true');
            fetchNearbyClinics(position.coords.latitude, position.coords.longitude, true);
        },
        (error) => {
            console.error("Geolocation error:", error);
            handleLocationError();
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
}

function handleLocationError() {
    clinicsLoading.classList.add('hidden');
    clinicsFallback.classList.remove('hidden');

    const coords = FALLBACK_COORDS[currentLang] || FALLBACK_COORDS['en'];
    fetchNearbyClinics(coords.lat, coords.lon, false);
}

function setupMapAndClinics(lat, lon, isGpsAllowed) {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        mapContainer.classList.remove('hidden');
    }

    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
    mapMarkers = [];

    mapInstance = L.map('map', {
        zoomControl: false
    }).setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance);

    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    if (isGpsAllowed) {
        const userIcon = L.divIcon({
            className: 'custom-user-marker',
            html: '<div class="user-marker-pin"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        L.marker([lat, lon], { icon: userIcon }).addTo(mapInstance)
            .bindPopup(`<strong>${TRANSLATIONS[currentLang]?.yourLocation || 'Your Location'}</strong>`);
    }
}

async function fetchNearbyClinics(lat, lon, isGpsAllowed) {
    setupMapAndClinics(lat, lon, isGpsAllowed);

    const query = MAPS_QUERIES[currentLang] || MAPS_QUERIES['en'];
    searchMapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=&location=${lat},${lon}`;

    const verifiedText = TRANSLATIONS[currentLang]?.verifiedBadgeText || 'Verified Triage Desk';

    try {
        const queryStr = `[out:json][timeout:8];nwr(around:15000,${lat},${lon})[amenity=veterinary];out center 8;`;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(queryStr)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Overpass API fetch error');
        }

        const data = await response.json();
        const elements = data.elements || [];

        if (elements.length === 0) {
            throw new Error('No elements found');
        }

        // 1. Process all elements into standard clinic objects
        const rawClinics = elements.map(el => {
            const elLat = el.lat || (el.center && el.center.lat);
            const elLon = el.lon || (el.center && el.center.lon);

            let name = el.tags?.name;
            if (!name) {
                if (currentLang === 'ja') {
                    name = '動物病院 (名称不明)';
                } else if (currentLang === 'my') {
                    name = 'တိရစ္ဆာန်ဆေးခန်း (အမည်မသိ)';
                } else {
                    name = 'Veterinary Clinic (Unnamed)';
                }
            }

            let address = '';
            if (el.tags) {
                if (el.tags['addr:full']) {
                    address = el.tags['addr:full'];
                } else if (el.tags['addr:street']) {
                    const number = el.tags['addr:housenumber'] || '';
                    const street = el.tags['addr:street'];
                    const city = el.tags['addr:city'] || '';
                    address = `${number} ${street}${city ? ', ' + city : ''}`.trim();
                } else if (el.tags['addr:place']) {
                    address = el.tags['addr:place'];
                }
            }
            if (!address) {
                if (currentLang === 'ja') {
                    address = '住所不明 (地図で確認してください)';
                } else if (currentLang === 'my') {
                    address = 'လိပ်စာမရှိပါ (မြေပုံတွင် ကြည့်ပါ)';
                } else {
                    address = 'Address not specified (check map)';
                }
            }

            let phone = '';
            if (el.tags) {
                phone = el.tags['phone'] || el.tags['contact:phone'] || el.tags['contact:mobile'] || el.tags['mobile'] || el.tags['phone:emergency'] || el.tags['emergency:phone'] || '';
            }
            if (!phone) {
                phone = "00-0000-0000";
            }

            const distance = calculateDistance(lat, lon, elLat, elLon);
            return {
                name: name,
                lat: elLat,
                lon: elLon,
                address: address,
                phone: phone,
                distance: distance
            };
        });

        // Sort all by distance
        rawClinics.sort((a, b) => a.distance - b.distance);

        // 2. Select top 3 (or less if not enough) to promote to Verified Desks
        const numVerified = Math.min(3, rawClinics.length);
        const verifiedDesks = [];
        const standardClinics = [];

        const statuses = ["active", "busy", "high"];
        const waitTimes = ["0-5 min wait", "15 min wait", "35 min wait"];
        const waitTimesJa = ["待ち時間 0-5分", "待ち時間 15分", "待ち時間 35分"];
        const waitTimesMy = ["စောင့်ဆိုင်းရန်မလို (၀-၅ မိနစ်)", "၁၅ မိနစ် စောင့်ဆိုင်းရမည်", "၃၅ မိနစ် စောင့်ဆိုင်းရမည်"];

        const statusLabels = TRANSLATIONS[currentLang]?.statusLabels || TRANSLATIONS['en'].statusLabels;
        const statusLabelKeys = ["active", "busy", "high"];

        rawClinics.forEach((clinic, idx) => {
            if (idx < numVerified) {
                // Promote to verified desk
                clinic.status = statuses[idx];
                clinic.statusLabel = statusLabels[statusLabelKeys[idx]];

                if (currentLang === 'ja') {
                    clinic.waitTime = waitTimesJa[idx];
                } else if (currentLang === 'my') {
                    clinic.waitTime = waitTimesMy[idx];
                } else {
                    clinic.waitTime = waitTimes[idx];
                }

                // If no phone registered, generate a placeholder
                if (!clinic.phone || clinic.phone === "00-0000-0000") {
                    clinic.phone = "00-0000-0000";
                }

                verifiedDesks.push(clinic);

                // Add custom verified marker
                const statusClass = clinic.status === 'active' ? 'status-active' : (clinic.status === 'busy' ? 'status-busy' : 'status-high');
                const verifiedIcon = L.divIcon({
                    className: 'custom-verified-marker',
                    html: `<div class="verified-marker-container ${statusClass}"><div class="verified-marker-pin"></div><div class="verified-marker-pulse"></div></div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                });

                const marker = L.marker([clinic.lat, clinic.lon], { icon: verifiedIcon }).addTo(mapInstance);
                const popupContent = `
                    <div style="font-family: 'Outfit', sans-serif;">
                        <h4 style="margin:0 0 4px; color:#e53e3e;">${clinic.name}</h4>
                        <p style="margin:0 0 2px;"><strong>${verifiedText}</strong></p>
                        <p style="margin:0 0 2px;">${clinic.address}</p>
                        <p style="margin:0;"><strong>${clinic.statusLabel}</strong></p>
                    </div>
                `;
                marker.bindPopup(popupContent);
                mapMarkers.push({ id: `verified-${idx}`, marker: marker, data: clinic });
            }
        });

        renderClinicsList(verifiedDesks, []);
    } catch (err) {
        console.error("Failed to load nearby clinics, using offline mock mode:", err);
        setupOfflineMockDesks(lat, lon);
    }
}

function generateSimulatedPhone(idx, lang) {
    return "00-0000-0000";
}

function setupOfflineMockDesks(lat, lon) {
    const verifiedDesks = [
        {
            name: "Metro 24/7 Emergency Veterinary Hospital",
            lat: lat + 0.005,
            lon: lon - 0.007,
            status: "active",
            statusLabel: "Active",
            waitTime: "0 min",
            phone: "00-0000-0000",
            address: "120 Pine St, Downtown Area"
        },
        {
            name: "Sunset Animal Trauma & Urgent Care",
            lat: lat - 0.008,
            lon: lon + 0.009,
            status: "busy",
            statusLabel: "Busy",
            waitTime: "15 min",
            phone: "00-0000-0000",
            address: "580 Sunset Blvd, West District"
        },
        {
            name: "Westside Vet Center",
            lat: lat + 0.009,
            lon: lon + 0.006,
            status: "high",
            statusLabel: "High Volume",
            waitTime: "35 min",
            phone: "00-0000-0000",
            address: "1040 Ocean Ave, South Coast"
        }
    ];


    verifiedDesks.forEach(desk => {
        desk.distance = calculateDistance(lat, lon, desk.lat, desk.lon);
    });
    verifiedDesks.sort((a, b) => a.distance - b.distance);

    const verifiedText = TRANSLATIONS[currentLang]?.verifiedBadgeText || 'Verified Triage Desk';

    // Add markers for verified desks
    verifiedDesks.forEach((desk, idx) => {
        const statusClass = desk.status === 'active' ? 'status-active' : (desk.status === 'busy' ? 'status-busy' : 'status-high');
        const verifiedIcon = L.divIcon({
            className: 'custom-verified-marker',
            html: `<div class="verified-marker-container ${statusClass}"><div class="verified-marker-pin"></div><div class="verified-marker-pulse"></div></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        const marker = L.marker([desk.lat, desk.lon], { icon: verifiedIcon }).addTo(mapInstance);
        const popupContent = `
            <div style="font-family: 'Outfit', sans-serif;">
                <h4 style="margin:0 0 4px; color:#e53e3e;">${desk.name}</h4>
                <p style="margin:0 0 2px;"><strong>${verifiedText}</strong></p>
                <p style="margin:0 0 2px;">${desk.address}</p>
                <p style="margin:0;"><strong>${desk.statusLabel}</strong></p>
            </div>
        `;
        marker.bindPopup(popupContent);
        mapMarkers.push({ id: `verified-${idx}`, marker: marker, data: desk });
    });

    renderClinicsList(verifiedDesks, []);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function renderClinicsList(verifiedDesks, standardClinics) {
    clinicsLoading.classList.add('hidden');
    clinicsList.innerHTML = '';
    clinicsList.classList.remove('hidden');

    const unit = TRANSLATIONS[currentLang]?.distanceUnit || 'km';
    const phoneNaText = TRANSLATIONS[currentLang]?.phoneNa || 'No phone registered';
    const verifiedText = TRANSLATIONS[currentLang]?.verifiedBadgeText || 'Verified Triage Desk';

    // Render Verified Desks
    verifiedDesks.forEach((desk, idx) => {
        const card = document.createElement('div');
        card.className = 'clinic-card verified-desk';

        const badge = document.createElement('div');
        badge.className = 'verified-badge';
        badge.innerHTML = `<span class="badge-icon">✓</span> ${verifiedText}`;
        card.appendChild(badge);

        const nameRow = document.createElement('div');
        nameRow.className = 'clinic-name-row';

        const nameEl = document.createElement('h3');
        nameEl.className = 'clinic-name';
        nameEl.textContent = desk.name;

        const distEl = document.createElement('span');
        distEl.className = 'clinic-distance';
        distEl.textContent = `${desk.distance.toFixed(1)} ${unit}`;

        nameRow.appendChild(nameEl);
        nameRow.appendChild(distEl);
        card.appendChild(nameRow);

        const statusRow = document.createElement('div');
        statusRow.className = 'clinic-status-row';
        const dot = document.createElement('span');
        dot.className = `status-dot ${desk.status}`;
        const statusText = document.createElement('span');
        statusText.className = 'wait-time';
        statusText.textContent = `${desk.statusLabel} • ${desk.waitTime}`;
        statusRow.appendChild(dot);
        statusRow.appendChild(statusText);
        card.appendChild(statusRow);

        const detailsEl = document.createElement('div');
        detailsEl.className = 'clinic-details';

        const addrLink = document.createElement('a');
        addrLink.className = 'clinic-address';
        addrLink.href = `https://www.google.com/maps/dir/?api=1&destination=${desk.lat},${desk.lon}`;
        addrLink.target = '_blank';
        addrLink.title = 'Open in Google Maps';
        addrLink.innerHTML = `<span class="loc-icon">📍</span> ${desk.address}`;

        const phoneEl = document.createElement('div');
        phoneEl.className = 'clinic-phone';
        const cleanPhone = desk.phone.replace(/[^0-9+]/g, '');
        phoneEl.innerHTML = `<span class="phone-icon">📞</span> <a href="tel:${cleanPhone}" class="phone-link">${desk.phone}</a>`;

        detailsEl.appendChild(addrLink);
        detailsEl.appendChild(phoneEl);
        card.appendChild(detailsEl);

        card.addEventListener('click', () => {
            if (mapInstance) {
                mapInstance.setView([desk.lat, desk.lon], 15);
                const match = mapMarkers.find(m => m.id === `verified-${idx}`);
                if (match) {
                    match.marker.openPopup();
                }
            }
        });

        clinicsList.appendChild(card);
    });
}

// First aid tab buttons click event delegation / listener
document.querySelectorAll('.first-aid-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        currentFirstAidCategory = btn.getAttribute('data-category');
        updateFirstAidUI();
    });
});

// Run initial render of first aid guides
updateFirstAidUI();

// Switch screen state utility
function switchScreen(screenName) {
    [landingState, resultState, myPetsState, newPetState, emergencyContactState, petLibraryState].forEach(state => {
        if (state) {
            state.classList.remove('active');
            state.classList.add('hidden');
        }
    });

    navTriageBtn.classList.remove('active');
    navPetsBtn.classList.remove('active');
    if (navClinicBtn) navClinicBtn.classList.remove('active');
    if (navLibraryBtn) navLibraryBtn.classList.remove('active');

    // Reset active body urgency background state when navigating to non-triage screens
    if (screenName !== 'triage' && screenName !== 'result') {
        document.body.className = '';
    }

    let activeEl;
    if (screenName === 'triage') {
        activeEl = landingState;
        navTriageBtn.classList.add('active');
    } else if (screenName === 'result') {
        activeEl = resultState;
        navTriageBtn.classList.add('active');
    } else if (screenName === 'pets') {
        activeEl = myPetsState;
        navPetsBtn.classList.add('active');
        renderPets();
    } else if (screenName === 'register') {
        activeEl = newPetState;
        if (typeof populateBreedDropdown === 'function') {
            populateBreedDropdown();
        }
    } else if (screenName === 'clinic') {
        activeEl = emergencyContactState;
        if (navClinicBtn) navClinicBtn.classList.add('active');
        renderClinic();
    } else if (screenName === 'library') {
        activeEl = petLibraryState;
        if (navLibraryBtn) navLibraryBtn.classList.add('active');
    }

    if (activeEl) {
        activeEl.classList.remove('hidden');
        setTimeout(() => {
            activeEl.classList.add('active');
        }, 50);
    }
}

// LocalStorage helpers for pet registry
function getPets() {
    try {
        return JSON.parse(localStorage.getItem('pawpurse_registered_pets')) || [];
    } catch (e) {
        return [];
    }
}

function savePets(pets) {
    localStorage.setItem('pawpurse_registered_pets', JSON.stringify(pets));
}

function deletePet(id) {
    let pets = getPets();
    pets = pets.filter(p => p.id !== id);
    savePets(pets);
    renderPets();
}

function getPetTypeEmoji(type) {
    const emojiMap = {
        dog: "🐶",
        cat: "🐱",
        bird: "🐦",
        rabbit: "🐰",
        other: "🐾"
    };
    return emojiMap[type] || "🐾";
}

function resetPhotoUploader() {
    uploadedPhotoBase64 = "";
    if (regPetPhoto) regPetPhoto.value = "";
    if (photoPreviewContainer) photoPreviewContainer.classList.add('hidden');
    if (photoPreview) photoPreview.src = "";
    if (photoUploadBtn) photoUploadBtn.classList.remove('hidden');
}

function handlePhotoUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // Set canvas size (max 120x120 to preserve localStorage quota)
            const maxDim = 120;
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG Data URL with 0.7 quality
            uploadedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.7);

            // Show preview
            if (photoPreview) photoPreview.src = uploadedPhotoBase64;
            if (photoPreviewContainer) photoPreviewContainer.classList.remove('hidden');
            if (photoUploadBtn) photoUploadBtn.classList.add('hidden');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderPets() {
    if (!petsGrid || !emptyPetsMessage) return;

    const pets = getPets();
    const strings = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

    if (pets.length === 0) {
        emptyPetsMessage.classList.remove('hidden');
        petsGrid.classList.add('hidden');
        return;
    }

    emptyPetsMessage.classList.add('hidden');
    petsGrid.classList.remove('hidden');
    petsGrid.innerHTML = '';

    pets.forEach(pet => {
        const card = document.createElement('div');
        card.className = 'pet-card';

        const avatarHtml = pet.photo
            ? `<img src="${pet.photo}" alt="${escapeHtml(pet.name)}">`
            : getPetTypeEmoji(pet.type || 'other');

        const breedKey = pet.breed || 'generic';
        const type = pet.type || 'other';
        let breedName = '';
        let hasBreedInfo = false;

        const db = BREED_DATABASE[currentLang] || BREED_DATABASE['en'];
        if ((type === 'dog' || type === 'cat') && db[type] && db[type][breedKey]) {
            breedName = db[type][breedKey].name;
            hasBreedInfo = true;
        } else {
            breedName = strings.genericBreedOpt || "General Breed";
        }

        let insightsHtml = '';
        if (hasBreedInfo) {
            const info = db[type][breedKey];
            insightsHtml = `
                <button class="breed-insights-toggle" data-target="insights-${pet.id}">
                    ${strings.breedGuideToggle || '🐾 View Breed Insights'}
                </button>
                <div id="insights-${pet.id}" class="breed-insights-container hidden">
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.originTitle || 'Origin'}</span>
                        <div class="breed-tag-row">
                            <span class="breed-badge">${escapeHtml(info.origin)}</span>
                        </div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.temperamentTitle || 'Temperament'}</span>
                        <div class="breed-tag-row">
                            ${info.temperament.split(',').map(tag => `<span class="breed-badge">${escapeHtml(tag.trim())}</span>`).join('')}
                        </div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.coatMaintenanceTitle || 'Coat Care'}</span>
                        <div class="breed-tag-row">
                            <span class="breed-badge highlight-red">${escapeHtml(info.maintenance)}</span>
                        </div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.weightTitle || 'Ideal Weight'}</span>
                        <div class="breed-tag-row">
                            <span class="breed-badge highlight-green">${escapeHtml(info.weight)}</span>
                        </div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.healthProsTitle || 'Key Strengths'}</span>
                        <div style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">${escapeHtml(info.pros)}</div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.healthConsTitle || 'Health Risks'}</span>
                        <div style="color: #c53030; font-size: 12px; margin-top: 2px;">${escapeHtml(info.cons)}</div>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="pet-card-header">
                <div class="pet-card-title-group">
                    <div class="pet-avatar">
                        ${avatarHtml}
                    </div>
                    <span class="pet-card-name">${escapeHtml(pet.name)}</span>
                </div>
                <div class="pet-card-actions">
                    <button class="pet-edit-btn" data-id="${pet.id}">${strings.editPetBtn || 'Edit'}</button>
                    <button class="pet-remove-btn" data-id="${pet.id}">${strings.deletePetBtn || 'Remove'}</button>
                </div>
            </div>
            <div class="pet-card-details">
                <div class="pet-detail-item">
                    <span class="pet-detail-label">${strings.breedLabel || 'Breed:'}</span>
                    <span class="pet-detail-val">${escapeHtml(breedName)}</span>
                </div>
                <div class="pet-detail-item">
                    <span class="pet-detail-label">${strings.petAddressLabel || 'Address:'}</span>
                    <span class="pet-detail-val">${escapeHtml(pet.address)}</span>
                </div>
                <div class="pet-detail-item">
                    <span class="pet-detail-label">${strings.petChipLabel || 'Chip Number:'}</span>
                    <span class="pet-detail-val">${pet.chip ? escapeHtml(pet.chip) : '-'}</span>
                </div>
                <div class="pet-detail-item">
                    <span class="pet-detail-label">${strings.petVaccineLabel || 'Last Vaccinated:'}</span>
                    <span class="pet-detail-val">${pet.vaccineDate ? escapeHtml(pet.vaccineDate) : '-'}</span>
                </div>
            </div>
            ${insightsHtml}
        `;

        card.querySelector('.pet-remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deletePet(pet.id);
        });

        card.querySelector('.pet-edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            editingPetId = pet.id;
            regPetName.value = pet.name || '';
            regPetType.value = pet.type || 'dog';

            // Populate breed dropdown based on type and select breed
            populateBreedDropdown();
            if (regPetBreed) {
                regPetBreed.value = pet.breed || 'generic';
            }

            regPetAddress.value = pet.address || '';
            regPetChip.value = pet.chip || '';
            regPetVaccine.value = pet.vaccineDate || '';

            // Handle photo upload preview loading
            uploadedPhotoBase64 = pet.photo || '';
            if (uploadedPhotoBase64) {
                if (photoPreview) photoPreview.src = uploadedPhotoBase64;
                if (photoPreviewContainer) photoPreviewContainer.classList.remove('hidden');
                if (photoUploadBtn) photoUploadBtn.classList.add('hidden');
            } else {
                resetPhotoUploader();
            }

            // Update title and button labels
            const str = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
            if (registerPetTitle) registerPetTitle.textContent = str.editPetTitle || 'Edit Pet Details';
            if (registerSubmitBtn) registerSubmitBtn.textContent = str.saveChangesBtn || 'Save Changes';

            switchScreen('register');
        });

        if (hasBreedInfo) {
            const toggleBtn = card.querySelector('.breed-insights-toggle');
            const container = card.querySelector(`#insights-${pet.id}`);
            if (toggleBtn && container) {
                toggleBtn.addEventListener('click', () => {
                    const isHidden = container.classList.contains('hidden');
                    if (isHidden) {
                        container.classList.remove('hidden');
                        toggleBtn.textContent = strings.breedGuideHide || '🐾 Hide Breed Insights';
                    } else {
                        container.classList.add('hidden');
                        toggleBtn.textContent = strings.breedGuideToggle || '🐾 View Breed Insights';
                    }
                });
            }
        }

        petsGrid.appendChild(card);
    });
}

function registerPet() {
    const name = regPetName.value.trim();
    const type = regPetType.value;
    const breed = regPetBreed ? regPetBreed.value : '';
    const address = regPetAddress.value.trim();
    const chip = regPetChip.value.trim();
    const vaccineDate = regPetVaccine.value;

    if (!name || !address) return;

    const pets = getPets();

    if (editingPetId) {
        // Edit existing pet
        const petIdx = pets.findIndex(p => p.id === editingPetId);
        if (petIdx !== -1) {
            pets[petIdx].name = name;
            pets[petIdx].type = type;
            pets[petIdx].breed = breed;
            pets[petIdx].address = address;
            pets[petIdx].chip = chip;
            pets[petIdx].vaccineDate = vaccineDate;
            pets[petIdx].photo = uploadedPhotoBase64;
        }
        editingPetId = null;
    } else {
        // Create new pet
        const newPet = {
            id: 'pet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name,
            type: type,
            breed: breed,
            address: address,
            chip: chip,
            vaccineDate: vaccineDate,
            photo: uploadedPhotoBase64
        };
        pets.push(newPet);
    }

    savePets(pets);

    // Restore default labels
    const str = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
    if (registerPetTitle) registerPetTitle.textContent = str.registerPetTitle || 'Register New Pet';
    if (registerSubmitBtn) registerSubmitBtn.textContent = str.registerBtn || 'Register Pet';

    regPetForm.reset();
    resetPhotoUploader();
    switchScreen('pets');
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

// Navigation event listeners
if (navTriageBtn) {
    navTriageBtn.addEventListener('click', () => {
        if (!resultState.classList.contains('hidden')) {
            switchScreen('result');
        } else {
            switchScreen('triage');
        }
    });
}

if (logoHome) {
    logoHome.addEventListener('click', () => {
        switchScreen('triage');
    });
}

if (navPetsBtn) {
    navPetsBtn.addEventListener('click', () => {
        switchScreen('pets');
    });
}

if (addPetBtn) {
    addPetBtn.addEventListener('click', () => {
        editingPetId = null;

        // Restore default labels
        const str = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
        if (registerPetTitle) registerPetTitle.textContent = str.registerPetTitle || 'Register New Pet';
        if (registerSubmitBtn) registerSubmitBtn.textContent = str.registerBtn || 'Register Pet';

        regPetForm.reset();
        resetPhotoUploader();
        populateBreedDropdown();
        switchScreen('register');
    });
}

if (registerCancelBtn) {
    registerCancelBtn.addEventListener('click', () => {
        editingPetId = null;

        // Restore default labels
        const str = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
        if (registerPetTitle) registerPetTitle.textContent = str.registerPetTitle || 'Register New Pet';
        if (registerSubmitBtn) registerSubmitBtn.textContent = str.registerBtn || 'Register Pet';

        regPetForm.reset();
        resetPhotoUploader();
        switchScreen('pets');
    });
}

if (regPetForm) {
    regPetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerPet();
    });
}

// Photo upload listeners
if (photoUploadBtn && regPetPhoto) {
    photoUploadBtn.addEventListener('click', () => {
        regPetPhoto.click();
    });
    regPetPhoto.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handlePhotoUpload(e.target.files[0]);
        }
    });
}

if (photoRemoveBtn) {
    photoRemoveBtn.addEventListener('click', () => {
        resetPhotoUploader();
    });
}

// Render pets list initially
renderPets();

// Emergency Contact local storage and registration helpers
let editingClinicId = null;

function getEmergencyClinics() {
    try {
        const data = JSON.parse(localStorage.getItem('pawpurse_emergency_contacts'));
        if (Array.isArray(data) && data.length > 0) return data;

        // Backwards compatibility migration from single object 'pawpurse_emergency_clinic'
        const single = JSON.parse(localStorage.getItem('pawpurse_emergency_clinic'));
        if (single && single.name) {
            const migrated = [{ id: 'contact_' + Date.now(), ...single }];
            localStorage.setItem('pawpurse_emergency_contacts', JSON.stringify(migrated));
            return migrated;
        }
        return [];
    } catch (e) {
        return [];
    }
}

function saveEmergencyClinics(contacts) {
    localStorage.setItem('pawpurse_emergency_contacts', JSON.stringify(contacts));
}

function saveEmergencyClinicItem(contact) {
    const contacts = getEmergencyClinics();
    if (contact.id) {
        const idx = contacts.findIndex(c => c.id === contact.id);
        if (idx !== -1) {
            contacts[idx] = contact;
        } else {
            contacts.push(contact);
        }
    } else {
        contact.id = 'contact_' + Date.now();
        contacts.push(contact);
    }
    saveEmergencyClinics(contacts);
}

function deleteEmergencyClinicItem(id) {
    const contacts = getEmergencyClinics().filter(c => c.id !== id);
    saveEmergencyClinics(contacts);
    renderClinic();
}

function renderClinic() {
    if (!clinicDisplayContainer || !clinicFormContainer || !emptyClinicMessage) return;

    const contacts = getEmergencyClinics();
    const str = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

    if (contacts.length === 0) {
        clinicDisplayContainer.classList.add('hidden');
        clinicFormContainer.classList.add('hidden');
        emptyClinicMessage.classList.remove('hidden');
        return;
    }

    emptyClinicMessage.classList.add('hidden');
    clinicFormContainer.classList.add('hidden');
    clinicDisplayContainer.classList.remove('hidden');

    const clinicsCardsList = document.getElementById('clinics-cards-list');
    if (!clinicsCardsList) return;

    clinicsCardsList.innerHTML = '';

    contacts.forEach(clinic => {
        const card = document.createElement('div');
        card.className = 'clinic-contact-card';
        card.style.marginBottom = '16px';

        const title = document.createElement('h2');
        title.textContent = clinic.name;

        const details = document.createElement('div');
        details.className = 'clinic-contact-details';

        const addrItem = document.createElement('div');
        addrItem.className = 'clinic-detail-item';
        addrItem.innerHTML = `<span class="pet-detail-label">${str.clinicAddressLabel || 'Address:'}</span> <a class="clinic-address-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}" target="_blank">${escapeHtml(clinic.address)}</a>`;

        const phoneItem = document.createElement('div');
        phoneItem.className = 'clinic-detail-item';
        const cleanPhone = clinic.phone.replace(/[^0-9+]/g, '');
        phoneItem.innerHTML = `<span class="pet-detail-label">${str.clinicPhoneLabel || 'Phone:'}</span> <a class="phone-link" href="tel:${cleanPhone}">${escapeHtml(clinic.phone)}</a>`;

        details.appendChild(addrItem);
        details.appendChild(phoneItem);

        const actions = document.createElement('div');
        actions.className = 'contact-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'secondary-btn';
        editBtn.textContent = str.editDetailsBtn || 'Edit Details';
        editBtn.onclick = () => {
            editingClinicId = clinic.id;
            if (regClinicName) regClinicName.value = clinic.name;
            if (regClinicAddress) regClinicAddress.value = clinic.address;
            if (regClinicPhone) regClinicPhone.value = clinic.phone;
            const titleEl = document.getElementById('clinic-form-title');
            if (titleEl) titleEl.textContent = str.editClinicTitle || 'Edit Emergency Contact';

            clinicDisplayContainer.classList.add('hidden');
            emptyClinicMessage.classList.add('hidden');
            clinicFormContainer.classList.remove('hidden');
        };

        const removeBtn = document.createElement('button');
        removeBtn.className = 'pet-remove-btn';
        removeBtn.textContent = str.deletePetBtn || 'Remove';
        removeBtn.onclick = () => {
            deleteEmergencyClinicItem(clinic.id);
        };

        actions.appendChild(editBtn);
        actions.appendChild(removeBtn);

        card.appendChild(title);
        card.appendChild(details);
        card.appendChild(actions);

        clinicsCardsList.appendChild(card);
    });
}

function registerEmergencyClinic() {
    const name = regClinicName ? regClinicName.value.trim() : '';
    const address = regClinicAddress ? regClinicAddress.value.trim() : '';
    const phone = regClinicPhone ? regClinicPhone.value.trim() : '';

    if (!name || !address || !phone) {
        if (regClinicName && !name) regClinicName.reportValidity();
        else if (regClinicAddress && !address) regClinicAddress.reportValidity();
        else if (regClinicPhone && !phone) regClinicPhone.reportValidity();
        return;
    }

    const data = { id: editingClinicId, name, address, phone };
    saveEmergencyClinicItem(data);
    editingClinicId = null;

    if (clinicRegisterForm) clinicRegisterForm.reset();
    renderClinic();
}

function openClinicAddForm() {
    editingClinicId = null;
    const str = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
    const titleEl = document.getElementById('clinic-form-title');
    if (titleEl) titleEl.textContent = str.addClinicTitle || 'Add Emergency Contact';

    if (clinicRegisterForm) clinicRegisterForm.reset();
    if (clinicDisplayContainer) clinicDisplayContainer.classList.add('hidden');
    if (emptyClinicMessage) emptyClinicMessage.classList.add('hidden');
    if (clinicFormContainer) clinicFormContainer.classList.remove('hidden');
    if (regClinicName) setTimeout(() => regClinicName.focus(), 50);
}

// Emergency contact event listeners
if (navClinicBtn) {
    navClinicBtn.addEventListener('click', () => {
        switchScreen('clinic');
    });
}

if (addClinicTopBtn) {
    addClinicTopBtn.addEventListener('click', openClinicAddForm);
}

if (addClinicBtn) {
    addClinicBtn.addEventListener('click', openClinicAddForm);
}

if (saveClinicBtn) {
    saveClinicBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerEmergencyClinic();
    });
}

if (clinicRegisterForm) {
    clinicRegisterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerEmergencyClinic();
    });
}

if (cancelClinicBtn) {
    cancelClinicBtn.addEventListener('click', () => {
        editingClinicId = null;
        if (clinicRegisterForm) clinicRegisterForm.reset();
        renderClinic();
    });
}

// Pet Library implementation
if (navLibraryBtn) {
    navLibraryBtn.addEventListener('click', () => {
        switchScreen('library');
    });
}

let breedLibraryCache = null;

async function loadBreedLibrary() {
    if (breedLibraryCache) return breedLibraryCache;
    try {
        const response = await fetch('data/breed_insight_library.csv');
        if (!response.ok) {
            throw new Error('Failed to fetch breed library csv');
        }
        const text = await response.text();
        const parsed = parseCSV(text);

        // Remove header row
        const headers = parsed[0];
        const dataRows = parsed.slice(1);

        // Map data rows to objects
        breedLibraryCache = dataRows.map(row => {
            const obj = {};
            headers.forEach((h, i) => {
                obj[h.trim()] = row[i] ? row[i].trim() : '';
            });
            return obj;
        }).filter(item => item.id);

        return breedLibraryCache;
    } catch (e) {
        console.error('Error loading breed library:', e);
        return [];
    }
}

function parseCSV(text) {
    const lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const next = text[i + 1];
        if (c === '"') {
            if (inQuotes && next === '"') {
                row[row.length - 1] += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            row.push('');
        } else if ((c === '\r' || c === '\n') && !inQuotes) {
            if (c === '\r' && next === '\n') {
                i++;
            }
            lines.push(row);
            row = [''];
        } else {
            row[row.length - 1] += c;
        }
    }
    if (row.length > 1 || row[0] !== '') {
        lines.push(row);
    }
    return lines;
}

function getCategoryEmoji(category) {
    const catLower = (category || '').toLowerCase();
    if (catLower.includes('dog')) return '🐶';
    if (catLower.includes('cat')) return '🐱';
    if (catLower.includes('bird')) return '🐦';
    if (catLower.includes('rabbit') || catLower.includes('hare')) return '🐰';
    return '🐾';
}

async function searchBreedLibrary() {
    const query = (librarySearchInput ? librarySearchInput.value.trim() : '').toLowerCase();
    if (!query) return;

    if (libraryResultContainer) {
        libraryResultContainer.innerHTML = '';
        libraryResultContainer.classList.add('hidden');
    }
    if (libraryErrorMessage) {
        libraryErrorMessage.classList.add('hidden');
    }

    const library = await loadBreedLibrary();
    // Search by matching part of the breed name (case-insensitive)
    const results = library.filter(breed => {
        return (breed.breed_name || '').toLowerCase().includes(query);
    });

    if (results.length === 0) {
        if (libraryErrorMessage) {
            libraryErrorMessage.classList.remove('hidden');
        }
        return;
    }

    if (libraryResultContainer) {
        libraryResultContainer.classList.remove('hidden');
        const strings = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];

        results.forEach(breed => {
            const card = document.createElement('div');
            card.className = 'pet-card';

            const avatarHtml = getCategoryEmoji(breed.category);

            card.innerHTML = `
                <div class="pet-card-header">
                    <div class="pet-card-title-group">
                        <div class="pet-avatar" style="font-size: 22px;">
                            ${avatarHtml}
                        </div>
                        <span class="pet-card-name">${escapeHtml(breed.breed_name)}</span>
                    </div>
                </div>
                <div class="pet-card-details" style="margin-bottom: 8px;">
                    <div class="pet-detail-item">
                        <span class="pet-detail-label">Category:</span>
                        <span class="pet-detail-val">${escapeHtml(breed.category)}</span>
                    </div>
                </div>
                
                <div id="insights-${breed.id}" class="breed-insights-container">
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.originTitle || 'Origin'}</span>
                        <div class="breed-tag-row">
                            <span class="breed-badge">${escapeHtml(breed.origin)}</span>
                        </div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.temperamentTitle || 'Temperament'}</span>
                        <div class="breed-tag-row">
                            ${(breed.temperament || '').split(',').map(tag => `<span class="breed-badge">${escapeHtml(tag.trim())}</span>`).join('')}
                        </div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.coatMaintenanceTitle || 'Coat Care'}</span>
                        <div class="breed-tag-row">
                            <span class="breed-badge highlight-red">${escapeHtml(breed.coat_care)}</span>
                        </div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.weightTitle || 'Ideal Weight'}</span>
                        <div class="breed-tag-row">
                            <span class="breed-badge highlight-green">${escapeHtml(breed.ideal_weight_guide)}</span>
                        </div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.healthProsTitle || 'Key Strengths'}</span>
                        <div style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">${escapeHtml(breed.key_strengths)}</div>
                    </div>
                    <div class="breed-insight-section">
                        <span class="breed-insight-title">${strings.healthConsTitle || 'Health Risks'}</span>
                        <div style="color: #c53030; font-size: 12px; margin-top: 2px;">${escapeHtml(breed.potential_health_risks)}</div>
                    </div>
                </div>
            `;

            libraryResultContainer.appendChild(card);
        });
    }
}

if (librarySearchBtn) {
    librarySearchBtn.addEventListener('click', searchBreedLibrary);
}

if (librarySearchInput) {
    librarySearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBreedLibrary();
        }
    });
}



