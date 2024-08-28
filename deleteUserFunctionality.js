// Assuming this is in a Node.js environment with Express.js

const express = require('express');
const app = express();
const port = 4001;

// Middleware for parsing JSON bodies
app.use(express.json());

// Simulate the UserModel (replace with actual ORM/model setup)
const UserModel = {
    findOne: async (query) => {
        // Simulate finding a user
        const users = [{ username: 'john_doe' }, { username: 'jane_doe' }];
        return users.find(user => user.username === query.where.username) || null;
    },
    destroy: async (query) => {
        // Simulate deleting a user
        console.log(`User with username ${query.where.username} deleted`);
        return true;
    }
};

// Authentication middleware (dummy implementation)
const authentication = (req, res, next) => {
    console.log("Authentication passed");
    next();
};

// Authorization middleware (dummy implementation)
const authorisation = ({ isAdmin }) => (req, res, next) => {
    console.log(`Authorization passed. isAdmin: ${isAdmin}`);
    next();
};

// Controller function to delete user by username
const delete_user_by_username = async (req, res) => {
    try {
        const { username } = req.body;

        // Check if the user exists
        const user = await UserModel.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete the user
        await UserModel.destroy({ where: { username } });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "An error occurred while deleting the user" });
    }
};

// Set up the route
app.post(
    "/auth/delete/user",
    authentication,
    authorisation({ isAdmin: false }),
    delete_user_by_username,
);

// Frontend HTML & JS (to be served on a simple static file or template engine)
const frontendHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete User</title>
</head>
<body>
    <h1>Delete User</h1>
    <form id="delete-user-form">
        <label for="other-username">Enter Username to Delete:</label>
        <input type="text" id="other-username" name="other-username" required>
        <button type="submit">Delete User</button>
    </form>

    <script>
        document.getElementById("delete-user-form").addEventListener("submit", async (event) => {
            event.preventDefault();
            const username = document.getElementById("other-username").value;

            try {
                const response = await fetch(\`http://localhost:4001/auth/delete/user\`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ username })
                });

                if (response.ok) {
                    alert("User deleted successfully");
                } else {
                    const data = await response.json();
                    alert(\`Error: \${data.message}\`);
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("An error occurred while deleting the user");
            }
        });
    </script>
</body>
</html>
`;

// Serve the frontend HTML for simplicity
app.get('/', (req, res) => {
    res.send(frontendHTML);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
