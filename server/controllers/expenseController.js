const expenses = [
    {
        id: 1,
        title: "Petrol",
        amount: 2000,
        category: "Transport"
    },
    {
        id: 2,
        title: "Food",
        amount: 500,
        category: "Dining"
    },
    {
        id: 3,
        title: "Movie",
        amount: 300,
        category: "Entertainment"
    }
];

const getExpenses = (req, res) => {
    res.status(200).json(expenses);
};

const createExpense = (req, res) => {
    res.status(201).json({
        message: "Expense Created",
        data: req.body
    });
};

const updateExpense = (req, res) => {
    res.status(200).json({
        message: `Expense ${req.params.id} Updated`
    });
};

const deleteExpense = (req, res) => {
    res.status(200).json({
        message: `Expense ${req.params.id} Deleted`
    });
};

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense
};