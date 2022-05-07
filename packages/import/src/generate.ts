import {select} from "./db-utils";
import {nanoid} from "nanoid";
import fs from "fs";

// Query to get all verses
const GET_ALL_VERSES =
  "SELECT c2verse as number, c3content as text, c0book as book, c1chapter as chapter FROM bible_fts_content;"

// Object representation of verse
type SqliteVerse = {
    book: string;
    chapter: string;
    number: number;
    text: string;
}

// Graph data model
type Vertex = {
    id: string;
    label: string;
}

type Book = {
    name: string;
}

type Chapter = {
    number: number;
}

type Verse = {
    number: number;
    text: string;
}

type BookVertex = Book & Vertex
type ChapterVertex = Chapter & Vertex
type VerseVertex = Verse & Vertex

type Edge = {
    id: string;
    from: string;
    to: string;
    label: string;
}

const createTitleWithId = (title: string) => "~id, " + title + "\n";
const createVertex = <I, O>(transform: (i: I) => O, label: string, item: I): O => ({id: nanoid(), label: label, ...transform(item)});
const createEdge = (from: string, to: string, label: string) => ({
    id: nanoid(),
    from,
    to,
    label,
});

/*
Generate book vertices
```
~id, name:String, ~label
b1, "1 Corinthians", book
```
*/
const createBookVertexTitle = () => createTitleWithId("name:String, ~label")
const createBookVertex = (item: SqliteVerse) => createVertex<SqliteVerse, Book>((item: SqliteVerse) => ({name: item.book}), 'book', item); 


/*
Generate chapter vertices
```
~id, number:Int, ~label
c1, 13, chapter
```
*/
const createChapterVertexTitle = () => createTitleWithId("number:Int, ~label")
const createChapterVertex = (item: SqliteVerse) => createVertex<SqliteVerse, Chapter>((item: SqliteVerse) => ({number: parseInt(item.chapter)}), 'chapter', item); 


/*
Generate verse vertices
```
~id, number:Int, text:String, ~label 
v1, 13, "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", verse
```
*/
const createVerseVertexTitle = () => createTitleWithId("number:Int, text:String, ~label")
const createVerseVertex = (item: SqliteVerse) => createVertex<SqliteVerse, Verse>((item: SqliteVerse) => ({number: item.number, text: item.text}), 'verse', item); 

const createEdgeTitle = () => "~id, ~from, ~to, ~label";

function write(filePath: string, content: string) {
    fs.writeFile(filePath, content, err => {
        if (err) {
            console.error(err);
        }
    })
}

const gen = async () => {
    const verses = await select<SqliteVerse>(GET_ALL_VERSES);

    console.log(`Loaded ${verses.length} verses`);
        
    const booksMap = new Map<string, BookVertex>();
    const chaptersMap = new Map<string, ChapterVertex>();
    let vs: VerseVertex[] = [];
    let edges: Edge[] = [];

    verses.forEach(verse => {
        const bookKey = verse.book;
        const chapterKey = `${verse.book}_${verse.chapter}`;

        if (!booksMap.has(bookKey)) {
            booksMap.set(bookKey, createBookVertex(verse) as BookVertex);
        }
        if (!chaptersMap.has(chapterKey)) {
            chaptersMap.set(chapterKey, createChapterVertex(verse) as ChapterVertex);
            edges.push(createEdge(chaptersMap.get(chapterKey).id, booksMap.get(bookKey).id, "chapter_of_book"));
        }

        const vertex = createVerseVertex(verse) as VerseVertex;
        vs.push(vertex);

        edges.push(createEdge(vertex.id, booksMap.get(bookKey).id, "verse_of_book"));
        edges.push(createEdge(vertex.id, chaptersMap.get(chapterKey).id, "verse_of_chapter"));
    })

    console.log(`Found ${booksMap.size} books`);
    write("books.csv", createBookVertexTitle() + Array.from(booksMap.values()).map(b => `${b.id}, "${b.name}", ${b.label}`).join("\n"));
    console.log(`Found ${chaptersMap.size} chapters`);
    write("chapters.csv", createChapterVertexTitle() + Array.from(chaptersMap.values()).map(b => `${b.id}, ${b.number}, ${b.label}`).join("\n"));
    console.log(`Processed ${vs.length} verses`);
    write("verses.csv", createVerseVertexTitle() + vs.map(b => `${b.id}, ${b.number}, "${b.text}", ${b.label}`).join("\n"));
    console.log(`Found ${edges.length} edges`);
    write("edges.csv", createEdgeTitle() + edges.map(e => `${e.id}, ${e.from}, ${e.to}, ${e.label}`).join("\n"))
}   

gen();