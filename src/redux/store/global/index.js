import { createSlice } from '@reduxjs/toolkit'

export const globalSlice = createSlice({
    name: 'global',
    initialState: {
        token: null
    },
    reducers: {
        setToken: (state, { payload }) => {
            state.token = payload
        },
    },
})

export const { setToken } = globalSlice.actions
export default globalSlice.reducer