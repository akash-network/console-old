import fastify from 'fastify';
import plugin from './plugin';
import cors from '@fastify/cors';

const app = fastify({
  logger: {
    level: 'debug',
  }
});

app.register(cors, {});
app.register(plugin, {});

app.listen({ port: 3005, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
