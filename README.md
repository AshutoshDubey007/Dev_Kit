# DevKit Store - Verified Next.js Integration Marketplace

A curated marketplace for verified developer integration kits with built-in buyer-seller support chat and anti-leakage moderation.

---

## 📂 Architecture Overview (Separated Frontend & Backend)

```text
code-marketplace/
│
├── 📂 backend/                                   # Core Business Logic & Security Domain
│   ├── 📂 models/                                # MongoDB Schemas
│   │   ├── 📄 User.ts                            # Admin, Operator, User roles + Seller quotas
│   │   ├── 📄 Conversation.ts                    # Thread state & leak counters
│   │   └── 📄 Message.ts                         # Original audit log + filtered text
│   ├── 📂 auth/
│   │   └── 📄 roles.ts                           # Permission matrix (Admin, Operator, User)
│   └── 📂 chat/
│       ├── 📄 filter.ts                          # Anti-Contact-Leakage Shield (masks phone, email, wa, upi)
│       ├── 📄 service.ts                         # autoConnectBuyerSeller, message dispatch
│       └── 📄 operator.ts                        # Operator conversation audit & system notices
│
├── 📂 frontend/                                  # Next.js 15 App Router & Discovery Storefront
│   ├── 📂 app/                                   # Pages & API Route Handlers
│   │   ├── 📂 api/                               # API Server Routes
│   │   │   ├── 📂 chat/                          # Chat conversations & message endpoints
│   │   │   ├── 📂 operator/                      # Operator moderation endpoints
│   │   │   ├── 📂 checkout/                      # Razorpay orders & verification
│   │   │   └── 📂 download/                      # Token-gated code package delivery
│   │   ├── 📂 chat/[id]/page.tsx                 # Buyer-Seller Chat UI (with perspective switcher)
│   │   ├── 📂 operator/page.tsx                  # Operator Moderation Desk
│   │   ├── 📂 kits/                              # Catalog browse & Product Detail Pages
│   │   ├── 📂 order/success/page.tsx             # Order confirmation & instant seller chat link
│   │   ├── 📄 page.tsx                           # Homepage with Linear/Raycast design
│   │   ├── 📄 layout.tsx                         # Root layout
│   │   └── 📄 globals.css                        # Blueprint grid & dark theme tokens
│   ├── 📂 components/                            # UI Primitives & Discovery Components
│   │   ├── 📂 chat/chat-window.tsx               # Real-time chat box with anti-leak alerts
│   │   ├── 📂 checkout/checkout-modal.tsx        # Razorpay modal
│   │   ├── 📂 kits/                              # Kit cards, test badges, code previews
│   │   ├── 📂 search/                            # Instant search bar, filters, Cmd+K palette
│   │   └── 📂 ui/                                # Button, Card, Badge, Input primitives
│   ├── 📂 data/                                  # Verified kit mock definitions
│   ├── 📂 lib/                                   # Client search, utils, MongoDB client
│   ├── 📂 types/                                 # TypeScript data contracts
│   ├── 📄 package.json                           # Next.js 15 & React 19 dependencies
│   ├── 📄 tsconfig.json                          # Configured with @/* and @backend/* path aliases
│   ├── 📄 tailwind.config.ts                     # Tailwind dark theme configuration
│   └── 📄 .env.local                             # MongoDB Atlas connection string
│
└── 📄 package.json                               # Root workspace delegator
```

---

## 🚀 How to Run

### Option 1: Run from Root
```bash
cd e:\codebase\code-marketplace
npm run dev
```

### Option 2: Run directly inside Frontend
```bash
cd e:\codebase\code-marketplace\frontend
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser.
