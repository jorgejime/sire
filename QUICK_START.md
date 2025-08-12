# USM-IA Quick Start Guide

## One-Command Setup

This project now includes **complete automated setup**. No manual configuration needed!

### 🚀 Get Started in 30 seconds

1. **Run the automated setup:**
   ```bash
   npm run setup
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Open http://localhost:5173
   - Login with any of the credentials below

That's it! The system is fully configured and ready to use.

## 🔐 Login Credentials

The setup automatically creates these users:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `admin@usm.cl` | `admin123456` | Administrator | Full system access |
| `coordinador@usm.cl` | `coord123456` | Coordinator | Academic coordination |
| `consejero@usm.cl` | `consejero123` | Counselor | Student support |
| `estudiante1@usm.cl` | `estudiante123` | Student | Sample student 1 |
| `estudiante2@usm.cl` | `estudiante123` | Student | Sample student 2 |
| `estudiante3@usm.cl` | `estudiante123` | Student | Sample student 3 |

## 📊 What Gets Created Automatically

The setup script configures everything:

✅ **Database Schema** - Complete PostgreSQL schema with all tables  
✅ **Sample Data** - Students, grades, attendance, alerts  
✅ **Authentication** - Users with proper roles and permissions  
✅ **Security** - Row Level Security (RLS) policies  
✅ **AI Predictions** - Risk scores and recommendations  
✅ **Chat System** - Sample conversations  
✅ **TypeScript Types** - Auto-generated database types  
✅ **Environment** - All configuration files  

## 🧪 Validation

To verify everything is working correctly:

```bash
npm run validate
```

This runs comprehensive tests on all system components.

## 🔧 Advanced Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Complete automated setup |
| `npm run validate` | Validate setup integrity |
| `npm run setup:validate` | Setup + validation in one command |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |

## 🎯 System Features

After setup, you'll have access to:

- **Dashboard** - Real-time analytics and metrics
- **Student Management** - Complete student profiles
- **Alert System** - Academic and behavioral alerts  
- **AI Predictions** - Risk analysis and recommendations
- **Chat Bot** - AI-powered student support
- **Interventions** - Targeted support programs
- **Reports** - Comprehensive analytics

## 🆘 Troubleshooting

If something doesn't work:

1. **Re-run setup:** `npm run setup`
2. **Validate setup:** `npm run validate`
3. **Check logs** for specific errors
4. **Verify environment** - ensure .env file exists

The setup is designed to be **idempotent** - you can run it multiple times safely.

## 🔄 Reset Everything

To start completely fresh:

1. Delete `.env` file
2. Run `npm run setup` again

## 💡 Technical Notes

- Uses **Supabase** for backend infrastructure
- **PostgreSQL** database with advanced features
- **Row Level Security** for data protection
- **Real-time subscriptions** for live updates
- **AI integration** with Google Gemini
- **TypeScript** for type safety

## 📞 Support

For issues or questions:
- Check the validation output: `npm run validate`
- Review setup logs for specific errors
- Ensure all dependencies are installed: `npm install`

---

**🎉 Welcome to USM-IA! Your intelligent student retention system is ready to use.**