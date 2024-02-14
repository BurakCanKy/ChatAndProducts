const express = require('express');
const socket = require('socket.io');
const { Client } = require('pg');
const http = require("http");
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

const server = http.createServer(app);
const io = socket(server);

io.on('connection', (socket) => {
    console.log(socket.id);

    socket.on('chat', data => {
        io.sockets.emit('chat', data);
    });

    socket.on('typing', data => {
        socket.broadcast.emit('typing', data);
    });
});

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'nodejsuyg',
    password: '123456',
    port: 5432,
});

client.connect()
    .then(() => console.log('PostgreSQL veritabanına başarıyla bağlandı.'))
    .catch(err => console.error('Veritabanına bağlanırken bir hata oluştu:', err));

app.use(express.json());

app.get('/api/products', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error('Ürünleri getirirken bir hata oluştu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        console.error('Kategorileri getirirken bir hata oluştu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { id, name, catId } = req.body;
        const query = 'INSERT INTO products (id, name, "catId") VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(query, [id, name, catId]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Ürün eklenirken bir hata oluştu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { id, name } = req.body;
        const query = 'INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING *';
        const result = await client.query(query, [id, name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Kategori eklenirken bir hata oluştu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, catId } = req.body;
    try {
        const existingProduct = await client.query('SELECT * FROM products WHERE id = $1', [productId]);
        const newName = name ? name : existingProduct.rows[0].name;
        const newCatId = catId !== null && catId !== undefined && catId !== "" ? catId : existingProduct.rows[0].catId;
        const query = 'UPDATE products SET name = $1, "catId" = $3 WHERE id = $2 RETURNING *';
        const result = await client.query(query, [newName, productId, newCatId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Ürün güncellenirken bir hata oluştu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/categories/:id', async (req, res) => {
    const categoryId = req.params.id;
    const { name } = req.body;
    try {
        const result = await client.query('UPDATE Categories SET name = $1 WHERE id = $2 RETURNING *', [name, categoryId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Kategori bulunamadı' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Kategori güncellenirken bir hata oluştu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const result = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [productId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }
        res.json({ message: 'Ürün başarıyla silindi' });
    } catch (err) {
        console.error('Ürün silinirken bir hata oluştu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const result = await client.query('DELETE FROM categories WHERE id = $1 RETURNING *', [categoryId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Kategori bulunamadı' });
        }
        res.json({ message: 'Kategori başarıyla silindi' });
    } catch (err) {
        console.error('Kategori silinirken bir hata oluştu:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

server.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});

