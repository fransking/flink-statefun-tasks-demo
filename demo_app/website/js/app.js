import '../styles/app.scss'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { createLogger } from 'redux-logger'
import { Provider } from 'react-redux'
import { configureStore, applyMiddleware } from '@reduxjs/toolkit'
import webSockets from './utils/webSockets'
import reducers from './modules/reducers'
import Layout from './views/Layout'

const store = configureStore({
    reducer: reducers,
    middleware: [
        createLogger(),
        webSockets()
    ]
})

const renderApp = () => createRoot(document.getElementById('app')).render(
    <Provider store={store}>
       <Layout />
    </Provider>
);

renderApp()