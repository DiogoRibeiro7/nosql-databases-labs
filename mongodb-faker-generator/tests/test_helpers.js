// Extract the generator functions from your main file for testing
// This is a simplified version - you should import from your actual implementation

import { faker } from "@faker-js/faker";

faker.locale = "pt_PT";

/**
 * Lightweight copy of the real generator used to unit-test data shapes without I/O.
 *
 * @param {number} [n=100] - Number of mock users.
 * @returns {Array<object>}
 */
export function generateUsers (n = 100) {
  const users = [];

  for (let i = 0; i < n; i++) {
    const user = {
      _id: faker.datatype.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      profile: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        fullName: faker.person.fullName(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.paragraph({ min: 2, max: 4 }),
        birthDate: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
        gender: faker.helpers.arrayElement(["M", "F", "Other", null]),
        phone: faker.phone.number(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          country: "Portugal",
          postalCode: faker.location.zipCode(),
          coordinates: {
            type: "Point",
            coordinates: [
              parseFloat(faker.location.longitude()),
              parseFloat(faker.location.latitude()),
            ],
          },
        },
      },
      account: {
        type: faker.helpers.arrayElement(["free", "premium", "enterprise"]),
        status: faker.helpers.arrayElement(["active", "inactive", "suspended"]),
        createdAt: faker.date.between({ from: new Date("2021-01-01"), to: new Date() }),
        lastLogin: faker.date.recent({ days: 30 }),
        loginCount: faker.number.int({ min: 0, max: 1000 }),
        preferences: {
          newsletter: faker.datatype.boolean({ probability: 0.7 }),
          notifications: faker.datatype.boolean({ probability: 0.8 }),
          language: faker.helpers.arrayElement(["pt", "en", "es"]),
          theme: faker.helpers.arrayElement(["light", "dark", "auto"]),
        },
      },
      tags: faker.helpers.multiple(() => faker.word.noun(), { count: { min: 2, max: 6 } }),
      metadata: {
        source: faker.helpers.arrayElement(["web", "mobile", "api"]),
        ipAddress: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
      },
    };
    users.push(user);
  }

  return users;
}

/**
 * Test helper that mirrors the product generator logic.
 *
 * @param {number} [n=500] - Product count.
 * @returns {Array<object>}
 */
export function generateProducts (n = 500) {
  const products = [];
  const categories = ["Electronics", "Books", "Clothing", "Home & Garden", "Sports", "Toys"];

  for (let i = 0; i < n; i++) {
    const category = faker.helpers.arrayElement(categories);
    const product = {
      sku: faker.commerce.isbn(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      category: category,
      subcategory: faker.commerce.department(),
      brand: faker.company.name(),
      price: {
        amount: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
        currency: "EUR",
        discount: faker.datatype.boolean({ probability: 0.3 })
          ? parseFloat(faker.commerce.price({ min: 0, max: 30, dec: 2 }))
          : 0,
      },
      inventory: {
        inStock: faker.datatype.boolean({ probability: 0.85 }),
        quantity: faker.number.int({ min: 0, max: 1000 }),
        warehouse: faker.helpers.arrayElement(["Porto", "Lisboa", "Faro"]),
      },
      attributes: {
        color: ["Clothing", "Home & Garden"].includes(category) ? faker.color.human() : null,
        size: category === "Clothing" ? faker.helpers.arrayElement(["S", "M", "L", "XL"]) : null,
        weight: `${faker.number.float({ min: 0.1, max: 50, precision: 0.01 })} kg`,
        dimensions: {
          length: faker.number.int({ min: 10, max: 200 }),
          width: faker.number.int({ min: 10, max: 150 }),
          height: faker.number.int({ min: 5, max: 100 }),
          unit: "cm",
        },
      },
      ratings: {
        average: parseFloat(faker.number.float({ min: 1, max: 5, precision: 0.1 })),
        count: faker.number.int({ min: 0, max: 5000 }),
      },
      images: faker.helpers.multiple(() => faker.image.url(), {
        count: faker.number.int({ min: 1, max: 5 }),
      }),
      tags: faker.helpers.multiple(() => faker.word.noun(), { count: { min: 3, max: 8 } }),
      createdAt: faker.date.between({ from: new Date("2022-01-01"), to: new Date() }),
      updatedAt: faker.date.recent({ days: 30 }),
    };
    products.push(product);
  }

  return products;
}

/**
 * Produce transactions referencing provided test users/products.
 *
 * @param {Array<object>} users
 * @param {Array<object>} products
 * @param {number} [n=1000]
 * @returns {Array<object>}
 */
export function generateTransactions (users, products, n = 1000) {
  const transactions = [];

  for (let i = 0; i < n; i++) {
    const numItems = faker.number.int({ min: 1, max: 5 });
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 3 });
      const itemTotal = product.price.amount * quantity;

      items.push({
        productSku: product.sku,
        productName: product.name,
        quantity: quantity,
        unitPrice: product.price.amount,
        total: parseFloat(itemTotal.toFixed(2)),
      });
      subtotal += itemTotal;
    }

    const tax = subtotal * 0.23; // Portuguese VAT
    const shipping = parseFloat(faker.commerce.price({ min: 0, max: 20, dec: 2 }));

    const transaction = {
      orderId: faker.datatype.uuid(),
      userId: faker.helpers.arrayElement(users)._id,
      status: faker.helpers.arrayElement([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ]),
      items: items,
      payment: {
        method: faker.helpers.arrayElement([
          "credit_card",
          "debit_card",
          "paypal",
          "mbway",
          "bank_transfer",
        ]),
        status: faker.helpers.arrayElement(["pending", "completed", "failed"]),
        transactionId: faker.git.commitSha().substring(0, 16),
      },
      shipping: {
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: "Portugal",
        },
        method: faker.helpers.arrayElement(["standard", "express", "overnight"]),
        trackingNumber: faker.datatype.boolean({ probability: 0.7 })
          ? faker.string.alphanumeric(13).toUpperCase()
          : null,
        estimatedDelivery: faker.date.future({ years: 0.1 }),
      },
      totals: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shipping: parseFloat(shipping),
        total: parseFloat((subtotal + tax + parseFloat(shipping)).toFixed(2)),
      },
      timestamps: {
        created: faker.date.between({ from: new Date("2023-01-01"), to: new Date() }),
        updated: faker.date.recent({ days: 30 }),
      },
    };
    transactions.push(transaction);
  }

  return transactions;
}

/**
 * Emit simple log events for unit tests without talking to MongoDB.
 *
 * @param {Array<object>} users
 * @param {number} [n=5000]
 * @returns {Array<object>}
 */
export function generateLogs (users, n = 5000) {
  const logs = [];
  const logLevels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"];
  const logTypes = ["login", "logout", "page_view", "api_call", "error", "performance"];

  for (let i = 0; i < n; i++) {
    const hasError = faker.datatype.boolean({ probability: 0.2 });

    const log = {
      timestamp: faker.date.recent({ days: 7 }),
      level: faker.helpers.arrayElement(logLevels),
      type: faker.helpers.arrayElement(logTypes),
      userId: faker.datatype.boolean({ probability: 0.8 })
        ? faker.helpers.arrayElement(users)._id
        : null,
      sessionId: faker.datatype.uuid(),
      message: faker.hacker.phrase(),
      metadata: {
        ip: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
        endpoint: `/api/${faker.word.noun()}/${faker.word.verb()}`,
        method: faker.helpers.arrayElement(["GET", "POST", "PUT", "DELETE"]),
        statusCode: faker.helpers.arrayElement([200, 201, 400, 401, 403, 404, 500]),
        responseTime: faker.number.int({ min: 10, max: 3000 }),
      },
      error: hasError
        ? {
            type: faker.hacker.abbreviation(),
            stack: faker.lorem.paragraphs({ min: 2, max: 5 }),
          }
        : null,
    };
    logs.push(log);
  }

  return logs;
}
