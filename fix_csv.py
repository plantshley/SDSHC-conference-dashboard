#!/usr/bin/env python3
"""Fix CSV data quality issues"""

import csv

# Read the CSV and fix line break issues
with open('soil_health_survey_enhanced.csv', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the specific line break issues
# Issue 1: Grace Pacheco row (lines 137-138)
content = content.replace(
    '"Grace Pacheco","Student","Very Likely","\nMore about soil biology "',
    '"Grace Pacheco","Student","Very Likely","More about soil biology"'
)

# Issue 2: Jean Fagerland row (lines 308-309)
content = content.replace(
    '"Jean Fagerland","Conservation Professional","Very Likely","No till with cover crops and salinity issues\n"',
    '"Jean Fagerland","Conservation Professional","Very Likely","No till with cover crops and salinity issues"'
)

# Write the cleaned CSV
with open('soil_health_survey_enhanced_clean.csv', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("CSV cleaned and saved to: soil_health_survey_enhanced_clean.csv")
print("\nFixed issues:")
print("  - Line 137-138: Grace Pacheco - removed line break in topic field")
print("  - Line 308-309: Jean Fagerland - removed line break in topic field")
