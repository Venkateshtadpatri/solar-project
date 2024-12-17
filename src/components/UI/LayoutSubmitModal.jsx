/* eslint-disable react/prop-types */
import axios from "axios";
const LayoutSubmitModal = ({ showModal, plant, smbCount, stringCount, panelCount, handleCloseModal }) => {
    const handleRegister = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/app/layout-register/", {
                PlantID: plant,
                SmbCount: smbCount,
                StringCount: stringCount,
                PanelCount: panelCount,
            });
            alert("Layout Registration successful!");
            handleCloseModal();
        } catch (error) {
            const errorMessage =
                error.response?.status === 400
                    ? "Invalid Layout registration details"
                    : "Layout Registration failed. Please try again.";
            alert(errorMessage);
            console.error("Layout Registration failed:", error);
        }
    };

    return (
        <>
            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-center">Confirm Submission</h2>
                        <p className="mb-6 text-center">
                            Are you sure you want to submit the following details?
                        </p>
                        <ul className="mb-6">
                            <li><strong>Plant ID:</strong> {plant}</li>
                            <li><strong>SMB Count:</strong> {smbCount}</li>
                            <li><strong>String Count:</strong> {stringCount}</li>
                            <li><strong>Panel Count:</strong> {panelCount}</li>
                        </ul>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleRegister}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="border-2 border-red-500 px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LayoutSubmitModal;
