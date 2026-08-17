const express = require("express");

const app = express();

app.use(express.json());

const expenseRoutes = require("./routes/expenseRoutes");

app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
    res.send("Personal Expense Tracker API Running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});