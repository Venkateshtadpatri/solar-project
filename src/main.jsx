import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import './index.css'
import store from './redux/index.jsx'
import App from './App.jsx'
import {WeatherProvider} from "./components/api/WeatherContext.jsx";
import 'react-toastify/dist/ReactToastify.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
        <Router>
        <WeatherProvider>
            <App />
        </WeatherProvider>
        </Router>
    </Provider>
  </StrictMode>
)
