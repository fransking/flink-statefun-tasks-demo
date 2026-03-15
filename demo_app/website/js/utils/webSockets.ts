import { getBaseUrl } from "./urlUtils"
import { fromEvent } from 'rxjs';
import { filter, map, bufferTime } from 'rxjs/operators';
import { groupBy } from "./groupBy";
import type { Middleware, Dispatch, AnyAction, MiddlewareAPI } from 'redux';

type CallbackFn = (data: Record<string, unknown>) => AnyAction;

const wsSubscribe = (dispatch: Dispatch, topic: string, callback: CallbackFn, buffered: boolean = false) => {
    dispatch(({type: 'WS_SUBSCRIBE', topic:topic, callback: callback, buffered: buffered} as AnyAction))
}

const wsUnsubscribe = (dispatch: Dispatch, topic: string, callback: CallbackFn) => {
    dispatch(({type: 'WS_UNSUBSCRIBE', topic:topic, callback: callback} as AnyAction))
}

const webSockets = (): Middleware => {
    console.log('Websocket middleware loaded')

    let websocket: WebSocket | null = null
    
    const subscriptions: Record<string, CallbackFn[]> = {}
    const bufferedTopics: Record<string, boolean> = {}

    const wsConnect = (store: MiddlewareAPI) => {
        websocket = new WebSocket(getBaseUrl('ws') + '/ws')
        let ping: ReturnType<typeof setInterval> | null = null
        let timeout: ReturnType<typeof setTimeout> | null = null
        
        websocket.onopen = () => {
            store.dispatch(({type: 'WS_CONNECTED'}))

            Object.keys(subscriptions).forEach(topic => {
                subscribe(store, topic)
            })

            ping = setInterval(() => keepalive(), 5000)
        }

        const keepalive = () => {
            websocket!.send(JSON.stringify({action: 'PING'}))
            timeout = setTimeout(() => onTimeout(), 5000)
        }

        const onTimeout = () => {
            clearTimeout(timeout!)
            clearInterval(ping!)

            store.dispatch(({type: 'WS_TIMEOUT'}))
            setTimeout(() => wsConnect(store), 1000)
        }

        websocket.onerror = (error) => {
            clearTimeout(timeout!)
            clearInterval(ping!)

            store.dispatch(({type: 'WS_ERROR', error: error}))
            websocket!.close()
        }

        websocket.onclose = () => {
            clearTimeout(timeout!)
            clearInterval(ping!)

            store.dispatch(({type: 'WS_CLOSED'}))
            setTimeout(() => wsConnect(store), 1000)
        }

        websocket.onmessage = (message: MessageEvent) => {
            const data = JSON.parse(message.data)

            if (data.action === 'PONG') {
                clearTimeout(timeout!)
            } 
            else if (data.type === 'TASK_FINISHED') {
                if  (data.topic in bufferedTopics === false) {          // buffered topics will be dealt with below using RxJS
                    store.dispatch(({type: 'WS_MESSAGE', data: data}))
                }
            }
            else {
                store.dispatch(({type: 'WS_MESSAGE', data: data}))
            }
        }

        //buffered topics
        fromEvent<MessageEvent>(websocket, 'message').pipe(
            map(event => event.data),
            map(data => JSON.parse(data)), 
            filter(data => data.type === 'TASK_FINISHED' && data.topic in bufferedTopics),
            bufferTime(250),
            filter(items => items.length > 0),
            map(items => groupBy('topic', items))
        ).subscribe(items => {
            store.dispatch(({type: 'TASK_FINISHED_BATCH', items: items}))
        });
    }

    const subscribe = (store: MiddlewareAPI, topic: string) => {
        if (sendSocket(store, {'action': 'WS_SUBSCRIBE', 'topic': topic})) {
            store.dispatch(({type: 'WS_SUBSCRIBED', 'topic': topic}))
        }
    }

    const unsubscribe = (store: MiddlewareAPI, topic: string) => {
        if (sendSocket(store, {'action': 'WS_UNSUBSCRIBE', 'topic': topic})) {
            store.dispatch(({type: 'WS_UNSUBSCRIBED', 'topic': topic}))
        }
    }

    const sendSocket = (store: MiddlewareAPI, message: Record<string, string>): boolean => {
        try {
            websocket!.send(JSON.stringify(message))
            return true;
        } catch (error) {
            store.dispatch(({type: 'WS_ERROR', error: error}))
            return false;
        }
    }

    const invokeCallback = (store: MiddlewareAPI, callback: CallbackFn, data: Record<string, unknown>) => {
        try {
            store.dispatch(callback(data))
        } catch (error) {
            store.dispatch(({type: 'WS_CALLBACK_ERROR', error: error}))
        }
    }

    return (store: MiddlewareAPI) => {

        wsConnect(store);

        return (next: Dispatch) => (action: AnyAction) => {

            switch(action.type) {
                case 'WS_SUBSCRIBE': {
                    const callbacks = subscriptions[action.topic] || []
                    callbacks.push(action.callback)
                    subscriptions[action.topic] = callbacks

                    if (action.buffered) {
                        bufferedTopics[action.topic] = true;
                    }

                    subscribe(store, action.topic)
                }
                break;
                
                case 'WS_UNSUBSCRIBE': {
                    let callbacks = subscriptions[action.topic] || []
                    callbacks = callbacks.filter((el: CallbackFn) => el !== action.callback)
                    
                    if (callbacks.length === 0) {
                        delete subscriptions[action.topic]
                        delete bufferedTopics[action.topic]
                        unsubscribe(store, action.topic)
                    } else {
                        subscriptions[action.topic] = callbacks
                    }
                }
                break;

                case 'WS_MESSAGE': {
                    const callbacks = subscriptions[action.data.topic] || []
                    callbacks.forEach((callback: CallbackFn) => invokeCallback(store, callback, action.data))                    
                }
                break;

                case 'TASK_FINISHED_BATCH': {
                    Object.keys(action.items).forEach((topic: string) => {
                        const callbacks = subscriptions[topic] || []
                        const data = {'type': 'TASK_FINISHED_BATCH', items: action.items[topic]}
                        callbacks.forEach((callback: CallbackFn) => invokeCallback(store, callback, data))
                    })             
                }
                
                break;
                case 'WS_CLOSED':
                case 'WS_TIMEOUT': {
                    Object.keys(subscriptions).forEach((topic: string) => {
                        const callbacks = subscriptions[topic] || []
                        callbacks.forEach((callback: CallbackFn) => invokeCallback(store, callback, {'type': 'WS_UNSUBSCRIBED', 'topic': topic}))         
                    })
                }
                break;
            }

            return next(action);
        }
    }
}

export { wsSubscribe, wsUnsubscribe }
export default webSockets
