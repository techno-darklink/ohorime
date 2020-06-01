'use strict';
const WebSocket = require('ws');
const EventEmitter = require('events');

/**
 * Jpop broadcast client
 */
class BotlistClient extends EventEmitter {
  /**
   * Construction
   */
  constructor() {
    super();
    this.heartbeatInterval;
    this.ws;
  };
  /**
   * Send message with interval
   * @param {Number} interval - interval in ms
   */
  heartbeat(interval) {
    this.heartbeatInterval = setInterval(() => {
      console.log(JSON.stringify({op: 1, t: Date.now(), d: {}}));
      this.ws.send(JSON.stringify({op: 1, t: Date.now(), d: {}}));
    }, interval);
  };
  /**
   * Connect to to botlist gateway
   */
  connect() {
    this.ws = new WebSocket('wss://gateway.botlist.space');
    this.ws.on('open', () => {
      console.log(JSON.stringify({
        op: 0,
        t: Date.now(),
        d: {
          tokens: [
            // eslint-disable-next-line max-len
            '92b1443e63f9ac7052b458e3ad8d3e2dff108921e43d24d3f73caa47018d9fde19330c226d4f2eedaafb1c995f6ca9b5',
          ],
        },
      }));
      this.ws.send(JSON.stringify({
        op: 0,
        t: Date.now(),
        d: {
          tokens: [
            // eslint-disable-next-line max-len
            '92b1443e63f9ac7052b458e3ad8d3e2dff108921e43d24d3f73caa47018d9fde19330c226d4f2eedaafb1c995f6ca9b5',
          ],
        },
      }));
      this.heartbeat(45000);
      this.emit('open');
    });
    this.ws.on('message', (message) => {
      console.log(JSON.parse(message));
    });
  };
};

const client = new BotlistClient();
client.connect();
client.on('open', () => console.log('WS opened'));
client.on('event', console.log);
