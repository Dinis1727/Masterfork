const db = require('../db');

const validateOrder = (order) => {
  const errors = [];

  if (!order || typeof order !== 'object') {
    errors.push('Order payload must be an object.');
    return errors;
  }

  if (!order.customerId) {
    errors.push('customerId is required.');
  }

  if (!order.customerName) {
    errors.push('customerName is required.');
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push('items must be a non-empty array.');
  } else {
    order.items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`items[${index}] must be an object.`);
        return;
      }

      if (!item.productId) {
        errors.push(`items[${index}].productId is required.`);
      }

      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        errors.push(`items[${index}].quantity must be a positive number.`);
      }
    });
  }

  if (typeof order.totalAmount !== 'number' || Number.isNaN(order.totalAmount)) {
    errors.push('totalAmount must be a valid number.');
  }

  return errors;
};

const createOrder = async ({ customerId, customerName, items, totalAmount, notes = null }) => {
  const insertQuery = `
    INSERT INTO orders (customer_id, customer_name, items, total_amount, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, customer_id, customer_name, items, total_amount, notes, created_at
  `;

  const values = [
    customerId,
    customerName,
    JSON.stringify(items),
    totalAmount,
    notes,
  ];

  const { rows } = await db.query(insertQuery, values);
  return rows[0];
};

module.exports = {
  validateOrder,
  createOrder,
};

