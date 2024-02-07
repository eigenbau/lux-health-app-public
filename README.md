# lux-health-app

## Architecture, file & folder structure

Based on https://itnext.io/choosing-a-highly-scalable-folder-structure-in-angular-d987de65ec7

- Keep services and supporting files with pages and components, unless they are used in multiple sections of the app; In that case move them up in the hirarchy; If service is used by more than one root module, then move it to shared services;

### Pages, Components, Directives, Pipes & other declarables

- All Pages, Components, Directives, Pipes, etc. require their own module based on SCAM, Single Component Angular Module, see: https://dev.to/this-is-angular/angular-revisited-tree-shakable-components-and-optional-ngmodules-36d2
- Each module should declare only one declarable and export the declarable (except for Pages, these are lazy-loaded and require no export)

### Core

- Holds core app components, pages, interceptors, guards, and singleton services (provided in root);
- Register relevant content in core.module.ts;

#### State

- All state services are singleton services, separated into individual services based on use cases;
- State content is initiated in the relevant route and its children via canActivate router guards; This allows for lazy loading of data, seperates UI from state loading, and also provides state even when accessing child routes directly, eg. via page reload;
- Child states are directly bound to parent states via id getters called in the child state; Only create state relations by directly linking child to parent state;
- State API calls, e.g. getPatient(), should only return an Boolean Observable; the response of the API call is listend to by subscribing to state changes;
- API call should check for need to reload based on e.g. id, or parend id changes; If reload is indicated, loading() should be called in order to set loading$ in the related state;
- DELETE: Delete Fhir resources only via deleteResource() method in state to insure that related files get deleted as well; Do not use FhirApi service directly

### Modals

- All modals should be as dumb as possible and should not call state changes directly, but rather pass a request for state changes to the opener;
- Modals are located in shared/directives/modal/handlers & shared/components/form-controls
- Modals should be called via these wrappers - this prevents the cumbersome and repetitive modalController logic to cludder other components and pages

### Shared

- Holds components, directives, pipes, services (non-singleton), etc which have multiple instances in the app;

#### Components / FormGroups

- These components act like formGroups with templates included
- They require a parent FormGroup in the enclosing html tag
- They populate this form with a formGroup in the structure of the related FHIR resource/model
- These components should have no outside dependencies, except to child components and the core module

## Setup resources

### Patient sample data

- Synthea: https://github.com/synthetichealth/synthea;
- Used Java(TM) SE Runtime Environment (build 1.8.0_281-b09);

### Bulk import of FHIR resources

#### Basic guidelines

https://cloud.google.com/solutions/importing-fhir-clinical-data

#### Guidelines to manage permissions of Cloud HC Service Agent to access GS Bucket

https://cloud.google.com/healthcare/docs/how-tos/permissions-healthcare-api-gcp-products

IAM: Cloud Healthcare Service Agent _(service-[NUMBER]@gcp-sa-healthcare.iam.gserviceaccount.com)_ requires the following roles:

- Healthcare Service Agent;
- Pub/Sub Publisher;
- Storage Object Admin;

#### Import Synthea resource bundles with GCloud admin

- Import in GCloud console: https://console.cloud.google.com/healthcare/browser/locations/northamerica-northeast1/datasets/lux-health/fhirStores/sandbox/import?project=lux-health-app
- - Use Bundle (Pretty)

#### Import Synthea resource bundles with curl

```Shell
curl -X POST \
'https://healthcare.googleapis.com/v1beta1/projects/lux-health-app/locations/northamerica-northeast1/datasets/lux-health/fhirStores/sandbox:import' \
    -H 'Authorization: Bearer '$(gcloud auth print-access-token) \
    -H 'Content-Type: application/json;charset=utf-8' \
    -d '{
    "contentStructure": "BUNDLE_PRETTY",
    "gcsSource": {
        "uri": "gs://lux-health-app.appspot.com/*"
    }
}'
```

### PWA

#### Splash screens

Resource for automatic file and code generation: https://appsco.pe/developer/splash-screens

#### Favicon generator

https://www.favicon-generator.org/
https://realfavicongenerator.net

### Terminology server

Ontoserver: https://documenter.getpostman.com/view/634774/TVsuBmc9

## Packages

### Apexcharts

- installation: https://apexcharts.com/docs/angular-charts/
- added "scripts": ["node_modules/apexcharts/dist/apexcharts.min.js"] to angular.json

## Updating

What a pain!

- try using npm-check-updates command ncu
- review https://update.angular.io/
- update global @angular/cli
- run: ng update @angular/core
- run: npm update @ionic/angular@latest
- review dependency versions in package.json
- update individual packages
- test, test, and test

# App operations

## Terminology service

### SNOMED CT

- use https://ontoserver.csiro.au/shrimp/ecl/ to build implicit Value Sets

# Firebase

## Deployment

### Hosting

- run $ 'npm run lux-deploy' to deploy to production
- run $ 'npm run lux-deploy-demo' to deploy to temporary demo

### Functions

- run 'firebase deploy --only functions' to deploy
- review permissions for new functions
- - onCall(), HTTP triggers require allUsers to have 'Cloud Functions Invoker' permissions - https://console.cloud.google.com/functions/list
- - Ensure that these functions are secured within the function with an auth validation

## Local testing with emulator & functions

- run Firebase emulator $ firebase emulators:start --only functions
- to use local Firebase emulator uncomment emulators in firebase.module.ts
- to run local Firebase functions it may be necessary to disable or adjust auth rules in functions/src/auth/auth.ts
- compile TypeScript on save in VS Code: (Command+Shift+B) -> "tsc:watch functions/tsconfig.json"

# Development

## Adding FHIR resources

A FHIR resource requires the following implementations for full CRUD functionality:

- core/state/[PREFIX]-[RESOURCE_TYPE]-state.service.ts service
- core/guard/[RESOURCE_TYPE_ID].guard.ts to write resourceId to resource state (utilized in resource-id page to load related resource, called in [RESOURCE_TYPE_ID].routes.ts)
- modules/[PATH]/[RESOURCE_TYPE] - resource list view
- modules/[PATH]/[RESOURCE_TYPE]/[RESOURCE_TYPE_ID] - resource ID view with above router guard
- implementation of resource in overview pages and related resource pages, i.e. patient-id.page
- shared/components/form-groups/[PREFIX]-[RESOURCE_TYPE]-form-group (holds input form group logic and UI)
- shared/directives/modal-handlers/[PREFIX]-[RESOURCE_TYPE]-input (holds input modal triggers, write function and input modal)
- shared/directives/modal-handlers/[PREFIX]-[RESOURCE_TYPE]-input/[PREFIX]-[RESOURCE_TYPE]-input-modal

### General notes

- Maintain a SCAM, Single Component Angular Module, structure, giving each component, directive, page, etc. its own module
- Remove imports from app.module.ts after creating via the CLI
- Use existing resource implementations, i.e. Condition Resource implementation as a guideline for coding details
