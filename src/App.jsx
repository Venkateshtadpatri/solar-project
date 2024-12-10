
import Navbar from "./components/Navbar";
import WorkSpace from "./components/WorkSpace";
import "./App.css";
import {useState} from "react";
import {RemoveScrollBar} from 'react-remove-scroll-bar';

function App() {
    const [counts, setCounts] = useState(0);

    return (
        <div>
            <RemoveScrollBar />
            <Navbar setCounts={setCounts} />
            <WorkSpace counts={counts} />
        </div>
    );
}

export default App;
