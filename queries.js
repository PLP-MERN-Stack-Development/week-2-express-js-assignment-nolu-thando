const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = (products) => {
  const router = express.Router();

  // GET /api/products - filter & pagination
  router.get('/', (req, res) => {
    const { category, page = 1, limit = 10 } = req.query;
    let filtered = products;

    if (category) {
      filtered = products.filter(product => product.category.toLowerCase() === category.toLowerCase());
    }

    const start = (parseInt(page) - 1) * parseInt(limit);
    const end = start + parseInt(limit);
    const paginated = filtered.slice(start, end);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total: filtered.length,
      data: paginated
    });
  });

  // GET /api/products/search?name=...
  router.get('/search', (req, res) => {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a search term using ?name=' });
    }

    const results = products.filter(p =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );

    res.json(results);
  });

  // POST /api/products
  router.post('/', (req, res) => {
    const { name, description, price, category, inStock } = req.body;
    if (!name || !description || price == undefined || !category || inStock == undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newProduct = {
      id: uuidv4(),
      name,
      description,
      price,
      category,
      inStock: !!inStock
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
  });

  // PUT /api/products/:id
  router.put('/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, category, inStock } = req.body;
    products[index] = {
      ...products[index],
      name: name ?? products[index].name,
      description: description ?? products[index].description,
      price: price ?? products[index].price,
      category: category ?? products[index].category,
      inStock: inStock ?? products[index].inStock
    };

    res.json(products[index]);
  });

  // DELETE /api/products/:id
  router.delete('/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const deleted = products.splice(index, 1);
    res.json({ message: 'Product deleted', product: deleted[0] });
  });

  return router;
};
// This module exports a function that takes the products array and returns an Express router