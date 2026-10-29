# Architecture.md: Build a simple, full-stack web application named **Beans Tracker**

## Purpose
Help homebrewers and baristas monitor their coffee bean inventory and brew history. The application collects data about coffee roasters, beans, and brew methods, allowing users to log their daily brew details (dose, yield, rating, notes) and view their coffee consumption progress on a dashboard.

## Tech Stack
* Frontend: React + TypeScript + Vite + Tailwind CSS
* Backend: Node.js + TypeScript + Express
* Database: MySQL
* ORM: Prisma
* API style: REST API
* Use Docker Compose for MySQL
* Use `.env.example` for database URL configuration

## Code Rules
* Do not add comments unless truly necessary.
* Use PascalCase for all classes, types, interfaces, enums, React components, database models, API DTOs, and JSON property names.
* Local variables may use camelCase.
* Keep code lines below 150 characters where practical.
* Use a clean and simple folder structure.
* Do not add authentication in this first version. Assume one user (the homebrewer) uses the application.

## Main Entities

1. Roaster
   * Id
   * Name
   * Location
   * CreatedAt

2. Bean
   * Id
   * RoasterId
   * Name
   * Origin
   * RoastLevel
   * CreatedAt

3. BrewMethod
   * Id
   * Name
   * CreatedAt

4. Brew
   * Id
   * BeanId
   * BrewMethodId
   * Dose (Float)
   * Yield (Float)
   * Rating (Integer 1-5)
   * Notes (Text)
   * BrewedAt
   * CreatedAt

## Database Rules
* Rating in `Brew` must be validated to only accept values from 1 to 5.
* When deleting a `Bean`, all associated `Brew` records must be handled (cascade delete).
* Use Prisma migrations and seed one example Roaster, three Beans, and standard Brew Methods (e.g., "V60", "Espresso", "French Press").

## Backend Features

1. CRUD Roaster
   * Create, list, detail, update, delete roaster.

2. CRUD Bean
   * Create, list, detail, update, delete bean inside a roaster.

3. CRUD BrewMethod
   * Create, list, edit, delete brew methods.

4. Brew Logging (Manual Recording)
   * Endpoint to log a new brew for a specific bean.
   * Read and calculate brew statistics for each bean.
   * Return a result containing:
     * BeanId
     * TotalBrews
     * AverageRating
     * LastBrewedAt

5. Dashboard API
   * Return a summary:
     * TotalRoasters
     * TotalBeans
     * TotalBrews
     * BeansTested
     * BeansUntested
   * Return bean progress/stats data:
     * BeanId
     * BeanName
     * RoasterName
     * TotalBrews
     * AverageRating
     * LatestBrewAt
     * BeanStatus
   * BeanStatus rules:
     * `UNTESTED`: no brew stored
     * `NEEDS_IMPROVEMENT`: average rating < 3
     * `GOOD`: average rating >= 3 and < 4.5
     * `FAVORITE`: average rating >= 4.5

## Frontend Pages

1. Dashboard
   * Summary cards: total roasters, total beans, total brews, tested beans, untested beans.
   * Table showing each bean, roaster name, total brews, average rating, latest brew date, and bean status.
   * Dashboard reads only from the MySQL database.

2. Roaster Management
   * List roasters.
   * Form to create and edit roasters.

3. Bean Management
   * List beans in a selected roaster.
   * Form to add and edit bean information (Origin, Roast Level).

4. Brew Method Management
   * List available brew methods.
   * Form to add and edit brew methods.

5. Bean Detail & Brew History
   * Show bean information.
   * Form to log a new brew (Select Brew Method, Input Dose, Yield, Rating, Notes).
   * Show total brews and average rating.
   * Show brew history table with date, method, dose/yield ratio, rating, and notes.

## UI Requirements
* Use Indonesian language for all labels, buttons, messages, and validation.
* Create a clean, responsive homebrewer dashboard.
* Use simple tables, cards, badges, forms, confirmation dialog before delete, and empty states.
* Use status badge colors:
  * Favorite: green
  * Good: blue
  * Needs Improvement: orange
  * Untested: red
* Do not add charts in the first version.

## Required API Routes
* `GET /api/roasters`
* `POST /api/roasters`
* `GET /api/roasters/:Id`
* `PUT /api/roasters/:Id`
* `DELETE /api/roasters/:Id`
* `GET /api/roasters/:RoasterId/beans`
* `POST /api/roasters/:RoasterId/beans`
* `PUT /api/beans/:Id`
* `DELETE /api/beans/:Id`
* `GET /api/brew-methods`
* `POST /api/brew-methods`
* `PUT /api/brew-methods/:Id`
* `DELETE /api/brew-methods/:Id`
* `GET /api/beans/:BeanId/brews`
* `POST /api/beans/:BeanId/brews`
* `GET /api/dashboard`
* `GET /api/beans/:Id/stats`

## Deliverables
* Complete frontend and backend source code.
* Prisma schema, migration, and seed data.
* Docker Compose file for MySQL.
* `.env.example`.
* README with installation, database migration, seed, frontend/backend startup, and Docker usage.
* Ensure the application builds successfully and all basic CRUD plus brew logging work.

## Project Structure
* Use a TypeScript monorepo with npm workspaces.
* Structure:

```text
beans-tracker/
  apps/
    web/
    api/
  packages/
    shared/
