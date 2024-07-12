// const sanitizeAlgorithm = require('./sanitize.cjs');
import {
  hexToString,
  stringToHex
} from "viem";
import { fabric } from 'fabric';

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

function sanitizeAlgorithm(algorithm) {
  const forbiddenPatterns = [
      /Math\.random\(/g,
      /crypto\.getRandomValues\(/g,
      // Add other randomness-related patterns here
  ];

  for (const pattern of forbiddenPatterns) {
      if (pattern.test(algorithm)) {
          throw new Error("Algorithm contains forbidden randomness logic.");
      }
  }
  return algorithm;
}

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const user_algorithm = hexToString(data.payload)

  // sanitize input
  const sanitizedAlgorithm = sanitizeAlgorithm(user_algorithm);

  // prepare canvas
  const fabricCanvas = new fabric.StaticCanvas(null, {
      width: 800,
      height: 800,
  });

  // execute the sanitized algorithm
  eval(sanitizedAlgorithm);
  
  const base64data = fabricCanvas.toDataURL(); // This returns the base64 encoded image
  console.log("Image : ", base64data)

  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
