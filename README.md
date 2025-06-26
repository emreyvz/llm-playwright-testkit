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
        \`\`\`dotenv
        BASE_URL=http://localhost:3000
        API_BASE_URL=http://localhost:8080/api
        USERNAME=dev_user
        PASSWORD=dev_password
        LLM_API_KEY=your_local_or_dev_llm_api_key
        LLM_ENDPOINT=http://localhost:11434 # Örn: Ollama için yerel endpoint
        LLM_PROVIDER=local # 'local', 'openai' vb.
        LOCAL_LLM_MODEL_NAME=llava # Kullandığınız yerel model (multimodal CAPTCHA için)
        OPENAI_MODEL_NAME=gpt-4-vision-preview # OpenAI için model
        CAPTCHA_SOLVER_ENABLED=true
        DEFAULT_TIMEOUT=30000
        BROWSER_LAUNCH_ARGS=--start-maximized # Tarayıcı başlatma argümanları (virgülle ayrılmış)
        # VIEWPORT_WIDTH=1920
        # VIEWPORT_HEIGHT=1080
        \`\`\`

5.  **(Manuel) ESLint Kurulumu:**
    Proje kök dizininde \`.eslintrc.js\` adında bir dosya oluşturun ve aşağıdaki içeriği yapıştırın:
    \`\`\`javascript
    module.exports = {
      root: true,
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'prettier'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier' // Prettier her zaman en sonda olmalı
      ],
      env: { node: true, es2021: true },
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        project: './tsconfig.json', // Tip tabanlı linting için önemli
      },
      rules: {
        'prettier/prettier': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }], // logger kullanıyoruz
      },
      ignorePatterns: [
        'node_modules/', 'dist/', 'reports/', 'playwright-report/',
        'test-results/', 'coverage/', 'logs/', '.husky/', 'playwright/.auth/'
      ],
    };
    \`\`\`

6.  **(Manuel) Pre-commit Hook'ları (Husky & lint-staged):**
    Kod kalitesini korumak için commit öncesi otomatik lint ve formatlama için:
    \`\`\`bash
    # Husky'yi kurun (zaten devDependencies içinde olmalı)
    npx husky install

    # pre-commit hook'unu ekleyin
    npx husky set .husky/pre-commit "npx lint-staged"

    # Yaptığınız değişiklikleri Git'e ekleyin
    git add .husky/pre-commit .eslintrc.js 
    \`\`\`
    \`package.json\` dosyanızda aşağıdaki \`lint-staged\` konfigürasyonunun olduğundan emin olun:
    \`\`\`json
    "lint-staged": {
      "*.ts": [
        "eslint --fix",
        "prettier --write"
      ]
    }
    \`\`\`

## Konfigürasyon

*   **Ortam Değişkenleri:** \`src/environments/\` altındaki \`.env.<ortam_adi>\` dosyaları veya proje kökündeki \`.env\` dosyası aracılığıyla yapılır. \`ConfigManager\` (\`src/base/configManager.ts\`) bu değişkenleri yükler.
    *   \`NODE_ENV\`: Çalışma ortamını belirtir (örn: \`development\`, \`staging\`, \`production\`). Bu değere göre ilgili \`.env\` dosyası yüklenir.
    *   \`BASE_URL\`: Test edilecek uygulamanın ana URL'si.
    *   \`API_BASE_URL\`: Testlerde kullanılacak API'nin ana URL'si.
    *   \`LLM_PROVIDER\`: Kullanılacak LLM sağlayıcısı (\`local\`, \`openai\` vb.).
    *   \`LLM_ENDPOINT\`: LLM API endpoint URL'si.
    *   \`LLM_API_KEY\`: LLM API anahtarı.
    *   \`LOCAL_LLM_MODEL_NAME\`: Yerel LLM kullanılıyorsa model adı (örn: \`llava\`, \`llama2`).
    *   \`OPENAI_MODEL_NAME\`: OpenAI kullanılıyorsa model adı (örn: \`gpt-4-vision-preview\`, \`gpt-3.5-turbo`).
    *   \`CAPTCHA_SOLVER_ENABLED\`: CAPTCHA çözme özelliğinin aktif olup olmadığını belirtir (\`true\`/\`false\`).
    *   \`BROWSER_LAUNCH_ARGS\`: Tarayıcı başlatılırken kullanılacak ek argümanlar (virgülle ayrılmış, örn: \`--start-fullscreen,--disable-gpu\`).
    *   \`VIEWPORT_WIDTH\`, \`VIEWPORT_HEIGHT\`: Tarayıcı penceresinin varsayılan genişlik ve yüksekliği.
*   **Playwright:** \`playwright.config.ts\` dosyası üzerinden Playwright'a özel ayarlar (timeout'lar, paralel worker sayısı, raporlayıcılar, proje bazlı tarayıcı ayarları vb.) yapılır.
*   **Cucumber:** \`cucumber.js\` dosyası üzerinden Cucumber'a özel ayarlar (feature dosyalarının yolu, step definition'ların yolu, formatlayıcılar vb.) yapılır.

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

*   **Allure raporunu manuel olarak oluştur/yeniden oluştur:**
    \`\`\`bash
    npm run report:allure
    \`\`\`

*   **Oluşturulan Allure raporunu aç:**
    \`\`\`bash
    npm run open:allure
    \`\`\`

*   **Playwright Debug Modunda Çalıştır:**
    \`\`\`bash
    npm run test:debug
    \`\`\`
    Bu, Playwright Inspector'ı açar ve adımları tek tek izlemenizi sağlar.

*   **Lint Kontrolü:**
    \`\`\`bash
    npm run lint
    \`\`\`

*   **Otomatik Formatlama (Prettier):**
    \`\`\`bash
    npm run format
    \`\`\`

## LLM Entegrasyonu

*   **\`LLMClient\` (\`src/llm/llmClient.ts\`):**
    *   \`.env\` dosyanızdaki \`LLM_PROVIDER\`, \`LLM_ENDPOINT\`, \`LLM_API_KEY\` ve model isimleri (\`LOCAL_LLM_MODEL_NAME\`, \`OPENAI_MODEL_NAME\`) ile yapılandırılır.
    *   **CAPTCHA Çözme:** \`solveCaptcha(imageBase64: string, instructions?: string)\` metodu, bir CAPTCHA görüntüsünün base64 string'ini alır ve LLM'den çözümünü ister. \`BasePage\` içindeki \`solveAndFillCaptcha\` metodu bu işlevi kullanarak UI'daki CAPTCHA'ları otomatik olarak çözmeye çalışır. Bunun için multimodal bir LLM (örn: LLaVA, GPT-4 Vision) gereklidir.
    *   **Soru Sorma:** \`questionAnswer(prompt: string, systemPrompt?: string)\` metodu, genel amaçlı sorular sormak için kullanılabilir.

## Katkıda Bulunma

Katkılarınız her zaman kabulümüzdür! Lütfen şu adımları izleyin:

1.  Bu repoyu fork'layın.
2.  Yeni bir branch oluşturun (\`git checkout -b özellik/yeni-bir-ozellik\`).
3.  Değişikliklerinizi commit'leyin (\`git commit -am 'Yeni bir özellik eklendi'\`).
4.  Branch'inizi push'layın (\`git push origin özellik/yeni-bir-ozellik\`).
5.  Bir Pull Request oluşturun.

Lütfen kodlama standartlarına uyun ve değişiklikleriniz için testler ekleyin.

## Lisans

Bu proje MIT Lisansı altındadır. Detaylar için \`LICENSE\` dosyasına bakınız (Bu projede henüz bir LICENSE dosyası eklenmedi, isterseniz ekleyebilirsiniz).

---

## Ek: Manuel CI/CD Kurulumu (GitHub Actions)

Projenizde sürekli entegrasyon ve sürekli dağıtım (CI/CD) süreçlerini otomatikleştirmek için GitHub Actions kullanabilirsiniz. Aşağıda temel bir workflow örneği verilmiştir.

1.  Proje kök dizininizde \`.github/workflows/\` klasörünü oluşturun (eğer yoksa).
2.  Bu klasörün içine \`ci.yml\` adında bir dosya oluşturun.
3.  Aşağıdaki içeriği \`ci.yml\` dosyasına yapıştırın:

\`\`\`yaml
name: Playwright Tests CI

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]
  workflow_dispatch:

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Set up Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    # ESLint ve Prettier kontrollerini projenizde .eslintrc.js yapılandırdıktan sonra aktif edin.
    # - name: Run Linters
    #   run: npm run lint
    # - name: Check Formatting (Prettier)
    #   run: npm run format -- --check

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Run Playwright tests (Allure)
      run: npm run test:allure # Bu script Allure formatlayıcısı ile cucumber-js çalıştırır
      env:
        # CI ortamı için gerekli ortam değişkenlerini GitHub Secrets üzerinden sağlayın
        # BASE_URL: ${{ secrets.BASE_URL }}
        # LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
        # Diğer .env değişkenleri...
        # Önemli: Hassas bilgileri doğrudan workflow dosyasına yazmayın.
        # GitHub repository ayarlarından Secrets olarak ekleyin.
        # .env dosyasındaki tüm değişkenleri buraya CI için eklemeniz gerekebilir.
        # Örneğin:
        NODE_ENV: development # Veya test ortamınız için uygun olan
        CI: true # Playwright config dosyasındaki CI ayarlarını tetikler

    - name: Upload Allure results
      if: always() # Testler fail etse bile sonuçları yükle
      uses: actions/upload-artifact@v4
      with:
        name: allure-results-${{ matrix.node-version }}-${{ github.sha }}
        path: reports/allure-results/
        retention-days: 7

    - name: Upload Playwright HTML report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report-${{ matrix.node-version }}-${{ github.sha }}
        path: playwright-report/
        retention-days: 7
        
    - name: Upload Screenshots on failure
      if: failure() # Sadece testler fail ederse çalışır
      uses: actions/upload-artifact@v4
      with:
        name: failure-screenshots-${{ matrix.node-version }}-${{ github.sha }}
        path: reports/screenshots/ 
        retention-days: 7
\`\`\`

Bu workflow, push ve pull request'lerde otomatik olarak testleri çalıştıracak ve Allure sonuçlarını artifact olarak saklayacaktır. Daha gelişmiş senaryolar (örneğin, Allure raporunu GitHub Pages'de yayınlama) için workflow'u genişletebilirsiniz. CI için gerekli ortam değişkenlerini (API anahtarları, URL'ler vb.) GitHub repository secrets olarak eklemeyi unutmayın.
