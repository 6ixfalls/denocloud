import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Toast from "./components/Toast";
import Dashboard from "./routes/dashboard";
import DashboardIndex from "./routes/dashboard/index";
import Editor from './routes/dashboard/editor';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Toast.Toaster></Toast.Toaster>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="/" element={<DashboardIndex />} />
          <Route path="editor" element={<Editor />} />
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
