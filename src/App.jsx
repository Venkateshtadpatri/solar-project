import { Routes, Route } from 'react-router-dom';
import Generate from "./components/pages/Generate/Generate";
import View from "./components/pages/View/View";
import "./App.css";

function App() {
    return (
        <>
            <Routes>
                <Route path='/' element={<Generate />} />
                <Route path='/view' element={<View />} />  
            </Routes>
        </>
    );
}

export default App;
