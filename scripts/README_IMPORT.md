Food dataset import

Generate SQL from the Tunisian food CSV:

`node scripts/import-food-csv.mjs "EDA - Tunisian Food Database - Products.csv"`

This writes:

- `scripts/010_import_food_dataset.sql` for the raw dataset insert
- `scripts/011_food_dataset_bundle.sql` as a one-shot SQL bundle for Supabase SQL Editor

Notes:
- Rows without a product name or calorie value are skipped.
- Missing portion sizes default to `100 g`.
- Product names are stored as `Producer + Product` to reduce collisions.

Recommended load path:

1. Run `npm.cmd run import:foods`
2. Open `scripts/011_food_dataset_bundle.sql`
3. Paste it into Supabase SQL Editor and run it once
