const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Inserts seed entries
  await knex('users').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@deeprealties.in',
      password_hash: hashedPassword,
      full_name: 'Admin User',
      role: 'admin',
      is_active: true,
    }
  ]);
};

