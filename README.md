# Your first SAP BTP project: Employee Directory

A complete local SAP CAP application for creating, viewing, editing, deleting, searching and filtering employees. Includes fictional sample records and SAP BTP deployment configuration.

## Run it

Open PowerShell in `C:\Users\dream\Desktop\SAP`:

```powershell
npm.cmd start
```

Open http://localhost:4004. Keep the terminal running. Press Ctrl+C to stop.

The dependencies and local database have already been set up. On a fresh copy:

```powershell
npm.cmd ci
npm.cmd run db:setup
npm.cmd start
```

**Do not rerun `db:setup` to start the app.** It recreates the schema and reloads sample records, resetting your local data. Normal restarts preserve your records in `db.sqlite`.

## What you have built

Your browser → CAP API → SQLite database.

1. The browser displays employees and sends requests when you save changes.
2. CAP (Cloud Application Programming Model) is SAP's framework for business applications. It generates standard data operations from your model.
3. Node.js runs the JavaScript backend.
4. SQLite stores the data in a file on your computer. Later, SAP HANA Cloud takes this role in BTP.
5. BTP (Business Technology Platform) is the SAP cloud platform where we can deploy this application.

The interface uses HTML, CSS and JavaScript; it is not a SAP Fiori/UI5 application. This keeps the first project easy to inspect without another framework or build step.

## Learn by opening these files in order

| File | What it teaches |
| --- | --- |
| `db/schema.cds` | The data model: an entity becomes a table, and fields become columns. `cuid` adds a UUID; `managed` adds audit fields. |
| `db/data/directory-Employees.csv` | Fictional starting records loaded during database setup. |
| `srv/employee-service.cds` | A service exposes the employee entity as an OData API. A projection selects the entity we expose. |
| `srv/employee-service.js` | Validation runs before saving. Names cannot be blank; emails are checked and normalized. |
| `app/index.html` | The structure of the screen and forms. |
| `app/style.css` | Colors, typography, spacing and mobile layout. |
| `app/app.js` | Fetches records and sends create, update and delete requests. User text is rendered with `textContent`. |
| `package.json` | Dependencies, commands and different local/cloud settings. |
| `mta.yaml` | The cloud deployment recipe connecting the backend, application router, database and authentication service. |

## First lesson: follow one employee

Open the app and click **Add employee**. Enter details and save.

1. The form creates a JavaScript object containing your fields.
2. `fetch()` sends that object in a POST request to `/api/directory/Employees`.
3. CAP checks the model and our validation handler.
4. CAP inserts a row into SQLite and returns the saved employee with a generated ID.
5. The browser reloads the directory and updates its counts.

Editing uses PATCH (change fields). Deleting uses DELETE (remove a record). Reading uses GET. These are standard HTTP methods.

Try opening http://localhost:4004/api/directory/Employees in your browser. The JSON is the same data the screen consumes. `/api/directory/$metadata` describes the service in OData's standard format.

## Useful commands

```powershell
npm.cmd run dev       # Restart the backend when source files change
npm.cmd test          # Isolated in-memory API integration tests
npm.cmd run build     # Generate HANA/backend deployment output and copy the UI
```

Development mode uses dummy authentication: all local visitors can edit. Production requires XSUAA authentication. Every authenticated user has edit access in this learning application; it does not implement administrator/reader roles. Use fictional employee details while learning.

See [the BTP deployment guide](docs/BTP-DEPLOYMENT.md) for the cloud stage.

## Troubleshooting

- **PowerShell blocks npm.ps1:** use `npm.cmd` as shown above.
- **Port 4004 in use:** stop the other app or run `$env:PORT = '4005'` then `npm.cmd start`.
- **Missing table/database:** on a fresh copy, run `npm.cmd run db:setup` once.
- **Missing packages:** run `npm.cmd ci` with internet access.
- **Changes missing after restart:** use the same project folder. The database path is relative to it.

## Official SAP references

- [CAP documentation](https://cap.cloud.sap/docs/)
- [SQLite for local development](https://cap.cloud.sap/docs/guides/databases/sqlite)
- [Deploy CAP to Cloud Foundry](https://cap.cloud.sap/docs/guides/deploy/to-cf)
