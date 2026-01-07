/**
 * Data Validation Schemas for All Datasets
 *
 * This module defines MongoDB JSON Schema validation rules for all datasets
 * used in the NoSQL labs. These schemas ensure data integrity and consistency.
 */

const schemas = {
  // ============================================================================
  // Books Collection Schema
  // ============================================================================
  books: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "author"],
      properties: {
        _id: {
          bsonType: ["objectId", "string"]
        },
        title: {
          bsonType: "string",
          maxLength: 500,
          description: "Book title is required and must be less than 500 characters"
        },
        author: {
          bsonType: "string",
          description: "Author name is required"
        },
        isbn: {
          bsonType: "string",
          pattern: "^(\\d{10}|\\d{13})$",
          description: "ISBN must be 10 or 13 digits"
        },
        pages: {
          bsonType: "int",
          minimum: 1,
          maximum: 10000,
          description: "Number of pages must be between 1 and 10000"
        },
        year: {
          bsonType: "int",
          minimum: 1000,
          maximum: new Date().getFullYear() + 1,
          description: "Publication year must be valid"
        },
        publisher: {
          bsonType: "string",
          maxLength: 200
        },
        categories: {
          bsonType: "array",
          maxItems: 10,
          items: {
            bsonType: "string"
          },
          description: "Categories must be an array of strings with max 10 items"
        },
        language: {
          bsonType: "string",
          pattern: "^[a-z]{2}$",
          description: "Language code must be ISO 639-1 format"
        },
        rating: {
          bsonType: "double",
          minimum: 0,
          maximum: 5,
          description: "Rating must be between 0 and 5"
        },
        stock: {
          bsonType: "int",
          minimum: 0,
          description: "Stock quantity cannot be negative"
        }
      }
    }
  },

  // ============================================================================
  // Products Collection Schema
  // ============================================================================
  products: {
    $jsonSchema: {
      bsonType: "object",
      required: ["product_id", "name", "category", "price", "stock_quantity"],
      properties: {
        product_id: {
          bsonType: "string",
          pattern: "^PROD\\d{3,}$",
          description: "Product ID must start with PROD followed by at least 3 digits"
        },
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200,
          description: "Product name is required and must be less than 200 characters"
        },
        description: {
          bsonType: "string",
          maxLength: 2000
        },
        category: {
          bsonType: "string",
          enum: ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Toys", "Food & Beverage", "Health & Beauty"],
          description: "Category must be from predefined list"
        },
        subcategory: {
          bsonType: "string",
          maxLength: 100
        },
        price: {
          bsonType: "double",
          minimum: 0.01,
          maximum: 999999.99,
          description: "Price must be positive and less than 1 million"
        },
        cost: {
          bsonType: "double",
          minimum: 0
        },
        stock_quantity: {
          bsonType: "int",
          minimum: 0,
          description: "Stock quantity cannot be negative"
        },
        manufacturer: {
          bsonType: "string",
          maxLength: 100
        },
        tags: {
          bsonType: "array",
          maxItems: 20,
          items: {
            bsonType: "string"
          }
        },
        specifications: {
          bsonType: "object",
          additionalProperties: true
        },
        ratings: {
          bsonType: "object",
          properties: {
            average: {
              bsonType: "double",
              minimum: 0,
              maximum: 5
            },
            count: {
              bsonType: "int",
              minimum: 0
            },
            distribution: {
              bsonType: "object",
              properties: {
                "5": { bsonType: "int", minimum: 0 },
                "4": { bsonType: "int", minimum: 0 },
                "3": { bsonType: "int", minimum: 0 },
                "2": { bsonType: "int", minimum: 0 },
                "1": { bsonType: "int", minimum: 0 }
              }
            }
          }
        },
        created_at: {
          bsonType: "date"
        },
        updated_at: {
          bsonType: "date"
        }
      }
    }
  },

  // ============================================================================
  // Students Collection Schema
  // ============================================================================
  students: {
    $jsonSchema: {
      bsonType: "object",
      required: ["student_id", "first_name", "last_name", "email", "date_of_birth", "enrollment_date", "major"],
      properties: {
        student_id: {
          bsonType: "string",
          pattern: "^STU\\d{6}$",
          description: "Student ID must be STU followed by 6 digits"
        },
        first_name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50
        },
        last_name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Must be a valid email address"
        },
        date_of_birth: {
          bsonType: "date"
        },
        enrollment_date: {
          bsonType: "date"
        },
        major: {
          bsonType: "string",
          enum: ["Computer Science", "Engineering", "Mathematics", "Physics", "Biology", "Chemistry", "Business", "Economics", "Psychology", "English", "History", "Art"],
          description: "Major must be from predefined list"
        },
        year: {
          bsonType: "int",
          minimum: 1,
          maximum: 6
        },
        gpa: {
          bsonType: "double",
          minimum: 0.0,
          maximum: 4.0
        },
        courses: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["course_id", "name", "credits"],
            properties: {
              course_id: {
                bsonType: "string"
              },
              name: {
                bsonType: "string"
              },
              credits: {
                bsonType: "int",
                minimum: 1,
                maximum: 6
              },
              grade: {
                enum: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"]
              },
              semester: {
                bsonType: "string",
                pattern: "^(Fall|Spring|Summer) \\d{4}$"
              }
            }
          }
        },
        address: {
          bsonType: "object",
          properties: {
            street: { bsonType: "string" },
            city: { bsonType: "string" },
            state: { bsonType: "string" },
            zip: { bsonType: "string" },
            country: { bsonType: "string" }
          }
        },
        status: {
          enum: ["active", "inactive", "graduated", "suspended"],
          description: "Student status must be from predefined list"
        }
      }
    }
  },

  // ============================================================================
  // Companies Collection Schema
  // ============================================================================
  companies: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "industry"],
      properties: {
        name: {
          bsonType: "string",
          maxLength: 200,
          description: "Company name is required"
        },
        founded_year: {
          bsonType: "int",
          minimum: 1800,
          maximum: new Date().getFullYear()
        },
        industry: {
          bsonType: "string",
          enum: ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Energy", "Transportation", "Education", "Entertainment", "Real Estate"],
          description: "Industry must be from predefined list"
        },
        employees: {
          bsonType: "int",
          minimum: 1,
          maximum: 10000000
        },
        revenue: {
          bsonType: "double",
          minimum: 0
        },
        headquarters: {
          bsonType: "object",
          required: ["city", "country"],
          properties: {
            city: { bsonType: "string" },
            state: { bsonType: "string" },
            country: { bsonType: "string" },
            coordinates: {
              bsonType: "object",
              properties: {
                lat: {
                  bsonType: "double",
                  minimum: -90,
                  maximum: 90
                },
                lng: {
                  bsonType: "double",
                  minimum: -180,
                  maximum: 180
                }
              }
            }
          }
        },
        website: {
          bsonType: "string",
          pattern: "^https?://.*"
        },
        stock_symbol: {
          bsonType: "string",
          pattern: "^[A-Z]{1,5}$"
        },
        subsidiaries: {
          bsonType: "array",
          maxItems: 50,
          items: {
            bsonType: "string"
          }
        },
        founded_by: {
          bsonType: "array",
          maxItems: 10,
          items: {
            bsonType: "string"
          }
        }
      }
    }
  },

  // ============================================================================
  // Orders Collection Schema (Lab 02)
  // ============================================================================
  orders: {
    $jsonSchema: {
      bsonType: "object",
      required: ["order_id", "customer_id", "order_date", "status", "items", "total_amount"],
      properties: {
        order_id: {
          bsonType: "string",
          pattern: "^ORD\\d{3,}$",
          description: "Order ID must start with ORD followed by at least 3 digits"
        },
        customer_id: {
          bsonType: "string",
          pattern: "^CUST\\d{3,}$",
          description: "Customer ID must start with CUST followed by at least 3 digits"
        },
        order_date: {
          bsonType: "date"
        },
        status: {
          enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
          description: "Order status must be from predefined list"
        },
        items: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["product_id", "product_name", "quantity", "unit_price"],
            properties: {
              product_id: {
                bsonType: "string",
                pattern: "^PROD\\d{3,}$"
              },
              product_name: {
                bsonType: "string"
              },
              quantity: {
                bsonType: "int",
                minimum: 1,
                maximum: 1000
              },
              unit_price: {
                bsonType: "double",
                minimum: 0.01
              },
              discount: {
                bsonType: "double",
                minimum: 0,
                maximum: 100
              }
            }
          }
        },
        shipping_address: {
          bsonType: "object",
          required: ["street", "city", "zip"],
          properties: {
            street: { bsonType: "string" },
            city: { bsonType: "string" },
            state: { bsonType: "string" },
            zip: { bsonType: "string" },
            country: { bsonType: "string" }
          }
        },
        payment: {
          bsonType: "object",
          properties: {
            method: {
              enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "cash_on_delivery"]
            },
            status: {
              enum: ["pending", "completed", "failed", "refunded"]
            },
            transaction_id: {
              bsonType: "string"
            }
          }
        },
        subtotal: {
          bsonType: "double",
          minimum: 0
        },
        tax_amount: {
          bsonType: "double",
          minimum: 0
        },
        shipping_cost: {
          bsonType: "double",
          minimum: 0
        },
        total_amount: {
          bsonType: "double",
          minimum: 0.01
        }
      }
    }
  },

  // ============================================================================
  // Customers Collection Schema (Lab 02)
  // ============================================================================
  customers: {
    $jsonSchema: {
      bsonType: "object",
      required: ["customer_id", "name", "email", "address"],
      properties: {
        customer_id: {
          bsonType: "string",
          pattern: "^CUST\\d{3,}$"
        },
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        phone: {
          bsonType: "string",
          pattern: "^\\+?[\\d\\s\\-()]+$"
        },
        address: {
          bsonType: "object",
          required: ["street", "city", "zip"],
          properties: {
            street: { bsonType: "string" },
            city: { bsonType: "string" },
            state: { bsonType: "string" },
            zip: { bsonType: "string" },
            country: { bsonType: "string" }
          }
        },
        registration_date: {
          bsonType: "date"
        },
        last_login: {
          bsonType: "date"
        },
        order_count: {
          bsonType: "int",
          minimum: 0
        },
        total_spent: {
          bsonType: "double",
          minimum: 0
        },
        loyalty_points: {
          bsonType: "int",
          minimum: 0
        },
        preferences: {
          bsonType: "object",
          properties: {
            newsletter: { bsonType: "bool" },
            sms: { bsonType: "bool" },
            push_notifications: { bsonType: "bool" }
          }
        }
      }
    }
  },

  // ============================================================================
  // Generic Validation Functions
  // ============================================================================
  validateEmail: {
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    message: "Invalid email format"
  },

  validateURL: {
    pattern: "^https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$",
    message: "Invalid URL format"
  },

  validatePhone: {
    pattern: "^\\+?[1-9]\\d{1,14}$",
    message: "Invalid phone number format (E.164)"
  },

  validateISBN: {
    pattern: "^(97[89])?\\d{9}[\\dX]$",
    message: "Invalid ISBN format"
  },

  validatePostalCode: {
    US: {
      pattern: "^\\d{5}(-\\d{4})?$",
      message: "Invalid US ZIP code"
    },
    UK: {
      pattern: "^[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}$",
      message: "Invalid UK postcode"
    },
    Canada: {
      pattern: "^[A-Z]\\d[A-Z]\\s?\\d[A-Z]\\d$",
      message: "Invalid Canadian postal code"
    }
  }
};

/**
 * Apply validation schema to a collection
 */
async function applySchema(db, collectionName, schema) {
  try {
    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length > 0) {
      // Update existing collection validation
      await db.command({
        collMod: collectionName,
        validator: schema,
        validationLevel: "moderate", // Only validate new documents and updates
        validationAction: "warn"     // Log warnings but don't reject
      });
      console.log(`✓ Updated validation schema for collection: ${collectionName}`);
    } else {
      // Create collection with validation
      await db.createCollection(collectionName, {
        validator: schema,
        validationLevel: "strict",
        validationAction: "error"
      });
      console.log(`✓ Created collection with validation: ${collectionName}`);
    }

    return true;
  } catch (error) {
    console.error(`✗ Error applying schema to ${collectionName}:`, error.message);
    return false;
  }
}

/**
 * Validate a document against a schema
 */
function validateDocument(document, schemaName) {
  const schema = schemas[schemaName];
  if (!schema) {
    throw new Error(`Schema '${schemaName}' not found`);
  }

  const errors = [];
  const jsonSchema = schema.$jsonSchema;

  // Check required fields
  if (jsonSchema.required) {
    jsonSchema.required.forEach(field => {
      if (!(field in document)) {
        errors.push(`Missing required field: ${field}`);
      }
    });
  }

  // Validate properties
  if (jsonSchema.properties) {
    Object.entries(document).forEach(([field, value]) => {
      const fieldSchema = jsonSchema.properties[field];
      if (!fieldSchema) {
        // Field not in schema (might be additional property)
        return;
      }

      // Type validation
      if (fieldSchema.bsonType) {
        const types = Array.isArray(fieldSchema.bsonType) ? fieldSchema.bsonType : [fieldSchema.bsonType];
        const valueType = getValueType(value);

        if (!types.includes(valueType)) {
          errors.push(`Field '${field}' should be ${types.join(' or ')}, got ${valueType}`);
        }
      }

      // String validations
      if (typeof value === 'string') {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          errors.push(`Field '${field}' length ${value.length} is less than minimum ${fieldSchema.minLength}`);
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          errors.push(`Field '${field}' length ${value.length} exceeds maximum ${fieldSchema.maxLength}`);
        }
        if (fieldSchema.pattern) {
          const regex = new RegExp(fieldSchema.pattern);
          if (!regex.test(value)) {
            errors.push(`Field '${field}' doesn't match pattern ${fieldSchema.pattern}`);
          }
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
          errors.push(`Field '${field}' value ${value} is less than minimum ${fieldSchema.minimum}`);
        }
        if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
          errors.push(`Field '${field}' value ${value} exceeds maximum ${fieldSchema.maximum}`);
        }
      }

      // Enum validation
      if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
        errors.push(`Field '${field}' value '${value}' not in allowed values: ${fieldSchema.enum.join(', ')}`);
      }

      // Array validations
      if (Array.isArray(value)) {
        if (fieldSchema.minItems && value.length < fieldSchema.minItems) {
          errors.push(`Field '${field}' array length ${value.length} is less than minimum ${fieldSchema.minItems}`);
        }
        if (fieldSchema.maxItems && value.length > fieldSchema.maxItems) {
          errors.push(`Field '${field}' array length ${value.length} exceeds maximum ${fieldSchema.maxItems}`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get BSON type of a value
 */
function getValueType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'double';
  }
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'object') return 'object';
  return 'unknown';
}

/**
 * Validate an entire collection
 */
async function validateCollection(db, collectionName, schemaName) {
  console.log(`\nValidating collection: ${collectionName}`);

  const documents = await db.collection(collectionName).find({}).toArray();
  let validCount = 0;
  let invalidCount = 0;
  const errors = [];

  documents.forEach((doc, index) => {
    const result = validateDocument(doc, schemaName);
    if (result.valid) {
      validCount++;
    } else {
      invalidCount++;
      if (errors.length < 10) { // Only keep first 10 errors
        errors.push({
          index,
          _id: doc._id,
          errors: result.errors
        });
      }
    }
  });

  console.log(`  Total documents: ${documents.length}`);
  console.log(`  Valid: ${validCount}`);
  console.log(`  Invalid: ${invalidCount}`);

  if (errors.length > 0) {
    console.log(`  First ${Math.min(10, errors.length)} errors:`);
    errors.forEach(err => {
      console.log(`    Document ${err._id}:`);
      err.errors.forEach(e => console.log(`      - ${e}`));
    });
  }

  return {
    total: documents.length,
    valid: validCount,
    invalid: invalidCount,
    errors
  };
}

module.exports = {
  schemas,
  applySchema,
  validateDocument,
  validateCollection,
  getValueType
};