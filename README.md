# koa-hostname
koa hostname 路由，可以结合 koa-router 完成 hostname + path 的路由

# useage & test
修改本地 host 配置

```host
127.0.0.1 a.com x.a.com y.a.com b.com c.com
```

结合 ```koa-router``` 可以完成 hostname + path 路由

```typescript
import * as Koa from 'koa';
import * as Router from 'koa-router';
import { createReadStream } from 'fs';

import HRouter from '../src';

const app = new Koa();
const host = new HRouter();
const renderPage = (ctx: Koa.Context, pageName: string) => {
  ctx.set('content-type', 'text/html');
  ctx.body = createReadStream(__dirname + '/' + pageName + '.html');
}

const routerA = new Router();
routerA
  .get('/', ctx => renderPage(ctx, 'a'))
  .get('/api', ctx => ctx.body = 'hello a');
host.use(['a.com', '*.a.com'], async (ctx, next) => {
  console.log('site a.');
  await next();
}, routerA.routes());

const routerB = new Router();
routerB
  .get('/', ctx => renderPage(ctx, 'b'))
  .get('/api', ctx => ctx.body = 'hello b.');
host.use('b.com', async (ctx, next) => {
  console.log('site b.');
  await next();
}, routerB.routes());

const routerC = new Router();
routerC
  .get('/', ctx => renderPage(ctx, 'c'))
  .get('/api', ctx => ctx.body = 'hello c.');
host.use('c.com', async (ctx, next) => {
  console.log('site c.');
  await next();
}, routerC.routes());

app.use(host.middleware());

app.use(async ctx => {
  ctx.body = '404 not found';
});

app.listen(8080);
```
访问：
- a.com，x.a.com，y.a.com 渲染页面 a
- b.com 渲染页面 b
- c.com 渲染页面 c
- a.com/api，x.a.com/api，y.a.com/api 路由到 a 的接口 /api
- b.com/api 路由到 b 接口 /api
- c.com/api 路由到 c 接口 /api
