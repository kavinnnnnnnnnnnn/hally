import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.jsx'
import './styles/global.css'
import { WorkflowProvider } from './context/WorkflowContext.jsx'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32', // Forest Green
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4caf50', // Success Green
    },
    background: {
      default: '#ffffff', // Clean white background
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1c1e',
      secondary: '#44474e',
    },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8, // Slightly less rounded for buttons than cards
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
})

import ErrorBoundary from './ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <WorkflowProvider>
            <App />
          </WorkflowProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
