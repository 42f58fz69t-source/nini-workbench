#!/usr/bin/env python3
# 把 index.html 的多文件引用(app.js / builtin-data.js / sw.js)内联成一个自包含 standalone.html
import base64, pathlib, re

BASE = pathlib.Path('/workspace/lifehub')
html = (BASE / 'index.html').read_text(encoding='utf-8')
builtin = (BASE / 'builtin-data.js').read_text(encoding='utf-8')
app = (BASE / 'app.js').read_text(encoding='utf-8')
sw = (BASE / 'sw.js').read_text(encoding='utf-8')

# 1) 内联 builtin-data.js 与 app.js
html = html.replace('<script src="builtin-data.js"></script>', '<script>\n' + builtin + '\n</script>')
html = html.replace('<script src="app.js"></script>', '<script>\n' + app + '\n</script>')

# 2) 用 blob 方式内嵌 sw.js（保持与独立版 SW 逻辑一致，避免跨文件依赖）
sw_b64 = base64.b64encode(sw.encode('utf-8')).decode('ascii')
new_sw = (
    '<script>\n'
    'if (\'serviceWorker\' in navigator) {\n'
    '  const swB64 = "' + sw_b64 + '";\n'
    '  const bytes = Uint8Array.from(atob(swB64), c => c.charCodeAt(0));\n'
    '  const swCode = new TextDecoder("utf-8").decode(bytes);\n'
    '  const blob = new Blob([swCode], {type: "application/javascript"});\n'
    '  const swUrl = URL.createObjectURL(blob);\n'
    '  navigator.serviceWorker.register(swUrl)\n'
    '    .then(reg => console.log("SW registered (standalone):", reg.scope))\n'
    '    .catch(err => console.log("SW failed:", err));\n'
    '}\n'
    '</script>'
)
html = re.sub(r"<script>\s*// 注册 Service Worker.*?</script>", new_sw, html, flags=re.S)

(BASE / 'standalone.html').write_text(html, encoding='utf-8')
print('standalone.html rebuilt:', len(html), 'bytes')
# 校验：不应再出现外部脚本引用
assert 'src="app.js"' not in html and 'src="builtin-data.js"' not in html
assert '/sw.js' not in html
print('OK: 无外部脚本/src 依赖')
