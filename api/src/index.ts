import fastify from 'fastify';
import fastifyCors from 'fastify-cors'
import pg from 'pg';
import dotenv from 'dotenv';

import testData from '../test/fixtures/deployments';
import getDeploymentRoutes from './routes/deployments';

dotenv.config();

const PORT: number = 8080;
const server = fastify();

const client = new pg.Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

server.register(fastifyCors, { /* cors options */ });

server.get('/', (req, res) => {
  res.send({
    status: 'online'
  })
})

server.get('/watches', (req, res) => {
  client.connect().then(() => {
    client.query('SELECT * from escrow_watch').then((result: any) => {
      res.send(result.rows);
    });
  });
});

server.get('/notifications', (req: any, res: any) => {
  const { owner_id: ownerId } = req.query;

  if (ownerId) {
    client.connect().then(() => {
      client.query('SELECT * from notifications WHERE owner_id = $1', [ownerId]).then((result: any) => {
        res.send(result.rows);
      });
    });
  } else {
    res.send({
      status: 'error',
      message: 'missing required field: owner_id'
    })
  }
})

server.post('/cron', (req, res) => {
  client.connect().then(() => {
    client.query('SELECT * from escrow_watch').then((result: any) => {
      const notifyMessages = [];

      for (let row of result.rows) {
        const deployment = testData.deployments.find(({ deployment: { deployment_id } }: any) => (
          deployment_id.owner == row.owner_id && deployment_id.dseq == row.dseq
        ));

        if (deployment && deployment.escrow_account.balance.amount <= row.threshold) {
          notifyMessages.push({
            owner: row.owner_id,
            message: `The escrow on your deployment ${row.dseq} has fallen below ${row.threshold} ${deployment.escrow_account.balance.denom}. Please top up your account.`
          })
        }
      }

      for (let message of notifyMessages) {
        client.query('INSERT INTO notifications (owner_id, message, read) VALUES ($1, $2, $3)', [
          message.owner,
          message.message,
          false
        ]);
      }

      res.send({
        status: 'success',
        events: notifyMessages.length
      });
    });
  });
  // todo: handle database failure
})

interface PostWatchRequest {
  Body: {
    watch_id: string,
    owner_id: string,
    dseq: string,
    email: string,
  };
}

server.post<PostWatchRequest>('/watches', (req, res) => {
  const data = req.body;
  const watchId = data.watch_id;

  if (watchId) {
    client.connect().then(() => {
      client.query('UPDATE escrow_watch SET owner_id = $1, dseq = $2, email = $3 WHERE watch_id = $4', [data.owner_id, data.dseq, data.email, watchId])
        .then((result: any) => {
          client.end();
          res.send(result.rows);
        });
    })
  } else {
    client.connect().then(() => {
      client.query('INSERT INTO escrow_watch (owner_id, dseq, email) VALUES ($1, $2, $3)', [data.owner_id, data.dseq, data.email])
        .then((result: any) => {
          client.end();
          res.send(result.rows);
        });
    });
  }
});

interface PutWatchRequest {
  Querystring: { watchId: string };
  Body: {
    owner_id: string,
    dseq: string
  }
}

server.put<PutWatchRequest>('/watches/:watchId', (req, res) => {
  const { watchId } = req.query;
  const data = req.body;

  client.connect().then(() => {
    client.query('UPDATE escrow_watch SET owner_id = $1, desc = $2 WHERE id = $3', [data.owner_id, data.dseq, watchId]).then((result: any) => {
      client.end();
      res.send(result.rows);
    });
  });
});

getDeploymentRoutes().map((route: any) => server.route(route))

server.listen(PORT, () => {
  console.log(`server available on http://localhost:${PORT}`);
});