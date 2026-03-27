const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const existingRace = await prisma.race.findFirst();
  if (existingRace) {
    console.log('⚠️ Database already seeded. Skipping...');
    await prisma.$disconnect();
    return;
  }

  try {
    // ============================================
    // SEED RACES (12 records)
    // ============================================
    console.log('Seeding races...');
    const races = await Promise.all([
      prisma.race.create({
        data: { name: 'Human', description: 'Regular humans, the most common race in One Piece' }
      }),
      prisma.race.create({
        data: { name: 'Fishman', description: 'Fish-human hybrids with superior strength underwater' }
      }),
      prisma.race.create({
        data: { name: 'Mink', description: 'Animal-human hybrids from Zou with electro abilities' }
      }),
      prisma.race.create({
        data: { name: 'Giant', description: 'Enormous humanoids with incredible strength' }
      }),
      prisma.race.create({
        data: { name: 'Dwarf', description: 'Tiny people with superhuman speed from Tontatta Kingdom' }
      }),
      prisma.race.create({
        data: { name: 'Long-Arm Tribe', description: 'Humans with extra-long arms with additional joints' }
      }),
      prisma.race.create({
        data: { name: 'Long-Leg Tribe', description: 'Humans with extremely long legs' }
      }),
      prisma.race.create({
        data: { name: 'Three-Eye Tribe', description: 'Humans with a third eye capable of hearing Voice of All Things' }
      }),
      prisma.race.create({
        data: { name: 'Cyborg', description: 'Humans modified with mechanical parts' }
      }),
      prisma.race.create({
        data: { name: 'Skeleton', description: 'Undead brought back by Devil Fruit power' }
      }),
      prisma.race.create({
        data: { name: 'Lunarian', description: 'Ancient race with wings and ability to create fire' }
      }),
      prisma.race.create({
        data: { name: 'Demon', description: 'Otherworldly beings with supernatural powers' }
      })
    ]);
    console.log(`✓ Created ${races.length} races`);

    // ============================================
    // SEED CHARACTER TYPES (21 records)
    // ============================================
    console.log('Seeding character types...');
    const characterTypes = await Promise.all([
      prisma.characterType.create({ data: { name: 'Pirate', description: 'Someone who sails under a pirate flag' } }),
      prisma.characterType.create({ data: { name: 'Captain', description: 'Leader of a pirate crew or ship' } }),
      prisma.characterType.create({ data: { name: 'Marine', description: 'Member of the World Government military' } }),
      prisma.characterType.create({ data: { name: 'Admiral', description: 'Highest rank in Marine forces' } }),
      prisma.characterType.create({ data: { name: 'Vice Admiral', description: 'Second highest Marine rank' } }),
      prisma.characterType.create({ data: { name: 'Yonko', description: 'One of the Four Emperors ruling the New World' } }),
      prisma.characterType.create({ data: { name: 'Shichibukai', description: 'Seven Warlords of the Sea (former system)' } }),
      prisma.characterType.create({ data: { name: 'Supernova', description: 'Rookie pirate with bounty over 100 million' } }),
      prisma.characterType.create({ data: { name: 'Revolutionary', description: 'Member of Revolutionary Army' } }),
      prisma.characterType.create({ data: { name: 'Bounty Hunter', description: 'One who hunts pirates for their bounties' } }),
      prisma.characterType.create({ data: { name: 'Scientist', description: 'Expert in various scientific fields' } }),
      prisma.characterType.create({ data: { name: 'Doctor', description: 'Medical professional' } }),
      prisma.characterType.create({ data: { name: 'Navigator', description: 'Expert in navigation and weather' } }),
      prisma.characterType.create({ data: { name: 'Swordsman', description: 'Master of sword techniques' } }),
      prisma.characterType.create({ data: { name: 'Sniper', description: 'Expert marksman' } }),
      prisma.characterType.create({ data: { name: 'Cook', description: 'Professional chef' } }),
      prisma.characterType.create({ data: { name: 'Archaeologist', description: 'Expert in ancient history' } }),
      prisma.characterType.create({ data: { name: 'Shipwright', description: 'Ship builder and carpenter' } }),
      prisma.characterType.create({ data: { name: 'Musician', description: 'Professional music performer' } }),
      prisma.characterType.create({ data: { name: 'Helmsman', description: 'Expert ship pilot' } }),
      prisma.characterType.create({ data: { name: 'Civilian', description: 'Regular citizen not affiliated with pirates or marines' } })
    ]);
    console.log(`✓ Created ${characterTypes.length} character types`);

    // ============================================
    // SEED FRUIT TYPES (3 records)
    // ============================================
    console.log('Seeding fruit types...');
    const fruitTypes = await Promise.all([
      prisma.fruitType.create({ data: { name: 'Paramecia', description: 'Grants superhuman abilities, most common type' } }),
      prisma.fruitType.create({ data: { name: 'Zoan', description: 'Allows transformation into animals or hybrid forms' } }),
      prisma.fruitType.create({ data: { name: 'Logia', description: 'Grants power to transform into natural elements' } })
    ]);
    console.log(`✓ Created ${fruitTypes.length} fruit types`);

    // ============================================
    // SEED ORGANIZATION TYPES (8 records)
    // ============================================
    console.log('Seeding organization types...');
    const organizationTypes = await Promise.all([
      prisma.organizationType.create({ data: { name: 'Pirate Crew', description: 'Group of pirates sailing together under one flag' } }),
      prisma.organizationType.create({ data: { name: 'Marine Division', description: 'Military unit of World Government Marines' } }),
      prisma.organizationType.create({ data: { name: 'Revolutionary Army', description: 'Organization opposing the World Government' } }),
      prisma.organizationType.create({ data: { name: 'Cipher Pol', description: 'Secret intelligence agency of World Government' } }),
      prisma.organizationType.create({ data: { name: 'Yonko Crew', description: 'Crew led by one of the Four Emperors' } }),
      prisma.organizationType.create({ data: { name: 'Grand Fleet', description: 'Alliance of multiple pirate crews' } }),
      prisma.organizationType.create({ data: { name: 'Kingdom', description: 'Sovereign nation or territory' } }),
      prisma.organizationType.create({ data: { name: 'Criminal Organization', description: 'Underground criminal syndicate' } })
    ]);
    console.log(`✓ Created ${organizationTypes.length} organization types`);

    // ============================================
    // SEED HAKI TYPES (3 records)
    // ============================================
    console.log('Seeding haki types...');
    const hakiTypes = await Promise.all([
      prisma.hakiType.create({ data: { name: 'Observation Haki', description: 'Allows user to sense presence and emotions of others, predict movements', color: 'Red' } }),
      prisma.hakiType.create({ data: { name: 'Armament Haki', description: 'Allows user to use spiritual armor for offense and defense, can touch Logia users', color: 'Black' } }),
      prisma.hakiType.create({ data: { name: 'Conqueror Haki', description: 'Rare Haki that allows user to exert willpower over others, knock out weak-willed', color: 'Dark Red/Black' } })
    ]);
    console.log(`✓ Created ${hakiTypes.length} haki types`);

    // ============================================
    // SEED SHIPS (10 records)
    // ============================================
    console.log('Seeding ships...');
    const ships = await Promise.all([
      prisma.ship.create({ data: { name: 'Thousand Sunny', description: 'The second ship of the Straw Hat Pirates, built by Franky using Adam Wood', status: 'active' } }),
      prisma.ship.create({ data: { name: 'Going Merry', description: 'The first ship of the Straw Hat Pirates, a caravel gifted by Kaya', status: 'destroyed' } }),
      prisma.ship.create({ data: { name: 'Moby Dick', description: 'Flagship of the Whitebeard Pirates, a massive whale-shaped vessel', status: 'destroyed' } }),
      prisma.ship.create({ data: { name: 'Oro Jackson', description: 'Ship of the Roger Pirates, built by Tom', status: 'retired' } }),
      prisma.ship.create({ data: { name: 'Red Force', description: 'Flagship of the Red Hair Pirates', status: 'active' } }),
      prisma.ship.create({ data: { name: 'Queen Mama Chanter', description: 'Main ship of the Big Mom Pirates', status: 'active' } }),
      prisma.ship.create({ data: { name: 'Numancia Flamingo', description: 'Former ship of the Donquixote Pirates', status: 'retired' } }),
      prisma.ship.create({ data: { name: 'Polar Tang', description: 'Submarine of the Heart Pirates', status: 'active' } }),
      prisma.ship.create({ data: { name: 'Victoria Punk', description: 'Ship of the Kid Pirates', status: 'active' } }),
      prisma.ship.create({ data: { name: 'Perfumer', description: 'Ship of the Drake Pirates', status: 'active' } })
    ]);
    console.log(`✓ Created ${ships.length} ships`);

    // ============================================
    // SEED CHARACTERS (22 records)
    // ============================================
    console.log('Seeding characters...');
    const characters = await Promise.all([
      prisma.character.create({ data: { name: 'Monkey D. Luffy', alias: 'Straw Hat Luffy', age: 19, birthday: 'May 5', height: '174 cm', bounty: 3000000000n, raceId: 1, origin: 'East Blue - Foosha Village', status: 'alive', description: 'Captain of the Straw Hat Pirates, one of the Four Emperors, dreams of becoming Pirate King', debut: 'Chapter 1' } }),
      prisma.character.create({ data: { name: 'Roronoa Zoro', alias: 'Pirate Hunter Zoro', age: 21, birthday: 'November 11', height: '181 cm', bounty: 1111000000n, raceId: 1, origin: 'East Blue - Shimotsuki Village', status: 'alive', description: 'Swordsman of the Straw Hats, aims to become the greatest swordsman', debut: 'Chapter 3' } }),
      prisma.character.create({ data: { name: 'Nami', alias: 'Cat Burglar Nami', age: 20, birthday: 'July 3', height: '170 cm', bounty: 366000000n, raceId: 1, origin: 'East Blue - Cocoyasi Village', status: 'alive', description: 'Navigator of the Straw Hats, dreams of mapping the world', debut: 'Chapter 8' } }),
      prisma.character.create({ data: { name: 'Usopp', alias: 'God Usopp', age: 19, birthday: 'April 1', height: '176 cm', bounty: 500000000n, raceId: 1, origin: 'East Blue - Syrup Village', status: 'alive', description: 'Sniper of the Straw Hats, dreams of becoming a brave warrior of the sea', debut: 'Chapter 23' } }),
      prisma.character.create({ data: { name: 'Sanji', alias: 'Black Leg Sanji', age: 21, birthday: 'March 2', height: '180 cm', bounty: 1032000000n, raceId: 1, origin: 'North Blue - Germa Kingdom', status: 'alive', description: 'Cook of the Straw Hats, seeks the All Blue', debut: 'Chapter 43' } }),
      prisma.character.create({ data: { name: 'Tony Tony Chopper', alias: 'Cotton Candy Lover Chopper', age: 17, birthday: 'December 24', height: '90 cm', bounty: 1000n, raceId: 6, origin: 'Drum Island', status: 'alive', description: 'Doctor of the Straw Hats, reindeer who ate Hito Hito no Mi', debut: 'Chapter 134' } }),
      prisma.character.create({ data: { name: 'Nico Robin', alias: 'Devil Child Robin', age: 30, birthday: 'February 6', height: '188 cm', bounty: 930000000n, raceId: 1, origin: 'West Blue - Ohara', status: 'alive', description: 'Archaeologist of the Straw Hats, seeks the true history', debut: 'Chapter 114' } }),
      prisma.character.create({ data: { name: 'Franky', alias: 'Cyborg Franky', age: 36, birthday: 'March 9', height: '240 cm', bounty: 394000000n, raceId: 9, origin: 'South Blue - Water 7', status: 'alive', description: 'Shipwright of the Straw Hats, built Thousand Sunny', debut: 'Chapter 329' } }),
      prisma.character.create({ data: { name: 'Brook', alias: 'Soul King Brook', age: 90, birthday: 'April 3', height: '277 cm', bounty: 383000000n, raceId: 10, origin: 'West Blue', status: 'alive', description: 'Musician of the Straw Hats, skeleton brought back by Yomi Yomi no Mi', debut: 'Chapter 442' } }),
      prisma.character.create({ data: { name: 'Jinbe', alias: 'Knight of the Sea Jinbe', age: 46, birthday: 'April 2', height: '301 cm', bounty: 1100000000n, raceId: 2, origin: 'Fish-Man Island', status: 'alive', description: 'Helmsman of the Straw Hats, former Shichibukai and whale shark fishman', debut: 'Chapter 528' } }),
      prisma.character.create({ data: { name: 'Portgas D. Ace', alias: 'Fire Fist Ace', age: 20, birthday: 'January 1', height: '185 cm', bounty: 550000000n, raceId: 1, origin: 'South Blue - Baterilla', status: 'deceased', description: 'Former 2nd Division Commander of Whitebeard Pirates, Luffy\'s brother', debut: 'Chapter 154' } }),
      prisma.character.create({ data: { name: 'Sabo', alias: 'The Flame Emperor', age: 22, birthday: 'March 20', height: '187 cm', bounty: 602000000n, raceId: 1, origin: 'East Blue - Goa Kingdom', status: 'alive', description: 'Chief of Staff of Revolutionary Army, Luffy\'s brother', debut: 'Chapter 583' } }),
      prisma.character.create({ data: { name: 'Trafalgar D. Water Law', alias: 'Surgeon of Death', age: 26, birthday: 'October 6', height: '191 cm', bounty: 3000000000n, raceId: 1, origin: 'North Blue - Flevance', status: 'alive', description: 'Captain of Heart Pirates, member of Worst Generation', debut: 'Chapter 498' } }),
      prisma.character.create({ data: { name: 'Eustass Kid', alias: 'Captain Kid', age: 23, birthday: 'January 10', height: '205 cm', bounty: 3000000000n, raceId: 1, origin: 'South Blue', status: 'alive', description: 'Captain of Kid Pirates, member of Worst Generation', debut: 'Chapter 498' } }),
      prisma.character.create({ data: { name: 'Shanks', alias: 'Red Hair Shanks', age: 39, birthday: 'March 9', height: '199 cm', bounty: 4048900000n, raceId: 1, origin: 'West Blue', status: 'alive', description: 'Captain of Red Hair Pirates, one of the Four Emperors', debut: 'Chapter 1' } }),
      prisma.character.create({ data: { name: 'Marshall D. Teach', alias: 'Blackbeard', age: 40, birthday: 'August 3', height: '344 cm', bounty: 3996000000n, raceId: 1, origin: 'Unknown', status: 'alive', description: 'Captain of Blackbeard Pirates, one of the Four Emperors', debut: 'Chapter 234' } }),
      prisma.character.create({ data: { name: 'Kaido', alias: 'Kaido of the Beasts', age: 59, birthday: 'May 1', height: '710 cm', bounty: 4611100000n, raceId: 1, origin: 'Unknown', status: 'alive', description: 'Former Emperor, known as strongest creature in the world, defeated in Wano', debut: 'Chapter 795' } }),
      prisma.character.create({ data: { name: 'Charlotte Linlin', alias: 'Big Mom', age: 68, birthday: 'February 15', height: '880 cm', bounty: 4388000000n, raceId: 1, origin: 'Unknown', status: 'alive', description: 'Former Emperor, captain of Big Mom Pirates, defeated in Wano', debut: 'Chapter 651' } }),
      prisma.character.create({ data: { name: 'Gol D. Roger', alias: 'Gold Roger, Pirate King', age: 53, birthday: 'December 31', height: '274 cm', bounty: 5564800000n, raceId: 1, origin: 'East Blue - Loguetown', status: 'deceased', description: 'Former Pirate King, started the Great Pirate Era', debut: 'Chapter 1' } }),
      prisma.character.create({ data: { name: 'Edward Newgate', alias: 'Whitebeard', age: 72, birthday: 'April 6', height: '666 cm', bounty: 5046000000n, raceId: 1, origin: 'Sphinx', status: 'deceased', description: 'Former Emperor, known as strongest man in the world, died at Marineford', debut: 'Chapter 234' } }),
      prisma.character.create({ data: { name: 'Buggy', alias: 'Buggy the Clown', age: 39, birthday: 'August 8', height: '192 cm', bounty: 3189000000n, raceId: 1, origin: 'Unknown', status: 'alive', description: 'Captain of Buggy Pirates, one of the Four Emperors, founder of Cross Guild', debut: 'Chapter 9' } }),
      prisma.character.create({ data: { name: 'X Drake', alias: 'Red Flag X Drake', age: 33, birthday: 'October 11', height: '233 cm', bounty: 222000000n, raceId: 1, origin: 'North Blue', status: 'alive', description: 'Former Marine Rear Admiral turned pirate, captain of Drake Pirates', debut: 'Chapter 498' } })
    ]);
    console.log(`✓ Created ${characters.length} characters`);

    // ============================================
    // SEED DEVIL FRUITS (16 records)
    // ============================================
    console.log('Seeding devil fruits...');
    const devilFruits = await Promise.all([
      prisma.devilFruit.create({ data: { name: 'Gomu Gomu no Mi', japaneseName: 'ゴムゴムの実', typeId: 1, description: 'Rubber-Rubber Fruit, actually the Hito Hito no Mi, Model: Nika', abilities: 'Grants user rubber body, immunity to electricity, awakens as Sun God Nika', currentUserId: 1 } }),
      prisma.devilFruit.create({ data: { name: 'Hana Hana no Mi', japaneseName: '花花の実', typeId: 1, description: 'Flower-Flower Fruit', abilities: 'Allows user to sprout body parts anywhere', currentUserId: 7 } }),
      prisma.devilFruit.create({ data: { name: 'Yomi Yomi no Mi', japaneseName: 'ヨミヨミの実', typeId: 1, description: 'Revive-Revive Fruit', abilities: 'Grants user a second life, soul can leave body', currentUserId: 9 } }),
      prisma.devilFruit.create({ data: { name: 'Ope Ope no Mi', japaneseName: 'オペオペの実', typeId: 1, description: 'Op-Op Fruit', abilities: 'Allows user to create a spherical territory and manipulate everything inside', currentUserId: 13 } }),
      prisma.devilFruit.create({ data: { name: 'Mera Mera no Mi', japaneseName: 'メラメラの実', typeId: 3, description: 'Flame-Flame Fruit', abilities: 'Allows user to create, control, and become fire', currentUserId: 12 } }),
      prisma.devilFruit.create({ data: { name: 'Gura Gura no Mi', japaneseName: 'グラグラの実', typeId: 1, description: 'Tremor-Tremor Fruit', abilities: 'Allows user to create quakes and shockwaves', currentUserId: 16 } }),
      prisma.devilFruit.create({ data: { name: 'Yami Yami no Mi', japaneseName: 'ヤミヤミの実', typeId: 3, description: 'Dark-Dark Fruit', abilities: 'Allows user to create, control, and become darkness, nullify devil fruits', currentUserId: 16 } }),
      prisma.devilFruit.create({ data: { name: 'Uo Uo no Mi, Model: Seiryu', japaneseName: '魚魚の実 モデル：青龍', typeId: 2, description: 'Fish-Fish Fruit, Model: Azure Dragon', abilities: 'Allows user to transform into an Azure Dragon', currentUserId: 17 } }),
      prisma.devilFruit.create({ data: { name: 'Soru Soru no Mi', japaneseName: 'ソルソルの実', typeId: 1, description: 'Soul-Soul Fruit', abilities: 'Allows user to manipulate souls and give life to objects', currentUserId: 18 } }),
      prisma.devilFruit.create({ data: { name: 'Hito Hito no Mi', japaneseName: 'ヒトヒトの実', typeId: 2, description: 'Human-Human Fruit', abilities: 'Allows animal to gain human intelligence and form', currentUserId: 6 } }),
      prisma.devilFruit.create({ data: { name: 'Bara Bara no Mi', japaneseName: 'バラバラの実', typeId: 1, description: 'Chop-Chop Fruit', abilities: 'Allows user to split body into pieces and control them independently', currentUserId: 21 } }),
      prisma.devilFruit.create({ data: { name: 'Magu Magu no Mi', japaneseName: 'マグマグの実', typeId: 3, description: 'Magma-Magma Fruit', abilities: 'Allows user to create, control, and become magma' } }),
      prisma.devilFruit.create({ data: { name: 'Pika Pika no Mi', japaneseName: 'ピカピカの実', typeId: 3, description: 'Glint-Glint Fruit', abilities: 'Allows user to create, control, and become light' } }),
      prisma.devilFruit.create({ data: { name: 'Hie Hie no Mi', japaneseName: 'ヒエヒエの実', typeId: 3, description: 'Ice-Ice Fruit', abilities: 'Allows user to create, control, and become ice' } }),
      prisma.devilFruit.create({ data: { name: 'Goro Goro no Mi', japaneseName: 'ゴロゴロの実', typeId: 3, description: 'Rumble-Rumble Fruit', abilities: 'Allows user to create, control, and become electricity' } }),
      prisma.devilFruit.create({ data: { name: 'Mochi Mochi no Mi', japaneseName: 'モチモチの実', typeId: 1, description: 'Mochi-Mochi Fruit', abilities: 'Allows user to create, control, and become mochi' } })
    ]);
    console.log(`✓ Created ${devilFruits.length} devil fruits`);

    // ============================================
    // SEED ORGANIZATIONS (12 records)
    // ============================================
    console.log('Seeding organizations...');
    const organizations = await Promise.all([
      prisma.organization.create({ data: { name: 'Straw Hat Pirates', organizationTypeId: 5, leaderId: 1, shipId: 1, baseLocation: 'Thousand Sunny (Mobile)', totalBounty: 8816000000n, status: 'active', description: 'Yonko crew led by Monkey D. Luffy, aiming for One Piece' } }),
      prisma.organization.create({ data: { name: 'Heart Pirates', organizationTypeId: 1, leaderId: 13, shipId: 8, baseLocation: 'Polar Tang (Mobile)', totalBounty: 3000000000n, status: 'active', description: 'Pirate crew led by Trafalgar Law, allied with Straw Hats' } }),
      prisma.organization.create({ data: { name: 'Kid Pirates', organizationTypeId: 1, leaderId: 14, shipId: 9, baseLocation: 'Victoria Punk (Mobile)', totalBounty: 3000000000n, status: 'active', description: 'Pirate crew led by Eustass Kid, member of Worst Generation' } }),
      prisma.organization.create({ data: { name: 'Red Hair Pirates', organizationTypeId: 5, leaderId: 15, shipId: 5, baseLocation: 'Unknown', totalBounty: 4048900000n, status: 'active', description: 'Yonko crew led by Shanks, one of the Four Emperors' } }),
      prisma.organization.create({ data: { name: 'Blackbeard Pirates', organizationTypeId: 5, leaderId: 16, baseLocation: 'Pirate Island - Hachinosu', totalBounty: 3996000000n, status: 'active', description: 'Yonko crew led by Marshall D. Teach, one of the Four Emperors' } }),
      prisma.organization.create({ data: { name: 'Buggy Pirates', organizationTypeId: 5, leaderId: 21, baseLocation: 'Karai Bari Island', totalBounty: 3189000000n, status: 'active', description: 'Yonko crew led by Buggy, founder of Cross Guild' } }),
      prisma.organization.create({ data: { name: 'Whitebeard Pirates', organizationTypeId: 5, leaderId: 20, shipId: 3, baseLocation: 'Moby Dick', totalBounty: 5046000000n, status: 'disbanded', description: 'Former Yonko crew led by Edward Newgate, disbanded after Marineford War' } }),
      prisma.organization.create({ data: { name: 'Roger Pirates', organizationTypeId: 1, leaderId: 19, shipId: 4, baseLocation: null, totalBounty: 5564800000n, status: 'disbanded', description: 'Legendary crew led by Gol D. Roger, conquered Grand Line' } }),
      prisma.organization.create({ data: { name: 'Revolutionary Army', organizationTypeId: 3, baseLocation: 'Kamabakka Kingdom', totalBounty: 602000000n, status: 'active', description: 'Organization led by Monkey D. Dragon, opposing World Government' } }),
      prisma.organization.create({ data: { name: 'Marines', organizationTypeId: 2, baseLocation: 'Marineford', totalBounty: 0n, status: 'active', description: 'Military force of the World Government' } }),
      prisma.organization.create({ data: { name: 'Big Mom Pirates', organizationTypeId: 5, leaderId: 18, shipId: 6, baseLocation: 'Whole Cake Island', totalBounty: 4388000000n, status: 'active', description: 'Former Yonko crew led by Charlotte Linlin, defeated in Wano' } }),
      prisma.organization.create({ data: { name: 'Drake Pirates', organizationTypeId: 1, leaderId: 22, shipId: 10, baseLocation: 'Perfumer (Mobile)', totalBounty: 222000000n, status: 'active', description: 'Pirate crew led by X Drake, former Marine' } })
    ]);
    console.log(`✓ Created ${organizations.length} organizations`);

    // ============================================
    // SEED RELATIONSHIP TABLES
    // ============================================

    // Character Devil Fruits
    console.log('Seeding character devil fruit relationships...');
    await prisma.characterDevilFruit.createMany({
      data: [
        { characterId: 1, devilFruitId: 1, isCurrent: true },
        { characterId: 7, devilFruitId: 2, isCurrent: true },
        { characterId: 9, devilFruitId: 3, isCurrent: true },
        { characterId: 13, devilFruitId: 4, isCurrent: true },
        { characterId: 12, devilFruitId: 5, isCurrent: true },
        { characterId: 16, devilFruitId: 6, isCurrent: true },
        { characterId: 16, devilFruitId: 7, isCurrent: true },
        { characterId: 17, devilFruitId: 8, isCurrent: true },
        { characterId: 18, devilFruitId: 9, isCurrent: true },
        { characterId: 6, devilFruitId: 10, isCurrent: true },
        { characterId: 21, devilFruitId: 11, isCurrent: true }
      ]
    });
    console.log('✓ Created character devil fruit relationships');

    // Character Haki Types
    console.log('Seeding character haki relationships...');
    await prisma.characterHaki.createMany({
      data: [
        { characterId: 1, hakiTypeId: 1, masteryLevel: 'Master', awakened: true },
        { characterId: 1, hakiTypeId: 2, masteryLevel: 'Master', awakened: true },
        { characterId: 1, hakiTypeId: 3, masteryLevel: 'Master', awakened: true },
        { characterId: 2, hakiTypeId: 2, masteryLevel: 'Expert', awakened: false },
        { characterId: 2, hakiTypeId: 3, masteryLevel: 'Beginner', awakened: false },
        { characterId: 15, hakiTypeId: 1, masteryLevel: 'Master', awakened: true },
        { characterId: 15, hakiTypeId: 2, masteryLevel: 'Master', awakened: true },
        { characterId: 15, hakiTypeId: 3, masteryLevel: 'Master', awakened: true },
        { characterId: 16, hakiTypeId: 2, masteryLevel: 'Master', awakened: true },
        { characterId: 16, hakiTypeId: 3, masteryLevel: 'Expert', awakened: false },
        { characterId: 19, hakiTypeId: 3, masteryLevel: 'Master', awakened: true }
      ]
    });
    console.log('✓ Created character haki relationships');

    // Character Character Types
    console.log('Seeding character type relationships...');
    await prisma.characterCharacterType.createMany({
      data: [
        { characterId: 1, characterTypeId: 1, isCurrent: true },
        { characterId: 1, characterTypeId: 2, isCurrent: true },
        { characterId: 1, characterTypeId: 6, isCurrent: true },
        { characterId: 2, characterTypeId: 1, isCurrent: true },
        { characterId: 2, characterTypeId: 14, isCurrent: true },
        { characterId: 3, characterTypeId: 1, isCurrent: true },
        { characterId: 3, characterTypeId: 13, isCurrent: true },
        { characterId: 4, characterTypeId: 1, isCurrent: true },
        { characterId: 4, characterTypeId: 15, isCurrent: true },
        { characterId: 5, characterTypeId: 1, isCurrent: true },
        { characterId: 5, characterTypeId: 16, isCurrent: true },
        { characterId: 6, characterTypeId: 1, isCurrent: true },
        { characterId: 6, characterTypeId: 12, isCurrent: true },
        { characterId: 7, characterTypeId: 1, isCurrent: true },
        { characterId: 7, characterTypeId: 17, isCurrent: true },
        { characterId: 8, characterTypeId: 1, isCurrent: true },
        { characterId: 8, characterTypeId: 18, isCurrent: true },
        { characterId: 9, characterTypeId: 1, isCurrent: true },
        { characterId: 9, characterTypeId: 19, isCurrent: true },
        { characterId: 10, characterTypeId: 1, isCurrent: true },
        { characterId: 10, characterTypeId: 20, isCurrent: true }
      ]
    });
    console.log('✓ Created character type relationships');

    // Character Organizations
    console.log('Seeding character organization relationships...');
    await prisma.characterOrganization.createMany({
      data: [
        { characterId: 1, organizationId: 1, role: 'Captain', isCurrent: true },
        { characterId: 2, organizationId: 1, role: 'Swordsman', isCurrent: true },
        { characterId: 3, organizationId: 1, role: 'Navigator', isCurrent: true },
        { characterId: 4, organizationId: 1, role: 'Sniper', isCurrent: true },
        { characterId: 5, organizationId: 1, role: 'Cook', isCurrent: true },
        { characterId: 6, organizationId: 1, role: 'Doctor', isCurrent: true },
        { characterId: 7, organizationId: 1, role: 'Archaeologist', isCurrent: true },
        { characterId: 8, organizationId: 1, role: 'Shipwright', isCurrent: true },
        { characterId: 9, organizationId: 1, role: 'Musician', isCurrent: true },
        { characterId: 10, organizationId: 1, role: 'Helmsman', isCurrent: true },
        { characterId: 13, organizationId: 2, role: 'Captain', isCurrent: true },
        { characterId: 14, organizationId: 3, role: 'Captain', isCurrent: true },
        { characterId: 15, organizationId: 4, role: 'Captain', isCurrent: true },
        { characterId: 16, organizationId: 5, role: 'Captain', isCurrent: true },
        { characterId: 21, organizationId: 6, role: 'Captain', isCurrent: true },
        { characterId: 22, organizationId: 12, role: 'Captain', isCurrent: true }
      ]
    });
    console.log('✓ Created character organization relationships');

    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log('========================================');
    console.log('Summary:');
    console.log('  - Races: 12');
    console.log('  - Character Types: 21');
    console.log('  - Fruit Types: 3');
    console.log('  - Organization Types: 8');
    console.log('  - Haki Types: 3');
    console.log('  - Ships: 10');
    console.log('  - Characters: 22');
    console.log('  - Devil Fruits: 16');
    console.log('  - Organizations: 12');
    console.log('========================================');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

await main();
