const importAll = (require: __WebpackModuleApi.RequireContext) =>
  require.keys().reduce((acc, next) => {
    acc[next.replace('./', '').replace('.png', '')] = require(next);
    return acc;
  }, {} as Record<string, string>);

export const templateIcons = importAll(require.context('./', false, /\.(png)$/));
