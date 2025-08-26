const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Création d\'un utilisateur administrateur...');

    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà:', existingAdmin.email);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nom:', existingAdmin.firstName, existingAdmin.lastName);
      return;
    }

    // Données de l'admin par défaut
    const adminData = {
      email: 'admin@wemoov.com',
      phone: '+221701234567',
      firstName: 'Admin',
      lastName: 'WeMoov',
      password: 'admin123',
      role: 'ADMIN'
    };

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        phone: adminData.phone,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        password: hashedPassword,
        role: adminData.role,
        isActive: true
      }
    });

    console.log('✅ Administrateur créé avec succès!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe:', adminData.password);
    console.log('👤 Nom:', admin.firstName, admin.lastName);
    console.log('🆔 ID:', admin.id);
    console.log('');
    console.log('🌐 Vous pouvez maintenant vous connecter au dashboard:');
    console.log('   URL: http://localhost:5173/admin/login');
    console.log('   Email: admin@wemoov.com');
    console.log('   Mot de passe: admin123');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    
    if (error.code === 'P2002') {
      console.log('⚠️  Un utilisateur avec cet email ou ce téléphone existe déjà.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
createAdmin();