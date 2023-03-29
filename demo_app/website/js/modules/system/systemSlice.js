import { createSlice } from "@reduxjs/toolkit"

const systemSlice = createSlice({
    name: 'system',
    initialState: {
        'config': "This is some config"
    },
    reducers: {
        getConfiguration(state, action) {
            console.log(state.system)
            state.config = "This is some new config"
            state.value = "a"
        }
    }
})

export const { getConfiguration } = systemSlice.actions
export default systemSlice.reducer