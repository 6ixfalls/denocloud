import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Toast from "./components/Toast";
import Dashboard from "./routes/dashboard";
import DashboardIndex from "./routes/dashboard/index";
import Editor from './routes/dashboard/project/editor';
import Project from "./routes/dashboard/project";
import ProjectCreate from "./routes/dashboard/project/create";
import ProjectIndex from "./routes/dashboard/project/index";
import NotFound from "./routes/404";

export let supabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_URL || "",
  process.env.REACT_APP_ANON_KEY || ""
);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Toast.Toaster></Toast.Toaster>
      <Routes>
        <Route path='*' element={<NotFound />} />

        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardIndex />} />
          <Route path="create" element={<ProjectCreate />} />
          <Route path="projects/:project" element={<Project />}>
            <Route index element={<ProjectIndex />} />
            <Route path="editor" element={<Editor />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
