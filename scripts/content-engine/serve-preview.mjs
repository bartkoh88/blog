import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const root = path.resolve('content-workbench')
const port = Number(process.env.CONTENT_PREVIEW_PORT || 4177)

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.mdx': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', `http://127.0.0.1:${port}`)
  let pathname = decodeURIComponent(url.pathname)
  if (pathname === '/') pathname = '/preview.html'

  const filePath = path.normalize(path.join(root, pathname))
  if (!filePath.startsWith(root)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404)
      response.end('Not found')
      return
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
    })
    response.end(data)
  })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`PREVIEW_URL=http://127.0.0.1:${port}/preview.html`)
})
