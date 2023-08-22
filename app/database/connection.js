
import mysql from 'mysql';

export const connection = () => mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : '',
  database : 'mirka'
});