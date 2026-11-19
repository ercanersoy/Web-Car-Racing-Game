# Web Car Racing Game

Tamamen tarayıcıda çalışan, tek oyunculu, kuşbakışı bir araba yarışı oyunu.
HTML, CSS ve saf JavaScript ile yazılmıştır; **hiçbir ek kütüphane veya çatı kullanılmaz**, sunucu gerekmez.

## Çalıştırma

`index.html` dosyasını tarayıcıda açmanız yeterlidir (çift tıklama / `file://` ile çalışır).
İsterseniz herhangi bir statik dosya sunucusuyla da yayınlayabilirsiniz, örn. `python3 -m http.server`.

## Özellikler

- **Menü:** Yeni Oyun, Ayarlar, Hakkında
- **Yeni oyun seçenekleri:** yarış türü, tur sayısı (1–10), araba sayısı (1–8, siz dahil), rakip zorluğu, otomobil, renk, harita
- **5 otomobil:** Model 1 (dengeli), Model 2 (yüksek hız), Model 3 (yol tutuş), Model 4 (dayanıklı / arazi), Model 5 (hızlanma)
- **Bilgisayar rakipler:** Oyuncu 1, Oyuncu 2, … (İngilizcede Player 1, Player 2, …)
- **Diller:** Türkçe, Amerikan İngilizcesi (en-US) ve İngiliz İngilizcesi (en-GB); ilk açılışta tarayıcı dili seçilir, ana menüden veya ayarlardan değiştirilebilir
- **8 renk** seçeneği
- **25 harita**, 5 temada: çayır, çöl, kar (düşük tutuş), sonbahar, gece (far ışıkları)
- **Yarış türleri:** tur yarışı ve kısa yarış (turun ~%70'i kadar sprint)
- **Yazılımla üretilen müzik:** Web Audio API ile her haritaya özgü, gerçek zamanlı bestelenen parçalar; menü müziği; motor, kayma, çarpışma ve geri sayım sesleri
- **Gösterge paneli:** analog/dijital hız göstergesi ve vites, dikiz aynası, mini harita, canlı sıralama, tur süreleri, ters yön uyarısı
- **Skor tablosu:** yarış sonunda sıra, süre, fark, en iyi tur ve puan; yerel rekorlar (localStorage)
- **Ayarlar:** müzik/efekt/motor sesi, grafik kalitesi, kare hızı sınırı, kamera (dönen/sabit), hız birimi (km/sa, mil/sa), ayna/mini harita/sıralama göster-gizle, dokunmatik kontroller, FPS göstergesi, oyuncu adı
- **Kontroller:** klavye, oyun kolu ve dokunmatik ekran

## Kontroller

| İşlem | Tuş |
|---|---|
| Gaz | ↑ / W |
| Fren / geri | ↓ / S |
| Direksiyon | ← → / A D |
| El freni | Boşluk |
| Piste geri dön | R |
| Kamera değiştir | C |
| Müzik aç/kapat | M |
| Duraklat | Esc / P |

## Düşük kaynak tüketimi

- Menülerde oyun döngüsü tamamen durur.
- Araç ve çevre görselleri bir kez önceden çizilip önbelleğe alınır.
- Arayüz metinleri saniyede ~10 kez güncellenir; görünmeyen nesneler çizilmez.
- "Düşük" grafik kalitesi çözünürlüğü azaltır, efektleri kapatır; kare hızı 30 FPS ile sınırlanabilir.
- Sekme arka plana geçince oyun duraklar ve ses durdurulur.

## Dosya yapısı

```
index.html        Sayfa ve menüler
css/style.css     Arayüz stilleri
js/util.js        Yardımcı fonksiyonlar
js/settings.js    Ayarlar
js/i18n.js        Çeviriler (tr, en-US, en-GB)
js/cars.js        Otomobil modelleri, renkler, sprite'lar
js/tracks.js      25 haritanın tanımı ve üretimi
js/race.js        Yarış mantığı, fizik, yapay zekâ
js/audio.js       Prosedürel müzik ve ses efektleri
js/input.js       Klavye / oyun kolu / dokunmatik
js/render.js      Canvas 2D çizimi
js/hud.js         Gösterge paneli
js/ui.js          Menüler ve skor tablosu
js/main.js        Oyun döngüsü
```

## Telif hakkı

Telif hakkı © 2026 Ercan Ersoy (depo sahibi). MIT Lisansı ile lisanslanmıştır — bkz. [LICENSE](LICENSE).
