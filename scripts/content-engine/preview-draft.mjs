import fs from 'node:fs'
import path from 'node:path'

const draftsDir = path.resolve('content-workbench/drafts')
const outputPath = path.resolve('content-workbench/preview.html')

const drafts = fs
  .readdirSync(draftsDir)
  .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
  .map((file) => ({
    file,
    mtimeMs: fs.statSync(path.join(draftsDir, file)).mtimeMs,
  }))
  .sort((a, b) => b.mtimeMs - a.mtimeMs)

if (!drafts.length) {
  throw new Error('미리보기로 만들 draft 파일이 없습니다.')
}

const latest = drafts[0]
const raw = fs.readFileSync(path.join(draftsDir, latest.file), 'utf8')
const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')

function escapeHtml(value) {
  return value.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[char])
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

function closeLists(state) {
  let html = ''
  if (state.inUl) {
    html += '</ul>'
    state.inUl = false
  }
  if (state.inOl) {
    html += '</ol>'
    state.inOl = false
  }
  return html
}

function closeTable(state) {
  if (!state.inTable) return ''
  state.inTable = false
  return '</tbody></table></div>'
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/)
  const state = { inUl: false, inOl: false, inTable: false }
  let html = ''

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()

    if (!line) {
      html += closeLists(state)
      html += closeTable(state)
      continue
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      html += closeLists(state)
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
      const next = (lines[index + 1] || '').trim()
      const isSeparator = cells.every((cell) => /^:?-{3,}:?$/.test(cell))
      if (isSeparator) continue

      if (!state.inTable) {
        html += '<div class="table-wrap"><table>'
        if (next.startsWith('|') && next.includes('---')) {
          html += `<thead><tr>${cells.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('')}</tr></thead><tbody>`
          index += 1
        } else {
          html += `<tbody><tr>${cells.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`
        }
        state.inTable = true
      } else {
        html += `<tr>${cells.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join('')}</tr>`
      }
      continue
    }

    html += closeTable(state)

    if (line.startsWith('# ')) {
      html += closeLists(state)
      html += `<h1>${inlineMarkdown(line.slice(2))}</h1>`
      continue
    }
    if (line.startsWith('## ')) {
      html += closeLists(state)
      html += `<h2>${inlineMarkdown(line.slice(3))}</h2>`
      continue
    }
    if (line.startsWith('### ')) {
      html += closeLists(state)
      html += `<h3>${inlineMarkdown(line.slice(4))}</h3>`
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      if (!state.inOl) {
        html += closeLists(state)
        html += '<ol>'
        state.inOl = true
      }
      html += `<li>${inlineMarkdown(line.replace(/^\d+\.\s/, ''))}</li>`
      continue
    }
    if (line.startsWith('- ')) {
      if (!state.inUl) {
        html += closeLists(state)
        html += '<ul>'
        state.inUl = true
      }
      html += `<li>${inlineMarkdown(line.slice(2))}</li>`
      continue
    }

    html += closeLists(state)
    html += `<p>${inlineMarkdown(line)}</p>`
  }

  html += closeLists(state)
  html += closeTable(state)
  return html
}

const html = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>콘텐츠 엔진 초안 미리보기</title>
    <style>
      body {
        margin: 0;
        background: #f7f7f5;
        color: #202124;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.75;
      }
      main {
        max-width: 820px;
        min-height: 100vh;
        margin: 0 auto;
        padding: 56px 24px 80px;
        background: #fff;
      }
      header {
        margin-bottom: 36px;
        padding-bottom: 18px;
        border-bottom: 1px solid #e5e5e0;
      }
      .eyebrow {
        margin: 0;
        color: #6b7280;
        font-size: 13px;
      }
      h1 {
        margin: 0 0 24px;
        font-size: 34px;
        line-height: 1.25;
        letter-spacing: 0;
      }
      h2 {
        margin: 42px 0 14px;
        padding-top: 28px;
        border-top: 1px solid #eee;
        font-size: 24px;
      }
      h3 {
        margin: 30px 0 10px;
        font-size: 19px;
      }
      p,
      ul,
      ol {
        font-size: 17px;
      }
      p {
        margin: 14px 0;
      }
      ul,
      ol {
        margin: 14px 0 20px;
        padding-left: 26px;
      }
      li {
        margin: 7px 0;
      }
      code {
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        background: #f1f3f4;
        padding: 1px 5px;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
        font-size: 0.92em;
      }
      .table-wrap {
        overflow-x: auto;
        margin: 22px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 15px;
      }
      th,
      td {
        border: 1px solid #e5e7eb;
        padding: 10px 12px;
        vertical-align: top;
      }
      th {
        background: #f5f5f4;
        text-align: left;
      }
      footer {
        margin-top: 48px;
        padding-top: 18px;
        border-top: 1px solid #eee;
        color: #6b7280;
        font-size: 13px;
      }
      @media (max-width: 640px) {
        main {
          padding: 32px 18px;
        }
        h1 {
          font-size: 28px;
        }
        h2 {
          font-size: 22px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p class="eyebrow">콘텐츠 엔진 초안 미리보기 · ${escapeHtml(latest.file)}</p>
      </header>
      ${renderMarkdown(body)}
      <footer>이 파일은 로컬 검수용 preview입니다. 블로그에 공개된 글이 아닙니다.</footer>
    </main>
  </body>
</html>
`

fs.writeFileSync(outputPath, html, 'utf8')
console.log(outputPath)
