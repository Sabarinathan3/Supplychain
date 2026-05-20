const prisma = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');
const cacheService = require('../services/cacheService');
const qrService = require('../services/qrService');
const { getPaginationOffset } = require('../utils/helpers');
const { PAGINATION } = require('../utils/constants');

const productController = {
  // Get all products
  getAll: asyncHandler(async (req, res) => {
    const { 
      page = PAGINATION.DEFAULT_PAGE, 
      limit = PAGINATION.DEFAULT_LIMIT,
      category,
      search 
    } = req.query;
    
    const offset = getPaginationOffset(page, limit);

    const where = {};
    
    if (category) {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        include: {
          _count: {
            select: { inventory: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    ApiResponse.paginated(res, products, page, limit, total);
  }),

  // Get product by ID
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = cacheService.keys.product(id);
    
    let product = await cacheService.get(cacheKey);

    if (!product) {
      product = await prisma.product.findUnique({
        where: { id },
        include: {
          inventory: {
            include: {
              warehouse: true,
            },
          },
        },
      });

      if (!product) {
        return ApiResponse.error(res, 'Product not found', 404);
      }

      await cacheService.set(cacheKey, product);
    }

    ApiResponse.success(res, product);
  }),

  // Create product
  create: asyncHandler(async (req, res) => {
    const { sku, name, description, category, unitPrice, reorderLevel } = req.body;

    // Generate QR code
    const qrCode = qrService.generateUniqueCode('PRD');

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        category,
        unitPrice,
        reorderLevel: reorderLevel || 10,
        qrCode,
      },
    });

    // Generate QR code image
    const qrCodeImage = await qrService.generateProductQR(product);

    ApiResponse.success(
      res,
      { ...product, qrCodeImage },
      'Product created successfully',
      201
    );
  }),

  // Update product
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { sku, name, description, category, unitPrice, reorderLevel } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(sku && { sku }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(unitPrice && { unitPrice }),
        ...(reorderLevel !== undefined && { reorderLevel }),
      },
    });

    await cacheService.del(cacheService.keys.product(id));

    ApiResponse.success(res, product, 'Product updated successfully');
  }),

  // Delete product
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if product has inventory
    const inventoryCount = await prisma.inventory.count({
      where: { productId: id },
    });

    if (inventoryCount > 0) {
      return ApiResponse.error(
        res,
        'Cannot delete product with existing inventory',
        400
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    await cacheService.del(cacheService.keys.product(id));

    ApiResponse.success(res, null, 'Product deleted successfully');
  }),

  // Get product by SKU or QR code
  getBySKU: asyncHandler(async (req, res) => {
    const { code } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: code },
          { qrCode: code },
          { barcode: code },
        ],
      },
      include: {
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    ApiResponse.success(res, product);
  }),

  // Generate QR code for product
  generateQR: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    const qrCodeImage = await qrService.generateProductQR(product);

    ApiResponse.success(res, { qrCode: qrCodeImage });
  }),

  // Get product categories
  getCategories: asyncHandler(async (req, res) => {
    const categories = await prisma.product.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
    });

    const categoryList = categories.map(c => c.category);

    ApiResponse.success(res, categoryList);
  }),
};

module.exports = productController;
