# mp-validation-server

This github repo was created by my colleague [Cooper Reid](creid@mparticle.com).

## Setup and Install
_note: there is no need to install the mp-cli manually and configure, this abstracts all of that_
1. Install dependencies `npm i`
2. Copy `.env.template` to `.env` and populate it with your mParticle Data Plan API credentials and dataplan details (these can be overridded in http request)
3. Start in dev using `npm run debug` or run in docker container, `npm run build && npm start`

## Usage
* The server runs at http://localhost:3000 by default (if using docker, modify port-mapping to expose an alternate port). 
* Point an http client (ie Postman) at your server and send an mParticle event batch
* Server will read data plan details from the batch payload and fetch plan accordingly and persist to memory

## Integrating in test suite
Running integration tests will simulate sending data to mParticle's server will can catch and flag malformed events locally without having to provision additional developer mP accounts, educate developers on mP dataplans & dashboard, and manually configure and integrate mP-CLI tools. Simply mock the mParticle client's dispatch method (`upload_events <Py>` , `uploadEvents <node>`, `UploadEvents` <go>, etc. depending on your environment) to send requests to the local validation server. To test this out, run the docker validation server and then `npm test`.

## Demo
|    |   |
|-----------|---------|
| ![Usage](https://user-images.githubusercontent.com/2018204/168176786-4cec504c-92d6-4565-ba57-6d220c1ad170.gif)      |  This shows basic usage: first a valid request followed<br /> by a request that doesn't match the mParticle data plan schema  |
| ![Usage](https://user-images.githubusercontent.com/2018204/168177345-84c20d2c-68fb-4fe2-b8c9-aa9909da0399.gif)      |   This shows the ability to specify the <br /> dataplan and version in the request headers  |
