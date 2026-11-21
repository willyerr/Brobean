BROBEAN — P10.2.2 BACKEND API PATCH

Files to copy into the project, preserving the folder structure:
- apps/api/src/index.ts (replace existing)
- apps/api/src/repositories/preparationRepository.ts (new)
- apps/api/src/repositories/brewRepository.ts (new)
- apps/api/src/services/preparationService.ts (new)
- apps/api/src/services/brewService.ts (new)
- apps/api/src/controllers/preparationController.ts (new)
- apps/api/src/controllers/brewController.ts (new)
- apps/api/src/routes/preparationRoutes.ts (new)
- apps/api/src/routes/brewRoutes.ts (new)

No migration is added in this patch. It uses the P10.2.1 tables already present in the local database.

API endpoints:
Preparations:
GET    /api/preparations
GET    /api/preparations?includeArchived=true
GET    /api/preparations/:id
POST   /api/preparations                 { "name": "My Method", "note": "..." }
PUT    /api/preparations/:id
PATCH  /api/preparations/:id/archive
PATCH  /api/preparations/:id/restore
GET    /api/preparations/:id/parameters
PUT    /api/preparations/:id/parameters  { "parameters": [{ "key": "brew_time", "enabled": true, "phase": "during", "sortOrder": 1, "required": false }] }

Brews:
GET    /api/brews
GET    /api/brews?beanId=1
GET    /api/brews?preparationId=1
GET    /api/brews/:id
POST   /api/brews
       { "beanId": 1, "preparationId": 1, "rating": 4,
         "brewedAt": "2026-11-20T03:00:00.000Z", "note": "Sweet",
         "values": { "grind_weight": 15, "brew_temperature": 93, "brew_time": 150 } }
PUT    /api/brews/:id (partial update; values replaces the full values object when supplied)
DELETE /api/brews/:id

Important behavior:
- Rating is required and must be an integer from 1 to 5.
- Parameter values must match the active parameter configuration and value type.
- Required parameters configured for a method must be supplied.
- A brew references an existing bean and active preparation.
- Deleting a bean referenced by a brew remains blocked by the database foreign key.
- Built-in methods cannot be edited or archived in this first API increment; custom methods can.
- Historical brews store their own parameter values, so changing a method's configuration does not rewrite old brew values.

After copying, restart API:
  npm run dev --workspace=@brobean/api

Then test the endpoints using the examples agreed with the assistant. Do not reset or delete the SQLite database.
