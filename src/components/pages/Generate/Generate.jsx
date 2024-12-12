import { useState } from "react";
import Navbar from "./Navbar";
import WorkSpace from "./WorkSpace";
const initialState = {
    SmbCount: 0,
    StringCount: 0,
    PanelCount: 0,
};
const Generate = () => {
    const [counts, setCounts] = useState(initialState);

    return (
        <>
            <Navbar setCounts={setCounts} />
            <WorkSpace counts={counts} /> {/* Full WorkSpace */}
        </>
    );
}

export default Generate