import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// For local testing, download your service account key and place it at 'serviceAccountKey.json'
const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Initialized with Service Account Key.");
} else {
    console.warn("Service account key not found. Initializing with default credentials.");
    admin.initializeApp();
}

const db = admin.firestore();
const items = require('./items.json');

async function seedItems() {
    console.log("Starting to seed items...");
    const batch = db.batch();
    const itemsRef = db.collection('items');
    
    let count = 0;
    for (const item of items) {
        const docRef = itemsRef.doc(item.id);
        batch.set(docRef, item);
        count++;
    }
    
    await batch.commit();
    console.log(`Successfully seeded ${count} items.`);
}

seedItems().catch(console.error);
