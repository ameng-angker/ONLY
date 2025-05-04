addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Supported countries with paths
  const countries = {
    'ID': { name: 'Indonesia', path: '/id-direct' },
    'SG': { name: 'Singapore', path: '/sg-premium' },
    'US': { name: 'United States', path: '/us-ntls' },
    'JP': { name: 'Japan', path: '/jp-xray' },
    'DE': { name: 'Germany', path: '/de-eu' }
  }

  // Generate credentials
  const uuid = generateUUID()
  const trojanPass = generatePassword(12)
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Handle root path
  if (path === '/' || path === '') {
    return generateDashboard(countries)
  }

  // Handle country paths
  const countryCode = path.split('/')[1].toUpperCase()
  if (countries[countryCode]) {
    return generateCountryConfig(uuid, trojanPass, countryCode, countries[countryCode])
  }

  // Handle direct protocol paths (for API)
  const protocol = path.split('/')[1].toLowerCase()
  if (['vless', 'vmess', 'trojan', 'ss'].includes(protocol)) {
    return generateDirectConfig(protocol, uuid, trojanPass)
  }

  return new Response('Not Found', { status: 404 })
}

// Generate dashboard HTML
function generateDashboard(countries) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ARIYEL VPN</title>
  <style>
    /* Your existing CSS styles */
    :root {
      --primary: #6366f1;
      --dark: #0f172a;
      --light: #f8fafc;
    }
    body {
      background-color: var(--dark);
      color: var(--light);
      font-family: 'Inter', sans-serif;
    }
    .country-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(99, 102, 241, 0.15);
      transition: all 0.2s ease;
    }
    .country-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.1);
    }
  </style>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="min-h-screen">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
        ARIYEL VPN
      </h1>
      <p class="text-gray-400">Multi-country NTLS proxy service</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
      ${Object.entries(countries).map(([code, country]) => `
        <a href="/${code}" class="country-card rounded-xl p-6 text-center hover:bg-indigo-900/10">
          <div class="text-4xl mb-3">
            <img src="https://flagcdn.com/48x36/${code.toLowerCase()}.png" 
                 alt="${country.name}" 
                 class="inline-block rounded shadow-md">
          </div>
          <h3 class="text-xl font-semibold mb-1">${country.name}</h3>
          <p class="text-sm text-gray-400">/${code}</p>
          <div class="mt-3 text-xs text-indigo-400">
            <i class="fas fa-link mr-1"></i> ${country.path}
          </div>
        </a>
      `).join('')}
    </div>

    <div class="text-center text-gray-500 text-sm">
      <p>© ${new Date().getFullYear()} ARIYEL VPN | vpn.ariyell.web.id</p>
    </div>
  </div>
</body>
</html>
  `
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}

// Generate country-specific config
function generateCountryConfig(uuid, trojanPass, countryCode, country) {
  const configs = {
    vless: generateVlessConfig(uuid, country),
    vmess: generateVmessConfig(uuid, country),
    trojan: generateTrojanConfig(trojanPass, country),
    ss: generateShadowsocksConfig(trojanPass, country)
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${country.name} Config | ARIYEL VPN</title>
  <style>
    /* Your existing CSS styles */
    .config-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(99, 102, 241, 0.15);
    }
    .copy-btn {
      transition: all 0.2s ease;
    }
    .copy-btn:hover {
      background: rgba(99, 102, 241, 0.1);
    }
  </style>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
</head>
<body class="min-h-screen bg-gray-900 text-gray-200">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center">
        <img src="https://flagcdn.com/32x24/${countryCode.toLowerCase()}.png" 
             alt="${country.name}" 
             class="mr-3 rounded-sm">
        <h1 class="text-2xl font-bold">${country.name} Configuration</h1>
      </div>
      <a href="/" class="text-indigo-400 hover:text-indigo-300">
        <i class="fas fa-arrow-left mr-1"></i> Back
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <!-- VLESS Card -->
      <div class="config-card rounded-xl overflow-hidden">
        <div class="bg-indigo-600 px-6 py-4">
          <h2 class="text-xl font-bold text-white">
            <i class="fas fa-bolt mr-2"></i> VLESS + NTLS
          </h2>
        </div>
        <div class="p-6">
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-400">Server:</span>
              <span class="font-mono">vpn.ariyell.web.id</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Port:</span>
              <span class="font-mono">443</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">UUID:</span>
              <div class="flex items-center">
                <span id="vless-uuid" class="font-mono">${uuid}</span>
                <button onclick="copyToClipboard('vless-uuid')" 
                        class="ml-2 copy-btn p-1 rounded text-indigo-400">
                  <i class="far fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Path:</span>
              <span class="font-mono">${country.path}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Security:</span>
              <span class="font-mono">None (NTLS)</span>
            </div>
          </div>
          <button onclick="generateQR('vless')" 
                  class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg">
            <i class="fas fa-qrcode mr-2"></i> Show QR Code
          </button>
        </div>
      </div>

      <!-- VMESS Card -->
      <div class="config-card rounded-xl overflow-hidden">
        <div class="bg-purple-600 px-6 py-4">
          <h2 class="text-xl font-bold text-white">
            <i class="fas fa-shield-alt mr-2"></i> VMESS + WS
          </h2>
        </div>
        <div class="p-6">
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-400">Server:</span>
              <span class="font-mono">vpn.ariyell.web.id</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Port:</span>
              <span class="font-mono">80</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">UUID:</span>
              <div class="flex items-center">
                <span id="vmess-uuid" class="font-mono">${uuid}</span>
                <button onclick="copyToClipboard('vmess-uuid')" 
                        class="ml-2 copy-btn p-1 rounded text-purple-400">
                  <i class="far fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Path:</span>
              <span class="font-mono">${country.path}-vmess</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Transport:</span>
              <span class="font-mono">WebSocket</span>
            </div>
          </div>
          <button onclick="generateQR('vmess')" 
                  class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg">
            <i class="fas fa-qrcode mr-2"></i> Show QR Code
          </button>
        </div>
      </div>

      <!-- Trojan Card -->
      <div class="config-card rounded-xl overflow-hidden">
        <div class="bg-emerald-600 px-6 py-4">
          <h2 class="text-xl font-bold text-white">
            <i class="fas fa-user-secret mr-2"></i> Trojan + NTLS
          </h2>
        </div>
        <div class="p-6">
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-400">Server:</span>
              <span class="font-mono">vpn.ariyell.web.id</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Port:</span>
              <span class="font-mono">443</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Password:</span>
              <div class="flex items-center">
                <span id="trojan-pass" class="font-mono">${trojanPass}</span>
                <button onclick="copyToClipboard('trojan-pass')" 
                        class="ml-2 copy-btn p-1 rounded text-emerald-400">
                  <i class="far fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Path:</span>
              <span class="font-mono">${country.path}-trojan</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Security:</span>
              <span class="font-mono">None (NTLS)</span>
            </div>
          </div>
          <button onclick="generateQR('trojan')" 
                  class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg">
            <i class="fas fa-qrcode mr-2"></i> Show QR Code
          </button>
        </div>
      </div>

      <!-- QR Code Display -->
      <div class="config-card rounded-xl overflow-hidden">
        <div class="bg-amber-600 px-6 py-4">
          <h2 class="text-xl font-bold text-white">
            <i class="fas fa-qrcode mr-2"></i> QR Code
          </h2>
        </div>
        <div class="p-6">
          <div class="flex justify-center mb-4">
            <div id="qrcode-display" class="bg-white p-3 rounded-lg">
              <!-- QR code will appear here -->
              <div class="text-center text-gray-700 py-10">
                <i class="fas fa-qrcode text-4xl mb-2 text-gray-400"></i>
                <p class="text-sm">Select protocol to generate QR</p>
              </div>
            </div>
          </div>
          <div id="config-display" class="bg-gray-800 rounded-lg p-3 text-xs font-mono overflow-x-auto hidden">
            <!-- Config will appear here -->
          </div>
        </div>
      </div>
    </div>

    <div class="text-center text-gray-500 text-sm">
      <p>Generated on ${currentDate} | vpn.ariyell.web.id/${countryCode}</p>
    </div>

    <script>
      // Copy to clipboard function
      function copyToClipboard(id) {
        const el = document.getElementById(id)
        navigator.clipboard.writeText(el.textContent)
        
        // Show feedback
        const btn = el.nextElementSibling
        const originalIcon = btn.innerHTML
        btn.innerHTML = '<i class="fas fa-check"></i>'
        setTimeout(() => {
          btn.innerHTML = originalIcon
        }, 2000)
      }

      // Generate QR code
      function generateQR(protocol) {
        const configs = ${JSON.stringify(configs)}
        const config = configs[protocol]
        const qrcodeDiv = document.getElementById('qrcode-display')
        const configDiv = document.getElementById('config-display')
        
        // Clear previous QR code
        qrcodeDiv.innerHTML = ''
        configDiv.textContent = config
        configDiv.classList.remove('hidden')
        
        // Generate new QR code
        QRCode.toCanvas(qrcodeDiv, config, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }, function(error) {
          if (error) {
            qrcodeDiv.innerHTML = '<div class="text-center text-red-500 py-4">Failed to generate QR code</div>'
          }
        })
      }
    </script>
  </div>
</body>
</html>
  `
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}

// Generate direct config (for API)
function generateDirectConfig(protocol, uuid, password) {
  const configs = {
    vless: `vless://${uuid}@vpn.ariyell.web.id:443?encryption=none&security=none&type=tcp#ARIYEL-VLESS`,
    vmess: `vmess://${btoa(JSON.stringify({
      v: "2",
      ps: "ARIYEL-VMESS",
      add: "vpn.ariyell.web.id",
      port: "80",
      id: uuid,
      aid: "0",
      scy: "auto",
      net: "ws",
      type: "none",
      host: "",
      path: "/vmess",
      tls: "",
      sni: ""
    }))}`,
    trojan: `trojan://${password}@vpn.ariyell.web.id:443?security=none&type=tcp#ARIYEL-TROJAN`,
    ss: `ss://${btoa(`aes-256-gcm:${password}@vpn.ariyell.web.id:443`)}#ARIYEL-SS`
  }

  return new Response(configs[protocol], {
    headers: { 'Content-Type': 'text/plain' }
  })
}

// Helper functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function generatePassword(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Config generators
function generateVlessConfig(uuid, country) {
  return `vless://${uuid}@vpn.ariyell.web.id:443?encryption=none&security=none&type=tcp&path=${encodeURIComponent(country.path)}#${country.name.replace(' ', '-')}-VLESS`
}

function generateVmessConfig(uuid, country) {
  const vmessConfig = {
    v: "2",
    ps: `${country.name} VMESS`,
    add: "vpn.ariyell.web.id",
    port: "80",
    id: uuid,
    aid: "0",
    scy: "auto",
    net: "ws",
    type: "none",
    host: "",
    path: `${country.path}-vmess`,
    tls: "",
    sni: ""
  }
  return 'vmess://' + btoa(JSON.stringify(vmessConfig))
}

function generateTrojanConfig(password, country) {
  return `trojan://${password}@vpn.ariyell.web.id:443?security=none&type=tcp&path=${encodeURIComponent(country.path)}-trojan#${country.name.replace(' ', '-')}-TROJAN`
}

function generateShadowsocksConfig(password, country) {
  return `ss://${btoa(`aes-256-gcm:${password}@vpn.ariyell.web.id:443`)}#${country.name.replace(' ', '-')}-SS`
}
