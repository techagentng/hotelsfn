import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Score slice for tracking _obs file uploads
const scoreSlice = createSlice({
  name: 'score',
  initialState: {
    count: 0,
    flaggedFiles: [] as string[],
  },
  reducers: {
    incrementScore: (state, action: PayloadAction<string>) => {
      state.count += 1;
      state.flaggedFiles.push(action.payload);
    },
    resetScore: (state) => {
      state.count = 0;
      state.flaggedFiles = [];
    },
  },
});

export const { incrementScore, resetScore } = scoreSlice.actions;

// Combine reducers
const rootReducer = combineReducers({
  score: scoreSlice.reducer,
});

// Persist config
const persistConfig = {
  key: 'hotel-app',
  storage,
  whitelist: ['score'], // Only persist score slice
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
