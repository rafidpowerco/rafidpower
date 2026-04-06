import os
import win32com.client

desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
workspace_dir = r"c:\Users\Administrator\Desktop\rafid-scale-website"
agi_dir = os.path.join(workspace_dir, "AI", "AlRafidain_Universal_AGI")

def create_shortcut(target, name, start_in=None):
    shell = win32com.client.Dispatch("WScript.Shell")
    shortcut = shell.CreateShortCut(os.path.join(desktop_path, name + ".lnk"))
    shortcut.Targetpath = target
    if start_in:
        shortcut.WorkingDirectory = start_in
    shortcut.WindowStyle = 1
    shortcut.save()
    print(f"[OK] Created: {name}")

# 1. Master Launch
create_shortcut(
    target=os.path.join(workspace_dir, "AL_RAFIDAIN_MASTER_START.bat"),
    name="[1] RAFID - MASTER LAUNCH",
    start_in=workspace_dir
)

# 2. Build Commercial Product
create_shortcut(
    target=os.path.join(agi_dir, "CREATE_PRODUCTION_RELEASE.bat"),
    name="[2] RAFID - BUILD PRODUCT",
    start_in=agi_dir
)

# 3. Deploy to Internet
create_shortcut(
    target=os.path.join(workspace_dir, "DEPLOY_TO_INTERNET.bat"),
    name="[3] RAFID - DEPLOY INTERNET",
    start_in=workspace_dir
)

# 4. Copy Logo helper
create_shortcut(
    target=os.path.join(workspace_dir, "AI", "copy_logo.py"),
    name="[4] RAFID - COPY LOGO",
    start_in=workspace_dir
)

print("\n[DONE] 4 shortcuts created on Desktop.")
print("Look for [1], [2], [3], [4] RAFID shortcuts on your Desktop!")
