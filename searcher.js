export default class Searcher {
    constructor(files) {
        var fs = require("fs");
        this.num_docs = files.length;
        this.stopwords = fs.readFileSync("stop-words.txt", "utf-8").split("\n");
        this.wordCounts = [];
        this.dictionary = this.createDictionary(files);
        this.averageWords = this.getAverageWords()
    }

    getAverageWords() { //get average doc length in the text collection = avgdl
        let sum = 0
        this.wordCounts.forEach((file) => {
            sum += file.count
        })
        return sum / this.wordCounts.length
    }

    search(query) {
        let wordsList = this.preprocessingSearchTerm(query);
        let relevantSets = this.searchRelevantSets(wordsList);

        if (relevantSets == []) {
            return [];
        }
        let sortedSets = relevantSets.sort(function(a, b) {
            if (a.score > b.score) return -1;
            if (a.score == b.score) {
                if (a.filename > b.filename) {
                    return 1;
                } else {
                    return -1;
                }
            }
            if (a.score < b.score) return 1;
        });
        
        //----------------sort bei normalized Okapi BM25------------------- 
        // let sortedSetsNormalized = relevantSets.sort(function(a,b) {
        //     if (a.scoreNormalized > b.scoreNormalized) return -1;
        //     if (a.scoreNormalized == b.scoreNormalized) {
        //         if (a.filename > b.filename) {
        //             return 1;
        //         } else {
        //             return -1;
        //         }
        //     }
        //     if (a.scoreNormalized < b.scoreNormalized) return 1;
        // })

        return sortedSets;
    }

    searchRelevantSets(wordsList) {
        let relevantSets = [];
        wordsList.forEach(word => {
            if (this.dictionary.has(word)) {
                let entry = this.dictionary.get(word);
                entry.sets.forEach(set => {
                    let foundSet = this.findSetOfFile(set.filename, relevantSets);
                    let score = entry.idf * set.frequency;
                    let scoreNormalized = this.normalizedIdf(set)
                    if (foundSet != undefined) {
                        //set exists already in relevantSets
                        foundSet.score += score;
                        foundSet.scoreNormalized += scoreNormalized;
                        foundSet.terms[word] = score; // set new score of word
                        foundSet.termsNormalized[word] = scoreNormalized;
                    } else {
                        let obj = {};
                        let objNormalized = {};
                        obj[word] = score;
                        objNormalized[word] = scoreNormalized;
                        relevantSets.push({
                            filename: set.filename,
                            score: score,
                            scoreNormalized: scoreNormalized,
                            terms: obj,
                            termsNormalized: objNormalized
                        });
                    }
                });
            } else {
                return [];
            }
        });
        return relevantSets;
    }

    findSetOfFile(filename, sets) {
        let found = undefined;
        sets.forEach(set => {
            if (set.filename === filename) {
                found = set;
                return set;
            }
        });
        return found;
    }

    createDictionary(files) {
        var fs = require("fs");
        let vocabulary = new Map();

        for (const file of files) {
            var text = fs.readFileSync(file, "utf-8");
            let newFilename = file.substring(file.indexOf("/") + 1, file.length);
            let newText = this.preprocessingDictionary(text); //replace punctuation marks and split text
            this.wordCounts.push({ //save length of document in words for normalizedIdf
                filename: newFilename,
                count: newText.length
            });

            //insert into dictionary
            newText.forEach(function(word) {
                
                if (vocabulary.has(word)) {
                    let values = vocabulary.get(word).sets; //sets of object
                    let foundEntry;

                    values.forEach(currentSet => {
                        if (currentSet.filename === newFilename) {
                            foundEntry = currentSet;
                        }
                    });

                    if (foundEntry != undefined) {
                        foundEntry.frequency++;
                    } else {
                        //word exists but its the first time it appears in this file
                        values.add({
                            filename: newFilename,
                            frequency: 1
                        });
                    }
                } else {
                    //word has not yet appeared in any file
                    let set = new Set([
                        {
                            filename: newFilename,
                            frequency: 1
                        }
                    ]);
                    vocabulary.set(word, { idf: 0, sets: set });
                }
            });
        }
        vocabulary = this.setIDF(vocabulary);
        if (vocabulary.has("")) {
            //delete empty as word
            vocabulary.delete("");
        }
        return vocabulary;
    }

    formatFilename(filename) {
        let index = filename.indexOf("/");
        return filename.substring(index, filename.length);
    }

    setIDF(vocabulary) {
        vocabulary.forEach(entry => {
            let document_frequency = entry.sets.size;
            entry.idf = this.num_docs / document_frequency;
        });
        return vocabulary;
        //{idf: number, sets: Set{frequency: number, filename: string}, Set{frequency: number, filename: string}, ....
    }

    preprocessingDictionary(words) {
        let result = words
            .replace(/[.,\/#!$%\^&\*;:{}=_`~"?()]/g, "")
            .replace(/'/g, " ")
            .replace(/(?:\r\n|\r|\n)/g, " ") /*all line breaks*/
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

    normalizedIdf(currentDocument) {
        //free parameters
        let k1 = 2;
        let b = 0.75;
        let counter = currentDocument.frequency * (k1 + 1);
        let denominator =
            currentDocument.frequency +
            2 * (1 - b + b * (this.findCountofDoc(currentDocument.filename) / this.averageWords));
        return counter / denominator;
    }

    findCountofDoc(filename) {
        let result;
        this.wordCounts.forEach((file) => {
            if(file.filename === filename) {
                result = file.count;
                return result;
            }
        })
        return result;
    }
}
