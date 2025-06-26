# Playwright Cucumber LLM Starter Kit

Bu proje, Playwright, Cucumber ve TypeScript kullanarak modern bir test otomasyon çerçevesi için bir başlangıç kitidir. Yerel veya uzak LLM (Büyük Dil Modeli) hizmetlerini kullanarak CAPTCHA'ları çözme ve testler sırasında LLM'lere soru sorma gibi gelişmiş yetenekler içerir.

## Temel Özellikler

*   **Playwright & CucumberJS Entegrasyonu:** Tarayıcı otomasyonu için Playwright, BDD için Cucumber.
*   **TypeScript:** Statik tipleme ve daha iyi geliştirici deneyimi.
*   **Page Object Model (POM):** `BasePage` dahil olmak üzere yeniden kullanılabilir sayfa nesneleri.
*   **Merkezi Locator Yönetimi:** `src/locators` altında JSON dosyaları ile yönetilen UI elemanları.
*   **Gelişmiş Ortam Yönetimi:** `.env` dosyaları (örn: `.env.development`, `.env.staging`) ve `ConfigManager` ile farklı ortamlar için konfigürasyon.
*   **LLM Utility Modülü:** Yerel (örn: Ollama) ve API tabanlı (örn: OpenAI) LLM'lerle etkileşim için `LLMClient`.
    *   CAPTCHA çözme yeteneği.
    *   Genel soru-cevap yeteneği.
*   **API İstek Yöneticisi:** `ApiClient` ile testler içinde API istekleri gönderme ve yönetme.
*   **Raporlama:**
    *   Playwright HTML ve JSON raporları.
    *   Hatalı senaryolar için otomatik ekran görüntüsü.
*   **Hata Yönetimi ve Loglama:** Winston tabanlı detaylı loglama (`logs/` klasörüne) ve merkezi `ErrorHandler`.
*   **Paralel Koşum:** Playwright'ın paralel test çalıştırma yetenekleri.
*   **Esnek Tarayıcı Konfigürasyonu:** Headless, viewport, launch arguments gibi ayarlar `.env` veya CLI üzerinden yönetilebilir.
*   **Yardımcı Utility'ler:** Tarih, dosya ve string işlemleri için yardımcı fonksiyonlar.
*   **Pre-commit Hook'lar (Manuel Kurulum):** Husky ve lint-staged ile ESLint/Prettier kontrolleri.
*   **CI/CD Entegrasyonu (Manuel Kurulum):** GitHub Actions için örnek workflow.

## Kurulum

1.  **Projeyi Klonlayın:**
    \`\`\`bash
    git clone <proje_url>
    cd playwright-cucumber-llm-starter
    \`\`\`

2.  **Bağımlılıkları Yükleyin:**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Playwright Tarayıcılarını Yükleyin:**
    \`\`\`bash
    npx playwright install --with-deps
    \`\`\`

4.  **Ortam Dosyasını Yapılandırın:**
    *   \`src/environments/\` klasöründeki \`.env.example\` dosyasını kopyalayın.
    *   Proje kök dizinine \`.env\` olarak veya \`src/environments/\` altında \`.env.development\` (ya da çalıştığınız ortama göre) olarak yeniden adlandırın.
    *   Dosya içindeki değerleri (BASE_URL, API_BASE_URL, LLM_ENDPOINT, LLM_API_KEY vb.) kendi ortamınıza göre düzenleyin.
    *   **Örnek \`.env.development\` içeriği:**
       
        `BASE_URL=http://localhost:3000`
        `API_BASE_URL=http://localhost:8080/api`
        `USERNAME=dev_user`
        `PASSWORD=dev_password`
        `LLM_API_KEY=your_local_or_dev_llm_api_key`
        `LLM_ENDPOINT=http://localhost:11434`
        `LLM_PROVIDER=local`
        `LOCAL_LLM_MODEL_NAME=llava`
        `OPENAI_MODEL_NAME=gpt-4-vision-preview`
        `CAPTCHA_SOLVER_ENABLED=true`
        `DEFAULT_TIMEOUT=30000`
        `BROWSER_LAUNCH_ARGS=--start-maximized `
        `VIEWPORT_WIDTH=1920`
        `VIEWPORT_HEIGHT=1080`
        `LOG_LEVEL=info`
        `SLOWMO=false`
        `HEADLESS=false`
        `BROWSER=chromium`


## Testleri Çalıştırma

Aşağıdaki npm script'lerini kullanarak testleri çalıştırabilirsiniz:

*   **Tüm testleri varsayılan tarayıcı (Chromium) ile çalıştır ve Allure raporu oluştur:**
    \`\`\`bash
    npm test
    \`\`\`
    Bu komut \`pretest\` ile önce raporları temizler, ardından \`test:allure\` (veya doğrudan \`cucumber-js\`) çalıştırır ve \`posttest\` ile Allure raporunu generate eder. \`cucumber.js\` içinde Allure formatlayıcısı olduğu için \`test\` script'i de Allure sonuçlarını üretecektir.

*   **Belirli bir tarayıcı ile çalıştır:**
    \`\`\`bash
    npm run test:chrome
    npm run test:firefox
    npm run test:webkit
    \`\`\`
    (Bu komutlar da \`posttest\` sayesinde Allure raporu üretecektir.)

*   **Headless modda çalıştır:**
    \`\`\`bash
    npm run test:headless
    \`\`\`

## LLM Entegrasyonu

*   **\`LLMClient\` (\`src/llm/llmClient.ts\`):**
    *   \`.env\` dosyanızdaki \`LLM_PROVIDER\`, \`LLM_ENDPOINT\`, \`LLM_API_KEY\` ve model isimleri (\`LOCAL_LLM_MODEL_NAME\`, \`OPENAI_MODEL_NAME\`) ile yapılandırılır.
    *   **CAPTCHA Çözme:** \`solveCaptcha(imageBase64: string, instructions?: string)\` metodu, bir CAPTCHA görüntüsünün base64 string'ini alır ve LLM'den çözümünü ister. \`BasePage\` içindeki \`solveAndFillCaptcha\` metodu bu işlevi kullanarak UI'daki CAPTCHA'ları otomatik olarak çözmeye çalışır. Bunun için multimodal bir LLM (örn: LLaVA, GPT-4 Vision) gereklidir.
    *   **Soru Sorma:** \`questionAnswer(prompt: string, systemPrompt?: string)\` metodu, genel amaçlı sorular sormak için kullanılabilir.
