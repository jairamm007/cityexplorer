const mongoose = require('mongoose');
require('dotenv').config();

async function checkDb(uri, label) {
    try {
        const conn = await mongoose.createConnection(uri).asPromise();
        const Attraction = conn.collection('attractions');
        const User = conn.collection('users');

        // Check if attractions contain the search strings
        const attractions = await Attraction.find({}).toArray();
        const matches = attractions.filter(a => 
            /srm/i.test(a.name) || /mall/i.test(a.name)
        );

        const users = await User.find({}).toArray();
        const userMatches = users.filter(u => 
            (u.email && /hi/i.test(u.email)) || (u.name && /hi/i.test(u.name))
        );

        console.log(`--- ${label} ---`);
        console.log('Attraction matches:', matches.length);
        matches.forEach(a => {
            console.log(JSON.stringify({
                db: label,
                name: a.name,
                cityId: a.cityId,
                createdBy: a.createdBy,
                location: a.location
            }, null, 2));
        });

        console.log('User matches:', userMatches.length);
        userMatches.forEach(u => {
            console.log(`User: ${u.email || u.name}, _id: ${u._id}`);
        });

        await conn.close();
    } catch (e) {
        console.error('Error in ' + label + ':', e.message);
    }
}

async function run() {
    await checkDb('mongodb://127.0.0.1:27017/cityexplorer', 'Local');
    await checkDb(process.env.MONGODB_URI, 'Atlas');
}
run();
