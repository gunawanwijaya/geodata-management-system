# geodata management system
technical test for geospatial company.

## PRD
According to prd.pdf, the goals is to create a GeoData Management System using Next.js.

### Action plan
- [x] (Client-Side) Data Upload Component
- [x] (Client-Side) Data Processing Visualization
- [ ] (Client-Side) Unit Testing with Jest
- [ ] (Client-Side) Deployment and CI/CD Pipeline
- [x] (Server-Side) Seeding and Migration
- [x] (Server-Side) Implement Data Reader Endpoint
- [x] (Server-Side) Authentication and Authorization
- [x] (Server-Side) User Input Validation
- [x] (Server-Side) Development of Data Processing Endpoint
- [ ] (Server-Side) Unit Testing with Jest
- [ ] (Server-Side) Design and Implementation of API Documentation

## Timeline
1. (2 hrs) learning basic NextJS & successfully init new project using create next app
1. (2 hrs) creating basic form for file upload, signin & register using tailwind + registering eventhandler
1. (2 hrs) creating db schema using prisma with sqlite + connecting the ORM with api to sync with database
1. (2 hrs) learning geojson library, ended up using [openlayers](https://openlayers.org/)
1. (2 hrs) creating validation on client & server on geojson file upload + file handling to save the resource & id to the table
1. (2 hrs) learning how to load geojson in react after rendering (most likely skill issues)
1. (2 hrs) improving UX when user is onboarding, integration with zxcvbn to reject weak/compromised password
1. (4 hrs) creating custom security feature (csrf & access token)
1. (4 hrs) attempting to fix build issues but to no avail, so only able to run using `npm run dev`
1. (4 hrs) turns out the issue is on improper config of `next.config.mjs`, fixed on [this commit](https://github.com/gunawanwijaya/geodata-management-system/commit/ee1eea33198be92749a8fbfd685f376cea1d8bfd#diff-18c049b08c4a0f5ab451c598aeb2c4848bb9d7877b51ca3e5effb94a225814d2)
