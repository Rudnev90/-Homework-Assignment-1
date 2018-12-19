/*
* Primary file for the api
*
*/

// Dependencies 
const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder

// Server should respond to all requests with with a string
const server = http.createServer((req, res) => {
  // Get url and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path  
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "")

  // Get the query the string as an object
  const queryStringObject = parsedUrl.query;

  // Get HTTP method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get payload if any
  const decoder = new StringDecoder("utf-8");
  let buffer = '';

  req.on("data", (data) => {
    buffer += decoder.write(data)
  })

  req.on("end", () => {
    buffer += decoder.end()

    // Choose the handler this request should go to. If not found use notFound
    const chosenHandler = typeof (router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handlers.notFound

    // Construct the data object to send to the handler
    const data = {
      "trimmedPath": trimmedPath,
      "queryStringObject": queryStringObject,
      "method": method,
      "header": headers,
      "payload": buffer
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof (statusCode) === "number" ? statusCode : 200
      payload = typeof (payload) === "object" ? payload : {}

      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode)

      // Send the response
      res.end(payloadString)

      // Log the request path
      console.log(`Returning this response`, statusCode, payloadString);
    })
  })
})

// Start the sever
server.listen(3000, () =>
  console.log("The server is listening on port 3000")
)

// Define handlers
const handlers = {
  hello : (data, callback) => {
    // Callback a http status code, and a payload object
    callback(406, {message: "Hey"})
  },
  notFound : (data, callback) => {
    callback(404);
  }
};

// Define request router 
const router = {
  "hello": handlers.hello
}