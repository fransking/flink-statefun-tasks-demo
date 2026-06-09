import workflowsSlice from './system/workflowsSlice'

const reducers = {
    workflows: workflowsSlice
} as const

export type RootState = {
    workflows: ReturnType<typeof workflowsSlice>
}

export default reducers
