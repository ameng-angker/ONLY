addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Generate UUID untuk VMess dan VLESS
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Generate random password untuk Trojan
  function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const uuid = generateUUID()
  const trojanPassword = generatePassword()

  if (path === '/') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VPN Config - vpn.ariyell.web.id</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .config { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          pre { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <h1>Konfigurasi VPN</h1>
        <p>Domain: <strong>vpn.ariyell.web.id</strong></p>
        
        <div class="config">
          <h2>VLESS + XTLS (Reality)</h2>
          <pre>
Address: vpn.ariyell.web.id
Port: 443
ID: ${uuid}
Flow: xtls-rprx-vision
Encryption: none
Transport: tcp
Security: reality
SNI: cloudflare.com
          </pre>
        </div>

        <div class="config">
          <h2>VMESS + WS</h2>
          <pre>
Address: vpn.ariyell.web.id
Port: 80
ID: ${uuid}
Path: /vmess
Transport: ws
Security: none
          </pre>
        </div>

        <div class="config">
          <h2>Trojan + TLS</h2>
          <pre>
Address: vpn.ariyell.web.id
Port: 443
Password: ${trojanPassword}
Transport: tcp
SNI: vpn.ariyell.web.id
          </pre>
        </div>
      </body>
      </html>
    `
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  return new Response('Not Found', { status: 404 })
}
