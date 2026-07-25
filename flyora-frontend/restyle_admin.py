import os
import re

file_path = r'c:\Users\Akash\OneDrive\Documents\flyorago\flyora-frontend\src\pages\AdminDashboardPage.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace blue colors with flyora-teal or teal equivalents
content = content.replace('bg-blue-600', 'bg-flyora-teal')
content = content.replace('text-blue-600', 'text-flyora-teal')
content = content.replace('text-blue-700', 'text-teal-700')
content = content.replace('bg-blue-50', 'bg-teal-50')
content = content.replace('border-blue-200', 'border-teal-200')
content = content.replace('border-blue-500', 'border-flyora-teal')
content = content.replace('ring-blue-500', 'ring-flyora-teal')
content = content.replace('from-blue-600', 'from-flyora-teal')
content = content.replace('to-blue-500', 'to-teal-400')
content = content.replace('text-blue-500', 'text-flyora-teal')
content = content.replace('fill-blue-600', 'fill-flyora-teal')
content = content.replace('border-b border-blue-600', 'border-b border-flyora-teal')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Restyled successfully!")
