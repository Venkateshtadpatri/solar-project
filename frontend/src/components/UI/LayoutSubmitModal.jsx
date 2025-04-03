/* eslint-disable react/prop-types */
import axios from "axios";
/**
 * LayoutSubmitModal component:
 *
 * This component renders a modal that allows the user to confirm submission of layout details.
 * It takes in the following props:
 * - `showModal`: A boolean indicating whether the modal should be shown.
 * - `plant`: The ID of the plant to register the layout for.
 * - `smbCount`, `stringCount`, `panelCount`: The counts of SMBs, strings, and panels respectively.
 * - `handleCloseModal`: A function to close the modal.
 *
 * The component renders a modal that displays the layout details and asks the user to confirm submission.
 * If the user confirms, it sends a POST request to the backend API with the layout details.
 * If the request is successful, it alerts the user with a success message and closes the modal.
 * If the request fails, it alerts the user with an error message and logs the error to the console.
 * If the user cancels, it simply closes the modal.
 */
const LayoutSubmitModal = ({ showModal, plant, smbCount, stringCount, panelCount, handleCloseModal }) => {
    /**
     * Handles the submission of the layout registration form.
     * Sends a POST request to the backend API with the layout details.
     * If the request is successful, it alerts the user with a success message and closes the modal.
     * If the request fails, it alerts the user with an error message and logs the error to the console.
     */
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
