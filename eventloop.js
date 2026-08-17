console.log("1. Start");

setTimeout(() => {
    console.log("4. Timeout Callback");
}, 0);

Promise.resolve().then(() => {
    console.log("3. Promise Callback");
});

console.log("2. End");