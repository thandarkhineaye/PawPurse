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
    const redEn = ["bleed", "chok", "breath", "unconscious"];
    const yellowEn = ["vomit", "diarrhea", "pain"];

    // Japanese keywords
    const redJa = ["出血", "のどにつまる", "窒息", "息", "呼吸", "意識不明", "ぐったり"];
    const yellowJa = ["嘔吐", "吐く", "下痢", "痛み", "痛い"];

    // Burmese keywords
    const redMy = ["သွေးထွက်", "နင်", "အသက်ရှူ", "သတိလစ်"];
    const yellowMy = ["အော့အန်", "အန်", "ဝမ်းလျှော", "ဝမ်းပျက်", "နာကျင်", "ကိုက်"];

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
                key_instructions: ["ペットを落ち着かせる", "ただちに搬送する"]
            };
        } else if (lang === "my") {
            return {
                urgency: "RED",
                action_directive: "နီးစပ်ရာ အရေးပေါ် တိရစ္ဆာန်ဆေးကုခန်းသို့ ချက်ချင်း သွားပါ။ မစောင့်ဆိုင်းပါနှင့်။",
                key_instructions: ["အိမ်မွေးတိရစ္ဆာန်ကို တည်ငြိမ်အောင်ထားပါ", "ချက်ချင်း သယ်ယူပို့ဆောင်ပါ"]
            };
        } else {
            return {
                urgency: "RED",
                action_directive: "Go to the nearest emergency clinic immediately. Do not wait.",
                key_instructions: ["Keep the pet calm", "Transport immediately"]
            };
        }
    } else if (isYellow) {
        if (lang === "ja") {
            return {
                urgency: "YELLOW",
                action_directive: "かかりつけの獣医師に連絡するか、今日中に救急対応の動物病院を受診してください。",
                key_instructions: ["状態を注意深く観察する", "食事を与えない"]
            };
        } else if (lang === "my") {
            return {
                urgency: "YELLOW",
                action_directive: "သင့်တိရစ္ဆာန်ဆရာဝန်ထံ ဆက်သွယ်ပါ သို့မဟုတ် ယနေ့အတွင်း အရေးပေါ်ဆေးခန်းသို့ သွားရောက်ပါ။",
                key_instructions: ["အနီးကပ် စောင့်ကြည့်ပါ", "အစာမကျွေးပါနှင့်"]
            };
        } else {
            return {
                urgency: "YELLOW",
                action_directive: "Contact your vet or visit an urgent clinic today.",
                key_instructions: ["Monitor closely", "Do not feed"]
            };
        }
    } else {
        if (lang === "ja") {
            return {
                urgency: "GREEN",
                action_directive: "自宅で様子を見てください。緊急の受診は不要です。",
                key_instructions: ["快適に過ごせるようにする", "変化がないか観察する"]
            };
        } else if (lang === "my") {
            return {
                urgency: "GREEN",
                action_directive: "အိမ်တွင် စောင့်ကြည့်ပါ။ အရေးပေါ်သွားရောက်ရန် မလိုအပ်ပါ။",
                key_instructions: ["သက်တောင့်သက်သာဖြစ်အောင် ထားပါ", "အပြောင်းအလဲများကို စောင့်ကြည့်ပါ"]
            };
        } else {
            return {
                urgency: "GREEN",
                action_directive: "Monitor your pet at home. No urgent visit required.",
                key_instructions: ["Keep comfortable", "Observe for changes"]
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
        placeholder: "Describe symptoms or behavior (e.g., my dog ate chocolate, my cat is breathing heavily)...",
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
            rabbit: "Rabbit",
            others: "Others"
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
        verifiedBadgeText: "Verified Triage Desk",
        additionalClinicsHeader: "Additional Area Clinics",
        yourLocation: "Your Location",
        statusLabels: {
            active: "Active (Accepting Emergencies)",
            busy: "Busy (15 min wait)",
            high: "High Volume (35 min wait)"
        }
    },
    ja: {
        promptHeader: "ペットに何が起きていますか？",
        placeholder: "症状や様子を入力してください（例：犬がチョコレートを食べてしまった、猫の呼吸が荒いなど）...",
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
            rabbit: "うさぎ",
            others: "その他"
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
        verifiedBadgeText: "確認済み 優先デスク",
        additionalClinicsHeader: "その他の周辺クリニック",
        yourLocation: "現在地",
        statusLabels: {
            active: "稼働中（救急対応可）",
            busy: "混雑（待ち時間 15分）",
            high: "非常に混雑（待ち時間 35分）"
        }
    },
    my: {
        promptHeader: "သင့်အိမ်မွေးတိရစ္ဆာန် ဘာဖြစ်နေသလဲ။",
        placeholder: "ရောဂါလက္ခဏာ သို့မဟုတ် အပြုအမူကို ဖော်ပြပါ (ဥပမာ- ခွေးချောကလက်စားမိခြင်း၊ ကြောင်အသက်ရှူပြင်းခြင်း)...",
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
            rabbit: "ယုန်",
            others: "အခြား"
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
        verifiedBadgeText: "ညဉ့်နက်ပိုင်း လူနာခွဲခြားရေးဌာန",
        additionalClinicsHeader: "အခြား အနီးနားရှိဆေးခန်းများ",
        yourLocation: "သင်၏တည်နေရာ",
        statusLabels: {
            active: "အဆင်သင့်ရှိသည် (အရေးပေါ်လက်ခံနေသည်)",
            busy: "မအားလပ်ပါ (၁၅ မိနစ် စောင့်ဆိုင်းရမည်)",
            high: "လူနာအလွန်များပြား (၃၅ မိနစ် စောင့်ဆိုင်းရမည်)"
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
        
        const othersEl = document.getElementById('pet-others');
        if (othersEl) othersEl.textContent = strings.pets.others;
        
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
        rabbit: "🐰",
        others: "🐾"
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

checkBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (!text) return;
    
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
            } else {
                // Keep as standard clinic
                standardClinics.push(clinic);
                
                const standardIcon = L.divIcon({
                    className: 'custom-standard-marker',
                    html: '<div class="standard-marker-pin"></div>',
                    iconSize: [16, 16],
                    iconAnchor: [8, 16]
                });
                const marker = L.marker([clinic.lat, clinic.lon], { icon: standardIcon }).addTo(mapInstance);
                const popupContent = `
                    <div style="font-family: 'Outfit', sans-serif;">
                        <h4 style="margin:0 0 4px; color:#4a5568;">${clinic.name}</h4>
                        <p style="margin:0 0 2px;">${clinic.address}</p>
                        ${clinic.phone ? `<p style="margin:0;">📞 ${clinic.phone}</p>` : ''}
                    </div>
                `;
                marker.bindPopup(popupContent);
                mapMarkers.push({ id: `standard-${standardClinics.length - 1}`, marker: marker, data: clinic });
            }
        });
        
        renderClinicsList(verifiedDesks, standardClinics);
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
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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
    
    // Render Divider
    if (standardClinics.length > 0) {
        const divider = document.createElement('div');
        divider.className = 'clinics-divider';
        divider.style.margin = '16px 0 8px';
        divider.style.paddingBottom = '4px';
        divider.style.borderBottom = '1px solid rgba(255, 255, 255, 0.15)';
        divider.style.fontWeight = '700';
        divider.style.fontSize = '14px';
        divider.style.opacity = '0.8';
        divider.textContent = TRANSLATIONS[currentLang]?.additionalClinicsHeader || 'Additional Area Clinics';
        
        if (document.body.classList.contains('state-yellow')) {
            divider.style.borderBottomColor = 'rgba(18, 18, 18, 0.15)';
        }
        
        clinicsList.appendChild(divider);
        
        // Render Standard Clinics
        standardClinics.forEach((clinic, idx) => {
            const card = document.createElement('div');
            card.className = 'clinic-card';
            
            const nameRow = document.createElement('div');
            nameRow.className = 'clinic-name-row';
            
            const nameEl = document.createElement('h3');
            nameEl.className = 'clinic-name';
            nameEl.textContent = clinic.name;
            
            const distEl = document.createElement('span');
            distEl.className = 'clinic-distance';
            distEl.textContent = `${clinic.distance.toFixed(1)} ${unit}`;
            
            nameRow.appendChild(nameEl);
            nameRow.appendChild(distEl);
            
            const detailsEl = document.createElement('div');
            detailsEl.className = 'clinic-details';
            
            const addrLink = document.createElement('a');
            addrLink.className = 'clinic-address';
            addrLink.href = `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lon}`;
            addrLink.target = '_blank';
            addrLink.title = 'Open in Google Maps';
            addrLink.innerHTML = `<span class="loc-icon">📍</span> ${clinic.address}`;
            
            const phoneEl = document.createElement('div');
            phoneEl.className = 'clinic-phone';
            if (clinic.phone) {
                const cleanPhone = clinic.phone.replace(/[^0-9+]/g, '');
                phoneEl.innerHTML = `<span class="phone-icon">📞</span> <a href="tel:${cleanPhone}" class="phone-link">${clinic.phone}</a>`;
            } else {
                phoneEl.innerHTML = `<span class="phone-icon">📞</span> <span class="phone-na">${phoneNaText}</span>`;
            }
            
            detailsEl.appendChild(addrLink);
            detailsEl.appendChild(phoneEl);
            
            card.appendChild(nameRow);
            card.appendChild(detailsEl);
            
            card.addEventListener('click', () => {
                if (mapInstance) {
                    mapInstance.setView([clinic.lat, clinic.lon], 15);
                    const match = mapMarkers.find(m => m.id === `standard-${idx}`);
                    if (match) {
                        match.marker.openPopup();
                    }
                }
            });
            
            clinicsList.appendChild(card);
        });
    }
}
