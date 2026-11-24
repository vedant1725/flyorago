import subprocess
import time
import json
import urllib.request
import os
import sys

print('Watching build 5bfc0a2f-44e8-47d5-b744-ca96c90e3fe7 until finish...')
apk_url = None
for i in range(50):
    res = subprocess.run('eas.cmd build:view 5bfc0a2f-44e8-47d5-b744-ca96c90e3fe7 --json', shell=True, cwd=r'c:\Users\Akash\OneDrive\Documents\flyorago\flyora-mobile', capture_output=True, text=True)
    try:
        data = json.loads(res.stdout)
        status = data.get('status')
        print(f'Attempt {i+1}: {status}', flush=True)
        if status in ['FINISHED', 'finished']:
            apk_url = data.get('artifacts', {}).get('applicationArchiveUrl') or data.get('applicationArchiveUrl')
            break
        elif status in ['ERRORED', 'errored', 'CANCELED', 'canceled']:
            print('Build ended with status:', status, flush=True)
            break
    except Exception as e:
        print('Error:', e, flush=True)
    time.sleep(15)

if apk_url:
    print('APK URL FOUND:', apk_url, flush=True)
    apk_path = r'D:\Temp\flyorago-latest-v4.apk'
    print('Downloading APK to', apk_path, flush=True)
    urllib.request.urlretrieve(apk_url, apk_path)
    print('Downloaded! File size (bytes):', os.path.getsize(apk_path), flush=True)
    
    # Upload to Firebase App Distribution
    app_id = '1:127367897020:android:4501a250ad992bbf0b95b9'
    print(f'Uploading to Firebase App Distribution for app {app_id}...', flush=True)
    cmd = f'firebase appdistribution:distribute "{apk_path}" --app "{app_id}" --release-notes "Latest build connected to live backend https://api.flyorago.me with advanced watercolor timeline, responsive home and wallet UI, fixed headers" --groups "flyorago-team" --project flyorago'
    upload_res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print('Firebase Upload Output:\n', upload_res.stdout, flush=True)
    if upload_res.stderr:
        print('Firebase Upload Error:\n', upload_res.stderr, flush=True)
else:
    print('Build is still in progress or no APK URL yet.', flush=True)
