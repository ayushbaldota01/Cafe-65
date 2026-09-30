const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ozgnhfsveibggugoohbd.supabase.co';
const supabaseKey = 'sb_publishable_cd10rUGNZCm84UVT95ZxYA_sUPowqjy';
const supabase = createClient(supabaseUrl, supabaseKey);

const imageMap = {
  'Coffee': 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400',
  'Toast & Breads': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400',
  'Tea & Maska': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
  'Small Bites': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&q=80&w=400',
  'Maggi': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=400',
  'Pasta': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
  'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
  'Fries': 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=400',
  'Milkshakes': 'https://images.unsplash.com/photo-1572490122747-3968b75bb69c?auto=format&fit=crop&q=80&w=400',
  'Iced Coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400'
};

const filePath = 'customer-app/src/lib/dummyData.ts';
let content = fs.readFileSync(filePath, 'utf8');

const match = content.match(/export const dummyItems: Item\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.log("Could not find dummyItems array");
  process.exit(1);
}

// Simple text replacement to update image_url based on category in the file
let updatedContent = content;
for (const [category, url] of Object.entries(imageMap)) {
  const regex = new RegExp(`("category": "${category}",\\s*"description": ".*?",\\s*"base_price": \\d+,\\s*"image_url":\\s*)"[^"]*"`, 'g');
  updatedContent = updatedContent.replace(regex, `$1"${url}"`);
}

fs.writeFileSync(filePath, updatedContent);
console.log("Updated dummyData.ts with new images");

async function seedSupabase() {
  // Re-read and parse to seed supabase
  const newMatch = updatedContent.match(/export const dummyItems: Item\[\] = (\[[\s\S]*?\]);/);
  const items = eval(newMatch[1]);
  
  console.log(`Seeding ${items.length} items to Supabase...`);
  
  for (const item of items) {
    const { id, name, description, base_price, category, image_url, is_available, variants, variant_type, addons } = item;
    const { error } = await supabase.from('items').upsert({
      id,
      name,
      description,
      base_price,
      category,
      is_veg: true, // default
      image_url,
      is_available,
      variants,
      variant_type,
      addons
    });
    if (error) console.error("Error upserting", name, error);
  }
  console.log("Supabase seed complete!");
}

seedSupabase();
