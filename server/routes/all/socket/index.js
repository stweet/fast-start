
// route event types
const Event = {
    ON_CLIENT_CONNECT_EVENT: 'onClientConnectEvent',
    ON_CLIENT_MESSAGE_EVENT: 'onClientMessageEvent',
    ON_CLIENT_DISCONNECT_EVENT: 'onClientDisconnectEvent',
};

// system event types
const ClientEvent = {
    ON_GET_MESSAGES_EVENT: 'onGetMessagesEvent',
    ON_MESSAGES_EVENT: 'onMessagesEvent',
    ON_MESSAGE_EVENT: 'onMessageEvent',
};

// CLIENT SERVER PROTOCOL //
// event.data.wsc   // client action
// event.data.wsd   // client message {username, message}
const ClientApi = {
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

module.exports = app => {

    // application dispatcher
    const dispatcher = app.get('dispatcher');

    const clients = [];     // allow clients
    const messages = [];    // storage

    // welcome from all users
    messages.push({ username: 'System', message: 'Welcome to websocket chat!' });

    // listen actions client route and handle
    dispatcher.addEventListener(Event.ON_CLIENT_CONNECT_EVENT, {
        [Event.ON_CLIENT_CONNECT_EVENT]: function (event) {
            console.log(event.action, event.client.index);
        },
    });

    dispatcher.addEventListener(Event.ON_CLIENT_MESSAGE_EVENT, {
        [Event.ON_CLIENT_MESSAGE_EVENT]: function (e) {

            // interpritation client data, validate and any do
            console.log(e.action, e.client.index, e.data);

            // next dispatch client command to application
            const event = ClientApi.parse(e.data);
            event.client = e.client;

            dispatcher.dispatch(event);
        },
    });

    dispatcher.addEventListener(Event.ON_CLIENT_DISCONNECT_EVENT, {
        [Event.ON_CLIENT_DISCONNECT_EVENT]: function (event) {
            console.log(event.action, event.client.index);
        },
    });

    // listen system actions
    dispatcher.addEventListener(ClientEvent.ON_MESSAGE_EVENT, {
        [ClientEvent.ON_MESSAGE_EVENT]: function (event) {

            // save message in database
            const { username, message } = event.data;
            messages.push({ username, message });
        },
    });

    dispatcher.addEventListener(ClientEvent.ON_MESSAGE_EVENT, {
        [ClientEvent.ON_MESSAGE_EVENT]: function (event) {

            // dispatch command to socket all clients
            const message = ClientApi.prepare(ClientEvent.ON_MESSAGE_EVENT, event.data);
            for (const client of clients) client.connection.send(message);
        },
    });

    dispatcher.addEventListener(ClientEvent.ON_GET_MESSAGES_EVENT, {
        [ClientEvent.ON_GET_MESSAGES_EVENT]: function (e) {

            // dispatch command to socket from current client
            const message = ClientApi.prepare(ClientEvent.ON_MESSAGES_EVENT, messages);
            e.client.connection.send(message);
        },
    });

    // socket server handler
    return (connection, req) => {

        const client = {
            connection: connection,
            index: clients.length,
            req: req,
        };

        connection.on('message', function (data) {

            dispatcher.dispatch({
                action: Event.ON_CLIENT_MESSAGE_EVENT,
                client: client,
                data: data
            });
        });

        connection.on('close', function () {

            for (let i = 0; i < clients.length; i++) {
                if (clients[i].index == client.index) {

                    clients.splice(i, 1);

                    dispatcher.dispatch({
                        action: Event.ON_CLIENT_DISCONNECT_EVENT,
                        client: client,
                    });

                    return;
                }
            }
        });

        connection.on('error', function (err) {
            console.log(err);
        });

        clients.push(client);

        dispatcher.dispatch({
            action: Event.ON_CLIENT_CONNECT_EVENT,
            client: client,
        });
    }
}