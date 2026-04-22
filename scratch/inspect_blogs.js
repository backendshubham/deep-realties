const db = require('../config/database');

async function inspectBlogs() {
  try {
    const columns = await db('blogs').columnInfo();
    console.log('Columns in blogs table:');
    console.log(JSON.stringify(columns, null, 2));
    
    const count = await db('blogs').count('id as cnt').first();
    console.log('Total blogs:', count.cnt);
    
    process.exit(0);
  } catch (error) {
    console.error('Error inspecting blogs table:', error);
    process.exit(1);
  }
}

inspectBlogs();
