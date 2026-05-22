import os

def get_dir_size(path):
    total = 0
    for root, dirs, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            total += os.path.getsize(fp)
    return total

files = ["index.html", "index.js", "styles.css", "visualizer.js", "cushion_data.js"]
dirs = ["images", "Cushion Gallery"]

print("=== Project Size Breakdown ===")
total_project_size = 0

for file in files:
    if os.path.exists(file):
        size = os.path.getsize(file)
        print(f"File: {file:<18} - {size / 1024:.2f} KB ({size} bytes)")
        total_project_size += size

for directory in dirs:
    if os.path.exists(directory):
        size = get_dir_size(directory)
        print(f"Dir:  {directory:<18} - {size / 1024 / 1024:.2f} MB ({size / 1024:.2f} KB)")
        total_project_size += size

print("---------------------------------")
print(f"Total Web App Size: {total_project_size / 1024 / 1024:.2f} MB ({total_project_size / 1024:.2f} KB)")
