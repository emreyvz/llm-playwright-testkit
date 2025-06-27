# Playwright Cucumber LLM Starter Kit

This project is a starter kit for a modern test automation framework using Playwright, Cucumber, and TypeScript. It includes advanced capabilities such as solving CAPTCHAs using local or remote LLM (Large Language Model) services and querying LLMs during tests.

## Key Features

* **Playwright & CucumberJS Integration:** Playwright for browser automation and Cucumber for BDD.
* **TypeScript:** Static typing and enhanced developer experience.
* **Page Object Model (POM):** Reusable page objects, including `BasePage`.
* **Centralized Locator Management:** UI elements managed via JSON files under `src/locators`.
* **Advanced Environment Management:** Environment-specific configuration using `.env` files (e.g., `.env.development`, `.env.staging`) and `ConfigManager`.
* **LLM Utility Module:** `LLMClient` to interact with local (e.g., Ollama) and API-based (e.g., OpenAI) LLMs.
    * CAPTCHA-solving capability.
    * General question-answering capability.
* **API Request Manager:** Send and manage API requests within tests using `ApiClient`.
* **Reporting:**
    * Playwright HTML and JSON reports.
    * Automatic screenshot capture for failed scenarios.
* **Error Handling & Logging:** Detailed logging using Winston (saved under `logs/`) and centralized `ErrorHandler`.
* **Parallel Execution:** Run tests in parallel with Playwright's built-in support.
* **Flexible Browser Configuration:** Configure headless mode, viewport size, and launch arguments via `.env` or CLI.
* **Utility Helpers:** Helper functions for date, file, and string operations.
* **Pre-commit Hooks (Manual Setup):** ESLint/Prettier checks via Husky and lint-staged.
* **CI/CD Integration (Manual Setup):** Example workflow provided for GitHub Actions.

## Installation

1. **Clone the project:**
    ```bash
    git clone <project_url>
    cd playwright-cucumber-llm-starter
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Install Playwright browsers:**
    ```bash
    npx playwright install --with-deps
    ```

4. **Configure environment file:**
    * Copy the `.env.example` file from `src/environments/`.
    * Rename it as `.env` in the root or `.env.development` under `src/environments/` based on your environment.
    * Edit the file values (e.g., BASE_URL, API_BASE_URL, LLM_ENDPOINT, LLM_API_KEY) to match your local setup.
    * **Example `.env.development` content:**
       ```bash
        BASE_URL=http://localhost:3000
        API_BASE_URL=http://localhost:8080/api
        USERNAME=dev_user
        PASSWORD=dev_password
        LLM_API_KEY=your_local_or_dev_llm_api_key
        LLM_ENDPOINT=http://localhost:11434
        LLM_PROVIDER=local
        LOCAL_LLM_MODEL_NAME=llava
        OPENAI_MODEL_NAME=gpt-4-vision-preview
        CAPTCHA_SOLVER_ENABLED=true
        DEFAULT_TIMEOUT=30000
        BROWSER_LAUNCH_ARGS=--start-maximized 
        VIEWPORT_WIDTH=1920
        VIEWPORT_HEIGHT=1080
        LOG_LEVEL=info
        SLOWMO=false
        HEADLESS=false
        BROWSER=chromium
       ```

## Running Tests

You can run tests using the following npm scripts:

* **Run all tests with default browser (Chromium):**
    ```bash
    npm run test
    ```

* **Run with a specific browser:**
    ```bash
    npm run test:chrome
    npm run test:firefox
    npm run test:webkit
    ```

* **Run in headless mode:**
    ```bash
    npm run test:headless
    ```

## LLM Integration

* **LLMClient:**
    * Configured via `.env` file using `LLM_PROVIDER`, `LLM_ENDPOINT`, `LLM_API_KEY`, and model names (`LOCAL_LLM_MODEL_NAME`, `OPENAI_MODEL_NAME`).
    * **Solving CAPTCHA:** The `solveCaptcha(imageBase64: string, instructions?: string)` method accepts a CAPTCHA image in base64 and returns a solution from the LLM. The `solveAndFillCaptcha` method in `BasePage` uses this to automatically solve CAPTCHA fields in the UI. Requires a multimodal LLM (e.g., LLaVA, GPT-4 Vision).
    * **Asking Questions:** Use `questionAnswer(prompt: string, systemPrompt?: string)` to query general-purpose prompts.


# Playwright Cucumber LLM Starter Kit

Bu proje, Playwright, Cucumber ve TypeScript kullanarak modern bir test otomasyon çerçevesi için bir başlangıç kitidir. Yerel veya uzak LLM (Büyük Dil Modeli) hizmetlerini kullanarak CAPTCHA'ları çözme ve testler sırasında LLM'lere soru sorma gibi gelişmiş yetenekler içerir. 

[Projenin kullanımına yönelik detaylı Türkçe kaynağa buradan ulaşabilirsiniz.](https://medium.com/@emreyavuz528/playwright-ve-llm-deste%C4%9Fi-ile-captcha-bypass-edebilen-otomasyon-%C3%A7er%C3%A7evesi-nas%C4%B1l-yaz%C4%B1l%C4%B1r-28716894146f)

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
    ```bash
    git clone <proje_url>
    cd playwright-cucumber-llm-starter
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Playwright Tarayıcılarını Yükleyin:**
    ```bash
    npx playwright install --with-deps
    ```

4.  **Ortam Dosyasını Yapılandırın:**
    *   `src/environments/` klasöründeki `.env.example` dosyasını kopyalayın.
    *   Proje kök dizinine `.env` olarak veya `src/environments/` altında `.env.development` (ya da çalıştığınız ortama göre) olarak yeniden adlandırın.
    *   Dosya içindeki değerleri (BASE_URL, API_BASE_URL, LLM_ENDPOINT, LLM_API_KEY vb.) kendi ortamınıza göre düzenleyin.
    *   **Örnek `.env.development` içeriği:**
       ```bash
        BASE_URL=http://localhost:3000
        API_BASE_URL=http://localhost:8080/api
        USERNAME=dev_user
        PASSWORD=dev_password
        LLM_API_KEY=your_local_or_dev_llm_api_key
        LLM_ENDPOINT=http://localhost:11434
        LLM_PROVIDER=local
        LOCAL_LLM_MODEL_NAME=llava
        OPENAI_MODEL_NAME=gpt-4-vision-preview
        CAPTCHA_SOLVER_ENABLED=true
        DEFAULT_TIMEOUT=30000
        BROWSER_LAUNCH_ARGS=--start-maximized 
        VIEWPORT_WIDTH=1920
        VIEWPORT_HEIGHT=1080
        LOG_LEVEL=info
        SLOWMO=false
        HEADLESS=false
        BROWSER=chromium
       ```

## Testleri Çalıştırma

Aşağıdaki npm script'lerini kullanarak testleri çalıştırabilirsiniz:

*   **Tüm testleri varsayılan tarayıcı (Chromium) ile çalıştır**
    ```bash
    npm run test
    ```

*   **Belirli bir tarayıcı ile çalıştır:**
    ```bash
    npm run test:chrome
    npm run test:firefox
    npm run test:webkit
    ```

*   **Headless modda çalıştır:**
    ```bash
    npm run test:headless
    ```

## LLM Entegrasyonu

*   **LLMClient:**
    *   `.env` dosyanızdaki `LLM_PROVIDER`, `LLM_ENDPOINT`, `LLM_API_KEY` ve model isimleri (`LOCAL_LLM_MODEL_NAME`, `OPENAI_MODEL_NAME`) ile yapılandırılır.
    *   **CAPTCHA Çözme:** `solveCaptcha(imageBase64: string, instructions?: string)` metodu, bir CAPTCHA görüntüsünün base64 string'ini alır ve LLM'den çözümünü ister. `BasePage` içindeki `solveAndFillCaptcha` metodu bu işlevi kullanarak UI'daki CAPTCHA'ları otomatik olarak çözmeye çalışır. Bunun için multimodal bir LLM (örn: LLaVA, GPT-4 Vision) gereklidir.
    *   **Soru Sorma:** `questionAnswer(prompt: string, systemPrompt?: string)` metodu, genel amaçlı sorular sormak için kullanılabilir.
