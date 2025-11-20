const { AppDataSource } = require('../config/database');
const { publishEvent } = require('../config/kafka');
const logger = require('../config/logger');

const productRepository = AppDataSource.getRepository('Product');

exports.createProduct = async (req, res, next) => {
  try {
    const product = productRepository.create(req.body);
    await productRepository.save(product);

    await publishEvent('product.created', { id: product.id, name: product.name });
    logger.info(`Produit créé: ${product.id}`);

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, category } = req.query;
    
    const where = category ? { category } : {};
    const [products, total] = await productRepository.findAndCount({
      where,
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({ data: products, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await productRepository.findOne({ where: { id: req.params.id } });
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await productRepository.update(id, req.body);
    const product = await productRepository.findOne({ where: { id } });

    await publishEvent('product.updated', { id, updates: req.body });
    logger.info(`Produit mis à jour: ${id}`);

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await productRepository.delete(id);
    await publishEvent('product.deleted', { id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const product = await productRepository.findOne({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    product.stock = quantity;
    await productRepository.save(product);

    await publishEvent('product.stock.updated', { id, stock: quantity });

    res.json(product);
  } catch (error) {
    next(error);
  }
};
