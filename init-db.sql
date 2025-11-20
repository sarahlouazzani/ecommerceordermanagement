-- Initialisation des bases de données pour chaque microservice

-- Base Clients
CREATE SCHEMA IF NOT EXISTS clients;

-- Base Produits
CREATE SCHEMA IF NOT EXISTS products;

-- Base Commandes
CREATE SCHEMA IF NOT EXISTS orders;

-- Base Paiements
CREATE SCHEMA IF NOT EXISTS payments;

-- Base Factures
CREATE SCHEMA IF NOT EXISTS invoices;

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
