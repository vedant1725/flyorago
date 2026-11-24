import urllib.request
import os
import subprocess
import sys

apk_url = 'https://expo.dev/artifacts/eas/hlzGiQgs8b_q1ZLMcwOk22rN2vgeLGhSGsrbJOjwPP4.apk'
apk_path = r'D:\Temp\flyorago-latest-v4.apk'

print('Downloading APK from:', apk_url, flush=True)
urllib.request.urlretrieve(apk_url, apk_path)
size_mb = round(os.path.getsize(apk_path) / (1024 * 1024), 2)
print(f'Downloaded! File size: {size_mb} MB', flush=True)

app_id = '1:127367897020:android:4501a250ad992bbf0b95b9'
print('Uploading to Firebase App Distribution for app ID:', app_id, flush=True)

cmd = [
    'firebase',
    'appdistribution:distribute',
    apk_path,
    '--app',
    app_id,
    '--release-notes',
    'Latest build connected to live backend https://api.flyorago.me with advanced watercolor timeline, responsive home and wallet UI, fixed headers',
    '--groups',
    'flyorago-team',
    '--project',
    'flyorago'
]

res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print('STDOUT:\n', res.stdout, flush=True)
if res.stderr:
    print('STDERR:\n', res.stderr, flush=True)
if res.returncode == 0:
    print('SUCCESS: Uploaded to Firebase App Distribution!', flush=True)
else:
    print('FAILED with code:', res.returncode, flush=True)
    sys.exit(res.returncode)
