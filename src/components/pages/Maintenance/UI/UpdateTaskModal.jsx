/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextField, Button, Link } from "@mui/material";
import axios from "axios";

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { y: "-100vh", opacity: 0 },
  visible: {
    y: "0",
    opacity: 1,
    transition: { delay: 0.2 },
  },
};


/**
 * A modal component to update a maintenance task.
 *
 * @param {boolean} showModal Whether the modal should be shown.
 * @param {function} handleCloseModal Function to close the modal.
 * @param {object} task The maintenance task to be updated.
 * @param {number} PlantId The ID of the plant this task belongs to.
 */
const UpdateTaskModal = ({ showModal, handleCloseModal, task, PlantId }) => {
  const [taskId, setTaskId] = useState(task?.taskId || "");
  const [taskName, setTaskName] = useState(task?.taskName || "");
  const [scheduleDate, setScheduleDate] = useState(
    task?.schedule_date ? formatDate(task.schedule_date) : ""
  );
  const [taskDescription, setTaskDescription] = useState(
    task?.taskDescription || ""
  );
  const [isTaskNameEditable, setIsTaskNameEditable] = useState(false);
  const [isTaskDescriptionEditable, setIsTaskDescriptionEditable] =
    useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state whenever the user prop changes
  useEffect(() => {
    if (task) {
      setTaskId(task.taskId || "");
      setTaskName(task.taskName || "");
      setTaskDescription(task.taskDescription || "");
      setScheduleDate(task.schedule_date ? formatDate(task.schedule_date) : "");
    }
  }, [task]);

  // Function to convert "DD/MM/YYYY" to "YYYY-MM-DD"
  function formatDate(dateString) {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  }

  /**
   * Handles the form submission to mark a maintenance task as complete.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event.
   *
   * @returns {Promise<void>} A promise that resolves when the task is marked as complete.
   */
  const handleTaskComplete = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/maintenance_task_complete/${PlantId}/${taskId}/`
      );

      if (response.data.status === "success") {
        handleCloseModal();
        alert("Task completed successfully!");
      } else {
        setError(response.data.message || "Failed to update task details");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while updating task details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles the form submission to update a maintenance task.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event.
   *
   * @returns {Promise<void>} A promise that resolves when the task is updated.
   */
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = {
      ...(isTaskNameEditable && taskName !== task.taskName && { task_name: taskName }),
      ...(isTaskDescriptionEditable && taskDescription !== task.taskDescription && { task_description: taskDescription }),
  };

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/update_maintenance_task/${PlantId}/${taskId}/`,
        payload
      );

      if (response.data.status === "success") {
        handleCloseModal();
        alert("Task updated successfully!");
      } else {
        setError("Failed to update task details");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred while updating task details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleCloseModal}
        >
          <motion.div
            className="bg-white p-14 md:p-28 rounded-lg shadow-lg max-w-4xl w-full"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSave} className="space-y-6">
              <TextField
                label="Task ID"
                type="text"
                value={taskId}
                fullWidth
                variant="outlined"
                size="small"
                disabled
                className="border-gray-300"
              />

              <div className="flex items-center gap-4">
                <TextField
                  label="Task Name"
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={!isTaskNameEditable}
                  required={isTaskNameEditable}
                  className="border-gray-300"
                />
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsTaskNameEditable(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <TextField
                  label="Task Description"
                  type="text"
                  multiline
                  rows={4}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  disabled={!isTaskDescriptionEditable}
                  required={isTaskDescriptionEditable}
                  className="border-gray-300"
                />
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsTaskDescriptionEditable(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Schedule Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    (!isTaskNameEditable && !isTaskDescriptionEditable) ||
                    isSubmitting
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  onClick={handleTaskComplete}
                  variant="contained"
                  color="success"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md"
                >
                  {isSubmitting ? "Completing..." : "Complete Task"}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCloseModal}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-md"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpdateTaskModal;
