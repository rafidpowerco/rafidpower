import shutil, os

src = r"C:\Users\Administrator\.gemini\antigravity\brain\9238aa30-7058-4cc7-8700-92f123d6a163\rafid_power_logo_1775448910204.png"
dst = r"c:\Users\Administrator\Desktop\rafid-scale-website\client\public\logo.png"

if os.path.exists(src):
    shutil.copy2(src, dst)
    print(f"[OK] Logo copied successfully to: {dst}")
else:
    print(f"[ERR] Source not found: {src}")
