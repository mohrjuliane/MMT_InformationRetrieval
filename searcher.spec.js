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
                score: 39613.357142857145,
                terms: { salzburg: 39613.357142857145 }
            },
            {
                filename: "Herbert_von_Karajan.txt",
                score: 10803.642857142857,
                terms: { salzburg: 10803.642857142857 }
            },
            {
                filename: "Wolfgang_Amadeus_Mozart.txt",
                score: 10803.642857142857,
                terms: { salzburg: 10803.642857142857 }
            },
            {
                filename: "Alfons_Schuhbeck.txt",
                score: 3601.214285714286,
                terms: { salzburg: 3601.214285714286 }
            },
            {
                filename: "Carl_Maria_von_Weber.txt",
                score: 3601.214285714286,
                terms: { salzburg: 3601.214285714286 }
            }
        ]);
    });

    it("finds two words", () => {
        expectSearchResultsFor("austria germany").toHaveLength(1707);
        expectTop5SearchResultsFor("austria germany").toEqual([
            {
                filename: "Anschluss.txt",
                score: 3903.8262965918157,
                terms: {
                    austria: 3741.190812720848,
                    germany: 162.63548387096773
                }
            },
            {
                filename: "Austria.txt",
                score: 3806.245006269235,
                terms: {
                    austria: 3741.190812720848,
                    germany: 65.05419354838709
                }
            },
            {
                filename: "Germany.txt",
                score: 2696.7606770773964,
                terms: {
                    austria: 712.6077738515901,
                    germany: 1984.1529032258063
                }
            },
            {
                filename: "Treaty_of_Versailles.txt",
                score: 2659.751047532201,
                terms: {
                    austria: 1781.5194346289752,
                    germany: 878.2316129032257
                }
            },
            {
                filename: "Prussia.txt",
                score: 1865.07844294996,
                terms: {
                    austria: 1247.0636042402825,
                    germany: 618.0148387096774
                }
            }
        ]);
    });

    it("sorts results with same score alphabetically descending", () => {
        expectTop5SearchResultsFor("blueprint").toEqual([
            {
                filename: "RNA.txt",
                score: 25208.5,
                terms: {
                    blueprint: 25208.5
                }
            },
            {
                filename: "_03_Bonnie_Clyde.txt",
                score: 25208.5,
                terms: {
                    blueprint: 25208.5
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
