# BG5P Diagnostic Expert ChatGPT Pack

Recommended: upload the files in `upload_20_files/` to the custom GPT Knowledge area.

Fallback: upload the 10 files in `upload_10_files/` only if your GPT editor or account surface enforces a 10-file limit.

The 20-file build currently uses 17 files, leaving 3 spare slots for future additions.

The pack also integrates repository parts-interchange evidence without adding upload slots: `08_BG5P_Maintenance_Parts_LLM_Corpus.md` includes the consumables/interchange Markdown reports, and `09_BG5P_Parts_Diagram_Index.csv` includes the OEM master, confidence gates, and shared-engine candidate fields.

## Recommended 20-File Upload Order

1. `00_BG5P_Diagnostic_Expert_Source_Map.md`
2. `01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.pdf`
3. `02_BG5P_EJ20E_Fuel_Ignition_Electrical_Searchable.pdf`
4. `03_BG5P_EJ20E_Mechanical_Cooling_Lubrication_Searchable.pdf`
5. `04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.pdf`
6. `05_BG5P_BG_Chassis_Drivetrain_Clutch_AWD_Searchable.pdf`
7. `06_BG5P_BG_Chassis_Suspension_Brakes_Steering_HVAC_Searchable.pdf`
8. `07_BG5P_Diagnostic_Quick_Reference.md`
9. `08_BG5P_Maintenance_Parts_LLM_Corpus.md`
10. `09_BG5P_Parts_Diagram_Index.csv`
11. `10_BG5P_BG_Chassis_Body_Interior_SRS_Searchable.pdf`
12. `11_BG5P_Web_Deeplink_Sitemap.md`
13. `12_BG5P_Consumables_Wear_Interchange.md`
14. `13_BG5P_OEM_Parts_Master.csv`
15. `14_BG5P_Shared_Engine_Interchange_Candidates.csv`
16. `15_BG5P_Parts_Interchange_Research.md`
17. `16_BG5P_Common_Issues_Internet_Research.md`

## Fallback 10-File Upload Order

1. `00_BG5P_Diagnostic_Expert_Source_Map.md`
2. `01_BG5P_EJ20E_No_OBD_Diagnostics_Searchable.pdf`
3. `02_BG5P_EJ20E_Fuel_Ignition_Electrical_Searchable.pdf`
4. `03_BG5P_EJ20E_Mechanical_Cooling_Lubrication_Searchable.pdf`
5. `04_BG5P_BG_Chassis_Wiring_Electrical_Searchable.pdf`
6. `05_BG5P_BG_Chassis_Drivetrain_Clutch_AWD_Searchable.pdf`
7. `06_BG5P_BG_Chassis_Suspension_Brakes_Steering_HVAC_Searchable.pdf`
8. `07_BG5P_Diagnostic_Quick_Reference.md`
9. `08_BG5P_Maintenance_Parts_LLM_Corpus.md`
10. `09_BG5P_Parts_Diagram_Index.csv`

## Optional Extra Folder

`optional_if_20_file_limit/` keeps standalone copies of extras used to compose the 20-file build.

`optional_if_20_file_limit/11_BG5P_Web_Deeplink_Sitemap.md` is a standalone copy of the website deeplink sitemap. The same sitemap is already embedded in `00_BG5P_Diagnostic_Expert_Source_Map.md`, so do not upload both unless you intentionally want a separate searchable sitemap file.

## GPT Instructions

Paste `GPT_INSTRUCTIONS.md` into the custom GPT Instructions field. Do not upload it as Knowledge unless you intentionally want it counted as a knowledge file.
