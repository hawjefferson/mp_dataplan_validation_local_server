require('dotenv').config();
const fastify = require('fastify')({ logger: true })
const {validate} = require('./lib/mparticle-dataplan-client');

// allows docker process to be killed on cli
process.on('SIGINT', function() {
  process.exit();
});

fastify.post('/', async (request, reply) => {  
  const planFromBody = request.body.context && request.body.context.data_plan 
                        ? {id: request.body.context.data_plan.plan_id, version: request.body.context.data_plan.plan_version}
                        : {};  
  // pass request body directly to batch validator                        
  return await validate(
    request.body, 
    // request headers >> body >> env variables
    dataPlanId=request.headers['mp-dataplanid'] || planFromBody.id || process.env.dataplanId, 
    dataPlanVersion=request.headers['mp-dataplanversion'] || planFromBody.version || process.env.dataplanVersion
  );
});

fastify.all('*', (request, reply) => {
  return {info: 'POST mParticle batch payload to / for validation'};
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start();