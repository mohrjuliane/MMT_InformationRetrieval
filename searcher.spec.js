import glob from "glob";
import Searcher from "./searcher";

describe("Searcher", () => {
    let searcher;

    beforeAll(() => {
        searcher = new Searcher(glob.sync("corpus/*.txt"), true);
    });

    function expectSearchResultsFor(query) {
        return expect(searcher.search(query));
    }

    function expectTop5SearchResultsFor(query) {
        return expect(searcher.search(query).slice(0, 5));
    }

    it("finds one word", () => {
        expectSearchResultsFor("salzburg").toHaveLength(28);
        expectTop5SearchResultsFor("salzburg").toEqual([
            {
                filename: "Archbishopric_of_Salzburg.txt",
                score: 39614.142857142855,
                terms: { salzburg: 39614.142857142855 }
            },
            {
                filename: "Herbert_von_Karajan.txt",
                score: 10803.857142857143,
                terms: { salzburg: 10803.857142857143 }
            },
            {
                filename: "Wolfgang_Amadeus_Mozart.txt",
                score: 10803.857142857143,
                terms: { salzburg: 10803.857142857143 }
            },
            {
                filename: "Alfons_Schuhbeck.txt",
                score: 3601.285714285714,
                terms: { salzburg: 3601.285714285714 }
            },
            {
                filename: "Carl_Maria_von_Weber.txt",
                score: 3601.285714285714,
                terms: { salzburg: 3601.285714285714 }
            }
        ]);
    });

    it("finds two words", () => {
        expectSearchResultsFor("austria germany").toHaveLength(1707);
        expectTop5SearchResultsFor("austria germany").toEqual([
            {
                filename: "Anschluss.txt",
                score: 3903.9037273452636,
                terms: {
                    austria: 3741.2650176678444,
                    germany: 162.63870967741937
                }
            },
            {
                filename: "Austria.txt",
                score: 3806.320501538812,
                terms: {
                    austria: 3741.2650176678444,
                    germany: 65.05548387096775
                }
            },
            {
                filename: "Germany.txt",
                score: 2696.814166191725,
                terms: {
                    austria: 712.6219081272085,
                    germany: 1984.1922580645164
                }
            },
            {
                filename: "Treaty_of_Versailles.txt",
                score: 2659.8038025760857,
                terms: {
                    austria: 1781.5547703180212,
                    germany: 878.2490322580646
                }
            },
            {
                filename: "Prussia.txt",
                score: 1865.1154359968086,
                terms: {
                    austria: 1247.0883392226149,
                    germany: 618.0270967741936
                }
            }
        ]);
    });

    it("sorts results with same score alphabetically descending", () => {
        expectTop5SearchResultsFor("blueprint").toEqual([
            {
                filename: "RNA.txt",
                score: 25209,
                terms: {
                    blueprint: 25209
                }
            },
            {
                filename: "_03_Bonnie_Clyde.txt",
                score: 25209,
                terms: {
                    blueprint: 25209
                }
            }
        ]);
    });

    it("ignores order of search terms", () => {
        const expectedFilenames1 = searcher.search("austria germany").map(result => result.filename);
        const expectedFilenames2 = searcher.search("germany austria").map(result => result.filename);
        expect(expectedFilenames1).toEqual(expectedFilenames2);
    });

    test("returns empty result when single word is not found", () => {
        expectSearchResultsFor("blubbergurken").toEqual([]);
    });

    test("ignores unknown words", () => {
        const expectedResults = searcher.search("salzburg");
        expectSearchResultsFor("salzburg blubbergurken").toEqual(expectedResults);
        expectSearchResultsFor("blubbergurken salzburg").toEqual(expectedResults);
    });

    test("returns empty result for empty search", () => {
        expectSearchResultsFor("").toEqual([]);
    });
});
