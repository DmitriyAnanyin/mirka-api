#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import WebSocket, {WebSocketServer} from 'ws';

const server = new WebSocketServer({ port: process.env.PORT || 5000 });


import UserModel from './app/model/UserModel.js';

server.on('connection', (ws) => {
  const connectionMessage = {type: 'connection', time: Date.now(), value: 'Добро пожаловать в MIRKA'}

  ws.send(JSON.stringify(connectionMessage))

  ws.onmessage =async (response) => {
    const data = JSON.parse(response.data)
    
    try {
      if (data.type === 'message') {
        if (data.value === 'sign-in') {
          send('login', Date.now(),  'Введите логин:')
          return
        }

        if (data.value.startsWith('chat')) {
          const login = data.value.split('@')[1]
          
          const client = server.clients.find(client => client.currentUser.login === login)
          
          if (!client) {
            throw new Error(`${login} не доступен`)
          }

          sendMessage(data.time, data.value, login)
        }

        sendMessage(data.time, data.value)
      }
      
      if (data.type === 'login') {
        const user = await UserModel.checkLogin(data.value)
        ws.currentUser = user
        send('password', Date.now(), 'Введите пароль:')
        return
      }

      if (data.type === 'password') {
        if (data.value === ws.currentUser.password) {
          send('auth', Date.now(), `Добро пожаловать ${ws.currentUser.login}`)
        } else {
          throw new Error('Пароль не верен')
        }
        return
      }      

    } catch (error) {
      sendMessage(Date.now(), error.message)
    }
  }
  
  function sendMessage(time, value, login) {
    send('message', time, value, login)
  }
  
  function send (type, time, value, login) {
    if (login) {
      server.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN) {
          if(login === client.currentUser.login) {
            client.send(JSON.stringify({type, time, value}))
          }
        }
      })
    } else {
      ws.send(JSON.stringify({type, time, value}))
    }
  }
})