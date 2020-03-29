import Searcher from "./searcher";
import glob from "glob";

const readline = require("readline");

const searcher = new Searcher(glob.sync("corpus/*.txt"), true);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "Enter query, empty to quit: "
});

rl.prompt();
rl.on("line", line => {
    if (line==="") {
        process.exit(0);
    }

    const results = searcher.search(line.trim());
    console.log(`Found ${results.length} results, showing top 5\n`);

    for (const result of results.slice(0, 5)) {
        console.log(`${result.filename}: ${result.score}`);

        for (const [term, score] of Object.entries(result.terms)) {
            console.log(`\t${term}: ${score}`);
        }

        console.log("");
    }

    rl.prompt();
});
