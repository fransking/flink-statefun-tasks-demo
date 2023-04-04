import { getBaseUrl } from "./urlUtils"

const wsSubscribe = (dispatch, topic, callback) => {
    dispatch(({type: 'WS_SUBSCRIBE', topic:topic, callback: callback}))
}

const wsUnsubscribe = (dispatch, topic, callback) => {
    dispatch(({type: 'WS_UNSUBSCRIBE', topic:topic, callback: callback}))
}

const webSockets = () => {
    console.log('Websocket middleware loaded')

    let websocket = null;
    const subscriptions = {}

    const wsConnect = store => {
        websocket = new WebSocket(getBaseUrl('ws') + '/ws')
        
        websocket.onopen = () => {
            store.dispatch(({type: 'WS_CONNECTED'}))

            Object.keys(subscriptions).forEach(topic => {
                subscribe(store, topic)
            })
        }

        websocket.onerror = (error) => {
            store.dispatch(({type: 'WS_ERROR', error: error}))
            websocket.close()
        }

        websocket.onclose = () => {
            store.dispatch(({type: 'WS_CLOSED'}))
            setTimeout(() => wsConnect(store), 1000)
        }

        websocket.onmessage = message => {
            const data = JSON.parse(message.data)
            store.dispatch(({type: 'WS_MESSAGE', data: data}))
        }
    }

    const subscribe = (store, topic) => {
        if (sendSocket(store, {'action': 'WS_SUBSCRIBE', 'topic': topic})) {
            store.dispatch(({type: 'WS_SUBSCRIBED', 'topic': topic}))
        }
    }

    const unsubscribe = (store, topic) => {
        if (sendSocket(store, {'action': 'WS_UNSUBSCRIBE', 'topic': topic})) {
            store.dispatch(({type: 'WS_UNSUBSCRIBED', 'topic': topic}))
        }
    }

    const sendSocket = (store, message) => {
        try {
            websocket.send(JSON.stringify(message))
            return true;
        } catch (error) {
            store.dispatch(({type: 'WS_ERROR', error: error}))
            return false;
        }
    }

    const invokeCallback = (store, callback, data) => {
        try {
            store.dispatch(callback(data))
        } catch (error) {
            store.dispatch(({type: 'WS_CALLBACK_ERROR', error: error}))
        }
    }

    return store => {

        wsConnect(store);

        return next => action => {

            switch(action.type) {
                case 'WS_SUBSCRIBE': {
                    let callbacks = subscriptions[action.topic] || []
                    callbacks.push(action.callback)
                    subscriptions[action.topic] = callbacks
                    subscribe(store, action.topic)
                }
                break;
                
                case 'WS_UNSUBSCRIBE': {
                    let callbacks = subscriptions[action.topic] || []
                    callbacks = callbacks.filter(el => el !== callback)
                    subscriptions[action.topic] = callbacks
                    unsubscribe(store, action.topic)
                }
                break;

                case 'WS_MESSAGE': {
                    let callbacks = subscriptions[action.data.topic] || []
                    callbacks.forEach(callback => invokeCallback(store, callback, action.data))
                }
                break;
            }

            return next(action);
        }
    }
}

export { wsSubscribe, wsUnsubscribe }
export default webSockets
