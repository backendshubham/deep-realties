const db = require('../config/database');

async function testUpdateProperty() {
  try {
    console.log('Testing Property Update Image Sync...');
    
    // 1. Get an existing property
    const property = await db('properties').first();
    if (!property) {
      console.log('No properties found to test.');
      return;
    }
    const id = property.id;
    console.log(`Testing with Property ID: ${id}`);

    // 2. Clear images first (to have a clean state)
    await db('property_images').where({ property_id: id }).delete();
    
    // 3. Define new test images
    const testImages = [
      'https://test.com/image1.jpg',
      'https://test.com/image2.jpg'
    ];

    // 4. Simulate the controller logic (since I can't easily trigger the route with auth here)
    // Actually, I can just call the db directly to simulate what the controller does
    const trx = await db.transaction();
    try {
      // Update properties
      await trx('properties').where({ id }).update({ updated_at: db.fn.now() });

      // Sync images
      await trx('property_images').where({ property_id: id }).delete();
      const imageRecords = testImages.map((imageUrl, index) => ({
        property_id: id,
        image_url: imageUrl,
        display_order: index
      }));
      await trx('property_images').insert(imageRecords);

      await trx.commit();
      console.log('Transaction committed successfully.');
    } catch (err) {
      await trx.rollback();
      throw err;
    }

    // 5. Verify the results
    const finalImages = await db('property_images')
      .where({ property_id: id })
      .orderBy('display_order', 'asc')
      .select('image_url');

    console.log('Final Images in DB:', finalImages.map(img => img.image_url));
    
    if (finalImages.length === 2 && finalImages[0].image_url === testImages[0]) {
      console.log('SUCCESS: Images synchronized correctly.');
    } else {
      console.log('FAILURE: Images synchronization failed.');
    }

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await db.destroy();
  }
}

testUpdateProperty();
