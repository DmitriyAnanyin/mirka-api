import { connection } from "../database/connection.js"

export default {
  checkLogin(login) {
    return new Promise((resolve, reject) => {
      const conn = connection()
      conn.connect();
  
      conn.query(`SELECT * FROM users WHERE login = '${login}'`, (error, results, fields) => {
        if (error) {
          reject(error)
          return
        };

        results.forEach(user => {
          resolve(user)
        })

        reject(new Error('Логин не найден'))
      });
  
      conn.end();
    })
  }
} 