# StudentsManager

A web application built on .NET, React, MSSQL, Azure, and OpenAI, designed to manage course-related data at the University of Economics – Varna. Students actively use the platform while also developing new functionalities for it.

## Environments

| Environment | URL | Notes |
|---|---|---|
| Production | https://students-manager.site/ | Public production deployment |
| Development | https://students-manager-dev.azurewebsites.net/ | Dev backend / API deployment |
| React (SPA) | https://students-manager-spa.azurewebsites.net/ | React version of the platform |

## CI/CD Status

[![Docker Compose Build Check](https://github.com/profjordanov/students-manager/actions/workflows/docker-compose.yml/badge.svg)](https://github.com/profjordanov/students-manager/actions/workflows/docker-compose.yml)

[![Deploy Manager to Azure App Service](https://github.com/profjordanov/students-manager/actions/workflows/dotnet-deploy.yml/badge.svg)](https://github.com/profjordanov/students-manager/actions/workflows/dotnet-deploy.yml)

[![CodeQL](https://github.com/profjordanov/students-manager/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/profjordanov/students-manager/actions/workflows/github-code-scanning/codeql)

[![CodeFactor](https://www.codefactor.io/repository/github/profjordanov/students-manager/badge)](https://www.codefactor.io/repository/github/profjordanov/students-manager)

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=profjordanov_students-manager)

## MVC Frontend (main.js + chatbot)

### main.js

`main.js` is a single bundled + minified file that mixes third-party libraries with a custom global `App` namespace (site logic)

#### Third-party code embedded in the bundle
- jQuery 3.1.1
- GSAP TweenMax 1.19.x (plus plugins like ScrollToPlugin, CSSPlugin, etc.)
- ScrollMagic 2.0.5 (plus GSAP plugin)
- Blazy (lazy-loading images)
- fullPage.js (one-page scrolling sections)
- Swiper (carousel/slider)
- Plyr (video/audio player)
- jQBrowser (UA detection helper)

#### The custom logic inside main.js (what it does)

The bundle defines a global `App` object and initializes multiple modules via `App.init()`.

On window load it calls:

- `App.resize()` → sets `App.viewport_height` / `App.viewport_width` and `App.mobile` based on UA/width
- `App.bind()` → attaches UI handlers (menu, category tabs, video popup, job popup, chatbot start, etc.)
- `App.UI.init()` → lazy-loading + fullPage initialization
- `App.Test.init()` → course tests behavior
- `App.Scroll.init()` → parallax + header scroll states + scroll-to
- `App.sliderSwipper.init()` → initializes Swiper sliders
- plus `App.Animations`, `App.Login`, `App.Profile`, etc.

### Course tests page

The key module is `App.Test`. It binds click handlers on the active question only:

- `#test` click on `.question.active .answer input` → `animateAfterClick`
- `#test` click on `.question.active .answer input` → `countStats`

`countStats()` behavior:

- reads the value of the clicked radio (`action` / `process` / `people` / `idea`)
- reads `data-answer` (`1` or `2`) and `data-question` (`1..40`)
- resets/recomputes category totals
- records the chosen answer for that question

`animateAfterClick()` behavior:

- hides answers for non-active questions initially (`setOpacityToAllUnactiveQuestions`)
- after selecting an answer, animates the transition to the next `.question` (via TweenMax)
- uses a guard like `#test.animating` to prevent double-clicks during transitions

## Chatbot

### External dependencies

- Lodash (`_`) — bundled/minified at the top of the file (utility functions like `_.trim`, `_.map`, `_.filter`, etc.)
- Typed.js — bundled/minified (typing animation effect via `new Typed(...)`)
- jQuery (`$`) — not bundled; expected to be available globally
)

### Example cURL (chatbot save results)

```bash
curl ^"http://localhost:5173/api/chatbot/save_results^" ^
  -H ^"Content-Type: application/json^" ^
  --data-raw ^"{^\^"res^\^":^\^"[{^\^\^\^"question^\^\^\^":^\^\^\^"Welcome! Shall we start with some basic JS questions?^\^\^\^",^\^\^\^"answer^\^\^\^":^\^\^\^"Yes^\^\^\^"}]^\^",^\^"name^\^":^\^"John Doe^\^",^\^"email^\^":^\^"john.doe@example.com^\^"}^"
```

## API examples

### Slido

**GET**

```bash
curl --location 'https://students-manager-dev.azurewebsites.net/api/slido?limit=20&skip=0'
```

**POST question**

```bash
curl --location 'https://students-manager-dev.azurewebsites.net/api/slido/question' \
--header 'Content-Type: application/json' \
--data '{
		"question":"api post get"
}'
```

**POST comment**

```bash
curl --location 'https://students-manager-dev.azurewebsites.net/api/slido/comment' \
--header 'Content-Type: application/json' \
--data '{
		"forumQuestionId": 4,
		"description":"api post comment"
}'
```

**GET questions**

```bash
curl --location 'https://students-manager-dev.azurewebsites.net/api/slido/questions?limit=20&skip=0'
```

Example response:

```json
["api post get","lowwer api/slido/question","because","why?","question",".net 10"]
```

### Login

**Request**

```bash
curl --request POST \
	--url https://students-manager-dev.azurewebsites.net/api/login \
	--header 'content-type: application/json' \
	--data '{
		"email" : "jordan@abv.bg",
		"password" : "password"
}'
```

**Responses**

```json
// 200
{
	"userId": "1eac9820-5e6e-4d10-6e94-08de36f40f78"
}
```

```json
// 401
{
	"message": "Invalid email or password."
}
```

### Events

**Request**

```bash
curl --location 'https://students-manager-dev.azurewebsites.net/api/events' \
--header 'Content-Type: application/json' \
--data '{
    "userId":"123123",
    "type":"test",
    "data":"temp"
}'
```



## 🚀 Technologies

- **Framework:** ASP.NET Core MVC
- **Containerization:** Docker & Docker Compose
- **Testing:** xUnit (StudentsManager.Tests)

## 📁 Project Structure

```
├── StudentsManager.Mvc/          # Main MVC application
│   ├── Controllers/              # MVC Controllers
│   ├── Domain/                   # Domain models
│   ├── Mappings/                 # Object mappings
│   ├── Migrations/               # Database migrations
│   ├── Persistence/              # Data access layer
│   ├── Services/                 # Business logic services
│   ├── Settings/                 # Configuration settings
│   ├── Views/                    # Razor views
│   └── wwwroot/                  # Static files
├── StudentsManager.Tests/        # Unit tests
└── docker-compose.yml            # Docker orchestration
```

## 🛠️ Getting Started

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/get-started) (optional)

### Running Locally

```bash
cd StudentsManager.Mvc
dotnet run
```

### Running with Docker

```bash
./run-app.sh
```

Or using Docker Compose directly:

```bash
docker-compose up
```

### Stopping the Application

```bash
./run-down-app.sh
```

## 🧪 Running Tests

```bash
./run-tests.sh
```

Or manually:

```bash
dotnet test StudentsManager.Tests/
```

## 🐳 Docker Commands

| Script | Description |
|--------|-------------|
| `run-app.sh` | Start the application |
| `run-down-app.sh` | Stop the application |
| `push-app.sh` | Push Docker images |
| `run-tests.sh` | Run test suite |

## 📄 License

See [LICENSE](LICENSE) for details.

## 🔒 Security

See [SECURITY.md](SECURITY.md) for security policies.
