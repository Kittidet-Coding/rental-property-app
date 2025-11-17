import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'rental_app',
});

const hungarianProperties = [
  // Budapest - District 1 (Castle District)
  { title: 'Elegant Studio in Castle District', city: 'Budapest', country: 'Hungary', address: '1 Tarnok Street', zipCode: '1014', price: 1200, beds: 0, baths: 1, sqm: 35, type: 'studio', description: 'Charming studio apartment in the heart of Budapest\'s historic Castle District with stunning views.', petFriendly: false, parking: false },
  { title: 'Luxury 2BR Apartment with Danube View', city: 'Budapest', country: 'Hungary', address: '5 Szentharomsag Street', zipCode: '1014', price: 2500, beds: 2, baths: 2, sqm: 95, type: 'apartment', description: 'Premium 2-bedroom apartment overlooking the Danube River in the prestigious Castle District.', petFriendly: true, parking: true },
  { title: 'Cozy 1BR Near Matthias Church', city: 'Budapest', country: 'Hungary', address: '8 Miklos Street', zipCode: '1014', price: 1500, beds: 1, baths: 1, sqm: 50, type: 'apartment', description: 'Intimate 1-bedroom apartment steps away from the iconic Matthias Church.', petFriendly: false, parking: false },
  
  // Budapest - District 5 (Belváros)
  { title: 'Modern Studio in City Center', city: 'Budapest', country: 'Hungary', address: '12 Vaci Street', zipCode: '1052', price: 1100, beds: 0, baths: 1, sqm: 40, type: 'studio', description: 'Contemporary studio apartment on the famous Vaci Street shopping district.', petFriendly: false, parking: false },
  { title: '3BR Family Apartment Downtown', city: 'Budapest', country: 'Hungary', address: '25 Petőfi Street', zipCode: '1052', price: 2800, beds: 3, baths: 2, sqm: 120, type: 'apartment', description: 'Spacious 3-bedroom apartment perfect for families in the heart of Budapest.', petFriendly: true, parking: true },
  { title: 'Renovated 1BR with Balcony', city: 'Budapest', country: 'Hungary', address: '18 Szerb Street', zipCode: '1052', price: 1400, beds: 1, baths: 1, sqm: 55, type: 'apartment', description: 'Recently renovated 1-bedroom apartment with a private balcony overlooking the street.', petFriendly: false, parking: false },
  { title: 'Luxury Penthouse 2BR', city: 'Budapest', country: 'Hungary', address: '42 Apaczai Street', zipCode: '1052', price: 3200, beds: 2, baths: 2, sqm: 110, type: 'apartment', description: 'High-end penthouse apartment with panoramic city views and premium amenities.', petFriendly: true, parking: true },
  
  // Budapest - District 6 (Terézváros)
  { title: 'Bright 1BR Near Andrássy Avenue', city: 'Budapest', country: 'Hungary', address: '15 Paulay Street', zipCode: '1061', price: 1350, beds: 1, baths: 1, sqm: 52, type: 'apartment', description: 'Well-lit 1-bedroom apartment close to the famous Andrássy Avenue.', petFriendly: false, parking: false },
  { title: '2BR Apartment with Garden Access', city: 'Budapest', country: 'Hungary', address: '8 Jozsef Attila Street', zipCode: '1061', price: 2100, beds: 2, baths: 1, sqm: 85, type: 'apartment', description: 'Spacious 2-bedroom apartment with access to a shared garden courtyard.', petFriendly: true, parking: false },
  { title: 'Studio Near Oktogon Square', city: 'Budapest', country: 'Hungary', address: '22 Terez Boulevard', zipCode: '1061', price: 1050, beds: 0, baths: 1, sqm: 38, type: 'studio', description: 'Compact studio apartment near the vibrant Oktogon Square.', petFriendly: false, parking: false },
  
  // Budapest - District 7 (Erzsébetváros)
  { title: 'Trendy 1BR in Jewish Quarter', city: 'Budapest', country: 'Hungary', address: '10 Kazinczy Street', zipCode: '1075', price: 1300, beds: 1, baths: 1, sqm: 48, type: 'apartment', description: 'Hip 1-bedroom apartment in the vibrant Jewish Quarter with nearby bars and restaurants.', petFriendly: false, parking: false },
  { title: '2BR Loft with High Ceilings', city: 'Budapest', country: 'Hungary', address: '5 Dob Street', zipCode: '1075', price: 2200, beds: 2, baths: 1, sqm: 92, type: 'apartment', description: 'Industrial-style 2-bedroom loft with characteristic high ceilings.', petFriendly: true, parking: false },
  { title: 'Charming Studio with Exposed Brick', city: 'Budapest', country: 'Hungary', address: '18 Rumbach Street', zipCode: '1075', price: 1150, beds: 0, baths: 1, sqm: 42, type: 'studio', description: 'Charming studio apartment featuring original exposed brick walls.', petFriendly: false, parking: false },
  { title: '3BR Family Home in Quiet Area', city: 'Budapest', country: 'Hungary', address: '12 Wesselenyi Street', zipCode: '1075', price: 2600, beds: 3, baths: 2, sqm: 115, type: 'apartment', description: 'Comfortable 3-bedroom apartment in a quieter part of the district.', petFriendly: true, parking: true },
  
  // Budapest - District 8 (Jozsefvaros)
  { title: 'Budget-Friendly Studio', city: 'Budapest', country: 'Hungary', address: '25 Baross Street', zipCode: '1082', price: 850, beds: 0, baths: 1, sqm: 32, type: 'studio', description: 'Affordable studio apartment perfect for students and young professionals.', petFriendly: false, parking: false },
  { title: '2BR Apartment Near Corvin Cinema', city: 'Budapest', country: 'Hungary', address: '35 Corvin Plaza', zipCode: '1082', price: 1900, beds: 2, baths: 1, sqm: 78, type: 'apartment', description: 'Spacious 2-bedroom apartment near the iconic Corvin Cinema.', petFriendly: true, parking: false },
  { title: '1BR with Modern Kitchen', city: 'Budapest', country: 'Hungary', address: '42 Miklos Street', zipCode: '1082', price: 1200, beds: 1, baths: 1, sqm: 50, type: 'apartment', description: '1-bedroom apartment featuring a fully equipped modern kitchen.', petFriendly: false, parking: false },
  
  // Budapest - District 9 (Ferencvaros)
  { title: 'Riverside Studio with Balcony', city: 'Budapest', country: 'Hungary', address: '8 Soroksari Street', zipCode: '1092', price: 1250, beds: 0, baths: 1, sqm: 44, type: 'studio', description: 'Studio apartment with a balcony overlooking the Danube River.', petFriendly: false, parking: false },
  { title: '2BR Apartment with Parking', city: 'Budapest', country: 'Hungary', address: '15 Gizella Street', zipCode: '1092', price: 2050, beds: 2, baths: 1, sqm: 82, type: 'apartment', description: 'Comfortable 2-bedroom apartment with dedicated parking space.', petFriendly: true, parking: true },
  { title: 'Spacious 3BR Family Home', city: 'Budapest', country: 'Hungary', address: '22 Mester Street', zipCode: '1092', price: 2750, beds: 3, baths: 2, sqm: 125, type: 'apartment', description: 'Large 3-bedroom apartment ideal for families with children.', petFriendly: true, parking: true },
  
  // Budapest - District 11 (Ujbuda)
  { title: 'Modern 1BR with Gym Access', city: 'Budapest', country: 'Hungary', address: '10 Bartok Bela Street', zipCode: '1114', price: 1400, beds: 1, baths: 1, sqm: 58, type: 'apartment', description: '1-bedroom apartment in a modern building with gym and wellness facilities.', petFriendly: false, parking: true },
  { title: '2BR Apartment Near Gellert Hill', city: 'Budapest', country: 'Hungary', address: '28 Kelenhegyi Street', zipCode: '1114', price: 2150, beds: 2, baths: 1, sqm: 88, type: 'apartment', description: 'Scenic 2-bedroom apartment with views towards Gellert Hill.', petFriendly: true, parking: true },
  { title: 'Cozy Studio in Residential Area', city: 'Budapest', country: 'Hungary', address: '5 Szonyi Street', zipCode: '1114', price: 950, beds: 0, baths: 1, sqm: 36, type: 'studio', description: 'Quiet studio apartment in a peaceful residential neighborhood.', petFriendly: false, parking: false },
  { title: '3BR House with Garden', city: 'Budapest', country: 'Hungary', address: '18 Karolyi Street', zipCode: '1114', price: 3100, beds: 3, baths: 2, sqm: 130, type: 'house', description: 'Charming 3-bedroom house with a private garden in Ujbuda.', petFriendly: true, parking: true },
  
  // Budapest - District 12 (Hegyvidek)
  { title: 'Villa-Style 2BR Apartment', city: 'Budapest', country: 'Hungary', address: '12 Zugligeti Street', zipCode: '1121', price: 2400, beds: 2, baths: 2, sqm: 105, type: 'apartment', description: 'Elegant 2-bedroom apartment in a villa-style building with mountain views.', petFriendly: true, parking: true },
  { title: 'Luxury 3BR with Terrace', city: 'Budapest', country: 'Hungary', address: '8 Pasareti Street', zipCode: '1121', price: 3500, beds: 3, baths: 2, sqm: 140, type: 'apartment', description: 'Premium 3-bedroom apartment with a spacious terrace and garden access.', petFriendly: true, parking: true },
  { title: '1BR Apartment with City View', city: 'Budapest', country: 'Hungary', address: '25 Orsod Street', zipCode: '1121', price: 1600, beds: 1, baths: 1, sqm: 62, type: 'apartment', description: '1-bedroom apartment with panoramic views of Budapest from the hills.', petFriendly: false, parking: true },
  
  // Debrecen - Hungary's second largest city
  { title: 'Modern Studio in City Center', city: 'Debrecen', country: 'Hungary', address: '5 Piac Street', zipCode: '4025', price: 700, beds: 0, baths: 1, sqm: 35, type: 'studio', description: 'Contemporary studio apartment in the heart of Debrecen\'s downtown.', petFriendly: false, parking: false },
  { title: '2BR Apartment Near Great Church', city: 'Debrecen', country: 'Hungary', address: '12 Kalvin Street', zipCode: '4025', price: 1400, beds: 2, baths: 1, sqm: 75, type: 'apartment', description: 'Spacious 2-bedroom apartment close to the famous Great Church.', petFriendly: true, parking: false },
  { title: '1BR with Balcony Downtown', city: 'Debrecen', country: 'Hungary', address: '18 Szechenyi Street', zipCode: '4025', price: 900, beds: 1, baths: 1, sqm: 48, type: 'apartment', description: '1-bedroom apartment with a balcony in the downtown area.', petFriendly: false, parking: false },
  { title: '3BR Family Apartment', city: 'Debrecen', country: 'Hungary', address: '22 Bethlen Street', zipCode: '4026', price: 1800, beds: 3, baths: 2, sqm: 105, type: 'apartment', description: 'Large 3-bedroom apartment perfect for families in Debrecen.', petFriendly: true, parking: true },
  { title: 'Cozy Studio Near University', city: 'Debrecen', country: 'Hungary', address: '8 Egyetem Street', zipCode: '4032', price: 650, beds: 0, baths: 1, sqm: 32, type: 'studio', description: 'Affordable studio apartment near the University of Debrecen.', petFriendly: false, parking: false },
  
  // Szeged - Southern Hungary
  { title: 'Riverside Studio Apartment', city: 'Szeged', country: 'Hungary', address: '10 Tisza Street', zipCode: '6720', price: 750, beds: 0, baths: 1, sqm: 38, type: 'studio', description: 'Charming studio apartment overlooking the Tisza River.', petFriendly: false, parking: false },
  { title: '2BR Apartment in Historic Center', city: 'Szeged', country: 'Hungary', address: '15 Klauzal Street', zipCode: '6720', price: 1350, beds: 2, baths: 1, sqm: 72, type: 'apartment', description: 'Spacious 2-bedroom apartment in Szeged\'s historic city center.', petFriendly: true, parking: false },
  { title: '1BR Near Cathedral', city: 'Szeged', country: 'Hungary', address: '5 Dohm Street', zipCode: '6720', price: 850, beds: 1, baths: 1, sqm: 45, type: 'apartment', description: '1-bedroom apartment within walking distance of the Cathedral.', petFriendly: false, parking: false },
  { title: '3BR House with Yard', city: 'Szeged', country: 'Hungary', address: '28 Pal Street', zipCode: '6721', price: 1950, beds: 3, baths: 2, sqm: 110, type: 'house', description: 'Charming 3-bedroom house with a private yard in Szeged.', petFriendly: true, parking: true },
  
  // Pécs - Southern Hungary
  { title: 'Modern Studio Downtown', city: 'Pécs', country: 'Hungary', address: '8 Szechenyi Street', zipCode: '7621', price: 700, beds: 0, baths: 1, sqm: 34, type: 'studio', description: 'Contemporary studio apartment in downtown Pécs.', petFriendly: false, parking: false },
  { title: '2BR Apartment with Parking', city: 'Pécs', country: 'Hungary', address: '12 Janus Street', zipCode: '7621', price: 1300, beds: 2, baths: 1, sqm: 70, type: 'apartment', description: '2-bedroom apartment with dedicated parking space.', petFriendly: true, parking: true },
  { title: '1BR Near University', city: 'Pécs', country: 'Hungary', address: '20 Egyetem Street', zipCode: '7622', price: 800, beds: 1, baths: 1, sqm: 42, type: 'apartment', description: '1-bedroom apartment close to the University of Pécs.', petFriendly: false, parking: false },
  { title: '3BR Family Home', city: 'Pécs', country: 'Hungary', address: '35 Temet Street', zipCode: '7623', price: 1850, beds: 3, baths: 2, sqm: 108, type: 'apartment', description: 'Comfortable 3-bedroom apartment for families in Pécs.', petFriendly: true, parking: true },
  
  // Miskolc - Northern Hungary
  { title: 'Budget Studio in City Center', city: 'Miskolc', country: 'Hungary', address: '5 Szechenyi Street', zipCode: '3530', price: 650, beds: 0, baths: 1, sqm: 32, type: 'studio', description: 'Affordable studio apartment in the heart of Miskolc.', petFriendly: false, parking: false },
  { title: '2BR Apartment Downtown', city: 'Miskolc', country: 'Hungary', address: '18 Kazinczy Street', zipCode: '3530', price: 1250, beds: 2, baths: 1, sqm: 68, type: 'apartment', description: 'Spacious 2-bedroom apartment in downtown Miskolc.', petFriendly: true, parking: false },
  { title: '1BR with Modern Amenities', city: 'Miskolc', country: 'Hungary', address: '10 Piac Street', zipCode: '3530', price: 800, beds: 1, baths: 1, sqm: 44, type: 'apartment', description: '1-bedroom apartment with modern kitchen and bathroom.', petFriendly: false, parking: false },
  { title: '3BR House Near Lillafured', city: 'Miskolc', country: 'Hungary', address: '22 Eger Street', zipCode: '3532', price: 1750, beds: 3, baths: 2, sqm: 100, type: 'house', description: '3-bedroom house near the scenic Lillafured area.', petFriendly: true, parking: true },
  
  // Győr - Western Hungary
  { title: 'Modern Studio in Old Town', city: 'Győr', country: 'Hungary', address: '8 Szechenyi Street', zipCode: '9021', price: 720, beds: 0, baths: 1, sqm: 36, type: 'studio', description: 'Contemporary studio apartment in Győr\'s charming Old Town.', petFriendly: false, parking: false },
  { title: '2BR Apartment with Balcony', city: 'Győr', country: 'Hungary', address: '15 Baross Street', zipCode: '9021', price: 1350, beds: 2, baths: 1, sqm: 74, type: 'apartment', description: '2-bedroom apartment with a balcony overlooking the street.', petFriendly: true, parking: false },
  { title: '1BR Near Danube', city: 'Győr', country: 'Hungary', address: '12 Dunakanyar Street', zipCode: '9022', price: 900, beds: 1, baths: 1, sqm: 48, type: 'apartment', description: '1-bedroom apartment close to the Danube River.', petFriendly: false, parking: true },
  { title: '3BR Family Apartment', city: 'Győr', country: 'Hungary', address: '25 Arpad Street', zipCode: '9023', price: 1900, beds: 3, baths: 2, sqm: 112, type: 'apartment', description: 'Spacious 3-bedroom apartment suitable for families.', petFriendly: true, parking: true },
  
  // Nyíregyháza - Eastern Hungary
  { title: 'Affordable Studio Downtown', city: 'Nyíregyháza', country: 'Hungary', address: '5 Szechenyi Street', zipCode: '4400', price: 600, beds: 0, baths: 1, sqm: 30, type: 'studio', description: 'Budget-friendly studio apartment in downtown Nyíregyháza.', petFriendly: false, parking: false },
  { title: '2BR Apartment with Parking', city: 'Nyíregyháza', country: 'Hungary', address: '10 Kossuth Street', zipCode: '4400', price: 1200, beds: 2, baths: 1, sqm: 66, type: 'apartment', description: '2-bedroom apartment with parking space included.', petFriendly: true, parking: true },
  { title: '1BR Near City Park', city: 'Nyíregyháza', country: 'Hungary', address: '8 Park Street', zipCode: '4401', price: 750, beds: 1, baths: 1, sqm: 40, type: 'apartment', description: '1-bedroom apartment near the beautiful City Park.', petFriendly: false, parking: false },
  { title: '3BR Family Home', city: 'Nyíregyháza', country: 'Hungary', address: '20 Bercseny Street', zipCode: '4402', price: 1700, beds: 3, baths: 2, sqm: 98, type: 'house', description: 'Comfortable 3-bedroom home for families in Nyíregyháza.', petFriendly: true, parking: true },
  
  // Kecskemét - Central Hungary
  { title: 'Modern Studio in Center', city: 'Kecskemét', country: 'Hungary', address: '12 Szechenyi Street', zipCode: '6000', price: 680, beds: 0, baths: 1, sqm: 33, type: 'studio', description: 'Contemporary studio apartment in Kecskemét\'s city center.', petFriendly: false, parking: false },
  { title: '2BR Apartment Downtown', city: 'Kecskemét', country: 'Hungary', address: '18 Petőfi Street', zipCode: '6000', price: 1300, beds: 2, baths: 1, sqm: 72, type: 'apartment', description: 'Spacious 2-bedroom apartment in downtown Kecskemét.', petFriendly: true, parking: false },
  { title: '1BR with Garden Access', city: 'Kecskemét', country: 'Hungary', address: '5 Katona Street', zipCode: '6001', price: 850, beds: 1, baths: 1, sqm: 46, type: 'apartment', description: '1-bedroom apartment with access to a shared garden.', petFriendly: false, parking: false },
  { title: '3BR House with Yard', city: 'Kecskemét', country: 'Hungary', address: '28 Bethlen Street', zipCode: '6002', price: 1900, beds: 3, baths: 2, sqm: 115, type: 'house', description: '3-bedroom house with a private yard in Kecskemét.', petFriendly: true, parking: true },
  
  // Szolnok - Central Hungary
  { title: 'Budget Studio Apartment', city: 'Szolnok', country: 'Hungary', address: '8 Szechenyi Street', zipCode: '5000', price: 620, beds: 0, baths: 1, sqm: 31, type: 'studio', description: 'Affordable studio apartment in Szolnok city center.', petFriendly: false, parking: false },
  { title: '2BR Apartment with Parking', city: 'Szolnok', country: 'Hungary', address: '15 Kossuth Street', zipCode: '5000', price: 1200, beds: 2, baths: 1, sqm: 65, type: 'apartment', description: '2-bedroom apartment with dedicated parking.', petFriendly: true, parking: true },
  { title: '1BR Near Danube', city: 'Szolnok', country: 'Hungary', address: '10 Tisza Street', zipCode: '5001', price: 800, beds: 1, baths: 1, sqm: 43, type: 'apartment', description: '1-bedroom apartment close to the Danube River.', petFriendly: false, parking: false },
  { title: '3BR Family Apartment', city: 'Szolnok', country: 'Hungary', address: '22 Arpad Street', zipCode: '5002', price: 1750, beds: 3, baths: 2, sqm: 105, type: 'apartment', description: 'Spacious 3-bedroom apartment for families.', petFriendly: true, parking: true },
  
  // Eger - Northern Hungary (Wine Region)
  { title: 'Charming Studio in Historic Center', city: 'Eger', country: 'Hungary', address: '5 Dobó Square', zipCode: '3300', price: 700, beds: 0, baths: 1, sqm: 35, type: 'studio', description: 'Charming studio apartment in Eger\'s historic city center.', petFriendly: false, parking: false },
  { title: '2BR Apartment Near Minaret', city: 'Eger', country: 'Hungary', address: '12 Knezich Street', zipCode: '3300', price: 1350, beds: 2, baths: 1, sqm: 73, type: 'apartment', description: '2-bedroom apartment near the famous Turkish Minaret.', petFriendly: true, parking: false },
  { title: '1BR with Wine Cellar Access', city: 'Eger', country: 'Hungary', address: '8 Fazola Street', zipCode: '3301', price: 900, beds: 1, baths: 1, sqm: 47, type: 'apartment', description: '1-bedroom apartment with access to historic wine cellars.', petFriendly: false, parking: false },
  { title: '3BR House in Wine Country', city: 'Eger', country: 'Hungary', address: '25 Szarvas Street', zipCode: '3302', price: 1850, beds: 3, baths: 2, sqm: 110, type: 'house', description: '3-bedroom house in Eger\'s scenic wine region.', petFriendly: true, parking: true },
  
  // Tatabánya - Central Hungary
  { title: 'Modern Studio Downtown', city: 'Tatabánya', country: 'Hungary', address: '10 Szechenyi Street', zipCode: '2800', price: 650, beds: 0, baths: 1, sqm: 32, type: 'studio', description: 'Contemporary studio apartment in downtown Tatabánya.', petFriendly: false, parking: false },
  { title: '2BR Apartment with Balcony', city: 'Tatabánya', country: 'Hungary', address: '18 Petőfi Street', zipCode: '2800', price: 1250, beds: 2, baths: 1, sqm: 70, type: 'apartment', description: '2-bedroom apartment with a balcony.', petFriendly: true, parking: false },
  { title: '1BR Near Shopping Center', city: 'Tatabánya', country: 'Hungary', address: '5 Komaromi Street', zipCode: '2801', price: 800, beds: 1, baths: 1, sqm: 44, type: 'apartment', description: '1-bedroom apartment near the shopping center.', petFriendly: false, parking: true },
  { title: '3BR Family Home', city: 'Tatabánya', country: 'Hungary', address: '22 Bethlen Street', zipCode: '2802', price: 1800, beds: 3, baths: 2, sqm: 108, type: 'apartment', description: 'Comfortable 3-bedroom apartment for families.', petFriendly: true, parking: true },
  
  // Veszprém - Western Hungary
  { title: 'Scenic Studio with City View', city: 'Veszprém', country: 'Hungary', address: '8 Vár Street', zipCode: '8200', price: 750, beds: 0, baths: 1, sqm: 37, type: 'studio', description: 'Studio apartment with scenic views of Veszprém\'s historic castle.', petFriendly: false, parking: false },
  { title: '2BR Apartment Downtown', city: 'Veszprém', country: 'Hungary', address: '15 Szechenyi Street', zipCode: '8200', price: 1350, beds: 2, baths: 1, sqm: 75, type: 'apartment', description: '2-bedroom apartment in the heart of downtown Veszprém.', petFriendly: true, parking: false },
  { title: '1BR Near Castle', city: 'Veszprém', country: 'Hungary', address: '10 Pal Street', zipCode: '8201', price: 900, beds: 1, baths: 1, sqm: 48, type: 'apartment', description: '1-bedroom apartment close to Veszprém Castle.', petFriendly: false, parking: true },
  { title: '3BR House with Garden', city: 'Veszprém', country: 'Hungary', address: '28 Arpad Street', zipCode: '8202', price: 1950, beds: 3, baths: 2, sqm: 112, type: 'house', description: '3-bedroom house with a private garden.', petFriendly: true, parking: true },
  
  // Zalaegerszeg - Western Hungary
  { title: 'Budget Studio in Center', city: 'Zalaegerszeg', country: 'Hungary', address: '5 Szechenyi Street', zipCode: '8900', price: 600, beds: 0, baths: 1, sqm: 30, type: 'studio', description: 'Affordable studio apartment in downtown Zalaegerszeg.', petFriendly: false, parking: false },
  { title: '2BR Apartment with Parking', city: 'Zalaegerszeg', country: 'Hungary', address: '12 Kossuth Street', zipCode: '8900', price: 1200, beds: 2, baths: 1, sqm: 68, type: 'apartment', description: '2-bedroom apartment with parking space.', petFriendly: true, parking: true },
  { title: '1BR Near Museum', city: 'Zalaegerszeg', country: 'Hungary', address: '8 Muzeum Street', zipCode: '8901', price: 800, beds: 1, baths: 1, sqm: 45, type: 'apartment', description: '1-bedroom apartment near the city museum.', petFriendly: false, parking: false },
  { title: '3BR Family Home', city: 'Zalaegerszeg', country: 'Hungary', address: '20 Bethlen Street', zipCode: '8902', price: 1750, beds: 3, baths: 2, sqm: 105, type: 'house', description: 'Comfortable 3-bedroom home for families.', petFriendly: true, parking: true },
];

try {
  console.log(`Inserting ${hungarianProperties.length} Hungarian properties...`);
  
  for (const property of hungarianProperties) {
    const query = `
      INSERT INTO properties (
        title, city, country, address, zipCode, price, beds, baths, sqm, type, description, petFriendly, parking, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(query, [
      property.title,
      property.city,
      property.country,
      property.address,
      property.zipCode,
      property.price,
      property.beds,
      property.baths,
      property.sqm,
      property.type,
      property.description,
      property.petFriendly ? 1 : 0,
      property.parking ? 1 : 0,
      'HUF'
    ]);
  }
  
  console.log(`✅ Successfully inserted ${hungarianProperties.length} Hungarian properties!`);
  
} catch (error) {
  console.error('❌ Error inserting properties:', error.message);
} finally {
  await connection.end();
}
