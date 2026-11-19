/* Web Car Racing Game - çoklu dil desteği (Türkçe, Amerikan İngilizcesi, İngiliz İngilizcesi) */
'use strict';

const I18N = (() => {
  const tr = {
    'app.subtitle': 'Web tabanlı araba yarışı',
    'menu.new': 'Yeni Oyun',
    'menu.settings': 'Ayarlar',
    'menu.about': 'Hakkında',
    'menu.hint': 'Sürüş: Ok tuşları / WASD · El freni: Boşluk · Duraklat: Esc',
    'menu.language': 'Dil',
    'common.back': '← Geri',

    'new.title': 'Yeni Oyun',
    'new.mode': 'Yarış türü',
    'mode.laps': 'Tur yarışı',
    'mode.sprint': 'Kısa yarış',
    'mode.laps.desc': 'Seçilen tur sayısını ilk tamamlayan kazanır.',
    'mode.sprint.desc': 'Başlangıç ve bitişi ayrı, tek yönlü bir yolda hızlı bir yarış (25 ayrı harita).',
    'new.laps': 'Tur sayısı:',
    'new.cars': 'Araba sayısı (siz dahil):',
    'new.timeTrial': '(zamana karşı)',
    'new.difficulty': 'Rakip zorluğu',
    'diff.kolay': 'Kolay', 'diff.orta': 'Orta', 'diff.zor': 'Zor',
    'new.car': 'Otomobil',
    'new.color': 'Renk',
    'new.map': 'Harita',
    'new.start': 'Oyuna Başla',
    'sum.laps': '{n} tur',
    'sum.lap1': '1 tur',
    'sum.cars': '{n} araç',
    'sum.solo': 'tek başına',
    'map.record': 'Rekor {t}',
    'map.bestLap': 'En iyi tur {t}',

    'theme.cayir': 'Çayır', 'theme.col': 'Çöl', 'theme.kar': 'Kar', 'theme.sonbahar': 'Sonbahar', 'theme.gece': 'Gece',
    'level.easy': 'Kolay', 'level.medium': 'Orta', 'level.hard': 'Zor',

    'stat.speed': 'Azami hız', 'stat.accel': 'Hızlanma', 'stat.handling': 'Yol tutuş',
    'stat.durability': 'Dayanıklılık', 'stat.offroad': 'Arazi',
    'car.0.tag': 'Dengeli', 'car.0.desc': 'Her pistte güvenilir, dengeli bir spor coupe.',
    'car.1.tag': 'Yüksek hız', 'car.1.desc': 'Uzun düzlüklerin kralı; virajlarda dikkat ister.',
    'car.2.tag': 'Yol tutuş', 'car.2.desc': 'Keskin virajlarda rakipsiz yol tutuşu sunan roadster.',
    'car.3.tag': 'Dayanıklı', 'car.3.desc': 'Ağır ve sağlam arazi aracı; çarpışmalardan ve çimden az etkilenir.',
    'car.4.tag': 'Hızlanma', 'car.4.desc': 'Hafif ve çevik; kalkışta herkesi geride bırakır.',
    'color.kirmizi': 'Kırmızı', 'color.mavi': 'Mavi', 'color.sari': 'Sarı', 'color.yesil': 'Yeşil',
    'color.turuncu': 'Turuncu', 'color.mor': 'Mor', 'color.beyaz': 'Beyaz', 'color.siyah': 'Siyah',

    'player.you': 'Sen',
    'player.ai': 'Oyuncu {n}',

    'set.title': 'Ayarlar',
    'set.player': 'Oyuncu',
    'set.playerName': 'Oyuncu adı',
    'set.language': 'Dil',
    'set.sound': 'Ses',
    'set.music': 'Müzik',
    'set.musicVolume': 'Müzik sesi',
    'set.sfx': 'Ses efektleri',
    'set.sfxVolume': 'Efekt sesi',
    'set.engineSound': 'Motor sesi',
    'set.display': 'Görüntü ve performans',
    'set.quality': 'Grafik kalitesi',
    'set.quality.low': 'Düşük (en az kaynak)', 'set.quality.medium': 'Orta', 'set.quality.high': 'Yüksek',
    'set.fpsLimit': 'Kare hızı sınırı',
    'set.fps.30': '30 FPS', 'set.fps.60': '60 FPS', 'set.fps.0': 'Sınırsız',
    'set.showFps': 'FPS göster',
    'set.screen': 'Oyun ekranı',
    'set.camera': 'Kamera',
    'set.camera.rotate': 'Araçla dönen', 'set.camera.fixed': 'Sabit (kuzey yukarı)',
    'set.units': 'Hız birimi',
    'set.speedo': 'Hız göstergesi',
    'set.speedo.analog': 'Analog', 'set.speedo.digital': 'Dijital',
    'set.mirror': 'Dikiz aynası',
    'set.minimap': 'Mini harita',
    'set.standings': 'Canlı sıralama',
    'set.touch': 'Dokunmatik kontroller',
    'set.touch.auto': 'Otomatik', 'set.touch.on': 'Açık', 'set.touch.off': 'Kapalı',
    'set.controls': 'Kontroller',
    'key.throttle': 'Gaz', 'key.brake': 'Fren / Geri', 'key.steer': 'Direksiyon', 'key.hand': 'El freni',
    'key.reset': 'Piste geri dön', 'key.camera': 'Kamera değiştir', 'key.music': 'Müzik aç/kapat', 'key.pause': 'Duraklat',
    'key.space': 'Boşluk',
    'set.gamepad': 'Oyun kolu da desteklenir (sol çubuk, RT/LT, A/B/X/Y, Start).',
    'set.resetRecords': 'Rekorları sıfırla',
    'set.resetSettings': 'Varsayılan ayarlar',
    'set.confirmRecords': 'Tüm yerel rekorlar silinsin mi?',

    'unit.kmh': 'km/sa', 'unit.mph': 'mil/sa',

    'about.title': 'Hakkında',
    'about.p1': '<b>Web Car Racing Game</b>, tamamen tarayıcıda çalışan, tek oyunculu ve kuşbakışı bir araba yarışı oyunudur. Sunucu gerektirmez; HTML, CSS ve saf JavaScript ile, hiçbir ek kütüphane ya da çatı kullanılmadan geliştirilmiştir.',
    'about.features': 'Özellikler',
    'about.list': '<li>5 farklı özellikte otomobil ve 8 renk seçeneği</li><li>5 temada (çayır, çöl, kar, sonbahar, gece) 25 tur pisti</li><li>Başlangıç ve bitişi ayrı 25 kısa yarış yolu</li><li>Tur yarışı (1–10 tur) ve kısa yarış seçenekleri</li><li>1 ile 8 araç arasında yarış; üç zorluk seviyesinde bilgisayar rakipler</li><li>Web Audio API ile gerçek zamanlı, yazılımla üretilen müzik ve ses efektleri</li><li>Hız göstergesi, dikiz aynası, mini harita, canlı sıralama</li><li>Yarış sonunda skor tablosu ve yerel rekorlar</li><li>Türkçe, Amerikan İngilizcesi ve İngiliz İngilizcesi dil desteği</li><li>Göz yormayan, yumuşak renkli tasarım</li><li>Düşük sistem kaynağı için ayarlanabilir grafik kalitesi ve kare hızı sınırı</li>',
    'about.tech': 'Teknoloji',
    'about.techText': 'Canvas 2D, Web Audio API, localStorage. Tüm ayarlar ve rekorlar yalnızca bu tarayıcıda saklanır.',
    'about.copyTitle': 'Telif hakkı',
    'about.copy': 'Telif hakkı &copy; 2026 <b>Ercan Ersoy</b> &mdash; bu deponun sahibi.<br>Bu yazılım MIT Lisansı ile lisanslanmıştır. Ayrıntılar için depodaki <code>LICENSE</code> dosyasına bakınız.',
    'about.version': 'Sürüm {v}',

    'pause.title': 'Duraklatıldı',
    'pause.resume': 'Devam Et',
    'pause.restart': 'Yeniden Başlat',
    'pause.quit': 'Ana Menü',

    'res.title': 'Skor Tablosu',
    'res.pos': 'Sıra', 'res.driver': 'Sürücü', 'res.car': 'Otomobil', 'res.time': 'Süre',
    'res.gap': 'Fark', 'res.bestLap': 'En iyi tur', 'res.points': 'Puan',
    'res.yourPos': 'Sıralamanız: <b>{p}. / {n}</b>',
    'res.timeTrial': 'Zamana karşı',
    'res.dnf': 'Bitiremedi',
    'res.trackRecord': 'Bu harita/mod rekoru: <b>{t}</b>',
    'res.trackLap': 'Harita en iyi tur: <b>{t}</b>',
    'res.newRecord': 'YENİ REKOR!',
    'res.new': 'YENİ!',
    'res.estNote': '~ işaretli süreler tahminidir (yarışı bitirmeden önce hesaplandı).',
    'res.again': 'Tekrar Yarış',
    'res.menu': 'Ana Menü',

    'hud.pos': 'SIRA', 'hud.lap': 'TUR', 'hud.dist': 'MESAFE', 'hud.time': 'SÜRE',
    'hud.last': 'Son tur', 'hud.best': 'En iyi tur',
    'hud.wrong': 'YANLIŞ YÖN!',
    'hud.go': 'BAŞLA!',
    'hud.finalLap': 'SON TUR!',
    'hud.lapN': 'TUR {n}',
    'hud.bestLapTag': ' · EN İYİ TUR',
    'hud.finishedPos': '{p}. SIRADA BİTİRDİN!',
    'hud.finish': 'BİTİŞ!',
    'hud.camRotate': 'Kamera: dönen', 'hud.camFixed': 'Kamera: sabit',
    'hud.musicOn': 'Müzik açık', 'hud.musicOff': 'Müzik kapalı',
    'hud.pause': 'Duraklat (Esc)',
    'touch.left': 'Sola', 'touch.right': 'Sağa', 'touch.brake': 'FREN', 'touch.gas': 'GAZ',

    'track.0': 'Yeşil Vadi', 'track.1': 'Çınar Pisti', 'track.2': 'Bahar Halkası', 'track.3': 'Kır Çiçeği', 'track.4': 'Orman Yolu',
    'track.5': 'Serap', 'track.6': 'Kum Fırtınası', 'track.7': 'Vaha Turu', 'track.8': 'Kaktüs Kanyonu', 'track.9': 'Güneş Yolu',
    'track.10': 'Kartepe', 'track.11': 'Buz Kraliçesi', 'track.12': 'Çam Ormanı', 'track.13': 'Kuzey Rüzgârı', 'track.14': 'Beyaz Zirve',
    'track.15': 'Hazan', 'track.16': 'Kızıl Yaprak', 'track.17': 'Bağ Bozumu', 'track.18': 'Kestane Yolu', 'track.19': 'Ekim Rallisi',
    'track.20': 'Ay Işığı', 'track.21': 'Neon Bulvarı', 'track.22': 'Liman Turu', 'track.23': 'Köprü Altı', 'track.24': 'Gece Yarısı',
    'sprint.0': 'Köy Yolu', 'sprint.1': 'Değirmen Geçidi', 'sprint.2': 'Dere Kenarı', 'sprint.3': 'Yayla Yolu', 'sprint.4': 'Bayır Aşağı', 'sprint.5': 'Kervan Yolu', 'sprint.6': 'Kızgın Kum', 'sprint.7': 'Kum Tepeleri', 'sprint.8': 'Kuru Vadi', 'sprint.9': 'Sıcak Rüzgâr', 'sprint.10': 'Buzul Geçidi', 'sprint.11': 'Kızak Yolu', 'sprint.12': 'Tipi', 'sprint.13': 'Kar Vadisi', 'sprint.14': 'Zirve Yolu', 'sprint.15': 'Yaprak Dökümü', 'sprint.16': 'Bağ Yolu', 'sprint.17': 'Sis Vadisi', 'sprint.18': 'Elma Bahçesi', 'sprint.19': 'Rüzgârlı Tepe', 'sprint.20': 'Şehir Işıkları', 'sprint.21': 'Sahil Yolu', 'sprint.22': 'Gece Ekspresi', 'sprint.23': 'Yıldız Yolu', 'sprint.24': 'Şafak Öncesi'
  };

  const enUS = {
    'app.subtitle': 'Browser-based car racing',
    'menu.new': 'New Game',
    'menu.settings': 'Settings',
    'menu.about': 'About',
    'menu.hint': 'Drive: Arrow keys / WASD · Handbrake: Space · Pause: Esc',
    'menu.language': 'Language',
    'common.back': '← Back',

    'new.title': 'New Game',
    'new.mode': 'Race type',
    'mode.laps': 'Lap race',
    'mode.sprint': 'Sprint',
    'mode.laps.desc': 'The first to complete the selected number of laps wins.',
    'mode.sprint.desc': 'A quick dash along a one-way road with separate start and finish points (25 dedicated maps).',
    'new.laps': 'Laps:',
    'new.cars': 'Number of cars (including you):',
    'new.timeTrial': '(time trial)',
    'new.difficulty': 'Opponent difficulty',
    'diff.kolay': 'Easy', 'diff.orta': 'Medium', 'diff.zor': 'Hard',
    'new.car': 'Car',
    'new.color': 'Color',
    'new.map': 'Map',
    'new.start': 'Start Race',
    'sum.laps': '{n} laps',
    'sum.lap1': '1 lap',
    'sum.cars': '{n} cars',
    'sum.solo': 'solo',
    'map.record': 'Record {t}',
    'map.bestLap': 'Best lap {t}',

    'theme.cayir': 'Meadow', 'theme.col': 'Desert', 'theme.kar': 'Snow', 'theme.sonbahar': 'Fall', 'theme.gece': 'Night',
    'level.easy': 'Easy', 'level.medium': 'Medium', 'level.hard': 'Hard',

    'stat.speed': 'Top speed', 'stat.accel': 'Acceleration', 'stat.handling': 'Handling',
    'stat.durability': 'Durability', 'stat.offroad': 'Off-road',
    'car.0.tag': 'Balanced', 'car.0.desc': 'A reliable, well-balanced sports coupe for any track.',
    'car.1.tag': 'Top speed', 'car.1.desc': 'King of the long straights; needs care in the corners.',
    'car.2.tag': 'Handling', 'car.2.desc': 'A roadster with unbeatable grip in tight corners.',
    'car.3.tag': 'Durable', 'car.3.desc': 'Heavy, sturdy off-roader; big tires shrug off bumps and grass.',
    'car.4.tag': 'Acceleration', 'car.4.desc': 'Light and nimble; leaves everyone behind off the line.',
    'color.kirmizi': 'Red', 'color.mavi': 'Blue', 'color.sari': 'Yellow', 'color.yesil': 'Green',
    'color.turuncu': 'Orange', 'color.mor': 'Purple', 'color.beyaz': 'White', 'color.siyah': 'Black',

    'player.you': 'You',
    'player.ai': 'Player {n}',

    'set.title': 'Settings',
    'set.player': 'Player',
    'set.playerName': 'Player name',
    'set.language': 'Language',
    'set.sound': 'Sound',
    'set.music': 'Music',
    'set.musicVolume': 'Music volume',
    'set.sfx': 'Sound effects',
    'set.sfxVolume': 'Effects volume',
    'set.engineSound': 'Engine sound',
    'set.display': 'Display & performance',
    'set.quality': 'Graphics quality',
    'set.quality.low': 'Low (fewest resources)', 'set.quality.medium': 'Medium', 'set.quality.high': 'High',
    'set.fpsLimit': 'Frame rate limit',
    'set.fps.30': '30 FPS', 'set.fps.60': '60 FPS', 'set.fps.0': 'Unlimited',
    'set.showFps': 'Show FPS',
    'set.screen': 'Game screen',
    'set.camera': 'Camera',
    'set.camera.rotate': 'Rotates with car', 'set.camera.fixed': 'Fixed (north up)',
    'set.units': 'Speed unit',
    'set.speedo': 'Speedometer',
    'set.speedo.analog': 'Analog', 'set.speedo.digital': 'Digital',
    'set.mirror': 'Rear-view mirror',
    'set.minimap': 'Minimap',
    'set.standings': 'Live standings',
    'set.touch': 'Touch controls',
    'set.touch.auto': 'Auto', 'set.touch.on': 'On', 'set.touch.off': 'Off',
    'set.controls': 'Controls',
    'key.throttle': 'Gas', 'key.brake': 'Brake / Reverse', 'key.steer': 'Steering', 'key.hand': 'Handbrake',
    'key.reset': 'Back to track', 'key.camera': 'Change camera', 'key.music': 'Music on/off', 'key.pause': 'Pause',
    'key.space': 'Space',
    'set.gamepad': 'Gamepads are supported too (left stick, RT/LT, A/B/X/Y, Start).',
    'set.resetRecords': 'Reset records',
    'set.resetSettings': 'Default settings',
    'set.confirmRecords': 'Delete all local records?',

    'unit.kmh': 'km/h', 'unit.mph': 'mph',

    'about.title': 'About',
    'about.p1': '<b>Web Car Racing Game</b> is a single-player, top-down car racing game that runs entirely in your browser. It needs no server and is built with HTML, CSS and plain JavaScript, without any additional libraries or frameworks.',
    'about.features': 'Features',
    'about.list': '<li>5 cars with different characteristics and 8 color options</li><li>25 circuits in 5 themes (meadow, desert, snow, fall, night)</li><li>25 sprint roads with separate start and finish points</li><li>Lap races (1–10 laps) and sprints</li><li>Races with 1 to 8 cars; computer opponents at three difficulty levels</li><li>Real-time, software-generated music and sound effects using the Web Audio API</li><li>Speedometer, rear-view mirror, minimap and live standings</li><li>End-of-race scoreboard and local records</li><li>Turkish, American English and British English language support</li><li>Easy-on-the-eyes design with soft colors</li><li>Adjustable graphics quality and frame rate limit for low system resource usage</li>',
    'about.tech': 'Technology',
    'about.techText': 'Canvas 2D, Web Audio API, localStorage. All settings and records are stored in this browser only.',
    'about.copyTitle': 'Copyright',
    'about.copy': 'Copyright &copy; 2026 <b>Ercan Ersoy</b> &mdash; owner of this repository.<br>This software is licensed under the MIT License. See the <code>LICENSE</code> file in the repository for details.',
    'about.version': 'Version {v}',

    'pause.title': 'Paused',
    'pause.resume': 'Resume',
    'pause.restart': 'Restart',
    'pause.quit': 'Main Menu',

    'res.title': 'Scoreboard',
    'res.pos': 'Pos', 'res.driver': 'Driver', 'res.car': 'Car', 'res.time': 'Time',
    'res.gap': 'Gap', 'res.bestLap': 'Best lap', 'res.points': 'Points',
    'res.yourPos': 'Your position: <b>{p} / {n}</b>',
    'res.timeTrial': 'Time trial',
    'res.dnf': 'DNF',
    'res.trackRecord': 'Record for this map/mode: <b>{t}</b>',
    'res.trackLap': 'Best lap on this map: <b>{t}</b>',
    'res.newRecord': 'NEW RECORD!',
    'res.new': 'NEW!',
    'res.estNote': 'Times marked with ~ are estimates (calculated before the car finished).',
    'res.again': 'Race Again',
    'res.menu': 'Main Menu',

    'hud.pos': 'POS', 'hud.lap': 'LAP', 'hud.dist': 'DIST', 'hud.time': 'TIME',
    'hud.last': 'Last lap', 'hud.best': 'Best lap',
    'hud.wrong': 'WRONG WAY!',
    'hud.go': 'GO!',
    'hud.finalLap': 'FINAL LAP!',
    'hud.lapN': 'LAP {n}',
    'hud.bestLapTag': ' · BEST LAP',
    'hud.finishedPos': 'YOU FINISHED {p}!',
    'hud.finish': 'FINISH!',
    'hud.camRotate': 'Camera: rotating', 'hud.camFixed': 'Camera: fixed',
    'hud.musicOn': 'Music on', 'hud.musicOff': 'Music off',
    'hud.pause': 'Pause (Esc)',
    'touch.left': 'Left', 'touch.right': 'Right', 'touch.brake': 'BRAKE', 'touch.gas': 'GAS',

    'track.0': 'Green Valley', 'track.1': 'Plane Tree Circuit', 'track.2': 'Spring Ring', 'track.3': 'Wildflower', 'track.4': 'Forest Road',
    'track.5': 'Mirage', 'track.6': 'Sandstorm', 'track.7': 'Oasis Loop', 'track.8': 'Cactus Canyon', 'track.9': 'Sun Road',
    'track.10': 'Kartepe', 'track.11': 'Ice Queen', 'track.12': 'Pine Forest', 'track.13': 'North Wind', 'track.14': 'White Summit',
    'track.15': 'Falling Leaves', 'track.16': 'Crimson Leaf', 'track.17': 'Grape Harvest', 'track.18': 'Chestnut Lane', 'track.19': 'October Rally',
    'track.20': 'Moonlight', 'track.21': 'Neon Boulevard', 'track.22': 'Harbor Loop', 'track.23': 'Under the Bridge', 'track.24': 'Midnight',
    'sprint.0': 'Village Road', 'sprint.1': 'Mill Pass', 'sprint.2': 'Creekside', 'sprint.3': 'Highland Road', 'sprint.4': 'Downhill Run', 'sprint.5': 'Caravan Route', 'sprint.6': 'Scorching Sands', 'sprint.7': 'Dunes', 'sprint.8': 'Dry Valley', 'sprint.9': 'Hot Wind', 'sprint.10': 'Glacier Pass', 'sprint.11': 'Sled Run', 'sprint.12': 'Blizzard', 'sprint.13': 'Snow Valley', 'sprint.14': 'Summit Road', 'sprint.15': 'Leaf Fall', 'sprint.16': 'Vineyard Road', 'sprint.17': 'Misty Valley', 'sprint.18': 'Apple Orchard', 'sprint.19': 'Windy Hill', 'sprint.20': 'City Lights', 'sprint.21': 'Coast Road', 'sprint.22': 'Night Express', 'sprint.23': 'Starlight Road', 'sprint.24': 'Before Dawn'
  };

  /* İngiliz İngilizcesi: Amerikan İngilizcesinden yalnızca farklı olanlar */
  const enGB = Object.assign({}, enUS, {
    'new.color': 'Colour',
    'theme.sonbahar': 'Autumn',
    'car.3.desc': 'Heavy, sturdy off-roader; big tyres shrug off bumps and grass.',
    'set.speedo.analog': 'Analogue',
    'key.throttle': 'Accelerator',
    'touch.gas': 'ACCEL',
    'set.gamepad': 'Game controllers are supported too (left stick, RT/LT, A/B/X/Y, Start).',
    'res.title': 'Results',
    'res.points': 'Pts',
    'about.list': enUS['about.list']
      .replace('8 color options', '8 colour options')
      .replace('(meadow, desert, snow, fall, night)', '(meadow, desert, snow, autumn, night)')
      .replace('with soft colors', 'with soft colours'),
    'track.22': 'Harbour Loop',
    'sprint.11': 'Sledge Run'
  });

  const DICTS = { tr: tr, 'en-US': enUS, 'en-GB': enGB };
  const NAMES = { tr: 'Türkçe', 'en-US': 'English (US)', 'en-GB': 'English (UK)' };

  function detect() {
    const list = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en-US'];
    for (const l of list) {
      const s = String(l).toLowerCase();
      if (s.startsWith('tr')) return 'tr';
      if (s === 'en-gb' || s === 'en-ie' || s === 'en-au' || s === 'en-nz') return 'en-GB';
      if (s.startsWith('en')) return 'en-US';
    }
    return 'en-US';
  }

  function lang() {
    const l = Settings.get('lang');
    return DICTS[l] ? l : 'en-US';
  }

  function t(key, params) {
    const d = DICTS[lang()];
    let s = d[key];
    if (s == null) s = enUS[key];
    if (s == null) s = key;
    if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] != null ? params[k] : m));
    return s;
  }

  /* Yüzde: Türkçede işaret başta yazılır */
  function pct(n) { return lang() === 'tr' ? '%' + n : n + '%'; }

  /* Sıra numarası: Türkçe "3.", İngilizce "3rd" */
  function ordinal(n) {
    if (lang() === 'tr') return n + '.';
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  /* Statik HTML'i çevir: data-i18n (metin), data-i18n-html (HTML), data-i18n-attr="attr:anahtar;..." */
  function apply(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
        const [attr, key] = pair.split(':');
        if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
      });
    });
    document.documentElement.lang = lang();
  }

  return { t, pct, ordinal, apply, detect, lang, NAMES, codes: Object.keys(DICTS) };
})();
