# Architecture & Data Model

## Domain Snapshot

Sakila is a DVD store chain that spans across multiple countries. Each store rents out movies of different categories and languages to their customers. The project needs to answer:

1. What are the most rented movies (individual, category, actors...)?
2. Which stores get the most/least rentals? Where are they, and who staffs them?
3. Which locations drive the most revenue?

## Collections

| Collection | Role | Notes |
| ---------- | ---- | ----- |
| `country` | Geographic Reference | Stores Country Names. Used to group up cities. |
| `city` | Geographic Subdivision | Stores cities and links them to countries. Used to group up addresses. |
| `address` | Location Entity | Stores addresses for customers, staff, and stores. Contains spatial data and references city. |
| `customer` | Customer Entity | Stores customer information, status, and links to an address and a store. Primary entity for rentals and payments. |
| `store` | Business Location | Stores store locations. References address and staff. |
| `staff` | Employee Entity | Stores staff information, including login credentials and assigned store. Used in rentals and payments. |
| `payment` | Financial Transaction | Stores payment records linked to customers, rentals, and staff. |
| `rental` | Customer–Film Connector | Stores rental transactions linking customers, inventory items, and staff, including rental and return dates. |
| `inventory` | Stock Reference | Represents film copies currently in stock at each store. |
| `film` | Media Entity | Stores film metadata (title, description, rating, pricing). Primary entity for rentals and payments. |
| `film_actor` | Film–Actor Relationship | Many-to-many connection between films and actors. |
| `actor` | Performer Entity | Stores actor information. |
| `film_category` | Film–Category Relationship | Many-to-many connection between films and categories. |
| `category` | Genre Classification | Stores film categories (e.g., Action, Comedy). |
| `language` | Language Reference | Stores available languages for films. |


### Schema Highlights

```javascript
//actor
{
	_id: ObjectId,
	first_name: "PENELOPE",
	last_name: "GUINESS",
	last_update: ISODate("2006-02-15 04:34:33")
},

//address
{
	_id: ObjectId,
	address: "47 MySakila Drive",
	address2: null,
	district: "Alberta",
	city_id: NumberInt,
	postal_code: "",
	phone: "",
	location: BinData(0,"0x00000000010.."),
	last_update: ISODate("2014-09-25T22:30:27Z")
}

//category
{
	_id: ObjectId,
	name: "Action",
	last_update: ISODate("2006-02-15T04:46:27Z")
}

//city
{
	_id: ObjectId,
	city: "A Coruña (La Coruña)",
	country_id: NumberInt,
	last_update: ISODate("2006-02-15T04:45:25Z")
}

//country
{
	_id: ObjectId,
	country: "Afghanistan",
	last_update: ISODate("2006-02-15T04:44:00Z")
}

//customer
{
	_id: ObjectId,
	store_id: NumberInt,
	first_name: "MARY",
	last_name: "SMITH",
	email: "MARY.SMITH@sakilacustomer.org",
	address_id: NumberInt,
	active: Bool,
	create_date: ISODate("2006-02-14T22:04:36Z"),
	last_update: ISODate("2006-02-15T04:57:20Z")
}

//film_actor
{
	actor_id: NumberInt,
	film_id: NumberInt,
	last_update: ISODate("2006-02-15T05:05:03Z")
}

//film_category
{
	film_id: NumberInt,
	category_id: NumberInt,
	last_update: ISODate("2006-02-15T05:07:09Z")
}

//film
{
	_id: ObjectId,
	title: "ACADEMY DINOSAUR",
	description: "A Epic Drama of a Feminist And a Mad Scientist who must Battle a Teacher in The Canadian Rockies",
	release_year: NumberInt,
	language_id: NumberInt,
	original_language_id: NumberInt,
	rental_duration: NumberInt,
	rental_rate: "0.99",
	length: NumberInt,
	replacement_cost: "20.99",
	rating: "PG",
	special_features: "Deleted Scenes,Behind the Scenes",
	last_update: ISODate("2006-02-15T05:03:42Z")
}

//inventory
{
	_id: ObjectId,
	film_id: NumberInt,
	store_id: NumberInt,
	last_update: ISODate("2006-02-15T05:09:17Z")
}

//language
{
	_id: ObjectId,
	name: "English",
	last_update: ISODate("2006-02-15T05:02:19Z")
}

//payment
{
	_id: ObjectId,
	customer_id: NumberInt,
	staff_id: NumberInt,
	rental_id: NumberInt,
	amount: "2.99",
	payment_date: ISODate("2005-05-25T11:30:37Z"),
	last_update: ISODate("2006-02-15T22:12:30Z")
}

//rental
{
	_id: ObjectId,
	rental_date: ISODate("2005-05-24T22:53:30Z"),
	inventory_id: NumberInt,
	customer_id: NumberInt,
	return_date: ISODate("2005-05-26T22:04:30Z"),
	staff_id: NumberInt,
	last_update: ISODate("2006-02-15T21:30:53Z")
},

//staff
{
	_id: ObjectId,
	first_name: "Mike",
	last_name: "Hillyer",
	address_id: NumberInt
	picture: "0x89504E470D0A1A0A..."
	store_id: NumberInt,
	active: Bool,
	username: "Mike",
	password: "8cb2237d0679ca88db6464eac60da96345513964",
	last_update: ISODate("2006-02-15T03:57:16Z")
}

//store
{
	_id: ObjectId,
	manager_staff_id: NumberInt,
	address_id: NumberInt,
	last_update: "2006-02-15 04:57:12"
}
```

## Relationships & Access Patterns
| Relation | Type |
| ---------- | ---- |
`Country` → `City` | 1-to-Many |
`City` → `Address` | 1-to-Many |
`Store` → `Staff` | 1-to-Many |
`Store` → `Customer` | 1-to-Many |
`Film` ↔ `Actor` | Many-to-Many |
`Film` ↔ `Category` | Many-to-Many |
`Film` → `Inventory` | 1-to-Many |
`Inventory` → `Rental` | 1-to-Many |
`Customer` → `Rental` | 1-to-Many |
`Rental` → `Payment` | 1-to-Many |

## Index Blueprint

- unique indexes for rental's `{ customer_id: 1 }`, inventory's `{ inventory_id: 1 }`, film's `{ film_id: 1 }` and staff's `{ staff_id: 1 }` - speeds up queries