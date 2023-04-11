import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getBaseUrl } from "../../utils/urlUtils";
import axios from 'axios';


export const runWorkflow = createAsyncThunk('runWorkflow', async (data) => {
    const {api, id} = data
    return axios.post(getBaseUrl() + api + id).then(response => {
        return {
            id: id,
            data: response.data
        }
    })
})


const markTaskStatus = (task_id, status, pipeline) => {
    if (!pipeline) {
        return
    }

    pipeline.forEach(taskOrGroup => {
        if (taskOrGroup.type === 'group') {
            
            taskOrGroup.tasks.forEach(chain => {
                markTaskStatus(task_id, status, chain)
            })

        } else if (taskOrGroup.type === 'task' && taskOrGroup.id === task_id) {
            taskOrGroup['status'] = status
        }
    })
} 

const markAllPendingTaskStatuses = (status, pipeline) => {
    if (!pipeline) {
        return
    }

    pipeline.forEach(taskOrGroup => {
        if (taskOrGroup.type === 'group') {
            
            taskOrGroup.tasks.forEach(chain => {
                markAllPendingTaskStatuses(status, chain)
            })

        } else if (taskOrGroup.type === 'task') {
            const currentStatus = taskOrGroup['status']

            if (!['COMPLETED', 'FAILED', 'SKIPPED'].includes(currentStatus)) {
                taskOrGroup['status'] = status
            } 
        }
    })
} 

const workflowsSlice = createSlice({
    name: 'workflows',
    initialState: {
        isRunning: false,
        subscriptions: {},
        pipelines: {},
        results: {},
        status: {}
    },
    reducers: {
        onTaskEvent(state, action) {
            switch (action.payload.type) {
                case 'WS_SUBSCRIBED': {
                    state.subscriptions[action.payload.topic] = true
                    break;
                }
                case 'WS_UNSUBSCRIBED': {
                    delete state.subscriptions[action.payload.topic]
                    break;
                }
                case 'PIPELINE_CREATED': {
                    state.pipelines[action.payload.root_pipeline_id] = action.payload.data
                    break;
                }
                case 'TASK_FINISHED': {
                    const pipeline = state.pipelines[action.payload.root_pipeline_id]
                    markTaskStatus(action.payload.task_id, action.payload.status, pipeline)
                    break;
                }
                case 'TASK_SKIPPED': {
                    console.log("SKIPPED")
                    const pipeline = state.pipelines[action.payload.root_pipeline_id]
                    markTaskStatus(action.payload.task_id, 'SKIPPED', pipeline)
                    break;
                }
                case 'PIPELINE_STATUS': {
                    const pipeline = state.pipelines[action.payload.root_pipeline_id]
                    markAllPendingTaskStatuses(action.payload.status, pipeline)
                    break
                }
            }            
        },
        resetWorkflow(state, action) {
            state.pipelines[action.payload] = []
            state.results[action.payload] = null
            state.status[action.payload] = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(runWorkflow.pending, (state, action) => {
            state.isRunning = true
            state.results[action.meta.arg.id] = null
        })

        builder.addCase(runWorkflow.fulfilled, (state, action) => {
            state.isRunning = false
            state.results[action.payload.id] = action.payload.data
        })

        builder.addCase(runWorkflow.rejected, (state, action) => {
            state.isRunning = false
        })
    },
})


export const { onTaskEvent, resetWorkflow } = workflowsSlice.actions
export default workflowsSlice.reducer
