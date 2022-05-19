import compose from 'koa-compose';
import minimatch from 'minimatch';
import type { Context, Next, Middleware } from 'koa';

class HostnameRouter {
  private pathDeps = new Map<string | string[], Middleware<any, any>[]>();

  middleware() {
    return async (context: Context, next: Next) => {
      const { hostname, path: pathname } = context;
      const matchedKey = Array.from(this.pathDeps.keys()).find(path => {
        let matched: boolean;
        if (Array.isArray(path)) {
          matched = path.find(p => minimatch(`${hostname}${pathname}`, p)) ? true : false;
        } else {
          matched = minimatch(`${hostname}${pathname}`, path);
        }
        return matched;
      });

      if (matchedKey) {
        return compose(this.pathDeps.get(matchedKey))(context, next);
      } else {
        return await next();
      }
    }
  }

  use<T = {}, U = {}>(path: string | string[], ...middlewares: Middleware<T, U>[]) {
    this.pathDeps.set(path, middlewares);
  }
}

export default HostnameRouter;
module.exports = HostnameRouter;
