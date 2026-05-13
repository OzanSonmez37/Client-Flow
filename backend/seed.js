const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'clientflow2',
  entities: [__dirname + '/dist/**/*.entity.js'],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('DB connected');

  const adminExists = await AppDataSource.query(
    "SELECT id FROM users WHERE email = 'admin@demo.com' LIMIT 1"
  ).catch(() => []);

  if (adminExists.length === 0) {
    const adminPass = await bcrypt.hash('demo1234', 12);
    const managerPass = await bcrypt.hash('demo1234', 12);

    await AppDataSource.query(`
      INSERT INTO users (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), 'admin@demo.com', 'Admin Kullanici', '${adminPass}', 'admin', true, now(), now()),
        (gen_random_uuid(), 'manager@demo.com', 'Proje Yoneticisi', '${managerPass}', 'manager', true, now(), now())
    `);
    console.log('Users created');
  } else {
    console.log('Users already exist');
  }

  const clientsExist = await AppDataSource.query('SELECT id FROM clients LIMIT 1').catch(() => []);

  if (clientsExist.length === 0) {
    await AppDataSource.query(`
      INSERT INTO clients (id, name, email, phone, industry, website, "isActive", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), 'Teknoloji AS', 'info@teknolojiAS.com', '+90 212 555 0001', 'Teknoloji', 'https://teknolojiAS.com', true, now(), now()),
        (gen_random_uuid(), 'Finans Grubu', 'contact@finansgrubu.com', '+90 212 555 0002', 'Finans', null, true, now(), now()),
        (gen_random_uuid(), 'E-Ticaret Ltd', 'hello@eticaretltd.com', '+90 212 555 0003', 'E-ticaret', null, true, now(), now()),
        (gen_random_uuid(), 'Saglik Sistemleri', 'info@sagliksistem.com', '+90 212 555 0004', 'Saglik', null, true, now(), now()),
        (gen_random_uuid(), 'Medya Holding', 'iletisim@medyaholding.com', null, 'Medya', null, true, now(), now())
    `);
    console.log('Clients created');

    const clients = await AppDataSource.query('SELECT id, name FROM clients ORDER BY name');
    const c = {};
    clients.forEach(cl => c[cl.name] = cl.id);

    await AppDataSource.query(`
      INSERT INTO projects (id, title, description, status, budget, "startDate", "endDate", "teamMembers", priority, "clientId", "createdAt", "updatedAt")
      VALUES 
        (gen_random_uuid(), 'Kurumsal Web Sitesi', 'Web sitesi yenileme', 'development', 85000, '2024-01-15', '2024-04-30', 'Ahmet Yilmaz,Elif Kaya', 'high', '${c['Teknoloji AS']}', now(), now()),
        (gen_random_uuid(), 'Mobil Bankacilik', 'iOS ve Android uygulama', 'testing', 320000, '2023-09-01', '2024-06-30', 'Ayse Sahin,Burak Oz', 'high', '${c['Finans Grubu']}', now(), now()),
        (gen_random_uuid(), 'E-Ticaret Entegrasyon', 'Odeme entegrasyonu', 'planning', 150000, '2024-03-01', '2024-09-30', 'Emre Celik', 'medium', '${c['E-Ticaret Ltd']}', now(), now()),
        (gen_random_uuid(), 'Hasta Takip Sistemi', 'Hasta kayit sistemi', 'development', 200000, '2024-02-01', '2024-08-31', 'Gul Aydin,Hakan Dogan', 'high', '${c['Saglik Sistemleri']}', now(), now()),
        (gen_random_uuid(), 'Icerik Yonetimi', 'Multi-platform icerik', 'completed', 75000, '2023-06-01', '2023-12-31', 'Jale Koc', 'low', '${c['Medya Holding']}', now(), now())
    `);
    console.log('Projects created');
  } else {
    console.log('Clients already exist');
  }

  await AppDataSource.destroy();
  console.log('\nSeed complete!');
  console.log('  admin@demo.com   / demo1234');
  console.log('  manager@demo.com / demo1234');
}

seed().catch((e) => { console.error(e); process.exit(1); });