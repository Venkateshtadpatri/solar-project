import React, { useState } from "react";

const Navbar = ({ setCounts }) => {
    const initialState = {
        SmbCount: 0,
        StringCount: 0,
        PanelCount: 0,
    };

    const [form, setForm] = useState(initialState);

    const handleSubmit = (e) => {
        e.preventDefault();
        setCounts({
            SmbCount: parseInt(form.SmbCount, 10),
            StringCount: parseInt(form.StringCount, 10),
            PanelCount: parseInt(form.PanelCount, 10),
        });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <header className="w-full h-[75px] bg-red-400">
            <div className="ml-5 pt-4">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="SmbCount" className="font-bold">
                        SMB Count:
                    </label>
                    <input
                        type="number"
                        name="SmbCount"
                        id="SmbCount"
                        placeholder="Enter SMB Count"
                        className="w-[200px] ml-3 p-2 rounded-xl"
                        onChange={handleChange}
                    />
                    <label htmlFor="StringCount" className="font-bold ml-5">
                        String Count:
                    </label>
                    <input
                        type="number"
                        name="StringCount"
                        id="StringCount"
                        placeholder="Enter String Count"
                        className="w-[200px] ml-3 p-2 rounded-xl"
                        onChange={handleChange}
                    />
                    <label htmlFor="PanelCount" className="font-bold ml-5">
                        Panel Count:
                    </label>
                    <input
                        type="number"
                        name="PanelCount"
                        id="PanelCount"
                        placeholder="Enter Panel Count"
                        className="w-[200px] ml-3 p-2 rounded-xl"
                        onChange={handleChange}
                    />
                    <button
                        type="submit"
                        className="ml-10 rounded-xl w-[100px] h-10 bg-violet-500 text-black font-bold hover:bg-violet-400 hover:scale-105 duration-200"
                    >
                        Generate
                    </button>
                </form>
            </div>
        </header>
    );
};

export default Navbar;
