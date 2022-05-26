const { exec } = require("child_process");
const NodeCache = require( "node-cache" );

// Dataplan TTL set to env ttl or 5 minutes
const dataplanCache = new NodeCache({stdTTL: process.env.dataplanTTL || 300});

if(!process.env.mpSecret || !process.env.mpClientId || !process.env.workspaceId) {
  throw new Error(`Unable to initialize mP Dataplan Client: 
    Missing a required process.env variable. Requires mpSecret, mpClientId, workspaceId`);
}

/**
 * This repo includes a non-global dependency of `mp` CLI tool
 * When running a command with node's "exec"
 * it automatically resolves to the local project's executables as desired
 * (node_modules/.bin/mp)
 */
const runCliCommand = async str => {
  return new Promise((res, rej) => {
    exec(str, (error, stdout, stderr) => {
      if (error) rej({ stdout, error, stderr });
      else res({ stdout, error, stderr });
    });
  });
}

const runMPCliCommand = async str => {
  return await runCliCommand(`${str} --clientId="${process.env.mpClientId}" --clientSecret="${process.env.mpSecret}" --workspaceId="${process.env.workspaceId}"`);
}

const memoizeDataplan = async dataPlanId => {
  console.log(`... Downloading dataplan: ${dataPlanId}`);
  const cmd = `mp planning:data-plans:fetch --dataPlanId="${dataPlanId}"`;  
  const res = await runMPCliCommand(cmd);      
  const jsonResult = JSON.parse(res.stdout);  
  dataplanCache.set(dataPlanId, jsonResult);
}

module.exports.validate = async (jsonBatch, dataPlanId = '', dataPlanVersion = 1) => {
  let jsonResult,
      res;

  if(!dataplanCache.get(dataPlanId)) {
    try {
      await memoizeDataplan(dataPlanId);
    } catch(err) {
      return { valid: false, error: `Invalid dataplan: ${dataPlanId}`, detail: err}; 
    }
  }

  try {
    const dpArgs = `\
      --batch='${JSON.stringify(jsonBatch)}'\
      --dataPlan='${JSON.stringify(dataplanCache.get(dataPlanId))}'\
      --versionNumber ${dataPlanVersion}`;
    const commandStr = `mp planning:batches:validate ${dpArgs}`;
    res = await runMPCliCommand(commandStr);
  } catch (err) {
    return { valid: false , error: `Error running validation command: ${err.stderr}`};
  }

  try {
    jsonResult = JSON.parse(res.stdout);
  } catch (err) {
    return { valid: false, error: `Error parsing CLI response: ${err.stderr}` };
  }

  if (jsonResult.results.length) {
    return { valid: false, response: jsonResult };
  }
  else {
    return { valid: true };
  }
}

