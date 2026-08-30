# STB Prospect Portal

Application web de gestion de prospects pour la **Société Tunisienne de Banque (STB)**, développée dans le cadre d'un stage d'ingénieur. Le projet démontre une architecture microservices moderne : authentification sécurisée, communication événementielle, API Gateway, CI/CD complet, et observabilité (métriques + logs).

## Équipe

- **Mohamed Moncef Haddad** — Infrastructure, DevOps, CI/CD, RabbitMQ, API Gateway, Monitoring/Logging
- **Hiba Kaabi** — Authentification, gestion des prospects, notifications, interface Angular

## Architecture
                    Angular (Nginx, port 4200)
                                |
                    API Gateway (YARP, port 8000)
                                |
    +----------------+----------------+----------------+
    |                |                |                |
    v                v                v                v
    AuthService ProspectService NotificationService
(port 8080) (port 8081) (port 8082)
| | |
v v v
PostgreSQL PostgreSQL PostgreSQL
(stb_auth) (stb_prospect) (stb_notification)
| | |
+----------------+----------------+
|
RabbitMQ (bus d'événements)
"UserRegistered" -> ProspectService, NotificationService

Observabilité :
Prometheus + Grafana (métriques) | Elasticsearch + Kibana + Filebeat (logs)

## Stack technique

| Composant | Technologie |
|---|---|
| Frontend | Angular (standalone components), TypeScript |
| Backend | ASP.NET Core Web API (.NET 10) |
| Base de données | PostgreSQL 16 (Entity Framework Core) |
| Authentification | JWT + BCrypt, gestion des rôles (Admin/Prospect) |
| Messagerie asynchrone | RabbitMQ |
| API Gateway | YARP (Yet Another Reverse Proxy) |
| Métriques | Prometheus + Grafana |
| Logs centralisés | Elasticsearch + Kibana + Filebeat (stack ELK) |
| Conteneurisation | Docker + Docker Compose |
| CI/CD | GitHub Actions (build, tests, images Docker, publication Docker Hub) |
| Tests unitaires | xUnit + EF Core InMemory |

## Fonctionnalités

- Inscription et connexion sécurisées (JWT)
- Espace personnel prospect
- Panneau d'administration : liste, modification, suppression des prospects
- Création automatique du profil prospect à l'inscription (via événement RabbitMQ)
- Notifications en temps réel pour les administrateurs (nouveau prospect inscrit)
- API Gateway centralisant l'accès à tous les microservices
- Pipeline CI/CD complet : build, tests automatisés, construction et publication des images Docker
- Tableaux de bord de monitoring (Grafana) et recherche de logs (Kibana)

## Lancer le projet en local

Prérequis : [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
git clone https://github.com/moncef99-hd/stb-prospect-portal.git
cd stb-prospect-portal
docker compose up --build
```

Une fois les conteneurs démarrés, appliquer les migrations de base de données pour chaque service (à faire une seule fois, ou après un `git pull` qui ajoute une migration) :

```bash
cd backend/AuthService && dotnet ef database update && cd ../..
cd backend/ProspectService && dotnet ef database update && cd ../..
cd backend/NotificationService && dotnet ef database update && cd ../..
```

### Accès aux interfaces

| Service | URL | Identifiants |
|---|---|---|
| Application (frontend) | http://localhost:4200 | — |
| API Gateway | http://localhost:8000 | — |
| RabbitMQ Management | http://localhost:15672 | guest / guest |
| Grafana | http://localhost:3000 | admin / admin |
| Kibana | http://localhost:5601 | — |
| Prometheus | http://localhost:9090 | — |
| Elasticsearch | http://localhost:9200 | — |

## Tests

Chaque microservice backend dispose de sa propre suite de tests unitaires :

```bash
cd backend/AuthService.Tests && dotnet test && cd ../..
cd backend/ProspectService.Tests && dotnet test && cd ../..
cd backend/NotificationService.Tests && dotnet test && cd ../..
```

## CI/CD

Chaque push ou pull request vers `develop`/`main` déclenche automatiquement :
1. Build et tests unitaires pour chaque microservice (.NET) et le frontend (Angular)
2. Construction des images Docker pour tous les services
3. Publication des images sur Docker Hub (uniquement lors d'un push, pas sur les pull requests)

## Méthodologie

Le projet suit une discipline **GitFlow** :
- `main` — branche stable
- `develop` — branche d'intégration
- `feature/*` — une branche par fonctionnalité, fusionnée via Pull Request après validation par la CI
