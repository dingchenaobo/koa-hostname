# koa-hostname
koa hostname 路由，支持 middleware 配置，主要用于单应用对接多域名（多业务线）

中间件机制可以结合 koa-router 完成 hostname + path 的路由

# useage
测试时需要修改本地 host 配置

```host
127.0.0.1 a.com x.a.com y.a.com b.com c.com
```

## basic
基础用法
```typescript
import Koa from 'koa';

import HRouter from '../src';

const app = new Koa();
const host = new HRouter();

host.use('a.com', ctx => ctx.body = 'a.com');

host.use('b.com', ctx => ctx.body = 'b.com');

app.use(host.middleware());

app.use(async ctx => {
  ctx.body = '404';
});

app.listen(8080);
```
通过
```bash
curl http://a.com:8080
curl http://b.com:8080
curl http://c.com:8080
```
可以得到返回
```bash
a.com
b.com
404
```

## glob 匹配
支持 glob 语法匹配
```typescript
import Koa from 'koa';

import HRouter from '../src';

const app = new Koa();
const host = new HRouter();

host.use(['a.com', '*.a.com'], ctx => ctx.body = 'a.com');

app.use(host.middleware());

app.use(async ctx => {
  ctx.body = '404 not found';
});

app.listen(8080);
```
通过
```bash
curl http://a.com:8080
curl http://x.a.com:8080
curl http://y.a.com:8080
```
可以得到返回
```bash
a.com
a.com
a.com
```

## 结合 koa-router
结合 ```koa-router```，以及 koa 的中间件机制，可以完成完整的 hostname + path 路由匹配

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
