import '../styles/app.scss'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { createLogger } from 'redux-logger'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import { configureStore, applyMiddleware } from '@reduxjs/toolkit'
import webSockets from './utils/webSockets'
import reducers from './modules/reducers'
import Layout from './views/Layout'

const store = configureStore({
    reducer: reducers,
    middleware: [
        thunkMiddleware,
        createLogger(),
        webSockets()
    ]
})

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
      </Route>
    )
  );  

const renderApp = () => createRoot(document.getElementById('app')).render(
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
);

renderApp()