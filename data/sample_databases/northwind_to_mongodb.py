"""
Northwind to MongoDB Transformation
====================================
Transforms the Northwind relational database into MongoDB collections
using a balanced hybrid schema design.

Author: Diogo Ribeiro
Institution: ESMAD - Instituto Politécnico do Porto

Requirements:
    pip install pandas pymongo python-dotenv

Usage:
    python northwind_to_mongodb.py --input ./northwind --uri mongodb://localhost:27017

Schema Design:
    - products: embedded category and supplier
    - customers: embedded address with order summary
    - orders: embedded order items with customer/employee snapshots
    - employees: embedded territories and management chain
"""

import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any
from pymongo import MongoClient, ASCENDING, TEXT


class NorthwindToMongoDB:
    """Transform Northwind relational data to MongoDB documents."""
    
    def __init__(self, data_dir: Path, mongo_uri: str, db_name: str = "northwind"):
        self.data_dir = Path(data_dir)
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client[db_name]
        self.data_cache: Dict[str, List[dict]] = {}
        
    def load_json(self, filename: str) -> List[dict]:
        """Load JSON file and cache it."""
        if filename not in self.data_cache:
            file_path = self.data_dir / f"{filename}.json"
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.data_cache[filename] = json.load(f)
                print(f"  Loaded {filename}: {len(self.data_cache[filename])} records")
                
                # Debug: Print first record's keys to understand structure
                if self.data_cache[filename]:
                    print(f"    Sample keys: {list(self.data_cache[filename][0].keys())[:5]}")
            else:
                print(f"  Warning: {file_path} not found")
                self.data_cache[filename] = []
        return self.data_cache[filename]
    
    def get_field(self, record: dict, *possible_names: str) -> Any:
        """Get field value trying different possible names."""
        for name in possible_names:
            if name in record:
                return record[name]
        return None
    
    def index_by(self, data: List[dict], *possible_keys: str) -> Dict[Any, dict]:
        """Index list of dicts by first matching key."""
        result = {}
        for row in data:
            for key in possible_keys:
                if key in row:
                    result[row[key]] = row
                    break
        return result
    
    def transform_products(self) -> List[dict]:
        """Transform products with embedded category and supplier."""
        products = self.load_json("products")
        categories = self.index_by(
            self.load_json("categories"), 
            "CategoryID", "categoryID", "category_id", "categoryId"
        )
        suppliers = self.index_by(
            self.load_json("suppliers"), 
            "SupplierID", "supplierID", "supplier_id", "supplierId"
        )
        
        documents = []
        for product in products:
            # Try different possible field names
            product_id = self.get_field(product, "ProductID", "productID", "product_id", "productId", "ProductId")
            category_id = self.get_field(product, "CategoryID", "categoryID", "category_id", "categoryId", "CategoryId")
            supplier_id = self.get_field(product, "SupplierID", "supplierID", "supplier_id", "supplierId", "SupplierId")
            
            # Get related data
            category = categories.get(category_id, {})
            supplier = suppliers.get(supplier_id, {})
            
            # Handle price fields
            unit_price = self.get_field(product, "UnitPrice", "unitPrice", "unit_price", "unitprice")
            if unit_price:
                try:
                    unit_price = float(unit_price)
                except (ValueError, TypeError):
                    unit_price = 0.0
            else:
                unit_price = 0.0
            
            doc = {
                "product_id": product_id,
                "product_name": self.get_field(product, "ProductName", "productName", "product_name", "productname"),
                "unit": self.get_field(product, "QuantityPerUnit", "quantityPerUnit", "quantity_per_unit"),
                "unit_price": unit_price,
                "units_in_stock": self.get_field(product, "UnitsInStock", "unitsInStock", "units_in_stock") or 0,
                "units_on_order": self.get_field(product, "UnitsOnOrder", "unitsOnOrder", "units_on_order") or 0,
                "reorder_level": self.get_field(product, "ReorderLevel", "reorderLevel", "reorder_level") or 0,
                "discontinued": bool(self.get_field(product, "Discontinued", "discontinued")),
                
                # Embedded category
                "category": {
                    "category_id": self.get_field(category, "CategoryID", "categoryID", "category_id"),
                    "category_name": self.get_field(category, "CategoryName", "categoryName", "category_name"),
                    "description": self.get_field(category, "Description", "description")
                } if category else None,
                
                # Embedded supplier
                "supplier": {
                    "supplier_id": self.get_field(supplier, "SupplierID", "supplierID", "supplier_id"),
                    "company_name": self.get_field(supplier, "CompanyName", "companyName", "company_name"),
                    "contact_name": self.get_field(supplier, "ContactName", "contactName", "contact_name"),
                    "contact_title": self.get_field(supplier, "ContactTitle", "contactTitle", "contact_title"),
                    "address": {
                        "street": self.get_field(supplier, "Address", "address"),
                        "city": self.get_field(supplier, "City", "city"),
                        "region": self.get_field(supplier, "Region", "region"),
                        "postal_code": self.get_field(supplier, "PostalCode", "postalCode", "postal_code"),
                        "country": self.get_field(supplier, "Country", "country")
                    },
                    "phone": self.get_field(supplier, "Phone", "phone"),
                    "fax": self.get_field(supplier, "Fax", "fax")
                } if supplier else None,
                
                # Analytics placeholder
                "analytics": {
                    "total_orders": 0,
                    "total_quantity_sold": 0,
                    "total_revenue": 0.0,
                    "avg_order_quantity": 0
                }
            }
            documents.append(doc)
        
        return documents
    
    def transform_customers(self) -> List[dict]:
        """Transform customers with embedded address and order insights."""
        customers = self.load_json("customers")
        orders = self.load_json("orders")
        
        # Calculate customer insights
        customer_orders = {}
        for order in orders:
            cust_id = self.get_field(order, "CustomerID", "customerID", "customer_id", "customerId")
            if cust_id:
                if cust_id not in customer_orders:
                    customer_orders[cust_id] = []
                customer_orders[cust_id].append(order)
        
        documents = []
        for customer in customers:
            cust_id = self.get_field(customer, "CustomerID", "customerID", "customer_id", "customerId")
            cust_orders = customer_orders.get(cust_id, [])
            
            # Calculate insights
            total_orders = len(cust_orders)
            last_order_date = None
            first_order_date = None
            if cust_orders:
                order_dates = []
                for o in cust_orders:
                    date = self.get_field(o, "OrderDate", "orderDate", "order_date")
                    if date:
                        order_dates.append(date)
                if order_dates:
                    first_order_date = min(order_dates)
                    last_order_date = max(order_dates)
            
            # Get recent orders (last 5)
            recent_orders = []
            sorted_orders = sorted(
                cust_orders, 
                key=lambda x: self.get_field(x, "OrderDate", "orderDate", "order_date") or "", 
                reverse=True
            )[:5]
            
            for order in sorted_orders:
                freight = self.get_field(order, "Freight", "freight")
                if freight:
                    try:
                        freight = float(freight)
                    except (ValueError, TypeError):
                        freight = 0.0
                else:
                    freight = 0.0
                    
                recent_orders.append({
                    "order_id": self.get_field(order, "OrderID", "orderID", "order_id"),
                    "order_date": self.get_field(order, "OrderDate", "orderDate", "order_date"),
                    "shipped_date": self.get_field(order, "ShippedDate", "shippedDate", "shipped_date"),
                    "freight": freight
                })
            
            doc = {
                "customer_id": cust_id,
                "company_name": self.get_field(customer, "CompanyName", "companyName", "company_name"),
                "contact_name": self.get_field(customer, "ContactName", "contactName", "contact_name"),
                "contact_title": self.get_field(customer, "ContactTitle", "contactTitle", "contact_title"),
                
                # Embedded address
                "address": {
                    "street": self.get_field(customer, "Address", "address"),
                    "city": self.get_field(customer, "City", "city"),
                    "region": self.get_field(customer, "Region", "region"),
                    "postal_code": self.get_field(customer, "PostalCode", "postalCode", "postal_code"),
                    "country": self.get_field(customer, "Country", "country"),
                    "location": {
                        "type": "Point",
                        "coordinates": [0, 0]  # Would geocode in production
                    }
                },
                
                "phone": self.get_field(customer, "Phone", "phone"),
                "fax": self.get_field(customer, "Fax", "fax"),
                
                # Customer insights
                "insights": {
                    "customer_since": first_order_date,
                    "total_orders": total_orders,
                    "last_order_date": last_order_date,
                    "lifetime_value_segment": "Silver" if total_orders > 5 else "Bronze"
                },
                
                # Recent orders (bounded)
                "recent_orders": recent_orders
            }
            documents.append(doc)
        
        return documents
    
    def transform_orders(self) -> List[dict]:
        """Transform orders with embedded line items."""
        orders = self.load_json("orders")
        order_details = self.load_json("order_details")
        customers = self.index_by(
            self.load_json("customers"),
            "CustomerID", "customerID", "customer_id", "customerId"
        )
        employees = self.index_by(
            self.load_json("employees"),
            "EmployeeID", "employeeID", "employee_id", "employeeId"
        )
        products = self.index_by(
            self.load_json("products"),
            "ProductID", "productID", "product_id", "productId"
        )
        shippers = self.index_by(
            self.load_json("shippers"),
            "ShipperID", "shipperID", "shipper_id", "shipperId"
        )
        
        # Group order details by order
        details_by_order = {}
        for detail in order_details:
            order_id = self.get_field(detail, "OrderID", "orderID", "order_id", "orderId")
            if order_id:
                if order_id not in details_by_order:
                    details_by_order[order_id] = []
                details_by_order[order_id].append(detail)
        
        documents = []
        for order in orders:
            order_id = self.get_field(order, "OrderID", "orderID", "order_id", "orderId")
            customer_id = self.get_field(order, "CustomerID", "customerID", "customer_id", "customerId")
            employee_id = self.get_field(order, "EmployeeID", "employeeID", "employee_id", "employeeId")
            ship_via = self.get_field(order, "ShipVia", "shipVia", "ship_via")
            
            customer = customers.get(customer_id, {})
            employee = employees.get(employee_id, {})
            shipper = shippers.get(ship_via, {})
            
            # Build order items
            order_items = []
            subtotal = 0
            total_quantity = 0
            
            for detail in details_by_order.get(order_id, []):
                product_id = self.get_field(detail, "ProductID", "productID", "product_id", "productId")
                product = products.get(product_id, {})
                
                quantity = self.get_field(detail, "Quantity", "quantity") or 0
                unit_price = self.get_field(detail, "UnitPrice", "unitPrice", "unit_price")
                discount = self.get_field(detail, "Discount", "discount")
                
                try:
                    unit_price = float(unit_price) if unit_price else 0.0
                    discount = float(discount) if discount else 0.0
                except (ValueError, TypeError):
                    unit_price = 0.0
                    discount = 0.0
                
                line_total = quantity * unit_price * (1 - discount)
                
                order_items.append({
                    "line_number": len(order_items) + 1,
                    "product": {
                        "product_id": product_id,
                        "product_name": self.get_field(product, "ProductName", "productName", "product_name"),
                        "category_id": self.get_field(product, "CategoryID", "categoryID", "category_id")
                    },
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "discount": discount,
                    "line_total": line_total
                })
                
                subtotal += line_total
                total_quantity += quantity
            
            freight = self.get_field(order, "Freight", "freight")
            try:
                freight = float(freight) if freight else 0.0
            except (ValueError, TypeError):
                freight = 0.0
            
            # Determine status based on dates
            status = "Placed"
            if self.get_field(order, "ShippedDate", "shippedDate", "shipped_date"):
                status = "Shipped"
                
            doc = {
                "order_id": order_id,
                "order_date": self.get_field(order, "OrderDate", "orderDate", "order_date"),
                "required_date": self.get_field(order, "RequiredDate", "requiredDate", "required_date"),
                "shipped_date": self.get_field(order, "ShippedDate", "shippedDate", "shipped_date"),
                
                # Customer snapshot
                "customer": {
                    "customer_id": customer_id,
                    "company_name": self.get_field(customer, "CompanyName", "companyName", "company_name"),
                    "contact_name": self.get_field(customer, "ContactName", "contactName", "contact_name")
                },
                
                # Employee snapshot
                "employee": {
                    "employee_id": employee_id,
                    "first_name": self.get_field(employee, "FirstName", "firstName", "first_name"),
                    "last_name": self.get_field(employee, "LastName", "lastName", "last_name"),
                    "title": self.get_field(employee, "Title", "title")
                },
                
                # Embedded line items
                "order_items": order_items,
                
                # Shipping information
                "shipping": {
                    "ship_name": self.get_field(order, "ShipName", "shipName", "ship_name"),
                    "ship_address": {
                        "street": self.get_field(order, "ShipAddress", "shipAddress", "ship_address"),
                        "city": self.get_field(order, "ShipCity", "shipCity", "ship_city"),
                        "region": self.get_field(order, "ShipRegion", "shipRegion", "ship_region"),
                        "postal_code": self.get_field(order, "ShipPostalCode", "shipPostalCode", "ship_postal_code"),
                        "country": self.get_field(order, "ShipCountry", "shipCountry", "ship_country")
                    },
                    "shipper": {
                        "shipper_id": self.get_field(shipper, "ShipperID", "shipperID", "shipper_id"),
                        "company_name": self.get_field(shipper, "CompanyName", "companyName", "company_name"),
                        "phone": self.get_field(shipper, "Phone", "phone")
                    } if shipper else None,
                    "freight": freight
                },
                
                # Order totals
                "totals": {
                    "subtotal": subtotal,
                    "freight": freight,
                    "discount_amount": 0,
                    "total": subtotal + freight,
                    "item_count": len(order_items),
                    "total_quantity": total_quantity
                },
                
                # Status
                "status": {
                    "current": status,
                    "payment_status": "Paid",
                    "fulfillment_status": "Complete" if status == "Delivered" else "In Progress"
                }
            }
            documents.append(doc)
        
        return documents
    
    def transform_employees(self) -> List[dict]:
        """Transform employees with embedded territories."""
        employees = self.load_json("employees")
        
        # Try loading territories - might not exist
        try:
            territories = self.load_json("territories")
            employee_territories = self.load_json("employeeterritories")
        except:
            territories = []
            employee_territories = []
            print("  Note: territories/employeeterritories not found, skipping")
        
        # Index territories
        territories_dict = self.index_by(territories, "TerritoryID", "territoryID", "territory_id")
        
        # Group territories by employee
        emp_territories = {}
        for et in employee_territories:
            emp_id = self.get_field(et, "EmployeeID", "employeeID", "employee_id")
            if emp_id:
                if emp_id not in emp_territories:
                    emp_territories[emp_id] = []
                territory_id = self.get_field(et, "TerritoryID", "territoryID", "territory_id")
                territory = territories_dict.get(territory_id, {})
                if territory:
                    emp_territories[emp_id].append({
                        "territory_id": territory_id,
                        "territory_description": self.get_field(territory, "TerritoryDescription", "territoryDescription"),
                        "region_id": self.get_field(territory, "RegionID", "regionID", "region_id")
                    })
        
        # Build management hierarchy
        employees_dict = self.index_by(employees, "EmployeeID", "employeeID", "employee_id")
        
        documents = []
        for employee in employees:
            emp_id = self.get_field(employee, "EmployeeID", "employeeID", "employee_id")
            reports_to = self.get_field(employee, "ReportsTo", "reportsTo", "reports_to")
            
            # Build management chain
            management_chain = []
            current_manager_id = reports_to
            while current_manager_id and current_manager_id in employees_dict:
                manager = employees_dict[current_manager_id]
                first_name = self.get_field(manager, "FirstName", "firstName", "first_name") or ""
                last_name = self.get_field(manager, "LastName", "lastName", "last_name") or ""
                management_chain.append({
                    "employee_id": self.get_field(manager, "EmployeeID", "employeeID", "employee_id"),
                    "name": f"{first_name} {last_name}".strip(),
                    "title": self.get_field(manager, "Title", "title")
                })
                current_manager_id = self.get_field(manager, "ReportsTo", "reportsTo", "reports_to")
            
            # Find direct reports
            direct_reports = []
            for emp in employees:
                if self.get_field(emp, "ReportsTo", "reportsTo", "reports_to") == emp_id:
                    first_name = self.get_field(emp, "FirstName", "firstName", "first_name") or ""
                    last_name = self.get_field(emp, "LastName", "lastName", "last_name") or ""
                    direct_reports.append({
                        "employee_id": self.get_field(emp, "EmployeeID", "employeeID", "employee_id"),
                        "name": f"{first_name} {last_name}".strip(),
                        "title": self.get_field(emp, "Title", "title")
                    })
            
            doc = {
                "employee_id": emp_id,
                "first_name": self.get_field(employee, "FirstName", "firstName", "first_name"),
                "last_name": self.get_field(employee, "LastName", "lastName", "last_name"),
                "title": self.get_field(employee, "Title", "title"),
                "title_of_courtesy": self.get_field(employee, "TitleOfCourtesy", "titleOfCourtesy", "title_of_courtesy"),
                "birth_date": self.get_field(employee, "BirthDate", "birthDate", "birth_date"),
                "hire_date": self.get_field(employee, "HireDate", "hireDate", "hire_date"),
                
                # Contact information
                "contact": {
                    "address": {
                        "street": self.get_field(employee, "Address", "address"),
                        "city": self.get_field(employee, "City", "city"),
                        "region": self.get_field(employee, "Region", "region"),
                        "postal_code": self.get_field(employee, "PostalCode", "postalCode", "postal_code"),
                        "country": self.get_field(employee, "Country", "country")
                    },
                    "home_phone": self.get_field(employee, "HomePhone", "homePhone", "home_phone"),
                    "extension": self.get_field(employee, "Extension", "extension")
                },
                
                # Organization
                "organization": {
                    "reports_to": reports_to,
                    "manager": management_chain[0] if management_chain else None,
                    "management_chain": management_chain,
                    "direct_reports": direct_reports
                },
                
                # Territories
                "territories": emp_territories.get(emp_id, []),
                
                # Additional
                "notes": self.get_field(employee, "Notes", "notes"),
                "photo_path": self.get_field(employee, "PhotoPath", "photoPath", "photo_path")
            }
            documents.append(doc)
        
        return documents
    
    def create_indexes(self):
        """Create indexes for all collections."""
        print("\n[Creating Indexes]")
        
        # Products indexes
        self.db.products.create_index([("product_id", ASCENDING)], unique=True)
        self.db.products.create_index([("category.category_name", ASCENDING)])
        self.db.products.create_index([("unit_price", ASCENDING)])
        self.db.products.create_index([("product_name", TEXT)])
        print("  ✓ Products indexes created")
        
        # Customers indexes
        self.db.customers.create_index([("customer_id", ASCENDING)], unique=True)
        self.db.customers.create_index([("company_name", ASCENDING)])
        self.db.customers.create_index([("address.country", ASCENDING)])
        self.db.customers.create_index([("address.location", "2dsphere")])
        print("  ✓ Customers indexes created")
        
        # Orders indexes
        self.db.orders.create_index([("order_id", ASCENDING)], unique=True)
        self.db.orders.create_index([("order_date", -1)])
        self.db.orders.create_index([("customer.customer_id", ASCENDING)])
        self.db.orders.create_index([("employee.employee_id", ASCENDING)])
        self.db.orders.create_index([("status.current", ASCENDING)])
        print("  ✓ Orders indexes created")
        
        # Employees indexes
        self.db.employees.create_index([("employee_id", ASCENDING)], unique=True)
        self.db.employees.create_index([("organization.reports_to", ASCENDING)])
        print("  ✓ Employees indexes created")
    
    def run(self):
        """Execute the complete transformation."""
        print("=" * 60)
        print("Northwind to MongoDB Transformation")
        print("=" * 60)
        
        # Drop existing collections
        print("\n[Preparing Database]")
        for collection in ["products", "customers", "orders", "employees"]:
            self.db[collection].drop()
            print(f"  Dropped {collection} collection")
        
        # Transform and load products
        print("\n[Transforming Products]")
        products = self.transform_products()
        if products:
            self.db.products.insert_many(products)
            print(f"  ✓ Inserted {len(products)} products")
        
        # Transform and load customers
        print("\n[Transforming Customers]")
        customers = self.transform_customers()
        if customers:
            self.db.customers.insert_many(customers)
            print(f"  ✓ Inserted {len(customers)} customers")
        
        # Transform and load orders
        print("\n[Transforming Orders]")
        orders = self.transform_orders()
        if orders:
            self.db.orders.insert_many(orders)
            print(f"  ✓ Inserted {len(orders)} orders")
        
        # Transform and load employees
        print("\n[Transforming Employees]")
        employees = self.transform_employees()
        if employees:
            self.db.employees.insert_many(employees)
            print(f"  ✓ Inserted {len(employees)} employees")
        
        # Create indexes
        self.create_indexes()
        
        # Summary
        print("\n[Summary]")
        for collection in ["products", "customers", "orders", "employees"]:
            count = self.db[collection].count_documents({})
            print(f"  {collection}: {count} documents")
        
        print("\n" + "=" * 60)
        print("Transformation Complete!")
        print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Transform Northwind database to MongoDB"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        default="./northwind",
        help="Directory containing Northwind JSON files"
    )
    parser.add_argument(
        "--uri", "-u",
        type=str,
        default="mongodb://localhost:27017",
        help="MongoDB connection URI"
    )
    parser.add_argument(
        "--database", "-d",
        type=str,
        default="northwind",
        help="MongoDB database name"
    )
    
    args = parser.parse_args()
    
    transformer = NorthwindToMongoDB(
        data_dir=args.input,
        mongo_uri=args.uri,
        db_name=args.database
    )
    
    transformer.run()
