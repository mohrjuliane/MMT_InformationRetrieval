export default class Searcher {
    constructor(files) {
        var fs = require("fs");
        this.stopwords = fs.readFileSync("stop-words.txt", "utf-8").split("\n");
        this.dictionary = this.createDictionary(files);
    }

    search(query) {
        // let wordsList = this.preprocessingSearchTerm(query);
        // let relevantSets = this.searchRelevantSets(wordsList);

        // if (relevantSets.length != wordsList.length) {
        //     return [];
        // }
        
        // return this.compareSets(relevantSets);
        return this.dictionary
    }

    compareSets(sets) {
        while (sets.length > 1) {
            let nextToLastSet = sets[0];
            let lastSet = sets[1];
            let intersection = this.intersection(nextToLastSet, lastSet);

            if (sets.length > 2) {
                sets.shift(); //shift: delete first element of array
                sets.shift();
                sets.unshift(intersection); //unshift: add intersection at the beginning of array
            } else {
                sets = [intersection];
            }
        }

        return Array.from(sets[0]);
    }

    searchRelevantSets(wordsList) {
        let relevantSets = [];
        wordsList.forEach(word => {
            if (this.dictionary.has(word)) {
                relevantSets.push(this.dictionary.get(word));
            } else {
                return [];
            }
        });
        return relevantSets;
    }

    createDictionary(files) {
        var fs = require("fs");
        let vocabulary = new Map();

        for (const file of files) {
            var text = fs.readFileSync(file, "utf-8");
            let newText = this.preprocessingDictionary(text);

            //insert into dictionary
            newText.forEach(function(word) {
                if (vocabulary.has(word)) {
                    let values = vocabulary.get(word);
                    let foundEntry;

                    for(const entry of values) {
                        if(entry.fileName === file) {
                            foundEntry = entry
                            break
                        }
                    }

                    if(foundEntry != undefined) {
                        foundEntry.frequency++
                    } else { //word exists but its the first time it appears in this file
                        vocabulary.set(
                            word,
                            values.add({
                                fileName: file,
                                frequency: 1
                            })
                        );
                    }
                } else { //word has not yet appeared in any file
                    let set = new Set([{
                        fileName: file,
                        frequency: 1}]);
                    vocabulary.set(word, set);
                }
            });
        }
        return vocabulary;
    }

    intersection(set1, set2) {
        let intersectionArray = new Set();
        for (let element of set2) {
            if (set1.has(element)) {
                intersectionArray.add(element);
            }
        }
        return intersectionArray;
    }

    preprocessingDictionary(words) {
        let result = words
            .replace(/[.,\/#!$%\^&\*;:{}=_`~()\n]/g, "")
            .toLowerCase()
            .split(" ")
            .filter(element => !this.stopwords.includes(element));
        return this.addHyphenWord(result);
    }

    preprocessingSearchTerm(words) {
        let result = words
            .toLowerCase()
            .split(" ")
            .filter(element => !this.stopwords.includes(element));
        return result;
    }

    addHyphenWord(wordsList) {
        wordsList.forEach(element => {
            if (element.includes("-")) {
                let hyphen = element.indexOf("-");
                wordsList.push(element.substr(0, hyphen));
                wordsList.push(element.substr(hyphen + 1, element.length - 1));
            }
        });
        return wordsList;
    }
}
