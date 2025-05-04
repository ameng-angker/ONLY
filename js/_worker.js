addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Daftar negara yang didukung
  const supportedCountries = {
    'ID': 'Indonesia',
    'SG': 'Singapore',
    'US': 'United States',
    'JP': 'Japan',
    'DE': 'Germany'
  }

  // Generate credentials
  const uuid = generateUUID()
  const trojanPass = generatePassword(12)
  const wireguardKey = generateWireguardKey()

  // Jika akses ke root path, tampilkan halaman utama
  if (path === '/' || path === '') {
    return generateDashboard(uuid, trojanPass, wireguardKey, supportedCountries)
  }

  // Jika path berupa kode negara (/ID, /SG, dll)
  const countryCode = path.split('/')[1].toUpperCase()
  if (supportedCountries[countryCode]) {
    return generateCountryConfig(uuid, trojanPass, countryCode, supportedCountries[countryCode])
  }

  return new Response('Not Found', { status: 404 })
}

// Generate halaman utama
function generateDashboard(uuid, trojanPass, wireguardKey, countries) {
  const html = `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Multi-Country VPN • vpn.ariyell.web.id</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .country-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .flag-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-8 shadow-lg">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">🌍 Multi-Country VPN</h1>
          <p class="opacity-90">vpn.ariyell.web.id • Select country path for NTLS config</p>
        </div>
      </div>
    </header>

    <!-- Country Selection -->
    <div class="mb-12 text-center">
      <h2 class="text-2xl font-bold mb-6">Available Countries</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        ${Object.entries(countries).map(([code, name]) => `
          <a href="/${code}" class="country-card rounded-lg p-4 hover:bg-white/10 transition-all text-center">
            <div class="w-12 h-12 mx-auto mb-2 flex items-center justify-center bg-white/10 rounded-full">
              <img src="https://flagcdn.com/24x18/${code.toLowerCase()}.png" class="flag-icon">
            </div>
            <h3 class="font-semibold">${name}</h3>
            <p class="text-xs opacity-70 mt-1">/${code}</p>
          </a>
        `).join('')}
      </div>
    </div>

    <!-- Global Config -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
      <h2 class="text-xl font-bold mb-4 flex items-center">
        <i class="fas fa-globe mr-2"></i> Global Configuration
      </h2>
      <div class="space-y-3">
        <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
          <span class="font-medium">Server:</span>
          <span class="font-mono">vpn.ariyell.web.id</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
          <span class="font-medium">Default UUID:</span>
          <div class="flex items-center">
            <span class="font-mono">${uuid}</span>
          </div>
        </div>
        <div class="flex justify-between items-center py-2">
          <span class="font-medium">Trojan Password:</span>
          <div class="flex items-center">
            <span class="font-mono">${trojanPass}</span>
          </div>
        </div>
      </div>
    </div>

    <footer class="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>© ${new Date().getFullYear()} vpn.ariyell.web.id • NTLS-ready multi-path configuration</p>
    </footer>
  </div>
</body>
</html>
  `
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}

// Generate config spesifik negara
function generateCountryConfig(uuid, trojanPass, countryCode, countryName) {
  const paths = {
    'ID': '/id-direct',
    'SG': '/sg-premium',
    'US': '/us-ntls',
    'JP': '/jp-xray',
    'DE': '/de-eu'
  }

  const html = `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${countryName} Config • vpn.ariyell.web.id</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-8 shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold flex items-center">
            <img src="https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png" class="mr-3 rounded-sm">
            ${countryName} Configuration
          </h1>
          <p class="opacity-90">vpn.ariyell.web.id • Path: /${countryCode}</p>
        </div>
        <a href="/" class="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
          <i class="fas fa-arrow-left mr-2"></i> Back
        </a>
      </div>
    </header>

    <!-- Config Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- VLESS Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="bg-blue-500 dark:bg-blue-700 px-6 py-4">
          <h2 class="text-xl font-bold text-white flex items-center">
            <i class="fas fa-rocket mr-2"></i> VLESS + NTLS
          </h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="font-medium">Server:</span>
              <span class="font-mono">vpn.ariyell.web.id</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Port:</span>
              <span class="font-mono">443</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">UUID:</span>
              <div class="flex items-center">
                <span id="vless-uuid" class="font-mono">${uuid}</span>
                <button onclick="copyToClipboard('vless-uuid')" class="ml-2 text-blue-500 hover:text-blue-700">
                  <i class="far fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Path:</span>
              <span class="font-mono">${paths[countryCode]}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Security:</span>
              <span class="font-mono">None (NTLS)</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onclick="copyConfig('vless', '${countryCode}')" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
              <i class="fas fa-copy mr-2"></i> Copy VLESS Config
            </button>
          </div>
        </div>
      </div>

      <!-- VMESS Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="bg-purple-500 dark:bg-purple-700 px-6 py-4">
          <h2 class="text-xl font-bold text-white flex items-center">
            <i class="fas fa-cloud mr-2"></i> VMESS + WS
          </h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="font-medium">Server:</span>
              <span class="font-mono">vpn.ariyell.web.id</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Port:</span>
              <span class="font-mono">80</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">UUID:</span>
              <div class="flex items-center">
                <span id="vmess-uuid" class="font-mono">${uuid}</span>
                <button onclick="copyToClipboard('vmess-uuid')" class="ml-2 text-purple-500 hover:text-purple-700">
                  <i class="far fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Path:</span>
              <span class="font-mono">${paths[countryCode]}-vmess</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Transport:</span>
              <span class="font-mono">WebSocket</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onclick="copyConfig('vmess', '${countryCode}')" class="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
              <i class="fas fa-copy mr-2"></i> Copy VMESS Config
            </button>
          </div>
        </div>
      </div>

      <!-- Trojan Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="bg-emerald-500 dark:bg-emerald-700 px-6 py-4">
          <h2 class="text-xl font-bold text-white flex items-center">
            <i class="fas fa-lock mr-2"></i> Trojan + NTLS
          </h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="font-medium">Server:</span>
              <span class="font-mono">vpn.ariyell.web.id</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Port:</span>
              <span class="font-mono">443</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Password:</span>
              <div class="flex items-center">
                <span id="trojan-pass" class="font-mono">${trojanPass}</span>
                <button onclick="copyToClipboard('trojan-pass')" class="ml-2 text-emerald-500 hover:text-emerald-700">
                  <i class="far fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Path:</span>
              <span class="font-mono">${paths[countryCode]}-trojan</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Security:</span>
              <span class="font-mono">None (NTLS)</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onclick="copyConfig('trojan', '${countryCode}')" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
              <i class="fas fa-copy mr-2"></i> Copy Trojan Config
            </button>
          </div>
        </div>
      </div>

      <!-- QR Code & Instructions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div class="bg-amber-500 dark:bg-amber-700 px-6 py-4">
          <h2 class="text-xl font-bold text-white flex items-center">
            <i class="fas fa-qrcode mr-2"></i> Quick Import
          </h2>
        </div>
        <div class="p-6">
          <div id="qrcode" class="mb-4 p-4 bg-white rounded-lg flex justify-center">
            <!-- QR Code akan di-generate di client side -->
            <canvas id="qrCanvas" width="200" height="200"></canvas>
          </div>
          <p class="text-sm text-center mb-4">Scan QR code with v2rayNG/ShadowRocket</p>
          <select id="qr-protocol" class="w-full p-2 mb-4 bg-gray-100 dark:bg-gray-700 rounded">
            <option value="vless">VLESS (NTLS)</option>
            <option value="vmess">VMESS (WS)</option>
            <option value="trojan">Trojan (NTLS)</option>
          </select>
          <button onclick="generateQR()" class="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg">
            <i class="fas fa-sync-alt mr-2"></i> Generate QR Code
          </button>
        </div>
      </div>
    </div>

    <footer class="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>© ${new Date().getFullYear()} ${countryName} Server • vpn.ariyell.web.id/${countryCode}</p>
    </footer>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
  <script>
    // Copy to clipboard
    function copyToClipboard(id) {
      const el = document.getElementById(id)
      navigator.clipboard.writeText(el.textContent)
      
      // Show tooltip
      const btn = el.nextElementSibling
      const originalIcon = btn.innerHTML
      btn.innerHTML = '<i class="fas fa-check"></i>'
      setTimeout(() => {
        btn.innerHTML = originalIcon
      }, 2000)
    }

    // Copy full config
    function copyConfig(type, country) {
      let configText = ''
      const paths = {
        'ID': '/id-direct',
        'SG': '/sg-premium',
        'US': '/us-ntls',
        'JP': '/jp-xray',
        'DE': '/de-eu'
      }
      const path = paths[country]
      
      if (type === 'vless') {
        configText = \`vless://${uuid}@vpn.ariyell.web.id:443?encryption=none&security=none&type=tcp&path=${encodeURIComponent(path)}#${country}-VLESS-NTLS\`
      } else if (type === 'vmess') {
        const vmessConfig = {
          v: "2",
          ps: \`\${country}-VMESS-WS\`,
          add: "vpn.ariyell.web.id",
          port: "80",
          id: "${uuid}",
          aid: "0",
          scy: "auto",
          net: "ws",
          type: "none",
          host: "",
          path: \`\${path}-vmess\`,
          tls: "",
          sni: ""
        }
        configText = 'vmess://' + btoa(JSON.stringify(vmessConfig))
      } else if (type === 'trojan') {
        configText = \`trojan://${trojanPass}@vpn.ariyell.web.id:443?security=none&type=tcp&path=${encodeURIComponent(path)}-trojan#\${country}-Trojan-NTLS\`
      }

      navigator.clipboard.writeText(configText)
      
      // Show notification
      const notification = document.createElement('div')
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center'
      notification.innerHTML = \`<i class="fas fa-check-circle mr-2"></i> \${type.toUpperCase()} config copied!\`
      document.body.appendChild(notification)
      
      setTimeout(() => {
        notification.remove()
      }, 3000)
    }

    // Generate QR Code
    function generateQR() {
      const protocol = document.getElementById('qr-protocol').value
      let config = ''
      
      if (protocol === 'vless') {
        config = \`vless://${uuid}@vpn.ariyell.web.id:443?encryption=none&security=none&type=tcp&path=${encodeURIComponent(paths['${countryCode}'])}#${countryCode}-VLESS-NTLS\`
      } else if (protocol === 'vmess') {
        const vmessConfig = {
          v: "2",
          ps: \`\${countryCode}-VMESS-WS\`,
          add: "vpn.ariyell.web.id",
          port: "80",
          id: "${uuid}",
          aid: "0",
          scy: "auto",
          net: "ws",
          type: "none",
          host: "",
          path: \`\${paths['${countryCode}']}-vmess\`,
          tls: "",
          sni: ""
        }
        config = 'vmess://' + btoa(JSON.stringify(vmessConfig))
      } else if (protocol === 'trojan') {
        config = \`trojan://${trojanPass}@vpn.ariyell.web.id:443?security=none&type=tcp&path=${encodeURIComponent(paths['${countryCode}'])}-trojan#\${countryCode}-Trojan-NTLS\`
      }

      QRCode.toCanvas(document.getElementById('qrCanvas'), config, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, function(error) {
        if (error) console.error(error)
      })
    }

    // Generate initial QR code
    generateQR()
  </script>
</body>
</html>
  `
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
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

function generateWireguardKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
