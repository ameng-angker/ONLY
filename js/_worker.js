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
      <title>Ariyell Proxy Generator</title>
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
          background-color: #f5f7fa;
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
        h1 { color: #4a6baf; }
        h3 { margin-top: 0; color: #4a5568; }
        a { 
          color: #4a6baf;
          text-decoration: none;
          font-weight: 500;
        }
        a:hover { text-decoration: underline; }
        .btn {
          display: inline-block;
          background: #4a6baf;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          margin: 5px 0;
        }
        .btn:hover {
          background: #3a5a9f;
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
          margin: 10px 0;
        }
        .config-type {
          display: flex;
          gap: 10px;
          margin: 10px 0;
        }
        .config-type-btn {
          padding: 6px 12px;
          border-radius: 4px;
          background: #e2e8f0;
          border: none;
          cursor: pointer;
        }
        .config-type-btn.active {
          background: #4a6baf;
          color: white;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h1>Ariyell Proxy Generator</h1>
          <p>Generate VLESS, VMess, Trojan, and Shadowsocks configurations</p>
        </div>
        
        <div class="card">
          <h3>Single Configuration</h3>
          <p><a href="/generate" class="btn">Generate Single Config</a></p>
          <p>Custom options:</p>
          <ul>
            <li><code>?type=vless</code> - VLESS (default)</li>
            <li><code>?type=vmess</code> - VMess</li>
            <li><code>?type=trojan</code> - Trojan</li>
            <li><code>?type=ss</code> - Shadowsocks</li>
            <li><code>?id=CUSTOM_ID</code> - Custom path ID</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>Subscription File</h3>
          <p><a href="/sub" class="btn">Download Subscription (5 configs)</a></p>
          <p><a href="/sub?count=10" class="btn">Download 10 Configs</a></p>
          <p>Custom options:</p>
          <ul>
            <li><code>?count=20</code> - Number of configs (max 50)</li>
            <li><code>?type=vmess</code> - Only generate VMess</li>
            <li><code>?id=CUSTOM_ID</code> - Custom path ID</li>
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

// Generate single config
async function generateSingleConfig(request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type') || 'vless'
  const customId = url.searchParams.get('id') || generateRandomString(8)
  
  let configUrl, configDetails
  const domain = 'mesin.ariyell.web.id'
  const uuid = 'f282b878-8711-45a1-8c69-5564172123c1'
  const path = `/${customId}`
  
  switch (type.toLowerCase()) {
    case 'vless':
      configUrl = generateVLESS(domain, uuid, path)
      configDetails = `VLESS Config:
Server: ${domain}
Port: 443
ID: ${uuid}
Path: ${path}
TLS: true
Transport: ws`
      break
      
    case 'vmess':
      configUrl = generateVMess(domain, uuid, path)
      configDetails = `VMess Config:
Server: ${domain}
Port: 443
ID: ${uuid}
Path: ${path}
TLS: true
Transport: ws`
      break
      
    case 'trojan':
      configUrl = generateTrojan(domain, uuid)
      configDetails = `Trojan Config:
Server: ${domain}
Port: 443
Password: ${uuid}
TLS: true`
      break
      
    case 'ss':
      const ssPassword = generateRandomString(16)
      configUrl = generateShadowsocks(domain, ssPassword)
      configDetails = `Shadowsocks Config:
Server: ${domain}
Port: 443
Password: ${ssPassword}
Method: aes-256-gcm`
      break
      
    default:
      return new Response('Invalid config type', { status: 400 })
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${type.toUpperCase()} Config</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .url-box { background: #f8f9fa; padding: 12px; border-radius: 4px; word-break: break-all; }
        pre { background: #f8f9fa; padding: 12px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h2>${type.toUpperCase()} Configuration</h2>
      <p>Domain: <strong>${domain}</strong></p>
      <p>Config URL:</p>
      <div class="url-box">${configUrl}</div>
      
      <h3>Configuration Details:</h3>
      <pre>${configDetails}</pre>
      
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
  const count = Math.min(parseInt(url.searchParams.get('count')) || 5, 50)
  const type = url.searchParams.get('type') // null = all types
  const customId = url.searchParams.get('id') || generateRandomString(8)
  
  const domain = 'mesin.ariyell.web.id'
  const uuid = 'f282b878-8711-45a1-8c69-5564172123c1'
  const path = `/${customId}`
  
  let subscriptionContent = ''
  
  for (let i = 0; i < count; i++) {
    if (!type || type === 'vless') {
      subscriptionContent += generateVLESS(domain, uuid, path) + '\n'
    }
    if (!type || type === 'vmess') {
      subscriptionContent += generateVMess(domain, uuid, path) + '\n'
    }
    if (!type || type === 'trojan') {
      subscriptionContent += generateTrojan(domain, uuid) + '\n'
    }
    if (!type || type === 'ss') {
      const ssPassword = generateRandomString(16)
      subscriptionContent += generateShadowsocks(domain, ssPassword) + '\n'
    }
  }
  
  // Base64 encode for subscription format
  const subBase64 = btoa(unescape(encodeURIComponent(subscriptionContent)))
  
  return new Response(subBase64, {
    headers: {
      'content-type': 'text/plain;charset=UTF-8',
      'Content-Disposition': 'attachment; filename="proxy_sub.txt"'
    }
  })
}

// Protocol generators
function generateVLESS(domain, uuid, path) {
  const config = {
    v: "2",
    ps: `VLESS-${domain}`,
    add: domain,
    port: "443",
    id: uuid,
    net: "ws",
    type: "none",
    host: domain,
    path: path,
    tls: "tls",
    sni: domain,
    alpn: "h2,http/1.1",
    fp: "chrome"
  }
  return `vless://${uuid}@${domain}:443?encryption=none&security=tls&type=ws&host=${domain}&path=${encodeURIComponent(path)}&sni=${domain}&fp=chrome#VLESS-${domain}`
}

function generateVMess(domain, uuid, path) {
  const config = {
    v: "2",
    ps: `VMess-${domain}`,
    add: domain,
    port: "443",
    id: uuid,
    aid: "0",
    net: "ws",
    type: "none",
    host: domain,
    path: path,
    tls: "tls",
    sni: domain,
    alpn: "h2,http/1.1"
  }
  const configJson = JSON.stringify(config)
  return `vmess://${btoa(unescape(encodeURIComponent(configJson)))}`
}

function generateTrojan(domain, password) {
  return `trojan://${password}@${domain}:443?security=tls&sni=${domain}&type=tcp&headerType=none#Trojan-${domain}`
}

function generateShadowsocks(domain, password) {
  const method = "aes-256-gcm"
  const encodedRemark = `SS-${domain}`
  return `ss://${btoa(`${method}:${password}`)}@${domain}:443#${encodedRemark}`
}

// Helper functions
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
