import {select} from "./db-utils";
import {nanoid} from "nanoid";

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
interface Vertex {
    id: string;
    label: string;
}

interface Book {
    name: string;
}

interface Chapter {
    number: number;
}

interface Verse {
    number: number;
    text: string;
}

type BookVertex = Book & Vertex
type ChapterVertex = Chapter & Vertex
type VerseVertex = Verse & Vertex

const titleWithId = (title: string) => "~id, " + title + "\n"
const rowWithId = <I, O>(transform: (i: I) => O, label: string, item: I): O => ({id: nanoid(), label: label, ...transform(item)});

/*
Generate book vertices
```
~id, name:String, ~label
b1, "1 Corinthians", book
```
*/
const bookVertexTitle = () => titleWithId("name:String, ~label")
const bookVertex = (item: SqliteVerse) => rowWithId<SqliteVerse, Book>((item: SqliteVerse) => ({name: item.book}), 'book', item); 


/*
Generate chapter vertices
```
~id, number:Int, ~label
c1, 13, chapter
```
*/
const chapterVertexTitle = () => titleWithId("number:Int, ~label")
const chapterVertex = (item: SqliteVerse) => rowWithId<SqliteVerse, Chapter>((item: SqliteVerse) => ({number: parseInt(item.chapter)}), 'chapter', item); 


/*
Generate verse vertices
```
~id, number:Int, text:String, ~label 
v1, 13, "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", verse
```
*/
const verseVertexTitle = () => titleWithId("number:Int, text:String, ~label")
const verseVertex = (item: SqliteVerse) => rowWithId<SqliteVerse, Verse>((item: SqliteVerse) => ({number: item.number, text: item.text}), 'verse', item); 

const gen = async () => {
    const verses = await select<SqliteVerse>(GET_ALL_VERSES);
        
    let books: BookVertex[] = [];
    const booksMap = new Set<string>();

    let chapters: ChapterVertex[] = [];
    const chaptersMap = new Set<string>();

    let vs: VerseVertex[] = [];
    const versesMap = new Set<string>();

    verses.forEach(verse => {
        if (!booksMap.has(verse.book)) {
            booksMap.add(verse.book)
            books.push(bookVertex(verse) as BookVertex);
        }
        if (!chaptersMap.has(`${verse.book}_${verse.chapter}`)) {
            chaptersMap.add(`${verse.book}_${verse.chapter}`)
            chapters.push(chapterVertex(verse) as ChapterVertex);

            // TODO create chapter_of_book edge
        }
        if (!versesMap.has(`${verse.book}_${verse.chapter}_${verse.number}`)) {
            versesMap.add(`${verse.book}_${verse.chapter}_${verse.number}`)
            vs.push(verseVertex(verse) as VerseVertex);

            // TODO create verse_of_book edge
            // TODO create verse_of_chapter edge
        }
    })

    // console.log(bookVertexTitle() + books.map(b => `${b.id}, "${b.name}", ${b.label}\n`).join(""));
    // console.log(chapterVertexTitle() + chapters.map(b => `${b.id}, ${b.number}, ${b.label}\n`).join(""));
    console.log(verseVertexTitle() + vs.map(b => `${b.id}, ${b.number}, "${b.text}", ${b.label}\n`).join(""));
}   

gen();


// gen<Book>(`name:String, ~label`, GET_BOOKS, (book: Book) => `"${book.book}", book`);