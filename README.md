# 💎 LINEA - Jewelry Store Website

A modern, minimalistic **e-commerce jewelry website** built with React and Vite.  
This project focuses on a clean UI, seamless shopping experience, and persistent cart/checkout functionality.

---

## 🚀 Features

### 🛍️ Shopping Experience
- Browse products by categories (Rings, Earrings, Bracelets, Necklaces)
- “New In” collection showcase
- Clean product grid with pricing
- Minimal luxury-inspired UI design

### 🛒 Shopping Mode
- Add products to cart
- Persistent cart state (does not reset on refresh)
- Smooth checkout flow

### 💳 Checkout System
- Dedicated checkout page
- Order summary with pricing
- Ready for payment integration (extensible)

### 👤 Authentication
- User sign-in functionality
- Account-based shopping flow
- Backend-ready auth system (via Supabase)

### 🔄 State Persistence
- Cart and session persistence
- Maintains user flow across navigation

### 🎨 UI/UX
- Fully responsive layout
- Modern typography and spacing
- Clean, premium aesthetic (inspired by luxury brands)
- Smooth navigation and transitions

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite  
- **Styling:** Tailwind CSS  
- **Backend / Auth / DB:** Supabase  
- **State Management:** React Hooks / Context API  
- **Build Tool:** Vite  

---

## 📂 Project Structure
```
├── public/
├── src/
│ ├── components/
│ ├── pages/
│ ├── hooks/
│ ├── context/
│ ├── utils/
│
├── supabase/ # Supabase configuration
├── .env # Environment variables
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
```

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/linea-jewelry.git

# Navigate to project folder
cd linea-jewelry

# Install dependencies
npm install

# Run development server
npm run dev
