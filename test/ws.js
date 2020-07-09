/* eslint-disable */
'use strict';

const WebSocket = require('ws');
let heartbeatInterval;
let ws;

function heartbeat(interval) {
	heartbeatInterval = setInterval(() => {
		ws.send(JSON.stringify({ op: 9 }));
	}, interval);
}

function connect() {
	ws = new WebSocket('wss:/gateway.ohori.me');

	ws.onopen = () => {
		clearInterval(heartbeatInterval);
		heartbeatInterval = null;
	};

	ws.onmessage = message => {
		if (!message.data.length) return;
		let response;
		try {
			response = JSON.parse(message.data);
		} catch (error) {
			return;
		}
		switch (response.op) {
			case 0:
				ws.send(JSON.stringify({ op: 9 }));
				heartbeat(response.d.heartbeat);
				break;
			case 1:
				console.log(response);
				break;
			default:
				break;
		}
	};

	ws.onclose = error => {
		clearInterval(heartbeatInterval);
		heartbeatInterval = null;
		if (ws) {
			ws.close();
			ws = null;
		}
		setTimeout(() => connect(), 5000);
	};
}

connect();

