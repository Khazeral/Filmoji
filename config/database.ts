import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import fs from 'node:fs'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync('certs/ca-certificate.crt').toString(),
        },
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
