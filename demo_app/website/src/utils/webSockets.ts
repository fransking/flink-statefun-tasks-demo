import { getBaseUrl } from "./urlUtils"
import { fromEvent } from 'rxjs';
import { filter, map, bufferTime } from 'rxjs/operators';
import { groupBy } from "./groupBy";
import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';

interface AppAction {
    type: string;
    [key: string]: unknown;
}

type CallbackFn = (data: Record<string, unknown>) => AppAction;

const wsSubscribe = (dispatch: (action: unknown) => void, topic: string, callback: CallbackFn, buffered: boolean = false) => {
    dispatch({type: 'WS_SUBSCRIBE', topic, callback, buffered})
}

const wsUnsubscribe = (dispatch: (action: unknown) => void, topic: string, callback: CallbackFn) => {
    dispatch({type: 'WS_UNSUBSCRIBE', topic, callback})
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

        return (next: (action: unknown) => unknown) => (action: unknown) => {
            const act = action as AppAction;

            switch(act.type) {
                case 'WS_SUBSCRIBE': {
                    const callbacks = subscriptions[act.topic as string] || []
                    callbacks.push(act.callback as CallbackFn)
                    subscriptions[act.topic as string] = callbacks

                    if (act.buffered) {
                        bufferedTopics[act.topic as string] = true;
                    }

                    subscribe(store, act.topic as string)
                }
                break;
                
                case 'WS_UNSUBSCRIBE': {
                    let callbacks = subscriptions[act.topic as string] || []
                    callbacks = callbacks.filter((el: CallbackFn) => el !== act.callback)
                    
                    if (callbacks.length === 0) {
                        delete subscriptions[act.topic as string]
                        delete bufferedTopics[act.topic as string]
                        unsubscribe(store, act.topic as string)
                    } else {
                        subscriptions[act.topic as string] = callbacks
                    }
                }
                break;

                case 'WS_MESSAGE': {
                    const callbacks = subscriptions[(act.data as Record<string, unknown>).topic as string] || []
                    callbacks.forEach((callback: CallbackFn) => invokeCallback(store, callback, act.data as Record<string, unknown>))                    
                }
                break;

                case 'TASK_FINISHED_BATCH': {
                    const items = act.items as Record<string, Record<string, unknown>[]>;
                    Object.keys(items).forEach((topic: string) => {
                        const callbacks = subscriptions[topic] || []
                        const data = {'type': 'TASK_FINISHED_BATCH', items: items[topic]}
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
