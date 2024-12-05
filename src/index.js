// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import { config } from "./config/config.js";
// import { setupDatabase } from "./database/setup.js";
// import businessRoutes from "./routes/businessRoutes.js";
// import customerRoutes from "./routes/customerRoutes.js";
// import supplierRoutes from "./routes/supplierRoutes.js";
// import transactionRoutes from "./routes/transactionRoutes.js";

// const app = express();

// // Middleware
// app.use(cors());
// app.use(helmet());
// app.use(morgan("dev"));
// app.use(express.json());

// // Initialize database
// setupDatabase();

// // Root route
// app.get("/", (req, res) => {
//   res.json({
//     message: "Welcome to Cashbook API",
//     version: "1.0.0",
//     endpoints: {
//       businesses: "/api/businesses",
//       customers: "/api/businesses/:businessId/customers",
//       suppliers: "/api/businesses/:businessId/suppliers",
//       transactions: "/api/businesses/:businessId/transactions",
//       analytics: "/api/businesses/:businessId/analytics",
//     },
//   });
// });

// // Routes
// app.use("/api/businesses", businessRoutes);
// app.use("/api/businesses", customerRoutes);
// app.use("/api/businesses", supplierRoutes);
// app.use("/api/businesses", transactionRoutes);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: "Something went wrong!" });
// });

// app.listen(config.port, () => {
//   console.log(`Server running at http://localhost:${config.port}`);
// });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/config.js";
import { setupDatabase } from "./database/setup.js";
import { authenticateToken } from "./middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Initialize database
setupDatabase();

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/businesses", authenticateToken, businessRoutes);
app.use("/api/businesses", authenticateToken, customerRoutes);
app.use("/api/businesses", authenticateToken, supplierRoutes);
app.use("/api/businesses", authenticateToken, transactionRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Cashbook API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "/api/auth/register",
        login: "/api/auth/login",
        me: "/api/auth/me",
      },
      businesses: "/api/businesses",
      customers: "/api/businesses/:businessId/customers",
      suppliers: "/api/businesses/:businessId/suppliers",
      transactions: "/api/businesses/:businessId/transactions",
      analytics: "/api/businesses/:businessId/analytics",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
