import '../styles/app.scss'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom"
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import webSockets from './utils/webSockets'
import reducers from './modules/reducers'
import Layout from './views/Layout'

const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(webSockets()),
})

const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />} />
    )
)

createRoot(document.getElementById('app')!).render(
    <Provider store={store}>
        <RouterProvider router={router} />
    </Provider>
)