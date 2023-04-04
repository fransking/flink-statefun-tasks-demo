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


const markTaskComplete = (task_id, status, pipeline) => {
    if (!pipeline) {
        return
    }

    pipeline.forEach(taskOrGroup => {
        if (taskOrGroup.type === 'group') {
            
            taskOrGroup.tasks.forEach(chain => {
                markTaskComplete(task_id, status, chain)
            })

        } else if (taskOrGroup.type === 'task' && taskOrGroup.id === task_id) {
            taskOrGroup['status'] = status
        }
    })
} 


const workflowsSlice = createSlice({
    name: 'workflows',
    initialState: {
        isRunning: false,
        pipelines: {},
        results: {}
    },
    reducers: {
        onTaskEvent(state, action) {
            switch (action.payload.type) {
                case 'PIPELINE_CREATED': {
                    state.pipelines[action.payload.root_pipeline_id] = action.payload.data
                }
                case 'TASK_FINISHED': {
                    const pipeline = state.pipelines[action.payload.root_pipeline_id]
                    markTaskComplete(action.payload.task_id, action.payload.status, pipeline)
                }
                break
            }
        },
        resetWorkflow(state, action) {
            state.pipelines[action.payload] = []
            state.results[action.payload] = null
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
