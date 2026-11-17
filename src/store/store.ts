import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subjectReducer from './slices/subjectSlice';
import examReducer from './slices/examSlice';
import noteReducer from './slices/noteSlice';
import studyPlanReducer from './slices/studyPlanSlice';
import paperReducer from './slices/paperSlice';
import resultReducer from './slices/resultSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectReducer,
    exams: examReducer,
    notes: noteReducer,
    studyPlans: studyPlanReducer,
    papers: paperReducer,
    results: resultReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
