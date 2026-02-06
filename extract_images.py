import urllib.request
import re

url = "https://dimemtl.com/collections/shop-all"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
    # Search for common Shopify image patterns
    matches = re.findall(r'//[^"\'\s]*cdn/shop/files/[^"?\] \']+', content)
    # Also search for relative ones
    matches += re.findall(r'\"/cdn/shop/files/[^"?\] \']+', content)
    
    unique_matches = []
    for m in matches:
        # Clean up
        cleaned = m.strip('"')
        if cleaned.startswith('//'):
            cleaned = 'https:' + cleaned
        elif cleaned.startswith('/'):
            cleaned = 'https://dimemtl.com' + cleaned
            
        if cleaned not in unique_matches:
            unique_matches.append(cleaned)
    
    for m in unique_matches[:50]:
        print(m)
except Exception as e:
    print(f"Error: {e}")
