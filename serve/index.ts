import Koa from 'koa';
import Router from 'koa-router';
import { createReadStream } from 'fs';

import HRouter from '../src';

const app = new Koa();
const host = new HRouter();
const renderPage = (ctx: Koa.Context, pageName: string) => {
  ctx.set('content-type', 'text/html');
  ctx.body = createReadStream(__dirname + '/' + pageName + '.html');
}

// domain A
host.use(['a.com', '*.a.com'], async (ctx, next) => {
  console.log('site a.');
  await next();
}, new Router()
  .get('/', ctx => renderPage(ctx, 'a'))
  .get('/api', ctx => ctx.body = 'hello a')
  .routes()
);

// domain B
host.use('b.com', async (ctx, next) => {
  console.log('site b.');
  await next();
}, new Router()
  .get('/', ctx => renderPage(ctx, 'b'))
  .get('/api', ctx => ctx.body = 'hello b.')
  .routes()
);

// domain C
host.use('c.com', async (ctx, next) => {
  console.log('site c.');
  await next();
}, new Router()
  .get('/', ctx => renderPage(ctx, 'c'))
  .get('/api', ctx => ctx.body = 'hello c.')
  .routes()
);

app.use(host.middleware());

app.use(async ctx => (ctx.body = '404 not found'));

app.listen(8080);
