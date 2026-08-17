const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Personal Expense Tracker Server Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});