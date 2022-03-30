import Koa from 'koa';
import { expect } from 'chai';
import request from 'supertest';
import Router from 'koa-router';

import HRouter from '../lib';

describe('module compatible.', () => {
  it('esmodule import.', () => {
    expect(HRouter).to.be.a('function');
  });

  it('commonjs module require.', () => {
    let HRouterCommonModule = require('../lib');

    expect(HRouterCommonModule).to.be.a('function');
    expect(HRouterCommonModule).to.equal(HRouter);
  });
});

/**
 * host
 * 127.0.0.1 a.com x.a.com y.a.com
 * 127.0.0.1 b.com x.b.com y.b.com
 * 127.0.0.1 c.com
 */
describe('hostname router basic functions.', () => {
  const app = new Koa();
  const hRtouer = new HRouter();
  const pRouter = new Router();

  pRouter.get('/', ctx => ctx.body = 'path router successful.');

  hRtouer.use('a.com', ctx => ctx.body = 'a.com');

  hRtouer.use('*.a.com', ctx => ctx.body = '*.a.com');

  hRtouer.use(['b.com', '*.b.com'], ctx => ctx.body = 'b.com、*.b.com');

  hRtouer.use('c.com', pRouter.middleware());

  app.use(hRtouer.middleware());

  app.use(ctx => console.log(ctx.hostname));

  app.listen(8081);

  it('a.com.', async () => {
    const resp = await request.agent('http://a.com:8081').get('/');
    expect(resp.text).to.equal('a.com');
  });

  it('*.a.com.', async () => {
    let resp = await request.agent('http://x.a.com:8081').get('/');
    expect(resp.text).to.equal('*.a.com');

    resp = await request.agent('http://y.a.com:8081').get('/');
    expect(resp.text).to.equal('*.a.com');
  });

  it('b.com、*.b.com', async () => {
    let resp = await request.agent('http://b.com:8081').get('/');
    expect(resp.text).to.equal('b.com、*.b.com');

    resp = await request.agent('http://x.b.com:8081').get('/');
    expect(resp.text).to.equal('b.com、*.b.com');

    resp = await request.agent('http://y.b.com:8081').get('/');
    expect(resp.text).to.equal('b.com、*.b.com');
  });

  it('compose koa-router', async () => {
    const resp = await request.agent('http://c.com:8081').get('/');
    expect(resp.text).to.equal('path router successful.');

    process.exit();
  });
});
