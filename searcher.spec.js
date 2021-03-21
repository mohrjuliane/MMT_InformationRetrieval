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
                score: 39629.857142857145,
                terms: { salzburg: 39629.857142857145 }
            },
            {
                filename: "Herbert_von_Karajan.txt",
                score: 10808.142857142857,
                terms: { salzburg: 10808.142857142857 }
            },
            {
                filename: "Wolfgang_Amadeus_Mozart.txt",
                score: 10808.142857142857,
                terms: { salzburg: 10808.142857142857 }
            },
            {
                filename: "Alfons_Schuhbeck.txt",
                score: 3602.714285714286,
                terms: { salzburg: 3602.714285714286 }
            },
            {
                filename: "Carl_Maria_von_Weber.txt",
                score: 3602.714285714286,
                terms: { salzburg: 3602.714285714286 }
            }
        ]);
    });

    it("finds two words", () => {
        expectSearchResultsFor("austria germany").toHaveLength(1713);
        expectTop5SearchResultsFor("austria germany").toEqual([
            {
                filename: "Anschluss.txt",
                score: 3891.5421630618653,
                terms: {
                    austria: 3729.5704225352115,
                    germany: 161.97174052665383
                }
            },
            {
                filename: "Austria.txt",
                score: 3794.359118745873,
                terms: {
                    austria: 3729.5704225352115,
                    germany: 64.78869621066153
                }
            },
            {
                filename: "Germany.txt",
                score: 2686.44960062236,
                terms: {
                    austria: 710.3943661971831,
                    germany: 1976.0552344251766
                }
            },
            {
                filename: "Treaty_of_Versailles.txt",
                score: 2650.6333143368884,
                terms: {
                    austria: 1775.9859154929577,
                    germany: 874.6473988439307
                }
            },
            {
                filename: "Prussia.txt",
                score: 1858.6827548463548,
                terms: {
                    austria: 1243.1901408450703,
                    germany: 615.4926140012846
                }
            }
        ]);
    });

    it("sorts results with same score alphabetically descending", () => {
        expectTop5SearchResultsFor("blueprint").toEqual([
            {
                filename: "RNA.txt",
                score: 25219,
                terms: {
                    blueprint: 25219
                }
            },
            {
                filename: "_03_Bonnie_Clyde.txt",
                score: 25219,
                terms: {
                    blueprint: 25219
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

    test("returns all documents for empty search", () => {
        expectSearchResultsFor("").toHaveLength(50418);
    });
});
