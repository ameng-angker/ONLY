addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Generate random credentials
  const uuid = generateUUID()
  const trojanPass = generatePassword(12)
  const wireguardKey = generateWireguardKey()

  if (path === '/' || path === '') {
    const html = `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VPN Config • vpn.ariyell.web.id</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .card { animation: fadeIn 0.5s ease-out forwards; }
    .delay-1 { animation-delay: 0.2s; }
    .delay-2 { animation-delay: 0.4s; }
    .delay-3 { animation-delay: 0.6s; }
    .dark .gradient-bg { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); }
  </style>
</head>
<body class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen transition-colors">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="gradient-bg text-white rounded-xl p-6 mb-8 shadow-lg">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">🌐 VPN Config Generator</h1>
          <p class="opacity-90">vpn.ariyell.web.id • Auto-generated secure configs</p>
        </div>
        <button onclick="toggleDarkMode()" class="mt-4 md:mt-0 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full flex items-center">
          <i class="fas fa-moon mr-2"></i> Dark Mode
        </button>
      </div>
    </header>

    <!-- Stats Bar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow card delay-1">
        <div class="flex items-center">
          <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
            <i class="fas fa-bolt text-blue-500 dark:text-blue-300"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Protocols</p>
            <h3 class="font-bold">VLESS • VMESS • Trojan</h3>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow card delay-2">
        <div class="flex items-center">
          <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full mr-4">
            <i class="fas fa-shield-alt text-green-500 dark:text-green-300"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Security</p>
            <h3 class="font-bold">TLS 1.3 • XTLS • Reality</h3>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow card delay-3">
        <div class="flex items-center">
          <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mr-4">
            <i class="fas fa-sync-alt text-purple-500 dark:text-purple-300"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Refresh</p>
            <h3 class="font-bold">New config on reload</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Config Cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- VLESS Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card">
        <div class="bg-blue-500 dark:bg-blue-700 px-6 py-4">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-white flex items-center">
              <i class="fas fa-rocket mr-2"></i> VLESS + Reality
            </h2>
            <span class="bg-white/20 px-2 py-1 rounded text-xs font-semibold">Recommended</span>
          </div>
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
              <span class="font-medium">Flow:</span>
              <span class="font-mono">xtls-rprx-vision</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">SNI:</span>
              <span class="font-mono">cloudflare.com</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onclick="copyConfig('vless')" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
              <i class="fas fa-copy mr-2"></i> Copy VLESS Config
            </button>
          </div>
        </div>
      </div>

      <!-- VMESS Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card delay-1">
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
              <span class="font-mono">/vmess</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Transport:</span>
              <span class="font-mono">WebSocket</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onclick="copyConfig('vmess')" class="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
              <i class="fas fa-copy mr-2"></i> Copy VMESS Config
            </button>
          </div>
        </div>
      </div>

      <!-- Trojan Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card delay-2">
        <div class="bg-emerald-500 dark:bg-emerald-700 px-6 py-4">
          <h2 class="text-xl font-bold text-white flex items-center">
            <i class="fas fa-lock mr-2"></i> Trojan + TLS
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
              <span class="font-medium">SNI:</span>
              <span class="font-mono">vpn.ariyell.web.id</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Transport:</span>
              <span class="font-mono">TCP</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onclick="copyConfig('trojan')" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg flex items-center justify-center">
              <i class="fas fa-copy mr-2"></i> Copy Trojan Config
            </button>
          </div>
        </div>
      </div>

      <!-- QR Code & Instructions -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden card delay-3">
        <div class="bg-amber-500 dark:bg-amber-700 px-6 py-4">
          <h2 class="text-xl font-bold text-white flex items-center">
            <i class="fas fa-qrcode mr-2"></i> Quick Setup
          </h2>
        </div>
        <div class="p-6">
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <h3 class="font-bold mb-3">📱 Mobile Apps</h3>
              <ul class="space-y-2">
                <li class="flex items-center">
                  <i class="fas fa-arrow-right text-amber-500 mr-2"></i>
                  <a href="https://apps.apple.com/app/shadowrocket/id932747118" class="hover:underline">ShadowRocket (iOS)</a>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-arrow-right text-amber-500 mr-2"></i>
                  <a href="https://play.google.com/store/apps/details?id=com.v2ray.ang" class="hover:underline">v2rayNG (Android)</a>
                </li>
              </ul>
            </div>
            <div class="flex-1">
              <h3 class="font-bold mb-3">💻 Desktop Clients</h3>
              <ul class="space-y-2">
                <li class="flex items-center">
                  <i class="fas fa-arrow-right text-amber-500 mr-2"></i>
                  <a href="https://github.com/2dust/v2rayN" class="hover:underline">v2rayN (Windows)</a>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-arrow-right text-amber-500 mr-2"></i>
                  <a href="https://github.com/Qv2ray/Qv2ray" class="hover:underline">Qv2ray (Linux/Mac)</a>
                </li>
              </ul>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">Refresh page to generate new credentials</p>
          </div>
        </div>
      </div>
    </div>

    <footer class="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>© 2023 vpn.ariyell.web.id • All configurations auto-generate on load</p>
    </footer>
  </div>

  <script>
    // Dark mode toggle
    function toggleDarkMode() {
      document.documentElement.classList.toggle('dark')
      localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'))
    }

    // Check saved preference
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }

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
    function copyConfig(type) {
      let configText = ''
      
      if (type === 'vless') {
        configText = \`vless://${uuid}@vpn.ariyell.web.id:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=cloudflare.com&type=tcp#VLESS+Reality\`
      } else if (type === 'vmess') {
        const vmessConfig = {
          v: "2",
          ps: "vpn.ariyell.web.id",
          add: "vpn.ariyell.web.id",
          port: "80",
          id: "${uuid}",
          aid: "0",
          scy: "auto",
          net: "ws",
          type: "none",
          host: "",
          path: "/vmess",
          tls: "",
          sni: ""
        }
        configText = 'vmess://' + btoa(JSON.stringify(vmessConfig))
      } else if (type === 'trojan') {
        configText = \`trojan://${trojanPass}@vpn.ariyell.web.id:443?security=tls&sni=vpn.ariyell.web.id&type=tcp#Trojan+TLS\`
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
  </script>
</body>
</html>
    `
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  return new Response('Not Found', { status: 404 })
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
