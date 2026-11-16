# Deploying your directory to SAP BTP

The local application works without a BTP account. Cloud deployment has not been performed: it requires your account, a Cloud Foundry environment, entitlements and an available SAP HANA Cloud database.

Follow the [official CAP Cloud Foundry guide](https://cap.cloud.sap/docs/guides/deploy/to-cf) alongside these project-specific steps. Trial service availability and quotas vary; verify what your account offers before provisioning services.

## Understand the cloud parts

- **Subaccount:** an isolated area of your BTP account for applications and services.
- **Cloud Foundry space:** the place where this project's processes and service instances run.
- **SAP HANA Cloud:** the production database. An HDI container isolates this application's tables inside HANA.
- **XSUAA:** SAP's authentication/authorization service. The application requires a signed-in user.
- **Application router:** the entry point that handles login and forwards requests and tokens to CAP.
- **MTA:** a multi-target application package bundling deployment instructions for these components.

## Account preparation

1. Create an SAP account and access the [SAP BTP trial entry](https://account.hanatrial.ondemand.com/).
2. In the BTP cockpit, create/select your trial subaccount and enable Cloud Foundry if available. Create/select an organization and space.
3. Check entitlements for Authorization and Trust Management (`xsuaa`, `application` plan) and SAP HANA Schemas & HDI Containers (`hana`, `hdi-shared` plan).
4. Provision/start SAP HANA Cloud and ensure it is available to your selected Cloud Foundry space. This MTA creates an HDI container, not the underlying HANA Cloud database.
5. Install the Cloud Foundry CLI, its MultiApps plugin, and the Cloud MTA Build Tool (`mbt`) with their documented prerequisites. These tools have not been installed by this project.

Do not paste account passwords, service keys or tokens into source files or chat.

## Build and deploy

Run from the project root after the account and tools are ready:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
mbt build
cf login -a <API-ENDPOINT-FROM-YOUR-BTP-COCKPIT> --sso
cf target -o <YOUR-ORG> -s <YOUR-SPACE>
cf deploy mta_archives/sap-employee-directory_1.0.0.mtar
cf apps
```

Replace the angle-bracket placeholders with your own values. Use your organization's login method if SSO is configured differently.

Open the route for `sap-employee-directory` (the application router). It should redirect you to SAP sign-in and then display the directory. Do not use the backend's route as the browser entry point.

## Files prepared for you

- `mta.yaml`: CAP server, HANA deployer, application router, XSUAA and HDI container.
- `xs-security.json`: XSUAA configuration. No custom roles are required; the service requires any authenticated user.
- `.deploy/app-router/xs-app.json`: routes requests to CAP with CSRF protection.
- `scripts/copy-ui.js`: includes the browser files in the production backend build.
- Production settings in `package.json`: select HANA and XSUAA instead of local SQLite and dummy authentication.

The UI fetches a CSRF token before writes so it can work behind the router. Service binding credentials come from BTP, not from checked-in files.

## Verification after deployment

Sign in through the router. Add an employee, edit its status, search for it and delete it. Restart the CAP application and confirm other saved records remain. Signed-out API access should require authentication. These cloud checks must be performed after deployment; a successful local build does not verify your account's services or login configuration.

Sample records are included in the deployment. This is a learning project. Before handling real employee data, design appropriate access roles, retention and operational controls for your organization.
