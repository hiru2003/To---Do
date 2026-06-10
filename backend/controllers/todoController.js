const db = require("../config/db");

// Get all todos for the authenticated user
const getTodos = async (req, res) => {
    try {
        const userId = req.user.id;
        const [todos] = await db.query(
            "SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
        return res.status(200).json(todos);
    } catch (error) {
        console.error("Error fetching todos:", error);
        return res.status(500).json({ error: "Internal server error fetching tasks" });
    }
};

// Create a new todo for the user
const createTodo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: "Task title is required" });
        }

        const [result] = await db.query(
            "INSERT INTO todos (user_id, title) VALUES (?, ?)",
            [userId, title.trim()]
        );

        return res.status(201).json({
            id: result.insertId,
            user_id: userId,
            title: title.trim(),
            completed: false,
            created_at: new Date()
        });
    } catch (error) {
        console.error("Error creating todo:", error);
        return res.status(500).json({ error: "Internal server error creating task" });
    }
};

// Update a todo's status
const updateTodo = async (req, res) => {
    try {
        const userId = req.user.id;
        const todoId = req.params.id;
        const { completed } = req.body;

        if (completed === undefined) {
            return res.status(400).json({ error: "Completed status must be specified" });
        }

        const [result] = await db.query(
            "UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?",
            [completed ? 1 : 0, todoId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found or unauthorized access" });
        }

        return res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        console.error("Error updating todo:", error);
        return res.status(500).json({ error: "Internal server error updating task" });
    }
};

// Delete a todo
const deleteTodo = async (req, res) => {
    try {
        const userId = req.user.id;
        const todoId = req.params.id;

        const [result] = await db.query(
            "DELETE FROM todos WHERE id = ? AND user_id = ?",
            [todoId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Task not found or unauthorized access" });
        }

        return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting todo:", error);
        return res.status(500).json({ error: "Internal server error deleting task" });
    }
};

module.exports = {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo
};
