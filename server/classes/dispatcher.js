const EventDispatcher = function() {

    const listeners = {};

    // add listener
    this.addEventListener = function(action, listener) {
        listeners[action] = listeners[action] || [];
        listeners[action].push(listener);
    };

    // @todo implemented removeListener method

    // dispatcher
    this.dispatch = function(event) {
        
        const a = event.action;
        const l = listeners[a] || [];
        for (const i of l) i[a].call(l, event);
    };
};

module.exports = {
    EventDispatcher,
};