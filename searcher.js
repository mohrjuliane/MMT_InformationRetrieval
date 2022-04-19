export default class Searcher {
                   constructor(files) {
                       var fs = require("fs");
                       this.num_docs = files.length;
                       this.stopwords = fs.readFileSync("stop-words.txt", "utf-8").split("\n");
                       this.dictionary = this.createDictionary(files);
                   }

                   search(query) {
                       let wordsList = this.preprocessingSearchTerm(query);
                       let relevantSets = this.searchRelevantSets(wordsList);

                       // if (relevantSets.length != wordsList.length) {
                       //     return [];
                       // }

                       // return this.compareSets(relevantSets);
                       let sortedSets = relevantSets.sort(function(a,b) {
                           if(a.score > b.score) return 1
                           if(a.score <= b.score) return -1
                           
                       });
                       return sortedSets;
                   }

                   searchRelevantSets(wordsList) {
                       let relevantSets = []
                       wordsList.forEach(word => {
                           if (this.dictionary.has(word)) {
                               let entry = this.dictionary.get(word);
                               entry.sets.forEach(set => {
                                   let foundSet = this.findSetOfFile(set.filename, relevantSets);
                                   let score = entry.idf * set.frequency;
                                   if (foundSet != undefined) {
                                       //set exists already in relevantSets
                                       foundSet.score += score;
                                       foundSet.terms[word] = score; // set new score of word
                                   } else {
                                       let obj = {};
                                       obj[word] = score;
                                       relevantSets.push({
                                           filename: set.filename,
                                           score: score,
                                           terms: obj
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
                       let found = undefined
                        sets.forEach((set) => {
                            if(set.filename === filename) {
                                found = set
                                return set;
                            }
                        })
                        return found
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
                                   let values = vocabulary.get(word).sets; //sets of object
                                   let foundEntry;

                                   values.forEach(currentSet => {
                                       if (currentSet.filename === file) {
                                           foundEntry = currentSet;
                                       }
                                   });

                                   if (foundEntry != undefined) {
                                       foundEntry.frequency++;
                                   } else {
                                       //word exists but its the first time it appears in this file
                                       // vocabulary.set(
                                       //     word,
                                       //     values.add({
                                       //         filename: file,
                                       //         frequency: 1
                                       //     })
                                       // );
                                       values.add({
                                           filename: file,
                                           frequency: 1
                                       });
                                   }
                               } else {
                                   //word has not yet appeared in any file
                                   let set = new Set([
                                       {
                                           filename: file,
                                           frequency: 1
                                       }
                                   ]);
                                   vocabulary.set(word, { idf: 0, sets: set });
                               }
                           });
                       }
                       vocabulary = this.setIDF(vocabulary);
                       return vocabulary;
                   }

                   setIDF(vocabulary) {
                       vocabulary.forEach(entry => {
                           let document_frequency = entry.sets.size;
                           entry.idf = this.num_docs / document_frequency;
                       });
                       return vocabulary
                    //    vocabulary.forEach((element, key) => {
                    //        console.log(key + " => " + element.idf);
                    //        element.sets.forEach(set => {
                    //            console.log(set);
                    //        });
                    //        console.log("--------------");
                    //    });
                       //idf: num_total_documents/document_frequency
                       //{idf: number, sets: Set{frequency: number, filename: string}, Set{frequency: number, filename: string}, .... 
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
