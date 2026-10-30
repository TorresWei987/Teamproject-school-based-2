import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import handler from '../netlify/functions/handbook-check.mjs';

const root=resolve('dist');
const port=Number(process.env.PORT||3324);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf'};
createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,`http://127.0.0.1:${port}`);
    if(url.pathname==='/api/handbook-check'){
      const chunks=[];let length=0;
      for await(const chunk of req){length+=chunk.length;if(length>4096){res.writeHead(413);res.end();return;}chunks.push(chunk);}
      const body=Buffer.concat(chunks);
      const response=await handler(new Request(url,{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body}:{} )}));
      res.writeHead(response.status,Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const file=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
    if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end('Unable to serve this request.');}
}).listen(port,'127.0.0.1',()=>console.log(`Handbook preview: http://127.0.0.1:${port}`));
