First, create a business:

curl -X POST http://localhost:3000/api/businesses \
-H "Content-Type: application/json" \
-d '{
"id": "biz1",
"name": "My Shop",
"createdAt": "2023-12-20"
}'

Then add a customer:

curl -X POST http://localhost:3000/api/businesses/biz1/customers \
-H "Content-Type: application/json" \
-d '{
"id": "cust1",
"name": "John Doe",
"phoneNumber": "1234567890"
}'

Create a transaction:

curl -X POST http://localhost:3000/api/businesses/biz1/transactions \
-H "Content-Type: application/json" \
-d '{
"id": "trans1",
"type": "IN",
"amount": 100.00,
"customerId": "cust1",
"description": "Payment received",
"date": "2023-12-20",
"category": "CUSTOMER"
}'

Create a supplier:

curl -X POST http://localhost:3000/api/businesses/biz1/suppliers \
-H "Content-Type: application/json" \
-d '{
"id": "sup1",
"name": "ABC Wholesalers",
"phoneNumber": "9876543210",
"balance": 0
}'

Get all suppliers:
curl http://localhost:3000/api/businesses/biz1/suppliers

Search suppliers:
curl "http://localhost:3000/api/businesses/biz1/suppliers?search=ABC"

Get supplier by ID:
curl http://localhost:3000/api/businesses/biz1/suppliers/sup1

Update supplier:

curl -X PUT http://localhost:3000/api/businesses/biz1/suppliers/sup1 \
-H "Content-Type: application/json" \
-d '{
"name": "ABC Wholesale Supply",
"phoneNumber": "9876543210",
"balance": 1500.00
}'

Delete supplier:
curl -X DELETE http://localhost:3000/api/businesses/biz1/suppliers/sup1

Create a transaction for supplier:
curl -X POST http://localhost:3000/api/businesses/biz1/transactions \
-H "Content-Type: application/json" \
-d '{
"id": "trans2",
"type": "OUT",
"amount": 500.00,
"supplierId": "sup1",
"description": "Purchase of inventory",
"date": "2023-12-20",
"category": "SUPPLIER"
}'
