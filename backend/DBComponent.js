import {Pool} from 'pg';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./config.json'));
const {username, password, ip, port, database} = config.database_params

const pool = new Pool
({
    connectionString: `postgres://${username}:${password}@${ip}:${port}/${database}`,
    ssl: false
});

export const runQuery = (query, params) => pool.query(query, params);