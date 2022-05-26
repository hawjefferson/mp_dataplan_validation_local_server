require('dotenv').config();
const { expect } = require('@jest/globals');
const axios = require('axios');
const sampleController = require('./controller');
const { validate } = require('../lib/mparticle-dataplan-client');

test('Passing test 1', () => { expect(1 + 1).toBe(2); });
test('Passing test 2', () => { expect(2 * 2).toBe(4); });

const mpClient = {
  track: jest.fn(async payload => {    
    // Call validation service
    const payloadValidationResponse = (await axios.post('http://localhost:3000', payload)).data;
    return payloadValidationResponse;

    // Or invoke the validation node module directly
    // return await validate(payload,
    //   dataPlanId = payload.context.data_plan.plan_id,
    //   dataPlanVersion = payload.context.data_plan.plan_version
    // );    
  })
}

describe("mP Tracking in Handlers", () => {
  afterEach(jest.clearAllMocks);

  test('Coupon Code Handler Sends Proper MP Payload', async () => {
    // took some liberties here for the sake of reducing complexity 
    // mock mP client invokes the validator module directory
    // but the mock mP client should be written to call the RESTful service    
    await sampleController.couponUsedHandler({
      "schema_version": 2,
      "context": {
        "data_plan": {
          "plan_id": "retail",
          "plan_version": 1
        }
      },
      "environment": "development",
      "events": [
        {
          "data": {
            "event_name": "Coupon Used",
            "custom_event_type": "transaction",
            "custom_attributes": {
              "Coupon Code": "123",
              "Coupon Type": "code"
            }
          },
          "event_type": "custom_event"
        }
      ]
    }, mpClient);    
    expect(mpClient.track.mock.results[0].value).resolves.toEqual({ valid: true });
  });

  test('Coupon Code Handler Sends Proper MP Payload', async () => {
    // took some liberties here for the sake of reducing complexity 
    // mock mP client invokes the validator module directory
    // but the mock mP client should be written to call the RESTful service    
    await sampleController.couponUsedHandler({
      "schema_version": 2,
      "context": {
        "data_plan": {
          "plan_id": "retail",
          "plan_version": 1
        }
      },
      "user_identitites": {
        "email": "creid@mparticle.com",
        "customer_id": "hh9f9q8h4f924hf"
      },
      "environment": "development",
      "events": [
        {
          "data": {
            "event_name": "Coupon Used",
            "custom_event_type": "transaction",
            "custom_attributes": {
              "Coupon Code": "123",
              "Coupon Type": "code"
            }
          },
          "event_type": "custom_event"
        }
      ]
    }, mpClient);    
    expect(mpClient.track.mock.results[0].value).resolves.toEqual({ valid: true });
  });  

});

