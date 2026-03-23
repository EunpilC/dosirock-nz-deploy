import { drizzle } from "drizzle-orm/mysql2";
import { menuCategories, menuItems, orderStatus, locations } from "../drizzle/schema";

async function main() {
  const connectionString = "mysql://root@localhost:3306/dosirock_nz";
  const db = drizzle(connectionString);

  console.log("Seeding data...");

  // 1. Order Status
  await db.insert(orderStatus).values([
    { statusName: "pending", displayName: "Pending" },
    { statusName: "paid", displayName: "Paid" },
    { statusName: "preparing", displayName: "Preparing" },
    { statusName: "ready", displayName: "Ready for Pickup" },
    { statusName: "delivered", displayName: "Delivered" },
    { statusName: "cancelled", displayName: "Cancelled" },
  ]).onDuplicateKeyUpdate({ set: { displayName: "Pending" } });

  // 2. Locations
  await db.insert(locations).values([
    {
      name: "Auckland City",
      address: "39 Chancery Street, Auckland CBD, Auckland 1010, NZ",
      phone: "09-123-4567",
      email: "city@dosirock.co.nz",
      city: "Auckland",
      openingHours: JSON.stringify({
        mon_fri: "11:00 - 20:00",
        sat: "11:00 - 19:00",
        sun: "Closed"
      }),
      displayOrder: 1
    },
    {
      name: "Northwest",
      address: "1-7 Fred Taylor Dr, Westgate, Auckland 0814, NZ",
      phone: "09-876-5432",
      email: "northwest@dosirock.co.nz",
      city: "Auckland",
      openingHours: JSON.stringify({
        mon_sun: "11:00 - 21:00"
      }),
      displayOrder: 2
    },
    {
      name: "Christchurch",
      address: "123 Riccarton Rd, Riccarton, Christchurch 8041, NZ",
      phone: "03-123-4567",
      email: "chch@dosirock.co.nz",
      city: "Christchurch",
      openingHours: JSON.stringify({
        mon_sun: "11:00 - 20:00"
      }),
      displayOrder: 3
    }
  ]);

  // 3. Menu Categories
  const [mainCat] = await db.insert(menuCategories).values({
    name: "MAIN",
    description: "Main dishes",
    displayOrder: 1
  });
  const mainId = (mainCat as any).insertId;

  const [sideCat] = await db.insert(menuCategories).values({
    name: "SIDE",
    description: "Side dishes",
    displayOrder: 2
  });
  const sideId = (sideCat as any).insertId;

  const [drinkCat] = await db.insert(menuCategories).values({
    name: "DRINK",
    description: "Drinks",
    displayOrder: 3
  });
  const drinkId = (drinkCat as any).insertId;

  // 4. Menu Items
  await db.insert(menuItems).values([
    {
      categoryId: mainId,
      name: "Bibimbap Box",
      description: "Mixed rice with vegetables and meat",
      price: "14.99",
      imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
      displayOrder: 1
    },
    {
      categoryId: mainId,
      name: "Bulgogi Box",
      description: "Marinated beef with rice and sides",
      price: "15.99",
      imageUrl: "https://images.unsplash.com/photo-1632148764264-58569888989a?w=800&q=80",
      displayOrder: 2
    },
    {
      categoryId: mainId,
      name: "Kimchi Chicken",
      description: "Spicy chicken with kimchi and rice",
      price: "13.99",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80",
      displayOrder: 3
    }
  ]);

  console.log("Seeding completed!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
