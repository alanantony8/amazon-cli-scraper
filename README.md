# 🛍️ Amazon CLI Scraper

A CLI-based Amazon scraper built with **TypeScript**, **Playwright**, and **Inquirer.js**.  
This tool lets you log in to Amazon, search products, handle OTP-based login, and scrape product data directly in your terminal.

---

## 📘 Features

- 🔐 Login to Amazon with username & password
- 🔑 OTP/MFA support with CLI input
- 🔎 Search Amazon by keyword
- 💰 Fetch product **name**, **price**, and **link**
- 🧼 Clean UI with filter support (if available)
- 🛒 (Coming Soon) View from your Purchase Orders

---

## ✅ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/alanantony8/amazon-cli-scraper.git
cd amazon-cli-scraper
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Program

```bash
npm run scrape
```

---

## 🚀 CLI Flow Summary

#### 1. Startup:

- CLI greets the user and asks for username and password.

#### 2. Login:

- Navigates to Amazon.in.
- Clicks on the Sign-In button.
- Fills in login credentials.
- Handles OTP input (if prompted).
- Displays an error if the OTP is invalid and exits.

#### 3. Post-login Options:

- Option 1: View from purchase orders (planned feature).
- Option 2: Search Amazon using a keyword.

#### 4. Search & Results:

- Prompts for a keyword.
- Scrapes top 10 results with price, name, and link.
- Displays available filter categories (if present).
- Allows filtering by category.


