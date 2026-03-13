// Problem 1: The Strict Type Checker
function checkVariable(input) {
    switch (typeof input) {
        case "string":
            return "string";
        case "number":
            return "number";
        case "boolean":
            return "boolean";
        case "bigint":
            return "bigint";
        case "undefined":
            return "undefined";
        case "object":
            return "object";
        default:
            return "unknown";
    }
}
// Problem 2: Secure ID Generator
function generateIDs(count) {
    const ids = [];

    for (let i = 0; i < count; i++) {
        if (i === 5) {
            continue; // skip 5
        }

        ids.push(`ID-${i}`);
    }

    return ids;
}

// Problem 3: The Functional Sum
function calculateTotal(...numbers) {

    numbers.forEach(num => {
        if (typeof num !== "number") {
            throw new TypeError("Invalid input: All arguments must be numbers");
        }
    });

    return numbers.reduce((total, num) => total + num, 0);
}

// Problem 4: Leaderboard Filter
function getTopScorers(playerList) {

    return playerList
        .filter(player => player.score > 8)
        .map(player => player.name)
        .join(", ");
}