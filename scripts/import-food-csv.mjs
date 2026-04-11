import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const inputArg = process.argv[2] || 'EDA - Tunisian Food Database - Products.csv';
const outputArg = process.argv[3] || path.join('scripts', '010_import_food_dataset.sql');
const bundlePath = path.resolve(cwd, path.join('scripts', '011_food_dataset_bundle.sql'));

const inputPath = path.resolve(cwd, inputArg);
const outputPath = path.resolve(cwd, outputArg);

function parseCsv(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }

      row.push(current);
      current = '';

      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeText(value) {
  let normalized = value.replace(/\u00A0/g, ' ').trim();

  for (let i = 0; i < 2; i += 1) {
    if (!/Ã.|Â.|â./.test(normalized)) break;
    normalized = Buffer.from(normalized, 'latin1').toString('utf8');
  }

  return normalized.trim();
}

function parseNumeric(value) {
  if (!value) return null;

  const normalized = normalizeText(value)
    .replace(/\t/g, '')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/kcal/i, '')
    .replace(/cal/i, '')
    .replace(/g$/i, '')
    .replace(/mg$/i, '')
    .replace(/ml$/i, '');

  if (!normalized || normalized === '-') return null;

  const numeric = Number.parseFloat(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function parsePortion(value) {
  const normalized = normalizeText(value).toLowerCase();

  if (!normalized || normalized === '-') {
    return { size: 100, unit: 'g' };
  }

  const compact = normalized.replace(/\s+/g, '');
  const match = compact.match(/^(\d+(?:[.,]\d+)?)(kg|g|mg|ml|l|piece|pieces|unit|units)$/i);

  if (!match) {
    return { size: 100, unit: 'g' };
  }

  let size = Number.parseFloat(match[1].replace(',', '.'));
  let unit = match[2].toLowerCase();

  if (unit === 'kg') {
    size *= 1000;
    unit = 'g';
  } else if (unit === 'mg') {
    size /= 1000;
    unit = 'g';
  } else if (unit === 'l') {
    size *= 1000;
    unit = 'ml';
  } else if (unit === 'pieces') {
    unit = 'piece';
  } else if (unit === 'units') {
    unit = 'unit';
  }

  return {
    size: Number.isFinite(size) && size > 0 ? size : 100,
    unit: unit || 'g',
  };
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value, fallback = 'null') {
  return value == null || !Number.isFinite(value) ? fallback : String(value);
}

if (!fs.existsSync(inputPath)) {
  console.error(`Input CSV not found: ${inputPath}`);
  process.exit(1);
}

const rawBuffer = fs.readFileSync(inputPath);
const utf8Text = rawBuffer.toString('utf8');
const rawText = /Ã.|Â.|â./.test(utf8Text) ? rawBuffer.toString('latin1') : utf8Text;
const rows = parseCsv(rawText);

if (rows.length < 2) {
  console.error('CSV appears empty or malformed.');
  process.exit(1);
}

const [, ...dataRows] = rows;

const foods = dataRows
  .map((columns) => {
    const producer = normalizeText(columns[0] || '');
    const category = normalizeText(columns[1] || '');
    const product = normalizeText(columns[2] || '');
    const calories = parseNumeric(columns[3]);
    const fat = parseNumeric(columns[4]);
    const carbs = parseNumeric(columns[6]);
    const protein = parseNumeric(columns[8]);
    const portion = parsePortion(columns[10] || '');

    if (!product || calories == null) {
      return null;
    }

    return {
      name: producer ? `${producer} ${product}` : product,
      calories,
      protein,
      carbs,
      fat,
      serving_size: portion.size,
      serving_unit: portion.unit,
      category: category || 'Packaged Food',
    };
  })
  .filter(Boolean);

const uniqueFoods = [];
const seen = new Set();

for (const food of foods) {
  const key = `${food.name.toLowerCase()}|${food.category.toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  uniqueFoods.push(food);
}

const valuesSql = uniqueFoods
  .map(
    (food) =>
      `  (${[
        sqlString(food.name),
        sqlNumber(food.calories, '0'),
        sqlNumber(food.protein),
        sqlNumber(food.carbs),
        sqlNumber(food.fat),
        sqlNumber(food.serving_size, '100'),
        sqlString(food.serving_unit),
        sqlString(food.category),
      ].join(', ')})`,
  )
  .join(',\n');

const sql = `-- Generated from ${path.basename(inputPath)}
-- Source rows parsed: ${dataRows.length}
-- Foods emitted: ${uniqueFoods.length}
-- Run after scripts/005_create_foods.sql

INSERT INTO public.foods (name, calories, protein, carbs, fat, serving_size, serving_unit, category)
VALUES
${valuesSql}
ON CONFLICT DO NOTHING;
`;

fs.writeFileSync(outputPath, sql, 'utf8');

const createFoodsPath = path.resolve(cwd, path.join('scripts', '005_create_foods.sql'));
const insertPolicyPath = path.resolve(cwd, path.join('scripts', '009_add_foods_insert_policy.sql'));

const bundleParts = [];

if (fs.existsSync(createFoodsPath)) {
  bundleParts.push(fs.readFileSync(createFoodsPath, 'utf8').trim());
}

if (fs.existsSync(insertPolicyPath)) {
  bundleParts.push(fs.readFileSync(insertPolicyPath, 'utf8').trim());
}

bundleParts.push(sql.trim());

fs.writeFileSync(bundlePath, `${bundleParts.join('\n\n')}\n`, 'utf8');

console.log(
  `Generated ${path.relative(cwd, outputPath)} and ${path.relative(cwd, bundlePath)} with ${uniqueFoods.length} foods.`,
);
