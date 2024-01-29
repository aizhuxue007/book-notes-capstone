import express from 'express'
import axios from 'axios'
import pg from 'pg'
import bodyParser from 'body-parser'

const app = express()
const PORT = 3000

const pgClient = new pg.Client({
    user: 'postgres',
    password: 'jesus',
    host: 'localhost',
    database: 'books',
    port: 5433
})
pgClient.connect()


async function getBooksFromDB() {
   const res = await pgClient.query('select * from book_reviews')
   return res.rows
}

async function postBookToDB(book) {
    const query = `insert into book_reviews (title, rating, review, img_url) values ($1, $2, $3, $4)`
    try {
        await pgClient.query(query, [
            book.title, book.rating, book.review, book.img_url
        ])
        console.log('Inserted record successfully!')
    } catch (error) {
        console.error('Error inserting record:', error);
    } finally {
    }
}

async function editBookFromDB(book) {
    const query = `UPDATE book_reviews
    SET title = $2,
        rating = $3,
        review = $4
    WHERE id = $1`
    try {
        await pgClient.query(query, [book.id, book.title, book.rating, book.review])
        console.log('successfully updated!')
    } catch (error) {
        console.error('Error updating record:', error);
    } finally {
    }
}

async function deleteBookFromDB(id) {
    const query = `delete from book_reviews where id = $1`
    try {
        await pgClient.query(query, [id])
        console.log('successfully deleted!')
    } catch (error) {
        console.error('Error deleting record:', error);
    } finally {
    }
}

async function getBookCover(title) {
    const url = `https://openlibrary.org/search.json?title=`
    const res = await axios.get(url + title +'&limit=1')
    return res.data.docs[0].isbn[1] 
}

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
    const books = await getBooksFromDB()
    const data = {
        books: books
    };
    res.render('index', data)
})

app.get('/add', (req, res) => {
    res.render('new')
})

app.get('/edit/:id', async (req, res) => {
    console.log('in here')
    const data = {
        id: req.params.id
    }
    res.render('edit', data)
})

app.post('/add', async (req, res) => {
    const book = {
        title: req.body.title.trim(),
        rating: req.body.rating,
        review: req.body.review
    }
    const book_isbn = await getBookCover(book.title)
    book.img_url = `https://covers.openlibrary.org/b/isbn/${book_isbn}-M.jpg`
    await postBookToDB(book)
    res.redirect('/')
})

app.post('/edit/:id', async (req, res) => {
    const { id, title, rating, review } = req.body
    const updatedBook = {
        id: Number(id),
        title: title,
        rating: Number(rating),
        review: review
    }
    await editBookFromDB(updatedBook)
    res.redirect('/')
})

app.post('/delete', async (req, res) => {
    const bookId = req.body.bookId
    await deleteBookFromDB(bookId)
    res.redirect('/')
})

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}`)
})