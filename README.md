# DeepRealties - Premium Real Estate Platform

A comprehensive real estate platform built with Node.js, Express, EJS, and PostgreSQL. DeepRealties connects buyers, sellers, and investors with premium properties, rentals, projects, and investment opportunities.

## 🏠 Features

### User Features
- **Property Listings**: Browse and search properties with advanced filters
- **Property Management**: Sellers can list, manage, and track their properties
- **Rental Properties**: Browse and search rental properties
- **Projects**: Explore upcoming real estate projects
- **Investment Opportunities**: Discover investment opportunities
- **Events**: Stay updated with real estate events
- **User Dashboard**: Manage your properties, enquiries, and profile
- **Dark/Light Theme**: Beautiful theme toggle for better user experience
- **Mobile Responsive**: Fully responsive design for all devices

### Admin Features
- **User Management**: View, manage, and control user accounts
- **Property Management**: Approve, reject, and manage property listings
- **Contact Submissions**: Manage and respond to contact form submissions
- **Analytics Dashboard**: View platform statistics and insights
- **Content Management**: Manage rentals, projects, and events

### Authentication & Security
- JWT-based authentication
- Role-based access control (Buyer, Seller, Admin)
- Secure password hashing with bcrypt
- Session management
- Rate limiting
- CORS protection
- Helmet security headers

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Template Engine**: EJS
- **Database**: PostgreSQL
- **ORM**: Knex.js
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS
- **Security**: Helmet, CORS, express-rate-limit
- **File Upload**: Multer

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "deep realties"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=deeprealties
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_SSL=false

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=ap-south-1
   S3_BUCKET_NAME=deeprealties-storage
   
   # Base URL
   BASE_URL=https://deeprealties.in
   ```

4. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE deeprealties;
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

6. **Seed the database (creates admin user)**
   ```bash
   npm run seed
   ```

   **Default Admin Credentials:**
   - Email: `admin@deeprealties.in`
   - Password: `Admin@123` (change after first login)

7. **Start the development server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin/dashboard

## 📁 Project Structure

```
deep-realties/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Business logic controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── contactController.js
│   ├── enquiryController.js
│   ├── eventController.js
│   ├── investmentController.js
│   ├── projectController.js
│   ├── propertyController.js
│   └── rentalController.js
├── middleware/              # Express middleware
│   ├── admin.js            # Admin role verification
│   ├── auth.js             # JWT authentication
│   └── errorHandler.js     # Error handling
├── migrations/              # Database migrations
│   ├── 001_create_users.js
│   ├── 002_create_properties.js
│   ├── 003_create_rental_properties.js
│   └── ...
├── routes/                  # API routes
│   ├── admin.js
│   ├── auth.js
│   ├── contact.js
│   ├── enquiries.js
│   ├── events.js
│   ├── investments.js
│   ├── projects.js
│   ├── properties.js
│   └── rentals.js
├── seeds/                   # Database seeds
│   └── 001_admin_user.js
├── utils/                   # Utility functions
│   ├── helpers.js
│   └── validators.js
├── views/                   # EJS templates
│   ├── layouts/
│   │   └── main.ejs        # Main layout
│   ├── pages/               # Page templates
│   │   ├── admin/          # Admin pages
│   │   ├── home.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── dashboard.ejs
│   │   ├── my-properties.ejs
│   │   └── ...
│   └── partials/           # Reusable components
│       ├── navbar.ejs
│       └── footer.ejs
├── public/                 # Static files
│   └── uploads/            # Uploaded files
├── server.js               # Main server file
├── knexfile.js             # Knex configuration
└── package.json            # Dependencies
```

## 👥 User Roles

### Buyer
- Browse and search properties
- View property details
- Submit enquiries
- Manage enquiries
- View investment opportunities

### Seller
- List properties for sale
- Manage own properties
- View enquiries on their properties
- Track property status (pending/approved/rejected)

### Admin
- Full access to admin dashboard
- Manage all users
- Approve/reject properties
- Manage contact submissions
- View platform analytics
- Manage content (rentals, projects, events)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Properties
- `GET /api/properties` - List all properties (with filters)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property (authenticated)
- `GET /api/properties/my-properties/list` - Get user's properties (authenticated)
- `PUT /api/properties/:id` - Update property (authenticated)
- `DELETE /api/properties/:id` - Delete property (authenticated)

### Admin APIs
See [ADMIN_API_DOCUMENTATION.md](./ADMIN_API_DOCUMENTATION.md) for complete admin API documentation.

## 🎨 Theme System

The application supports both light and dark themes:
- Theme preference is saved in localStorage
- Smooth transitions between themes
- Theme-aware components (modals, toasts, loaders)
- Automatic theme detection based on system preferences

## 📱 Mobile Responsiveness

The platform is fully responsive with:
- Mobile-first design approach
- Hamburger menu for mobile navigation
- Touch-friendly interface
- Optimized layouts for all screen sizes

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries via Knex.js

## 📝 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run migrate:rollback` - Rollback last migration
- `npm run migrate:reset` - Reset database (rollback all + migrate + seed)
- `npm run seed` - Run database seeds

## 🗄️ Database Schema

### Main Tables
- `users` - User accounts (buyers, sellers, admins)
- `properties` - Property listings
- `rental_properties` - Rental property listings
- `projects` - Real estate projects
- `events` - Real estate events
- `investment_opportunities` - Investment opportunities
- `contact_submissions` - Contact form submissions
- `enquiries` - Property enquiries
- `property_requirements` - Buyer requirements

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists: `CREATE DATABASE deeprealties;`

### Migration Issues
- Reset database: `npm run migrate:reset`
- Check migration status in `knex_migrations` table

### Authentication Issues
- Clear browser localStorage
- Verify JWT_SECRET is set in `.env`
- Check token expiration settings

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3000

## 📚 Documentation

- [Admin API Documentation](./ADMIN_API_DOCUMENTATION.md) - Complete admin API reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

DeepRealties Development Team

## 🙏 Acknowledgments

- Express.js community
- Tailwind CSS for styling
- PostgreSQL community
- All contributors and users

---

**Note**: Make sure to change the default admin password after first login for security purposes.
