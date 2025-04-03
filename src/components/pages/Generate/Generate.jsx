import { useState } from "react";
import Navbar from "./Navbar";
import './Generate.css'
import WorkSpace from "./WorkSpace";
const initialState = {
    SmbCount: 0,
    StringCount: 0,
    PanelCount: 0,
};
/**
 * Generate component:
 *
 * This component initializes the state with the counts of SMBs, Strings, 
 * and Panels, and provides a layout that includes a Navbar and a WorkSpace.
 * The Navbar allows for updating the counts, while the WorkSpace displays them.
 *
 * @returns {JSX.Element} The rendered component with a Navbar and WorkSpace.
 */

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