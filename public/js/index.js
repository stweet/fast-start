// javascript file

const EventDispatcher = function () {

    const listeners = {};

    // add listener
    this.addEventListener = function (action, listener) {
        listeners[action] = listeners[action] || [];
        listeners[action].push(listener);
    };

    // @todo implemented removeListener method

    // dispatcher
    this.dispatch = function (event) {

        const a = event.action;
        const l = listeners[a] || [];
        for (const i of l) i[a].call(l, event);
    };
};

// system event types
const ServerEvent = {
    ON_GET_MESSAGES_EVENT: 'onGetMessagesEvent',
    ON_MESSAGES_EVENT: 'onMessagesEvent',
    ON_MESSAGE_EVENT: 'onMessageEvent',
};


// CLIENT SERVER PROTOCOL //
// event.data.wsc   // client action
// event.data.wsd   // client message {username, message}
const ServerApi = {
    prepare: function (action, data) {
        // @todo validate protocol
        return JSON.stringify({
            wsc: action,
            wsd: data,
        });
    },
    parse: function (data) {
        // @todo validate protocol
        const { wsd, wsc } = JSON.parse(data);
        return { action: wsc, data: wsd };
    }
};

const Application /* class */ = function () {

    const self = new EventDispatcher();

    // init application
    const connectionStatus = document.querySelector('#connection-status');
    connectionStatus.textContent = 'Connections ...';

    const hostname = `ws://${config.host}:${config.port}/`;
    const socket = new WebSocket(hostname);

    socket.onopen = function () {
        connectionStatus.textContent = 'Connect!';
    };

    socket.onmessage = function (e) {
        const event = ServerApi.parse(e.data);
        self.dispatch(event);
    };

    socket.onclose = function () {
        connectionStatus.textContent = 'Disconnect!';
    };

    socket.onerror = function (err) {
        connectionStatus.textContent = 'Error, see console!';
        console.log(err);
    };

    self.sendForm = function (e) {

        const username = e.querySelector('#username').value;
        const message = e.querySelector('#message').value;

        self.sendMessage({ username, message });
        e.querySelector('#message').value = '';
    };

    self.sendMessage = function (args) {
        const message = ServerApi.prepare(ServerEvent.ON_MESSAGE_EVENT, args);
        socket.send(message);
    };

    self.loadMessage = function () {
        const message = ServerApi.prepare(ServerEvent.ON_GET_MESSAGES_EVENT);
        socket.send(message);
    };

    return self;
};

const MessageViewer = function (app) {

    const self = this;
    const output = document.querySelector('#output');
    output.textContent = 'Loading ...';

    function appendMessage(data) {
        const { username, message } = data;

        const element = document.createElement('div');
        element.innerHTML = `<div class="card-body"><h5 class="card-title">${username}</h5><p class="card-text">${message}</p></div>`;
        element.style.marginBottom = '15px';
        element.className = 'card';

        output.appendChild(element);
        setTimeout(() => output.scrollTop = output.scrollHeight, 1);
    }

    app.addEventListener(ServerEvent.ON_MESSAGE_EVENT, self);
    app.addEventListener(ServerEvent.ON_MESSAGES_EVENT, self);

    self[ServerEvent.ON_MESSAGE_EVENT] = function (e) {
        appendMessage(e.data);
    };

    self[ServerEvent.ON_MESSAGES_EVENT] = function (e) {
        output.textContent = '';

        (e.data || []).forEach(i => appendMessage(i));
    };

    return self;
};

const app = new Application();
const view = new MessageViewer(app);

setTimeout(() => app.loadMessage(), 1000);