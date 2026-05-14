# ClientFlow — Client & Project Management Panel

Yazılım şirketleri için müşteri ve proje yönetim paneli.

**Live Demo:** [[Vercel URL](https://client-flow-blush-two.vercel.app/login)]  
**Backend API:** [https://clientflow-backend-12lm.onrender.com/api]
**Swagger UI:** [https://clientflow-backend-12lm.onrender.com/api](https://clientflow-backend-12lm.onrender.com/api/docs)

---

## 🖥️ Ekran Görüntüleri

| Dashboard | Müşteriler | Projeler |
|-----------|-----------|---------|
| <img width="2940" height="1622" alt="Image" src="https://github.com/user-attachments/assets/e3bbca33-1fd6-46cb-8405-2037eac30a18" /> | <img width="2940" height="1622" alt="Image" src="https://github.com/user-attachments/assets/1b9c0158-2fb9-49c9-b025-85d28a908750" /> | <img width="2940" height="1622" alt="Image" src="https://github.com/user-attachments/assets/2faa1d59-ce74-4c33-a045-b453af6f4ffb" /> |

---

## 🚀 Özellikler

- **JWT Kimlik Doğrulama** — Admin ve Manager rol tabanlı erişim
- **Müşteri Yönetimi** — CRUD işlemleri, arama, sektör filtreleme
- **Proje Yönetimi** — Durum takibi, bütçe, ekip üyesi atama
- **Dashboard** — Aylık bütçe trendi, durum dağılımı, özet istatistikler
- **Responsive Tasarım** — Mobil hamburger menü, masaüstü sidebar
- **Gerçek Zamanlı Filtreleme** — Durum ve müşteriye göre proje filtreleme

---

## 🛠️ Teknoloji Yığını

### Backend
- **NestJS** — Node.js framework
- **TypeORM** — ORM
- **PostgreSQL** — Veritabanı
- **Passport JWT** — Kimlik doğrulama
- **class-validator** — DTO validasyonu

### Frontend
- **Next.js 14** — React framework (App Router)
- **TailwindCSS v3** — Stil
- **TanStack Query v5** — Server state yönetimi
- **Zustand** — Client state (auth)
- **React Hook Form + Zod** — Form validasyonu
- **Recharts** — Grafikler
- **Lucide React** — İkonlar

### DevOps
- **Docker & Docker Compose** — Lokal geliştirme
- **Render** — Backend hosting
- **Vercel** — Frontend hosting
- **Railway** — PostgreSQL veritabanı

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/auth/login | Kullanıcı girişi |
| POST | /api/auth/register | Yeni kullanıcı (Admin) |
| GET | /api/auth/me | Mevcut kullanıcı |

### Clients
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/clients | Liste (?search=) |
| POST | /api/clients | Yeni müşteri |
| GET | /api/clients/:id | Detay |
| PUT | /api/clients/:id | Güncelle |
| DELETE | /api/clients/:id | Sil |

### Projects
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/projects | Liste (?status=&clientId=&search=) |
| POST | /api/projects | Yeni proje |
| GET | /api/projects/:id | Detay |
| PUT | /api/projects/:id | Güncelle |
| DELETE | /api/projects/:id | Sil |

### Dashboard
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/dashboard/stats | Özet istatistikler |
| GET | /api/dashboard/timeline | 12 aylık trend |

---

## 🔐 Demo Hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@demo.com | demo1234 |
| Manager | manager@demo.com | demo1234 |

---

## 💻 Lokal Geliştirme

### Docker ile (Önerilen)

```bash
git clone https://github.com/OzanSonmez37/Client-Flow
cd Client-Flow

docker compose up -d
docker exec client_pm_backend node seed.js
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api

### Manuel

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run start:dev

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Ortam Değişkenleri

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=4001
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=clientflow2
JWT_SECRET=clientflow2-secret-key
FRONTEND_URL=http://localhost:3001
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api
```

---

## 📁 Proje Yapısı

```
Client-Flow/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── auth/             # JWT auth, kullanıcı yönetimi
│   │   ├── clients/          # Müşteri CRUD
│   │   ├── projects/         # Proje CRUD
│   │   ├── dashboard/        # İstatistik & timeline
│   │   └── common/           # Guards, filters, decorators
│   └── seed.js               # Demo veri yükleyici
├── frontend/                 # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/        # Giriş sayfası
│   │   │   ├── dashboard/    # Ana panel
│   │   │   ├── clients/      # Müşteri sayfaları
│   │   │   └── projects/     # Proje sayfaları
│   │   ├── components/       # Ortak bileşenler
│   │   ├── lib/              # API client, utils
│   │   ├── store/            # Zustand store
│   │   └── types/            # TypeScript tipleri
└── docker-compose.yml
```

---

## 🗄️ Veritabanı Şeması

```
users                clients              projects
─────────            ────────             ────────
id (uuid)            id (uuid)            id (uuid)
email                name                 title
name                 email                description
password             phone                status (enum)
role (enum)          industry             budget
isActive             website              startDate
createdAt            notes                endDate
updatedAt            isActive             teamMembers[]
                     createdAt            priority
                     updatedAt            clientId (FK)
                                          createdAt
                                          updatedAt
```
