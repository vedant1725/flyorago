import os

file_path = r'c:\Users\Akash\OneDrive\Documents\flyorago\flyora-frontend\src\pages\AdminDashboardPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"', 'className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
