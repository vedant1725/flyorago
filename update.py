import os
import glob
import re

replacements = {
    "'Pending'": "'REQUEST_SENT'",
    "'Accepted'": "'ACCEPTED'",
    "'Rejected'": "'REJECTED'",
    "'Cancelled'": "'CANCELLED'",
    "'Booking Requested'": "'REQUEST_SENT'",
    "'Payment Completed'": "'PAID'",
    "'Paid'": "'PAID'",
    "'Ready For Transit'": "'PARCEL_VERIFIED'",
    "'Parcel Verification'": "'PARCEL_VERIFIED'",
    "'In Transit'": "'IN_TRANSIT'",
    "'Flight Landed'": "'ARRIVED'",
    "'Out For Delivery'": "'OUT_FOR_DELIVERY'",
    "'Delivered'": "'DELIVERED'",
    "'Completed'": "'PAYMENT_RELEASED'",
    "'Released'": "'PAYMENT_RELEASED'"
}

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        # Match only full word quotes to prevent overriding already updated ones if script is run twice
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('flyora-frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            update_file(os.path.join(root, file))

print("Done.")
