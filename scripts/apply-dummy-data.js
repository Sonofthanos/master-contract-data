const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dummyData = require('./dummy-data');

async function applyDummyData() {
  console.log('=== START APPLYING 50 DUMMY CONTRACTS ===');

  // 1. Update data/contracts-cache.json
  const cachePath = path.join(__dirname, '..', 'data', 'contracts-cache.json');
  fs.writeFileSync(cachePath, JSON.stringify(dummyData, null, 2), 'utf8');
  console.log(`[1/3] Successfully wrote 50 dummy records to: ${cachePath}`);

  // 2. Update Supabase
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

    if (urlMatch && keyMatch) {
      const url = urlMatch[1].trim();
      const key = keyMatch[1].trim();
      console.log(`[2/3] Connecting to Supabase at: ${url}...`);

      const supabase = createClient(url, key);

      // Clean existing rows
      console.log('Deleting existing records in Supabase contracts table...');
      const { error: delError } = await supabase
        .from('contracts')
        .delete()
        .neq('contract_number', 'NEVER_MATCH_ALL_DELETE');

      if (delError) {
        console.error('Failed to clean Supabase table:', delError);
      } else {
        console.log('Existing Supabase records cleaned successfully.');
      }

      // Insert dummy records in batch
      console.log('Inserting 50 dummy records into Supabase...');
      const { data, error: insertError } = await supabase
        .from('contracts')
        .insert(dummyData)
        .select('id, contract_number');

      if (insertError) {
        console.error('Failed to insert dummy records to Supabase:', insertError);
      } else {
        console.log(`Successfully inserted ${data.length} records into Supabase!`);
      }
    } else {
      console.log('[2/3] Supabase credentials not found in .env.local, skipped.');
    }
  }

  // 3. Verification
  console.log('[3/3] Verifying data stats...');
  const cacheContent = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  console.log(`Total in local cache: ${cacheContent.length}`);

  console.log('=== COMPLETED SUCCESSFULLY ===');
}

applyDummyData().catch(err => {
  console.error('Error applying dummy data:', err);
  process.exit(1);
});
