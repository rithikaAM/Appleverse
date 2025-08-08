import os
import re
import pandas as pd
from pymongo import MongoClient

# ─────────────────────────────────────────────────────────────────────────
# 1. REGEX PATTERN FOR MAL CODE
#    Captures MAL followed by 4 or 5 digits (e.g. MAL0100, MAL12345)
# ─────────────────────────────────────────────────────────────────────────
pattern = re.compile(r"(MAL\d{4,5})", re.IGNORECASE)

# ─────────────────────────────────────────────────────────────────────────
# 2. FILE PATHS
# ─────────────────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))

# Adjust these paths as needed:
EXCEL_FILE = os.path.join(script_dir, "../data/apple_details.xlsx")  # The Excel file
IMAGE_FOLDER = os.path.join(script_dir, "../images")                 # The images folder

# ─────────────────────────────────────────────────────────────────────────
# 3. CONNECT TO MONGODB
# ─────────────────────────────────────────────────────────────────────────
client = MongoClient("mongodb://localhost:27017/")
db = client["appleverse"]
collection = db["apples"]

# Clear existing data
collection.delete_many({})
print("✅ Cleared existing data in 'apples' collection")

# ─────────────────────────────────────────────────────────────────────────
# 4. LOAD EXCEL & RENAME COLUMNS
# ─────────────────────────────────────────────────────────────────────────
df = pd.read_excel(EXCEL_FILE)
df.columns = df.columns.str.strip().str.lower()

# Rename "cultivar name" → "cultivar_name" if it exists
if "cultivar name" in df.columns:
    df.rename(columns={"cultivar name": "cultivar_name"}, inplace=True)

# Ensure "accession" column
if "accession" not in df.columns:
    raise ValueError("❌ 'accession' column not found in Excel!")

# Normalize "accession"
df["accession"] = df["accession"].astype(str).str.strip()

# ─────────────────────────────────────────────────────────────────────────
# 5. READ IMAGE FILENAMES & MATCH
# ─────────────────────────────────────────────────────────────────────────
image_files = os.listdir(IMAGE_FOLDER)
apple_data = []

for _, row in df.iterrows():
    accession = str(row["accession"]).strip().lower()
    if not accession or accession == "nan":
        continue

    # Convert row to a dict
    row_dict = {}
    for col in df.columns:
        cell_val = row[col]
        if pd.isna(cell_val):
            cell_val = None
        else:
            cell_val = str(cell_val).strip()
        row_dict[col] = cell_val

    # Find matching images by MAL code
    matched_images = []
    for img in image_files:
        base, ext = os.path.splitext(img)
        base_lower = base.lower()
        match = pattern.search(base_lower)
        if match:
            found_code = match.group(1).lower()  # e.g. "mal0101"
            if found_code == accession:
                matched_images.append(img)

    # Overwrite special fields
    row_dict["_id"] = accession
    row_dict["accession"] = accession
    row_dict["images"] = matched_images if matched_images else None

    apple_data.append(row_dict)

# ─────────────────────────────────────────────────────────────────────────
# 6. INSERT INTO MONGODB
# ─────────────────────────────────────────────────────────────────────────
if apple_data:
    collection.insert_many(apple_data)
    print(f"✅ Inserted {len(apple_data)} apple records into MongoDB!")
else:
    print("⚠️ No valid apple data found. Nothing inserted.")
