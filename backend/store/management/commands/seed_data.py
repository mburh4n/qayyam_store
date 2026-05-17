from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from store.models import Category, Product

User = get_user_model()

CATEGORIES = [
    {"name": "Rings",     "slug": "rings",     "description": "Timeless gold and gemstone rings"},
    {"name": "Earrings",  "slug": "earrings",  "description": "Elegant earrings for every occasion"},
    {"name": "Bracelets", "slug": "bracelets", "description": "Handcrafted bracelets in fine gold"},
    {"name": "Necklaces", "slug": "necklaces", "description": "Statement necklaces and pendants"},
]

PRODUCTS = [
    {
        "title": "Eternal Rose Ring",
        "slug": "eternal-rose-ring",
        "description": (
            "A timeless 18K rose-gold ring adorned with a natural rose-cut diamond. "
            "Each facet captures light uniquely, symbolising eternal devotion. "
            "Handcrafted by master artisans in our Riyadh atelier."
        ),
        "price": "4850.00",
        "material": "18K Rose Gold & Diamond",
        "weight": "4.20",
        "stock": 5,
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
        "category_slug": "rings",
    },
    {
        "title": "Celestial Drop Earrings",
        "slug": "celestial-drop-earrings",
        "description": (
            "Graceful drop earrings featuring hand-selected Colombian emeralds "
            "suspended in 22K gold vermeil settings. A whisper of the cosmos worn at the ear."
        ),
        "price": "3200.00",
        "material": "22K Gold & Emerald",
        "weight": "6.50",
        "stock": 8,
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
        "category_slug": "earrings",
    },
    {
        "title": "Serpent Coil Bracelet",
        "slug": "serpent-coil-bracelet",
        "description": (
            "Inspired by ancient Egyptian motifs, this 18K gold serpent bracelet winds "
            "elegantly around the wrist. Set with black enamel eyes and pavé diamonds — "
            "a statement of timeless power."
        ),
        "price": "6750.00",
        "material": "18K Gold & Black Enamel",
        "weight": "12.80",
        "stock": 3,
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
        "category_slug": "bracelets",
    },
    {
        "title": "Constellation Pendant",
        "slug": "constellation-pendant",
        "description": (
            "A delicate pendant mapping the Orion constellation in pavé diamonds on an "
            "18K white gold setting. Includes a 45 cm hand-braided box chain."
        ),
        "price": "2100.00",
        "material": "18K White Gold & Diamonds",
        "weight": "3.10",
        "stock": 12,
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800",
        "category_slug": "necklaces",
    },
    {
        "title": "Solstice Choker",
        "slug": "solstice-choker",
        "description": (
            "A bold geometric choker in oxidised 22K gold with a hand-hammered texture. "
            "Minimalist luxury redefined. Each piece is unique — no two are identical."
        ),
        "price": "5400.00",
        "material": "22K Oxidised Gold",
        "weight": "18.50",
        "stock": 4,
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800",
        "category_slug": "necklaces",
    },
    {
        "title": "Midnight Sapphire Solitaire",
        "slug": "midnight-sapphire-solitaire",
        "description": (
            "A Kashmir-blue sapphire of exceptional clarity — 3.2 carats — held in a "
            "six-claw 18K gold setting. GIA certified. The quintessential statement ring."
        ),
        "price": "12500.00",
        "material": "18K Gold & Kashmir Sapphire",
        "weight": "5.60",
        "stock": 2,
        "is_featured": True,
        "image_url": "https://images.unsplash.com/photo-1588444650733-d0fde834bd14?w=800",
        "category_slug": "rings",
    },
    {
        "title": "Aurora Bangle",
        "slug": "aurora-bangle",
        "description": (
            "A rigid open bangle in 18K yellow gold, its surface engraved with a "
            "flowing aurora motif. Sized to fit most wrists — a signature sculptural piece."
        ),
        "price": "3800.00",
        "material": "18K Yellow Gold",
        "weight": "22.00",
        "stock": 6,
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1573408301185-9519b5595836?w=800",
        "category_slug": "bracelets",
    },
    {
        "title": "Crescent Stud Earrings",
        "slug": "crescent-stud-earrings",
        "description": (
            "Delicate crescent-shaped studs in 14K white gold, each set with a "
            "single freshwater pearl. Understated elegance for every day."
        ),
        "price": "980.00",
        "material": "14K White Gold & Pearl",
        "weight": "2.40",
        "stock": 15,
        "is_featured": False,
        "image_url": "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800",
        "category_slug": "earrings",
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample Qayyam jewelry data and default users."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding categories…"))
        for data in CATEGORIES:
            _, created = Category.objects.get_or_create(slug=data["slug"], defaults=data)
            status = "created" if created else "exists"
            self.stdout.write(f"  {data['name']} — {status}")

        self.stdout.write(self.style.MIGRATE_HEADING("Seeding products…"))
        for data in PRODUCTS:
            cat_slug = data.pop("category_slug")
            category = Category.objects.get(slug=cat_slug)
            _, created = Product.objects.get_or_create(
                slug=data["slug"],
                defaults={**data, "category": category},
            )
            status = "created" if created else "exists"
            self.stdout.write(f"  {data['title']} — {status}")

        self.stdout.write(self.style.MIGRATE_HEADING("Creating default users…"))
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin",
                email="admin@qayyam.local",
                password="admin1234",
                role="admin",
                first_name="Qayyam",
                last_name="Admin",
            )
            self.stdout.write("  admin — created  (password: admin1234)")
        else:
            self.stdout.write("  admin — exists")

        if not User.objects.filter(username="customer").exists():
            User.objects.create_user(
                username="customer",
                email="customer@qayyam.local",
                password="cust1234",
                role="customer",
                first_name="Layla",
                last_name="Hassan",
            )
            self.stdout.write("  customer — created  (password: cust1234)")
        else:
            self.stdout.write("  customer — exists")

        self.stdout.write(self.style.SUCCESS("\n✓ Database seeded successfully."))