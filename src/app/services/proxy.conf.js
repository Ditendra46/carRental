export const proxyConfig = {
  "/api": {
    "target": "https://carrental-0zt3.onrender.com",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/uploads": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/signup": {
      "target": "http://localhost:3000",
      "secure": false,
      "changeOrigin": true,
      "logLevel": "debug"
    }

}
