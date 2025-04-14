// File: worker.js (siap deploy ke Cloudflare Worker)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Routing
  if (url.pathname.includes('/sub')) {
    return generateSubscription(request)
  } else if (url.pathname.includes('/generate')) {
    return generateSingleConfig(request)
  }
  return generateHomePage(request)
}

// Homepage UI
async function generateHomePage(request) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>VMess Generator</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        .container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #eaeaea;
        }
        h1 { color: #2b6cb0; }
        h3 { margin-top: 0; color: #4a5568; }
        a { 
          color: #2b6cb0;
          text-decoration: none;
          font-weight: 500;
        }
        a:hover { text-decoration: underline; }
        .btn {
          display: inline-block;
          background: #2b6cb0;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          margin: 5px 0;
        }
        .btn:hover {
          background: #2c5282;
          text-decoration: none;
        }
        code {
          background: #f5f5f5;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
        .url-box {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          word-break: break-all;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h1>VMess Configuration Generator</h1>
          <p>Generate VMess configurations for V2Ray clients</p>
        </div>
        
        <div class="card">
          <h3>Single Configuration</h3>
          <p><a href="/generate" class="btn">Generate Single VMess</a></p>
          <p>Add <code>?host=your-domain.com</code> to set custom host</p>
        </div>
        
        <div class="card">
          <h3>Subscription File</h3>
          <p><a href="/sub" class="btn">Download Subscription (5 configs)</a></p>
          <p><a href="/sub?count=10" class="btn">Download 10 Configs</a></p>
          <p>Custom options:</p>
          <ul>
            <li><code>?host=your-domain.com</code> - Set custom host</li>
            <li><code>?count=20</code> - Number of configs (max 50)</li>
            <li><code>?prefix=MyConfig</code> - Custom config name prefix</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `
  
  return new Response(html, {
    headers: { 'content-type': 'text/html;charset=UTF-8' },
  })
}

// Generate single VMess config
async function generateSingleConfig(request) {
  const url = new URL(request.url)
  const host = url.searchParams.get('host') || 'your-server.com'
  
  const vmessUrl = generateVmessConfig(host, 1)
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>VMess Config</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .url-box { background: #f8f9fa; padding: 12px; border-radius: 4px; word-break: break-all; }
      </style>
    </head>
    <body>
      <h2>VMess Configuration</h2>
      <p>Server: <strong>${host}</strong></p>
      <div class="url-box">${vmessUrl}</div>
      <p><a href="/">← Back to generator</a></p>
    </body>
    </html>
  `
  
  return new Response(html, {
    headers: { 'content-type': 'text/html;charset=UTF-8' },
  })
}

// Generate subscription file
async function generateSubscription(request) {
  const url = new URL(request.url)
  const host = url.searchParams.get('host') || 'your-server.com'
  const count = Math.min(parseInt(url.searchParams.get('count')) || 5, 50)
  const prefix = url.searchParams.get('prefix') || 'VMess'
  
  let subscriptionContent = ''
  for (let i = 0; i < count; i++) {
    subscriptionContent += generateVmessConfig(host, i+1, prefix) + '\n'
  }
  
  // Base64 encode for subscription format
  const subBase64 = btoa(unescape(encodeURIComponent(subscriptionContent)))
  
  return new Response(subBase64, {
    headers: {
      'content-type': 'text/plain;charset=UTF-8',
      'Content-Disposition': 'attachment; filename="vmess_sub.txt"'
    }
  })
}

// Core VMess config generator
function generateVmessConfig(host, index = 1, prefix = 'VMess') {
  const uuid = generateUUID()
  const port = getRandomPort()
  const alterId = Math.floor(Math.random() * 101)
  const network = getRandomNetwork()
  const path = '/' + generateRandomString(6)
  const security = [443, 8443, 2053].includes(port) ? 'tls' : 'none'
  
  const config = {
    v: "2",
    ps: `${prefix}-${index}-${port}-${network.toUpperCase()}`,
    add: host,
    port: port,
    id: uuid,
    aid: alterId,
    scy: "auto",
    net: network,
    type: "none",
    host: host,
    path: network === 'ws' ? path : "",
    tls: security,
    sni: host,
    alpn: ""
  }
  
  const configJson = JSON.stringify(config)
  return `vmess://${btoa(unescape(encodeURIComponent(configJson)))}`
}

// Helper functions
function generateUUID() {
  return crypto.randomUUID() // Using Cloudflare's crypto API
}

function getRandomPort() {
  const ports = [443, 80, 8443, 2053, 2083, 2087, 2096]
  return ports[Math.floor(Math.random() * ports.length)]
}

function getRandomNetwork() {
  const networks = ['ws', 'tcp', 'http']
  return networks[Math.floor(Math.random() * networks.length)]
}

function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const cryptoArray = new Uint8Array(length)
  crypto.getRandomValues(cryptoArray)
  for (let i = 0; i < length; i++) {
    result += chars[cryptoArray[i] % chars.length]
  }
  return result
}
